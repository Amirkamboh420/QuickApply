import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  // Get or create a default weekly applications goal
  let goal = await db.goal.findFirst({ where: { isActive: true } });
  if (!goal) {
    goal = await db.goal.create({
      data: { type: "weekly_applications", target: 5, period: "weekly", isActive: true },
    });
  }

  // Compute current week progress
  const now = new Date();
  const weekStart = new Date(now);
  const day = now.getDay(); // 0 = Sunday
  weekStart.setDate(now.getDate() - day);
  weekStart.setHours(0, 0, 0, 0);

  const applicationsThisWeek = await db.application.count({
    where: { appliedAt: { gte: weekStart } },
  });

  // Last 8 weeks history for the chart
  const weeks: { label: string; count: number; target: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date(weekStart);
    start.setDate(weekStart.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const count = await db.application.count({
      where: { appliedAt: { gte: start, lt: end } },
    });
    weeks.push({ label: `W${8 - i}`, count, target: goal.target });
  }

  const progress = Math.min(Math.round((applicationsThisWeek / goal.target) * 100), 100);
  const remaining = Math.max(0, goal.target - applicationsThisWeek);
  const onTrack = applicationsThisWeek >= goal.target;
  const daysLeft = 7 - Math.floor((now.getTime() - weekStart.getTime()) / 86400000);

  // Streak: count consecutive weeks (going back from this week) that met the goal
  let streak = 0;
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (i === weeks.length - 1) {
      // Current week — counts if on track
      if (applicationsThisWeek >= goal.target) streak++;
      else break;
    } else {
      if (weeks[i].count >= goal.target) streak++;
      else break;
    }
  }

  return NextResponse.json({
    goal,
    progress,
    current: applicationsThisWeek,
    target: goal.target,
    remaining,
    onTrack,
    daysLeft,
    streak,
    weeks,
    weekStart: weekStart.toISOString(),
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  let goal = await db.goal.findFirst({ where: { isActive: true } });
  if (goal) {
    goal = await db.goal.update({
      where: { id: goal.id },
      data: { target: body.target ?? goal.target },
    });
  } else {
    goal = await db.goal.create({
      data: { type: "weekly_applications", target: body.target ?? 5, period: "weekly", isActive: true },
    });
  }
  return NextResponse.json(goal);
}
