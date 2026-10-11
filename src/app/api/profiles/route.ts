import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const profiles = await db.profile.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await db.profile.create({
    data: {
      name: body.name ?? "Untitled Profile",
      fullName: body.fullName ?? "",
      email: body.email ?? "",
      phone: body.phone ?? "",
      location: body.location ?? "",
      headline: body.headline ?? "",
      summary: body.summary ?? "",
      education: JSON.stringify(body.education ?? []),
      experience: JSON.stringify(body.experience ?? []),
      skills: JSON.stringify(body.skills ?? []),
      links: JSON.stringify(body.links ?? {}),
      resumeName: body.resumeName ?? null,
      completeness: body.completeness ?? 0,
      isDefault: body.isDefault ?? false,
    },
  });
  return NextResponse.json(created);
}
