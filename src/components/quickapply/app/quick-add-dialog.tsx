"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Loader2, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const SITES = ["LinkedIn", "Indeed", "Rozee.pk", "Mustakbil", "Bayt", "Glassdoor", "Company Site"];

export function QuickAddDialog({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    jobTitle: "",
    company: "",
    site: "LinkedIn",
    location: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.jobTitle.trim() || !form.company.trim()) {
      toast({ title: "Job title and company are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status: "applied", source: "Quick Add" }),
    });
    setSaving(false);
    toast({ title: "Application logged", description: `${form.jobTitle} at ${form.company}` });
    setForm({ jobTitle: "", company: "", site: "LinkedIn", location: "" });
    onAdded();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-ocean" fill="currentColor" /> Quick add application
          </DialogTitle>
          <DialogDescription>Log an application in seconds — no form-filling required.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Job title *">
            <Input
              value={form.jobTitle}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              placeholder="Senior Frontend Engineer"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && form.company) submit(); }}
            />
          </Field>
          <Field label="Company *">
            <Input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Careem"
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Site">
              <Select value={form.site} onValueChange={(v) => setForm({ ...form, site: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SITES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Location">
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Lahore"
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-ocean hover:bg-ocean/90" onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Log application
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
