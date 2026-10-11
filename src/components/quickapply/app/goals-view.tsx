"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  Flame,
  CheckCircle2,
  Clock,
  Trophy,
  Edit2,
  Loader2,
  Zap,
  PartyPopper,
} from "lucide-react";
import { Confetti } from "./confetti";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import type { AppSection } from "../app-shell";

interface GoalData {
  goal: { id: string; target: number; period: string };
  progress: number;
  current: number;
  target: number;
  remaining: number;
  onTrack: boolean;
  daysLeft: number;
  streak: number;
  weeks: { label: string; count: number; target: number }[];
  weekStart: string;
}

export function GoalsView({ onNavigate }: { onNavigate: (s: AppSection) => void }) {
  const { toast } = useToast();
  const [data, setData] = useState<GoalData | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [newTarget, setNewTarget] = useState(5);
  const [saving, setSaving] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const prevOnTrack = useRef(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/goals");
    const d = await res.json();
    // Trigger confetti if goal just became met
    if (d.onTrack && !prevOnTrack.current) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 4500);
      toast({
        title: "🎉 Goal achieved!",
        description: `You hit your target of ${d.target} applications this week!`,
      });
    }
    prevOnTrack.current = d.onTrack;
    setData(d);
    setNewTarget(d.target);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const saveGoal = async () => {
    setSaving(true);
    await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target: newTarget }),
    });
    setSaving(false);
    setEditOpen(false);
    toast({ title: "Goal updated", description: `Target: ${newTarget} applications/week` });
    load();
  };

  if (!data) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <Card><CardContent className="pt-5 h-64 bg-muted/30 animate-pulse" /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Confetti trigger={celebrate} />

      {/* Celebration banner when goal is met */}
      {data.onTrack && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="rounded-xl bg-gradient-to-r from-emerald-500/15 via-ocean/10 to-sky/10 border border-emerald-500/30 p-4 flex items-center gap-3"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
            className="h-10 w-10 rounded-full bg-emerald-500/20 grid place-items-center shrink-0"
          >
            <PartyPopper className="h-5 w-5 text-emerald-600" />
          </motion.div>
          <div className="flex-1">
            <div className="font-semibold text-emerald-700">Goal achieved this week! 🎉</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              You've hit your target of {data.target} applications. {data.streak > 0 && `That's a ${data.streak}-week streak!`} Keep the momentum going.
            </p>
          </div>
          <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10" onClick={() => setCelebrate(true)}>
            <PartyPopper className="mr-1.5 h-3.5 w-3.5" /> Celebrate
          </Button>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            Goals & Progress
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Set a weekly application target and track your consistency.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Edit2 className="mr-1.5 h-4 w-4" /> Edit goal
        </Button>
      </div>

      {/* Main progress card */}
      <Card className={`overflow-hidden ${data.onTrack ? "border-emerald-500/30" : "border-ocean/20"}`}>
        <div className={`h-1.5 ${data.onTrack ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-ink via-ocean to-sky"}`} />
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Circular progress */}
            <div className="relative shrink-0">
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="48" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
                <motion.circle
                  cx="56"
                  cy="56"
                  r="48"
                  fill="none"
                  stroke={data.onTrack ? "#0f7b3f" : "#0077B6"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - data.progress / 100) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: data.onTrack ? "#0f7b3f" : "#0077B6" }}>
                    {data.progress}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">of goal</div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold">Weekly applications goal</h2>
                {data.onTrack && (
                  <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/20">
                    <Trophy className="h-3 w-3 mr-0.5" /> Goal met!
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {data.onTrack
                  ? `Amazing! You've hit your target of ${data.target} applications this week. Keep going!`
                  : `${data.current} of ${data.target} applications this week — ${data.remaining} to go`}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {data.daysLeft > 0
                  ? `${data.daysLeft} day${data.daysLeft > 1 ? "s" : ""} left this week`
                  : "Week ends today — last chance!"}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{data.current}</div>
              <div className="text-xs text-muted-foreground">/ {data.target} apps</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="This week"
          value={String(data.current)}
          sub={`of ${data.target} goal`}
          icon={Zap}
          color="#0077B6"
          bg="bg-ocean/10"
        />
        <StatCard
          label="Progress"
          value={`${data.progress}%`}
          sub={data.onTrack ? "Goal met" : "In progress"}
          icon={TrendingUp}
          color="#00B4D8"
          bg="bg-sky/10"
        />
        <StatCard
          label="Streak"
          value={`${data.streak} week${data.streak !== 1 ? "s" : ""}`}
          sub={data.streak > 0 ? "Keep it up!" : "Start one this week"}
          icon={Flame}
          color="#f59e0b"
          bg="bg-amber-500/10"
        />
        <StatCard
          label="Remaining"
          value={String(data.remaining)}
          sub="apps to goal"
          icon={Target}
          color={data.onTrack ? "#0f7b3f" : "#5b7a8c"}
          bg={data.onTrack ? "bg-emerald-500/10" : "bg-muted"}
        />
      </div>

      {/* 8-week history chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-ocean" /> Last 8 weeks
          </CardTitle>
          <CardDescription>Your application volume vs the goal line</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weeks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goalArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00B4D8" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#00B4D8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6e9f2" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5b7a8c" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#5b7a8c" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #d6e9f2", fontSize: 12 }} />
                <ReferenceLine y={data.target} stroke="#0f7b3f" strokeDasharray="4 4" label={{ value: "Goal", fontSize: 10, fill: "#0f7b3f", position: "right" }} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#0077B6"
                  strokeWidth={2.5}
                  fill="url(#goalArea)"
                  dot={{ r: 3, fill: "#0077B6", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#0077B6", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-br from-ocean/5 to-transparent border-ocean/20">
        <CardContent className="py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-ocean/10 grid place-items-center shrink-0">
            <CheckCircle2 className="h-4.5 w-4.5 text-ocean" />
          </div>
          <div className="text-sm flex-1">
            <div className="font-medium">
              {data.onTrack
                ? "You're on fire! Apply to more jobs to extend your streak."
                : data.daysLeft > 0
                ? `Apply to ${data.remaining} more job${data.remaining > 1 ? "s" : ""} this week to hit your goal.`
                : "New week starts tomorrow — set a fresh target!"}
            </div>
          </div>
          <Button size="sm" className="bg-ocean hover:bg-ocean/90" onClick={() => onNavigate("applications")}>
            <Zap className="mr-1.5 h-3.5 w-3.5" fill="white" /> Apply now
          </Button>
        </CardContent>
      </Card>

      {/* Edit goal dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => !o && setEditOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-ocean" /> Edit weekly goal
            </DialogTitle>
            <DialogDescription>How many applications do you want to send per week?</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Target applications per week</Label>
              <div className="flex items-center gap-3 mt-2">
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={newTarget}
                  onChange={(e) => setNewTarget(Math.max(1, Math.min(50, Number(e.target.value))))}
                  className="w-20 text-center text-lg font-bold"
                />
                <div className="flex gap-1">
                  {[3, 5, 10, 15].map((v) => (
                    <button
                      key={v}
                      onClick={() => setNewTarget(v)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                        newTarget === v
                          ? "bg-ocean text-white border-ocean"
                          : "bg-background border-border hover:border-ocean/40"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: start small (3-5/week) and build up. Consistency beats volume.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="bg-ocean hover:bg-ocean/90" onClick={saveGoal} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Save goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, bg }: { label: string; value: string; sub: string; icon: typeof Zap; color: string; bg: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="pt-5">
          <div className={`h-10 w-10 rounded-xl grid place-items-center ${bg} mb-3`}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
