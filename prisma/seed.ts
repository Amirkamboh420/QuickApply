import { db } from "../src/lib/db";

const seedProfiles = [
  {
    name: "Software Engineer Profile",
    fullName: "Ayesha Khan",
    email: "ayesha.khan@example.com",
    phone: "+92 300 1234567",
    location: "Lahore, Pakistan",
    headline: "Senior Full-Stack Engineer · React / Node.js",
    summary:
      "Full-stack engineer with 5+ years building scalable web apps. Led teams of 4-6, shipped products used by 200k+ users. Passionate about DX, performance & accessibility.",
    education: JSON.stringify([
      { degree: "BSc Computer Science", institute: "LUMS", year: "2016-2020", grade: "3.8 GPA" },
    ]),
    experience: JSON.stringify([
      { role: "Senior Software Engineer", company: "Systems Ltd", period: "2022-Present", points: ["Led migration to Next.js 14", "Reduced bundle size 38%"] },
      { role: "Software Engineer", company: "Devsinc", period: "2020-2022", points: ["Built internal dashboards", "Mentored 3 juniors"] },
    ]),
    skills: JSON.stringify(["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Tailwind"]),
    links: JSON.stringify({ linkedin: "linkedin.com/in/ayesha", github: "github.com/ayesha", portfolio: "ayesha.dev" }),
    resumeName: "Ayesha_Khan_SWE.pdf",
    completeness: 96,
    isDefault: true,
  },
  {
    name: "Marketing Profile",
    fullName: "Ayesha Khan",
    email: "ayesha.khan@example.com",
    phone: "+92 300 1234567",
    location: "Lahore, Pakistan",
    headline: "Digital Marketing Specialist · Content & Growth",
    summary:
      "Growth-focused marketer blending content strategy with data. Managed 6-figure ad budgets and grew organic traffic 3x for SaaS clients.",
    education: JSON.stringify([
      { degree: "BSc Computer Science", institute: "LUMS", year: "2016-2020", grade: "3.8 GPA" },
    ]),
    experience: JSON.stringify([
      { role: "Marketing Lead", company: "Dastgyr", period: "2021-Present", points: ["Owned content calendar", "Grew LinkedIn following 5x"] },
    ]),
    skills: JSON.stringify(["SEO", "Content Strategy", "Google Ads", "Analytics", "Figma", "Copywriting"]),
    links: JSON.stringify({ linkedin: "linkedin.com/in/ayesha" }),
    resumeName: "Ayesha_Marketing.pdf",
    completeness: 82,
    isDefault: false,
  },
];

const seedApplications = [
  { jobTitle: "Senior Frontend Engineer", company: "Careem", site: "LinkedIn", status: "interview", salaryRange: "PKR 350k-450k", location: "Lahore", appliedAt: new Date(Date.now() - 2 * 86400000) },
  { jobTitle: "Full-Stack Developer", company: "Foodpanda", site: "Indeed", status: "applied", salaryRange: "PKR 280k-350k", location: "Lahore", appliedAt: new Date(Date.now() - 5 * 86400000) },
  { jobTitle: "React Engineer", company: "Bazaar", site: "Rozee.pk", status: "rejected", salaryRange: "PKR 250k-320k", location: "Karachi", appliedAt: new Date(Date.now() - 9 * 86400000) },
  { jobTitle: "Senior Software Engineer", company: "Afiniti", site: "Company Site", status: "applied", salaryRange: "PKR 400k-550k", location: "Lahore", appliedAt: new Date(Date.now() - 12 * 86400000) },
  { jobTitle: "Frontend Lead", company: "Motiwala", site: "Mustakbil", status: "interview", salaryRange: "PKR 320k-400k", location: "Lahore", appliedAt: new Date(Date.now() - 14 * 86400000) },
  { jobTitle: "Web Developer", company: "Arbisoft", site: "LinkedIn", status: "offer", salaryRange: "PKR 300k-380k", location: "Lahore", appliedAt: new Date(Date.now() - 18 * 86400000) },
  { jobTitle: "JavaScript Developer", company: "Devsinc", site: "Indeed", status: "applied", salaryRange: "PKR 220k-280k", location: "Remote", appliedAt: new Date(Date.now() - 21 * 86400000) },
  { jobTitle: "Senior React Developer", company: "CureMD", site: "Rozee.pk", status: "rejected", salaryRange: "PKR 260k-330k", location: "Lahore", appliedAt: new Date(Date.now() - 25 * 86400000) },
  { jobTitle: "Product Engineer", company: "Bykea", site: "Bayt", status: "applied", salaryRange: "PKR 300k-360k", location: "Karachi", appliedAt: new Date(Date.now() - 28 * 86400000) },
  { jobTitle: "Full-Stack Engineer", company: "Zameen.com", site: "Glassdoor", status: "interview", salaryRange: "PKR 280k-340k", location: "Lahore", appliedAt: new Date(Date.now() - 32 * 86400000) },
  { jobTitle: "Lead Frontend Engineer", company: "SadaPay", site: "LinkedIn", status: "applied", salaryRange: "PKR 350k-420k", location: "Lahore", appliedAt: new Date(Date.now() - 35 * 86400000) },
  { jobTitle: "Senior Developer", company: "Tintash", site: "Indeed", status: "rejected", salaryRange: "PKR 320k-390k", location: "Lahore", appliedAt: new Date(Date.now() - 40 * 86400000) },
  { jobTitle: "UI Engineer", company: "PakWheels", site: "Rozee.pk", status: "applied", salaryRange: "PKR 240k-300k", location: "Lahore", appliedAt: new Date(Date.now() - 45 * 86400000) },
  { jobTitle: "Software Engineer II", company: "Motus", site: "Company Site", status: "interview", salaryRange: "PKR 300k-360k", location: "Lahore", appliedAt: new Date(Date.now() - 50 * 86400000) },
  { jobTitle: "Frontend Engineer", company: "Oladoc", site: "Mustakbil", status: "applied", salaryRange: "PKR 200k-260k", location: "Lahore", appliedAt: new Date(Date.now() - 55 * 86400000) },
];

