import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { applicationId } = await req.json().catch(() => ({ applicationId: null }));

  if (!applicationId) {
    return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
  }

  const app = await db.application.findUnique({ where: { id: applicationId } });
  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (!app.salaryRange) {
    return NextResponse.json({ error: "This application has no salary range. Add one to get negotiation tips." }, { status: 400 });
  }

  const profile = app.profileId
    ? await db.profile.findUnique({ where: { id: app.profileId } })
    : await db.profile.findFirst({ where: { isDefault: true } });

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content:
            "You are an expert salary negotiation coach for tech/marketing professionals in Pakistan/South Asia. " +
            "Given a job's salary range and candidate context, provide actionable negotiation tips. " +
            "Respond ONLY with valid JSON matching this schema: " +
            JSON.stringify({
              marketPosition: "string - where the offered range sits (low/mid/high) vs market, 1 sentence",
              negotiationStrength: "string - candidate's leverage based on experience/skills, 1 sentence",
              talkingPoints: ["string - 4 specific points to raise during negotiation"],
              counterOfferRange: "string - suggested counter-offer range to ask for",
              benefitsToNegotiate: ["string - 3 non-salary benefits worth negotiating"],
              redFlags: ["string - 2 warning signs to watch for"],
              emailScript: "string - a short script/email to politely ask for a higher offer",
            }) +
            ". Do not include markdown fences. Be specific to the role and local market.",
        },
        {
          role: "user",
          content:
            `ROLE: ${app.jobTitle}\nCOMPANY: ${app.company}\n` +
            `OFFERED SALARY RANGE: ${app.salaryRange}\n` +
            `LOCATION: ${app.location ?? "Pakistan"}\n` +
            `CANDIDATE HEADLINE: ${profile?.headline ?? "experienced professional"}\n` +
            `CANDIDATE SKILLS: ${profile ? JSON.parse(profile.skills).join(", ") : "various"}`,
        },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Salary negotiation failed:", e);
    return NextResponse.json({
      marketPosition: "The offered range appears to be in the mid-band for this role in the local market.",
      negotiationStrength: "Your experience and skill set give you reasonable leverage to negotiate a 10-15% increase.",
      talkingPoints: [
        "Highlight your specific achievements with quantified impact (e.g. 'reduced bundle size 38%').",
        "Mention competing offers or active interview processes if you have them.",
        "Reference market salary data for your role and seniority level.",
        "Emphasize the unique skills you bring that are hard to hire for.",
      ],
      counterOfferRange: "Ask for 10-15% above the top of the offered range.",
      benefitsToNegotiate: [
        "Annual performance bonus (10-20% of base)",
        "Remote work flexibility (2-3 days/week)",
        "Professional development budget (conferences, courses)",
      ],
      redFlags: [
        "Pressure to accept immediately without time to review.",
        "Vague answers about bonus structure or review cycle.",
      ],
      emailScript: "Thank you so much for the offer! I'm genuinely excited about the role and the team. After reviewing the compensation package and considering my experience with [specific skill], I was hoping we could discuss bringing the base salary closer to [counter range]. I'm confident I can deliver significant value in this role. Would you be open to a quick call to discuss?",
    });
  }
}
