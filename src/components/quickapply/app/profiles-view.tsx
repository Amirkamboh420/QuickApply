"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Upload,
  Sparkles,
  Pencil,
  Trash2,
  Check,
  X,
  Star,
  FileText,
  Loader2,
  Wand2,
  Target,
  Copy,
  Award,
  Circle,
  AlertCircle,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Profile, Education, Experience, parseJSON } from "@/lib/quickapply/types";

export function ProfilesView() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [creating, setCreating] = useState(false);
  const [parseOpen, setParseOpen] = useState(false);
  const [tailorOpen, setTailorOpen] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch("/api/profiles");
    const data = await res.json();
    setProfiles(data.map(normalizeProfile));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/profiles/${id}`, { method: "DELETE" });
    toast({ title: "Profile deleted", description: "The profile has been removed." });
    load();
  };

  const handleSetDefault = async (p: Profile) => {
    await fetch(`/api/profiles/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, isDefault: true }),
    });
    // unset others
    for (const other of profiles.filter((x) => x.id !== p.id && x.isDefault)) {
      await fetch(`/api/profiles/${other.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...other, isDefault: false }),
      });
    }
    toast({ title: "Default profile updated", description: `${p.name} is now your default.` });
    load();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Resume Profiles</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Maintain different profiles for different roles. QuickApply uses your default profile for one-click fills.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setParseOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Parse resume
          </Button>
          <Button className="bg-ocean hover:bg-ocean/90" onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" /> New profile
          </Button>
        </div>
      </div>

      {/* Completeness checklist */}
      {!loading && profiles.length > 0 && (
        <CompletenessChecklist profiles={profiles} onEdit={(p) => { setEditing(p); }} />
      )}

      {/* Profiles grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-3">
                  <div className="h-5 w-1/3 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  <div className="h-16 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))
          : profiles.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className={`h-full ${p.isDefault ? "border-ocean ring-2 ring-ocean/15" : "border-border"} hover:shadow-ocean transition-all`}>
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold truncate">{p.name}</h3>
                          {p.isDefault && (
                            <Badge className="bg-ocean text-white border-ocean">
                              <Star className="h-3 w-3 mr-0.5" fill="white" /> Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">{p.fullName} · {p.headline}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(p)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Progress value={p.completeness} className="h-2 flex-1" />
                      <span className="text-xs font-medium text-muted-foreground">{p.completeness}%</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.skills.slice(0, 5).map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px] bg-secondary/60 border-border">
                          {s}
                        </Badge>
                      ))}
                      {p.skills.length > 5 && (
                        <Badge variant="outline" className="text-[10px] bg-secondary/60">
                          +{p.skills.length - 5}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <Info label="Email" value={p.email} />
                      <Info label="Phone" value={p.phone} />
                      <Info label="Location" value={p.location} />
                      <Info label="Resume" value={p.resumeName ?? "—"} />
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(p)}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setTailorOpen(true);
                          setEditing(p);
                        }}
                      >
                        <Wand2 className="mr-1.5 h-3.5 w-3.5" /> AI Tailor
                      </Button>
                      {!p.isDefault && (
                        <Button size="sm" className="bg-ocean hover:bg-ocean/90" onClick={() => handleSetDefault(p)}>
                          <Check className="mr-1 h-3.5 w-3.5" /> Set default
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* Edit / create dialog */}
      <EditProfileDialog
        open={!!editing || creating}
        profile={editing}
        creating={creating}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSaved={() => {
          setEditing(null);
          setCreating(false);
          load();
        }}
      />

      {/* Parse dialog */}
      <ParseResumeDialog
        open={parseOpen}
        onClose={() => setParseOpen(false)}
        onParsed={() => {
          setParseOpen(false);
          load();
        }}
      />

      {/* Tailor dialog */}
      <TailorDialog open={tailorOpen} profile={editing} onClose={() => setTailorOpen(false)} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-foreground truncate font-medium">{value}</div>
    </div>
  );
}

function normalizeProfile(p: Profile): Profile {
  return {
    ...p,
    education: parseJSON(p.education as unknown as string, []),
    experience: parseJSON(p.experience as unknown as string, []),
    skills: parseJSON(p.skills as unknown as string, []),
    links: parseJSON(p.links as unknown as string, {}),
  };
}

function EditProfileDialog({
  open,
  profile,
  creating,
  onClose,
  onSaved,
}: {
  open: boolean;
  profile: Profile | null;
  creating: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<Profile | null>(profile);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(profile ? normalizeProfile(profile) : emptyProfile());
  }, [profile, open]);

  if (!form) return null;

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const save = async () => {
    setSaving(true);
    const completeness = computeCompleteness(form);
    const payload = { ...form, completeness };
    const url = creating ? "/api/profiles" : `/api/profiles/${form.id}`;
    const method = creating ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast({
        title: creating ? "Profile created" : "Profile updated",
        description: `${form.name} is saved.`,
      });
      onSaved();
    } else {
      toast({ title: "Save failed", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{creating ? "Create profile" : `Edit · ${form.name}`}</DialogTitle>
          <DialogDescription>
            This data is what QuickApply fills into job application forms.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="basic">Basics</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="skills">Skills & Links</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Profile name">
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
              </Field>
              <Field label="Full name">
                <Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </Field>
              <Field label="Location">
                <Input value={form.location} onChange={(e) => update("location", e.target.value)} />
              </Field>
              <Field label="Headline">
                <Input value={form.headline} onChange={(e) => update("headline", e.target.value)} />
              </Field>
            </div>
            <Field label="Summary">
              <Textarea rows={4} value={form.summary} onChange={(e) => update("summary", e.target.value)} />
            </Field>
            <Field label="Resume file name">
              <Input value={form.resumeName ?? ""} onChange={(e) => update("resumeName", e.target.value)} placeholder="Ayesha_Khan_SWE.pdf" />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => update("isDefault", e.target.checked)}
                className="rounded"
              />
              Set as default profile
            </label>
          </TabsContent>

          <TabsContent value="experience" className="space-y-3 mt-4">
            {form.experience.map((exp, i) => (
              <Card key={i}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Experience {i + 1}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => {
                      const next = [...form.experience];
                      next.splice(i, 1);
                      update("experience", next);
                    }}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2">
                    <Input placeholder="Role" value={exp.role} onChange={(e) => updateExp(form, setForm, i, { role: e.target.value })} />
                    <Input placeholder="Company" value={exp.company} onChange={(e) => updateExp(form, setForm, i, { company: e.target.value })} />
                    <Input placeholder="Period" value={exp.period} onChange={(e) => updateExp(form, setForm, i, { period: e.target.value })} />
                  </div>
                  <Textarea
                    rows={2}
                    placeholder="Achievements (one per line)"
                    value={exp.points.join("\n")}
                    onChange={(e) => updateExp(form, setForm, i, { points: e.target.value.split("\n").filter(Boolean) })}
                  />
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" size="sm" onClick={() => update("experience", [...form.experience, { role: "", company: "", period: "", points: [] }])}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add experience
            </Button>
          </TabsContent>

          <TabsContent value="education" className="space-y-3 mt-4">
            {form.education.map((edu, i) => (
              <Card key={i}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Education {i + 1}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => {
                      const next = [...form.education];
                      next.splice(i, 1);
                      update("education", next);
                    }}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateEdu(form, setForm, i, { degree: e.target.value })} />
                    <Input placeholder="Institute" value={edu.institute} onChange={(e) => updateEdu(form, setForm, i, { institute: e.target.value })} />
                    <Input placeholder="Year" value={edu.year} onChange={(e) => updateEdu(form, setForm, i, { year: e.target.value })} />
                    <Input placeholder="Grade" value={edu.grade} onChange={(e) => updateEdu(form, setForm, i, { grade: e.target.value })} />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" size="sm" onClick={() => update("education", [...form.education, { degree: "", institute: "", year: "", grade: "" }])}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add education
            </Button>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4 mt-4">
            <Field label="Skills (comma separated)">
              <Textarea
                rows={3}
                value={form.skills.join(", ")}
                onChange={(e) => update("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              />
            </Field>
            <div className="grid sm:grid-cols-3 gap-2">
              <Field label="LinkedIn">
                <Input value={form.links.linkedin ?? ""} onChange={(e) => update("links", { ...form.links, linkedin: e.target.value })} />
              </Field>
              <Field label="GitHub">
                <Input value={form.links.github ?? ""} onChange={(e) => update("links", { ...form.links, github: e.target.value })} />
              </Field>
              <Field label="Portfolio">
                <Input value={form.links.portfolio ?? ""} onChange={(e) => update("links", { ...form.links, portfolio: e.target.value })} />
              </Field>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-ocean hover:bg-ocean/90" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {creating ? "Create profile" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ParseResumeDialog({
  open,
  onClose,
  onParsed,
}: {
  open: boolean;
  onClose: () => void;
  onParsed: () => void;
}) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<Partial<Profile> | null>(null);

  const sample = `Ayesha Khan
Senior Software Engineer | Lahore, Pakistan
ayesha.khan@example.com | +92 300 1234567 | linkedin.com/in/ayesha

SUMMARY
Full-stack engineer with 5+ years building scalable web apps using React, Node.js and PostgreSQL. Led teams of 4-6 engineers.

EXPERIENCE
Senior Software Engineer - Systems Ltd (2022-Present)
- Led migration to Next.js 14
- Reduced bundle size 38%

Software Engineer - Devsinc (2020-2022)
- Built internal dashboards

EDUCATION
BSc Computer Science - LUMS (2016-2020), 3.8 GPA

SKILLS
React, Next.js, TypeScript, Node.js, PostgreSQL, AWS, Tailwind`;

  const parse = async () => {
    setParsing(true);
    try {
      const res = await fetch("/api/demo/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text }),
      });
      const data = await res.json();
      setResult(data);
      toast({ title: "Resume parsed", description: "Review the extracted data below." });
    } catch {
      toast({ title: "Parsing failed", variant: "destructive" });
    }
    setParsing(false);
  };

  const saveParsed = async () => {
    if (!result) return;
    await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...result, name: `${result.fullName ?? "New"} — parsed` }),
    });
    toast({ title: "Profile created from resume", description: "Review and edit anytime." });
    setResult(null);
    setText("");
    onParsed();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-ocean" /> AI Resume Parser
          </DialogTitle>
          <DialogDescription>
            Paste your resume text (or use the sample) and QuickApply's AI extracts structured data.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-3">
            <Textarea
              rows={10}
              placeholder="Paste your resume text here…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="font-mono text-xs"
            />
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setText(sample)}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Use sample resume
              </Button>
              <Button className="bg-ocean hover:bg-ocean/90" onClick={parse} disabled={parsing || !text.trim()}>
                {parsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Parse with AI
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-emerald-400/40 bg-emerald-50/60 dark:bg-emerald-500/5 p-3 text-sm">
              <Check className="inline h-4 w-4 text-emerald-600 mr-1.5" />
              Parsed successfully — review before saving.
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <KV k="Name" v={result.fullName} />
              <KV k="Email" v={result.email} />
              <KV k="Phone" v={result.phone} />
              <KV k="Location" v={result.location} />
            </div>
            <div className="text-sm">
              <div className="text-xs font-semibold text-muted-foreground mb-1">Summary</div>
              <div className="rounded-lg bg-secondary/50 p-3">{result.summary}</div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.skills?.map((s) => (
                <Badge key={s} variant="outline" className="bg-secondary/60">{s}</Badge>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setResult(null)}>Re-parse</Button>
              <Button className="bg-ocean hover:bg-ocean/90" onClick={saveParsed}>
                <Check className="mr-1.5 h-4 w-4" /> Save as new profile
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TailorDialog({
  open,
  profile,
  onClose,
}: {
  open: boolean;
  profile: Profile | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ tailoredSummary: string; missingSkills: string[]; matchScore: number; suggestedKeywords: string[] } | null>(null);

  const tailor = async () => {
    if (!profile || !jd.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/demo/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jd, profile }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      toast({ title: "Tailoring failed", variant: "destructive" });
    }
    setLoading(false);
  };

  const apply = async () => {
    if (!profile || !result) return;
    await fetch(`/api/profiles/${profile.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, summary: result.tailoredSummary }),
    });
    toast({ title: "Summary updated", description: "Your tailored summary is now saved." });
    onClose();
    setResult(null);
    setJd("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-ocean" /> AI Resume Tailor
          </DialogTitle>
          <DialogDescription>
            Paste a job description. QuickApply scores the match and rewrites your summary.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-3">
            <Textarea
              rows={8}
              placeholder="Paste the job description here…"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              className="text-sm"
            />
            <div className="flex justify-end">
              <Button className="bg-ocean hover:bg-ocean/90" onClick={tailor} disabled={loading || !jd.trim()}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Tailor my summary
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border p-3 text-center">
                <div className="text-2xl font-bold text-ocean">{result.matchScore}%</div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">Match score</div>
              </div>
              <div className="rounded-xl border border-border p-3">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Missing skills</div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {result.missingSkills.length ? result.missingSkills.map((s) => (
                    <Badge key={s} variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/20">{s}</Badge>
                  )) : <span className="text-xs text-muted-foreground">None — great fit!</span>}
                </div>
              </div>
              <div className="rounded-xl border border-border p-3">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Keywords</div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {result.suggestedKeywords.slice(0, 3).map((s) => (
                    <Badge key={s} variant="outline" className="text-[10px] bg-sky/10 text-ocean border-sky/20">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" /> Tailored summary
              </div>
              <div className="rounded-lg bg-secondary/50 p-4 text-sm leading-relaxed">{result.tailoredSummary}</div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setResult(null)}>Re-run</Button>
              <Button className="bg-ocean hover:bg-ocean/90" onClick={apply}>
                <Check className="mr-1.5 h-4 w-4" /> Apply to profile
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

function KV({ k, v }: { k: string; v?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</div>
      <div className="font-medium truncate">{v || "—"}</div>
    </div>
  );
}

function emptyProfile(): Profile {
  return {
    id: "",
    name: "",
    fullName: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    summary: "",
    education: [],
    experience: [],
    skills: [],
    links: {},
    resumeName: null,
    completeness: 0,
    isDefault: false,
    createdAt: new Date().toISOString(),
  };
}

function updateExp(form: Profile, setForm: (f: Profile) => void, i: number, patch: Partial<Experience>) {
  const next = [...form.experience];
  next[i] = { ...next[i], ...patch };
  setForm({ ...form, experience: next });
}

function updateEdu(form: Profile, setForm: (f: Profile) => void, i: number, patch: Partial<Education>) {
  const next = [...form.education];
  next[i] = { ...next[i], ...patch };
  setForm({ ...form, education: next });
}

function computeCompleteness(p: Profile): number {
  let score = 0;
  if (p.fullName) score += 10;
  if (p.email) score += 10;
  if (p.phone) score += 10;
  if (p.location) score += 8;
  if (p.headline) score += 10;
  if (p.summary && p.summary.length > 50) score += 15;
  if (p.experience.length) score += 15;
  if (p.education.length) score += 10;
  if (p.skills.length >= 3) score += 8;
  if (p.resumeName) score += 4;
  return Math.min(100, score);
}

function CompletenessChecklist({ profiles, onEdit }: { profiles: Profile[]; onEdit: (p: Profile) => void }) {
  const defaultProfile = profiles.find((p) => p.isDefault) ?? profiles[0];
  if (!defaultProfile) return null;

  const checks = [
    { label: "Full name", done: !!defaultProfile.fullName, weight: 10 },
    { label: "Email address", done: !!defaultProfile.email, weight: 10 },
    { label: "Phone number", done: !!defaultProfile.phone, weight: 10 },
    { label: "Location", done: !!defaultProfile.location, weight: 8 },
    { label: "Professional headline", done: !!defaultProfile.headline, weight: 10 },
    { label: "Summary (50+ chars)", done: (defaultProfile.summary ?? "").length > 50, weight: 15 },
    { label: "At least 1 work experience", done: defaultProfile.experience.length > 0, weight: 15 },
    { label: "At least 1 education entry", done: defaultProfile.education.length > 0, weight: 10 },
    { label: "3+ skills", done: defaultProfile.skills.length >= 3, weight: 8 },
    { label: "Resume file attached", done: !!defaultProfile.resumeName, weight: 4 },
  ];

  const completed = checks.filter((c) => c.done).length;
  const pct = defaultProfile.completeness;
  const remaining = checks.filter((c) => !c.done);

  return (
    <Card className="border-ocean/20 bg-gradient-to-br from-ocean/5 via-sky/5 to-transparent">
      <CardContent className="pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-secondary" />
                <motion.circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="#0077B6"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - pct / 100) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <span className="text-sm font-bold text-ocean">{pct}%</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Profile completeness</h3>
                <Badge className="bg-ocean/10 text-ocean border-ocean/20 text-[10px]">
                  <Award className="h-2.5 w-2.5 mr-0.5" />
                  {completed}/{checks.length} done
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pct === 100
                  ? "Perfect! Your default profile is fully complete."
                  : `Complete ${remaining.length} more item${remaining.length > 1 ? "s" : ""} to reach 100% — better profiles get more responses.`}
              </p>
            </div>
          </div>

          <div className="sm:ml-auto flex flex-wrap gap-1.5 max-w-md">
            {checks.map((c) => (
              <div
                key={c.label}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                  c.done
                    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                    : "bg-secondary text-muted-foreground border-border"
                }`}
                title={`${c.label} (${c.weight}%)`}
              >
                {c.done ? <Check className="h-2.5 w-2.5" /> : <Circle className="h-2.5 w-2.5" />}
                {c.label}
              </div>
            ))}
          </div>

          {pct < 100 && (
            <Button size="sm" className="bg-ocean hover:bg-ocean/90 shrink-0" onClick={() => onEdit(defaultProfile)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Complete profile
            </Button>
          )}
        </div>

        {pct < 100 && remaining.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Next step:</span> Add{" "}
              <span className="text-ocean font-medium">{remaining[0].label.toLowerCase()}</span> to your default profile
              "{defaultProfile.name}" to boost completeness by {remaining[0].weight}%.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
