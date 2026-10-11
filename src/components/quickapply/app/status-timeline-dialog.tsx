"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  X,
  Target,
  Award,
  Send,
  GitBranch,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Application, STATUS_META, Status } from "@/lib/quickapply/types";

interface HistoryEntry {
  id: string;
  applicationId: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string;
}

const STATUS_ICONS: Record<string, typeof Send> = {
  applied: Send,
  interview: Target,
  offer: Award,
  rejected: X,
};

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const day = 86400000;
  if (diff < day && now.getDate() === d.getDate()) {
    return `Today, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  }
  if (diff < 2 * day) return `Yesterday, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function StatusTimelineDialog({
  open,
  onClose,
  application,
}: {
  open: boolean;
  onClose: () => void;
  application: Application | null;
}) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !application) return;
    setLoading(true);
    fetch(`/api/applications/${application.id}/timeline`)
      .then((r) => r.json())
      .then((data) => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open, application]);

  if (!application) return null;

  // Build timeline: start with application creation (applied), then history entries
  const timeline = [
    {
      id: "initial",
      toStatus: "applied",
      fromStatus: null,
      createdAt: application.appliedAt,
      note: `Applied via ${application.source}`,
      isInitial: true,
    },
    ...history.map((h) => ({ ...h, isInitial: false })),
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-ocean" /> Status timeline
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{application.jobTitle}</span> at {application.company}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-ocean" />
          </div>
        ) : (
          <div className="relative pl-2">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-ocean via-sky to-border" />

            <div className="space-y-1">
              {timeline.map((entry, i) => {
                const meta = STATUS_META[entry.toStatus as Status] ?? STATUS_META.applied;
                const Icon = STATUS_ICONS[entry.toStatus] ?? Clock;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative flex gap-4 pb-5"
                  >
                    {/* Dot */}
                    <div className="relative z-10 shrink-0">
                      <div
                        className="h-9 w-9 rounded-full grid place-items-center ring-4 ring-background"
                        style={{ backgroundColor: meta.color }}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold" style={{ color: meta.color }}>
                          {meta.label}
                        </span>
                        {entry.fromStatus && (
                          <span className="text-xs text-muted-foreground">
                            from {STATUS_META[entry.fromStatus as Status]?.label ?? entry.fromStatus}
                          </span>
                        )}
                      </div>
                      {entry.note && (
                        <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>
                      )}
                      <div className="text-[11px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatTime(entry.createdAt)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Current status indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: timeline.length * 0.1 }}
              className="relative flex gap-4 pt-2 mt-2 border-t border-dashed border-border"
            >
              <div className="relative z-10 shrink-0">
                <div className="h-9 w-9 rounded-full grid place-items-center bg-secondary ring-4 ring-background">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex-1 pt-1">
                <div className="text-xs font-medium text-muted-foreground">Current status</div>
                <Badge className={`mt-1 ${STATUS_META[application.status as Status]?.bg} ${STATUS_META[application.status as Status]?.text} border-transparent`}>
                  {STATUS_META[application.status as Status]?.label ?? application.status}
                </Badge>
              </div>
            </motion.div>
          </div>
        )}

        {history.length === 0 && !loading && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
            No status changes yet. When you update this application's status, the history will appear here.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
