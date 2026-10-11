"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  StickyNote,
  Tag,
  X,
  Plus,
  Loader2,
  Check,
  Hash,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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

const SUGGESTED_TAGS = ["Remote", "Hybrid", "Onsite", "Dream Job", "High Priority", "Referral", "Startup", "Enterprise", "Contract"];

interface Referral {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
}

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return raw.split(",").map((t) => t.trim()).filter(Boolean);
  }
}

export function NotesEditorDialog({
  open,
  onClose,
  application,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  application: Application & { referralId?: string | null };
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralId, setReferralId] = useState<string>("");

  useEffect(() => {
    if (open) {
      fetch("/api/referrals").then((r) => r.json()).then(setReferrals);
    }
  }, [open]);

  useEffect(() => {
    if (application) {
      setNotes(application.notes ?? "");
      setTags(parseTags(application.tags));
      setReferralId(application.referralId ?? "");
    }
  }, [application, open]);

  if (!application) return null;

  const addTag = (tag: string) => {
    const clean = tag.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const save = async () => {
    setSaving(true);
    await fetch(`/api/applications/${application.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notes: notes.trim() || null,
        tags: JSON.stringify(tags),
        referralId: referralId || null,
      }),
    });
    setSaving(false);
    toast({ title: "Notes & tags saved", description: `Updated ${application.jobTitle} at ${application.company}.` });
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-ocean" /> Notes & Tags
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{application.jobTitle}</span> at {application.company}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5" /> Private notes
            </Label>
            <Textarea
              rows={5}
              placeholder="Add context about this application — recruiter contact, interview feedback, why you want this role…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-sm"
            />
            <div className="text-[10px] text-muted-foreground text-right">{notes.length} chars</div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" /> Tags
            </Label>

            {/* Current tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-secondary/40 border border-border min-h-[40px]">
                <AnimatePresence>
                  {tags.map((tag) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Badge className="bg-ocean/10 text-ocean border-ocean/20 pr-1">
                        <Hash className="h-2.5 w-2.5 mr-0.5" />
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-ocean/20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Add tag input */}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(newTag);
                  }
                }}
                placeholder="Type a tag and press Enter…"
                className="text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => addTag(newTag)}
                disabled={!newTag.trim()}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Suggested tags */}
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-dashed border-border text-muted-foreground hover:border-ocean/50 hover:text-ocean transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Referral */}
          {referrals.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Referred by
              </Label>
              <Select value={referralId || "none"} onValueChange={(v) => setReferralId(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="No referral" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No referral</SelectItem>
                  {referrals.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}{r.company ? ` · ${r.company}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-ocean hover:bg-ocean/90" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
