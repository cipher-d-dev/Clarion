"use client";

import { cn } from "@clarion/ui";
import { Button } from "@clarion/ui";
import { createContext, useCallback, useContext, useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2, XCircle, X, Inbox,
  TrendingUp, TrendingDown, Minus, AlertTriangle, ChevronRight,
} from "lucide-react";

// ── Toast ─────────────────────────────────────────────────────────────────────

type ToastVariant = "success" | "error";
type Toast = { id: number; message: string; variant: ToastVariant };
type ToastContextValue = (message: string, variant?: ToastVariant) => void;

const ToastContext = createContext<ToastContextValue>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const push = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = ++counter.current;
    setToasts((t) => [...t, { id, message, variant }]);
    const timer = setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
      timers.current.delete(id);
    }, 4200);
    timers.current.set(id, timer);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={cn(
              "pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-xl min-w-[280px] max-w-[380px]",
              "animate-in slide-in-from-bottom-3 fade-in duration-200",
              t.variant === "success"
                ? "bg-emerald-950 border-emerald-800/60 text-emerald-200"
                : "bg-red-950 border-red-800/60 text-red-200"
            )}
          >
            {t.variant === "success"
              ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              : <XCircle className="h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />}
            <span className="flex-1 font-medium leading-snug">{t.message}</span>
            <button
              onClick={() => setToasts((x) => x.filter((n) => n.id !== t.id))}
              className="ml-1 rounded-lg opacity-40 hover:opacity-80 transition-opacity cursor-pointer min-h-[24px] min-w-[24px] flex items-center justify-center"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

// ── StatCard ──────────────────────────────────────────────────────────────────

type Trend = "up" | "down" | "neutral";

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  accent?: boolean;
  trend?: Trend;
  icon?: React.ReactNode;
}

function TrendBadge({ trend, sub }: { trend: Trend; sub?: string }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
      trend === "up" && "bg-emerald-500/10 text-emerald-500",
      trend === "down" && "bg-red-500/10 text-red-400",
      trend === "neutral" && "bg-slate-500/10 text-slate-400",
    )}>
      {trend === "up" && <TrendingUp className="h-2.5 w-2.5" />}
      {trend === "down" && <TrendingDown className="h-2.5 w-2.5" />}
      {trend === "neutral" && <Minus className="h-2.5 w-2.5" />}
      {sub}
    </div>
  );
}

export function StatCard({ label, value, sub, accent, trend, icon }: StatCardProps) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
      "bg-white dark:bg-[#111113]",
      accent
        ? "border-amber-200/50 dark:border-amber-500/15 hover:shadow-amber-500/5"
        : "border-slate-200/80 dark:border-white/[0.06] hover:shadow-black/10 dark:hover:shadow-black/40",
    )}>
      {/* Subtle top gradient line */}
      <div className={cn(
        "absolute inset-x-0 top-0 h-px",
        accent
          ? "bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"
          : "bg-gradient-to-r from-transparent via-slate-200/80 to-transparent dark:via-white/[0.08]"
      )} />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <p className={cn(
            "text-[2.1rem] font-black leading-none tracking-tight",
            accent ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-slate-50"
          )}>
            {value}
          </p>
          {(sub || trend) && (
            <div className="pt-0.5">
              {trend && sub ? <TrendBadge trend={trend} sub={sub} /> : sub && (
                <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            accent
              ? "border-amber-200/50 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400"
              : "border-slate-100 bg-slate-50/80 text-slate-500 dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-slate-400"
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}

export function PageHeader({ title, description, action, breadcrumb }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 pb-6 border-b border-slate-200/60 dark:border-white/[0.06]">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            {breadcrumb.map((crumb, i) => (
              <li key={crumb.label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3 opacity-40" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors font-medium">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">{title}</h1>
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.07] bg-slate-50/50 dark:bg-white/[0.02] max-w-lg mx-auto"
      role="status"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-slate-400 dark:text-slate-500 shadow-sm" aria-hidden="true">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── ConfirmDialog ─────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel",
  destructive, onConfirm, onCancel, loading,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape" && open) onCancel(); };
    if (open) { document.addEventListener("keydown", handleEscape); return () => document.removeEventListener("keydown", handleEscape); }
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" onClick={onCancel} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-white/[0.08] shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        {/* Top accent line */}
        <div className={cn("h-px w-full", destructive ? "bg-gradient-to-r from-transparent via-red-500/60 to-transparent" : "bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent")} />
        <div className="p-6">
          {destructive && (
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500" aria-hidden="true">
              <AlertTriangle className="h-5 w-5" />
            </div>
          )}
          <h2 id="confirm-title" className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">{title}</h2>
          <p id="confirm-desc" className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
          <div className="mt-6 flex justify-end gap-2.5">
            <Button variant="ghost" onClick={onCancel} disabled={loading} size="sm" className="min-h-[40px] cursor-pointer text-slate-600 dark:text-slate-300">
              {cancelLabel}
            </Button>
            <Button
              variant={destructive ? "destructive" : "accent"}
              onClick={onConfirm}
              disabled={loading}
              size="sm"
              className="min-h-[40px] cursor-pointer"
              aria-busy={loading}
            >
              {loading ? "Processing…" : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
