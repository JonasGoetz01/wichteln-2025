import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isUserAdmin } from "@/lib/event-utils";

export async function GET() {
  await auth.protect();

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // If user is admin, return all events; otherwise return only active events
    const whereClause = (await isUserAdmin(user.id)) ? {} : { isActive: true };

    const events = await db.event.findMany({
      where: whereClause,
      include: {
        participants: {
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
        _count: {
          select: {
            participants: true,
            assignments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      events: events,
      total: events.length,
    });
  } catch (error: unknown) {
    console.error("Error fetching events:", error);

    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  await auth.protect();

  const user = await getCurrentUser();

  if (!user || !(await isUserAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      description,
      registrationDeadline,
      assignmentDate,
      giftDeadline,
      deliveryDate,
      isActive = true,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 },
      );
    }

    // If creating an active event, deactivate other active events
    if (isActive) {
      await db.event.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    // Create the new event in the database
    const event = await db.event.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        registrationDeadline: registrationDeadline
          ? new Date(registrationDeadline)
          : new Date(),
        assignmentDate: assignmentDate ? new Date(assignmentDate) : new Date(),
        giftDeadline: giftDeadline ? new Date(giftDeadline) : new Date(),
        deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(),
        isActive: Boolean(isActive),
        isRegistrationOpen: true,
        areAssignmentsCreated: false,
      },
      include: {
        _count: {
          select: {
            participants: true,
            assignments: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event created successfully!",
      event: event,
    });
  } catch (error: any) {
    console.error("Error creating event:", error);

    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
