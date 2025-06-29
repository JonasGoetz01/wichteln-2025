import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from '@clerk/nextjs/server'

export async function GET(req: Request) {
  await auth.protect()
  
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  const [classes, total] = await Promise.all([
    db.class.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.class.count(),
  ]);

  return NextResponse.json({
    results: classes,
    total,
  });
}