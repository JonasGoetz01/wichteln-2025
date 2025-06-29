import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from '@clerk/nextjs/server';
import { getCurrentUser } from "@/lib/auth";
import { isUserAdmin } from "@/lib/event-utils";

export async function GET(req: Request) {
  await auth.protect();
  
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const participantId = searchParams.get("participantId");

    if (await isUserAdmin(user.id)) {
      // Admins can see all presents
      const presents = await db.participant.findMany({
        include: {
          user: true,
          class: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Calculate present statistics
      const totalParticipants = presents.length;
      const stats = {
        totalParticipants,
        registeredCount: presents.length,
        submittedCount: 0, // Placeholder - will be implemented with full schema
        deliveredCount: 0, // Placeholder - will be implemented with full schema
        pendingCount: totalParticipants,
      };

      return NextResponse.json({
        presents,
        stats,
        isAdmin: true,
      });
    } else {
      // Regular users can only see their own present status
      const participant = await db.participant.findUnique({
        where: { userId: user.id },
        include: {
          user: true,
          class: true,
        },
      });

      return NextResponse.json({
        participant,
        isAdmin: false,
      });
    }
  } catch (error) {
    console.error('Error fetching presents:', error);
    return NextResponse.json({ error: "Failed to fetch presents" }, { status: 500 });
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
    const { action, participantId, description } = body;

    // Only admins can mark presents as submitted/delivered
    if (!(await isUserAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, we'll simulate the present tracking
    // In the full implementation, this will update the Present model
    
    if (action === 'mark_submitted') {
      // Mark present as submitted
      return NextResponse.json({ 
        success: true, 
        message: "Present marked as submitted!" 
      });
    } else if (action === 'mark_delivered') {
      // Mark present as delivered
      return NextResponse.json({ 
        success: true, 
        message: "Present marked as delivered!" 
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating present:', error);
    return NextResponse.json({ 
      error: error.message || "Failed to update present" 
    }, { status: 500 });
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

    // Placeholder for present status update
    // Will be implemented with full Present model
    
    return NextResponse.json({ 
      success: true, 
      message: `Present status updated to ${status}!` 
    });
  } catch (error: any) {
    console.error('Error updating present status:', error);
    return NextResponse.json({ 
      error: error.message || "Failed to update present status" 
    }, { status: 500 });
  }
} 