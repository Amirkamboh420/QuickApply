"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LifeBuoy,
  Search,
  ArrowLeft,
  Send,
  Ticket,
  Mail,
  Clock,
  Twitter,
  Github,
  Linkedin,
  MessageCircle,
  Loader2,
  Inbox,
  CheckCircle2,
  Sparkles,
  Zap,
  RefreshCw,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
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
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";

interface SupportTicket {
  id: string;
  userEmail: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  priority: string;
  reply: string | null;
  createdAt: string;
}

type Category = "Bug" | "How-to" | "Billing" | "Feature Request" | "General";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Why isn't the auto-fill working on a specific job site?",
    a: "First, make sure the QuickApply extension is enabled in your browser and you've selected a default profile. If a field is being skipped, open Field Mapping from the sidebar and add a custom CSS selector override for that site. Our AI parser detects common fields automatically; for unusual layouts, a one-time manual mapping fixes it permanently. You can also try re-parsing your resume — sometimes a re-parsed resume with cleaner formatting improves detection.",
  },
  {
    q: "How do I add or switch between multiple profiles?",
    a: "Open the Profiles section in the dashboard and click 'Add profile'. You can create as many profiles as you like — for example, one tailored to software engineering roles and another for marketing. Set any profile as the default to use it for auto-fill. Profiles are stored locally and synced through Chrome Sync if enabled, so your data follows you across signed-in browsers.",
  },
  {
    q: "What payment methods does QuickApply accept?",
    a: "We accept Stripe (Visa, Mastercard, AMEX) for international users, and JazzCash + EasyPaisa for users in Pakistan. Manage your plan and payment method from Settings → Billing. You can upgrade, downgrade, or cancel at any time — changes take effect at the next billing cycle.",
  },
  {
    q: "How is my data protected and who can see it?",
    a: "Your resume and profile data are stored locally on your device and encrypted in transit. QuickApply never sells your data. The Chrome Sync option (off by default) lets you sync profiles across your own signed-in browsers using Chrome's encrypted sync. Application logs are only visible to you. See our Privacy Policy for full details.",
  },
  {
    q: "How accurate is the AI resume parser?",
    a: "Our parser is trained on thousands of resumes across industries and achieves around 96% field-level accuracy on well-formatted documents. For best results, use a single-column layout with clear section headings (Experience, Education, Skills). You can always review and edit the parsed fields before saving — the parser is a starting point, not the final word.",
  },
  {
    q: "Does QuickApply support local portals like Rozee.pk and Mustakbil?",
    a: "Yes — local portal support is one of our key differentiators. We support Rozee.pk, Mustakbil, Bayt, and other South Asian job boards alongside LinkedIn, Indeed, Greenhouse, Lever, and Glassdoor. Each site has dedicated field mappings and we test fill accuracy regularly. If a portal isn't supported, request it from the Site Compatibility page.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Go to Settings → Billing and click 'Cancel subscription'. You'll keep access until the end of your current billing period, after which your account reverts to the free tier. Your data (profiles, applications, cover letters) is always retained — canceling only changes which features are available.",
  },
  {
    q: "How do I contact support directly?",
    a: "Use the 'Submit a ticket' form on this page — every submission creates a tracked ticket that appears in 'My Tickets' below. We respond within one business day (often much faster). For urgent billing issues, mark your ticket as 'Billing' and set the priority to 'High'. You can also email us at support@quickapply.app.",
  },
];

const CATEGORY_META: Record<string, { bg: string; text: string; label: string }> = {
  Bug: { bg: "bg-red-500/10", text: "text-red-600", label: "Bug" },
  "How-to": { bg: "bg-sky/15", text: "text-sky", label: "How-to" },
  Billing: { bg: "bg-ocean/10", text: "text-ocean", label: "Billing" },
  "Feature Request": { bg: "bg-purple-500/10", text: "text-purple-600", label: "Feature Request" },
  General: { bg: "bg-muted", text: "text-muted-foreground", label: "General" },
};

