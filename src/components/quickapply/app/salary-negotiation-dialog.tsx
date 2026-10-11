"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  HandCoins,
  Sparkles,
  Loader2,
  Check,
  Copy,
  TrendingUp,
  Target,
  AlertTriangle,
  Mail,
  Lightbulb,
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
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/lib/quickapply/types";

interface NegotiationResult {
  marketPosition: string;
  negotiationStrength: string;
  talkingPoints: string[];
  counterOfferRange: string;
  benefitsToNegotiate: string[];
  redFlags: string[];
  emailScript: string;
}

export function SalaryNegotiationDialog({
  open,
  onClose,
  application,
}: {
  open: boolean;
  onClose: () => void;
  application: Application | null;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NegotiationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!application) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/demo/salary-negotiation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("Generation failed. Please try again.");
    }
    setLoading(false);
  };

  const close = () => {
    onClose();
    setResult(null);
    setError(null);
  };

  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5 text-ocean" /> Salary Negotiation Tips
          </DialogTitle>
          <DialogDescription>
            AI-powered negotiation guidance for <span className="font-medium text-foreground">{application.jobTitle}</span> at {application.company}.
            {application.salaryRange && (
              <Badge variant="outline" className="ml-2 border-ocean/20 text-ocean bg-ocean/5 text-[10px]">
                {application.salaryRange}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        {!result && !error && (
          <div className="space-y-3">
            {!application.salaryRange ? (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <div className="text-sm font-medium">No salary range on this application</div>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Add a salary range to this application first, then we can generate tailored negotiation tips.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-border p-4 bg-secondary/30 text-center">
                <HandCoins className="h-10 w-10 text-ocean mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Get AI-powered negotiation tips based on the salary range, your profile, and local market data.
                </p>
              </div>
            )}
            <div className="flex justify-end">
              <Button className="bg-ocean hover:bg-ocean/90" onClick={generate} disabled={loading || !application.salaryRange}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate tips
              </Button>
            </div>
            {loading && (
              <div className="space-y-2 py-2">
                {["Analyzing salary range…", "Checking market position…", "Crafting talking points…", "Drafting email script…"].map((t, i) => (
                  <motion.div
                    key={t}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.7 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-ocean" />
                    {t}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Market position + strength */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-ocean/20 bg-ocean/5 p-3">
                <div className="text-xs font-semibold text-ocean flex items-center gap-1.5 mb-1">
                  <TrendingUp className="h-3.5 w-3.5" /> Market position
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{result.marketPosition}</p>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mb-1">
                  <Target className="h-3.5 w-3.5" /> Your leverage
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{result.negotiationStrength}</p>
              </div>
            </div>

            {/* Counter offer */}
            <div className="rounded-lg bg-gradient-to-r from-ocean/10 to-sky/10 border border-ocean/20 p-3 text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Suggested counter-offer</div>
              <div className="text-lg font-bold text-ocean">{result.counterOfferRange}</div>
            </div>

            {/* Talking points */}
            <Section title="Talking points" icon={Target} color="#0077B6" items={result.talkingPoints} />

            {/* Benefits */}
            <Section title="Benefits to negotiate" icon={Lightbulb} color="#f59e0b" items={result.benefitsToNegotiate} />

            {/* Red flags */}
            <Section title="Red flags to watch" icon={AlertTriangle} color="#e23b5a" items={result.redFlags} />

            {/* Email script */}
            <div className="rounded-lg bg-secondary/50 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-ocean" /> Negotiation email script
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.emailScript);
                    toast({ title: "Script copied" });
                  }}
                  className="text-muted-foreground hover:text-ocean transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-sm leading-relaxed">{result.emailScript}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setResult(null)}>Regenerate</Button>
              <Button size="sm" className="bg-ocean hover:bg-ocean/90" onClick={close}>
                <Check className="mr-1.5 h-3.5 w-3.5" /> Done
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, icon: Icon, color, items }: { title: string; icon: typeof Target; color: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" style={{ color }} /> {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-2 text-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
            <span className="text-foreground/90 leading-relaxed">{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
