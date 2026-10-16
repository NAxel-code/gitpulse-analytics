"use client";

import { AlertTriangle, FileText, CheckCircle2, GitMerge, Clock, Activity } from "lucide-react";

interface DORAAlert {
  id: string;
  timestamp: string;
  metric: string;
  anomaly_type: string;
  severity: string;
  description: string;
  z_score: number;
}

interface ExecutiveSummaryData {
  status: string;
  generated_at: string;
  executive_summary: string;
  key_takeaways: string[];
}

export function DORAFeed({
  alerts,
  summary,
}: {
  alerts: DORAAlert[];
  summary: ExecutiveSummaryData | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Daily Engineering Brief Card */}
      {summary && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <h3 className="font-semibold text-zinc-100 text-sm">
                Daily Engineering Brief
              </h3>
            </div>
            <span className="text-[10px] font-mono tabular-nums text-zinc-400 bg-zinc-800/90 px-2 py-0.5 rounded border border-zinc-700/60">
              {summary.generated_at}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-zinc-300 mb-3.5">
            {summary.executive_summary}
          </p>

          <div className="space-y-2 border-t border-zinc-800/80 pt-3">
            <h4 className="text-xs font-medium text-zinc-300">
              Sorotan DORA & Rekomendasi
            </h4>
            {summary.key_takeaways.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span className="leading-snug">{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Engineering & DORA Alerts */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-zinc-800 border border-zinc-700/60 text-amber-400">
              <Activity className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-semibold text-zinc-100 text-sm">
              Engineering Velocity Alerts
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">DORA Metrics Watcher</span>
        </div>

        <div className="space-y-2.5">
          {alerts.map((item) => {
            const isCritical = item.severity === "critical";
            const isWarning = item.severity === "warning";

            return (
              <div
                key={item.id}
                className={`rounded-lg border p-3 transition-colors ${
                  isCritical
                    ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
                    : isWarning
                    ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                    : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {isCritical ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                    ) : isWarning ? (
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <GitMerge className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span className="font-medium text-xs text-zinc-200">{item.metric}</span>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-medium uppercase ${
                      isCritical
                        ? "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                        : isWarning
                        ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                        : "bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-snug">{item.description}</p>

                <div className="flex items-center justify-between mt-2.5 text-[11px] text-zinc-400 font-mono tabular-nums">
                  <span>{item.timestamp}</span>
                  <span className="text-zinc-500">Deviasi: {item.z_score > 0 ? `+${item.z_score}` : item.z_score}σ</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
