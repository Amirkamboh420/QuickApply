import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const [users, tickets, sites, applications] = await Promise.all([
    db.user.findMany(),
    db.supportTicket.findMany(),
    db.siteTemplate.findMany(),
    db.application.findMany(),
  ]);

  const roleCounts: Record<string, number> = {};
  for (const u of users) {
    roleCounts[u.role] = (roleCounts[u.role] ?? 0) + 1;
  }

  const planCounts: Record<string, number> = {};
  for (const u of users) {
    planCounts[u.plan] = (planCounts[u.plan] ?? 0) + 1;
  }

  const ticketStatusCounts: Record<string, number> = {};
  for (const t of tickets) {
    ticketStatusCounts[t.status] = (ticketStatusCounts[t.status] ?? 0) + 1;
  }

  const siteStatusCounts: Record<string, number> = {};
  for (const s of sites) {
    siteStatusCounts[s.status] = (siteStatusCounts[s.status] ?? 0) + 1;
  }

  // Revenue estimate (Pro = $6/mo, Career Coach = $18/mo)
  const revenue = (planCounts.pro ?? 0) * 6 + (planCounts.career_coach ?? 0) * 18;

  return NextResponse.json({
    totalUsers: users.length,
    roleCounts,
    planCounts,
    revenue,
    totalTickets: tickets.length,
    openTickets: ticketStatusCounts.open ?? 0,
    ticketStatusCounts,
    totalSites: sites.length,
    activeSites: siteStatusCounts.active ?? 0,
    avgSuccessRate: sites.length ? Math.round(sites.reduce((a, s) => a + s.successRate, 0) / sites.length) : 0,
    totalApplications: applications.length,
    recentUsers: users.slice(0, 5),
  });
}
