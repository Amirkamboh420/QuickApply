"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Clock,
  AlertCircle,
  CheckCircle2,
  CalendarClock,
  Mail,
  Building2,
  Briefcase,
  Flame,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { AppSection } from "../app-shell";
import { Application, STATUS_META, Status } from "@/lib/quickapply/types";

interface Reminder extends Application {
  daysSince: number;
  dueInDays: number;
  urgency: "overdue" | "today" | "soon" | "later";
  suggestedFollowUp: boolean;
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

const URGENCY_META = {
  overdue: { label: "Overdue", color: "#e23b5a", bg: "bg-red-500/10", text: "text-red-600", icon: typeof Flame },
  today: { label: "Due today", color: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-600", icon: typeof Clock },
  soon: { label: "Coming up", color: "#0077B6", bg: "bg-ocean/10", text: "text-ocean", icon: typeof Bell },
  later: { label: "Later", color: "#5b7a8c", bg: "bg-muted", text: "text-muted-foreground", icon: typeof CalendarClock },
};

export function RemindersView({ onNavigate }: { onNavigate: (s: AppSection) => void }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState({ total: 0, overdue: 0, dueToday: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "overdue" | "today" | "soon">("all");
  const { toast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch("/api/reminders");
    const data = await res.json();
    setReminders(data.reminders);
    setStats(data.stats);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkDone = async (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/applications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "interview", followUpAt: new Date().toISOString() }),
    });
    toast({ title: "Marked as responded", description: "Reminder cleared." });
  };

  const handleSnooze = async (id: string, days: number) => {
    const future = new Date();
    future.setDate(future.getDate() + days);
    setReminders((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/applications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpAt: future.toISOString() }),
    });
    toast({ title: `Snoozed ${days} days`, description: "We'll remind you again." });
  };

  const filtered = filter === "all" ? reminders : reminders.filter((r) => r.urgency === filter);

  const cards = [
    { key: "total" as const, label: "Active reminders", value: stats.total, icon: Bell, color: "#0077B6", bg: "bg-ocean/10" },
    { key: "overdue" as const, label: "Overdue", value: stats.overdue, icon: Flame, color: "#e23b5a", bg: "bg-red-500/10" },
    { key: "dueToday" as const, label: "Due today", value: stats.dueToday, icon: Clock, color: "#f59e0b", bg: "bg-amber-500/10" },
    { key: "upcoming" as const, label: "This week", value: stats.upcoming, icon: CalendarClock, color: "#00B4D8", bg: "bg-sky/10" },
  ];

  const filterForKey = (k: string) => (k === "total" ? "all" : k === "dueToday" ? "today" : k === "upcoming" ? "soon" : k);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            Follow-up Reminders
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ocean" />
            </span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            QuickApply nudges you to follow up when applications go quiet.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => onNavigate("applications")}>
          <Briefcase className="mr-1.5 h-4 w-4" /> View all applications
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const fk = filterForKey(c.key);
          return (
            <motion.button
              key={c.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setFilter(fk)}
              className="text-left"
            >
              <Card className={`hover:shadow-ocean transition-all ${filter === fk ? "ring-2 ring-ocean/30 border-ocean/40" : ""}`}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div className={`h-10 w-10 rounded-xl grid place-items-center ${c.bg}`}>
                      <c.icon className="h-5 w-5" style={{ color: c.color }} />
                    </div>
                    {c.value > 0 && c.key !== "total" && (
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                        click to filter
                      </span>
                    )}
                  </div>
                  <div className="mt-4 text-2xl font-bold">{c.value}</div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                </CardContent>
              </Card>
            </motion.button>
          );
        })}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {(["all", "overdue", "today", "soon"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all border ${
              filter === f
                ? "bg-ocean text-white border-ocean shadow-ocean"
                : "bg-background border-border text-foreground/70 hover:border-ocean/40"
            }`}
          >
            {f === "all" ? "All" : URGENCY_META[f].label}
          </button>
        ))}
      </div>

      {/* Reminders list */}
      <div className="space-y-2.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="py-4 h-20 bg-muted/30 animate-pulse" /></Card>
          ))
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500/60 mx-auto mb-3" />
              <div className="font-semibold text-lg">All caught up! 🎉</div>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                No follow-ups needed right now. QuickApply will alert you here when an application
                goes quiet for more than a week.
              </p>
              <Button className="mt-4 bg-ocean hover:bg-ocean/90" onClick={() => onNavigate("applications")}>
                <Briefcase className="mr-1.5 h-4 w-4" /> Browse applications
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((r, i) => {
              const meta = URGENCY_META[r.urgency];
              const appMeta = STATUS_META[r.status as Status];
              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.97 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className={`hover:shadow-ocean transition-all border-l-4 ${
                    r.urgency === "overdue"
                      ? "border-l-red-500"
                      : r.urgency === "today"
                      ? "border-l-amber-500"
                      : "border-l-ocean"
                  }`}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="h-10 w-10 rounded-lg grid place-items-center shrink-0 text-white text-xs font-bold"
                          style={{ backgroundColor: SITE_COLORS[r.site] ?? "#0077B6" }}
                        >
                          {r.site.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold truncate">{r.jobTitle}</span>
                            <Badge className={`${meta.bg} ${meta.text} border-transparent text-[10px] py-0`}>
                              <Clock className="h-2.5 w-2.5 mr-0.5" />
                              {r.dueInDays < 0
                                ? `${Math.abs(r.dueInDays)}d overdue`
                                : r.dueInDays === 0
                                ? "Due today"
                                : `In ${r.dueInDays}d`}
                            </Badge>
                            <Badge className={`${appMeta.bg} ${appMeta.text} border-transparent text-[10px] py-0`}>
                              {appMeta.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                            <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {r.company}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {r.site}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Applied {r.daysSince}d ago</span>
                          </div>

                          {r.suggestedFollowUp && (
                            <div className="mt-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs text-foreground/80 flex items-start gap-2">
                              <Mail className="h-3.5 w-3.5 text-ocean shrink-0 mt-0.5" />
                              <span>
                                <span className="font-medium">Suggested:</span> Send a polite follow-up email asking
                                about your application status. QuickApply can draft one for you.
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0">
                          <Button size="sm" className="bg-ocean hover:bg-ocean/90 h-7 text-xs" onClick={() => handleMarkDone(r.id)}>
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Got reply
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleSnooze(r.id, 3)}>
                            <Clock className="mr-1 h-3 w-3" /> Snooze 3d
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Info banner */}
      <Card className="bg-gradient-to-br from-ink/5 to-ocean/5 border-ocean/20">
        <CardContent className="py-4 flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-ocean/10 grid place-items-center shrink-0">
            <AlertCircle className="h-4.5 w-4.5 text-ocean" />
          </div>
          <div className="text-sm">
            <div className="font-medium">How reminders work</div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              QuickApply suggests a follow-up 7 days after you apply if there's no response. Snooze
              to push the reminder forward, or mark "Got reply" to clear it and move the application
              to the Interview stage. You can adjust the follow-up window in Settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
