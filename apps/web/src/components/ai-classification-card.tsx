import { cn } from "@clarion/ui";
import { Sparkles, Activity, AlertTriangle, Tag, Zap } from "lucide-react";

interface AiMetadata {
  category?: string;
  confidence?: number;
  suggestedPriority?: string;
  suggestedSeverity?: string;
  sentimentScore?: number;
  tags?: string[];
}

interface AiClassificationCardProps {
  aiMetadata?: AiMetadata | null;
  sentimentScore?: number | null;
  isStaffView?: boolean;
}

function SentimentBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.7 ? "bg-emerald-500" : score >= 0.4 ? "bg-amber-400" : "bg-red-500";
  const label = score >= 0.7 ? "Positive" : score >= 0.4 ? "Neutral" : "Negative";
  const labelColor = score >= 0.7
    ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/40"
    : score >= 0.4
      ? "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/40"
      : "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/20 dark:border-red-900/40";

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md border", labelColor)}>{label}</span>
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function InsightCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white/60 dark:border-white/[0.07] dark:bg-[#111113]/30 p-3.5 shadow-sm">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
        {icon} {label}
      </p>
      <p className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-100 leading-snug">{value}</p>
    </div>
  );
}

export function AiClassificationCard({ aiMetadata, sentimentScore, isStaffView = false }: AiClassificationCardProps) {
  if (!aiMetadata && (sentimentScore === undefined || sentimentScore === null)) return null;

  const confidence = aiMetadata?.confidence != null ? Math.round(aiMetadata.confidence * 100) : null;
  const effectiveSentiment = aiMetadata?.sentimentScore ?? sentimentScore;

  return (
    <div className="rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-100/60 dark:border-blue-900/30 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30 text-blue-600 dark:text-blue-400 shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-none">
              {isStaffView ? "AI Co-Pilot Analysis" : "AI Insights"}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Automated classifier</p>
          </div>
        </div>
        {confidence != null && (
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-blue-500" />
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">
              {confidence}% confidence
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Insight cells */}
        <div className={cn("grid gap-3", isStaffView ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
          {aiMetadata?.category && (
            <InsightCell
              icon={<Tag className="h-3 w-3" />}
              label="Category"
              value={aiMetadata.category}
            />
          )}
          {isStaffView && aiMetadata?.suggestedPriority && (
            <InsightCell
              icon={<AlertTriangle className="h-3 w-3" />}
              label="Suggested Priority"
              value={aiMetadata.suggestedPriority}
            />
          )}
          {isStaffView && aiMetadata?.suggestedSeverity && (
            <InsightCell
              icon={<Activity className="h-3 w-3" />}
              label="Severity"
              value={aiMetadata.suggestedSeverity}
            />
          )}
        </div>

        {/* Sentiment */}
        {effectiveSentiment != null && (
          <div className="rounded-lg border border-slate-100 bg-white/60 dark:border-white/[0.07] dark:bg-[#111113]/30 p-3.5 shadow-sm">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              <Activity className="h-3 w-3" /> Emotional Tone
            </p>
            <SentimentBar score={effectiveSentiment} />
          </div>
        )}

        {/* Tags (staff only) */}
        {isStaffView && aiMetadata?.tags && aiMetadata.tags.length > 0 && (
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              <Tag className="h-3 w-3" /> Extracted Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {aiMetadata.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[11.5px] font-medium bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 px-2.5 py-0.5 rounded-lg shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
