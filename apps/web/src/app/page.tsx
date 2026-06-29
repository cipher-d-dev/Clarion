"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  MessageSquareWarning,
  Shield,
  Sparkles,
  Users,
  Clock,
  FileSearch,
  TrendingUp,
  Zap,
  Lock,
} from "lucide-react";
import { Button } from "@clarion/ui";
import { ThemeToggle } from "@/components/theme-toggle";

// ── Data ────────────────────────────────────────────────────────────────────

const features = [
  { icon: MessageSquareWarning, title: "Guided Submission", description: "Students file through a structured, accessible portal. AI pre-categorizes and extracts key details on submit." },
  { icon: Sparkles, title: "AI-Powered Routing", description: "Automatic classification and department routing eliminates manual triage and cuts response times significantly." },
  { icon: Shield, title: "Transparent Resolution", description: "Full timeline visibility for submitters, with protected internal notes for staff. Everyone sees exactly what they need." },
  { icon: BarChart3, title: "Actionable Analytics", description: "SLA tracking and trend dashboards surface systemic issues before they escalate." },
  { icon: Users, title: "Role-Based Access", description: "Granular RBAC for students, staff, department heads, and institution management." },
  { icon: Clock, title: "SLA Enforcement", description: "Deadlines tracked automatically. Breached SLAs trigger escalation so nothing falls through the cracks." },
];

const stats = [
  { value: "72%", label: "Faster resolution" },
  { value: "3.2×", label: "More complaints captured" },
  { value: "94%", label: "Student satisfaction" },
];

const steps = [
  { icon: FileSearch, step: "01", title: "Submit", body: "Student files a complaint through the guided portal. AI classifies and routes it instantly." },
  { icon: Users, step: "02", title: "Assign", body: "Staff receives the ticket, reviews AI insights, and takes ownership with one click." },
  { icon: TrendingUp, step: "03", title: "Resolve", body: "Resolved with a full audit trail. The student rates the outcome." },
];

const trustPoints = [
  { icon: Lock, title: "End-to-end security", body: "JWT auth, RBAC, and full audit logging on every action." },
  { icon: CheckCircle, title: "Anonymous submissions", body: "Submitters can remain anonymous without losing the ability to track." },
  { icon: Zap, title: "Institution-scoped", body: "Complete data isolation per institution. Nothing leaks across tenants." },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const stagger = (i: number) => ({ duration: 0.45, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] });
const FADE_UP = (i = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: stagger(i) });

function SectionReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }} className={className}>
      {children}
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white text-slate-900 dark:bg-[#0a0a0a] dark:text-slate-100 overflow-x-hidden">

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200/60 bg-white/85 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0a0a0a]/85">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 min-h-[44px]" aria-label="Clarion home">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-white shadow-sm">
              <span className="text-[11px] font-bold text-clarion-amber-400 dark:text-slate-700" aria-hidden="true">C</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight">Clarion</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:inline-block">
              <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 min-h-[44px] cursor-pointer transition-colors duration-200">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gap-1.5 bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 min-h-[44px] cursor-pointer transition-all duration-200">
                Get started <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background radials */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-clarion-amber-400/8 blur-[120px] dark:bg-clarion-amber-400/10" />
          <div className="absolute right-0 top-1/3 h-[300px] w-[300px] rounded-full bg-blue-400/6 blur-[80px] dark:bg-blue-400/8" />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div {...FADE_UP(0)}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1 text-[12px] font-medium text-slate-600 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              AI-powered institutional complaint management
            </div>
          </motion.div>

          <motion.h1 {...FADE_UP(1)} className="text-balance text-[2.5rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[4.5rem]">
            Every voice heard.{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-clarion-amber-500 via-orange-400 to-clarion-amber-400 bg-clip-text text-transparent">
                Every issue resolved.
              </span>
            </span>
          </motion.h1>

          <motion.p {...FADE_UP(2)} className="mx-auto mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-slate-500 dark:text-slate-400">
            Clarion gives universities a modern platform to capture, route, and resolve complaints — with full transparency, smart automation, and leadership-ready analytics.
          </motion.p>

          <motion.div {...FADE_UP(3)} className="mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto max-w-md sm:max-w-none mx-auto">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 min-h-[48px] cursor-pointer bg-slate-900 text-white hover:bg-slate-700 shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:shadow-white/10 transition-all duration-200">
                Start free trial <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto min-h-[48px] cursor-pointer border-slate-200 text-slate-700 hover:border-slate-400 dark:border-white/10 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/5 transition-all duration-200">
                Sign in to your account
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div {...FADE_UP(4)} className="mx-auto mt-16 grid max-w-lg grid-cols-3 divide-x divide-slate-200 dark:divide-white/10 rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.03] overflow-hidden" role="region" aria-label="Platform statistics">
            {stats.map((s) => (
              <div key={s.label} className="py-5 text-center px-2" role="figure" aria-label={`${s.value} ${s.label}`}>
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{s.value}</div>
                <div className="mt-0.5 text-[11.5px] text-slate-500 dark:text-slate-400">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <SectionReveal className="mb-14 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-clarion-amber-500 mb-2">How it works</p>
            <h2 className="text-3xl font-bold tracking-tight">Complaint to resolution in three steps</h2>
          </SectionReveal>

          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <SectionReveal key={step.step}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group relative rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:bg-white/[0.05] transition-colors duration-200"
                  role="article"
                  aria-label={`Step ${step.step}: ${step.title}`}
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 dark:border-white/10 dark:bg-white/5 text-slate-700 dark:text-slate-300 shadow-sm" aria-hidden="true">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10.5px] font-bold uppercase tracking-widest text-clarion-amber-500">Step {step.step}</span>
                  <h3 className="mt-1.5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{step.body}</p>

                  {i < steps.length - 1 && (
                    <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 sm:flex z-10">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white dark:border-white/10 dark:bg-[#111113] shadow-sm">
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                      </div>
                    </div>
                  )}
                </motion.div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-y border-slate-200/60 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-5xl">
          <SectionReveal className="mb-14 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-clarion-amber-500 mb-2">Capabilities</p>
            <h2 className="text-3xl font-bold tracking-tight">Built for modern institutions</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">Everything needed to transform complaint management at scale.</p>
          </SectionReveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={stagger(i % 3)}
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ y: -3 }}
                className="group rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-150 dark:border-white/[0.07] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
                role="article"
                aria-label={f.title}
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 dark:border-white/10 dark:bg-white/5 text-slate-600 dark:text-slate-400 transition-colors group-hover:border-clarion-amber-200 group-hover:bg-clarion-amber-50 group-hover:text-clarion-amber-600 dark:group-hover:border-clarion-amber-900/40 dark:group-hover:bg-clarion-amber-500/10 dark:group-hover:text-clarion-amber-400" aria-hidden="true">
                  <f.icon className="h-4.5 w-4.5" style={{ width: "1.0625rem", height: "1.0625rem" }} />
                </div>
                <h3 className="text-[14px] font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <SectionReveal>
            <div className="grid gap-8 sm:grid-cols-3">
              {trustPoints.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex flex-col items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold">{title}</p>
                    <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <SectionReveal>
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-8 py-16 text-center shadow-2xl dark:bg-white/[0.04] dark:border dark:border-white/[0.08]">
              {/* Ambient glow */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-clarion-amber-400/15 blur-[80px]" />
                <div className="absolute -bottom-12 right-0 h-40 w-64 rounded-full bg-blue-400/10 blur-[60px]" />
                {/* Noise */}
                <div className="absolute inset-0 opacity-[0.03]"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
                />
              </div>
              <div className="relative">
                <h2 className="text-3xl font-bold text-white dark:text-slate-100 tracking-tight">
                  Ready to modernize<br />complaint management?
                </h2>
                <p className="mx-auto mt-4 max-w-md text-slate-400 leading-relaxed text-[15px]">
                  Join institutions already using Clarion to build trust, accountability, and better outcomes for students and staff.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto max-w-md sm:max-w-none mx-auto">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto min-h-[48px] cursor-pointer bg-clarion-amber-500 text-slate-700 hover:bg-clarion-amber-400 shadow-lg shadow-clarion-amber-500/25 font-semibold transition-all duration-200">
                      Get started today
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto min-h-[48px] cursor-pointer border-white/15 text-white hover:bg-white/10 hover:text-white dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10 transition-all duration-200">
                      Sign in
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200/60 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 dark:bg-white">
              <span className="text-[10px] font-bold text-clarion-amber-400 dark:text-slate-700">C</span>
            </div>
            <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">Clarion</span>
          </div>
          <span className="text-[12.5px] text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} Clarion. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
