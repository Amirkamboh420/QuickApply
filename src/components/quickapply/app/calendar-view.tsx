"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Send,
  Target,
  Mail,
  Award,
  Clock,
  Building2,
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
import type { AppSection } from "../app-shell";

interface CalendarEvent {
  id: string;
  date: string;
  type: "applied" | "interview" | "followup" | "offer";
  title: string;
  company: string;
  site: string;
  applicationId: string;
}

interface CalendarData {
  events: CalendarEvent[];
  byDate: Record<string, CalendarEvent[]>;
  stats: { total: number; upcoming: number; interviews: number; followups: number };
}

const TYPE_META = {
  applied: { label: "Applied", color: "#0077B6", bg: "bg-ocean/15", text: "text-ocean", icon: Send },
  interview: { label: "Interview", color: "#00B4D8", bg: "bg-sky/15", text: "text-sky", icon: Target },
  followup: { label: "Follow-up", color: "#f59e0b", bg: "bg-amber-500/15", text: "text-amber-600", icon: Mail },
  offer: { label: "Offer", color: "#0f7b3f", bg: "bg-emerald-500/15", text: "text-emerald-600", icon: Award },
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView({ onNavigate }: { onNavigate: (s: AppSection) => void }) {
  const [data, setData] = useState<CalendarData | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/calendar").then((r) => r.json()).then(setData);
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  // If no date selected, default to today
  const activeDate = selectedDate ?? todayStr;
  const activeEvents = data?.byDate[activeDate] ?? [];

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: Array<{ date: string | null; day: number | null; isToday: boolean }> = [];
    // Leading blanks
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, day: null, isToday: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ date: dateStr, day: d, isToday: dateStr === todayStr });
    }
    return days;
  }, [currentMonth, todayStr]);

  const prevMonth = () => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(todayStr);
  };

  if (!data) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <Card><CardContent className="pt-5 h-96 bg-muted/30 animate-pulse" /></Card>
      </div>
    );
  }

  const stats = [
    { label: "Total events", value: data.stats.total, icon: CalendarIcon, color: "#0077B6", bg: "bg-ocean/10" },
    { label: "Upcoming", value: data.stats.upcoming, icon: Clock, color: "#00B4D8", bg: "bg-sky/10" },
    { label: "Interviews", value: data.stats.interviews, icon: Target, color: "#00B4D8", bg: "bg-sky/10" },
    { label: "Follow-ups", value: data.stats.followups, icon: Mail, color: "#f59e0b", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            Calendar
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Applications, interviews & follow-ups in a single view.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={goToday}>
          <CalendarIcon className="mr-1.5 h-4 w-4" /> Today
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Calendar grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide py-1">
                  {d}
                </div>
              ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cell, i) => {
                if (!cell.date) return <div key={i} className="aspect-square" />;
                const dayEvents = data.byDate[cell.date] ?? [];
                const isSelected = cell.date === activeDate;
                const isToday = cell.isToday;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(cell.date)}
                    className={`aspect-square rounded-lg border p-1 text-left transition-all hover:border-ocean/40 hover:shadow-sm relative ${
                      isSelected
                        ? "border-ocean bg-ocean/5 ring-1 ring-ocean/20"
                        : isToday
                        ? "border-ocean/40 bg-ocean/5"
                        : "border-border"
                    }`}
                  >
                    <div className={`text-xs ${isToday ? "font-bold text-ocean" : "text-foreground/70"}`}>
                      {cell.day}
                    </div>
                    {/* Event dots */}
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-0.5">
                        {dayEvents.slice(0, 3).map((e) => (
                          <span
                            key={e.id}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: TYPE_META[e.type].color }}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-[8px] text-muted-foreground leading-none">+{dayEvents.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-3">
              {Object.entries(TYPE_META).map(([key, m]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected day events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {new Date(activeDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </CardTitle>
            <CardDescription>
              {activeEvents.length === 0
                ? "No events this day"
                : `${activeEvents.length} event${activeEvents.length > 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
              <AnimatePresence mode="popLayout">
                {activeEvents.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <CalendarIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">Pick another day or add applications.</p>
                  </motion.div>
                ) : (
                  activeEvents.map((e, i) => {
                    const meta = TYPE_META[e.type];
                    const Icon = meta.icon;
                    return (
                      <motion.div
                        key={e.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: i * 0.05 }}
                        className={`rounded-lg border-l-4 p-3 hover:shadow-sm transition-all cursor-pointer ${
                          e.type === "applied" ? "border-l-ocean" :
                          e.type === "interview" ? "border-l-sky" :
                          e.type === "followup" ? "border-l-amber-500" : "border-l-emerald-500"
                        } bg-card`}
                        onClick={() => onNavigate("applications")}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`h-8 w-8 rounded-lg ${meta.bg} grid place-items-center shrink-0`}>
                            <Icon className="h-4 w-4" style={{ color: meta.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{e.title}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Building2 className="h-2.5 w-2.5" /> {e.company} · {e.site}
                            </div>
                          </div>
                          <Badge className={`${meta.bg} ${meta.text} border-transparent text-[9px] shrink-0`}>
                            {meta.label}
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
