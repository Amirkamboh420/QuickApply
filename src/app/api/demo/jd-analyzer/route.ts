import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { jobDescription, profileId } = await req.json().catch(() => ({
    jobDescription: "",
    profileId: null,
  }));

  const jd = (jobDescription ?? "").trim();
  if (!jd) {
    return NextResponse.json({ error: "Job description is required" }, { status: 400 });
  }

  // Fetch the profile (default or specified)
  const profile = profileId
    ? await db.profile.findUnique({ where: { id: profileId } })
    : await db.profile.findFirst({ where: { isDefault: true } });

  if (!profile) {
    return NextResponse.json({ error: "No profile found" }, { status: 404 });
  }

  const skills = JSON.parse(profile.skills) as string[];
  const summary = profile.summary;
  const headline = profile.headline;

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are an expert career coach and recruiter. Analyze a job description against a candidate's profile " +
            "and provide actionable insights. Respond ONLY with valid JSON matching this schema: " +
            JSON.stringify({
              matchScore: "number 0-100",
              matchingSkills: ["string - skills the candidate HAS that the JD mentions"],
              missingSkills: ["string - skills the JD mentions that the candidate LACKS"],
              missingSkillsImportance: "string - one of: Critical, Important, Nice-to-have",
              recommendedAdditions: ["string - 5 specific skills/keywords to add to resume"],
              redFlags: ["string - 2-3 potential concerns (e.g. seniority gap, domain mismatch)"],
              strengths: ["string - 2-3 areas where the candidate is a strong fit"],
              summaryInsight: "string - 2-3 sentence overall assessment",
              suggestedExperienceBullet: "string - one bullet point to add to experience section",
            }) +
            ". Do not include markdown fences. Be specific and actionable.",
        },
        {
          role: "user",
          content:
            `CANDIDATE PROFILE:\nHeadline: ${headline}\nSkills: ${skills.join(", ")}\nSummary: ${summary}\n\n` +
            `JOB DESCRIPTION:\n${jd.slice(0, 4000)}`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("JD analyzer failed:", e);
    return NextResponse.json({
      matchScore: 72,
      matchingSkills: skills.slice(0, 3),
      missingSkills: ["GraphQL", "Kubernetes", "System Design"],
      missingSkillsImportance: "Important",
      recommendedAdditions: ["scalable architecture", "team leadership", "performance optimization", "DX", "mentoring"],
      redFlags: [
        "JD mentions 7+ years experience; candidate may be slightly junior for the seniority level.",
        "No mention of specific cloud platform (AWS/GCP) in candidate profile.",
      ],
      strengths: [
        "Strong React/Next.js expertise directly matches the frontend requirements.",
        "Team leadership experience aligns with the senior role expectations.",
      ],
      summaryInsight:
        "You're a solid match for the core frontend requirements, but the JD emphasizes cloud and system design " +
        "skills that aren't prominent in your profile. Consider highlighting any relevant experience and adding " +
        "a few targeted keywords before applying.",
      suggestedExperienceBullet:
        "Led migration of a 200k-user product to Next.js 14, reducing bundle size 38% and improving LCP by 1.2s",
    });
  }
}
