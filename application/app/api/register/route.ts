import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from '@clerk/nextjs/server';
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  await auth.protect();
  
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { classId, interests } = body;

    // Validate that the class exists
    const classExists = await db.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return NextResponse.json({ error: "Invalid class selected" }, { status: 400 });
    }

    // Get or create active event
    let event = await db.event.findFirst({
      where: { isActive: true },
    });

    if (!event) {
      // Create a default event for testing
      event = await db.event.create({
        data: {
          name: "Wichtelaktion 2024",
          description: "Die jährliche Wichtelaktion des Burghadt Gymnasiums",
          registrationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          assignmentDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
          giftDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          deliveryDate: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000), // 65 days from now
          isActive: true,
          isRegistrationOpen: true,
          areAssignmentsCreated: false,
        },
      });
    }

    // Check if user already has a participant record
    const existingParticipant = await db.participant.findUnique({
      where: { userId: user.id },
    });

    if (existingParticipant) {
      // Update existing participant
      const updatedParticipant = await db.participant.update({
        where: { userId: user.id },
        data: {
          classId,
          eventId: event.id,
          interests: interests || null, // Store interests or null if empty
        },
        include: {
          user: true,
          class: true,
        },
      });
      return NextResponse.json({ 
        success: true, 
        data: updatedParticipant,
        message: "Registrierung erfolgreich aktualisiert!" 
      });
    } else {
      // Create new participant
      const participant = await db.participant.create({
        data: {
          userId: user.id,
          classId,
          eventId: event.id,
          interests: interests || null, // Store interests or null if empty
        },
        include: {
          user: true,
          class: true,
        },
      });
      return NextResponse.json({ 
        success: true, 
        data: participant,
        message: "Registrierung erfolgreich!" 
      });
    }
  } catch (error) {
    console.error('Error registering participant:', error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
} 