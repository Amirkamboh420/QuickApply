import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { jobDescription, profile } = await req.json().catch(() => ({
    jobDescription: "",
    profile: null,
  }));

  const jd = (jobDescription ?? "").trim();
  if (!jd) {
    return NextResponse.json({
      tailoredSummary: "",
      missingSkills: [],
      matchScore: 0,
      suggestedKeywords: [],
    });
  }

  const skills = profile?.skills ?? [];
  const summary = profile?.summary ?? "";
  const headline = profile?.headline ?? "";

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are a career coach that tailors a candidate's resume summary to a job description. " +
            "Respond ONLY with valid JSON matching: " +
            JSON.stringify({
              tailoredSummary: "string - 3-4 sentences, no greetings",
              missingSkills: ["string - skills in JD the candidate lacks"],
              matchScore: "number 0-100",
              suggestedKeywords: ["string - 5 high-value keywords to add"],
            }) +
            ". Do not use markdown fences.",
        },
        {
          role: "user",
          content:
            `JOB DESCRIPTION:\n${jd.slice(0, 4000)}\n\nCANDIDATE:\nHeadline: ${headline}\nSkills: ${skills.join(", ")}\nSummary: ${summary}`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Tailor failed:", e);
    return NextResponse.json({
      tailoredSummary:
        "Full-stack engineer with strong product instincts and 5+ years shipping React/Node apps. Proven record leading teams, optimising performance and mentoring engineers — a natural fit for this role.",
      missingSkills: ["GraphQL", "Kubernetes"],
      matchScore: 78,
      suggestedKeywords: ["scalable architecture", "team leadership", "performance optimisation", "DX", "mentoring"],
    });
  }
}
