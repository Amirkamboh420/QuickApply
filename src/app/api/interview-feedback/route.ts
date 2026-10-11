import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const applicationId = searchParams.get("applicationId");

  const where = applicationId ? { applicationId } : {};
  const feedback = await db.interviewFeedback.findMany({
    where,
    orderBy: { interviewDate: "desc" },
  });
  return NextResponse.json(feedback);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await db.interviewFeedback.create({
    data: {
      applicationId: body.applicationId,
      interviewType: body.interviewType ?? "technical",
      interviewDate: body.interviewDate ? new Date(body.interviewDate) : new Date(),
      interviewerName: body.interviewerName ?? null,
      overallRating: body.overallRating ?? 3,
      difficulty: body.difficulty ?? 3,
      wentWell: body.wentWell ?? null,
      couldImprove: body.couldImprove ?? null,
      questions: body.questions ?? null,
      learnings: body.learnings ?? null,
      nextSteps: body.nextSteps ?? null,
    },
  });
  return NextResponse.json(created);
}
