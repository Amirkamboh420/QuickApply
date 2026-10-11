"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Plus,
  Trash2,
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  Briefcase,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { AppSection } from "../app-shell";

interface SavedJob {
  id: string;
  jobTitle: string;
  company: string;
  site: string;
  siteUrl: string | null;
  location: string | null;
  salaryRange: string | null;
  description: string | null;
  notes: string | null;
  status: string;
  savedAt: string;
}

const SITES = ["LinkedIn", "Indeed", "Rozee.pk", "Mustakbil", "Bayt", "Glassdoor", "Company Site"];

const SITE_COLORS: Record<string, string> = {
  LinkedIn: "#0A66C2",
  Indeed: "#003A9B",
  "Rozee.pk": "#E84B3C",
  Mustakbil: "#0077B6",
  Bayt: "#0a3d62",
  Glassdoor: "#0CAA41",
  "Company Site": "#00B4D8",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const day = 86400000;
  if (diff < day) return "today";
  const days = Math.floor(diff / day);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function SavedJobsView({ onNavigate }: { onNavigate: (s: AppSection) => void }) {
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch("/api/saved-jobs");
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    await fetch(`/api/saved-jobs/${id}`, { method: "DELETE" });
    toast({ title: "Saved job removed" });
  };

  const handleApply = async (job: SavedJob) => {
    // Move from saved to applications
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobTitle: job.jobTitle,
        company: job.company,
        site: job.site,
        siteUrl: job.siteUrl,
        location: job.location,
        salaryRange: job.salaryRange,
        status: "applied",
        source: "From saved jobs",
      }),
    });
    // Remove from saved
    await fetch(`/api/saved-jobs/${job.id}`, { method: "DELETE" });
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
    toast({ title: "Moved to applications", description: `${job.jobTitle} at ${job.company} is now tracked.` });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            Saved Jobs
            {jobs.length > 0 && (
              <Badge variant="outline" className="border-ocean/20 text-ocean bg-ocean/5">
                {jobs.length} bookmarked
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Jobs you've bookmarked to apply to later — separate from your active applications.
          </p>
        </div>
        <Button className="bg-ocean hover:bg-ocean/90" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Save a job
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/4 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Bookmark className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <div className="font-medium text-lg">No saved jobs yet</div>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Bookmark interesting jobs to apply to later. They stay here until you're ready to apply.
              </p>
              <Button className="mt-4 bg-ocean hover:bg-ocean/90" onClick={() => setAddOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> Save your first job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence mode="popLayout">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.97 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="hover:shadow-ocean hover:border-ocean/30 transition-all">
                  <CardContent className="py-3.5 flex items-center gap-3">
                    <div
                      className="h-11 w-11 rounded-lg grid place-items-center shrink-0 text-white text-xs font-bold"
                      style={{ backgroundColor: SITE_COLORS[job.site] ?? "#0077B6" }}
                    >
                      {job.site.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold truncate">{job.jobTitle}</span>
                        <Badge variant="outline" className="bg-ocean/10 text-ocean border-ocean/20 text-[10px] py-0">
                          <Bookmark className="h-2.5 w-2.5 mr-0.5" fill="currentColor" /> Saved
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {job.company}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.site}</span>
                        {job.location && (<><span>·</span><span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span></>)}
                        <span>·</span><span>Saved {timeAgo(job.savedAt)}</span>
                      </div>
                      {job.salaryRange && (
                        <div className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> {job.salaryRange}
                        </div>
                      )}
                      {job.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{job.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button size="sm" className="bg-ocean hover:bg-ocean/90 h-8" onClick={() => handleApply(job)}>
                        <Check className="mr-1 h-3.5 w-3.5" /> Apply
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(job.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* CTA to applications */}
      {jobs.length > 0 && (
        <Card className="bg-gradient-to-br from-ocean/5 to-transparent border-ocean/20">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-ocean/10 grid place-items-center shrink-0">
              <ArrowRight className="h-4.5 w-4.5 text-ocean" />
            </div>
            <div className="text-sm flex-1">
              <div className="font-medium">Ready to apply?</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click "Apply" on any saved job to move it to your active applications tracker.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate("applications")}>
              View applications
            </Button>
          </CardContent>
        </Card>
      )}

      <AddSavedJobDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={() => { setAddOpen(false); load(); }}
      />
    </div>
  );
}

function AddSavedJobDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    jobTitle: "",
    company: "",
    site: "LinkedIn",
    location: "",
    salaryRange: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.jobTitle || !form.company) {
      toast({ title: "Title and company are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    await fetch("/api/saved-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    toast({ title: "Job saved", description: `${form.jobTitle} at ${form.company}.` });
    setForm({ jobTitle: "", company: "", site: "LinkedIn", location: "", salaryRange: "", description: "" });
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-ocean" /> Save a job
          </DialogTitle>
          <DialogDescription>Bookmark a job to apply to later.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Job title">
              <Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} placeholder="Staff Engineer" />
            </Field>
            <Field label="Company">
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Google" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Site">
              <Select value={form.site} onValueChange={(v) => setForm({ ...form, site: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SITES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Location">
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote" />
            </Field>
          </div>
          <Field label="Salary range (optional)">
            <Input value={form.salaryRange} onChange={(e) => setForm({ ...form, salaryRange: e.target.value })} placeholder="$120k-160k" />
          </Field>
          <Field label="Description (optional)">
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What makes this job interesting?" />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-ocean hover:bg-ocean/90" onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bookmark className="mr-2 h-4 w-4" />}
            Save job
          </Button>
        </DialogFooter>
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
