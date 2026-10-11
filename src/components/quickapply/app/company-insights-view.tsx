"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  TrendingUp,
  Target,
  Award,
  DollarSign,
  Calendar,
  Briefcase,
  Globe2,
  ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { AppSection } from "../app-shell";

interface CompanyInsight {
  company: string;
  count: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  avgSalary: number | null;
  avgSalaryFormatted: string | null;
  sites: string[];
  firstApplied: string;
  lastApplied: string;
  statuses: Record<string, number>;
}

interface CompanyData {
  companies: CompanyInsight[];
  stats: { totalCompanies: number; totalApps: number; avgAppsPerCompany: string };
}

const STATUS_COLORS: Record<string, string> = {
  applied: "#0077B6",
  interview: "#00B4D8",
  offer: "#0f7b3f",
  rejected: "#9aa6b2",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CompanyInsightsView({ onNavigate }: { onNavigate: (s: AppSection) => void }) {
  const [data, setData] = useState<CompanyData | null>(null);

  useEffect(() => {
    fetch("/api/company-insights").then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-5 h-24 bg-muted/30 animate-pulse" /></Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Companies applied to", value: data.stats.totalCompanies, icon: Building2, color: "#0077B6", bg: "bg-ocean/10" },
    { label: "Total applications", value: data.stats.totalApps, icon: Briefcase, color: "#00B4D8", bg: "bg-sky/10" },
    { label: "Avg per company", value: data.stats.avgAppsPerCompany, icon: TrendingUp, color: "#0f7b3f", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          Company Insights
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          How you're doing with each employer — response rates, offers, and salary trends.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="pt-5">
                <div className={`h-10 w-10 rounded-xl grid place-items-center ${s.bg} mb-3`}>
                  <s.icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Company cards */}
      <div className="space-y-3">
        {data.companies.map((c, i) => {
          const responded = (c.statuses.interview ?? 0) + (c.statuses.offer ?? 0);
          return (
            <motion.div
              key={c.company}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="hover:shadow-ocean transition-all">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-ocean to-sky grid place-items-center text-white font-bold shrink-0 shadow-ocean">
                      {c.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{c.company}</h3>
                        <Badge variant="outline" className="bg-secondary/60 text-[10px]">{c.count} application{c.count > 1 ? "s" : ""}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(c.firstApplied)} – {formatDate(c.lastApplied)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Globe2 className="h-3 w-3" /> {c.sites.join(", ")}</span>
                      </div>
                    </div>
                    {c.avgSalaryFormatted && (
                      <div className="text-right shrink-0">
                        <div className="text-xs text-muted-foreground">Avg salary</div>
                        <div className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> {c.avgSalaryFormatted}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rate bars */}
                  <div className="grid grid-cols-3 gap-3">
                    <RateBar label="Response" value={c.responseRate} color="#0077B6" icon={TrendingUp} />
                    <RateBar label="Interview" value={c.interviewRate} color="#00B4D8" icon={Target} />
                    <RateBar label="Offer" value={c.offerRate} color="#0f7b3f" icon={Award} />
                  </div>

                  {/* Status breakdown */}
                  <div className="mt-4 pt-3 border-t border-border flex items-center gap-3 flex-wrap">
                    {Object.entries(c.statuses).map(([status, count]) => (
                      <div key={status} className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] ?? "#0077B6" }} />
                        <span className="text-xs text-muted-foreground capitalize">{status}</span>
                        <span className="text-xs font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {data.companies.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <div className="font-medium">No company data yet</div>
            <p className="text-sm text-muted-foreground mt-1">
              Apply to jobs to see per-company response rates and salary trends.
            </p>
            <Button className="mt-4 bg-ocean hover:bg-ocean/90" onClick={() => onNavigate("applications")}>
              View applications
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RateBar({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: typeof TrendingUp }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
          <Icon className="h-2.5 w-2.5" style={{ color }} /> {label}
        </span>
        <span className="text-xs font-semibold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
