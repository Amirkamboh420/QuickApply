"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Sparkles,
  Loader2,
  Check,
  Copy,
  Send,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/lib/quickapply/types";

const TONES = [
  { value: "professional", label: "Professional", desc: "Polite & concise" },
  { value: "friendly", label: "Friendly", desc: "Warm & conversational" },
  { value: "eager", label: "Eager", desc: "Enthusiastic" },
  { value: "concise", label: "Concise", desc: "2-3 sentences" },
];

export function FollowupEmailDialog({
  open,
  onClose,
  application,
}: {
  open: boolean;
  onClose: () => void;
  application: Application | null;
}) {
  const { toast } = useToast();
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);

  const generate = async () => {
    if (!application) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/demo/followup-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id, tone }),
      });
      const data = await res.json();
      if (data.error) {
        toast({ title: data.error, variant: "destructive" });
      } else {
        setResult(data);
      }
    } catch {
      toast({ title: "Generation failed", variant: "destructive" });
    }
    setLoading(false);
  };

  const copyEmail = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    toast({ title: "Email copied to clipboard" });
  };

  const close = () => {
    onClose();
    setResult(null);
  };

  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-ocean" /> AI Follow-up Email
          </DialogTitle>
          <DialogDescription>
            Generate a polite follow-up email for <span className="font-medium text-foreground">{application.jobTitle}</span> at {application.company}.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Email tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label} — {t.desc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email preview mockup */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-secondary/50 px-3 py-2 border-b border-border flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-ocean to-sky grid place-items-center text-white text-[10px] font-bold">
                  {application.company.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground">
                  To: <span className="text-foreground">{application.company} Hiring</span>
                </div>
              </div>
              <div className="p-4 space-y-2 min-h-[120px]">
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                        className="h-3 bg-muted rounded"
                        style={{ width: `${80 - i * 15}%` }}
                      />
                    ))}
                    <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin text-ocean" />
                      Drafting your follow-up email…
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground/60 italic">
                    Click "Generate email" to draft a follow-up…
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="bg-ocean hover:bg-ocean/90" onClick={generate} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate email
              </Button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Email mockup with generated content */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-secondary/50 px-3 py-2 border-b border-border flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-ocean to-sky grid place-items-center text-white text-[10px] font-bold">
                  {application.company.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground flex-1">
                  To: <span className="text-foreground">hiring@{application.company.toLowerCase().replace(/[^a-z]/g, "")}.com</span>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-[9px]">
                  <Check className="h-2.5 w-2.5 mr-0.5" /> Draft ready
                </Badge>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Subject</div>
                  <div className="text-sm font-medium">{result.subject}</div>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Body</div>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">{result.body}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setResult(null)}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={copyEmail}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy email
              </Button>
              <Button size="sm" className="bg-ocean hover:bg-ocean/90" onClick={close}>
                <Send className="mr-1.5 h-3.5 w-3.5" /> Done
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
