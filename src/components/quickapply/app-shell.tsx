"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  UserCircle2,
  ListChecks,
  BarChart3,
  FileText,
  Globe2,
  Settings,
  Zap,
  ArrowLeft,
  Bell,
  Search,
  ChevronDown,
  Sparkles,
  DollarSign,
  Code2,
  Database,
  Rocket,
  CalendarDays,
  Bookmark,
  Building2,
  Users,
  Activity as ActivityIcon,
  Target,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { DashboardView } from "./app/dashboard-view";
import { ProfilesView } from "./app/profiles-view";
import { ApplicationsView } from "./app/applications-view";
import { AnalyticsView } from "./app/analytics-view";
import { CoverLettersView } from "./app/cover-letters-view";
import { SitesView } from "./app/sites-view";
import { SettingsView } from "./app/settings-view";
import { RemindersView } from "./app/reminders-view";
import { CommandPalette } from "./app/command-palette";
import { SalaryView } from "./app/salary-view";
import { FieldMappingsView } from "./app/field-mappings-view";
import { DataView } from "./app/data-view";
import { BulkApplyView } from "./app/bulk-apply-view";
import { ShortcutsHelp } from "./app/shortcuts-help";
import { CalendarView } from "./app/calendar-view";
import { SavedJobsView } from "./app/saved-jobs-view";
import { CompanyInsightsView } from "./app/company-insights-view";
import { ReferralsView } from "./app/referrals-view";
import { ActivityView } from "./app/activity-view";
import { GoalsView } from "./app/goals-view";

export type AppSection =
  | "dashboard"
  | "profiles"
  | "applications"
  | "reminders"
  | "analytics"
  | "salary"
  | "bulk-apply"
  | "calendar"
  | "saved-jobs"
  | "company-insights"
  | "referrals"
  | "activity"
  | "goals"
  | "cover-letters"
  | "sites"
  | "field-mappings"
  | "data"
  | "settings";

