"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  ArrowLeft,
  Users as UsersIcon,
  DollarSign,
  Ticket as TicketIcon,
  Globe2,
  Send,
  Search,
  Plus,
  MoreVertical,
  Trash2,
  UserCog,
  CreditCard,
  Power,
  MessageSquareReply,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Loader2,
  Check,
  Clock,
  AlertTriangle,
  Inbox,
  LayoutDashboard,
  TrendingUp,
  ShieldAlert,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/quickapply/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: string;
  avatarColor: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SupportTicket {
  id: string;
  userId: string | null;
  userEmail: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  priority: string;
  reply: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SiteTemplate {
  id: string;
  siteName: string;
  domain: string;
  logoColor: string;
  fieldMapping: string;
  supportedFeatures: string;
  status: string;
  successRate: number;
  lastVerifiedAt: string;
}

interface AdminStats {
  totalUsers: number;
  roleCounts: Record<string, number>;
  planCounts: Record<string, number>;
  revenue: number;
  totalTickets: number;
  openTickets: number;
  ticketStatusCounts: Record<string, number>;
  totalSites: number;
  activeSites: number;
  avgSuccessRate: number;
  totalApplications: number;
  recentUsers: AdminUser[];
}

/* ------------------------------------------------------------------ */
/* Constants & helpers                                                 */
/* ------------------------------------------------------------------ */

const ROLES = [
  { value: "job_seeker", label: "Job Seeker" },
  { value: "coach", label: "Career Coach" },
  { value: "admin", label: "Admin" },
];

const PLANS = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro · $6/mo" },
  { value: "career_coach", label: "Career Coach · $18/mo" },
];

const TICKET_STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

function roleBadgeClass(role: string): string {
  switch (role) {
    case "admin":
      return "bg-ink/10 text-ink border-ink/20";
    case "coach":
      return "bg-sky/15 text-sky border-sky/25";
    default:
      return "bg-ocean/10 text-ocean border-ocean/20";
  }
}

