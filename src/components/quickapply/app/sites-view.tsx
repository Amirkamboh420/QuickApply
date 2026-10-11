"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Globe2,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Wrench,
  ExternalLink,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { SiteTemplate } from "@/lib/quickapply/types";

const SITE_LOGOS: Record<string, string> = {
  LinkedIn: "#0A66C2",
  Indeed: "#003A9B",
  "Rozee.pk": "#E84B3C",
  Mustakbil: "#0077B6",
  Bayt: "#0a3d62",
  Glassdoor: "#0CAA41",
  Greenhouse: "#0077B6",
  Lever: "#0a3d62",
};

export function SitesView() {
  const [sites, setSites] = useState<SiteTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sites").then((r) => r.json()).then((s) => {
      setSites(s);
      setLoading(false);
    });
  }, []);

  const filtered = sites.filter((s) =>
    s.siteName.toLowerCase().includes(search.toLowerCase()) ||
    s.domain.toLowerCase().includes(search.toLowerCase()),
  );

  const avgRate = sites.length
    ? Math.round(sites.reduce((a, s) => a + s.successRate, 0) / sites.length)
    : 0;
  const activeCount = sites.filter((s) => s.status === "active").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Site Compatibility</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Job portals QuickApply can auto-fill — with live health & accuracy stats.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="h-10 w-10 rounded-xl bg-ocean/10 grid place-items-center mb-3">
              <Globe2 className="h-5 w-5 text-ocean" />
            </div>
            <div className="text-2xl font-bold">{sites.length}</div>
            <div className="text-xs text-muted-foreground">Supported sites</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 grid place-items-center mb-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold">{activeCount}</div>
            <div className="text-xs text-muted-foreground">Active & verified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="h-10 w-10 rounded-xl bg-sky/10 grid place-items-center mb-3">
              <ShieldCheck className="h-5 w-5 text-sky" />
            </div>
            <div className="text-2xl font-bold">{avgRate}%</div>
            <div className="text-xs text-muted-foreground">Avg fill accuracy</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sites…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Sites grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-5 h-32 bg-muted/30 animate-pulse" /></Card>
            ))
          : filtered.map((s, i) => {
              const color = SITE_LOGOS[s.siteName] ?? s.logoColor;
              const features = s.supportedFeatures.split(",").filter(Boolean);
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="hover:shadow-ocean hover:border-ocean/30 transition-all">
                    <CardContent className="pt-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-11 w-11 rounded-xl grid place-items-center text-white text-sm font-bold shrink-0"
                            style={{ backgroundColor: color }}
                          >
                            {s.siteName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold leading-tight">{s.siteName}</h3>
                            <a
                              href={`https://${s.domain}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-muted-foreground hover:text-ocean flex items-center gap-1"
                            >
                              {s.domain} <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" /> Active
                        </Badge>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">Fill accuracy</span>
                          <span className="font-semibold">{s.successRate}%</span>
                        </div>
                        <Progress value={s.successRate} className="h-1.5" />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {features.map((f) => (
                          <Badge key={f} variant="outline" className="text-[10px] bg-secondary/60 border-border">
                            {f}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Verified {new Date(s.lastVerifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        <span className="ml-auto flex items-center gap-1 text-emerald-600">
                          <Wrench className="h-3 w-3" /> Template maintained
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
      </div>

      <Card className="bg-gradient-to-br from-ink to-ocean text-white border-0">
        <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div>
            <h3 className="font-semibold text-lg">Don't see your portal?</h3>
            <p className="text-sm text-foam/70 mt-1">
              Request a new site and we'll add a verified template within 2 weeks.
            </p>
          </div>
          <Badge className="bg-white/15 text-white border-white/20">+3 added this month</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
