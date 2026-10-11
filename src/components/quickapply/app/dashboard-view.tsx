"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Send,
  CalendarClock,
  Target,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Briefcase,
  Building2,
  Clock,
  Zap,
  Rocket,
  Database,
  CalendarDays,
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
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Application, Analytics, timeAgo, STATUS_META, Status } from "@/lib/quickapply/types";
import type { AppSection } from "../app-shell";
import { QuickAddDialog } from "./quick-add-dialog";

const SITE_COLORS: Record<string, string> = {
  LinkedIn: "#0A66C2",
  Indeed: "#003A9B",
  "Rozee.pk": "#E84B3C",
  Mustakbil: "#0077B6",
  Bayt: "#0a3d62",
  Glassdoor: "#0CAA41",
  "Company Site": "#00B4D8",
};

export function DashboardView({ onNavigate }: { onNavigate: (s: AppSection) => void }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [reminderStats, setReminderStats] = useState<{ total: number; overdue: number; dueToday: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      fetch("/api/applications?limit=6").then((r) => r.json()),
      fetch("/api/analytics").then((r) => r.json()),
      fetch("/api/reminders").then((r) => r.json()),
    ]).then(([apps, an, rem]) => {
      setApplications(apps);
      setAnalytics(an);
      setReminderStats(rem.stats);
      setLoading(false);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = analytics
    ? [
        {
          label: "Applications sent",
          value: analytics.total,
          delta: "+12 this week",
          icon: Send,
          color: "#0077B6",
          bg: "bg-ocean/10",
        },
        {
          label: "Response rate",
          value: `${analytics.responseRate}%`,
          delta: "+4% vs last month",
          icon: TrendingUp,
          color: "#00B4D8",
          bg: "bg-sky/10",
        },
        {
          label: "Interviews",
          value: analytics.statusCounts.interview ?? 0,
          delta: `${analytics.interviewRate}% interview rate`,
          icon: Target,
          color: "#0f7b3f",
          bg: "bg-emerald-500/10",
        },
        {
          label: "Avg / week",
          value: analytics.avgPerWeek,
          delta: "On a hot streak",
          icon: CalendarClock,
          color: "#03045E",
          bg: "bg-ink/10",
        },
      ]
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Good morning, Ayesha 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            You've sent <span className="font-semibold text-ocean">{analytics?.total ?? 0} applications</span>{" "}
            and have <span className="font-semibold text-ocean">{analytics?.statusCounts.interview ?? 0} active interviews</span>.
          </p>
        </div>
        <Button className="bg-ocean hover:bg-ocean/90 shadow-ocean" onClick={() => setQuickAddOpen(true)}>
          <Zap className="mr-2 h-4 w-4" fill="white" /> Log new application
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="overflow-hidden hover:shadow-ocean transition-all">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between">
                      <div className={`h-10 w-10 rounded-xl grid place-items-center ${s.bg}`}>
                        <s.icon className="h-5 w-5" style={{ color: s.color }} />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-4 text-2xl font-bold tracking-tight">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="text-[11px] mt-1.5 text-emerald-600 font-medium">{s.delta}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* Reminders banner */}
      {reminderStats && reminderStats.overdue + reminderStats.dueToday > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/5 to-transparent cursor-pointer hover:shadow-ocean transition-all"
            onClick={() => onNavigate("reminders")}
          >
            <CardContent className="py-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/15 grid place-items-center shrink-0 relative">
                <Clock className="h-5 w-5 text-amber-600" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-white text-[9px] font-bold grid place-items-center">
                  {reminderStats.overdue + reminderStats.dueToday}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">
                  {reminderStats.overdue > 0 && `${reminderStats.overdue} follow-up${reminderStats.overdue > 1 ? "s" : ""} overdue`}
                  {reminderStats.overdue > 0 && reminderStats.dueToday > 0 && " · "}
                  {reminderStats.dueToday > 0 && `${reminderStats.dueToday} due today`}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Applications that haven't received a response — tap to review & follow up.
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-amber-600 shrink-0 hidden sm:block" />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Application volume</CardTitle>
              <CardDescription>Last 8 weeks</CardDescription>
            </div>
            <Badge variant="outline" className="border-ocean/20 text-ocean">
              <TrendingUp className="h-3 w-3 mr-1" /> Trending up
            </Badge>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              {analytics ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.weeks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="qaArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00B4D8" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#00B4D8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d6e9f2" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5b7a8c" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#5b7a8c" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #d6e9f2",
                        boxShadow: "0 10px 30px -10px rgba(0,119,182,0.3)",
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#0077B6"
                      strokeWidth={2.5}
                      fill="url(#qaArea)"
                      dot={{ r: 3, fill: "#0077B6", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#0077B6", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full grid place-items-center">
                  <Sparkles className="h-6 w-6 text-muted-foreground animate-pulse" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By status</CardTitle>
            <CardDescription>Where applications stand</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-44">
              {analytics && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(analytics.statusCounts).map(([name, value]) => ({ name, value }))}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={42}
                      outerRadius={68}
                      paddingAngle={3}
                    >
                      {Object.entries(analytics.statusCounts).map(([key]) => (
                        <Cell key={key} fill={STATUS_META[key as Status]?.color ?? "#0077B6"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #d6e9f2",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-2 space-y-1.5">
              {Object.entries(analytics?.statusCounts ?? {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_META[key as Status]?.color }} />
                    {STATUS_META[key as Status]?.label ?? key}
                  </span>
                  <span className="font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Recent applications</CardTitle>
            <CardDescription>Your latest QuickApply-powered submissions</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onNavigate("applications")}>
            View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1.5 max-h-96 overflow-y-auto scrollbar-thin">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg">
                    <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
                      <div className="h-2.5 w-1/4 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))
              : applications.map((app) => {
                  const meta = STATUS_META[app.status as Status];
                  return (
                    <div
                      key={app.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/60 transition-colors group cursor-pointer"
                    >
                      <div
                        className="h-9 w-9 rounded-lg grid place-items-center shrink-0 text-white text-xs font-bold"
                        style={{ backgroundColor: SITE_COLORS[app.site] ?? "#0077B6" }}
                      >
                        {app.site.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{app.jobTitle}</span>
                          <Badge className={`${meta.bg} ${meta.text} border-transparent text-[10px] py-0`}>
                            {meta.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <Building2 className="h-3 w-3" />
                          {app.company}
                          <span>·</span>
                          <Briefcase className="h-3 w-3" />
                          {app.site}
                          <span>·</span>
                          <Clock className="h-3 w-3" />
                          {timeAgo(app.appliedAt)}
                        </div>
                      </div>
                      {app.salaryRange && (
                        <div className="text-xs text-muted-foreground hidden sm:block">{app.salaryRange}</div>
                      )}
                    </div>
                  );
                })}
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <QuickAction
          title="Tailor resume with AI"
          desc="Match summary to a JD"
          cta="Open AI Tailor"
          icon={Sparkles}
          onClick={() => onNavigate("profiles")}
        />
        <QuickAction
          title="Bulk Apply"
          desc="Fill multiple jobs"
          cta="Start session"
          icon={Rocket}
          onClick={() => onNavigate("bulk-apply")}
          highlight
        />
        <QuickAction
          title="Calendar"
          desc="Interviews & follow-ups"
          cta="Open calendar"
          icon={CalendarDays}
          onClick={() => onNavigate("calendar")}
        />
        <QuickAction
          title="Follow-up reminders"
          desc="Applications needing a nudge"
          cta="View reminders"
          icon={Clock}
          onClick={() => onNavigate("reminders")}
        />
        <QuickAction
          title="Review analytics"
          desc="Response & interview rates"
          cta="Open analytics"
          icon={TrendingUp}
          onClick={() => onNavigate("analytics")}
        />
        <QuickAction
          title="Export data"
          desc="Backup applications"
          cta="Data management"
          icon={Database}
          onClick={() => onNavigate("data")}
        />
      </div>

      {/* AI Tools section */}
      <Card className="overflow-hidden border-ocean/20">
        <div className="h-1 bg-gradient-to-r from-ink via-ocean to-sky" />
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-ocean" /> AI-powered tools
            <Badge variant="outline" className="border-ocean/20 text-ocean bg-ocean/5 text-[10px]">6 features</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AITool
              title="Resume Parser"
              desc="Extract from any resume"
              icon={Sparkles}
              onClick={() => onNavigate("profiles")}
            />
            <AITool
              title="Resume Tailor"
              desc="Rewrite per JD"
              icon={Sparkles}
              onClick={() => onNavigate("profiles")}
            />
            <AITool
              title="JD Analyzer"
              desc="Skill gaps & match score"
              icon={Sparkles}
              onClick={() => onNavigate("applications")}
            />
            <AITool
              title="Interview Prep"
              desc="Practice questions"
              icon={Sparkles}
              onClick={() => onNavigate("applications")}
            />
            <AITool
              title="Follow-up Email"
              desc="Draft polite follow-ups"
              icon={Sparkles}
              onClick={() => onNavigate("applications")}
            />
            <AITool
              title="Salary Negotiation"
              desc="Negotiate your offer"
              icon={Sparkles}
              onClick={() => onNavigate("applications")}
            />
          </div>
        </CardContent>
      </Card>

      <QuickAddDialog
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onAdded={load}
      />
    </div>
  );
}

function AITool({ title, desc, icon: Icon, onClick }: { title: string; desc: string; icon: typeof Sparkles; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="text-left rounded-xl border border-border p-3 hover:border-ocean/40 hover:shadow-ocean transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-ocean/5 blur-xl group-hover:bg-ocean/10 transition-colors" />
      <div className="relative">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-ocean to-sky grid place-items-center mb-2 shadow-ocean">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
        <div className="mt-2 text-[10px] font-semibold text-ocean flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Open <ArrowRight className="h-2.5 w-2.5" />
        </div>
      </div>
    </motion.button>
  );
}

function QuickAction({
  title,
  desc,
  cta,
  icon: Icon,
  onClick,
  highlight,
}: {
  title: string;
  desc: string;
  cta: string;
  icon: typeof Sparkles;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <Card className={`hover:shadow-ocean transition-all cursor-pointer group relative overflow-hidden ${highlight ? "border-ocean/40 ring-2 ring-ocean/10 bg-gradient-to-br from-ocean/5 to-transparent" : "hover:border-ocean/40"}`} >
      {highlight && (
        <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-ocean/10 blur-2xl -translate-y-6 translate-x-6" />
      )}
      <CardContent className="pt-5 relative" onClick={onClick}>
        <div className={`h-10 w-10 rounded-xl grid place-items-center mb-3 shadow-ocean ${highlight ? "bg-gradient-to-br from-ink to-ocean" : "bg-gradient-to-br from-ocean to-sky"}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="font-semibold text-sm">{title}</div>
        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
        <div className="mt-3 text-xs font-semibold text-ocean flex items-center gap-1 group-hover:gap-2 transition-all">
          {cta} <ArrowRight className="h-3 w-3" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatSkeleton() {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
        <div className="mt-4 h-7 w-16 bg-muted rounded animate-pulse" />
        <div className="mt-2 h-3 w-24 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}
