import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = await db.referral.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.company !== undefined ? { company: body.company } : {}),
      ...(body.role !== undefined ? { role: body.role } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(body.linkedinUrl !== undefined ? { linkedinUrl: body.linkedinUrl } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.referral.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
