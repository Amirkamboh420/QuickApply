import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const applications = await db.application.findMany({
    orderBy: { appliedAt: "asc" },
  });

  const now = Date.now();
  const day = 86400000;

  const reminders = applications
    .map((a) => {
      const appliedAt = new Date(a.appliedAt).getTime();
      const daysSince = Math.floor((now - appliedAt) / day);
      // Suggest follow-up 7 days after applying if no response yet
      const dueDay = a.followUpAt
        ? Math.floor((new Date(a.followUpAt).getTime() - now) / day)
        : 7 - daysSince;
      return {
        ...a,
        daysSince,
        dueInDays: dueDay,
        urgency: getUrgency(dueDay, a.status),
        suggestedFollowUp: !a.followUpAt,
      };
    })
    .filter((a) => a.status === "applied" || a.status === "interview")
    .sort((a, b) => a.dueInDays - b.dueInDays);

  // Stats
  const overdue = reminders.filter((r) => r.dueInDays < 0).length;
  const dueToday = reminders.filter((r) => r.dueInDays === 0).length;
  const upcoming = reminders.filter((r) => r.dueInDays > 0 && r.dueInDays <= 3).length;

  return NextResponse.json({ reminders, stats: { total: reminders.length, overdue, dueToday, upcoming } });
}

function getUrgency(dueInDays: number, status: string): "overdue" | "today" | "soon" | "later" {
  if (dueInDays < 0) return "overdue";
  if (dueInDays === 0) return "today";
  if (dueInDays <= 3) return "soon";
  return "later";
}
