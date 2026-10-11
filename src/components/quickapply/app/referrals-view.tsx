"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Users,
  Mail,
  Phone,
  Linkedin,
  Building2,
  Briefcase,
  Trash2,
  Pencil,
  Loader2,
  Check,
  X,
  Search,
  Star,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Referral {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  linkedinUrl: string | null;
  phone: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

export function ReferralsView() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Referral | null>(null);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch("/api/referrals");
    const data = await res.json();
    setReferrals(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = referrals.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.company ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.role ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    setReferrals((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/referrals/${id}`, { method: "DELETE" });
    toast({ title: "Referral removed" });
  };

  const handleToggleStar = async (r: Referral) => {
    const newStatus = r.status === "starred" ? "active" : "starred";
    setReferrals((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: newStatus } : x)));
    await fetch(`/api/referrals/${r.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const starred = referrals.filter((r) => r.status === "starred").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            Referrals
            {referrals.length > 0 && (
              <Badge variant="outline" className="border-ocean/20 text-ocean bg-ocean/5">
                <Users className="h-3 w-3 mr-0.5" /> {referrals.length} contacts
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your network — track who can refer you, and reach out before applying.
          </p>
        </div>
        <Button className="bg-ocean hover:bg-ocean/90" onClick={() => { setEditing(null); setCreating(true); setEditOpen(true); }}>
          <UserPlus className="mr-2 h-4 w-4" /> Add contact
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="h-10 w-10 rounded-xl bg-ocean/10 grid place-items-center mb-3">
              <Users className="h-5 w-5 text-ocean" />
            </div>
            <div className="text-2xl font-bold">{referrals.length}</div>
            <div className="text-xs text-muted-foreground">Total contacts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 grid place-items-center mb-3">
              <Star className="h-5 w-5 text-amber-500" fill="currentColor" />
            </div>
            <div className="text-2xl font-bold">{starred}</div>
            <div className="text-xs text-muted-foreground">Starred</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 grid place-items-center mb-3">
              <Building2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold">{new Set(referrals.map((r) => r.company).filter(Boolean)).size}</div>
            <div className="text-xs text-muted-foreground">Companies</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, company, or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      <div className="grid sm:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-5 h-40 bg-muted/30 animate-pulse" /></Card>
          ))
        ) : filtered.length === 0 ? (
          <Card className="sm:col-span-2">
            <CardContent className="py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <div className="font-medium text-lg">No referrals yet</div>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Build your network. Add people who can refer you to jobs — recruiters, ex-colleagues, friends at target companies.
              </p>
              <Button className="mt-4 bg-ocean hover:bg-ocean/90" onClick={() => { setEditing(null); setCreating(true); setEditOpen(true); }}>
                <UserPlus className="mr-1.5 h-4 w-4" /> Add your first contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((r, i) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="h-full hover:shadow-ocean transition-all group">
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-ocean to-sky grid place-items-center text-white font-bold shrink-0">
                        {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{r.name}</h3>
                          {r.status === "starred" && (
                            <Star className="h-3.5 w-3.5 text-amber-500 shrink-0" fill="currentColor" />
                          )}
                        </div>
                        {r.role && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Briefcase className="h-3 w-3" /> {r.role}
                          </div>
                        )}
                        {r.company && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Building2 className="h-3 w-3" /> {r.company}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleStar(r)}
                          className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                          title={r.status === "starred" ? "Unstar" : "Star"}
                        >
                          <Star className={`h-3.5 w-3.5 ${r.status === "starred" ? "text-amber-500" : "text-muted-foreground"}`} fill={r.status === "starred" ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => { setEditing(r); setCreating(false); setEditOpen(true); }}
                          className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Contact methods */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.email && (
                        <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1 text-xs text-ocean hover:underline">
                          <Mail className="h-3 w-3" /> {r.email}
                        </a>
                      )}
                      {r.linkedinUrl && (
                        <a href={r.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-ocean hover:underline">
                          <Linkedin className="h-3 w-3" /> LinkedIn
                        </a>
                      )}
                      {r.phone && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" /> {r.phone}
                        </span>
                      )}
                    </div>

                    {r.notes && (
                      <p className="mt-3 text-xs text-muted-foreground bg-secondary/40 rounded-lg p-2 line-clamp-2">{r.notes}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <EditReferralDialog
        open={editOpen}
        referral={editing}
        creating={creating}
        onClose={() => { setEditOpen(false); setEditing(null); setCreating(false); }}
        onSaved={() => { setEditOpen(false); setEditing(null); setCreating(false); load(); }}
      />
    </div>
  );
}

function EditReferralDialog({
  open,
  referral,
  creating,
  onClose,
  onSaved,
}: {
  open: boolean;
  referral: Referral | null;
  creating: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    company: "",
    role: "",
    email: "",
    linkedinUrl: "",
    phone: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (referral) {
      setForm({
        name: referral.name,
        company: referral.company ?? "",
        role: referral.role ?? "",
        email: referral.email ?? "",
        linkedinUrl: referral.linkedinUrl ?? "",
        phone: referral.phone ?? "",
        notes: referral.notes ?? "",
      });
    } else {
      setForm({ name: "", company: "", role: "", email: "", linkedinUrl: "", phone: "", notes: "" });
    }
  }, [referral, open]);

  const save = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const url = creating ? "/api/referrals" : `/api/referrals/${referral?.id}`;
    const method = creating ? "POST" : "PUT";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        company: form.company || null,
        role: form.role || null,
        email: form.email || null,
        linkedinUrl: form.linkedinUrl || null,
        phone: form.phone || null,
        notes: form.notes || null,
      }),
    });
    setSaving(false);
    toast({ title: creating ? "Contact added" : "Contact updated" });
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-ocean" /> {creating ? "Add referral contact" : `Edit · ${referral?.name}`}
          </DialogTitle>
          <DialogDescription>Track someone who can refer you to jobs.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Name *">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sarah Chen" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company">
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Google" />
            </Field>
            <Field label="Role">
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Engineering Manager" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="sarah@google.com" />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+92 300 1234567" />
            </Field>
          </div>
          <Field label="LinkedIn URL">
            <Input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} placeholder="linkedin.com/in/sarahchen" />
          </Field>
          <Field label="Notes">
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Met at ReactConf 2024, offered to refer me. Follow up in 2 weeks." />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-ocean hover:bg-ocean/90" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            {creating ? "Add contact" : "Save changes"}
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