const seedSites = [
  { siteName: "LinkedIn", domain: "linkedin.com", logoColor: "#0A66C2", fieldMapping: JSON.stringify({ name: "input[name='name']", email: "input[type='email']", phone: "input[type='tel']" }), supportedFeatures: "name,email,phone,resume,experience", status: "active", successRate: 98 },
  { siteName: "Indeed", domain: "indeed.com", logoColor: "#003A9B", fieldMapping: JSON.stringify({ name: "#applicantName", email: "#applicantEmail" }), supportedFeatures: "name,email,phone,address,resume", status: "active", successRate: 96 },
  { siteName: "Rozee.pk", domain: "rozee.pk", logoColor: "#E84B3C", fieldMapping: JSON.stringify({ name: "#fullName", email: "#email" }), supportedFeatures: "name,email,phone,education,experience,resume", status: "active", successRate: 94 },
  { siteName: "Mustakbil", domain: "mustakbil.com", logoColor: "#0077B6", fieldMapping: JSON.stringify({ name: "#name", email: "#email" }), supportedFeatures: "name,email,phone,resume", status: "active", successRate: 91 },
  { siteName: "Bayt", domain: "bayt.com", logoColor: "#0077B6", fieldMapping: JSON.stringify({}), supportedFeatures: "name,email,phone,resume", status: "active", successRate: 89 },
  { siteName: "Glassdoor", domain: "glassdoor.com", logoColor: "#0CAA41", fieldMapping: JSON.stringify({}), supportedFeatures: "name,email,phone,resume", status: "active", successRate: 87 },
  { siteName: "Greenhouse", domain: "greenhouse.io", logoColor: "#0077B6", fieldMapping: JSON.stringify({}), supportedFeatures: "name,email,phone,address,resume,cover-letter", status: "active", successRate: 93 },
  { siteName: "Lever", domain: "lever.co", logoColor: "#0077B6", fieldMapping: JSON.stringify({}), supportedFeatures: "name,email,phone,resume", status: "active", successRate: 92 },
];

const seedCoverLetters = [
  { title: "Senior Frontend Template", tone: "professional", content: "Dear Hiring Manager,\n\nI am excited to apply for the {{role}} position at {{company}}. With 5+ years building production React applications, I bring deep expertise in performance, accessibility and team leadership...\n\nBest regards,\nAyesha Khan" },
  { title: "Startup Application", tone: "energetic", content: "Hi {{company}} team!\n\nYour mission around {{focus}} genuinely excites me. At Systems Ltd I shipped similar work — migrating a 200k-user product to Next.js 14...\n\nWarmly,\nAyesha" },
  { title: "Career Switch Cover Letter", tone: "thoughtful", content: "Dear {{company}},\n\nAfter five impactful years in software engineering, I am now seeking a role that lets me blend engineering rigor with {{domain}}...\n\nSincerely,\nAyesha Khan" },
];

