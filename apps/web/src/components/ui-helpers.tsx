"use client";

import { cn } from "@clarion/ui";
import { Button } from "@clarion/ui";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  X,
  Inbox,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
} from "lucide-react";

// ── Toast ─────────────────────────────────────────────────────────────────────

type ToastVariant = "success" | "error";
type Toast = { id: number; message: string; variant: ToastVariant };
type ToastContextValue = (message: string, variant?: ToastVariant) => void;

const ToastContext = createContext<ToastContextValue>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const push = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = ++counter.current;
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={cn(
              "pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg min-w-[260px] max-w-[360px]",
              "animate-in slide-in-from-bottom-3 fade-in duration-200",
              "bg-white dark:bg-slate-900",
              t.variant === "success"
                ? "border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                : "border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300"
            )}
          >
            {t.variant === "success"
              ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              : <XCircle className="h-4 w-4 shrink-0 text-red-500" />}
            <span className="flex-1 font-medium leading-snug">{t.message}</span>
            <button
              onClick={() => setToasts((x) => x.filter((n) => n.id !== t.id))}
              className="ml-1 rounded opacity-40 hover:opacity-80 transition-opacity cursor-pointer"
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

// ── StatCard ─────────────────────────────────────────────────────────────────

type Trend = "up" | "down" | "neutral";

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  accent?: boolean;
  trend?: Trend;
  icon?: React.ReactNode;
}

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-slate-400" />;
}

export function StatCard({ label, value, sub, accent, trend, icon }: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-white dark:bg-slate-900/60 p-5 transition-all duration-200 hover:-translate-y-0.5",
        accent
          ? "border-clarion-amber-200/70 dark:border-clarion-amber-900/40 hover:shadow-[0_4px_12px_-2px_hsl(38_90%_50%/0.15)]"
          : "border-slate-200/80 dark:border-slate-800 hover:shadow-[0_4px_12px_-2px_rgb(0_0_0/0.08)]"
      )}
    >
      {accent && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-clarion-amber-50/60 to-transparent dark:from-clarion-amber-500/[0.05]" />
      )}
      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <p className="text-[2rem] font-bold leading-none tracking-tight text-slate-900 dark:text-slate-50">
            {value}
          </p>
          {(sub || trend) && (
            <div className="flex items-center gap-1.5 pt-0.5">
              {trend && <TrendIcon trend={trend} />}
              {sub && <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            accent
              ? "border-clarion-amber-200/50 bg-clarion-amber-50 text-clarion-amber-600 dark:border-clarion-amber-900/30 dark:bg-clarion-amber-500/10 dark:text-clarion-amber-400"
              : "border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400"
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
    <div className="flex flex-col gap-4 pb-6 border-b border-slate-200/70 dark:border-slate-800">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            {breadcrumb.map((crumb, i) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <h1 className="text-[1.4rem] font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">{title}</h1>
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
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 max-w-lg mx-auto">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 shadow-sm">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
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
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-150 p-6">
        {destructive && (
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
        )}
        <h2 id="confirm-dialog-title" className="text-[15px] font-semibold text-slate-900 dark:text-slate-50 leading-tight">
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={onCancel} disabled={loading} size="sm">
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "accent"}
            onClick={onConfirm}
            disabled={loading}
            size="sm"
          >
            {loading ? "Processing…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
