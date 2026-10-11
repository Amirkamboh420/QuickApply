import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/quickapply/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuickApply — One-Click Job Application Auto-Fill",
  description:
    "Upload your resume once. QuickApply auto-fills any job application form on LinkedIn, Indeed, Rozee.pk & more. AI-powered parsing, local portal support, and total control.",
  keywords: [
    "job application",
    "auto fill",
    "resume parser",
    "Rozee.pk",
    "LinkedIn",
    "Indeed",
    "job seeker",
    "Pakistan jobs",
    "Chrome extension",
  ],
  authors: [{ name: "QuickApply" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "QuickApply — One-Click Job Application Auto-Fill",
    description:
      "Auto-fill any job application in one click. Built for job seekers in Pakistan, South Asia & beyond.",
    siteName: "QuickApply",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickApply",
    description: "One-click job application auto-fill for every portal.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
            <SonnerToaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
