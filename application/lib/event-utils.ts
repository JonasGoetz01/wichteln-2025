import type { EventStats } from "@/types";

import { ParticipantStatus, PresentStatus } from "@prisma/client";

import { db } from "./db";

/**
 * Get the current active event
 */
export async function getCurrentEvent() {
  return await db.event.findFirst({
    where: { isActive: true },
    include: {
      participants: {
        include: {
          user: true,
          class: true,
          givingAssignment: true,
          receivingAssignment: true,
          presentGiven: true,
          presentReceived: true,
        },
      },
      assignments: {
        include: {
          giver: {
            include: {
              user: true,
              class: true,
            },
          },
          receiver: {
            include: {
              user: true,
              class: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Check if a user is an admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  return user?.email === "jonas.goetz01@web.de";
}

/**
 * Get event statistics for admin dashboard
 */
export async function getEventStats(eventId: string): Promise<EventStats> {
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      participants: {
        include: {
          user: true,
          class: true,
          presentGiven: true,
          presentReceived: true,
        },
      },
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  const totalParticipants = event.participants.length;
  const registeredCount = event.participants.filter(
    (p) => p.status === ParticipantStatus.REGISTERED,
  ).length;
  const assignedCount = event.participants.filter(
    (p) => p.status === ParticipantStatus.ASSIGNED,
  ).length;
  const submittedPresentsCount = event.participants.filter(
    (p) => p.presentGiven?.status === PresentStatus.SUBMITTED,
  ).length;
  const deliveredPresentsCount = event.participants.filter(
    (p) => p.presentReceived?.status === PresentStatus.DELIVERED,
  ).length;

  // Group participants by class
  const participantsByClass = event.participants.reduce(
    (acc, participant) => {
      const className = participant.class?.name || "Keine Klasse";
      const existing = acc.find((item) => item.className === className);

      if (existing) {
        existing.count++;
      } else {
        acc.push({ className, count: 1 });
      }

      return acc;
    },
    [] as Array<{ className: string; count: number }>,
  );

  // Group registrations by date (last 7 days)
  const now = new Date();

  const registrationsByDate = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    const count = event.participants.filter((p) => {
      const createdDate = p.createdAt.toISOString().split("T")[0];

      return createdDate === dateStr;
    }).length;

    registrationsByDate.push({ date: dateStr, count });
  }

  return {
    totalParticipants,
    registeredCount,
    assignedCount,
    submittedPresentsCount,
    deliveredPresentsCount,
    participantsByClass,
    registrationsByDate,
  };
}

/**
 * Create assignments for all participants in an event
 * Uses a simple shuffle algorithm to ensure everyone gives and receives
 */
export async function createAssignments(eventId: string): Promise<void> {
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.areAssignmentsCreated) {
    throw new Error("Assignments already created for this event");
  }

  const participants = event.participants;

  if (participants.length < 2) {
    throw new Error("Need at least 2 participants to create assignments");
  }

  // Shuffle participants to create random assignments
  const shuffled = [...participants].sort(() => Math.random() - 0.5);

  // Create assignments in a circle (each person gives to the next)
  const assignments = shuffled.map((giver, index) => {
    const receiverIndex = (index + 1) % shuffled.length;
    const receiver = shuffled[receiverIndex];

    return {
      eventId,
      giverId: giver.id,
      receiverId: receiver.id,
    };
  });

  // Create assignments and presents in a transaction
  await db.$transaction(async (tx) => {
    // Create assignments
    for (const assignment of assignments) {
      await tx.assignment.create({
        data: assignment,
      });
    }

    // Create present records
    for (const assignment of assignments) {
      await tx.present.create({
        data: {
          giverId: assignment.giverId,
          receiverId: assignment.receiverId,
          status: PresentStatus.NOT_SUBMITTED,
        },
      });
    }

    // Update participant statuses
    await tx.participant.updateMany({
      where: { eventId },
      data: { status: ParticipantStatus.ASSIGNED },
    });

    // Mark assignments as created
    await tx.event.update({
      where: { id: eventId },
      data: { areAssignmentsCreated: true },
    });
  });
}

/**
 * Get participant's assignment information
 */
export async function getParticipantAssignment(
  userId: string,
  eventId: string,
) {
  const participant = await db.participant.findFirst({
    where: {
      userId,
      eventId,
    },
    include: {
      givingAssignment: {
        include: {
          receiver: {
            include: {
              user: true,
              class: true,
            },
          },
        },
      },
      presentGiven: true,
    },
  });

  return participant;
}

/**
 * Check if registration is still open for an event
 */
export async function isRegistrationOpen(eventId: string): Promise<boolean> {
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: {
      isRegistrationOpen: true,
      registrationDeadline: true,
    },
  });

  if (!event) return false;

  const now = new Date();

  return event.isRegistrationOpen && now < event.registrationDeadline;
}

/**
 * Register a user for an event
 */
export async function registerUserForEvent(
  userId: string,
  eventId: string,
  classId: string,
  interests: string,
): Promise<void> {
  const isOpen = await isRegistrationOpen(eventId);

  if (!isOpen) {
    throw new Error("Registration is closed for this event");
  }

  // Check if user is already registered
  const existingParticipant = await db.participant.findFirst({
    where: {
      userId,
      eventId,
    },
  });

  if (existingParticipant) {
    throw new Error("User is already registered for this event");
  }

  // Create participant record
  await db.participant.create({
    data: {
      userId,
      eventId,
      classId,
      interests,
      status: ParticipantStatus.REGISTERED,
    },
  });
}

/**
 * Update present status
 */
export async function updatePresentStatus(
  presentId: string,
  status: PresentStatus,
  description?: string,
): Promise<void> {
  const updateData: any = { status };

  if (status === PresentStatus.SUBMITTED) {
    updateData.submittedAt = new Date();
  } else if (status === PresentStatus.DELIVERED) {
    updateData.deliveredAt = new Date();
  }

  if (description) {
    updateData.description = description;
  }

  await db.present.update({
    where: { id: presentId },
    data: updateData,
  });

  // Update participant status based on present status
  const present = await db.present.findUnique({
    where: { id: presentId },
    select: { giverId: true, receiverId: true },
  });

  if (present && status === PresentStatus.SUBMITTED) {
    await db.participant.update({
      where: { id: present.giverId },
      data: { status: ParticipantStatus.GIFT_SUBMITTED },
    });
  } else if (present && status === PresentStatus.DELIVERED) {
    await db.participant.update({
      where: { id: present.receiverId },
      data: { status: ParticipantStatus.GIFT_DELIVERED },
    });
  }
}
