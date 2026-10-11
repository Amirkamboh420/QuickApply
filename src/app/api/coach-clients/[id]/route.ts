import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = await db.coachClient.update({
    where: { id },
    data: {
      ...(body.clientName !== undefined ? { clientName: body.clientName } : {}),
      ...(body.clientRole !== undefined ? { clientRole: body.clientRole } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.lastActivity !== undefined ? { lastActivity: body.lastActivity } : {}),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.coachClient.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
