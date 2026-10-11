"use client";

import { useCallback } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  UserCircle2,
  ListChecks,
  Bell,
  BarChart3,
  FileText,
  Globe2,
  Settings,
  ArrowLeft,
  Sparkles,
  Sun,
  Moon,
  Github,
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
} from "lucide-react";
import type { AppSection } from "../app-shell";
import { useTheme } from "next-themes";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (section: AppSection) => void;
  onExit: () => void;
}

const NAV_ITEMS: { id: AppSection; label: string; icon: typeof LayoutDashboard; hint: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, hint: "Overview & stats" },
  { id: "profiles", label: "Profiles", icon: UserCircle2, hint: "Manage resume profiles" },
  { id: "applications", label: "Applications", icon: ListChecks, hint: "Track job applications" },
  { id: "reminders", label: "Reminders", icon: Bell, hint: "Follow-up alerts" },
  { id: "bulk-apply", label: "Bulk Apply", icon: Rocket, hint: "Fill multiple jobs in a session" },
  { id: "calendar", label: "Calendar", icon: CalendarDays, hint: "Interviews & follow-ups" },
  { id: "saved-jobs", label: "Saved Jobs", icon: Bookmark, hint: "Bookmarked to apply later" },
  { id: "analytics", label: "Analytics", icon: BarChart3, hint: "Charts & insights" },
  { id: "company-insights", label: "Company Insights", icon: Building2, hint: "Per-company stats" },
  { id: "referrals", label: "Referrals", icon: Users, hint: "Your referral network" },
  { id: "activity", label: "Activity Feed", icon: ActivityIcon, hint: "Recent activity timeline" },
  { id: "goals", label: "Goals", icon: Target, hint: "Weekly targets & streaks" },
  { id: "salary", label: "Salary Insights", icon: DollarSign, hint: "Market salary data" },
  { id: "cover-letters", label: "Cover Letters", icon: FileText, hint: "Templates" },
  { id: "sites", label: "Site Compatibility", icon: Globe2, hint: "Supported portals" },
  { id: "field-mappings", label: "Field Mapping", icon: Code2, hint: "Custom field overrides" },
  { id: "data", label: "Data Management", icon: Database, hint: "Export & import data" },
  { id: "settings", label: "Settings", icon: Settings, hint: "Preferences" },
];

export function CommandPalette({ open, onOpenChange, onNavigate, onExit }: CommandPaletteProps) {
  const { setTheme, theme } = useTheme();

  const go = useCallback(
    (s: AppSection) => {
      onNavigate(s);
      onOpenChange(false);
    },
    [onNavigate, onOpenChange],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} className="max-w-xl">
      <CommandInput placeholder="Type a command or search…" />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigate">
          {NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.label} ${item.hint} ${item.id}`}
              onSelect={() => go(item.id)}
              className="group"
            >
              <item.icon className="mr-2.5 h-4 w-4 text-ocean group-hover:text-ocean" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-[11px] text-muted-foreground">{item.hint}</span>
              </div>
              <kbd className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                ↵
              </kbd>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick actions">
          <CommandItem
            onSelect={() => {
              setTheme(theme === "dark" ? "light" : "dark");
              onOpenChange(false);
            }}
          >
            {theme === "dark" ? (
              <Sun className="mr-2.5 h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="mr-2.5 h-4 w-4 text-ocean" />
            )}
            <span className="text-sm font-medium">Toggle {theme === "dark" ? "light" : "dark"} mode</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              go("profiles");
            }}
            value="parse resume ai"
          >
            <Sparkles className="mr-2.5 h-4 w-4 text-sky" />
            <span className="text-sm font-medium">Parse resume with AI</span>
            <span className="ml-auto inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-sky/15 text-ocean border border-sky/20">
              AI
            </span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Other">
          <CommandItem onSelect={() => { onOpenChange(false); onExit(); }}>
            <ArrowLeft className="mr-2.5 h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Back to landing page</span>
          </CommandItem>
          <CommandItem onSelect={() => window.open("https://github.com", "_blank")}>
            <Github className="mr-2.5 h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Open documentation</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
