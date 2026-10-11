import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const site = searchParams.get("site");
  const limit = Number(searchParams.get("limit") ?? 100);

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (site && site !== "all") where.site = site;

  const applications = await db.application.findMany({
    where,
    orderBy: { appliedAt: "desc" },
    take: limit,
    include: { profile: true },
  });
  return NextResponse.json(applications);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await db.application.create({
    data: {
      jobTitle: body.jobTitle,
      company: body.company,
      site: body.site,
      siteUrl: body.siteUrl ?? null,
      status: body.status ?? "applied",
      profileId: body.profileId ?? null,
      salaryRange: body.salaryRange ?? null,
      location: body.location ?? null,
      source: body.source ?? "manual",
      notes: body.notes ?? null,
      tags: body.tags ?? null,
    },
  });
  return NextResponse.json(created);
}
