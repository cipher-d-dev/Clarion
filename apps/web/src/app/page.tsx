"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  MessageSquareWarning,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@clarion/ui";

const features = [
  {
    icon: MessageSquareWarning,
    title: "Smart Intake",
    description:
      "Students submit complaints through a guided, accessible portal with AI-assisted categorization.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Routing",
    description:
      "Automatically classify, prioritize, and route complaints to the right department in seconds.",
  },
  {
    icon: Shield,
    title: "Transparent Resolution",
    description:
      "Full timeline visibility keeps students informed while protecting sensitive internal notes.",
  },
  {
    icon: BarChart3,
    title: "Actionable Insights",
    description:
      "Trend analysis and dashboards help leadership identify systemic issues before they escalate.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description:
      "Granular RBAC ensures every stakeholder sees exactly what they need — nothing more.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-clarion-navy-100/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-clarion-navy-800">
              <span className="text-sm font-bold text-clarion-amber-400">C</span>
            </div>
            <span className="text-lg font-semibold text-clarion-navy-800">
              Clarion
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="accent" size="sm">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-clarion-amber-100/40 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-clarion-navy-100/50 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-clarion-navy-200 bg-white px-4 py-1.5 text-sm text-clarion-navy-600 shadow-sm">
              <Sparkles className="h-4 w-4 text-clarion-amber-500" />
              AI-powered institutional complaint management
            </div>

            <h1 className="text-balance text-5xl font-bold tracking-tight text-clarion-navy-800 sm:text-6xl">
              Every voice heard.{" "}
              <span className="text-clarion-amber-500">Every issue resolved.</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-clarion-navy-400">
              Clarion gives universities and institutions a modern platform to
              capture, route, and resolve complaints — with full transparency,
              smart automation, and leadership-ready analytics.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" variant="accent" className="gap-2">
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  View demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-20 grid max-w-3xl grid-cols-3 gap-8"
          >
            {[
              { value: "72%", label: "Faster resolution" },
              { value: "3.2×", label: "More complaints captured" },
              { value: "94%", label: "Student satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-clarion-navy-800">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-clarion-navy-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-clarion-navy-800">
              Built for modern institutions
            </h2>
            <p className="mt-3 text-clarion-navy-400">
              Everything you need to transform complaint management
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group rounded-2xl border border-clarion-navy-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-clarion-navy-50 text-clarion-navy-700 transition-colors group-hover:bg-clarion-amber-50 group-hover:text-clarion-amber-600">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-clarion-navy-800">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-clarion-navy-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-clarion-navy-800 px-8 py-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,168,56,0.15),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white">
                Ready to modernize complaint management?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-clarion-navy-200">
                Join institutions already using Clarion to build trust,
                accountability, and better outcomes.
              </p>
              <Link href="/register" className="mt-8 inline-block">
                <Button size="lg" variant="accent">
                  Get started today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-clarion-navy-100 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <span className="text-sm text-clarion-navy-400">
            © {new Date().getFullYear()} Clarion. All rights reserved.
          </span>
          <span className="text-sm text-clarion-navy-300">Phase 0 Preview</span>
        </div>
      </footer>
    </div>
  );
}
