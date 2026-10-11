import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const jobs = await db.savedJob.findMany({ orderBy: { savedAt: "desc" } });
  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await db.savedJob.create({
    data: {
      jobTitle: body.jobTitle,
      company: body.company,
      site: body.site ?? "Manual",
      siteUrl: body.siteUrl ?? null,
      location: body.location ?? null,
      salaryRange: body.salaryRange ?? null,
      description: body.description ?? null,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(created);
}
