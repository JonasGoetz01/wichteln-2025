import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from '@clerk/nextjs/server';
import { getCurrentUser } from "@/lib/auth";
import { isUserAdmin } from "@/lib/event-utils";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await auth.protect();
  
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const eventId = params.id;
    
    const event = await db.event.findUnique({
      where: { id: eventId },
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
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // If user is not admin, only return active events
    if (!await isUserAdmin(user.id) && !event.isActive) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event: event });
  } catch (error: any) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await auth.protect();
  
  const user = await getCurrentUser();
  if (!user || !(await isUserAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const eventId = params.id;
    const body = await req.json();
    const { 
      name, 
      description, 
      registrationDeadline, 
      assignmentDate, 
      giftDeadline, 
      deliveryDate,
      isActive 
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Event name is required" }, { status: 400 });
    }

    // Check if event exists
    const existingEvent = await db.event.findUnique({
      where: { id: eventId },
      select: { id: true, isActive: true },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // If making this event active and it wasn't before, deactivate other events
    if (isActive && !existingEvent.isActive) {
      await db.event.updateMany({
        where: { 
          id: { not: eventId },
          isActive: true 
        },
        data: { isActive: false },
      });
    }

    // Update the event in the database
    const updatedEvent = await db.event.update({
      where: { id: eventId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
        assignmentDate: assignmentDate ? new Date(assignmentDate) : undefined,
        giftDeadline: giftDeadline ? new Date(giftDeadline) : undefined,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
        isActive: Boolean(isActive),
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
      message: "Event updated successfully!",
      event: updatedEvent 
    });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await auth.protect();
  
  const user = await getCurrentUser();
  if (!user || !(await isUserAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const eventId = params.id;
    const body = await req.json();
    
    // For partial updates, typically used for status changes
    const { isActive, areAssignmentsCreated } = body;

    // Check if event exists
    const existingEvent = await db.event.findUnique({
      where: { id: eventId },
      select: { id: true, isActive: true },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // If making this event active and it wasn't before, deactivate other events
    if (isActive !== undefined && isActive && !existingEvent.isActive) {
      await db.event.updateMany({
        where: { 
          id: { not: eventId },
          isActive: true 
        },
        data: { isActive: false },
      });
    }

    // Update only the provided fields
    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (areAssignmentsCreated !== undefined) updateData.areAssignmentsCreated = Boolean(areAssignmentsCreated);

    const patchedEvent = await db.event.update({
      where: { id: eventId },
      data: updateData,
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
      message: "Event status updated successfully!",
      event: patchedEvent 
    });
  } catch (error: any) {
    console.error('Error patching event:', error);
    return NextResponse.json({ error: "Failed to patch event" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await auth.protect();
  
  const user = await getCurrentUser();
  if (!user || !(await isUserAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const eventId = params.id;

    // Check if event exists
    const existingEvent = await db.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            participants: true,
            assignments: true,
          },
        },
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if event has participants or assignments before deletion
    if (existingEvent._count.participants > 0) {
      return NextResponse.json({ 
        error: "Cannot delete event with existing participants. Please remove all participants first." 
      }, { status: 400 });
    }

    if (existingEvent._count.assignments > 0) {
      return NextResponse.json({ 
        error: "Cannot delete event with existing assignments. Please remove all assignments first." 
      }, { status: 400 });
    }

    // Delete the event
    await db.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Event deleted successfully!" 
    });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
} 