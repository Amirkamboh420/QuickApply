import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const applications = await db.application.findMany({ orderBy: { appliedAt: "asc" } });

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  for (const a of applications) {
    statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1;
  }

  // Site breakdown
  const siteCounts: Record<string, number> = {};
  for (const a of applications) {
    siteCounts[a.site] = (siteCounts[a.site] ?? 0) + 1;
  }

  // Last 8 weeks trend
  const now = new Date();
  const weeks: { label: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(now.getDate() - (i + 1) * 7);
    const end = new Date(now);
    end.setDate(now.getDate() - i * 7);
    const count = applications.filter((a) => a.appliedAt >= start && a.appliedAt < end).length;
    weeks.push({ label: `W${8 - i}`, count });
  }

  // Response rate
  const responded = applications.filter((a) => a.status !== "applied").length;
  const responseRate = applications.length ? Math.round((responded / applications.length) * 100) : 0;

  // Interview rate
  const interviews = applications.filter((a) => a.status === "interview" || a.status === "offer").length;
  const interviewRate = applications.length ? Math.round((interviews / applications.length) * 100) : 0;

  // Offers
  const offers = applications.filter((a) => a.status === "offer").length;

  // Avg per week
  const avgPerWeek = applications.length ? Math.round((applications.length / 8) * 10) / 10 : 0;

  // Status over time (cumulative)
  const statusTimeline = applications.map((a, i) => ({
    index: i + 1,
    applied: i + 1,
    responded: applications.slice(0, i + 1).filter((x) => x.status !== "applied").length,
  }));

  // Top companies
  const companyCounts: Record<string, number> = {};
  for (const a of applications) {
    companyCounts[a.company] = (companyCounts[a.company] ?? 0) + 1;
  }
  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return NextResponse.json({
    total: applications.length,
    statusCounts,
    siteCounts,
    weeks,
    responseRate,
    interviewRate,
    offers,
    avgPerWeek,
    statusTimeline,
    topCompanies,
  });
}
