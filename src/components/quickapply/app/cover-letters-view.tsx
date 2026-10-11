"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  Trash2,
  Copy,
  Wand2,
  Loader2,
  Pencil,
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
import { CoverLetter, Profile } from "@/lib/quickapply/types";

const TONES = [
  { value: "professional", label: "Professional", color: "#0077B6" },
  { value: "energetic", label: "Energetic", color: "#00B4D8" },
  { value: "thoughtful", label: "Thoughtful", color: "#03045E" },
  { value: "concise", label: "Concise", color: "#0a8fb0" },
];

export function CoverLettersView() {
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CoverLetter | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    const [l, p] = await Promise.all([
      fetch("/api/cover-letters").then((r) => r.json()),
      fetch("/api/profiles").then((r) => r.json()),
    ]);
    setLetters(l);
    setProfiles(p);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/cover-letters/${id}`, { method: "DELETE" });
    toast({ title: "Template deleted" });
    load();
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Cover Letter Templates</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Save reusable templates. QuickApply fills & tailors them per job.
          </p>
        </div>
        <Button className="bg-ocean hover:bg-ocean/90" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> New template
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-5 h-48 bg-muted/30 animate-pulse" /></Card>
          ))
        ) : letters.map((l, i) => {
          const tone = TONES.find((t) => t.value === l.tone) ?? TONES[0];
          return (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="h-full hover:shadow-ocean transition-all group">
                <CardContent className="pt-5 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-9 w-9 rounded-lg grid place-items-center"
                        style={{ backgroundColor: `${tone.color}15` }}
                      >
                        <FileText className="h-4.5 w-4.5" style={{ color: tone.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm leading-tight">{l.title}</h3>
                        <Badge variant="outline" className="mt-1 text-[10px]" style={{ color: tone.color, borderColor: `${tone.color}40` }}>
                          {tone.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(l); setOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => handleDelete(l.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-5 leading-relaxed flex-1 font-mono">
                    {l.content}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleCopy(l.content)}>
                      <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <EditorDialog
        open={open}
        letter={editing}
        profiles={profiles}
        onClose={() => setOpen(false)}
        onSaved={() => { setOpen(false); load(); }}
      />
    </div>
  );
}

function EditorDialog({
  open,
  letter,
  profiles,
  onClose,
  onSaved,
}: {
  open: boolean;
  letter: CoverLetter | null;
  profiles: Profile[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [tone, setTone] = useState("professional");
  const [content, setContent] = useState("");
  const [profileId, setProfileId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(letter?.title ?? "");
    setTone(letter?.tone ?? "professional");
    setContent(letter?.content ?? "");
    setProfileId(letter?.profileId ?? "");
  }, [letter, open]);

  const save = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    await fetch("/api/cover-letters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, tone, content, profileId: profileId || null }),
    });
    setSaving(false);
    toast({ title: "Template saved" });
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-ocean" /> {letter ? "Edit template" : "New cover letter template"}
          </DialogTitle>
          <DialogDescription>
            Use placeholders like <code className="text-xs bg-secondary px-1 rounded">{"{{role}}"}</code>,{" "}
            <code className="text-xs bg-secondary px-1 rounded">{"{{company}}"}</code>,{" "}
            <code className="text-xs bg-secondary px-1 rounded">{"{{focus}}"}</code> — QuickApply fills them per job.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Frontend Template" />
            </Field>
            <Field label="Tone">
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Linked profile (optional)">
            <Select value={profileId} onValueChange={setProfileId}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                {profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Content">
            <Textarea rows={10} value={content} onChange={(e) => setContent(e.target.value)} className="font-mono text-sm" />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-ocean hover:bg-ocean/90" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Save template
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
