import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { applicationId, tone } = await req.json().catch(() => ({
    applicationId: null,
    tone: "professional",
  }));

  if (!applicationId) {
    return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
  }

  const app = await db.application.findUnique({ where: { id: applicationId } });
  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  // Get the default profile for the candidate's name
  const profile = app.profileId
    ? await db.profile.findUnique({ where: { id: app.profileId } })
    : await db.profile.findFirst({ where: { isDefault: true } });

  const candidateName = profile?.fullName ?? "the applicant";
  const candidateEmail = profile?.email ?? "";
  const daysSinceApply = Math.floor(
    (Date.now() - new Date(app.appliedAt).getTime()) / 86400000,
  );

  const toneGuide: Record<string, string> = {
    professional: "polite, professional, concise — no fluff",
    friendly: "warm, conversational, but still professional",
    eager: "enthusiastic and shows genuine excitement about the role",
    concise: "very short, 2-3 sentences max, gets straight to the point",
  };

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are an expert at writing follow-up emails for job applicants. " +
            "Write a follow-up email that is " + (toneGuide[tone] ?? toneGuide.professional) + ". " +
            "Respond ONLY with valid JSON matching this schema: " +
            JSON.stringify({
              subject: "string - email subject line, no 'Re:' prefix",
              body: "string - full email body with greeting, 2-3 paragraphs, and sign-off. Use \\n for line breaks. Sign with the candidate's name.",
            }) +
            ". Do not include markdown fences. Make it specific to the role and company.",
        },
        {
          role: "user",
          content:
            `CANDIDATE: ${candidateName} (email: ${candidateEmail})\n` +
            `ROLE: ${app.jobTitle}\nCOMPANY: ${app.company}\n` +
            `APPLIED: ${daysSinceApply} days ago via ${app.site}\n` +
            `CURRENT STATUS: ${app.status}\n` +
            (app.location ? `LOCATION: ${app.location}\n` : "") +
            (profile?.headline ? `CANDIDATE HEADLINE: ${profile.headline}\n` : ""),
        },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Follow-up email generation failed:", e);
    return NextResponse.json({
      subject: `Following up on my ${app.jobTitle} application at ${app.company}`,
      body: `Dear Hiring Manager,\n\nI hope this email finds you well. I'm writing to follow up on my application for the ${app.jobTitle} position at ${app.company}, which I submitted ${daysSinceApply} days ago.\n\nI remain very interested in this opportunity and would welcome the chance to discuss how my experience could contribute to your team. I'm happy to provide any additional information you may need.\n\nThank you for your time and consideration.\n\nBest regards,\n${candidateName}`,
    });
  }
}
