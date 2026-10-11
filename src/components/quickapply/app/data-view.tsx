"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  Database,
  AlertTriangle,
  Check,
  Loader2,
  Archive,
  RefreshCw,
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
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type DataType = "applications" | "profiles";
type Format = "json" | "csv";

export function DataView() {
  const { toast } = useToast();
  const [importOpen, setImportOpen] = useState(false);
  const [importData, setImportData] = useState<{ type: DataType; data: unknown[]; fileName: string } | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [importing, setImporting] = useState(false);

  const handleExport = useCallback(async (type: DataType, format: Format) => {
    const res = await fetch(`/api/export?type=${type}&format=${format}`);
    if (!res.ok) {
      toast({ title: "Export failed", variant: "destructive" });
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quickapply-${type}-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${type}`, description: `${format.toUpperCase()} file downloaded.` });
  }, [toast]);

  const handleFileSelect = (type: DataType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = String(ev.target?.result ?? "");
        let data: unknown[];
        if (file.name.endsWith(".json")) {
          const parsed = JSON.parse(text);
          data = Array.isArray(parsed) ? parsed : (parsed.data ?? []);
        } else {
          // CSV parse
          data = parseCSV(text);
        }
        setImportData({ type, data, fileName: file.name });
        setImportOpen(true);
      } catch {
        toast({ title: "Could not parse file", description: "Ensure it's valid JSON or CSV.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const confirmImport = async () => {
    if (!importData) return;
    setImporting(true);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: importData.type, data: importData.data, mode: importMode }),
      });
      const result = await res.json();
      toast({
        title: "Import complete",
        description: `${result.created} imported, ${result.skipped} skipped.`,
      });
      setImportOpen(false);
      setImportData(null);
    } catch {
      toast({ title: "Import failed", variant: "destructive" });
    }
    setImporting(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          Data Management
          <Badge variant="outline" className="border-ocean/20 text-ocean bg-ocean/5">
            <Database className="h-3 w-3 mr-0.5" /> Backup & portability
          </Badge>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Export your applications & profiles, or import them from another device.
        </p>
      </div>

      {/* Export section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4.5 w-4.5 text-ocean" /> Export data
          </CardTitle>
          <CardDescription>Download your data as JSON (full detail) or CSV (spreadsheet-friendly)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExportRow
            title="Applications"
            desc="All tracked job applications with status, salary, dates"
            onJson={() => handleExport("applications", "json")}
            onCsv={() => handleExport("applications", "csv")}
          />
          <ExportRow
            title="Profiles"
            desc="All resume profiles with education, experience, skills"
            onJson={() => handleExport("profiles", "json")}
            onCsv={() => handleExport("profiles", "csv")}
          />
        </CardContent>
      </Card>

      {/* Import section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4.5 w-4.5 text-ocean" /> Import data
          </CardTitle>
          <CardDescription>Restore from a backup or move data from another device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImportRow
            title="Import applications"
            desc="Upload a JSON or CSV file of applications"
            icon={Archive}
            onFile={handleFileSelect("applications")}
          />
          <ImportRow
            title="Import profiles"
            desc="Upload a JSON or CSV file of resume profiles"
            icon={Archive}
            onFile={handleFileSelect("profiles")}
          />
        </CardContent>
      </Card>

      {/* Info banner */}
      <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
        <CardContent className="py-4 flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-500/10 grid place-items-center shrink-0">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
          </div>
          <div className="text-sm">
            <div className="font-medium">About import modes</div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              <span className="font-medium text-foreground">Merge</span> adds new records alongside existing ones (recommended).
              <span className="font-medium text-foreground"> Replace</span> deletes all existing records of that type first,
              then imports. Replace cannot be undone — export a backup first.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Import confirm dialog */}
      <Dialog open={importOpen} onOpenChange={(o) => !o && setImportOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-ocean" /> Confirm import
            </DialogTitle>
            <DialogDescription>
              You're about to import {importData?.data.length ?? 0} {importData?.type} from{" "}
              <span className="font-mono text-xs">{importData?.fileName}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">Import mode</Label>
            <RadioGroup value={importMode} onValueChange={(v) => setImportMode(v as "merge" | "replace")}>
              <label className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${importMode === "merge" ? "border-ocean bg-ocean/5" : "border-border hover:border-ocean/40"}`}>
                <RadioGroupItem value="merge" className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 text-ocean" /> Merge
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Add to existing records (recommended)</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${importMode === "replace" ? "border-red-500 bg-red-500/5" : "border-border hover:border-red-500/40"}`}>
                <RadioGroupItem value="replace" className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> Replace all
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Delete existing records first — cannot be undone</p>
                </div>
              </label>
            </RadioGroup>
            {importMode === "replace" && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                This will permanently delete all your existing {importData?.type} before importing.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button
              className={importMode === "replace" ? "bg-red-500 hover:bg-red-600" : "bg-ocean hover:bg-ocean/90"}
              onClick={confirmImport}
              disabled={importing}
            >
              {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Import {importData?.data.length ?? 0} records
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExportRow({ title, desc, onJson, onCsv }: { title: string; desc: string; onJson: () => void; onCsv: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-ocean/40 transition-colors group"
    >
      <div className="h-10 w-10 rounded-lg bg-ocean/10 grid place-items-center shrink-0">
        <Archive className="h-5 w-5 text-ocean" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onJson} className="h-8">
          <FileJson className="mr-1.5 h-3.5 w-3.5" /> JSON
        </Button>
        <Button size="sm" variant="outline" onClick={onCsv} className="h-8">
          <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> CSV
        </Button>
      </div>
    </motion.div>
  );
}

function ImportRow({ title, desc, icon: Icon, onFile }: { title: string; desc: string; icon: typeof Archive; onFile: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-ocean/40 transition-colors"
    >
      <div className="h-10 w-10 rounded-lg bg-sky/10 grid place-items-center shrink-0">
        <Icon className="h-5 w-5 text-sky" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <label className="cursor-pointer">
        <input type="file" accept=".json,.csv" onChange={onFile} className="hidden" />
        <span className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 bg-ocean text-white hover:bg-ocean/90 transition-colors">
          <Upload className="mr-1.5 h-3.5 w-3.5" /> Choose file
        </span>
      </label>
    </motion.div>
  );
}

// Simple CSV parser (handles quoted fields)
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        out.push(cur); cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out;
  };
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = parseLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return obj;
  });
}
