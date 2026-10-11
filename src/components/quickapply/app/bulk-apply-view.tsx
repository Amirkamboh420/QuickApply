"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  DollarSign,
  Loader2,
  Sparkles,
  AlertCircle,
  ChevronRight,
  ListChecks,
  SkipForward,
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
import { useToast } from "@/hooks/use-toast";
import type { AppSection } from "../app-shell";

interface BulkJob {
  id: string;
  jobTitle: string;
  company: string;
  site: string;
  location: string;
  salaryRange: string;
  matchScore: number;
  profileName: string;
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

export function BulkApplyView({ onNavigate }: { onNavigate: (s: AppSection) => void }) {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<BulkJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "detecting" | "filling" | "reviewing" | "done">("idle");
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [profileName, setProfileName] = useState("");
  const [headline, setHeadline] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/bulk-apply");
    const data = await res.json();
    setJobs(data.jobs ?? []);
    setProfileName(data.profileName ?? "");
    setHeadline(data.headline ?? "");
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const current = jobs[currentIndex];
  const completed = applied.size + skipped.size;
  const progress = jobs.length ? (completed / jobs.length) * 100 : 0;

  const startFill = () => {
    if (!current) return;
    setPhase("detecting");
    setTimeout(() => setPhase("filling"), 1100);
    setTimeout(() => setPhase("reviewing"), 2400);
  };

  const confirmApply = async () => {
    if (!current) return;
    // Actually create the application
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobTitle: current.jobTitle,
        company: current.company,
        site: current.site,
        location: current.location,
        salaryRange: current.salaryRange,
        status: "applied",
        source: "Bulk Apply Assistant",
      }),
    });
    setApplied((prev) => new Set(prev).add(current.id));
    toast({ title: "Application submitted", description: `${current.jobTitle} at ${current.company}` });
    nextJob();
  };

  const skip = () => {
    if (!current) return;
    setSkipped((prev) => new Set(prev).add(current.id));
    toast({ title: "Skipped", description: `${current.jobTitle} at ${current.company}` });
    nextJob();
  };

  const nextJob = () => {
    setPhase("idle");
    if (currentIndex + 1 < jobs.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setPhase("done");
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setApplied(new Set());
    setSkipped(new Set());
    setPhase("idle");
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <Card><CardContent className="py-12 bg-muted/30 animate-pulse" /></Card>
      </div>
    );
  }

  // Done state
  if (phase === "done" || (jobs.length > 0 && currentIndex >= jobs.length)) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardContent className="pt-8 pb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="h-16 w-16 rounded-full bg-emerald-500/15 grid place-items-center mx-auto mb-4"
            >
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            </motion.div>
            <h2 className="text-2xl font-bold">Bulk session complete! 🎉</h2>
            <p className="text-muted-foreground mt-2">
              You applied to <span className="font-semibold text-ocean">{applied.size}</span> job{applied.size !== 1 ? "s" : ""}
              {skipped.size > 0 && <> and skipped {skipped.size}</>}.
            </p>
            <div className="mt-6 flex gap-2 justify-center">
              <Button variant="outline" onClick={() => onNavigate("applications")}>
                <ListChecks className="mr-1.5 h-4 w-4" /> View applications
              </Button>
              <Button className="bg-ocean hover:bg-ocean/90" onClick={reset}>
                <Zap className="mr-1.5 h-4 w-4" fill="white" /> Start new session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (jobs.length === 0) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            Bulk Apply Assistant
            <Badge variant="outline" className="border-ocean/20 text-ocean bg-ocean/5">
              <Sparkles className="h-3 w-3 mr-0.5" /> Phase 4
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Fill multiple similar jobs in one session — with your confirmation per job.
          </p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <ListChecks className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <div className="font-medium">No new matching jobs found</div>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              We couldn't find new jobs matching your default profile that you haven't already applied to.
              Try updating your profile headline for better matches.
            </p>
            <Button className="mt-4 bg-ocean hover:bg-ocean/90" onClick={() => onNavigate("profiles")}>
              Update profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const matchColor = current.matchScore >= 90 ? "#0f7b3f" : current.matchScore >= 85 ? "#0077B6" : "#f59e0b";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          Bulk Apply Assistant
          <Badge variant="outline" className="border-ocean/20 text-ocean bg-ocean/5">
            <Sparkles className="h-3 w-3 mr-0.5" /> Phase 4
          </Badge>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Filling with profile: <span className="font-medium text-foreground">{profileName}</span> · {headline}
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Session progress</span>
            <span className="text-sm text-muted-foreground">{completed} / {jobs.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="mt-3 flex gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {applied.size} applied
            </span>
            <span className="flex items-center gap-1.5">
              <SkipForward className="h-3.5 w-3.5 text-muted-foreground" /> {skipped.size} skipped
            </span>
            <span className="flex items-center gap-1.5 ml-auto">
              <Clock className="h-3.5 w-3.5 text-ocean" /> {jobs.length - completed} remaining
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Current job card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            {/* Match score banner */}
            <div
              className="h-1.5"
              style={{ background: `linear-gradient(90deg, ${matchColor}, ${matchColor}80)` }}
            />
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div
                    className="h-12 w-12 rounded-xl grid place-items-center shrink-0 text-white text-sm font-bold"
                    style={{ backgroundColor: SITE_COLORS[current.site] ?? "#0077B6" }}
                  >
                    {current.site.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{current.jobTitle}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {current.company}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {current.location}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {current.salaryRange}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold" style={{ color: matchColor }}>{current.matchScore}%</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">match</div>
                </div>
              </div>

              {/* Fill simulation */}
              {phase !== "idle" && phase !== "done" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-lg border border-border bg-secondary/30 p-4 mb-4 space-y-2"
                >
                  <FillStep active={phase === "detecting"} done={phase !== "detecting" && phase !== "idle"} label="Detecting form fields…" />
                  <FillStep active={phase === "filling"} done={phase === "reviewing"} label="Auto-filling with your profile…" />
                  {phase === "reviewing" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
                      <div className="text-xs font-medium text-emerald-600 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="h-3.5 w-3.5" /> 7 fields filled · resume attached
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {["Full name", "Email", "Phone", "Location", "Headline", "Summary", "Resume"].map((f) => (
                          <div key={f} className="flex items-center gap-1.5 text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> {f}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {phase === "idle" && (
                  <>
                    <Button className="bg-ocean hover:bg-ocean/90 flex-1" onClick={startFill}>
                      <Zap className="mr-2 h-4 w-4" fill="white" /> Auto-fill this form
                    </Button>
                    <Button variant="outline" onClick={skip}>
                      <SkipForward className="mr-1.5 h-4 w-4" /> Skip
                    </Button>
                  </>
                )}
                {(phase === "detecting" || phase === "filling") && (
                  <Button disabled className="flex-1">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {phase === "detecting" ? "Detecting fields…" : "Filling form…"}
                  </Button>
                )}
                {phase === "reviewing" && (
                  <>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 flex-1" onClick={confirmApply}>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Submit application
                    </Button>
                    <Button variant="outline" onClick={skip}>
                      <SkipForward className="mr-1.5 h-4 w-4" /> Skip
                    </Button>
                  </>
                )}
              </div>

              {phase === "idle" && (
                <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3" />
                  QuickApply fills the form — you review and confirm. We never submit without your click.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Upcoming queue */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-ocean" /> Upcoming in queue
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
            {jobs.slice(currentIndex + 1).map((j, i) => (
              <div key={j.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <span className="text-xs text-muted-foreground font-mono w-6">{i + 2}</span>
                <div
                  className="h-7 w-7 rounded-md grid place-items-center text-white text-[10px] font-bold shrink-0"
                  style={{ backgroundColor: SITE_COLORS[j.site] ?? "#0077B6" }}
                >
                  {j.site.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{j.jobTitle}</div>
                  <div className="text-xs text-muted-foreground truncate">{j.company} · {j.location}</div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-secondary/60">{j.matchScore}%</Badge>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            ))}
            {currentIndex + 1 >= jobs.length && (
              <div className="text-center text-xs text-muted-foreground py-4">This is the last job in the queue</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FillStep({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : active ? (
        <Loader2 className="h-4 w-4 animate-spin text-ocean" />
      ) : (
        <div className="h-4 w-4 rounded-full border-2 border-muted" />
      )}
      <span className={done ? "text-foreground" : active ? "text-ocean font-medium" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
