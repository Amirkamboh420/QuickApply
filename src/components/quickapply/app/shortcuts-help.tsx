"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X, Command, Search, Bell, Moon, Sun, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const SHORTCUTS = [
  { keys: ["⌘", "K"], label: "Open command palette", icon: Search, desc: "Jump to any section or action" },
  { keys: ["?"], label: "Show this help", icon: Keyboard, desc: "Toggle keyboard shortcuts overlay" },
  { keys: ["G", "D"], label: "Go to Dashboard", icon: Command, desc: "Quick nav to overview" },
  { keys: ["G", "A"], label: "Go to Applications", icon: Command, desc: "View your application tracker" },
  { keys: ["G", "P"], label: "Go to Profiles", icon: Command, desc: "Manage resume profiles" },
  { keys: ["G", "R"], label: "Go to Reminders", icon: Bell, desc: "Check follow-up reminders" },
  { keys: ["T"], label: "Toggle theme", icon: Moon, desc: "Switch between light & dark mode" },
  { keys: ["Esc"], label: "Close dialogs", icon: X, desc: "Dismiss any open overlay" },
];

export function ShortcutsHelp({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-ocean" /> Keyboard shortcuts
          </DialogTitle>
          <DialogDescription>
            Navigate QuickApply faster with these shortcuts. Works anywhere in the dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {SHORTCUTS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-secondary/50 transition-colors group"
            >
              <div className="h-8 w-8 rounded-lg bg-ocean/10 grid place-items-center shrink-0">
                <s.icon className="h-4 w-4 text-ocean" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-mono font-semibold bg-secondary border border-border rounded-md shadow-sm"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-mono font-semibold bg-secondary border border-border rounded">?</kbd> anytime to open this again
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