const STATUS_META: Record<string, { bg: string; text: string; label: string }> = {
  open: { bg: "bg-amber-500/10", text: "text-amber-600", label: "Open" },
  in_progress: { bg: "bg-sky/15", text: "text-sky", label: "In progress" },
  resolved: { bg: "bg-emerald-500/10", text: "text-emerald-600", label: "Resolved" },
  closed: { bg: "bg-muted", text: "text-muted-foreground", label: "Closed" },
};

const PRIORITY_META: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: "bg-muted", text: "text-muted-foreground", label: "Low" },
  normal: { bg: "bg-sky/15", text: "text-sky", label: "Normal" },
  high: { bg: "bg-amber-500/10", text: "text-amber-600", label: "High" },
  urgent: { bg: "bg-red-500/10", text: "text-red-600", label: "Urgent" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const day = 86400000;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < day) return `${Math.floor(diff / 3600000)}h ago`;
  const days = Math.floor(diff / day);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const GUEST_EMAIL = "guest@example.com";

export function SupportPage({ onExit }: { onExit: () => void }) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<Category>("General");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const { toast } = useToast();

  const loadTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch(`/api/support-tickets?userEmail=${encodeURIComponent(GUEST_EMAIL)}`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
    );
  }, [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: GUEST_EMAIL,
          subject: subject.trim(),
          category,
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      await loadTickets();
      toast({
        title: "Ticket submitted!",
        description: "We'll get back to you within one business day.",
      });
      setSubject("");
      setCategory("General");
      setMessage("");
    } catch {
      toast({ title: "Could not submit ticket", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-mesh-ocean">
      {/* Top bar */}
      <header className="sticky top-0 z-50 glass-card shadow-ocean">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Brand />
              <Badge className="bg-ocean/10 text-ocean border-ocean/20 hover:bg-ocean/15">
                <LifeBuoy className="h-3 w-3" /> Support
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={onExit}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to site
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-sky/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-ocean/15 blur-3xl pointer-events-none" />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-14 pb-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Badge className="mb-4 bg-shore/40 text-ocean border-shore/60 hover:bg-shore/50">
                <Sparkles className="h-3 w-3" /> We're here to help
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                How can we <span className="text-gradient-ocean">help?</span>
              </h1>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Search our FAQ, submit a ticket, or browse your existing conversations.
              </p>
              <div className="mt-6 relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search FAQs — try 'auto-fill', 'cancel', 'Rozee'…"
                  className="pl-9 h-11 glass-card"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-ocean" /> Frequently asked questions
            </h2>
            {query && (
              <span className="text-xs text-muted-foreground">
                {filteredFaqs.length} of {FAQS.length}
              </span>
            )}
          </div>
          <Card className="glass-card">
            <CardContent className="p-4 sm:p-6">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-10">
                  <Inbox className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                  <div className="font-medium">No FAQs match &ldquo;{query}&rdquo;</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try a different keyword, or submit a ticket below.
                  </p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((f, i) => (
                    <AccordionItem key={i} value={`item-${i}`}>
                      <AccordionTrigger className="text-left text-sm sm:text-base font-medium hover:no-underline">
                        {f.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                        {f.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Ticket + My Tickets */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Submit a ticket */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-ocean/10 grid place-items-center">
                    <Ticket className="h-4 w-4 text-ocean" />
                  </div>
                  Submit a ticket
                </CardTitle>
                <CardDescription>
                  Tell us what's going on. We respond within one business day.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief summary of your issue"
                      maxLength={120}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pick a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bug">Bug</SelectItem>
                        <SelectItem value="How-to">How-to</SelectItem>
                        <SelectItem value="Billing">Billing</SelectItem>
                        <SelectItem value="Feature Request">Feature Request</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe the issue, steps to reproduce, and any relevant details…"
                      rows={5}
                      maxLength={2000}
                      required
                    />
                    <p className="text-[11px] text-muted-foreground text-right">
                      {message.length}/2000
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-ocean hover:bg-ocean/90"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Submit ticket
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* My tickets */}
            <Card className="glass-card">
              <CardHeader>
                <CardAction>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadTickets}
                    disabled={loadingTickets}
                  >
                    <RefreshCw
                      className={`mr-1.5 h-3.5 w-3.5 ${loadingTickets ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </CardAction>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-sky/15 grid place-items-center">
                    <Inbox className="h-4 w-4 text-sky" />
                  </div>
                  My tickets
                </CardTitle>
                <CardDescription>
                  Your submitted support tickets and our replies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTickets ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-24 rounded-lg bg-muted/40 animate-pulse" />
                    ))}
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="h-12 w-12 rounded-full bg-ocean/10 grid place-items-center mx-auto mb-3">
                      <CheckCircle2 className="h-6 w-6 text-ocean" />
                    </div>
                    <div className="font-semibold">No tickets yet</div>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      When you submit a ticket it'll show up here with status, replies, and history.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto scrollbar-thin space-y-3 pr-1">
                    <AnimatePresence initial={false}>
                      {tickets.map((t, i) => {
                        const cat = CATEGORY_META[t.category] ?? CATEGORY_META.General;
                        const st = STATUS_META[t.status] ?? STATUS_META.open;
                        const pr = PRIORITY_META[t.priority] ?? PRIORITY_META.normal;
                        return (
                          <motion.div
                            key={t.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ delay: i * 0.03 }}
                          >
                            <div className="rounded-lg border border-border bg-card/60 p-4 hover:shadow-ocean transition-all">
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-semibold text-sm leading-snug">
                                  {t.subject}
                                </div>
                                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                                  {timeAgo(t.createdAt)}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                <Badge className={`${cat.bg} ${cat.text} border-transparent text-[10px] py-0`}>
                                  {cat.label}
                                </Badge>
                                <Badge className={`${st.bg} ${st.text} border-transparent text-[10px] py-0`}>
                                  {st.label}
                                </Badge>
                                <Badge className={`${pr.bg} ${pr.text} border-transparent text-[10px] py-0`}>
                                  {pr.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {t.message}
                              </p>
                              {t.reply && (
                                <div className="mt-2 rounded-md bg-ocean/5 border border-ocean/15 px-3 py-2">
                                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-ocean mb-1">
                                    <Mail className="h-3 w-3" /> Reply from support
                                  </div>
                                  <p className="text-xs text-foreground/80 leading-relaxed">
                                    {t.reply}
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact info */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
          <Card className="glass-card bg-gradient-to-br from-ink/5 to-sky/10 border-ocean/20">
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-3 gap-6">
                <ContactItem
                  icon={<Mail className="h-5 w-5 text-ocean" />}
                  title="Email us"
                  lines={["support@quickapply.app", "billing@quickapply.app"]}
                />
                <ContactItem
                  icon={<Clock className="h-5 w-5 text-sky" />}
                  title="Response time"
                  lines={["Within 1 business day", "Urgent billing: same-day"]}
                />
                <ContactItem
                  icon={<MessageCircle className="h-5 w-5 text-ocean" />}
                  title="Community"
                  lines={["Join our Discord", "Follow @quickapply"]}
                />
              </div>
              <div className="mt-6 flex items-center justify-between flex-wrap gap-3 pt-5 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  © {new Date().getFullYear()} QuickApply. All rights reserved.
                </span>
                <div className="flex items-center gap-2">
                  <SocialBtn icon={<Twitter className="h-3.5 w-3.5" />} label="Twitter" />
                  <SocialBtn icon={<Linkedin className="h-3.5 w-3.5" />} label="LinkedIn" />
                  <SocialBtn icon={<Github className="h-3.5 w-3.5" />} label="GitHub" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
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
        <span className="text-lg font-bold tracking-tight">
          Quick<span className="text-ocean">Apply</span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          One-click apply
        </span>
      </div>
    </a>
  );
}

function ContactItem({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-lg bg-card/70 grid place-items-center shrink-0 shadow-sm">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        {lines.map((l, i) => (
          <div key={i} className="text-xs text-muted-foreground mt-0.5">{l}</div>
        ))}
      </div>
    </div>
  );
}

function SocialBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="h-8 w-8 rounded-lg border border-border bg-card/60 hover:bg-ocean/10 hover:border-ocean/30 hover:text-ocean transition-colors grid place-items-center text-muted-foreground"
    >
      {icon}
    </button>
  );
}
