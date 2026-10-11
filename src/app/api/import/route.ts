import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ImportPayload {
  type: "applications" | "profiles";
  data: Record<string, unknown>[];
  mode?: "merge" | "replace";
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ImportPayload;
  const { type, data, mode = "merge" } = body;

  if (!Array.isArray(data)) {
    return NextResponse.json({ error: "Data must be an array" }, { status: 400 });
  }

  let created = 0;
  let skipped = 0;

  if (type === "applications") {
    if (mode === "replace") {
      await db.application.deleteMany({});
    }
    for (const item of data) {
      try {
        await db.application.create({
          data: {
            jobTitle: String(item.jobTitle ?? ""),
            company: String(item.company ?? ""),
            site: String(item.site ?? "Manual"),
            siteUrl: item.siteUrl ? String(item.siteUrl) : null,
            status: String(item.status ?? "applied"),
            salaryRange: item.salaryRange ? String(item.salaryRange) : null,
            location: item.location ? String(item.location) : null,
            source: String(item.source ?? "import"),
            appliedAt: item.appliedAt ? new Date(item.appliedAt as string) : new Date(),
          },
        });
        created++;
      } catch {
        skipped++;
      }
    }
  } else if (type === "profiles") {
    if (mode === "replace") {
      await db.profile.deleteMany({});
    }
    for (const item of data) {
      try {
        await db.profile.create({
          data: {
            name: String(item.name ?? "Imported profile"),
            fullName: String(item.fullName ?? ""),
            email: String(item.email ?? ""),
            phone: String(item.phone ?? ""),
            location: String(item.location ?? ""),
            headline: String(item.headline ?? ""),
            summary: String(item.summary ?? ""),
            education: JSON.stringify(item.education ?? []),
            experience: JSON.stringify(item.experience ?? []),
            skills: JSON.stringify(item.skills ?? []),
            links: JSON.stringify(item.links ?? {}),
            resumeName: item.resumeName ? String(item.resumeName) : null,
            completeness: Number(item.completeness ?? 0),
            isDefault: Boolean(item.isDefault ?? false),
          },
        });
        created++;
      } catch {
        skipped++;
      }
    }
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  return NextResponse.json({ created, skipped, total: data.length });
}
