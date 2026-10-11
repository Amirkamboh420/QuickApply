"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Sparkles,
  Loader2,
  Check,
  Copy,
  Users,
  Code2,
  Building2,
  Lightbulb,
  ChevronRight,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface InterviewPrepResult {
  behavioral: string[];
  technical: string[];
  company: string[];
  tips: string[];
}

const CATEGORIES = [
  { key: "behavioral" as const, label: "Behavioral", icon: Users, color: "#0077B6", bg: "bg-ocean/10" },
  { key: "technical" as const, label: "Technical", icon: Code2, color: "#00B4D8", bg: "bg-sky/10" },
  { key: "company" as const, label: "Ask the interviewer", icon: Building2, color: "#0f7b3f", bg: "bg-emerald-500/10" },
  { key: "tips" as const, label: "Prep tips", icon: Lightbulb, color: "#f59e0b", bg: "bg-amber-500/10" },
];

export function InterviewPrepDialog({
  open,
  onClose,
  defaultRole,
  defaultCompany,
}: {
  open: boolean;
  onClose: () => void;
  defaultRole?: string;
  defaultCompany?: string;
}) {
  const { toast } = useToast();
  const [jd, setJd] = useState("");
  const [role, setRole] = useState(defaultRole ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterviewPrepResult | null>(null);
  const [activeCat, setActiveCat] = useState<keyof InterviewPrepResult>("behavioral");

  const generate = async () => {
    if (!jd.trim()) {
      toast({ title: "Paste a job description first", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/demo/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jd, role }),
      });
      const data = await res.json();
      setResult(data);
      setActiveCat("behavioral");
    } catch {
      toast({ title: "Generation failed", variant: "destructive" });
    }
    setLoading(false);
  };

  const copyAll = () => {
    if (!result) return;
    const text = CATEGORIES.map((c) => `## ${c.label}\n${result[c.key].map((q) => `- ${q}`).join("\n")}`).join("\n\n");
    navigator.clipboard.writeText(text);
    toast({ title: "All questions copied to clipboard" });
  };

  const close = () => {
    onClose();
    setResult(null);
    setJd("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-ocean" /> AI Interview Prep
          </DialogTitle>
          <DialogDescription>
            Paste a job description and QuickApply generates practice questions & prep tips tailored to the role.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role (optional)">
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Frontend Engineer" />
              </Field>
              <Field label="Company (optional)">
                <Input value={defaultCompany ?? ""} disabled placeholder="Auto-filled from application" />
              </Field>
            </div>
            <Field label="Job description">
              <Textarea
                rows={7}
                placeholder="Paste the job description here…"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                className="text-sm"
              />
            </Field>
            <div className="flex justify-end">
              <Button className="bg-ocean hover:bg-ocean/90" onClick={generate} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate questions
              </Button>
            </div>

            {loading && (
              <div className="space-y-2 py-4">
                {["Analyzing job description…", "Generating behavioral questions…", "Drafting technical questions…"].map((t, i) => (
                  <motion.div
                    key={t}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.6 }}
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
            {/* Category tabs */}
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((c) => {
                const isActive = activeCat === c.key;
                const count = result[c.key]?.length ?? 0;
                return (
                  <button
                    key={c.key}
                    onClick={() => setActiveCat(c.key)}
                    className={`rounded-lg p-2.5 border text-left transition-all ${
                      isActive ? "border-ocean bg-ocean/5 shadow-ocean" : "border-border hover:border-ocean/40"
                    }`}
                  >
                    <div className={`h-7 w-7 rounded-md grid place-items-center mb-1.5 ${c.bg}`}>
                      <c.icon className="h-3.5 w-3.5" style={{ color: c.color }} />
                    </div>
                    <div className="text-[11px] font-medium leading-tight">{c.label}</div>
                    <div className="text-[10px] text-muted-foreground">{count} items</div>
                  </button>
                );
              })}
            </div>

            {/* Questions list */}
            <div className="min-h-[200px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCat}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-2"
                >
                  {result[activeCat]?.map((q, i) => (
                    <motion.div
                      key={q}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 hover:border-ocean/40 transition-colors"
                    >
                      <div className="h-6 w-6 rounded-md bg-ocean/10 text-ocean text-xs font-bold grid place-items-center shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm leading-relaxed flex-1">{q}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(q);
                          toast({ title: "Copied" });
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-ocean"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={copyAll}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy all
              </Button>
              <Button variant="outline" size="sm" onClick={() => setResult(null)}>
                Regenerate
              </Button>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
