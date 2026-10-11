import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") ?? 7);

  const since = new Date();
  since.setDate(since.getDate() - days);

  // Fetch recent applications
  const apps = await db.application.findMany({
    where: { appliedAt: { gte: since } },
    orderBy: { appliedAt: "desc" },
  });

  // Fetch recent status changes
  const statusChanges = await db.statusHistory.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
  });

  // Fetch recent interview feedback
  const feedback = await db.interviewFeedback.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
  });

  // Fetch all applications for context (to resolve IDs in statusChanges/feedback)
  const allApps = await db.application.findMany();
  const appMap = new Map(allApps.map((a) => [a.id, a]));

  type Activity = {
    id: string;
    type: "applied" | "status" | "interview" | "offer";
    title: string;
    description: string;
    company: string;
    timestamp: string;
    color: string;
  };

  const activities: Activity[] = [];

  for (const a of apps) {
    activities.push({
      id: `app-${a.id}`,
      type: "applied",
      title: `Applied to ${a.jobTitle}`,
      description: `via ${a.site}${a.source === "QuickApply Extension" ? " (auto-filled)" : a.source === "Bulk Apply Assistant" ? " (bulk apply)" : ""}`,
      company: a.company,
      timestamp: a.appliedAt,
      color: "#0077B6",
    });
  }

  for (const s of statusChanges) {
    const app = appMap.get(s.applicationId);
    if (!app) continue;
    const isOffer = s.toStatus === "offer";
    const isInterview = s.toStatus === "interview";
    activities.push({
      id: `status-${s.id}`,
      type: isOffer ? "offer" : isInterview ? "interview" : "status",
      title: isOffer
        ? `Offer received from ${app.company}!`
        : isInterview
        ? `Interview scheduled with ${app.company}`
        : `${app.jobTitle} marked as ${s.toStatus}`,
      description: app.jobTitle,
      company: app.company,
      timestamp: s.createdAt,
      color: isOffer ? "#0f7b3f" : isInterview ? "#00B4D8" : "#5b7a8c",
    });
  }

  for (const f of feedback) {
    const app = appMap.get(f.applicationId);
    if (!app) continue;
    activities.push({
      id: `feedback-${f.id}`,
      type: "interview",
      title: `Interview debrief added for ${app.company}`,
      description: `${f.interviewType} interview · rated ${f.overallRating}/5`,
      company: app.company,
      timestamp: f.createdAt,
      color: "#00B4D8",
    });
  }

  // Sort by timestamp desc
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Weekly stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyApps = apps.filter((a) => new Date(a.appliedAt) >= weekAgo).length;
  const weeklyInterviews = statusChanges.filter((s) => s.toStatus === "interview" && new Date(s.createdAt) >= weekAgo).length;
  const weeklyOffers = statusChanges.filter((s) => s.toStatus === "offer" && new Date(s.createdAt) >= weekAgo).length;
  const weeklyFeedback = feedback.filter((f) => new Date(f.createdAt) >= weekAgo).length;

  return NextResponse.json({
    activities,
    weeklyStats: {
      applications: weeklyApps,
      interviews: weeklyInterviews,
      offers: weeklyOffers,
      feedback: weeklyFeedback,
    },
  });
}