function planBadgeClass(plan: string): string {
  switch (plan) {
    case "career_coach":
      return "bg-sky/15 text-sky border-sky/25";
    case "pro":
      return "bg-ocean/10 text-ocean border-ocean/20";
    case "admin":
      return "bg-ink/10 text-ink border-ink/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function ticketStatusBadgeClass(status: string): string {
  switch (status) {
    case "open":
      return "bg-ocean/10 text-ocean border-ocean/20";
    case "in_progress":
      return "bg-sky/15 text-sky border-sky/25";
    case "resolved":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/20";
    case "closed":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function priorityBadgeClass(priority: string): string {
  switch (priority) {
    case "urgent":
      return "bg-red-500/15 text-red-600 border-red-500/25";
    case "high":
      return "bg-amber-500/15 text-amber-600 border-amber-500/25";
    case "normal":
      return "bg-ocean/10 text-ocean border-ocean/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function siteStatusBadgeClass(status: string): { cls: string; label: string } {
  switch (status) {
    case "active":
      return { cls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20", label: "Active" };
    case "maintenance":
      return { cls: "bg-amber-500/15 text-amber-600 border-amber-500/25", label: "Maintenance" };
    case "disabled":
      return { cls: "bg-red-500/15 text-red-600 border-red-500/25", label: "Disabled" };
    default:
      return { cls: "bg-muted text-muted-foreground border-border", label: status };
  }
}

function roleLabel(role: string): string {
  return ROLES.find((r) => r.value === role)?.label ?? role;
}

function planLabel(plan: string): string {
  return PLANS.find((p) => p.value === plan)?.label ?? plan;
}

function ticketStatusLabel(status: string): string {
  return TICKET_STATUSES.find((s) => s.value === status)?.label ?? status;
}

function priorityLabel(priority: string): string {
  return PRIORITIES.find((p) => p.value === priority)?.label ?? priority;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function relativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const min = 60_000;
  const hr = 3_600_000;
  const day = 86_400_000;
  if (diff < hr) return `${Math.max(1, Math.floor(diff / min))}m ago`;
  if (diff < day) return `${Math.floor(diff / hr)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return formatDate(iso);
}

const CHART_COLORS = ["#0077B6", "#00B4D8", "#03045E", "#90E0EF", "#48cae4", "#0096c7"];

// Mock 8-week revenue trend
const REVENUE_TREND = [
  { week: "W1", revenue: 240 },
  { week: "W2", revenue: 282 },
  { week: "W3", revenue: 312 },
  { week: "W4", revenue: 298 },
  { week: "W5", revenue: 360 },
  { week: "W6", revenue: 396 },
  { week: "W7", revenue: 432 },
  { week: "W8", revenue: 478 },
];

/* ------------------------------------------------------------------ */
/* Brand                                                               */
/* ------------------------------------------------------------------ */

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-ink via-ocean to-sky shadow-ocean grid place-items-center overflow-hidden">
        <Zap className="h-5 w-5 text-white relative z-10" fill="white" />
        <div className="absolute inset-0 animate-shimmer" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight">
          Quick<span className="text-ocean">Apply</span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Admin Console
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stat card                                                           */
/* ------------------------------------------------------------------ */

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
  delay,
}: {
  icon: typeof UsersIcon;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  bg: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="hover:shadow-ocean transition-all">
        <CardContent className="pt-5">
          <div className="flex items-start justify-between">
            <div className={`h-10 w-10 rounded-xl grid place-items-center ${bg}`}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
          </div>
          <div className="mt-4 text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
          {sub && <div className="text-[11px] mt-1 text-emerald-600 font-medium">{sub}</div>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatSkeleton() {
  return (
    <Card>
      <CardContent className="pt-5">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-7 w-20 mt-4" />
        <Skeleton className="h-3 w-24 mt-2" />
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  message,
}: {
  icon: typeof Inbox;
  title: string;
  message: string;
}) {
  return (
    <Card>
      <CardContent className="py-16 text-center">
        <Icon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
        <div className="font-medium text-lg">{title}</div>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{message}</p>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export function AdminDashboard({ onExit }: { onExit: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tab, setTab] = useState("users");

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin");
      const data = (await res.json()) as AdminStats;
      setStats(data);
    } catch {
      toast({ title: "Failed to load admin stats", variant: "destructive" });
    } finally {
      setStatsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const adminName = user?.name ?? "Admin";

  return (
    <div className="min-h-screen bg-mesh-ocean">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass-card shadow-ocean">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Brand />
              <Badge className="bg-ink text-foam border-ink/20 ml-1">
                <ShieldAlert className="h-3 w-3 mr-1" /> Admin
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/60">
                <div
                  className="h-7 w-7 rounded-full grid place-items-center text-white text-xs font-bold"
                  style={{ backgroundColor: user?.avatarColor ?? "#03045E" }}
                >
                  {initials(adminName)}
                </div>
                <span className="text-sm font-medium">{adminName}</span>
              </div>
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={onExit}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to site
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Heading */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7 text-ocean" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage users, support tickets, site compatibility, and review platform metrics.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statsLoading
            ? Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />)
            : (
              <>
                <StatCard
                  icon={UsersIcon}
                  label="Total users"
                  value={stats?.totalUsers ?? 0}
                  sub={`${stats?.roleCounts?.admin ?? 0} admins`}
                  color="#03045E"
                  bg="bg-ink/10"
                  delay={0}
                />
                <StatCard
                  icon={DollarSign}
                  label="Revenue (monthly)"
                  value={`$${stats?.revenue ?? 0}`}
                  sub="Pro $6 · Coach $18"
                  color="#0077B6"
                  bg="bg-ocean/10"
                  delay={0.06}
                />
                <StatCard
                  icon={TicketIcon}
                  label="Open tickets"
                  value={stats?.openTickets ?? 0}
                  sub={`${stats?.totalTickets ?? 0} total`}
                  color="#00B4D8"
                  bg="bg-sky/15"
                  delay={0.12}
                />
                <StatCard
                  icon={Globe2}
                  label="Active sites"
                  value={stats?.activeSites ?? 0}
                  sub={`${stats?.totalSites ?? 0} supported`}
                  color="#0f7b3f"
                  bg="bg-emerald-500/10"
                  delay={0.18}
                />
                <StatCard
                  icon={Send}
                  label="Total applications"
                  value={stats?.totalApplications ?? 0}
                  sub="across all users"
                  color="#0077B6"
                  bg="bg-ocean/10"
                  delay={0.24}
                />
              </>
            )}
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="users">
              <UsersIcon className="h-4 w-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <TicketIcon className="h-4 w-4" /> Support Tickets
            </TabsTrigger>
            <TabsTrigger value="sites">
              <Globe2 className="h-4 w-4" /> Site Health
            </TabsTrigger>
            <TabsTrigger value="overview">
              <TrendingUp className="h-4 w-4" /> Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <UsersTab onChanged={loadStats} />
          </TabsContent>
          <TabsContent value="tickets" className="mt-4">
            <TicketsTab onChanged={loadStats} />
          </TabsContent>
          <TabsContent value="sites" className="mt-4">
            <SitesTab />
          </TabsContent>
          <TabsContent value="overview" className="mt-4">
            <OverviewTab stats={stats} loading={statsLoading} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Users tab                                                           */
/* ------------------------------------------------------------------ */

function UsersTab({ onChanged }: { onChanged: () => void }) {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/users?role=${roleFilter}`);
      const data = (await res.json()) as AdminUser[];
      setUsers(data);
    } catch {
      toast({ title: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [roleFilter, toast]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const updateUser = async (id: string, patch: Partial<AdminUser>, successMsg: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("update failed");
      toast({ title: successMsg });
      onChanged();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
      load();
    }
  };

  const deleteUser = async (u: AdminUser) => {
    if (!window.confirm(`Delete user "${u.name}" (${u.email})? This cannot be undone.`)) return;
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      toast({ title: "User deleted" });
      onChanged();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
      load();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-sm text-muted-foreground">
            Manage accounts, roles, plans, and access.
          </p>
        </div>
        <Button className="bg-ocean hover:bg-ocean/90" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add user
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="job_seeker">Job Seekers</SelectItem>
            <SelectItem value="coach">Coaches</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={Inbox}
                title="No users found"
                message="Try adjusting your search or role filter, or add a new user to get started."
              />
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto scrollbar-thin divide-y">
              <AnimatePresence initial={false}>
                {filtered.map((u, i) => (
                  <motion.div
                    key={u.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: Math.min(i * 0.02, 0.2) }}
                    className="flex items-center gap-3 p-4 hover:bg-secondary/40 transition-colors"
                  >
                    <div
                      className="h-10 w-10 rounded-full grid place-items-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: u.avatarColor || "#0077B6" }}
                    >
                      {initials(u.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold truncate">{u.name}</span>
                        <Badge variant="outline" className={roleBadgeClass(u.role)}>
                          {roleLabel(u.role)}
                        </Badge>
                        <Badge variant="outline" className={planBadgeClass(u.plan)}>
                          {planLabel(u.plan)}
                        </Badge>
                        {!u.active && (
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                            <Power className="h-3 w-3 mr-1" /> Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="truncate">{u.email}</span>
                        <span aria-hidden>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Joined {formatDate(u.createdAt)}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Manage user</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <UserCog className="mr-2 h-4 w-4" /> Change role
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup
                              value={u.role}
                              onValueChange={(v) =>
                                updateUser(u.id, { role: v }, `Role changed to ${roleLabel(v)}`)
                              }
                            >
                              {ROLES.map((r) => (
                                <DropdownMenuRadioItem key={r.value} value={r.value}>
                                  {r.label}
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <CreditCard className="mr-2 h-4 w-4" /> Change plan
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup
                              value={u.plan}
                              onValueChange={(v) =>
                                updateUser(u.id, { plan: v }, `Plan changed to ${planLabel(v)}`)
                              }
                            >
                              {PLANS.map((p) => (
                                <DropdownMenuRadioItem key={p.value} value={p.value}>
                                  {p.label}
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            updateUser(
                              u.id,
                              { active: !u.active },
                              u.active ? "User deactivated" : "User activated",
                            )
                          }
                        >
                          <Power className="mr-2 h-4 w-4" />
                          {u.active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteUser(u)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <AddUserDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          setAddOpen(false);
          load();
          onChanged();
        }}
      />
    </div>
  );
}

function AddUserDialog({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", role: "job_seeker", plan: "free" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm({ name: "", email: "", role: "job_seeker", plan: "free" });
  }, [open]);

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("create failed");
      toast({ title: "User created" });
      onSaved();
    } catch {
      toast({ title: "Failed to create user", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-ocean" /> Add user
          </DialogTitle>
          <DialogDescription>Create a new account with a role and plan.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ayesha Khan"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Email *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ayesha@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Plan</Label>
              <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-ocean hover:bg-ocean/90" onClick={save} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Create user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Tickets tab                                                         */
/* ------------------------------------------------------------------ */

function TicketsTab({ onChanged }: { onChanged: () => void }) {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [replyTicket, setReplyTicket] = useState<SupportTicket | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/support-tickets?status=${statusFilter}`);
      const data = (await res.json()) as SupportTicket[];
      setTickets(data);
    } catch {
      toast({ title: "Failed to load tickets", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const updateTicket = async (
    id: string,
    patch: Partial<SupportTicket>,
    successMsg: string,
  ) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    try {
      const res = await fetch(`/api/support-tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("update failed");
      toast({ title: successMsg });
      onChanged();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
      load();
    }
  };

  const deleteTicket = async (t: SupportTicket) => {
    if (!window.confirm(`Delete ticket "${t.subject}"?`)) return;
    setTickets((prev) => prev.filter((x) => x.id !== t.id));
    try {
      const res = await fetch(`/api/support-tickets/${t.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      toast({ title: "Ticket deleted" });
      onChanged();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
      load();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Support Tickets</h2>
          <p className="text-sm text-muted-foreground">
            Triage inbound requests, reply, and resolve.
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-5 space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No tickets found"
          message="Tickets will appear here as users submit them. Try a different status filter."
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 max-h-[36rem] overflow-y-auto scrollbar-thin pr-1">
          <AnimatePresence initial={false}>
            {tickets.map((t, i) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: Math.min(i * 0.03, 0.2) }}
              >
                <Card className="hover:shadow-ocean transition-all h-full">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate">{t.subject}</h3>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {t.userEmail}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel>Manage ticket</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setReplyTicket(t)}>
                            <MessageSquareReply className="mr-2 h-4 w-4" /> Reply
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <RefreshCw className="mr-2 h-4 w-4" /> Change status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuRadioGroup
                                value={t.status}
                                onValueChange={(v) =>
                                  updateTicket(
                                    t.id,
                                    { status: v },
                                    `Status changed to ${ticketStatusLabel(v)}`,
                                  )
                                }
                              >
                                {TICKET_STATUSES.map((s) => (
                                  <DropdownMenuRadioItem key={s.value} value={s.value}>
                                    {s.label}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <AlertTriangle className="mr-2 h-4 w-4" /> Change priority
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuRadioGroup
                                value={t.priority}
                                onValueChange={(v) =>
                                  updateTicket(
                                    t.id,
                                    { priority: v },
                                    `Priority changed to ${priorityLabel(v)}`,
                                  )
                                }
                              >
                                {PRIORITIES.map((p) => (
                                  <DropdownMenuRadioItem key={p.value} value={p.value}>
                                    {p.label}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deleteTicket(t)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                        {t.category}
                      </Badge>
                      <Badge variant="outline" className={priorityBadgeClass(t.priority)}>
                        {priorityLabel(t.priority)} priority
                      </Badge>
                      <Badge variant="outline" className={ticketStatusBadgeClass(t.status)}>
                        {ticketStatusLabel(t.status)}
                      </Badge>
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{t.message}</p>

                    {t.reply && (
                      <div className="mt-3 rounded-lg bg-ocean/5 border border-ocean/15 p-2.5">
                        <div className="text-[11px] font-medium text-ocean flex items-center gap-1 mb-1">
                          <MessageSquareReply className="h-3 w-3" /> Admin reply
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{t.reply}</p>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {relativeTime(t.createdAt)}
                      </span>
                      <span>{formatDate(t.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ReplyTicketDialog
        ticket={replyTicket}
        onClose={() => setReplyTicket(null)}
        onSaved={(reply) => {
          if (replyTicket) {
            updateTicket(replyTicket.id, { reply, status: "in_progress" }, "Reply sent");
          }
          setReplyTicket(null);
        }}
      />
    </div>
  );
}

function ReplyTicketDialog({
  ticket,
  onClose,
  onSaved,
}: {
  ticket: SupportTicket | null;
  onClose: () => void;
  onSaved: (reply: string) => void;
}) {
  const [reply, setReply] = useState("");

  useEffect(() => {
    setReply(ticket?.reply ?? "");
  }, [ticket]);

  const open = ticket !== null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareReply className="h-5 w-5 text-ocean" /> Reply to ticket
          </DialogTitle>
          <DialogDescription>
            {ticket ? `Re: ${ticket.subject} · ${ticket.userEmail}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {ticket && (
            <div className="rounded-lg bg-secondary/60 p-3">
              <div className="text-[11px] font-medium text-muted-foreground mb-1">
                Original message
              </div>
              <p className="text-xs text-muted-foreground line-clamp-4">{ticket.message}</p>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Your reply</Label>
            <Textarea
              rows={5}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Hi there, thanks for reaching out…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-ocean hover:bg-ocean/90"
            onClick={() => {
              if (!reply.trim()) return;
              onSaved(reply.trim());
            }}
            disabled={!reply.trim()}
          >
            <Check className="mr-2 h-4 w-4" /> Save reply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Sites tab                                                           */
/* ------------------------------------------------------------------ */

function SitesTab() {
  const { toast } = useToast();
  const [sites, setSites] = useState<SiteTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sites")
      .then((r) => r.json())
      .then((data: SiteTemplate[]) => setSites(data))
      .catch(() => toast({ title: "Failed to load sites", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const avgRate = sites.length
    ? Math.round(sites.reduce((a, s) => a + s.successRate, 0) / sites.length)
    : 0;
  const activeCount = sites.filter((s) => s.status === "active").length;

  const verifyNow = (s: SiteTemplate) => {
    toast({ title: "Verification queued", description: `${s.siteName} will be re-checked shortly.` });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Site Health</h2>
        <p className="text-sm text-muted-foreground">
          Monitor job-portal templates, success rates, and verification status.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="h-10 w-10 rounded-xl bg-ocean/10 grid place-items-center mb-3">
              <Globe2 className="h-5 w-5 text-ocean" />
            </div>
            <div className="text-2xl font-bold">{sites.length}</div>
            <div className="text-xs text-muted-foreground">Total sites</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 grid place-items-center mb-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold">{activeCount}</div>
            <div className="text-xs text-muted-foreground">Active sites</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="h-10 w-10 rounded-xl bg-sky/10 grid place-items-center mb-3">
              <TrendingUp className="h-5 w-5 text-sky" />
            </div>
            <div className="text-2xl font-bold">{avgRate}%</div>
            <div className="text-xs text-muted-foreground">Avg success rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-5 space-y-3">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sites.length === 0 ? (
        <EmptyState
          icon={Globe2}
          title="No sites configured"
          message="Site templates will appear here once they are added to the system."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((s, i) => {
            const statusMeta = siteStatusBadgeClass(s.status);
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <Card className="hover:shadow-ocean hover:border-ocean/30 transition-all h-full">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-11 w-11 rounded-xl grid place-items-center text-white text-sm font-bold shrink-0"
                          style={{ backgroundColor: s.logoColor || "#0077B6" }}
                        >
                          {s.siteName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold leading-tight truncate">{s.siteName}</h3>
                          <a
                            href={`https://${s.domain}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-muted-foreground hover:text-ocean flex items-center gap-1"
                          >
                            <span className="truncate">{s.domain}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </div>
                      </div>
                      <Badge variant="outline" className={statusMeta.cls}>
                        {statusMeta.label}
                      </Badge>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Success rate</span>
                        <span className="font-semibold">{s.successRate}%</span>
                      </div>
                      <Progress value={s.successRate} className="h-1.5" />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Verified {relativeTime(s.lastVerifiedAt)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => verifyNow(s)}
                      >
                        <RefreshCw className="mr-1 h-3 w-3" /> Verify now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overview tab                                                        */
/* ------------------------------------------------------------------ */

function OverviewTab({
  stats,
  loading,
}: {
  stats: AdminStats | null;
  loading: boolean;
}) {
  if (loading || !stats) {
    return (
      <div className="grid lg:grid-cols-2 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className={i === 2 ? "lg:col-span-2" : ""}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const roleData = ROLES.map((r) => ({
    name: r.label,
    value: stats.roleCounts?.[r.value] ?? 0,
  }));

  const planData = PLANS.map((p) => ({
    name: p.label.split(" · ")[0],
    value: stats.planCounts?.[p.value] ?? 0,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Platform-wide analytics across users, plans, and revenue.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Users by role — bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Users by role</CardTitle>
            <CardDescription>Distribution of accounts across roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6e9f2" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#5b7a8c" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#5b7a8c" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #d6e9f2", fontSize: 12 }}
                    cursor={{ fill: "#0077B610" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {roleData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Users by plan — pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Users by plan</CardTitle>
            <CardDescription>Subscription breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={56}
                    outerRadius={88}
                    paddingAngle={3}
                  >
                    {planData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #d6e9f2", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {planData.map((p, i) => (
                <div key={p.name} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-muted-foreground truncate">{p.name}</span>
                  <span className="font-semibold ml-auto">{p.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue trend — area */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue trend</CardTitle>
            <CardDescription>Estimated monthly revenue (last 8 weeks)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0077B6" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#0077B6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6e9f2" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: "#5b7a8c" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#5b7a8c" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #d6e9f2", fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0077B6"
                    strokeWidth={2.5}
                    fill="url(#revG)"
                    name="Revenue ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