const NAV: { id: AppSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profiles", label: "Profiles", icon: UserCircle2 },
  { id: "applications", label: "Applications", icon: ListChecks },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "bulk-apply", label: "Bulk Apply", icon: Rocket },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "saved-jobs", label: "Saved Jobs", icon: Bookmark },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "company-insights", label: "Company Insights", icon: Building2 },
  { id: "referrals", label: "Referrals", icon: Users },
  { id: "activity", label: "Activity Feed", icon: ActivityIcon },
  { id: "goals", label: "Goals", icon: Target },
  { id: "salary", label: "Salary Insights", icon: DollarSign },
  { id: "cover-letters", label: "Cover Letters", icon: FileText },
  { id: "sites", label: "Site Compatibility", icon: Globe2 },
  { id: "field-mappings", label: "Field Mapping", icon: Code2 },
  { id: "data", label: "Data Management", icon: Database },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AppShell({ onExit, onSupport }: { onExit: () => void; onSupport?: () => void }) {
  const [section, setSection] = useState<AppSection>("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [gPressed, setGPressed] = useState(false);

  const select = useCallback((s: AppSection) => {
    setSection(s);
    setMobileNavOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Keyboard shortcuts: Cmd+K, ?, G+letter navigation, T for theme
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // Cmd+K always works
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
        return;
      }

      if (isTyping) return;

      // ? opens help
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setHelpOpen((v) => !v);
        return;
      }

      // G + letter navigation
      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey) {
        setGPressed(true);
        setTimeout(() => setGPressed(false), 1200);
        return;
      }
      if (gPressed) {
        const map: Record<string, AppSection> = {
          d: "dashboard",
          a: "applications",
          p: "profiles",
          r: "reminders",
          s: "salary",
          c: "cover-letters",
        };
        const next = map[e.key.toLowerCase()];
        if (next) {
          e.preventDefault();
          select(next);
        }
        setGPressed(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gPressed, select]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass-card border-b border-border">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-secondary"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Toggle nav"
          >
            <Zap className="h-5 w-5 text-ocean" fill="currentColor" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-ink via-ocean to-sky grid place-items-center shadow-ocean">
              <Zap className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-foreground hidden sm:block">
              Quick<span className="text-ocean">Apply</span>
            </span>
            <Badge className="ml-1 bg-ocean/10 text-ocean border-ocean/20 hidden sm:flex">Pro</Badge>
          </div>

          <div className="flex-1 max-w-md mx-auto hidden sm:block">
            <button
              onClick={() => setCmdOpen(true)}
              className="relative w-full text-left"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <div className="h-9 pl-9 pr-12 flex items-center bg-secondary/50 border border-border rounded-md text-sm text-muted-foreground hover:bg-secondary/70 transition-colors">
                Search or jump to…
              </div>
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-background border border-border rounded px-1.5 py-0.5 hidden md:block pointer-events-none">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative" onClick={() => select("reminders")}>
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sky ring-2 ring-background animate-pulse-ring" />
            </Button>
            <Button variant="outline" size="sm" onClick={onExit} className="hidden sm:flex">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to site
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg pl-1.5 pr-2 py-1 hover:bg-secondary transition-colors">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-ocean to-sky grid place-items-center text-white text-xs font-bold">
                    AK
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Ayesha Khan</span>
                    <span className="text-xs text-muted-foreground">ayesha.khan@example.com</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => select("profiles")}>My profiles</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => select("settings")}>Settings</DropdownMenuItem>
                {onSupport && <DropdownMenuItem onSelect={onSupport}>Help & Support</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">Switch role (demo)</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => { window.location.hash = "coach"; }}>
                  <Users className="mr-2 h-3.5 w-3.5 text-sky" /> Career Coach
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { window.location.hash = "admin"; }}>
                  <ShieldAlert className="mr-2 h-3.5 w-3.5 text-ink" /> Admin
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onExit}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - desktop */}
        <aside className="hidden md:flex w-60 shrink-0 border-r border-border bg-secondary/20 flex-col">
          <SidebarNav section={section} onSelect={select} />
        </aside>

        {/* Sidebar - mobile drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 bg-ink/40 backdrop-blur-sm z-40"
                onClick={() => setMobileNavOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", damping: 26, stiffness: 240 }}
                className="md:hidden fixed left-0 top-14 bottom-0 w-64 bg-background border-r border-border z-50 flex flex-col"
              >
                <SidebarNav section={section} onSelect={select} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 min-w-0 bg-mesh-ocean">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-6 lg:p-8"
            >
              {section === "dashboard" && <DashboardView onNavigate={select} />}
              {section === "profiles" && <ProfilesView />}
              {section === "applications" && <ApplicationsView />}
              {section === "reminders" && <RemindersView onNavigate={select} />}
              {section === "bulk-apply" && <BulkApplyView onNavigate={select} />}
              {section === "calendar" && <CalendarView onNavigate={select} />}
              {section === "saved-jobs" && <SavedJobsView onNavigate={select} />}
              {section === "analytics" && <AnalyticsView />}
              {section === "company-insights" && <CompanyInsightsView onNavigate={select} />}
              {section === "referrals" && <ReferralsView />}
              {section === "activity" && <ActivityView onNavigate={select} />}
              {section === "goals" && <GoalsView onNavigate={select} />}
              {section === "salary" && <SalaryView onNavigate={select} />}
              {section === "cover-letters" && <CoverLettersView />}
              {section === "sites" && <SitesView />}
              {section === "field-mappings" && <FieldMappingsView />}
              {section === "data" && <DataView />}
              {section === "settings" && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        onNavigate={select}
        onExit={onExit}
      />

      <ShortcutsHelp open={helpOpen} onOpenChange={setHelpOpen} />

      {/* G-key indicator */}
      <AnimatePresence>
        {gPressed && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card rounded-full px-4 py-2 shadow-ocean-lg flex items-center gap-2"
          >
            <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-xs font-mono font-semibold bg-ocean text-white rounded-md">G</kbd>
            <span className="text-xs text-muted-foreground">then press</span>
            <div className="flex gap-1">
              {[
                { k: "D", s: "Dashboard" },
                { k: "A", s: "Apps" },
                { k: "P", s: "Profiles" },
                { k: "R", s: "Reminders" },
                { k: "S", s: "Salary" },
                { k: "C", s: "Cover" },
              ].map((opt) => (
                <kbd key={opt.k} className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[10px] font-mono font-semibold bg-secondary border border-border rounded-md">
                  {opt.k}
                </kbd>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarNav({
  section,
  onSelect,
}: {
  section: AppSection;
  onSelect: (s: AppSection) => void;
}) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      <div className="px-2 mb-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        Workspace
      </div>
      {NAV.map((item) => {
        const active = section === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              active
                ? "bg-ocean text-white shadow-ocean"
                : "text-foreground/70 hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icon className={`h-4.5 w-4.5 ${active ? "text-white" : "text-muted-foreground"}`} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.id === "applications" && (
              <Badge className={`text-[10px] px-1.5 py-0 ${active ? "bg-white/20 text-white border-transparent" : "bg-ocean/10 text-ocean border-ocean/20"}`}>
                15
              </Badge>
            )}
          </button>
        );
      })}

      <div className="mt-6 mx-2 rounded-xl bg-gradient-to-br from-ink to-ocean p-4 text-white relative overflow-hidden">
        <Sparkles className="h-5 w-5 text-sky mb-2" />
        <div className="text-sm font-semibold">AI Resume Tailor</div>
        <p className="text-xs text-foam/70 mt-1">
          Tailor your summary to any job description in one click.
        </p>
        <Button
          size="sm"
          variant="secondary"
          className="mt-3 w-full bg-white text-ocean hover:bg-foam"
          onClick={() => onSelect("profiles")}
        >
          Try it
        </Button>
        <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-sky/30 blur-2xl" />
      </div>
    </nav>
  );
}