async function main() {
  console.log("Seeding QuickApply database...");

  // Clean
  await db.coverLetter.deleteMany();
  await db.application.deleteMany();
  await db.profile.deleteMany();
  await db.siteTemplate.deleteMany();
  await db.setting.deleteMany();
  await db.fieldMapping.deleteMany();
  await db.savedJob.deleteMany();
  await db.statusHistory.deleteMany();
  await db.user.deleteMany();
  await db.supportTicket.deleteMany();
  await db.coachClient.deleteMany();
  await db.interviewFeedback.deleteMany();
  await db.referral.deleteMany();
  await db.goal.deleteMany();

  // Profiles
  const profiles = [];
  for (const p of seedProfiles) {
    const created = await db.profile.create({ data: p });
    profiles.push(created);
  }

  // Applications
  for (let i = 0; i < seedApplications.length; i++) {
    const a = seedApplications[i];
    await db.application.create({
      data: { ...a, profileId: profiles[0].id, source: "QuickApply Extension" },
    });
  }

  // Sites
  for (const s of seedSites) {
    await db.siteTemplate.create({ data: s });
  }

  // Cover letters
  for (const c of seedCoverLetters) {
    await db.coverLetter.create({ data: { ...c, profileId: profiles[0].id } });
  }

  // Field mappings (per-site field selectors for auto-fill)
  const fieldMappings = [
    { siteName: "LinkedIn", fieldName: "Full name", selector: "input[name='name']", fieldType: "text", profileField: "fullName", isCustom: false },
    { siteName: "LinkedIn", fieldName: "Email", selector: "input[type='email']", fieldType: "email", profileField: "email", isCustom: false },
    { siteName: "LinkedIn", fieldName: "Phone", selector: "input[type='tel']", fieldType: "tel", profileField: "phone", isCustom: false },
    { siteName: "LinkedIn", fieldName: "Resume upload", selector: "input[type='file']", fieldType: "file", profileField: "resumeName", isCustom: false },
    { siteName: "Indeed", fieldName: "Full name", selector: "#applicantName", fieldType: "text", profileField: "fullName", isCustom: false },
    { siteName: "Indeed", fieldName: "Email", selector: "#applicantEmail", fieldType: "email", profileField: "email", isCustom: false },
    { siteName: "Indeed", fieldName: "Phone", selector: "#applicantPhone", fieldType: "tel", profileField: "phone", isCustom: false },
    { siteName: "Rozee.pk", fieldName: "Full name", selector: "#fullName", fieldType: "text", profileField: "fullName", isCustom: false },
    { siteName: "Rozee.pk", fieldName: "Email", selector: "#email", fieldType: "email", profileField: "email", isCustom: false },
    { siteName: "Rozee.pk", fieldName: "Phone", selector: "#cellNumber", fieldType: "tel", profileField: "phone", isCustom: false },
    { siteName: "Rozee.pk", fieldName: "City", selector: "#city", fieldType: "select", profileField: "location", isCustom: false },
    { siteName: "Mustakbil", fieldName: "Full name", selector: "#name", fieldType: "text", profileField: "fullName", isCustom: false },
    { siteName: "Mustakbil", fieldName: "Email", selector: "#email", fieldType: "email", profileField: "email", isCustom: false },
    { siteName: "Greenhouse", fieldName: "Full name", selector: "input[name='candidate_name']", fieldType: "text", profileField: "fullName", isCustom: false },
    { siteName: "Greenhouse", fieldName: "Email", selector: "input[name='candidate_email']", fieldType: "email", profileField: "email", isCustom: false },
    { siteName: "Greenhouse", fieldName: "Phone", selector: "input[name='candidate_phone']", fieldType: "tel", profileField: "phone", isCustom: false },
    { siteName: "Greenhouse", fieldName: "Resume", selector: "input[type='file'][name='resume']", fieldType: "file", profileField: "resumeName", isCustom: false },
  ];
  for (const fm of fieldMappings) {
    await db.fieldMapping.create({ data: fm });
  }

  // Saved jobs (bookmarked, not yet applied)
  const savedJobs = [
    { jobTitle: "Staff Engineer", company: "Google", site: "LinkedIn", location: "Remote", salaryRange: "$120k-160k", description: "Lead technical direction for a core product area." },
    { jobTitle: "Principal Developer", company: "Microsoft", site: "LinkedIn", location: "Dubai", salaryRange: "PKR 600k-800k", description: "Drive architecture across multiple teams." },
    { jobTitle: "Senior Frontend Engineer", company: "Vercel", site: "Company Site", location: "Remote", salaryRange: "$90k-130k", description: "Build the future of Next.js developer experience." },
    { jobTitle: "Engineering Manager", company: "Stripe", site: "Indeed", location: "Remote", salaryRange: "$140k-180k", description: "Lead a team building payment infrastructure." },
  ];
  for (const j of savedJobs) {
    await db.savedJob.create({ data: j });
  }

  // Settings
  await db.setting.create({ data: { key: "plan", value: "pro" } });
  await db.setting.create({ data: { key: "autoFillHighlight", value: "true" } });
  await db.setting.create({ data: { key: "duplicateWarning", value: "true" } });
  await db.setting.create({ data: { key: "syncEnabled", value: "true" } });
  await db.setting.create({ data: { key: "shortcut", value: "Ctrl+Shift+F" } });
  await db.setting.create({ data: { key: "language", value: "en" } });

  // Users (3 roles: job_seeker, coach, admin)
  const users = [
    { email: "ayesha.khan@example.com", name: "Ayesha Khan", role: "job_seeker", plan: "pro", avatarColor: "#0077B6" },
    { email: "sana.tariq@example.com", name: "Sana Tariq", role: "coach", plan: "career_coach", avatarColor: "#00B4D8" },
    { email: "admin@quickapply.com", name: "Admin User", role: "admin", plan: "admin", avatarColor: "#03045E" },
    { email: "hamza.sheikh@example.com", name: "Hamza Sheikh", role: "job_seeker", plan: "free", avatarColor: "#90E0EF" },
    { email: "bilal.ahmed@example.com", name: "Bilal Ahmed", role: "job_seeker", plan: "pro", avatarColor: "#48cae4" },
    { email: "fatima.noor@example.com", name: "Fatima Noor", role: "job_seeker", plan: "free", avatarColor: "#0096c7" },
    { email: "usman.raza@example.com", name: "Usman Raza", role: "job_seeker", plan: "pro", avatarColor: "#023e8a" },
    { email: "iqra.baloch@example.com", name: "Iqra Baloch", role: "coach", plan: "career_coach", avatarColor: "#00B4D8" },
  ];
  const createdUsers = [];
  for (const u of users) {
    createdUsers.push(await db.user.create({ data: u }));
  }

  // Support tickets
  const tickets = [
    { userId: createdUsers[3].id, userEmail: "hamza.sheikh@example.com", subject: "Auto-fill not working on Rozee.pk", category: "bug", message: "The extension fills most fields but skips the phone number field on Rozee.pk job applications.", status: "open", priority: "high" },
    { userId: createdUsers[4].id, userEmail: "bilal.ahmed@example.com", subject: "How do I add multiple profiles?", category: "how_to", message: "I want to maintain separate profiles for frontend and backend roles. Is this possible?", status: "resolved", priority: "normal", reply: "Yes! Go to Profiles → New profile. You can create unlimited profiles on the Pro plan." },
    { userId: createdUsers[5].id, userEmail: "fatima.noor@example.com", subject: "Upgrade to Pro plan", category: "billing", message: "I want to upgrade from Free to Pro. What payment methods are available in Pakistan?", status: "open", priority: "normal" },
    { userId: createdUsers[6].id, userEmail: "usman.raza@example.com", subject: "AI resume parser missed my education", category: "bug", message: "The parser captured my experience but didn't detect my education section.", status: "in_progress", priority: "normal" },
    { userEmail: "guest@example.com", subject: "Feature request: Firefox support", category: "feature", message: "Would love to see QuickApply on Firefox as well!", status: "open", priority: "low" },
  ];
  for (const t of tickets) {
    await db.supportTicket.create({ data: t });
  }

  // Coach clients (for Sana Tariq - the coach)
  const coach = createdUsers.find((u) => u.role === "coach")!;
  const coachClients = [
    { coachId: coach.id, clientEmail: "ali.raza@example.com", clientName: "Ali Raza", clientRole: "Backend Developer", notes: "Strong in Node.js, needs help with system design prep.", status: "active", lastActivity: "2 days ago" },
    { coachId: coach.id, clientEmail: "zainab.hussain@example.com", clientName: "Zainab Hussain", clientRole: "UX Designer", notes: "Portfolio review done. Applying to mid-level roles.", status: "active", lastActivity: "5 days ago" },
    { coachId: coach.id, clientEmail: "omer.farooq@example.com", clientName: "Omer Farooq", clientRole: "Data Analyst", notes: "Needs SQL practice. Targeting fintech companies.", status: "active", lastActivity: "1 week ago" },
    { coachId: coach.id, clientEmail: "maria.khalid@example.com", clientName: "Maria Khalid", clientRole: "Product Manager", notes: "Interview prep in progress. 3 interviews lined up.", status: "active", lastActivity: "yesterday" },
    { coachId: coach.id, clientEmail: "hassan.ali@example.com", clientName: "Hassan Ali", clientRole: "DevOps Engineer", notes: "Switching from sysadmin to DevOps. AWS certification in progress.", status: "paused", lastActivity: "3 weeks ago" },
  ];
  for (const c of coachClients) {
    await db.coachClient.create({ data: c });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
