import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Returns suggested "similar jobs" a user could bulk-apply to, based on their default profile.
// In a real extension, this would scrape job boards; here we synthesize realistic suggestions
// based on the user's profile headline + existing applications.
export async function GET() {
  const defaultProfile = await db.profile.findFirst({ where: { isDefault: true } });
  if (!defaultProfile) {
    return NextResponse.json({ jobs: [], message: "No default profile found" });
  }

  const recentApps = await db.application.findMany({ orderBy: { appliedAt: "desc" }, take: 20 });
  const appliedKeys = new Set(recentApps.map((a) => `${a.jobTitle}|${a.company}`.toLowerCase()));

  // Synthesize job suggestions based on the user's headline keywords
  const headline = defaultProfile.headline.toLowerCase();
  const isSWE = headline.includes("engineer") || headline.includes("developer") || headline.includes("full-stack") || headline.includes("frontend") || headline.includes("backend");
  const isMarketing = headline.includes("marketing") || headline.includes("content") || headline.includes("growth") || headline.includes("seo");

  const baseJobs = isSWE
    ? [
        { jobTitle: "Senior Frontend Engineer", company: "Careem", site: "LinkedIn", location: "Lahore", salaryRange: "PKR 350k-450k", matchScore: 94 },
        { jobTitle: "Full-Stack Developer", company: "Foodpanda", site: "Indeed", location: "Lahore", salaryRange: "PKR 300k-380k", matchScore: 91 },
        { jobTitle: "React Engineer", company: "Bazaar", site: "Rozee.pk", location: "Karachi", salaryRange: "PKR 280k-350k", matchScore: 89 },
        { jobTitle: "Senior Software Engineer", company: "Afiniti", site: "Company Site", location: "Lahore", salaryRange: "PKR 400k-550k", matchScore: 87 },
        { jobTitle: "Frontend Lead", company: "Motiwala", site: "Mustakbil", location: "Lahore", salaryRange: "PKR 320k-400k", matchScore: 85 },
        { jobTitle: "JavaScript Developer", company: "Devsinc", site: "LinkedIn", location: "Remote", salaryRange: "PKR 250k-320k", matchScore: 83 },
        { jobTitle: "Web Developer", company: "Arbisoft", site: "Indeed", location: "Lahore", salaryRange: "PKR 260k-330k", matchScore: 80 },
        { jobTitle: "Product Engineer", company: "Bykea", site: "Bayt", location: "Karachi", salaryRange: "PKR 300k-360k", matchScore: 78 },
        // Extra jobs not in seed data
        { jobTitle: "Senior React Developer", company: "Innovista", site: "LinkedIn", location: "Islamabad", salaryRange: "PKR 380k-480k", matchScore: 92 },
        { jobTitle: "Full-Stack Engineer", company: "Katalyst", site: "Rozee.pk", location: "Lahore", salaryRange: "PKR 290k-370k", matchScore: 88 },
        { jobTitle: "Frontend Engineer", company: "Outsource Global", site: "Indeed", location: "Remote", salaryRange: "PKR 240k-310k", matchScore: 86 },
        { jobTitle: "Senior Developer", company: "NetSol", site: "Mustakbil", location: "Lahore", salaryRange: "PKR 350k-440k", matchScore: 84 },
      ]
    : isMarketing
    ? [
        { jobTitle: "Marketing Lead", company: "Dastgyr", site: "LinkedIn", location: "Lahore", salaryRange: "PKR 300k-400k", matchScore: 92 },
        { jobTitle: "Content Strategist", company: "Bazaar", site: "Rozee.pk", location: "Karachi", salaryRange: "PKR 220k-300k", matchScore: 88 },
        { jobTitle: "Growth Marketer", company: "Foodpanda", site: "Indeed", location: "Lahore", salaryRange: "PKR 280k-360k", matchScore: 85 },
        { jobTitle: "SEO Specialist", company: "Zameen.com", site: "Mustakbil", location: "Lahore", salaryRange: "PKR 200k-280k", matchScore: 82 },
      ]
    : [
        { jobTitle: "Specialist", company: "Systems Ltd", site: "LinkedIn", location: "Lahore", salaryRange: "PKR 250k-350k", matchScore: 75 },
        { jobTitle: "Analyst", company: "Afiniti", site: "Indeed", location: "Lahore", salaryRange: "PKR 280k-360k", matchScore: 72 },
      ];

  // Filter out already-applied jobs
  const jobs = baseJobs
    .filter((j) => !appliedKeys.has(`${j.jobTitle}|${j.company}`.toLowerCase()))
    .map((j, i) => ({ id: `suggested-${i}`, ...j, profileName: defaultProfile.name }));

  return NextResponse.json({ jobs, profileName: defaultProfile.name, headline: defaultProfile.headline });
}
