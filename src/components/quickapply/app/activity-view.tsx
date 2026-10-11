"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity as ActivityIcon,
  Send,
  Target,
  Award,
  MessageSquare,
  Clock,
  TrendingUp,
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

interface ActivityEntry {
  id: string;
  type: "applied" | "status" | "interview" | "offer";
  title: string;
  description: string;
  company: string;
  timestamp: string;
  color: string;
}

interface ActivityData {
  activities: ActivityEntry[];
  weeklyStats: {
    applications: number;
    interviews: number;
    offers: number;
    feedback: number;
  };
}

const TYPE_ICONS: Record<string, typeof Send> = {
  applied: Send,
  status: Clock,
  interview: Target,
  offer: Award,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = 60000;
  const hour = 60 * min;
  const day = 24 * hour;
  if (diff < min) return "just now";
  if (diff < hour) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ActivityView({ onNavigate }: { onNavigate: (s: AppSection) => void }) {
  const [data, setData] = useState<ActivityData | null>(null);

  useEffect(() => {
    fetch("/api/activity?days=30").then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-5 h-24 bg-muted/30 animate-pulse" /></Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Applications", value: data.weeklyStats.applications, icon: Send, color: "#0077B6", bg: "bg-ocean/10" },
    { label: "Interviews", value: data.weeklyStats.interviews, icon: Target, color: "#00B4D8", bg: "bg-sky/10" },
    { label: "Offers", value: data.weeklyStats.offers, icon: Award, color: "#0f7b3f", bg: "bg-emerald-500/10" },
    { label: "Debriefs", value: data.weeklyStats.feedback, icon: MessageSquare, color: "#f59e0b", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          Activity Feed
          <Badge variant="outline" className="border-ocean/20 text-ocean bg-ocean/5">
            Last 7 days
          </Badge>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          A timeline of everything you've done — applications, status changes, interviews, and debriefs.
        </p>
      </div>

      {/* Weekly stats */}
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

      {/* Activity timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ActivityIcon className="h-4.5 w-4.5 text-ocean" /> Recent activity
          </CardTitle>
          <CardDescription>Everything that happened in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative pl-2">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-ocean via-sky to-border" />

            {data.activities.length === 0 ? (
              <div className="text-center py-12">
                <ActivityIcon className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <div className="text-sm font-medium">No recent activity</div>
                <p className="text-xs text-muted-foreground mt-1">Apply to jobs to see your activity here.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {data.activities.slice(0, 40).map((entry, i) => {
                  const Icon = TYPE_ICONS[entry.type] ?? Clock;
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.6) }}
                      className="relative flex gap-4 py-2.5"
                    >
                      <div className="relative z-10 shrink-0">
                        <div
                          className="h-9 w-9 rounded-full grid place-items-center ring-4 ring-background"
                          style={{ backgroundColor: entry.color }}
                        >
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{entry.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1"><Building2 className="h-2.5 w-2.5" /> {entry.company}</span>
                          {entry.description && (<><span>·</span><span>{entry.description}</span></>)}
                          <span>·</span>
                          <span>{timeAgo(entry.timestamp)}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-br from-ocean/5 to-transparent border-ocean/20">
        <CardContent className="py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-ocean/10 grid place-items-center shrink-0">
            <TrendingUp className="h-4.5 w-4.5 text-ocean" />
          </div>
          <div className="text-sm flex-1">
            <div className="font-medium">Keep the momentum going</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.weeklyStats.applications >= 3
                ? "Great pace this week! Apply to a few more to maximize your chances."
                : "Apply to more jobs this week to build your pipeline."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onNavigate("applications")}>
            View applications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
