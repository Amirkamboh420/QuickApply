"use client";

import { useState, useEffect } from "react";
import { Landing } from "@/components/quickapply/landing";
import { AppShell } from "@/components/quickapply/app-shell";
import { CoachDashboard } from "@/components/quickapply/app/coach-dashboard";
import { AdminDashboard } from "@/components/quickapply/app/admin-dashboard";
import { SupportPage } from "@/components/quickapply/app/support-page";
import { LoginPage } from "@/components/quickapply/app/login-page";
import { useAuth, UserRole } from "@/lib/quickapply/auth-context";

type View = "landing" | "app" | "coach" | "admin" | "support" | "login";

export default function Page() {
  const [view, setView] = useState<View>("landing");

  // Persist view in URL hash so back button & refresh keep context
  useEffect(() => {
    const fromHash = () => {
      const hash = window.location.hash.replace("#", "");
      const validViews: View[] = ["app", "coach", "admin", "support", "login"];
      setView(validViews.includes(hash as View) ? (hash as View) : "landing");
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const navigate = (v: View) => {
    window.location.hash = v === "landing" ? "" : v;
    setView(v);
    window.scrollTo({ top: 0 });
  };

  const exit = () => navigate("landing");
  const goLogin = () => navigate("login");
  const goSupport = () => navigate("support");

  // After login, route based on role passed from LoginPage
  const handleLoginSuccess = (role: UserRole) => {
    if (role === "coach") navigate("coach");
    else if (role === "admin") navigate("admin");
    else navigate("app");
  };

  // Landing "Open Dashboard" — go to app (job seeker view)
  const launch = () => navigate("app");

  return (
    <>
      {view === "landing" && (
        <Landing onLaunch={launch} onLogin={goLogin} onSupport={goSupport} />
      )}
      {view === "app" && <AppShell onExit={exit} onSupport={goSupport} />}
      {view === "coach" && <CoachDashboard onExit={exit} />}
      {view === "admin" && <AdminDashboard onExit={exit} />}
      {view === "support" && <SupportPage onExit={exit} />}
      {view === "login" && (
        <LoginPage onSuccess={handleLoginSuccess} onBack={exit} />
      )}
    </>
  );
}
