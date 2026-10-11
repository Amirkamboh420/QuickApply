import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const coachId = searchParams.get("coachId");
  const where = coachId ? { coachId } : {};
  const clients = await db.coachClient.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await db.coachClient.create({
    data: {
      coachId: body.coachId,
      clientEmail: body.clientEmail,
      clientName: body.clientName,
      clientRole: body.clientRole ?? "Software Engineer",
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(created);
}
