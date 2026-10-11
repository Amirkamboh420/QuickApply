import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { jobDescription, role } = await req.json().catch(() => ({
    jobDescription: "",
    role: "",
  }));

  const jd = (jobDescription ?? "").trim();
  if (!jd) {
    return NextResponse.json({
      behavioral: [],
      technical: [],
      company: [],
      tips: [],
    });
  }

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are an expert interview coach. Given a job description, produce realistic interview " +
            "questions and preparation tips. Respond ONLY with valid JSON matching this schema: " +
            JSON.stringify({
              behavioral: ["string - 4 behavioral questions (STAR format)"],
              technical: ["string - 4 technical/role-specific questions"],
              company: ["string - 2 questions to ask the interviewer about the company/role"],
              tips: ["string - 3 concise prep tips, max 12 words each"],
            }) +
            ". Do not include markdown fences. Keep questions specific to the role and level.",
        },
        {
          role: "user",
          content: `ROLE: ${role || "the role described below"}\n\nJOB DESCRIPTION:\n${jd.slice(0, 4000)}`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Interview prep failed:", e);
    return NextResponse.json({
      behavioral: [
        "Tell me about a time you led a project with tight deadlines.",
        "Describe a conflict with a teammate and how you resolved it.",
        "Share an example of a feature you shipped that didn't go as planned.",
        "Walk me through a decision you made with incomplete information.",
      ],
      technical: [
        "How would you architect a form auto-fill extension that works across 20+ sites?",
        "Explain how you'd handle form-field detection when a site changes its DOM.",
        "What's your approach to encrypting sensitive user data on-device?",
        "How do you balance feature velocity with code quality on a small team?",
      ],
      company: [
        "What does success look like for this role in the first 90 days?",
        "How does the team measure the impact of this position?",
      ],
      tips: [
        "Use the STAR method for behavioral answers.",
        "Quantify your impact with numbers.",
        "Prepare 2 questions for the interviewer.",
      ],
    });
  }
}
