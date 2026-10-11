"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  ArrowLeft,
  Search,
  UserPlus,
  Users,
  UserCircle2,
  Pause,
  Play,
  Trash2,
  MoreVertical,
  Eye,
  Pencil,
  Check,
  Clock,
  Mail,
  Briefcase,
  Send,
  FileText,
  Sparkles,
  Loader2,
  Activity,
  GraduationCap,
  Award,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/quickapply/auth-context";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

interface CoachClient {
  id: string;
  coachId: string;
  clientEmail: string;
  clientName: string;
  clientRole: string;
  notes: string | null;
  status: string;
  lastActivity: string | null;
  createdAt: string;
  updatedAt: string;
}

const COACH_ID = "demo-coach";

const ROLE_OPTIONS = [
  "Software Engineer",
  "Designer",
  "Product Manager",
  "Data Analyst",
  "DevOps",
  "Marketing",
] as const;

type RoleOption = (typeof ROLE_OPTIONS)[number];

interface SharedTemplate {
  id: string;
  title: string;
  tone: string;
  toneColor: string;
  description: string;
  snippet: string;
}

const SHARED_TEMPLATES: SharedTemplate[] = [
  {
    id: "tpl-confident-opener",
    title: "The Confident Opener",
    tone: "Professional",
    toneColor: "#0077B6",
    description:
      "A polished, no-nonsense intro that leads with impact and quantified wins.",
    snippet:
      "I'm a senior engineer who shipped a 40% faster checkout flow at scale — I'd love to bring that velocity to your team.",
  },
  {
    id: "tpl-storyteller",
    title: "The Storyteller",
    tone: "Energetic",
    toneColor: "#00B4D8",
    description:
      "A narrative-driven letter that hooks the reader with a 1-paragraph story.",
    snippet:
      "Three years ago I built a side project that hit 10k users — that's when I fell in love with growth.",
  },
  {
    id: "tpl-concise-closer",
    title: "The Concise Closer",
    tone: "Concise",
    toneColor: "#03045E",
    description:
      "A 120-word letter for busy recruiters — straight to the why-you-should-call-me.",
    snippet:
      "In one sentence: I ship product, mentor juniors, and care about craft. Let's talk.",
  },
];

type StatusFilter = "all" | "active" | "paused";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function statusBadgeClass(status: string): string {
  if (status === "paused") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
}

function statusDotClass(status: string): string {
  return status === "paused" ? "bg-amber-500" : "bg-emerald-500";
}

