"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Star,
  Loader2,
  Check,
  Trash2,
  Calendar,
  User,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  ArrowRight,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/lib/quickapply/types";

interface FeedbackEntry {
  id: string;
  applicationId: string;
  interviewType: string;
  interviewDate: string;
  interviewerName: string | null;
  overallRating: number;
  difficulty: number;
  wentWell: string | null;
  couldImprove: string | null;
  questions: string | null;
  learnings: string | null;
  nextSteps: string | null;
  createdAt: string;
}

const INTERVIEW_TYPES = [
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "system-design", label: "System Design" },
  { value: "culture", label: "Culture Fit" },
  { value: "hr", label: "HR / Screening" },
  { value: "final", label: "Final Round" },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function InterviewFeedbackDialog({
  open,
  onClose,
  application,
}: {
  open: boolean;
  onClose: () => void;
  application: Application | null;
}) {
  const { toast } = useToast();
  const [history, setHistory] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    interviewType: "technical",
    interviewDate: new Date().toISOString().split("T")[0],
    interviewerName: "",
    overallRating: 3,
    difficulty: 3,
    wentWell: "",
    couldImprove: "",
    questions: "",
    learnings: "",
    nextSteps: "",
  });

  useEffect(() => {
    if (!open || !application) return;
    setLoading(true);
    fetch(`/api/interview-feedback?applicationId=${application.id}`)
      .then((r) => r.json())
      .then((data) => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [open, application]);

  if (!application) return null;

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/interview-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, applicationId: application.id }),
    });
    const created = await res.json();
    setHistory((prev) => [created, ...prev]);
    setSaving(false);
    setShowForm(false);
    setForm({
      interviewType: "technical",
      interviewDate: new Date().toISOString().split("T")[0],
      interviewerName: "",
      overallRating: 3,
      difficulty: 3,
      wentWell: "",
      couldImprove: "",
      questions: "",
      learnings: "",
      nextSteps: "",
    });
    toast({ title: "Feedback saved", description: "Interview debrief recorded." });
  };

  const handleDelete = async (id: string) => {
    setHistory((prev) => prev.filter((f) => f.id !== id));
    await fetch(`/api/interview-feedback/${id}`, { method: "DELETE" });
    toast({ title: "Feedback deleted" });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-ocean" /> Interview Feedback
          </DialogTitle>
          <DialogDescription>
            Post-interview debriefs for <span className="font-medium text-foreground">{application.jobTitle}</span> at {application.company}.
          </DialogDescription>
        </DialogHeader>

        {/* History */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-ocean" />
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                {history.length} debrief{history.length > 1 ? "s" : ""} recorded
              </span>
              {!showForm && (
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowForm(true)}>
                  + Add debrief
                </Button>
              )}
            </div>
            <AnimatePresence>
              {history.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-lg border border-border p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-ocean/10 text-ocean border-ocean/20 text-[10px]">
                        {INTERVIEW_TYPES.find((t) => t.value === entry.interviewType)?.label ?? entry.interviewType}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(entry.interviewDate)}
                      </span>
                      {entry.interviewerName && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" /> {entry.interviewerName}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Ratings */}
                  <div className="flex gap-4">
                    <RatingDisplay label="Overall" value={entry.overallRating} color="#0077B6" />
                    <RatingDisplay label="Difficulty" value={entry.difficulty} color="#f59e0b" />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    {entry.wentWell && <FeedbackLine icon={TrendingUp} color="#0f7b3f" label="Went well" text={entry.wentWell} />}
                    {entry.couldImprove && <FeedbackLine icon={AlertCircle} color="#f59e0b" label="Could improve" text={entry.couldImprove} />}
                    {entry.questions && <FeedbackLine icon={MessageSquare} color="#0077B6" label="Questions asked" text={entry.questions} />}
                    {entry.learnings && <FeedbackLine icon={Lightbulb} color="#00B4D8" label="Learnings" text={entry.learnings} />}
                    {entry.nextSteps && <FeedbackLine icon={ArrowRight} color="#03045E" label="Next steps" text={entry.nextSteps} />}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : !showForm ? (
          <div className="text-center py-8">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <div className="text-sm font-medium">No interview feedback yet</div>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              After each interview, record a debrief — what went well, what to improve, questions asked, and learnings.
            </p>
            <Button className="mt-4 bg-ocean hover:bg-ocean/90" size="sm" onClick={() => setShowForm(true)}>
              + Add first debrief
            </Button>
          </div>
        ) : null}

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 border-t border-border pt-4"
            >
              <div className="text-sm font-semibold">New interview debrief</div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Interview type">
                  <Select value={form.interviewType} onValueChange={(v) => setForm({ ...form, interviewType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {INTERVIEW_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Date">
                  <Input type="date" value={form.interviewDate} onChange={(e) => setForm({ ...form, interviewDate: e.target.value })} />
                </Field>
              </div>
              <Field label="Interviewer name (optional)">
                <Input value={form.interviewerName} onChange={(e) => setForm({ ...form, interviewerName: e.target.value })} placeholder="Sarah Chen" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <RatingInput label="Overall rating" value={form.overallRating} onChange={(v) => setForm({ ...form, overallRating: v })} color="#0077B6" />
                <RatingInput label="Difficulty" value={form.difficulty} onChange={(v) => setForm({ ...form, difficulty: v })} color="#f59e0b" />
              </div>
              <Field label="What went well?">
                <Textarea rows={2} value={form.wentWell} onChange={(e) => setForm({ ...form, wentWell: e.target.value })} placeholder="Strong answers on React performance, good rapport with interviewer…" />
              </Field>
              <Field label="What could you improve?">
                <Textarea rows={2} value={form.couldImprove} onChange={(e) => setForm({ ...form, couldImprove: e.target.value })} placeholder="Stumbled on system design question, need to practice…" />
              </Field>
              <Field label="Questions asked">
                <Textarea rows={2} value={form.questions} onChange={(e) => setForm({ ...form, questions: e.target.value })} placeholder="Design a URL shortener. Explain event loop. Walk through a recent project…" />
              </Field>
              <Field label="Key learnings">
                <Textarea rows={2} value={form.learnings} onChange={(e) => setForm({ ...form, learnings: e.target.value })} placeholder="Need to brush up on CSS specificity, review Big-O notation…" />
              </Field>
              <Field label="Next steps">
                <Textarea rows={2} value={form.nextSteps} onChange={(e) => setForm({ ...form, nextSteps: e.target.value })} placeholder="Send thank-you email, prepare for final round, research company values…" />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button className="bg-ocean hover:bg-ocean/90" size="sm" onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Save debrief
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function RatingInput({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="flex gap-1 mt-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-5 w-5 ${star <= value ? "" : "text-muted/30"}`}
              style={star <= value ? { color, fill: color } : {}}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function RatingDisplay({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= value ? "" : "text-muted/20"}`}
            style={star <= value ? { color, fill: color } : {}}
          />
        ))}
      </div>
    </div>
  );
}

function FeedbackLine({ icon: Icon, color, label, text }: { icon: typeof TrendingUp; color: string; label: string; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color }} />
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color }}>{label}: </span>
        <span className="text-xs text-foreground/80">{text}</span>
      </div>
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
