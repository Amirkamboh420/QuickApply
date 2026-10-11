import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const letters = await db.coverLetter.findMany({ orderBy: { createdAt: "desc" }, include: { profile: true } });
  return NextResponse.json(letters);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await db.coverLetter.create({
    data: {
      title: body.title,
      tone: body.tone ?? "professional",
      content: body.content,
      profileId: body.profileId ?? null,
    },
  });
  return NextResponse.json(created);
}
