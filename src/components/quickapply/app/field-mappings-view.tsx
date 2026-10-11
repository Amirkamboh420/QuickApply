"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Code2,
  Globe2,
  Search,
  Loader2,
  Check,
  Pencil,
  X,
  Info,
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

interface FieldMapping {
  id: string;
  siteName: string;
  fieldName: string;
  selector: string;
  fieldType: string;
  profileField: string;
  isCustom: boolean;
  createdAt: string;
}

const SITES = ["LinkedIn", "Indeed", "Rozee.pk", "Mustakbil", "Bayt", "Glassdoor", "Greenhouse", "Lever"];
const FIELD_TYPES = ["text", "email", "tel", "file", "select", "textarea", "checkbox", "radio"];
const PROFILE_FIELDS = [
  { value: "fullName", label: "Full Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "location", label: "Location" },
  { value: "headline", label: "Headline" },
  { value: "summary", label: "Summary" },
  { value: "resumeName", label: "Resume File" },
  { value: "skills", label: "Skills" },
];

const SITE_COLORS: Record<string, string> = {
  LinkedIn: "#0A66C2",
  Indeed: "#003A9B",
  "Rozee.pk": "#E84B3C",
  Mustakbil: "#0077B6",
  Bayt: "#0a3d62",
  Glassdoor: "#0CAA41",
  Greenhouse: "#0077B6",
  Lever: "#0a3d62",
};

export function FieldMappingsView() {
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteFilter, setSiteFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<FieldMapping | null>(null);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (siteFilter !== "all") params.set("site", siteFilter);
    const res = await fetch(`/api/field-mappings?${params}`);
    const data = await res.json();
    setMappings(data);
    setLoading(false);
  }, [siteFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = mappings.filter(
    (m) =>
      m.fieldName.toLowerCase().includes(search.toLowerCase()) ||
      m.selector.toLowerCase().includes(search.toLowerCase()) ||
      m.profileField.toLowerCase().includes(search.toLowerCase()),
  );

  // Group by site
  const grouped: Record<string, FieldMapping[]> = {};
  for (const m of filtered) {
    if (!grouped[m.siteName]) grouped[m.siteName] = [];
    grouped[m.siteName].push(m);
  }

  const handleDelete = async (id: string) => {
    setMappings((prev) => prev.filter((m) => m.id !== id));
    await fetch(`/api/field-mappings/${id}`, { method: "DELETE" });
    toast({ title: "Field mapping deleted" });
  };

  const handleSave = async (form: Partial<FieldMapping>) => {
    if (creating) {
      const res = await fetch("/api/field-mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast({ title: "Field mapping created" });
      } else {
        const err = await res.json();
        toast({ title: "Could not create", description: err.error ?? "Duplicate field name for this site", variant: "destructive" });
      }
    } else if (editing) {
      await fetch("/api/field-mappings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editing.id }),
      });
      toast({ title: "Field mapping updated" });
    }
    setEditOpen(false);
    setEditing(null);
    setCreating(false);
    load();
  };

  const totalCustom = mappings.filter((m) => m.isCustom).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Field Mapping</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Override how QuickApply detects & fills form fields on each site.
          </p>
        </div>
        <Button className="bg-ocean hover:bg-ocean/90" onClick={() => { setEditing(null); setCreating(true); setEditOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add mapping
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="h-10 w-10 rounded-xl bg-ocean/10 grid place-items-center mb-3">
              <Globe2 className="h-5 w-5 text-ocean" />
            </div>
            <div className="text-2xl font-bold">{Object.keys(grouped).length}</div>
            <div className="text-xs text-muted-foreground">Sites with mappings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="h-10 w-10 rounded-xl bg-sky/10 grid place-items-center mb-3">
              <Code2 className="h-5 w-5 text-sky" />
            </div>
            <div className="text-2xl font-bold">{mappings.length}</div>
            <div className="text-xs text-muted-foreground">Total field mappings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 grid place-items-center mb-3">
              <Pencil className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold">{totalCustom}</div>
            <div className="text-xs text-muted-foreground">Custom overrides</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by field name, selector, or profile field…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={siteFilter} onValueChange={setSiteFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Globe2 className="h-4 w-4 mr-1.5" />
            <SelectValue placeholder="All sites" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sites</SelectItem>
            {SITES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Grouped mappings */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="py-4 h-32 bg-muted/30 animate-pulse" /></Card>
          ))
        ) : Object.keys(grouped).length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Code2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <div className="font-medium">No field mappings found</div>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Add a custom mapping to override auto-detection for any site, or adjust your filters.
              </p>
              <Button className="mt-4 bg-ocean hover:bg-ocean/90" onClick={() => { setEditing(null); setCreating(true); setEditOpen(true); }}>
                <Plus className="mr-1.5 h-4 w-4" /> Add your first mapping
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([site, fields], gi) => (
            <motion.div
              key={site}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.06 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-3 bg-secondary/30 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-8 w-8 rounded-lg grid place-items-center text-white text-xs font-bold"
                      style={{ backgroundColor: SITE_COLORS[site] ?? "#0077B6" }}
                    >
                      {site.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-base">{site}</CardTitle>
                      <CardDescription className="text-xs">{fields.length} field mapping{fields.length !== 1 ? "s" : ""}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-background">
                    {fields.filter((f) => f.isCustom).length} custom
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {fields.map((f) => (
                      <div key={f.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/40 transition-colors group">
                        <div className="flex-1 min-w-0 grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-3">
                            <div className="text-sm font-medium truncate">{f.fieldName}</div>
                            {f.isCustom && (
                              <Badge className="mt-0.5 bg-amber-500/10 text-amber-700 border-amber-500/20 text-[9px] py-0">
                                Custom
                              </Badge>
                            )}
                          </div>
                          <div className="col-span-5">
                            <code className="text-[11px] text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded font-mono block truncate">
                              {f.selector}
                            </code>
                          </div>
                          <div className="col-span-2">
                            <Badge variant="outline" className="text-[10px] bg-secondary/60 border-border">
                              {f.fieldType}
                            </Badge>
                          </div>
                          <div className="col-span-2 text-xs text-muted-foreground truncate">
                            → {PROFILE_FIELDS.find((p) => p.value === f.profileField)?.label ?? f.profileField}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(f); setCreating(false); setEditOpen(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => handleDelete(f.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Info banner */}
      <Card className="bg-gradient-to-br from-ink/5 to-ocean/5 border-ocean/20">
        <CardContent className="py-4 flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-ocean/10 grid place-items-center shrink-0">
            <Info className="h-4.5 w-4.5 text-ocean" />
          </div>
          <div className="text-sm">
            <div className="font-medium">When to use custom mappings</div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              If QuickApply fails to detect a field on a specific site (the form has unusual
              selectors or custom labels), add a mapping here. Use CSS selectors —{" "}
              <code className="text-[11px] bg-secondary px-1 rounded font-mono">#id</code>,{" "}
              <code className="text-[11px] bg-secondary px-1 rounded font-mono">.class</code>, or{" "}
              <code className="text-[11px] bg-secondary px-1 rounded font-mono">input[name="..."]</code> —
              and link it to the profile field that should fill it.
            </p>
          </div>
        </CardContent>
      </Card>

      <EditMappingDialog
        open={editOpen}
        mapping={editing}
        creating={creating}
        onClose={() => { setEditOpen(false); setEditing(null); setCreating(false); }}
        onSaved={handleSave}
      />
    </div>
  );
}

function EditMappingDialog({
  open,
  mapping,
  creating,
  onClose,
  onSaved,
}: {
  open: boolean;
  mapping: FieldMapping | null;
  creating: boolean;
  onClose: () => void;
  onSaved: (form: Partial<FieldMapping>) => void;
}) {
  const [form, setForm] = useState({
    siteName: "LinkedIn",
    fieldName: "",
    selector: "",
    fieldType: "text",
    profileField: "fullName",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mapping) {
      setForm({
        siteName: mapping.siteName,
        fieldName: mapping.fieldName,
        selector: mapping.selector,
        fieldType: mapping.fieldType,
        profileField: mapping.profileField,
      });
    } else {
      setForm({ siteName: "LinkedIn", fieldName: "", selector: "", fieldType: "text", profileField: "fullName" });
    }
  }, [mapping, open]);

  const save = () => {
    if (!form.fieldName.trim() || !form.selector.trim()) return;
    setSaving(true);
    onSaved({ ...form, isCustom: true });
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-ocean" />
            {creating ? "Add field mapping" : `Edit · ${mapping?.fieldName}`}
          </DialogTitle>
          <DialogDescription>
            Define how QuickApply detects and fills a form field on a specific site.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Site">
              <Select value={form.siteName} onValueChange={(v) => setForm({ ...form, siteName: v })} disabled={!creating}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SITES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Field type">
              <Select value={form.fieldType} onValueChange={(v) => setForm({ ...form, fieldType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Field name (label shown to user)">
            <Input value={form.fieldName} onChange={(e) => setForm({ ...form, fieldName: e.target.value })} placeholder="Full name" disabled={!creating} />
          </Field>
          <Field label="CSS selector">
            <Input
              value={form.selector}
              onChange={(e) => setForm({ ...form, selector: e.target.value })}
              placeholder="input[name='name']"
              className="font-mono text-sm"
            />
          </Field>
          <Field label="Profile field to fill from">
            <Select value={form.profileField} onValueChange={(v) => setForm({ ...form, profileField: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROFILE_FIELDS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-foreground/70">
              Custom mappings override QuickApply's auto-detection for this site + field name combination.
              You can have one mapping per field name per site.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-ocean hover:bg-ocean/90" onClick={save} disabled={saving || !form.fieldName.trim() || !form.selector.trim()}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            {creating ? "Create mapping" : "Save changes"}
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
