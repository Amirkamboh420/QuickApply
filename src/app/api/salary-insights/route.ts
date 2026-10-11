import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Parse salary strings like "PKR 350k-450k", "$80k-100k", "PKR 250000-350000"
function parseSalary(raw: string): { min: number; max: number; currency: string } | null {
  const currencyMatch = raw.match(/(PKR|\$|USD|Rs\.?)/i);
  const currency = currencyMatch ? currencyMatch[1].toUpperCase().replace("RS.", "PKR").replace("RS", "PKR") : "PKR";

  // Find all numbers (with optional k/m suffix)
  const numbers = raw.match(/(\d[\d,]*\.?\d*)\s*([km])?/gi);
  if (!numbers || numbers.length < 1) return null;

  const parsed = numbers.slice(0, 2).map((n) => {
    const clean = n.replace(/,/g, "").trim();
    const num = parseFloat(clean);
    if (/k$/i.test(clean)) return num * 1000;
    if (/m$/i.test(clean)) return num * 1000000;
    return num;
  });

  if (parsed.length === 1) return { min: parsed[0], max: parsed[0], currency };
  return { min: Math.min(...parsed), max: Math.max(...parsed), currency };
}

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function formatSalary(n: number, currency: string): string {
  const sym = currency === "PKR" ? "PKR " : currency === "USD" || currency === "$" ? "$" : "";
  if (n >= 1000000) return `${sym}${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${sym}${Math.round(n / 1000)}k`;
  return `${sym}${Math.round(n)}`;
}

export async function GET() {
  const applications = await db.application.findMany({
    where: { salaryRange: { not: null } },
  });

  const parsed = applications
    .map((a) => {
      const p = parseSalary(a.salaryRange ?? "");
      return p ? { ...a, salary: p } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  // Overall stats
  const allMins = parsed.map((p) => p.salary.min);
  const allMaxs = parsed.map((p) => p.salary.max);
  const allMids = parsed.map((p) => (p.salary.min + p.salary.max) / 2);

  const overall = {
    count: parsed.length,
    avgMin: allMins.length ? Math.round(allMins.reduce((a, b) => a + b, 0) / allMins.length) : 0,
    avgMax: allMaxs.length ? Math.round(allMaxs.reduce((a, b) => a + b, 0) / allMaxs.length) : 0,
    median: Math.round(median(allMids)),
    highest: allMaxs.length ? Math.max(...allMaxs) : 0,
    lowest: allMins.length ? Math.min(...allMins) : 0,
    currency: parsed[0]?.salary.currency ?? "PKR",
  };

  // By role (group by jobTitle, take top roles by count)
  const byRoleMap: Record<string, { mins: number[]; maxs: number[]; count: number }> = {};
  for (const p of parsed) {
    const key = p.jobTitle.toLowerCase().includes("senior") || p.jobTitle.toLowerCase().includes("lead")
      ? "Senior"
      : p.jobTitle.toLowerCase().includes("junior") || p.jobTitle.toLowerCase().includes("intern")
      ? "Junior"
      : "Mid-level";
    if (!byRoleMap[key]) byRoleMap[key] = { mins: [], maxs: [], count: 0 };
    byRoleMap[key].mins.push(p.salary.min);
    byRoleMap[key].maxs.push(p.salary.max);
    byRoleMap[key].count++;
  }
  const byRole = Object.entries(byRoleMap).map(([role, d]) => ({
    role,
    avgMin: Math.round(d.mins.reduce((a, b) => a + b, 0) / d.mins.length),
    avgMax: Math.round(d.maxs.reduce((a, b) => a + b, 0) / d.maxs.length),
    count: d.count,
  }));

  // By site
  const bySiteMap: Record<string, { mids: number[]; count: number }> = {};
  for (const p of parsed) {
    if (!bySiteMap[p.site]) bySiteMap[p.site] = { mids: [], count: 0 };
    bySiteMap[p.site].mids.push((p.salary.min + p.salary.max) / 2);
    bySiteMap[p.site].count++;
  }
  const bySite = Object.entries(bySiteMap).map(([site, d]) => ({
    site,
    avgSalary: Math.round(d.mids.reduce((a, b) => a + b, 0) / d.mids.length),
    count: d.count,
  })).sort((a, b) => b.avgSalary - a.avgSalary);

  // Distribution buckets (for histogram)
  const buckets = [
    { label: "<200k", min: 0, max: 200000, count: 0 },
    { label: "200-300k", min: 200000, max: 300000, count: 0 },
    { label: "300-400k", min: 300000, max: 400000, count: 0 },
    { label: "400-500k", min: 400000, max: 500000, count: 0 },
    { label: "500k+", min: 500000, max: Infinity, count: 0 },
  ];
  for (const p of parsed) {
    const mid = (p.salary.min + p.salary.max) / 2;
    for (const b of buckets) {
      if (mid >= b.min && mid < b.max) {
        b.count++;
        break;
      }
    }
  }

  return NextResponse.json({
    overall: {
      ...overall,
      avgMinFormatted: formatSalary(overall.avgMin, overall.currency),
      avgMaxFormatted: formatSalary(overall.avgMax, overall.currency),
      medianFormatted: formatSalary(overall.median, overall.currency),
      highestFormatted: formatSalary(overall.highest, overall.currency),
      lowestFormatted: formatSalary(overall.lowest, overall.currency),
    },
    byRole: byRole.map((r) => ({
      ...r,
      avgMinFormatted: formatSalary(r.avgMin, overall.currency),
      avgMaxFormatted: formatSalary(r.avgMax, overall.currency),
    })),
    bySite: bySite.map((s) => ({
      ...s,
      avgSalaryFormatted: formatSalary(s.avgSalary, overall.currency),
    })),
    buckets,
    currency: overall.currency,
    formatSalary: (n: number) => formatSalary(n, overall.currency),
  });
}
