"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Building2,
  ExternalLink,
  Calendar,
  MapPin,
  Briefcase,
  Loader2,
  Zap,
  Clock,
  CheckCircle2,
  Wand2,
  ScanSearch,
  GitBranch,
  Mail,
  StickyNote,
  Hash,
  HandCoins,
  MessageSquare,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Application, Profile, Status, STATUS_META, timeAgo } from "@/lib/quickapply/types";
import { InterviewPrepDialog } from "./interview-prep-dialog";
import { JDAnalyzerDialog } from "./jd-analyzer-dialog";
import { StatusTimelineDialog } from "./status-timeline-dialog";
import { FollowupEmailDialog } from "./followup-email-dialog";
import { NotesEditorDialog } from "./notes-editor-dialog";
import { SalaryNegotiationDialog } from "./salary-negotiation-dialog";
import { InterviewFeedbackDialog } from "./interview-feedback-dialog";

function parseAppTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return raw.split(",").map((t) => t.trim()).filter(Boolean);
  }
}

const SITES = ["LinkedIn", "Indeed", "Rozee.pk", "Mustakbil", "Bayt", "Glassdoor", "Company Site"];
const STATUSES: Status[] = ["applied", "interview", "offer", "rejected"];

const SITE_COLORS: Record<string, string> = {
  LinkedIn: "#0A66C2",
  Indeed: "#003A9B",
  "Rozee.pk": "#E84B3C",
  Mustakbil: "#0077B6",
  Bayt: "#0a3d62",
  Glassdoor: "#0CAA41",
  "Company Site": "#00B4D8",
};

