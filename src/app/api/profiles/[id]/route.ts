import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await db.profile.findUnique({ where: { id } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updated = await db.profile.update({
    where: { id },
    data: {
      name: body.name,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      location: body.location,
      headline: body.headline,
      summary: body.summary,
      education: JSON.stringify(body.education ?? []),
      experience: JSON.stringify(body.experience ?? []),
      skills: JSON.stringify(body.skills ?? []),
      links: JSON.stringify(body.links ?? {}),
      resumeName: body.resumeName ?? null,
      completeness: body.completeness ?? 0,
      isDefault: body.isDefault ?? false,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.profile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
