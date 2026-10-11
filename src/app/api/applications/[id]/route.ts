import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  // If status is changing, record it in history
  if (body.status) {
    const current = await db.application.findUnique({ where: { id } });
    if (current && current.status !== body.status) {
      await db.statusHistory.create({
        data: {
          applicationId: id,
          fromStatus: current.status,
          toStatus: body.status,
          note: body.note ?? null,
        },
      });
    }
  }

  const updated = await db.application.update({
    where: { id },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.followUpAt !== undefined ? { followUpAt: body.followUpAt ? new Date(body.followUpAt) : null } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.tags !== undefined ? { tags: body.tags } : {}),
      ...(body.referralId !== undefined ? { referralId: body.referralId || null } : {}),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.statusHistory.deleteMany({ where: { applicationId: id } });
  await db.application.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
