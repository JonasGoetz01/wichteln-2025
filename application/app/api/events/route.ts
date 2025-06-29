import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from '@clerk/nextjs/server';
import { getCurrentUser } from "@/lib/auth";
import { isUserAdmin } from "@/lib/event-utils";

export async function GET() {
  await auth.protect();
  
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get current active event for all users
  const currentEvent = await db.event.findFirst({
    where: { isActive: true },
    include: {
      participants: {
        include: {
          user: true,
          class: true,
        },
      },
    },
  });

  // If user is admin, also return event statistics
  if (await isUserAdmin(user.id)) {
    return NextResponse.json({
      currentEvent,
      isAdmin: true,
    });
  }

  return NextResponse.json({
    currentEvent,
    isAdmin: false,
  });
}

export async function POST(req: Request) {
  await auth.protect();
  
  const user = await getCurrentUser();
  if (!user || !(await isUserAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, registrationDeadline, assignmentDate, giftDeadline, deliveryDate } = body;

    // Deactivate any existing active events
    await db.event.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Create new event
    const event = await db.event.create({
      data: {
        name,
        description,
        registrationDeadline: new Date(registrationDeadline),
        assignmentDate: new Date(assignmentDate),
        giftDeadline: new Date(giftDeadline),
        deliveryDate: new Date(deliveryDate),
        isActive: true,
        isRegistrationOpen: true,
        areAssignmentsCreated: false,
      },
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
} 