"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Target,
  Award,
  Send,
  Building2,
  Percent,
  ArrowUpRight,
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
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Analytics, STATUS_META, Status } from "@/lib/quickapply/types";

const SITE_COLORS = ["#0077B6", "#00B4D8", "#90E0EF", "#03045E", "#48cae4", "#0a8fb0", "#0096c7"];

export function AnalyticsView() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then(setData);
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

  const siteData = Object.entries(data.siteCounts).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(data.statusCounts).map(([name, value]) => ({ name, value }));

  const insights = [
    {
      label: "Total applications",
      value: data.total,
      delta: "+12 this week",
      icon: Send,
      color: "#0077B6",
      bg: "bg-ocean/10",
    },
    {
      label: "Response rate",
      value: `${data.responseRate}%`,
      delta: "above industry avg",
      icon: Percent,
      color: "#00B4D8",
      bg: "bg-sky/10",
    },
    {
      label: "Interview rate",
      value: `${data.interviewRate}%`,
      delta: `${data.statusCounts.interview ?? 0} active`,
      icon: Target,
      color: "#0f7b3f",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Offers received",
      value: data.offers,
      delta: data.offers ? "Congratulations!" : "Keep applying",
      icon: Award,
      color: "#03045E",
      bg: "bg-ink/10",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Understand your job-search funnel — from application to offer.
        </p>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="hover:shadow-ocean transition-all">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className={`h-10 w-10 rounded-xl grid place-items-center ${s.bg}`}>
                    <s.icon className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-4 text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="text-[11px] mt-1.5 text-emerald-600 font-medium">{s.delta}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Trend + funnel */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Application funnel over time</CardTitle>
            <CardDescription>Cumulative applications vs responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.statusTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="appliedG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0077B6" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#0077B6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="respondedG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00B4D8" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#00B4D8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6e9f2" vertical={false} />
                  <XAxis dataKey="index" tick={{ fontSize: 11, fill: "#5b7a8c" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#5b7a8c" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #d6e9f2", fontSize: 12 }} />
                  <Area type="monotone" dataKey="applied" stroke="#0077B6" strokeWidth={2.5} fill="url(#appliedG)" name="Applied" />
                  <Area type="monotone" dataKey="responded" stroke="#00B4D8" strokeWidth={2.5} fill="url(#respondedG)" name="Responded" />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status distribution</CardTitle>
            <CardDescription>Where applications stand</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_META[entry.name as Status]?.color ?? "#0077B6"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #d6e9f2", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1.5">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_META[s.name as Status]?.color }} />
                    {STATUS_META[s.name as Status]?.label ?? s.name}
                  </span>
                  <span className="font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sites + top companies */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Applications by site</CardTitle>
            <CardDescription>Which portals you apply through most</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={siteData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6e9f2" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#5b7a8c" }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11, fill: "#5b7a8c" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #d6e9f2", fontSize: 12 }} cursor={{ fill: "#0077B610" }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {siteData.map((_, i) => (
                      <Cell key={i} fill={SITE_COLORS[i % SITE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top companies applied to</CardTitle>
            <CardDescription>Your most-targeted employers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topCompanies.map((c, i) => {
                const max = data.topCompanies[0]?.count ?? 1;
                const pct = (c.count / max) * 100;
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-ocean/20 to-sky/20 grid place-items-center text-xs font-bold text-ocean shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {c.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{c.count} apps</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: i * 0.1, duration: 0.6 }}
                          className="h-full rounded-full bg-gradient-to-r from-ocean to-sky"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weekly application volume</CardTitle>
          <CardDescription>Last 8 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weeks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6e9f2" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5b7a8c" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5b7a8c" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #d6e9f2", fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0077B6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#0077B6", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#0077B6", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline" className="border-ocean/20 text-ocean bg-ocean/5">
              <TrendingUp className="h-3 w-3 mr-1" /> Avg {data.avgPerWeek}/week
            </Badge>
            <span className="text-xs text-muted-foreground">
              You're applying {data.avgPerWeek >= 2 ? "consistently" : "occasionally"} — keep the momentum!
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
