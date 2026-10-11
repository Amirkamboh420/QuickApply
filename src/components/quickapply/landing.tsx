"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import {
  Zap,
  FileText,
  ShieldCheck,
  MousePointerClick,
  CheckCircle2,
  Globe,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Clock,
  Languages,
  Bell,
  Star,
  Quote,
  Chrome,
  RefreshCw,
  Layers,
  Target,
  BarChart3,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Compatibility", href: "#compat" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const SITES = [
  { name: "LinkedIn", color: "#0A66C2" },
  { name: "Indeed", color: "#003A9B" },
  { name: "Rozee.pk", color: "#E84B3C" },
  { name: "Mustakbil", color: "#0077B6" },
  { name: "Bayt", color: "#0a3d62" },
  { name: "Glassdoor", color: "#0CAA41" },
  { name: "Greenhouse", color: "#0077B6" },
  { name: "Lever", color: "#0a3d62" },
];

export function Landing({ onLaunch, onLogin, onSupport }: { onLaunch: () => void; onLogin?: () => void; onSupport?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* NAV */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-card shadow-ocean" : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Brand />
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-md transition-colors hover:bg-secondary/60"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              {onSupport && (
                <Button variant="ghost" size="sm" onClick={onSupport}>
                  Support
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onLogin ?? onLaunch}>
                Sign in
              </Button>
              <Button size="sm" onClick={onLaunch} className="bg-ocean hover:bg-ocean/90">
                Open Dashboard
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-secondary"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden glass-card border-t border-border"
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary"
                  >
                    {l.label}
                  </a>
                ))}
                <div className="flex items-center justify-between px-3 py-2 pt-3">
                  <span className="text-xs text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                <Button size="sm" className="w-full mt-2 bg-ocean hover:bg-ocean/90" onClick={onLaunch}>
                  Open Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Hero onLaunch={onLaunch} />
        <LogoStrip />
        <LiveActivity />
        <Problem />
        <HowItWorks />
        <Features />
        <ExtensionDemo />
        <Comparison />
        <Pricing onLaunch={onLaunch} />
        <Testimonials />
        <FAQ />
        <FinalCTA onLaunch={onLaunch} />
      </main>

      <SiteFooter />
    </div>
  );
}

function Brand() {
  return (
    <a href="#" className="flex items-center gap-2.5 group">
      <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-ink via-ocean to-sky shadow-ocean grid place-items-center overflow-hidden">
        <Zap className="h-5 w-5 text-white relative z-10" fill="white" />
        <div className="absolute inset-0 animate-shimmer" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight text-foreground">
          Quick<span className="text-ocean">Apply</span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          One-click apply
        </span>
      </div>
    </a>
  );
}

