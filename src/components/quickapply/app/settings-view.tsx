"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Bell,
  RefreshCw,
  Languages,
  Keyboard,
  CreditCard,
  User,
  Check,
  Loader2,
  Zap,
  Star,
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function SettingsView() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  const update = (key: string, value: string) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    toast({ title: "Settings saved" });
  };

  const bool = (v?: string) => v === "true";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Control auto-fill behavior, privacy, sync & notifications.
        </p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-ocean" /> Account
          </CardTitle>
          <CardDescription>Your QuickApply account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-ocean to-sky grid place-items-center text-white font-bold">
              AK
            </div>
            <div>
              <div className="font-medium">Ayesha Khan</div>
              <div className="text-sm text-muted-foreground">ayesha.khan@example.com</div>
            </div>
            <Badge className="ml-auto bg-ocean text-white border-ocean">
              <Star className="h-3 w-3 mr-0.5" fill="white" /> Pro plan
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Auto-fill behavior */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4.5 w-4.5 text-ocean" /> Auto-fill behavior
          </CardTitle>
          <CardDescription>How QuickApply fills forms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            icon={ShieldCheck}
            title="Highlight filled fields"
            desc="Show a green outline around fields QuickApply has filled"
            checked={bool(settings.autoFillHighlight)}
            onChange={(v) => update("autoFillHighlight", String(v))}
          />
          <Separator />
          <ToggleRow
            icon={Bell}
            title="Duplicate application warning"
            desc="Warn me if I've already applied to the same job"
            checked={bool(settings.duplicateWarning)}
            onChange={(v) => update("duplicateWarning", String(v))}
          />
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-ocean/10 grid place-items-center shrink-0">
                <Keyboard className="h-4.5 w-4.5 text-ocean" />
              </div>
              <div>
                <div className="text-sm font-medium">Quick-fill shortcut</div>
                <div className="text-xs text-muted-foreground">Trigger auto-fill from your keyboard</div>
              </div>
            </div>
            <Input
              value={settings.shortcut ?? ""}
              onChange={(e) => update("shortcut", e.target.value)}
              className="w-40 font-mono text-sm"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-ocean/10 grid place-items-center shrink-0">
                <Languages className="h-4.5 w-4.5 text-ocean" />
              </div>
              <div>
                <div className="text-sm font-medium">Form label language</div>
                <div className="text-xs text-muted-foreground">Detect labels in this language too</div>
              </div>
            </div>
            <Select value={settings.language ?? "en"} onValueChange={(v) => update("language", v)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ur">Urdu + English</SelectItem>
                <SelectItem value="hi">Hindi + English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & sync */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="h-4.5 w-4.5 text-ocean" /> Privacy & sync
          </CardTitle>
          <CardDescription>Your data stays yours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            icon={RefreshCw}
            title="Chrome sync across devices"
            desc="Mirror your profiles to other signed-in Chrome instances"
            checked={bool(settings.syncEnabled)}
            onChange={(v) => update("syncEnabled", String(v))}
          />
          <Separator />
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-start gap-3">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-foreground/80">
              <span className="font-semibold text-emerald-700">Your data is encrypted on-device.</span>{" "}
              Resumes and personal information never leave your device unless you enable Chrome Sync.
              We never sell or share your data.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4.5 w-4.5 text-ocean" /> Billing & plan
          </CardTitle>
          <CardDescription>Manage your subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Pro plan</span>
                <Badge className="bg-ocean text-white border-ocean">$6/mo</Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Renews Dec 15, 2025 · via JazzCash</div>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              <CreditCard className="mr-2 h-3.5 w-3.5" /> Switch to Stripe
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <CreditCard className="mr-2 h-3.5 w-3.5" /> Switch to EasyPaisa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save bar */}
      <div className="sticky bottom-4 flex justify-end">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Button className="bg-ocean hover:bg-ocean/90 shadow-ocean-lg" onClick={save} disabled={!loaded || saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Save changes
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  desc,
  checked,
  onChange,
}: {
  icon: typeof ShieldCheck;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-ocean/10 grid place-items-center shrink-0">
          <Icon className="h-4.5 w-4.5 text-ocean" />
        </div>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
