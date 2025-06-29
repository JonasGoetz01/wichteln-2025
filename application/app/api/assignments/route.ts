import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from '@clerk/nextjs/server';
import { getCurrentUser } from "@/lib/auth";
import { isUserAdmin, createAssignments, getParticipantAssignment, getCurrentEvent } from "@/lib/event-utils";

export async function GET(req: Request) {
  await auth.protect();
  
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const isAdmin = await isUserAdmin(user.id);
    
    if (isAdmin) {
      // For admin: return all assignments for the current active event
      const currentEvent = await getCurrentEvent();
      if (!currentEvent) {
        return NextResponse.json({ 
          assignments: [], 
          message: "No active event found" 
        });
      }

      const assignments = await db.assignment.findMany({
        where: { eventId: currentEvent.id },
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
      });

      return NextResponse.json({
        assignments,
        event: currentEvent,
        isAdmin: true,
      });
    } else {
      // For regular user: return their assignment information
      const currentEvent = await getCurrentEvent();
      if (!currentEvent) {
        return NextResponse.json({ 
          assignment: null, 
          message: "No active event found" 
        });
      }

      const participantAssignment = await getParticipantAssignment(user.id, currentEvent.id);
      
      return NextResponse.json({
        assignment: participantAssignment,
        event: currentEvent,
        isAdmin: false,
      });
    }
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
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
    const { eventId } = body;

    // If no eventId provided, use the current active event
    let targetEventId = eventId;
    if (!targetEventId) {
      const currentEvent = await getCurrentEvent();
      if (!currentEvent) {
        return NextResponse.json({ 
          error: "No active event found. Please create and activate an event first." 
        }, { status: 400 });
      }
      targetEventId = currentEvent.id;
    }

    // Verify the event exists and get participant count
    const event = await db.event.findUnique({
      where: { id: targetEventId },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.areAssignmentsCreated) {
      return NextResponse.json({ 
        error: "Assignments have already been created for this event" 
      }, { status: 400 });
    }

    if (event._count.participants < 2) {
      return NextResponse.json({ 
        error: `Need at least 2 participants to create assignments. Currently have ${event._count.participants} participants.` 
      }, { status: 400 });
    }

    // Create the assignments using the Secret Santa algorithm
    await createAssignments(targetEventId);

    // Return success with event information
    const updatedEvent = await db.event.findUnique({
      where: { id: targetEventId },
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
      message: `Successfully created ${updatedEvent?._count.assignments || 0} assignments for ${updatedEvent?._count.participants || 0} participants!`,
      event: updatedEvent,
    });
  } catch (error: any) {
    console.error('Error creating assignments:', error);
    return NextResponse.json({ 
      error: error.message || "Failed to create assignments" 
    }, { status: 500 });
  }
} 