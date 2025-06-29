import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  await auth.protect();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  const [classes, total] = await Promise.all([
    db.class.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    }),
    db.class.count(),
  ]);

  return NextResponse.json({
    results: classes,
    total,
  });
}

export async function POST(req: Request) {
  await auth.protect();

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // For now, we'll allow any authenticated user to create classes
  // In a full implementation, this would be restricted to admins
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Class name is required" },
        { status: 400 },
      );
    }

    // Check if class already exists
    const existingClass = await db.class.findUnique({
      where: { name: name.trim() },
    });

    if (existingClass) {
      return NextResponse.json(
        { error: "Class already exists" },
        { status: 400 },
      );
    }

    // Create new class
    const newClass = await db.class.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      data: newClass,
      message: "Class created successfully!",
    });
  } catch (error) {
    console.error("Error creating class:", error);

    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 },
    );
  }
}
