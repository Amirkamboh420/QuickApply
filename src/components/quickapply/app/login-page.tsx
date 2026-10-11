"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserCircle2,
  Users,
  Shield,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth, DEMO_USERS, UserRole } from "@/lib/quickapply/auth-context";

interface RoleCard {
  role: UserRole;
  title: string;
  description: string;
  icon: typeof UserCircle2;
  border: string;
  ring: string;
  bg: string;
  text: string;
}

const ROLES: RoleCard[] = [
  {
    role: "job_seeker",
    title: "Job Seeker",
    description: "Track applications, AI tools, goals",
    icon: UserCircle2,
    border: "border-ocean",
    ring: "ring-ocean/40",
    bg: "bg-ocean/10",
    text: "text-ocean",
  },
  {
    role: "coach",
    title: "Career Coach",
    description: "Manage clients, shared templates",
    icon: Users,
    border: "border-sky",
    ring: "ring-sky/40",
    bg: "bg-sky/10",
    text: "text-sky",
  },
  {
    role: "admin",
    title: "Admin",
    description: "Users, support tickets, site health",
    icon: Shield,
    border: "border-ink",
    ring: "ring-ink/40",
    bg: "bg-ink/10",
    text: "text-ink",
  },
];

function roleLabel(r: UserRole): string {
  return r === "job_seeker" ? "Job Seeker" : r === "coach" ? "Career Coach" : "Admin";
}

export function LoginPage({
  onSuccess,
  onBack,
}: {
  onSuccess: (role: UserRole) => void;
  onBack: () => void;
}) {
  const { login, switchRole } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [selectedRole, setSelectedRole] = useState<UserRole>("job_seeker");

  // Sign in fields (visual only — no real auth)
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign up fields (visual only — no real auth)
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpRole, setSignUpRole] = useState<UserRole>("job_seeker");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const demo = DEMO_USERS[selectedRole];
    login(demo);
    toast({
      title: `Signed in as ${demo.name}`,
      description: `Role: ${roleLabel(selectedRole)} · Demo mode active.`,
    });
    onSuccess(selectedRole);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const demo = DEMO_USERS[signUpRole];
    login(demo);
    toast({
      title: `Welcome, ${demo.name.split(" ")[0]}!`,
      description: `Account created · Role: ${roleLabel(signUpRole)}.`,
    });
    onSuccess(signUpRole);
  };

  const handleDemo = () => {
    switchRole(selectedRole);
    const demo = DEMO_USERS[selectedRole];
    toast({
      title: "Demo session started",
      description: `Logged in as ${demo.name} (${roleLabel(selectedRole)}).`,
    });
    onSuccess(selectedRole);
  };

  return (
    <div className="min-h-screen flex flex-col bg-mesh-ocean relative overflow-hidden">
      {/* Decorative blobs + grid */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-sky/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-ocean/20 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-grid-ocean opacity-30 pointer-events-none" />

      {/* Top-left back link */}
      <button
        type="button"
        onClick={onBack}
        className="absolute top-5 left-5 z-20 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to home
      </button>

      <div className="relative z-10 flex-1 flex items-center justify-center p-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="glass-card shadow-ocean-lg">
            <CardHeader className="text-center items-center pb-2">
              <Brand />
              <CardTitle className="text-2xl mt-4">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </CardTitle>
              <CardDescription>
                {mode === "signin"
                  ? "Sign in to your QuickApply dashboard."
                  : "Start applying in one click. It's free to try."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs
                value={mode}
                onValueChange={(v) => setMode(v as "signin" | "signup")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Password</Label>
                        <button
                          type="button"
                          className="text-xs text-ocean hover:underline"
                          onClick={() =>
                            toast({
                              title: "Password reset sent (visual only)",
                              description: "This is a demo — no email was actually sent.",
                            })
                          }
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type="password"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-ocean hover:bg-ocean/90">
                      Sign in as {roleLabel(selectedRole)}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-name">Full name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          value={signUpName}
                          onChange={(e) => setSignUpName(e.target.value)}
                          placeholder="Ayesha Khan"
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Role</Label>
                      <Select
                        value={signUpRole}
                        onValueChange={(v) => setSignUpRole(v as UserRole)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="job_seeker">Job Seeker</SelectItem>
                          <SelectItem value="coach">Career Coach</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full bg-ocean hover:bg-ocean/90">
                      Create account
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Role selector (key feature) */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                    Pick a demo role
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {ROLES.map((r) => {
                    const active = selectedRole === r.role;
                    return (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => setSelectedRole(r.role)}
                        className={`relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                          active
                            ? `${r.border} ring-2 ${r.ring} ${r.bg} shadow-ocean`
                            : "border-border bg-card/40 hover:border-ocean/30 hover:bg-card/70"
                        }`}
                        aria-pressed={active}
                      >
                        <div
                          className={`h-10 w-10 rounded-lg grid place-items-center shrink-0 ${
                            active ? `${r.bg} ${r.text}` : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <r.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{r.title}</span>
                            {active && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-ocean" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {r.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick demo access */}
              <div className="mt-5 rounded-xl bg-gradient-to-br from-ocean/10 to-sky/10 border border-ocean/20 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-ocean mb-1">
                  <Sparkles className="h-4 w-4" /> Try as demo
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  No password needed for demo — just pick a role above and click.
                  You'll be logged in instantly to explore the dashboard.
                </p>
                <Button
                  type="button"
                  className="w-full bg-gradient-to-r from-ocean to-sky hover:opacity-90"
                  onClick={handleDemo}
                >
                  <Zap className="mr-1.5 h-4 w-4" fill="white" />
                  Try as {roleLabel(selectedRole)} (demo)
                </Button>
              </div>

              {/* Footer */}
              <div className="mt-6 flex flex-col items-center gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={onBack}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to home
                </button>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <button type="button" className="hover:text-foreground transition-colors">
                    Privacy
                  </button>
                  <span>·</span>
                  <button type="button" className="hover:text-foreground transition-colors">
                    Terms
                  </button>
                  <span>·</span>
                  <button type="button" className="hover:text-foreground transition-colors">
                    Support
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-[11px] text-muted-foreground mt-4">
            © {new Date().getFullYear()} QuickApply · Demo build · No real authentication
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <a href="#" className="inline-flex items-center gap-2.5">
      <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-ink via-ocean to-sky shadow-ocean grid place-items-center overflow-hidden">
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