function formatRelativeDate(iso: string): string {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  } catch {
    return "—";
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CoachDashboard({ onExit }: { onExit: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [clients, setClients] = useState<CoachClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [addOpen, setAddOpen] = useState(false);
  const [detailClient, setDetailClient] = useState<CoachClient | null>(null);
  const [editNotesClient, setEditNotesClient] = useState<CoachClient | null>(null);

  const coachName = user?.name ?? "Career Coach";
  const coachInitials = getInitials(coachName);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/coach-clients?coachId=${COACH_ID}`);
      const data: CoachClient[] = await res.json();
      setClients(data);
    } catch {
      toast({ title: "Failed to load clients", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.status === "active").length;
    const paused = clients.filter((c) => c.status === "paused").length;
    const recent = clients.filter((c) => {
      const la = c.lastActivity ?? "";
      return /yesterday|days/i.test(la);
    }).length;
    return { total, active, paused, recent };
  }, [clients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.clientName.toLowerCase().includes(q) ||
        c.clientRole.toLowerCase().includes(q)
      );
    });
  }, [clients, search, statusFilter]);

  const handleToggleStatus = useCallback(
    async (c: CoachClient) => {
      const next = c.status === "paused" ? "active" : "paused";
      // Optimistic update
      setClients((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, status: next } : x)),
      );
      try {
        await fetch(`/api/coach-clients/${c.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        });
        toast({
          title: next === "paused" ? "Client paused" : "Client resumed",
          description: c.clientName,
        });
      } catch {
        toast({ title: "Update failed", variant: "destructive" });
        // Rollback
        setClients((prev) =>
          prev.map((x) => (x.id === c.id ? { ...x, status: c.status } : x)),
        );
      }
    },
    [toast],
  );

  const handleRemove = useCallback(
    async (c: CoachClient) => {
      setClients((prev) => prev.filter((x) => x.id !== c.id));
      try {
        await fetch(`/api/coach-clients/${c.id}`, { method: "DELETE" });
        toast({ title: "Client removed", description: c.clientName });
      } catch {
        toast({ title: "Delete failed", variant: "destructive" });
        load();
      }
    },
    [toast, load],
  );

  const statsCards = [
    {
      label: "Total clients",
      value: stats.total,
      icon: Users,
      color: "#0077B6",
      bg: "bg-ocean/10",
    },
    {
      label: "Active",
      value: stats.active,
      icon: UserCircle2,
      color: "#10b981",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Paused",
      value: stats.paused,
      icon: Pause,
      color: "#f59e0b",
      bg: "bg-amber-500/10",
    },
    {
      label: "Recent activity",
      value: stats.recent,
      icon: Activity,
      color: "#00B4D8",
      bg: "bg-sky/10",
    },
  ];

  const statusPills: { id: StatusFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: stats.total },
    { id: "active", label: "Active", count: stats.active },
    { id: "paused", label: "Paused", count: stats.paused },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-mesh-ocean">
      {/* -------------------------------------------------------------- */}
      {/* Top bar                                                        */}
      {/* -------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 glass-card border-b border-border">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-ink via-ocean to-sky grid place-items-center shadow-ocean">
              <Zap className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-foreground hidden sm:block">
              Quick<span className="text-ocean">Apply</span>
            </span>
            <Badge className="ml-1 bg-ocean/10 text-ocean border-ocean/20 hidden sm:flex">
              <GraduationCap className="h-3 w-3 mr-0.5" /> Career Coach
            </Badge>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={onExit}
              className="hidden sm:flex"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to site
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg pl-1.5 pr-2 py-1 hover:bg-secondary transition-colors">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-ocean to-sky grid place-items-center text-white text-xs font-bold">
                    {coachInitials}
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-xs font-medium text-foreground">
                      {coachName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Career Coach
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5">
                  <div className="text-sm font-medium">{coachName}</div>
                  <div className="text-xs text-muted-foreground">
                    {user?.email ?? "coach@quickapply.com"}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onExit}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to site
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------- */}
      {/* Main content                                                   */}
      {/* -------------------------------------------------------------- */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient-ocean">
              Career Coach Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage your clients, review their applications, and assign
              reusable cover-letter templates.
            </p>
          </div>
          <Button
            className="bg-ocean hover:bg-ocean/90"
            onClick={() => setAddOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" /> Add client
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="hover:shadow-ocean transition-shadow">
                <CardContent className="p-4">
                  <div
                    className={`h-10 w-10 rounded-xl ${s.bg} grid place-items-center mb-3`}
                  >
                    <s.icon className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                  {loading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    <div className="text-2xl font-bold">{s.value}</div>
                  )}
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Client list header: search + pills */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-ocean" /> Your clients
                </CardTitle>
                <CardDescription className="mt-1">
                  {loading
                    ? "Loading…"
                    : `${filtered.length} of ${clients.length} shown`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search name or role…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            {/* Status filter pills */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {statusPills.map((p) => {
                const active = statusFilter === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setStatusFilter(p.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                      active
                        ? "bg-ocean text-white border-ocean shadow-ocean"
                        : "bg-background text-muted-foreground border-border hover:border-ocean/40 hover:text-ocean"
                    }`}
                  >
                    {p.label}
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {p.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {/* Client list */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border"
                  >
                    <Skeleton className="h-11 w-11 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-14 text-center">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-ocean/10 grid place-items-center mb-3">
                  <Users className="h-7 w-7 text-ocean" />
                </div>
                <div className="font-medium text-lg">
                  {clients.length === 0
                    ? "No clients yet"
                    : "No clients match your filters"}
                </div>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  {clients.length === 0
                    ? "Add your first client to start reviewing their applications and assigning templates."
                    : "Try clearing the search or switching the status filter."}
                </p>
                {clients.length === 0 && (
                  <Button
                    className="mt-4 bg-ocean hover:bg-ocean/90"
                    onClick={() => setAddOpen(true)}
                  >
                    <UserPlus className="mr-1.5 h-4 w-4" /> Add your first client
                  </Button>
                )}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto scrollbar-thin space-y-2 pr-1">
                <AnimatePresence mode="popLayout" initial={false}>
                  {filtered.map((c, i) => (
                    <motion.div
                      key={c.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: Math.min(i * 0.03, 0.2) }}
                      className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-ocean/40 hover:shadow-ocean transition-all"
                    >
                      {/* Avatar */}
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-ocean to-sky grid place-items-center text-white font-bold shrink-0">
                        {getInitials(c.clientName)}
                      </div>

                      {/* Main info */}
                      <button
                        onClick={() => setDetailClient(c)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold truncate">
                            {c.clientName}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${statusBadgeClass(
                              c.status,
                            )}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusDotClass(
                                c.status,
                              )}`}
                            />
                            {c.status === "paused" ? "Paused" : "Active"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {c.clientRole}
                          </span>
                          {c.lastActivity && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {c.lastActivity}
                            </span>
                          )}
                        </div>
                        {c.notes && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {c.notes}
                          </p>
                        )}
                      </button>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hidden sm:flex"
                          onClick={() => setDetailClient(c)}
                        >
                          <Eye className="h-4 w-4 mr-1.5" /> View details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              aria-label="Client actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onSelect={() => setDetailClient(c)}
                            >
                              <Eye className="mr-2 h-4 w-4" /> View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => setEditNotesClient(c)}
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Edit notes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => handleToggleStatus(c)}
                            >
                              {c.status === "paused" ? (
                                <>
                                  <Play className="mr-2 h-4 w-4" /> Resume client
                                </>
                              ) : (
                                <>
                                  <Pause className="mr-2 h-4 w-4" /> Pause client
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => handleRemove(c)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Remove client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shared templates section */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-sky" /> Shared cover letter
                  templates
                </CardTitle>
                <CardDescription className="mt-1">
                  Reusable templates you can assign to any of your clients.
                  QuickApply fills in profile details automatically.
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="border-sky/30 text-sky bg-sky/5 shrink-0"
              >
                <Sparkles className="h-3 w-3 mr-0.5" /> {SHARED_TEMPLATES.length}{" "}
                templates
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4">
            {SHARED_TEMPLATES.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full hover:shadow-ocean transition-all group">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <FileText
                        className="h-5 w-5 text-ocean"
                        style={{ color: t.toneColor }}
                      />
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{
                          color: t.toneColor,
                          borderColor: `${t.toneColor}40`,
                          backgroundColor: `${t.toneColor}10`,
                        }}
                      >
                        {t.tone}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm">{t.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 flex-1">
                      {t.description}
                    </p>
                    <blockquote className="mt-3 text-xs italic text-foreground/70 border-l-2 border-sky/40 pl-2 line-clamp-3">
                      &ldquo;{t.snippet}&rdquo;
                    </blockquote>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full group-hover:bg-ocean group-hover:text-white group-hover:border-ocean transition-colors"
                      onClick={() =>
                        toast({
                          title: "Template ready to assign",
                          description: `Pick a client to assign "${t.title}" in a future multi-tenant flow.`,
                        })
                      }
                    >
                      <Send className="mr-1.5 h-3.5 w-3.5" /> Assign to client
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </main>

      {/* -------------------------------------------------------------- */}
      {/* Dialogs                                                        */}
      {/* -------------------------------------------------------------- */}
      <AddClientDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          setAddOpen(false);
          load();
        }}
      />

      <ClientDetailDialog
        client={detailClient}
        onClose={() => setDetailClient(null)}
        onEditNotes={(c) => {
          setDetailClient(null);
          setEditNotesClient(c);
        }}
        onToast={toast}
      />

      <EditNotesDialog
        client={editNotesClient}
        onClose={() => setEditNotesClient(null)}
        onSaved={(updated) => {
          setEditNotesClient(null);
          setClients((prev) =>
            prev.map((x) => (x.id === updated.id ? updated : x)),
          );
          if (detailClient?.id === updated.id) setDetailClient(updated);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add client dialog
// ---------------------------------------------------------------------------

function AddClientDialog({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientRole: "Software Engineer" as RoleOption,
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        clientName: "",
        clientEmail: "",
        clientRole: "Software Engineer",
        notes: "",
      });
    }
  }, [open]);

  const save = async () => {
    if (!form.clientName.trim()) {
      toast({ title: "Client name is required", variant: "destructive" });
      return;
    }
    if (!form.clientEmail.trim()) {
      toast({ title: "Client email is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/coach-clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachId: COACH_ID,
          clientName: form.clientName.trim(),
          clientEmail: form.clientEmail.trim(),
          clientRole: form.clientRole,
          notes: form.notes.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("create failed");
      toast({
        title: "Client added",
        description: `${form.clientName} is now in your roster.`,
      });
      onSaved();
    } catch {
      toast({ title: "Failed to add client", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-ocean" /> Add new client
          </DialogTitle>
          <DialogDescription>
            Add a job seeker to your coaching roster. You can review their
            applications and assign templates after they&rsquo;re added.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Client name *">
            <Input
              value={form.clientName}
              onChange={(e) =>
                setForm((f) => ({ ...f, clientName: e.target.value }))
              }
              placeholder="Ayesha Khan"
              autoFocus
            />
          </Field>
          <Field label="Client email *">
            <Input
              type="email"
              value={form.clientEmail}
              onChange={(e) =>
                setForm((f) => ({ ...f, clientEmail: e.target.value }))
              }
              placeholder="ayesha@example.com"
            />
          </Field>
          <Field label="Client role">
            <Select
              value={form.clientRole}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, clientRole: v as RoleOption }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Notes">
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Background, target companies, focus areas…"
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="bg-ocean hover:bg-ocean/90"
            onClick={save}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Add client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Client detail dialog
// ---------------------------------------------------------------------------

function ClientDetailDialog({
  client,
  onClose,
  onEditNotes,
  onToast,
}: {
  client: CoachClient | null;
  onClose: () => void;
  onEditNotes: (c: CoachClient) => void;
  onToast: (t: { title: string; description?: string }) => void;
}) {
  const open = client !== null;

  // Build a simple activity timeline from the fields we have
  const timeline = useMemo(() => {
    if (!client) return [];
    const items: {
      icon: LucideIcon;
      label: string;
      time: string;
      color: string;
    }[] = [];
    items.push({
      icon: UserPlus,
      label: "Client added to your roster",
      time: formatRelativeDate(client.createdAt),
      color: "#0077B6",
    });
    if (client.lastActivity) {
      items.push({
        icon: Activity,
        label: client.lastActivity,
        time: "—",
        color: "#00B4D8",
      });
    }
    items.push({
      icon: Pencil,
      label: "Profile last updated",
      time: formatRelativeDate(client.updatedAt),
      color: "#03045E",
    });
    return items;
  }, [client]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        {client && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-ocean to-sky grid place-items-center text-white font-bold shrink-0">
                  {getInitials(client.clientName)}
                </div>
                <div className="min-w-0">
                  <div className="truncate">{client.clientName}</div>
                  <div className="text-xs font-normal text-muted-foreground flex items-center gap-2 mt-0.5">
                    <Briefcase className="h-3 w-3" /> {client.clientRole}
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${statusBadgeClass(
                        client.status,
                      )}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusDotClass(
                          client.status,
                        )}`}
                      />
                      {client.status === "paused" ? "Paused" : "Active"}
                    </span>
                  </div>
                </div>
              </DialogTitle>
              <DialogDescription>
                Full client overview, notes, and recent activity.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Contact */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-secondary/30 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </div>
                  <div className="text-sm font-medium mt-1 truncate">
                    {client.clientEmail}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-secondary/30 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Last activity
                  </div>
                  <div className="text-sm font-medium mt-1">
                    {client.lastActivity ?? "No activity yet"}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Coaching notes
                  </Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => onEditNotes(client)}
                  >
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </div>
                <div className="rounded-lg border border-border bg-card p-3 min-h-16">
                  {client.notes ? (
                    <p className="text-sm whitespace-pre-wrap">
                      {client.notes}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No notes yet. Click &ldquo;Edit&rdquo; to add coaching
                      notes.
                    </p>
                  )}
                </div>
              </div>

              {/* Activity timeline */}
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                  Activity timeline
                </Label>
                <div className="relative pl-6">
                  <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gradient-to-b from-ocean via-sky to-border" />
                  <div className="space-y-3">
                    {timeline.map((t, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative"
                      >
                        <div
                          className="absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full ring-4 ring-background"
                          style={{ backgroundColor: t.color }}
                        />
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 min-w-0">
                            <t.icon
                              className="h-3.5 w-3.5 mt-0.5 shrink-0"
                              style={{ color: t.color }}
                            />
                            <span className="text-sm">{t.label}</span>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {t.time}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* View applications CTA */}
              <div className="rounded-lg border border-dashed border-ocean/30 bg-ocean/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-ocean/10 grid place-items-center shrink-0">
                    <Award className="h-4 w-4 text-ocean" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      View client&rsquo;s applications
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Opens the client&rsquo;s application tracker in a separate
                      multi-tenant workspace.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onToast({
                        title: "Multi-tenant view",
                        description: `In production this would open ${client.clientName}'s application tracker in a sandboxed workspace.`,
                      })
                    }
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" /> Open
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                className="bg-ocean hover:bg-ocean/90"
                onClick={() => onEditNotes(client)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit notes
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Edit notes dialog
// ---------------------------------------------------------------------------

function EditNotesDialog({
  client,
  onClose,
  onSaved,
}: {
  client: CoachClient | null;
  onClose: () => void;
  onSaved: (updated: CoachClient) => void;
}) {
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) setNotes(client.notes ?? "");
  }, [client]);

  const save = async () => {
    if (!client) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/coach-clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: notes.trim() || null,
          lastActivity: "Notes updated just now",
        }),
      });
      if (!res.ok) throw new Error("update failed");
      const updated: CoachClient = await res.json();
      toast({ title: "Notes saved" });
      onSaved(updated);
    } catch {
      toast({ title: "Failed to save notes", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={client !== null}
      onOpenChange={(o) => !o && onClose()}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-ocean" /> Edit notes
            {client && (
              <span className="text-sm font-normal text-muted-foreground">
                · {client.clientName}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Coaching notes are visible only to you. Use them to track focus
            areas, target companies, and progress.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Notes">
            <Textarea
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Targeting senior backend roles at fintechs. Resume needs more quantified wins. Mock interview scheduled for Friday."
            />
          </Field>
          <div className="text-xs text-muted-foreground text-right">
            {notes.length} characters
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="bg-ocean hover:bg-ocean/90"
            onClick={save}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Save notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Field helper
// ---------------------------------------------------------------------------

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
