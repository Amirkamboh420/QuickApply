export type Status = "applied" | "interview" | "offer" | "rejected";

export interface Education {
  degree: string;
  institute: string;
  year: string;
  grade: string;
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  points: string[];
}

export interface Profile {
  id: string;
  name: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  skills: string[];
  links: Record<string, string>;
  resumeName: string | null;
  completeness: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Application {
  id: string;
  jobTitle: string;
  company: string;
  site: string;
  siteUrl: string | null;
  status: Status;
  profileId: string | null;
  referralId: string | null;
  salaryRange: string | null;
  location: string | null;
  source: string;
  notes: string | null;
  tags: string | null;
  appliedAt: string;
  followUpAt: string | null;
}

export interface CoverLetter {
  id: string;
  title: string;
  tone: string;
  content: string;
  profileId: string | null;
  createdAt: string;
}

export interface SiteTemplate {
  id: string;
  siteName: string;
  domain: string;
  logoColor: string;
  fieldMapping: string;
  supportedFeatures: string;
  status: string;
  successRate: number;
  lastVerifiedAt: string;
}

export interface Analytics {
  total: number;
  statusCounts: Record<string, number>;
  siteCounts: Record<string, number>;
  weeks: { label: string; count: number }[];
  responseRate: number;
  interviewRate: number;
  offers: number;
  avgPerWeek: number;
  statusTimeline: { index: number; applied: number; responded: number }[];
  topCompanies: { name: string; count: number }[];
}

export const STATUS_META: Record<
  Status,
  { label: string; color: string; bg: string; text: string; dot: string }
> = {
  applied: {
    label: "Applied",
    color: "#0077B6",
    bg: "bg-[#0077B6]/10",
    text: "text-[#0077B6]",
    dot: "bg-[#0077B6]",
  },
  interview: {
    label: "Interview",
    color: "#00B4D8",
    bg: "bg-[#00B4D8]/15",
    text: "text-[#0a8fb0]",
    dot: "bg-[#00B4D8]",
  },
  offer: {
    label: "Offer",
    color: "#0f7b3f",
    bg: "bg-emerald-500/15",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    color: "#9aa6b2",
    bg: "bg-slate-400/15",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
};

export function parseJSON<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== "string") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function timeAgo(dateStr: string): string {
  const d = new Date(dateStr).getTime();
  const diff = Date.now() - d;
  const day = 86400000;
  if (diff < day) return "today";
  const days = Math.floor(diff / day);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
