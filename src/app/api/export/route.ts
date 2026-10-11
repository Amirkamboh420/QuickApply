import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "json";
  const type = searchParams.get("type") ?? "applications";

  if (format === "json") {
    if (type === "profiles") {
      const profiles = await db.profile.findMany({ orderBy: { createdAt: "asc" } });
      const exportable = profiles.map((p) => ({
        ...p,
        education: JSON.parse(p.education),
        experience: JSON.parse(p.experience),
        skills: JSON.parse(p.skills),
        links: JSON.parse(p.links),
      }));
      return NextResponse.json(
        { type: "profiles", exportedAt: new Date().toISOString(), count: exportable.length, data: exportable },
        {
          headers: { "Content-Disposition": `attachment; filename="quickapply-profiles-${Date.now()}.json"` },
        },
      );
    }
    // applications
    const apps = await db.application.findMany({ orderBy: { appliedAt: "desc" } });
    return NextResponse.json(
      { type: "applications", exportedAt: new Date().toISOString(), count: apps.length, data: apps },
      {
        headers: { "Content-Disposition": `attachment; filename="quickapply-applications-${Date.now()}.json"` },
      },
    );
  }

  // CSV
  if (type === "profiles") {
    const profiles = await db.profile.findMany({ orderBy: { createdAt: "asc" } });
    const rows = profiles.map((p) => ({
      name: p.name,
      fullName: p.fullName,
      email: p.email,
      phone: p.phone,
      location: p.location,
      headline: p.headline,
      summary: p.summary,
      skills: JSON.parse(p.skills).join("; "),
      resumeName: p.resumeName ?? "",
      completeness: p.completeness,
      isDefault: p.isDefault,
    }));
    const csv = toCSV(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="quickapply-profiles-${Date.now()}.csv"`,
      },
    });
  }

  // applications CSV
  const apps = await db.application.findMany({ orderBy: { appliedAt: "desc" } });
  const rows = apps.map((a) => ({
    jobTitle: a.jobTitle,
    company: a.company,
    site: a.site,
    status: a.status,
    location: a.location ?? "",
    salaryRange: a.salaryRange ?? "",
    source: a.source,
    appliedAt: new Date(a.appliedAt).toISOString().split("T")[0],
  }));
  const csv = toCSV(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="quickapply-applications-${Date.now()}.csv"`,
    },
  });
}