export function ApplicationsView() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [prepOpen, setPrepOpen] = useState(false);
  const [prepTarget, setPrepTarget] = useState<Application | null>(null);
  const [jdOpen, setJdOpen] = useState(false);
  const [timelineTarget, setTimelineTarget] = useState<Application | null>(null);
  const [emailTarget, setEmailTarget] = useState<Application | null>(null);
  const [notesTarget, setNotesTarget] = useState<Application | null>(null);
  const [salaryTarget, setSalaryTarget] = useState<Application | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<Application | null>(null);
  const [referralMap, setReferralMap] = useState<Record<string, { name: string; company: string | null }>>({});
  const { toast } = useToast();

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (siteFilter !== "all") params.set("site", siteFilter);
    const [apps, prof, refs] = await Promise.all([
      fetch(`/api/applications?${params}`).then((r) => r.json()),
      fetch("/api/profiles").then((r) => r.json()),
      fetch("/api/referrals").then((r) => r.json()),
    ]);
    setApplications(apps);
    setProfiles(prof);
    const rMap: Record<string, { name: string; company: string | null }> = {};
    for (const r of refs) {
      rMap[r.id] = { name: r.name, company: r.company };
    }
    setReferralMap(rMap);
    setLoading(false);
  }, [statusFilter, siteFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let result = applications;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) => a.jobTitle.toLowerCase().includes(q) || a.company.toLowerCase().includes(q),
      );
    }
    if (activeTag) {
      result = result.filter((a) => parseAppTags(a.tags).includes(activeTag));
    }
    return result;
  }, [applications, search, activeTag]);

  // Collect all unique tags for the filter bar
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const a of applications) {
      parseAppTags(a.tags).forEach((t) => set.add(t));
    }
    return Array.from(set).sort();
  }, [applications]);

  const handleStatusChange = async (id: string, status: Status) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    await fetch(`/api/applications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast({ title: "Status updated", description: `Marked as ${STATUS_META[status].label}.` });
  };

  const handleDelete = async (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    toast({ title: "Application removed" });
  };

  // Summary counts
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: applications.length };
    for (const s of STATUSES) c[s] = applications.filter((a) => a.status === s).length;
    return c;
  }, [applications]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Every job you've applied to — automatically logged by QuickApply.
          </p>
        </div>
        <Button className="bg-ocean hover:bg-ocean/90" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add application
        </Button>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        <Pill active={statusFilter === "all"} onClick={() => setStatusFilter("all")} label="All" count={counts.all} />
        {STATUSES.map((s) => (
          <Pill
            key={s}
            active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
            label={STATUS_META[s].label}
            count={counts[s] ?? 0}
            color={STATUS_META[s].color}
          />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by job title or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={siteFilter} onValueChange={setSiteFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-4 w-4 mr-1.5" />
            <SelectValue placeholder="All sites" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sites</SelectItem>
            {SITES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tag filter bar */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
            <Hash className="h-3 w-3" /> Tags:
          </span>
          <button
            onClick={() => setActiveTag(null)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
              !activeTag
                ? "bg-ocean text-white border-ocean"
                : "bg-background border-border text-foreground/70 hover:border-ocean/40"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                activeTag === tag
                  ? "bg-ocean text-white border-ocean"
                  : "bg-background border-border text-foreground/70 hover:border-ocean/40"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
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
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <div className="font-medium">No applications yet</div>
              <p className="text-sm text-muted-foreground mt-1">
                Apply to a job with QuickApply and it'll show up here automatically.
              </p>
              <Button className="mt-4 bg-ocean hover:bg-ocean/90" onClick={() => setAddOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> Add manually
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((app, i) => {
              const meta = STATUS_META[app.status];
              return (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                >
                  <Card className="hover:shadow-ocean hover:border-ocean/30 transition-all">
                    <CardContent className="py-3.5 flex items-center gap-3">
                      <div
                        className="h-11 w-11 rounded-lg grid place-items-center shrink-0 text-white text-xs font-bold"
                        style={{ backgroundColor: SITE_COLORS[app.site] ?? "#0077B6" }}
                      >
                        {app.site.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold truncate">{app.jobTitle}</span>
                          <Badge className={`${meta.bg} ${meta.text} border-transparent text-[10px] py-0`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} mr-1`} />
                            {meta.label}
                          </Badge>
                          {app.notes && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-[10px] py-0" title={app.notes}>
                              <StickyNote className="h-2.5 w-2.5 mr-0.5" /> Note
                            </Badge>
                          )}
                          {app.referralId && referralMap[app.referralId] && (
                            <Badge variant="outline" className="bg-sky/10 text-ocean border-sky/20 text-[10px] py-0" title={`Referred by ${referralMap[app.referralId].name}`}>
                              <Users className="h-2.5 w-2.5 mr-0.5" /> {referralMap[app.referralId].name.split(" ")[0]}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {app.company}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {app.site}</span>
                          {app.location && (<><span>·</span><span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {app.location}</span></>)}
                          <span>·</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {timeAgo(app.appliedAt)}</span>
                        </div>
                        {/* Tags display */}
                        {parseAppTags(app.tags).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {parseAppTags(app.tags).slice(0, 4).map((tag) => (
                              <button
                                key={tag}
                                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                                className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                                  activeTag === tag
                                    ? "bg-ocean text-white border-ocean"
                                    : "bg-secondary/60 text-muted-foreground border-border hover:border-ocean/40"
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                            {parseAppTags(app.tags).length > 4 && (
                              <span className="text-[9px] text-muted-foreground">+{parseAppTags(app.tags).length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {app.salaryRange && (
                        <div className="hidden md:block text-right">
                          <div className="text-xs text-muted-foreground">Salary</div>
                          <div className="text-sm font-medium">{app.salaryRange}</div>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        {app.source === "QuickApply Extension" && (
                          <Badge variant="outline" className="bg-ocean/10 text-ocean border-ocean/20 text-[10px] hidden sm:flex">
                            <Zap className="h-2.5 w-2.5 mr-0.5" fill="currentColor" /> Auto-filled
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 hidden sm:flex text-sky hover:bg-sky/10"
                          onClick={() => setJdOpen(true)}
                        >
                          <ScanSearch className="h-3.5 w-3.5 mr-1" /> Analyze
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 hidden sm:flex text-ocean hover:bg-ocean/10"
                          onClick={() => {
                            setPrepTarget(app);
                            setPrepOpen(true);
                          }}
                        >
                          <Wand2 className="h-3.5 w-3.5 mr-1" /> Prep
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              {meta.label} <svg className="ml-1 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => { setPrepTarget(app); setPrepOpen(true); }}>
                              <Wand2 className="mr-2 h-3.5 w-3.5 text-ocean" /> Interview prep (AI)
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setJdOpen(true)}>
                              <ScanSearch className="mr-2 h-3.5 w-3.5 text-sky" /> Analyze JD (AI)
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setEmailTarget(app)}>
                              <Mail className="mr-2 h-3.5 w-3.5 text-ocean" /> Write follow-up email (AI)
                            </DropdownMenuItem>
                            {app.salaryRange && (
                              <DropdownMenuItem onSelect={() => setSalaryTarget(app)}>
                                <HandCoins className="mr-2 h-3.5 w-3.5 text-emerald-600" /> Negotiate salary (AI)
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onSelect={() => setTimelineTarget(app)}>
                              <GitBranch className="mr-2 h-3.5 w-3.5 text-ocean" /> View timeline
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setFeedbackTarget(app)}>
                              <MessageSquare className="mr-2 h-3.5 w-3.5 text-sky" /> Interview feedback
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setNotesTarget(app)}>
                              <StickyNote className="mr-2 h-3.5 w-3.5 text-amber-600" /> Notes & tags
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {STATUSES.map((s) => (
                              <DropdownMenuItem key={s} onSelect={() => handleStatusChange(app.id, s)}>
                                <span className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: STATUS_META[s].color }} />
                                Mark as {STATUS_META[s].label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onSelect={() => handleDelete(app.id)}>
                              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <AddApplicationDialog
        open={addOpen}
        profiles={profiles}
        onClose={() => setAddOpen(false)}
        onAdded={() => {
          setAddOpen(false);
          load();
        }}
      />

      <InterviewPrepDialog
        open={prepOpen}
        onClose={() => {
          setPrepOpen(false);
          setPrepTarget(null);
        }}
        defaultRole={prepTarget?.jobTitle}
        defaultCompany={prepTarget?.company}
      />

      <JDAnalyzerDialog open={jdOpen} onClose={() => setJdOpen(false)} />

      <StatusTimelineDialog
        open={!!timelineTarget}
        onClose={() => setTimelineTarget(null)}
        application={timelineTarget}
      />

      <FollowupEmailDialog
        open={!!emailTarget}
        onClose={() => setEmailTarget(null)}
        application={emailTarget}
      />

      <NotesEditorDialog
        open={!!notesTarget}
        onClose={() => setNotesTarget(null)}
        application={notesTarget}
        onSaved={load}
      />

      <SalaryNegotiationDialog
        open={!!salaryTarget}
        onClose={() => setSalaryTarget(null)}
        application={salaryTarget}
      />

      <InterviewFeedbackDialog
        open={!!feedbackTarget}
        onClose={() => setFeedbackTarget(null)}
        application={feedbackTarget}
      />
    </div>
  );
}

function Pill({ active, onClick, label, count, color }: { active: boolean; onClick: () => void; label: string; count: number; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all border ${
        active
          ? "bg-ocean text-white border-ocean shadow-ocean"
          : "bg-background border-border text-foreground/70 hover:border-ocean/40 hover:text-foreground"
      }`}
    >
      {color && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />}
      {label}
      <span className={`text-xs ${active ? "text-white/70" : "text-muted-foreground"}`}>{count}</span>
    </button>
  );
}

function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-border" />;
}

function AddApplicationDialog({
  open,
  profiles,
  onClose,
  onAdded,
}: {
  open: boolean;
  profiles: Profile[];
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
    status: "applied" as Status,
    profileId: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.jobTitle || !form.company) {
      toast({ title: "Title and company are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, source: "manual" }),
    });
    setSaving(false);
    toast({ title: "Application added", description: `${form.jobTitle} at ${form.company}.` });
    setForm({ jobTitle: "", company: "", site: "LinkedIn", location: "", salaryRange: "", status: "applied", profileId: "" });
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log an application</DialogTitle>
          <DialogDescription>Manually add an application to your tracker.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Job title">
              <Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} placeholder="Senior Frontend Engineer" />
            </Field>
            <Field label="Company">
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Careem" />
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
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location">
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Lahore" />
            </Field>
            <Field label="Salary range">
              <Input value={form.salaryRange} onChange={(e) => setForm({ ...form, salaryRange: e.target.value })} placeholder="PKR 350k-450k" />
            </Field>
          </div>
          <Field label="Profile used">
            <Select value={form.profileId} onValueChange={(v) => setForm({ ...form, profileId: v })}>
              <SelectTrigger><SelectValue placeholder="Select a profile" /></SelectTrigger>
              <SelectContent>
                {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-ocean hover:bg-ocean/90" onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Add application
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