function Hero({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section className="relative overflow-hidden bg-mesh-ocean">
      <div className="absolute inset-0 bg-grid-ocean opacity-50" />
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-sky/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-ocean/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-5 bg-shore/40 text-ocean border-shore/60 hover:bg-shore/50">
              <Sparkles className="h-3 w-3" />
              Built for Pakistan, South Asia & beyond
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-foreground">
              Apply to any job in{" "}
              <span className="text-gradient-ocean">one click.</span>
              <br />
              Not one hundred.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Upload your resume once. QuickApply parses it with AI and auto-fills every
              job application form on LinkedIn, Indeed, Rozee.pk, Mustakbil & more —
              while you stay fully in control.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-ocean hover:bg-ocean/90 shadow-ocean" onClick={onLaunch}>
                <Chrome className="mr-2 h-5 w-5" />
                Add to Chrome — Free
              </Button>
              <Button size="lg" variant="outline" onClick={onLaunch}>
                Try the live demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-ocean" /> No auto-apply bots
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-ocean" /> Local portal support
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-ocean" /> Encrypted on-device
              </span>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              <Stat value={4.2} suffix=" hrs" label="saved / week" decimals={1} />
              <Stat value={20} suffix="+" label="sites supported" />
              <Stat value={96} suffix="%" label="fill accuracy" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, suffix, label, decimals = 0 }: { value: number; suffix?: string; label: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const duration = 1400;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(value * eased);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  const formatted = display.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div ref={ref}>
      <div className="text-2xl font-bold text-foreground tabular-nums">
        {formatted}
        <span className="text-ocean">{suffix}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-to-tr from-ocean/20 via-sky/20 to-foam/40 rounded-3xl blur-2xl" />
      <div className="relative glass-card rounded-2xl p-3 shadow-ocean-lg">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-2 pb-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <div className="ml-2 flex-1 h-7 rounded-md bg-white/70 dark:bg-white/5 border border-border flex items-center px-3 text-xs text-muted-foreground">
            <Globe className="h-3 w-3 mr-1.5" />
            careers.careem.com/apply
          </div>
        </div>
        {/* Form mockup */}
        <div className="rounded-xl bg-white dark:bg-card border border-border p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-ocean to-sky grid place-items-center">
                <Zap className="h-3.5 w-3.5 text-white" fill="white" />
              </div>
              <span className="text-xs font-semibold">QuickApply · auto-fill ready</span>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </Badge>
          </div>

          <AutoFillRow label="Full name" value="Ayesha Khan" filled delay={0.2} />
          <AutoFillRow label="Email" value="ayesha.khan@example.com" filled delay={0.35} />
          <AutoFillRow label="Phone" value="+92 300 1234567" filled delay={0.5} />
          <AutoFillRow label="Address" value="Lahore, Pakistan" filled delay={0.65} />

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-muted-foreground">
              <CheckCircle2 className="inline h-3 w-3 mr-1 text-emerald-500" />
              4 of 7 fields filled · resume attached
            </div>
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[11px] font-semibold text-ocean"
            >
              Ctrl+Shift+F
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating card */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-6 -left-6 hidden sm:block glass-card rounded-xl p-3 shadow-ocean w-44"
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/15 grid place-items-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs font-semibold">Application sent</div>
            <div className="text-[10px] text-muted-foreground">Saved 3 min 12 sec</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AutoFillRow({ label, value, filled, delay = 0 }: { label: string; value: string; filled?: boolean; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-lg px-3 py-2 border ${
        filled ? "border-emerald-400/60 bg-emerald-50/60 dark:bg-emerald-500/5" : "border-border"
      }`}
    >
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground flex items-center justify-between">
        <span>{value}</span>
        {filled && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring" }}
            className="text-emerald-500"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

function LogoStrip() {
  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Trust bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mb-8 pb-8 border-b border-border">
          <TrustItem value="12,400+" label="active job seekers" />
          <Divider />
          <TrustItem value="180k+" label="forms auto-filled" />
          <Divider />
          <div className="flex items-center gap-2">
            <div className="flex">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 text-amber-400" fill="currentColor" />
              ))}
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">4.8/5</div>
              <div className="text-[11px] text-muted-foreground">Chrome Store</div>
            </div>
          </div>
          <Divider />
          <TrustItem value="98%" label="would recommend" />
        </div>

        <p className="text-center text-xs uppercase tracking-[0.18em] text-muted-foreground mb-5">
          Auto-fills forms on the portals you actually use
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {SITES.map((s) => (
            <div key={s.name} className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-sm font-semibold text-foreground/80">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function Divider() {
  return <span className="hidden sm:block h-8 w-px bg-border" />;
}

interface ActivityItem {
  id: string;
  name: string;
  role: string;
  company: string;
  site: string;
  color: string;
  time: string;
}

const FALLBACK_ACTIVITIES: ActivityItem[] = [
  { id: "f1", name: "Hamza S.", role: "Software Engineer", company: "Careem", site: "LinkedIn", color: "#0A66C2", time: "just now" },
  { id: "f2", name: "Sana K.", role: "Marketing Lead", company: "Dastgyr", site: "Rozee.pk", color: "#E84B3C", time: "just now" },
  { id: "f3", name: "Bilal A.", role: "Full-Stack Developer", company: "Foodpanda", site: "Indeed", color: "#003A9B", time: "just now" },
  { id: "f4", name: "Ayesha M.", role: "Product Designer", company: "Bykea", site: "Mustakbil", color: "#0077B6", time: "just now" },
  { id: "f5", name: "Usman R.", role: "Data Analyst", company: "Afiniti", site: "Bayt", color: "#0a3d62", time: "just now" },
];

function LiveActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>(FALLBACK_ACTIVITIES);
  const [visible, setVisible] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Try to connect to the live WebSocket mini-service
    let socket: { close: () => void } | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    try {
      const io = (window as unknown as { io?: unknown }).io;
      if (typeof io === "function") {
        // socket.io client would be loaded via script; here we use the global
      }
    } catch {
      // ignore
    }

    // Use a lightweight approach: dynamically import socket.io-client if available,
    // otherwise fall back to interval rotation of fallback data.
    import("socket.io-client")
      .then(({ io }) => {
        if (cancelled) return;
        socket = io("/?XTransformPort=3004", { path: "/", transports: ["websocket", "polling"] });
        (socket as unknown as { on: (e: string, cb: (...a: unknown[]) => void) => void }).on("connect", () => setConnected(true));
        (socket as unknown as { on: (e: string, cb: (...a: unknown[]) => void) => void }).on("disconnect", () => setConnected(false));
        (socket as unknown as { on: (e: string, cb: (...a: unknown[]) => void) => void }).on("recent-activities", (acts: unknown) => {
          if (Array.isArray(acts) && acts.length) {
            setActivities(acts as ActivityItem[]);
            setVisible(0);
          }
        });
        (socket as unknown as { on: (e: string, cb: (...a: unknown[]) => void) => void }).on("new-activity", (act: unknown) => {
          setActivities((prev) => [act as ActivityItem, ...prev].slice(0, 10));
          setVisible(0);
        });
      })
      .catch(() => {
        // socket.io-client not available — use fallback rotation
      });

    // Rotate visible activity every 3s (works for both live and fallback)
    interval = setInterval(() => {
      setVisible((v) => (v + 1) % Math.min(activities.length, 5));
    }, 3000);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      if (socket) (socket as { close: () => void }).close();
    };
  }, [activities.length]);

  const current = activities[visible] ?? FALLBACK_ACTIVITIES[0];

  return (
    <section className="py-10 border-b border-border bg-gradient-to-b from-secondary/20 to-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
            {connected ? "Live now · real applications being filled" : "Live now · recent applications"}
          </p>
          {connected && (
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/5 text-[9px] ml-1">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse mr-1" /> LIVE
            </Badge>
          )}
        </div>

        <div className="relative h-20 sm:h-16 max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id ?? visible}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <div className="flex items-center gap-3 rounded-xl glass-card border border-border px-4 py-3 shadow-ocean">
                <div
                  className="h-9 w-9 rounded-full grid place-items-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: current?.color ?? "#0077B6" }}
                >
                  {(current?.name ?? "QA").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium truncate">
                    <span className="text-ocean">{current?.name}</span> just auto-filled a{" "}
                    <span className="font-semibold">{current?.role}</span> application
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    at {current?.company} via {current?.site} · {current?.time ?? "just now"}
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-[10px] hidden sm:flex shrink-0">
                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Sent
                </Badge>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Join <span className="font-semibold text-foreground">12,400+ job seekers</span> saving hours every week with QuickApply
        </p>
      </div>
    </section>
  );
}

function Problem() {
  const pains = [
    {
      icon: Clock,
      title: "Same data, retyped 100 times",
      body: "Every portal asks for your name, email, phone, education & work history. Retyping it all wastes hours every single week.",
    },
    {
      icon: X,
      title: "Typos when you rush",
      body: "Apply fast = mistakes. A single digit off in your phone number and a recruiter can never reach you back.",
    },
    {
      icon: Layers,
      title: "Local portals ignored",
      body: "International auto-fill tools skip Rozee.pk, Mustakbil & Indeed Pakistan entirely. You're back to typing manually.",
    },
  ];
  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="The problem"
          title="Job hunting feels like data entry, not job hunting."
          subtitle="The average active applicant fills 12-20 forms a week. That's not networking — that's keyboard gymnastics."
        />
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {pains.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full border-border hover:border-ocean/40 hover:shadow-ocean transition-all">
                <CardContent className="pt-6">
                  <div className="h-11 w-11 rounded-xl bg-ocean/10 grid place-items-center mb-4">
                    <p.icon className="h-5 w-5 text-ocean" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      icon: FileText,
      title: "Upload your resume",
      body: "Drag a PDF or DOCX into QuickApply. Our AI parses your name, contact info, education, experience & skills in seconds.",
    },
    {
      n: "02",
      icon: MousePointerClick,
      title: "Review & confirm",
      body: "Quickly verify the extracted data in a clean editor. Save multiple profiles for different roles — SWE, marketing, etc.",
    },
    {
      n: "03",
      icon: Zap,
      title: "Hit one-click fill",
      body: "Open any job application form, click the QuickApply toolbar icon (or Ctrl+Shift+F). Fields fill instantly with green highlights.",
    },
    {
      n: "04",
      icon: BarChart3,
      title: "Track everything",
      body: "QuickApply logs every application, reminds you to follow up, and shows response rates so you know what's working.",
    },
  ];
  return (
    <section id="how" className="py-20 lg:py-24 bg-secondary/30 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="How it works"
          title="From resume to applied in under 10 seconds."
          subtitle="No bots, no spam. QuickApply fills the form — you review and hit submit."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card className="h-full relative overflow-hidden hover:shadow-ocean transition-all">
                <div className="absolute -top-3 -right-3 text-7xl font-black text-ocean/5 select-none">
                  {s.n}
                </div>
                <CardContent className="pt-6 relative">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-ocean to-sky grid place-items-center mb-4 shadow-ocean">
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: Sparkles, title: "AI resume parsing", body: "Claude-powered extraction of structured data from PDF & DOCX resumes — with a manual review step." },
    { icon: Layers, title: "Multiple profiles", body: "Maintain a Software Engineer profile and a Marketing profile. Switch with one click before applying." },
    { icon: FileText, title: "Cover letter auto-fill", body: "Saved templates with AI tailoring per job description. No more rewriting from scratch." },
    { icon: MousePointerClick, title: "Field-by-field highlight", body: "Filled fields glow green so you can review at a glance. Undo or clear with one click." },
    { icon: Globe, title: "Local portal support", body: "Rozee.pk, Mustakbil, Bayt & Indeed Pakistan work out of the box — not just LinkedIn." },
    { icon: Target, title: "Duplicate application warning", body: "QuickApply warns you if you've already applied to the same job, so you never apply twice." },
    { icon: ShieldCheck, title: "Local encryption", body: "Your resume & personal data stay encrypted on your device. We never sell data, ever." },
    { icon: Bell, title: "Follow-up reminders", body: "No reply in a week? QuickApply nudges you to send a polite follow-up automatically." },
    { icon: Languages, title: "Urdu & English labels", body: "Detects form labels in both Urdu and English for accurate field mapping on local portals." },
  ];
  return (
    <section id="features" className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Features"
          title="Everything an active applicant actually needs."
          subtitle="Phase 1 essentials plus the smart detection & multi-profile superpowers from Phase 2."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.35, delay: (i % 3) * 0.08 }}
            >
              <Card className="h-full group hover:border-ocean/40 hover:-translate-y-0.5 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="h-11 w-11 rounded-xl bg-ocean/10 grid place-items-center mb-4 group-hover:bg-ocean group-hover:text-white transition-colors">
                    <f.icon className="h-5 w-5 text-ocean group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExtensionDemo() {
  return (
    <section id="compat" className="py-20 lg:py-24 bg-gradient-to-b from-secondary/30 to-background border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-sky/15 text-ocean border-sky/30">
              <Sparkles className="h-3 w-3" /> Live detection
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Detects the right field — even when the form gets weird.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              QuickApply's detection engine understands text inputs, dropdowns, radio buttons, checkboxes,
              file uploads and even multi-section ATS forms (Greenhouse, Lever). It maps fields by label
              text, placeholder, aria attributes and surrounding context — so the right data lands in the
              right box, every time.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Smart label matching in English + Urdu",
                "Auto-attaches resume & cover letter files",
                "Custom field mapping when auto-detect misses",
                "Per-site templates for top portals",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-ocean shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/90">{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <DetectionVisual />
        </div>
      </div>
    </section>
  );
}

function DetectionVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="glass-card rounded-2xl p-4 shadow-ocean-lg">
        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Detected fields on this page
          </div>
          {[
            { label: "Full name", type: "text", status: "matched" },
            { label: "Email address", type: "email", status: "matched" },
            { label: "Years of experience", type: "select", status: "matched" },
            { label: "Willing to relocate?", type: "radio", status: "matched" },
            { label: "Resume (PDF)", type: "file", status: "matched" },
            { label: "Cover letter", type: "file", status: "optional" },
          ].map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 bg-secondary/30"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    f.status === "matched" ? "bg-emerald-500" : "bg-amber-400"
                  }`}
                />
                <span className="text-sm font-medium">{f.label}</span>
                <Badge variant="outline" className="text-[10px] py-0">{f.type}</Badge>
              </div>
              <span className={`text-xs ${f.status === "matched" ? "text-emerald-600" : "text-amber-600"}`}>
                {f.status === "matched" ? "auto-filled" : "skipped"}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Comparison() {
  const rows = [
    { feature: "LinkedIn support", qa: true, simplify: true, lazy: true, teal: true },
    { feature: "Indeed support", qa: true, simplify: true, lazy: true, teal: true },
    { feature: "Rozee.pk support", qa: true, simplify: false, lazy: false, teal: false },
    { feature: "Mustakbil support", qa: true, simplify: false, lazy: false, teal: false },
    { feature: "AI resume parsing", qa: true, simplify: true, lazy: false, teal: true },
    { feature: "Multiple profiles", qa: true, simplify: true, lazy: false, teal: true },
    { feature: "Auto-fill (not auto-apply)", qa: true, simplify: true, lazy: false, teal: true },
    { feature: "Local payment options", qa: true, simplify: false, lazy: false, teal: false },
    { feature: "Affordable local pricing", qa: true, simplify: false, lazy: false, teal: false },
  ];
  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Why QuickApply"
          title="The only auto-filler built for local job portals."
          subtitle="International tools skip Rozee.pk & Mustakbil. We don't."
        />
        <Card className="mt-12 overflow-hidden border-border">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-5 py-4 font-semibold">Capability</th>
                  <th className="px-5 py-4 font-semibold text-ocean">
                    <div className="flex flex-col items-center">
                      <span>QuickApply</span>
                      <span className="text-[10px] font-normal text-muted-foreground">built here</span>
                    </div>
                  </th>
                  <th className="px-5 py-4 font-semibold text-muted-foreground">Simplify</th>
                  <th className="px-5 py-4 font-semibold text-muted-foreground">LazyApply</th>
                  <th className="px-5 py-4 font-semibold text-muted-foreground">Teal</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.feature} className={i % 2 ? "bg-secondary/20" : ""}>
                    <td className="px-5 py-3 font-medium">{r.feature}</td>
                    <td className="px-5 py-3 text-center">
                      <Cell ok={r.qa} highlight />
                    </td>
                    <td className="px-5 py-3 text-center"><Cell ok={r.simplify} /></td>
                    <td className="px-5 py-3 text-center"><Cell ok={r.lazy} /></td>
                    <td className="px-5 py-3 text-center"><Cell ok={r.teal} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </section>
  );
}

function Cell({ ok, highlight }: { ok: boolean; highlight?: boolean }) {
  return ok ? (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
        highlight ? "bg-ocean text-white" : "bg-emerald-500/15 text-emerald-600"
      }`}
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
    </span>
  ) : (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <X className="h-3.5 w-3.5" />
    </span>
  );
}

function Pricing({ onLaunch }: { onLaunch: () => void }) {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      tagline: "For getting started",
      features: ["1 resume profile", "Basic auto-fill", "Top 3 sites supported", "Local encryption", "Community support"],
      cta: "Get started free",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$6",
      period: "/month",
      tagline: "For active job seekers",
      features: ["Unlimited profiles", "AI resume tailoring", "All supported sites", "Application tracking", "Follow-up reminders", "Cover letter templates", "Chrome sync across devices"],
      cta: "Start 14-day trial",
      highlight: true,
    },
    {
      name: "Career Coach",
      price: "$18",
      period: "/month",
      tagline: "For coaches & teams",
      features: ["Everything in Pro", "Manage 10+ client profiles", "Bulk application assistant", "Shared templates", "Priority support", "Coach dashboard"],
      cta: "Talk to us",
      highlight: false,
    },
  ];
  return (
    <section id="pricing" className="py-20 lg:py-24 bg-secondary/30 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Pricing"
          title="Free to start. Affordable to upgrade."
          subtitle="Pay in USD via Stripe, or locally via JazzCash & EasyPaisa. Cancel anytime."
        />
        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((p) => (
            <Card
              key={p.name}
              className={`relative flex flex-col ${
                p.highlight ? "border-ocean shadow-ocean-lg ring-2 ring-ocean/20 scale-[1.02]" : "border-border"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-ocean text-white border-ocean shadow-ocean">
                    <Star className="h-3 w-3" /> Most popular
                  </Badge>
                </div>
              )}
              <CardContent className="pt-6 flex flex-col h-full">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{p.tagline}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.period}</span>
                </div>
                <Separator className="my-5" />
                <ul className="space-y-2.5 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-ocean shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-6 w-full ${p.highlight ? "bg-ocean hover:bg-ocean/90" : ""}`}
                  variant={p.highlight ? "default" : "outline"}
                  onClick={onLaunch}
                >
                  {p.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      quote: "I applied to 38 jobs in a week instead of my usual 12. QuickApply filled every Rozee.pk form perfectly. Game changer.",
      name: "Hamza Sheikh",
      role: "Fresh grad, NED University",
      avatar: "HS",
    },
    {
      quote: "As a career coach I manage 12 clients. The Pro tier lets me switch profiles instantly and never mix up a cover letter again.",
      name: "Sana Tariq",
      role: "Career coach, Lahore",
      avatar: "ST",
    },
    {
      quote: "Finally a tool that understands Mustakbil. The Urdu label detection is shockingly good — it caught fields I almost missed.",
      name: "Bilal Ahmed",
      role: "Full-stack developer",
      avatar: "BA",
    },
  ];
  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Loved by job seekers"
          title="Real applicants. Real time saved."
          subtitle=""
        />
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="h-full hover:shadow-ocean transition-all">
                <CardContent className="pt-6 flex flex-col h-full">
                  <Quote className="h-7 w-7 text-sky/40 mb-3" />
                  <p className="text-sm text-foreground/90 leading-relaxed flex-1">"{t.quote}"</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-ocean to-sky grid place-items-center text-white text-xs font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Is QuickApply an auto-apply bot?", a: "No. QuickApply auto-fills forms — you always review and hit submit yourself. We never submit applications on your behalf, which keeps your account safe and your applications genuine." },
    { q: "Where is my resume data stored?", a: "Your data is encrypted and stored locally on your device by default. Pro users can optionally enable Chrome Sync to mirror profiles across devices. We never sell or share your data." },
    { q: "Does it really work on Rozee.pk and Mustakbil?", a: "Yes. Local portal support is our key differentiator. We maintain per-site field templates that we verify regularly, so detection stays accurate even as portals update their layouts." },
    { q: "What if a field isn't detected?", a: "You can use the custom field-mapping screen to map any unrecognized field yourself. Your mapping is saved for that site, so next time it just works." },
    { q: "Can I pay in PKR via JazzCash or EasyPaisa?", a: "Yes. Alongside Stripe for international users, Pro and Career Coach plans support JazzCash and EasyPaisa for local Pakistani payments." },
    { q: "Is there a free plan?", a: "Absolutely. The Free plan includes 1 resume profile, basic auto-fill, and the top 3 supported sites — no time limit, no credit card." },
  ];
  return (
    <section id="faq" className="py-20 lg:py-24 bg-secondary/30 border-y border-border">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="FAQ" title="Questions, answered." subtitle="" />
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function FinalCTA({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-ocean to-sky p-10 sm:p-16 text-center shadow-ocean-lg">
          <div className="absolute inset-0 bg-grid-ocean opacity-20" />
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <RefreshCw className="h-10 w-10 text-white/90 mx-auto mb-5" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Stop typing. Start applying.
            </h2>
            <p className="mt-4 text-white/80 max-w-xl mx-auto">
              Install QuickApply, upload your resume, and turn your next 100 applications into 100 clicks.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-ocean hover:bg-foam"
                onClick={onLaunch}
              >
                <Chrome className="mr-2 h-5 w-5" /> Add to Chrome — Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 hover:text-white"
                onClick={onLaunch}
              >
                Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-foam/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky to-foam grid place-items-center">
                <Zap className="h-5 w-5 text-ink" fill="currentColor" />
              </div>
              <span className="text-lg font-bold text-white">
                Quick<span className="text-sky">Apply</span>
              </span>
            </div>
            <p className="mt-4 text-sm max-w-xs text-foam/60">
              The one-click job application auto-filler built for Pakistan, South Asia & beyond.
              Auto-fill, never auto-apply.
            </p>
            <div className="mt-5 flex gap-2">
              <Badge variant="outline" className="border-white/20 text-foam/70">Manifest V3</Badge>
              <Badge variant="outline" className="border-white/20 text-foam/70">GDPR-ready</Badge>
            </div>
          </div>
          <FooterCol title="Product" links={["Features", "Pricing", "Compatibility", "Changelog", "Roadmap"]} />
          <FooterCol title="Company" links={["About", "Blog", "Careers", "Contact"]} />
          <FooterCol title="Legal" links={["Privacy Policy", "Terms", "Data Deletion", "Chrome Store Policy"]} />
        </div>
        <Separator className="my-8 bg-white/10" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foam/50">
          <div>© {new Date().getFullYear()} QuickApply. Built with care for job seekers.</div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-sm text-foam/60 hover:text-foam transition-colors">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <Badge variant="outline" className="mb-3 border-ocean/30 text-ocean bg-ocean/5">
        {eyebrow}
      </Badge>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
