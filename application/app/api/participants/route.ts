import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from '@clerk/nextjs/server';
import { getCurrentUser } from "@/lib/auth";
import { isUserAdmin, getCurrentEvent } from "@/lib/event-utils";

export async function GET(req: Request) {
  await auth.protect();
  
  const user = await getCurrentUser();
  if (!user || !(await isUserAdmin(user.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get current active event
    const currentEvent = await getCurrentEvent();
    if (!currentEvent) {
      return NextResponse.json({ 
        results: [], 
        total: 0,
        message: "No active event found" 
      });
    }

    // Get participants for the current event with all related data
    const participants = await db.participant.findMany({
      where: { eventId: currentEvent.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        givingAssignment: {
          include: {
            receiver: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    imageUrl: true,
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
        },
        presentGiven: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get total count for pagination
    const total = await db.participant.count({
      where: { eventId: currentEvent.id },
    });

    return NextResponse.json({
      results: participants,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      event: currentEvent,
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 });
  }
} 