"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Briefcase,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import type { AppSection } from "../app-shell";

interface SalaryData {
  overall: {
    count: number;
    avgMin: number;
    avgMax: number;
    median: number;
    highest: number;
    lowest: number;
    currency: string;
    avgMinFormatted: string;
    avgMaxFormatted: string;
    medianFormatted: string;
    highestFormatted: string;
    lowestFormatted: string;
  };
  byRole: Array<{ role: string; avgMin: number; avgMax: number; count: number; avgMinFormatted: string; avgMaxFormatted: string }>;
  bySite: Array<{ site: string; avgSalary: number; count: number; avgSalaryFormatted: string }>;
  buckets: Array<{ label: string; min: number; max: number; count: number }>;
  currency: string;
}

const SITE_COLORS: Record<string, string> = {
  LinkedIn: "#0A66C2",
  Indeed: "#003A9B",
  "Rozee.pk": "#E84B3C",
  Mustakbil: "#0077B6",
  Bayt: "#0a3d62",
  Glassdoor: "#0CAA41",
  "Company Site": "#00B4D8",
};

const ROLE_COLORS: Record<string, string> = {
  Senior: "#03045E",
  "Mid-level": "#0077B6",
  Junior: "#00B4D8",
};

export function SalaryView({ onNavigate }: { onNavigate: (s: AppSection) => void }) {
  const [data, setData] = useState<SalaryData | null>(null);

  useEffect(() => {
    fetch("/api/salary-insights").then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-5 h-28 bg-muted/30 animate-pulse" /></Card>
          ))}
        </div>
      </div>
    );
  }

  const { overall } = data;

  const stats = [
    { label: "Average range", value: `${overall.avgMinFormatted} – ${overall.avgMaxFormatted}`, sub: `across ${overall.count} applications`, icon: DollarSign, color: "#0077B6", bg: "bg-ocean/10" },
    { label: "Median salary", value: overall.medianFormatted, sub: "middle of all ranges", icon: TrendingUp, color: "#00B4D8", bg: "bg-sky/10" },
    { label: "Highest seen", value: overall.highestFormatted, sub: "top of any range", icon: ArrowUpRight, color: "#0f7b3f", bg: "bg-emerald-500/10" },
    { label: "Lowest seen", value: overall.lowestFormatted, sub: "bottom of any range", icon: ArrowDownRight, color: "#5b7a8c", bg: "bg-muted" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          Salary Insights
          <Badge variant="outline" className="border-ocean/20 text-ocean bg-ocean/5">
            <DollarSign className="h-3 w-3 mr-0.5" /> Beta
          </Badge>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Real salary data from your applications — see what the market actually pays.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-ocean transition-all">
              <CardContent className="pt-5">
                <div className={`h-10 w-10 rounded-xl grid place-items-center ${s.bg} mb-3`}>
                  <s.icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <div className="text-xl font-bold tracking-tight">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                <div className="text-[11px] text-muted-foreground/70 mt-1">{s.sub}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Distribution + by role */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Salary distribution</CardTitle>
            <CardDescription>How offers are spread across ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.buckets} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6e9f2" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5b7a8c" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#5b7a8c" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #d6e9f2", fontSize: 12 }}
                    cursor={{ fill: "#0077B610" }}
                    formatter={(v: number) => [`${v} application${v !== 1 ? "s" : ""}`, "Count"]}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.buckets.map((_, i) => (
                      <Cell key={i} fill={["#90E0EF", "#48cae4", "#00B4D8", "#0077B6", "#03045E"][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Salary by seniority</CardTitle>
            <CardDescription>Average ranges grouped by role level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {data.byRole.map((r, i) => {
              const maxRange = Math.max(...data.byRole.map((x) => x.avgMax));
              const widthPct = (r.avgMax / maxRange) * 100;
              return (
                <motion.div
                  key={r.role}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ROLE_COLORS[r.role] }} />
                      <span className="text-sm font-medium">{r.role}</span>
                      <span className="text-[10px] text-muted-foreground">({r.count} apps)</span>
                    </div>
                    <span className="text-sm font-semibold">{r.avgMinFormatted} – {r.avgMaxFormatted}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ delay: i * 0.08 + 0.2, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${ROLE_COLORS[r.role]}99, ${ROLE_COLORS[r.role]})` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* By site */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Average salary by portal</CardTitle>
          <CardDescription>Which sites tend to list higher-paying roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.bySite} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6e9f2" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#5b7a8c" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <YAxis type="category" dataKey="site" tick={{ fontSize: 11, fill: "#5b7a8c" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #d6e9f2", fontSize: 12 }}
                  cursor={{ fill: "#0077B610" }}
                  formatter={(v: number) => [data.bySite[0]?.avgSalaryFormatted.replace(/\d[\d.kM]*/, data.currency === "PKR" ? `PKR ${Math.round(v / 1000)}k` : `$${Math.round(v / 1000)}k`), "Avg salary"]}
                />
                <Bar dataKey="avgSalary" radius={[0, 6, 6, 0]}>
                  {data.bySite.map((s) => (
                    <Cell key={s.site} fill={SITE_COLORS[s.site] ?? "#0077B6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Insight banner */}
      <Card className="bg-gradient-to-br from-ocean/5 via-sky/5 to-transparent border-ocean/20">
        <CardContent className="py-4 flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-ocean/10 grid place-items-center shrink-0">
            <Info className="h-4.5 w-4.5 text-ocean" />
          </div>
          <div className="text-sm flex-1">
            <div className="font-medium">How we calculate these insights</div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Salary ranges are parsed from the salary field on your tracked applications.
              We extract min/max numbers, normalize currencies (PKR / USD), and group by role
              seniority and portal. The more applications you track, the more accurate these
              insights become.
            </p>
            <div className="mt-3">
              <button
                onClick={() => onNavigate("applications")}
                className="text-xs font-semibold text-ocean hover:underline flex items-center gap-1"
              >
                <Briefcase className="h-3 w-3" /> Add more applications to improve insights
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
