import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const applications = await db.application.findMany({
    orderBy: { appliedAt: "asc" },
  });

  // Build calendar events
  type Event = {
    id: string;
    date: string; // ISO date (yyyy-mm-dd)
    type: "applied" | "interview" | "followup" | "offer";
    title: string;
    company: string;
    site: string;
    applicationId: string;
  };

  const events: Event[] = [];

  for (const app of applications) {
    const appliedDate = new Date(app.appliedAt);
    // Applied event
    events.push({
      id: `applied-${app.id}`,
      date: appliedDate.toISOString().split("T")[0],
      type: "applied",
      title: `Applied: ${app.jobTitle}`,
      company: app.company,
      site: app.site,
      applicationId: app.id,
    });

    // Follow-up event (7 days after applied, or the scheduled followUpAt)
    if (app.status === "applied" || app.status === "interview") {
      const followDate = app.followUpAt
        ? new Date(app.followUpAt)
        : new Date(appliedDate.getTime() + 7 * 86400000);
      events.push({
        id: `followup-${app.id}`,
        date: followDate.toISOString().split("T")[0],
        type: "followup",
        title: `Follow up: ${app.company}`,
        company: app.company,
        site: app.site,
        applicationId: app.id,
      });
    }

    // Interview event (for interview-status applications, scheduled ~5 days from now if future)
    if (app.status === "interview") {
      const interviewDate = new Date(app.followUpAt ?? Date.now() + 3 * 86400000);
      events.push({
        id: `interview-${app.id}`,
        date: interviewDate.toISOString().split("T")[0],
        type: "interview",
        title: `Interview: ${app.jobTitle}`,
        company: app.company,
        site: app.site,
        applicationId: app.id,
      });
    }

    // Offer event
    if (app.status === "offer") {
      const offerDate = new Date(app.updatedAt);
      events.push({
        id: `offer-${app.id}`,
        date: offerDate.toISOString().split("T")[0],
        type: "offer",
        title: `Offer: ${app.jobTitle}`,
        company: app.company,
        site: app.site,
        applicationId: app.id,
      });
    }
  }

  // Group by date
  const byDate: Record<string, Event[]> = {};
  for (const e of events) {
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  }

  // Stats
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const upcoming = events.filter((e) => e.date >= todayStr).length;
  const interviews = events.filter((e) => e.type === "interview" && e.date >= todayStr).length;
  const followups = events.filter((e) => e.type === "followup" && e.date >= todayStr).length;

  return NextResponse.json({
    events,
    byDate,
    stats: { total: events.length, upcoming, interviews, followups },
  });
}
