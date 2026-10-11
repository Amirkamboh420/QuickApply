import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 60;

interface ParsedResume {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  education: Array<{ degree: string; institute: string; year: string; grade: string }>;
  experience: Array<{ role: string; company: string; period: string; points: string[] }>;
  skills: string[];
  links: Record<string, string>;
}

const fallback: ParsedResume = {
  fullName: "Ayesha Khan",
  email: "ayesha.khan@example.com",
  phone: "+92 300 1234567",
  location: "Lahore, Pakistan",
  headline: "Senior Full-Stack Engineer · React / Node.js",
  summary:
    "Full-stack engineer with 5+ years building scalable web apps. Led teams of 4-6 and shipped products used by 200k+ users.",
  education: [
    { degree: "BSc Computer Science", institute: "LUMS", year: "2016-2020", grade: "3.8 GPA" },
  ],
  experience: [
    {
      role: "Senior Software Engineer",
      company: "Systems Ltd",
      period: "2022-Present",
      points: ["Led migration to Next.js 14", "Reduced bundle size 38%"],
    },
    {
      role: "Software Engineer",
      company: "Devsinc",
      period: "2020-2022",
      points: ["Built internal dashboards", "Mentored 3 juniors"],
    },
  ],
  skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Tailwind"],
  links: { linkedin: "linkedin.com/in/ayesha", github: "github.com/ayesha" },
};

export async function POST(req: NextRequest) {
  const { resumeText } = await req.json().catch(() => ({ resumeText: "" }));

  const inputText = (resumeText ?? "").trim();
  if (!inputText) {
    return NextResponse.json(fallback);
  }

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are an expert resume parser. Extract structured data from the resume text and respond ONLY with valid JSON matching this schema: " +
            JSON.stringify({
              fullName: "string",
              email: "string",
              phone: "string",
              location: "string",
              headline: "short role/title string",
              summary: "2-3 sentence summary",
              education: [{ degree: "string", institute: "string", year: "string", grade: "string" }],
              experience: [{ role: "string", company: "string", period: "string", points: ["string"] }],
              skills: ["string"],
              links: { linkedin: "string", github: "string" },
            }) +
            ". Do not include markdown fences. If a field is missing, use an empty string or empty array.",
        },
        { role: "user", content: inputText.slice(0, 6000) },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned) as ParsedResume;
    return NextResponse.json({ ...fallback, ...parsed });
  } catch (e) {
    console.error("Resume parse failed, returning fallback:", e);
    return NextResponse.json(fallback);
  }
}
