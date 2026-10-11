"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanSearch,
  Sparkles,
  Loader2,
  Check,
  X,
  AlertTriangle,
  TrendingUp,
  Plus,
  Copy,
  Lightbulb,
  Target,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface JDAnalysis {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  missingSkillsImportance: string;
  recommendedAdditions: string[];
  redFlags: string[];
  strengths: string[];
  summaryInsight: string;
  suggestedExperienceBullet: string;
}

export function JDAnalyzerDialog({
  open,
  onClose,
  profileId,
}: {
  open: boolean;
  onClose: () => void;
  profileId?: string | null;
}) {
  const { toast } = useToast();
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JDAnalysis | null>(null);

  const analyze = async () => {
    if (!jd.trim()) {
      toast({ title: "Paste a job description first", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/demo/jd-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jd, profileId }),
      });
      const data = await res.json();
      if (data.error) {
        toast({ title: data.error, variant: "destructive" });
      } else {
        setResult(data);
      }
    } catch {
      toast({ title: "Analysis failed", variant: "destructive" });
    }
    setLoading(false);
  };

  const close = () => {
    onClose();
    setResult(null);
    setJd("");
  };

  const matchColor = result
    ? result.matchScore >= 80
      ? "#0f7b3f"
      : result.matchScore >= 60
      ? "#0077B6"
      : "#f59e0b"
    : "#0077B6";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanSearch className="h-5 w-5 text-ocean" /> JD Analyzer
          </DialogTitle>
          <DialogDescription>
            Paste a job description and QuickApply analyzes the match against your default profile — highlighting gaps and strengths.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-3">
            <Field label="Job description">
              <Textarea
                rows={8}
                placeholder="Paste the full job description here…"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                className="text-sm"
              />
            </Field>
            <div className="flex justify-end">
              <Button className="bg-ocean hover:bg-ocean/90" onClick={analyze} disabled={loading || !jd.trim()}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Analyze match
              </Button>
            </div>
            {loading && (
              <div className="space-y-2 py-2">
                {["Reading job description…", "Comparing with your profile…", "Identifying skill gaps…", "Generating recommendations…"].map((t, i) => (
                  <motion.div
                    key={t}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.7 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-ocean" />
                    {t}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Match score hero */}
            <div className="rounded-xl border border-border p-4 bg-gradient-to-br from-ocean/5 to-transparent">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="5" className="text-secondary" />
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="26"
                      fill="none"
                      stroke={matchColor}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - result.matchScore / 100) }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="text-lg font-bold" style={{ color: matchColor }}>{result.matchScore}%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-ocean" /> Overall match
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{result.summaryInsight}</p>
                </div>
              </div>
            </div>

            {/* Strengths */}
            <Section title="Your strengths" icon={TrendingUp} color="#0f7b3f" items={result.strengths} />

            {/* Matching skills */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Skills you have (matched)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.matchingSkills.length ? (
                  result.matchingSkills.map((s) => (
                    <Badge key={s} className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                      <Check className="h-2.5 w-2.5 mr-0.5" /> {s}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">None directly matched</span>
                )}
              </div>
            </div>

            {/* Missing skills */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <X className="h-3.5 w-3.5 text-red-500" /> Skills you're missing
                </div>
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/20">
                  {result.missingSkillsImportance}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.missingSkills.map((s) => (
                  <Badge key={s} className="bg-red-500/10 text-red-700 border-red-500/20">
                    <X className="h-2.5 w-2.5 mr-0.5" /> {s}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Red flags */}
            {result.redFlags.length > 0 && (
              <Section title="Potential concerns" icon={AlertTriangle} color="#f59e0b" items={result.redFlags} />
            )}

            {/* Recommended additions */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-ocean" /> Keywords to add to your resume
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.recommendedAdditions.map((s) => (
                  <Badge key={s} variant="outline" className="bg-sky/10 text-ocean border-sky/20">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Suggested bullet */}
            <div className="rounded-lg bg-secondary/50 p-3">
              <div className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Suggested experience bullet
              </div>
              <div className="flex items-start gap-2">
                <p className="text-sm leading-relaxed flex-1">{result.suggestedExperienceBullet}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.suggestedExperienceBullet);
                    toast({ title: "Bullet copied" });
                  }}
                  className="text-muted-foreground hover:text-ocean transition-colors shrink-0 mt-0.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setResult(null)}>Re-analyze</Button>
              <Button size="sm" className="bg-ocean hover:bg-ocean/90" onClick={close}>
                <Check className="mr-1.5 h-3.5 w-3.5" /> Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, icon: Icon, color, items }: { title: string; icon: typeof TrendingUp; color: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" style={{ color }} /> {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-2 text-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
            <span className="text-foreground/90 leading-relaxed">{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
