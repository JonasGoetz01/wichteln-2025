import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PresentStatus, ParticipantStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isUserAdmin, getCurrentEvent } from "@/lib/event-utils";

export async function GET(_req: Request) {
  await auth.protect();

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const isAdmin = await isUserAdmin(user.id);

    if (isAdmin) {
      // Admins can see all presents for the current active event
      const currentEvent = await getCurrentEvent();

      if (!currentEvent) {
        return NextResponse.json({
          presents: [],
          stats: { totalParticipants: 0, submittedCount: 0, deliveredCount: 0 },
          message: "No active event found",
        });
      }

      // Get all presents for the current event with participant and user details
      const presents = await db.present.findMany({
        where: {
          giver: {
            eventId: currentEvent.id,
          },
        },
        include: {
          giver: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              class: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          receiver: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              class: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Calculate real present statistics
      const totalParticipants = await db.participant.count({
        where: { eventId: currentEvent.id },
      });

      const submittedCount = presents.filter(
        (p) =>
          p.status === PresentStatus.SUBMITTED ||
          p.status === PresentStatus.DELIVERED,
      ).length;
      const deliveredCount = presents.filter(
        (p) => p.status === PresentStatus.DELIVERED,
      ).length;

      const stats = {
        totalParticipants,
        submittedCount,
        deliveredCount,
        pendingCount: totalParticipants - submittedCount,
      };

      return NextResponse.json({
        presents,
        stats,
        event: currentEvent,
        isAdmin: true,
      });
    } else {
      // Regular users can see their own present status
      const currentEvent = await getCurrentEvent();

      if (!currentEvent) {
        return NextResponse.json({
          present: null,
          message: "No active event found",
        });
      }

      const participant = await db.participant.findFirst({
        where: {
          userId: user.id,
          eventId: currentEvent.id,
        },
        include: {
          user: true,
          class: true,
          presentGiven: true,
          presentReceived: true,
        },
      });

      return NextResponse.json({
        participant,
        event: currentEvent,
        isAdmin: false,
      });
    }
  } catch (error) {
    console.error("Error fetching presents:", error);

    return NextResponse.json(
      { error: "Failed to fetch presents" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  await auth.protect();

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, participantId, presentId, description } = body;

    // Only admins can mark presents as submitted/delivered
    if (!(await isUserAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let present;
    let updatedParticipant;

    if (action === "mark_submitted") {
      // Find the present by giver participant ID
      present = await db.present.findFirst({
        where: { giverId: participantId },
        include: {
          giver: {
            include: { user: true },
          },
        },
      });

      if (!present) {
        return NextResponse.json(
          { error: "Present not found" },
          { status: 404 },
        );
      }

      // Update present status and timestamp
      await db.present.update({
        where: { id: present.id },
        data: {
          status: PresentStatus.SUBMITTED,
          submittedAt: new Date(),
          description: description || null,
        },
      });

      // Update participant status
      updatedParticipant = await db.participant.update({
        where: { id: participantId },
        data: { status: ParticipantStatus.GIFT_SUBMITTED },
      });

      return NextResponse.json({
        success: true,
        message: `Present from ${present.giver.user.firstName} marked as submitted!`,
        present,
        participant: updatedParticipant,
      });
    } else if (action === "mark_delivered") {
      // Find the present by giver participant ID
      present = await db.present.findFirst({
        where: { giverId: participantId },
        include: {
          giver: {
            include: { user: true },
          },
          receiver: {
            include: { user: true },
          },
        },
      });

      if (!present) {
        return NextResponse.json(
          { error: "Present not found" },
          { status: 404 },
        );
      }

      if (present.status !== PresentStatus.SUBMITTED) {
        return NextResponse.json(
          {
            error:
              "Present must be submitted before it can be marked as delivered",
          },
          { status: 400 },
        );
      }

      // Update present status and timestamp
      await db.present.update({
        where: { id: present.id },
        data: {
          status: PresentStatus.DELIVERED,
          deliveredAt: new Date(),
        },
      });

      // Update receiver participant status
      updatedParticipant = await db.participant.update({
        where: { id: present.receiverId },
        data: { status: ParticipantStatus.GIFT_DELIVERED },
      });

      return NextResponse.json({
        success: true,
        message: `Present delivered to ${present.receiver.user.firstName}!`,
        present,
        participant: updatedParticipant,
      });
    } else if (action === "update_description") {
      // Update present description
      if (!presentId) {
        return NextResponse.json(
          { error: "Present ID required" },
          { status: 400 },
        );
      }

      present = await db.present.update({
        where: { id: presentId },
        data: { description: description || null },
        include: {
          giver: {
            include: { user: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Present description updated!",
        present,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating present:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to update present",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  await auth.protect();

  const user = await getCurrentUser();

  if (!user || !(await isUserAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { presentId, status, description } = body;

    if (!presentId) {
      return NextResponse.json(
        { error: "Present ID required" },
        { status: 400 },
      );
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;

      if (status === PresentStatus.SUBMITTED) {
        updateData.submittedAt = new Date();
      } else if (status === PresentStatus.DELIVERED) {
        updateData.deliveredAt = new Date();
      }
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    const present = await db.present.update({
      where: { id: presentId },
      data: updateData,
      include: {
        giver: {
          include: { user: true },
        },
        receiver: {
          include: { user: true },
        },
      },
    });

    // Update participant statuses based on present status
    if (status === PresentStatus.SUBMITTED) {
      await db.participant.update({
        where: { id: present.giverId },
        data: { status: ParticipantStatus.GIFT_SUBMITTED },
      });
    } else if (status === PresentStatus.DELIVERED) {
      await db.participant.update({
        where: { id: present.receiverId },
        data: { status: ParticipantStatus.GIFT_DELIVERED },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Present status updated to ${status}!`,
      present,
    });
  } catch (error: any) {
    console.error("Error updating present status:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to update present status",
      },
      { status: 500 },
    );
  }
}
