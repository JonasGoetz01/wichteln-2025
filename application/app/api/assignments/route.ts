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
    // Get user's participant record
    const participant = await db.participant.findUnique({
      where: { userId: user.id },
      include: {
        user: true,
        class: true,
      },
    });

    // For now, return basic assignment info
    // In future iterations, we'll add the full assignment relationship
    return NextResponse.json({
      participant,
      isAdmin: await isUserAdmin(user.id),
      message: "Assignment system will be available after event setup is complete"
    });
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
    // For now, we'll return a placeholder response
    // The actual assignment creation will be implemented once the schema is fully functional
    return NextResponse.json({ 
      success: true, 
      message: "Assignment creation will be available once the event system is fully configured" 
    });
  } catch (error: any) {
    console.error('Error creating assignments:', error);
    return NextResponse.json({ 
      error: error.message || "Failed to create assignments" 
    }, { status: 500 });
  }
} 