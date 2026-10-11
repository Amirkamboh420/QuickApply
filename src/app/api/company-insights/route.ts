import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseSalary(raw: string | null): { min: number; max: number } | null {
  if (!raw) return null;
  const numbers = raw.match(/(\d[\d,]*\.?\d*)\s*([km])?/gi);
  if (!numbers || numbers.length < 1) return null;
  const parsed = numbers.slice(0, 2).map((n) => {
    const clean = n.replace(/,/g, "").trim();
    const num = parseFloat(clean);
    if (/k$/i.test(clean)) return num * 1000;
    if (/m$/i.test(clean)) return num * 1000000;
    return num;
  });
  if (parsed.length === 1) return { min: parsed[0], max: parsed[0] };
  return { min: Math.min(...parsed), max: Math.max(...parsed) };
}

export async function GET() {
  const applications = await db.application.findMany({ orderBy: { appliedAt: "asc" } });

  // Group by company
  const byCompany: Record<string, {
    company: string;
    count: number;
    statuses: Record<string, number>;
    salaryMid: number[];
    sites: Set<string>;
    firstApplied: Date;
    lastApplied: Date;
  }> = {};

  for (const app of applications) {
    const key = app.company;
    if (!byCompany[key]) {
      byCompany[key] = {
        company: key,
        count: 0,
        statuses: {},
        salaryMid: [],
        sites: new Set(),
        firstApplied: app.appliedAt,
        lastApplied: app.appliedAt,
      };
    }
    byCompany[key].count++;
    byCompany[key].statuses[app.status] = (byCompany[key].statuses[app.status] ?? 0) + 1;
    byCompany[key].sites.add(app.site);
    if (app.appliedAt < byCompany[key].firstApplied) byCompany[key].firstApplied = app.appliedAt;
    if (app.appliedAt > byCompany[key].lastApplied) byCompany[key].lastApplied = app.appliedAt;
    const salary = parseSalary(app.salaryRange);
    if (salary) byCompany[key].salaryMid.push((salary.min + salary.max) / 2);
  }

  const companies = Object.values(byCompany)
    .map((c) => {
      const responded = (c.statuses.interview ?? 0) + (c.statuses.offer ?? 0);
      const responseRate = c.count ? Math.round((responded / c.count) * 100) : 0;
      const interviewRate = c.count ? Math.round(((c.statuses.interview ?? 0) + (c.statuses.offer ?? 0)) / c.count * 100) : 0;
      const offerRate = c.count ? Math.round(((c.statuses.offer ?? 0) / c.count) * 100) : 0;
      const avgSalary = c.salaryMid.length
        ? Math.round(c.salaryMid.reduce((a, b) => a + b, 0) / c.salaryMid.length)
        : null;
      return {
        company: c.company,
        count: c.count,
        responseRate,
        interviewRate,
        offerRate,
        avgSalary,
        avgSalaryFormatted: avgSalary
          ? avgSalary >= 1000 ? `PKR ${Math.round(avgSalary / 1000)}k` : `${avgSalary}`
          : null,
        sites: Array.from(c.sites),
        firstApplied: c.firstApplied,
        lastApplied: c.lastApplied,
        statuses: c.statuses,
      };
    })
    .sort((a, b) => b.count - a.count);

  // Overall stats
  const totalCompanies = companies.length;
  const totalApps = applications.length;
  const avgAppsPerCompany = totalCompanies ? (totalApps / totalCompanies).toFixed(1) : "0";

  return NextResponse.json({
    companies,
    stats: {
      totalCompanies,
      totalApps,
      avgAppsPerCompany,
    },
  });
}
