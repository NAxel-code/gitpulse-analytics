"use client";

import { AlertTriangle, Sparkles, CheckCircle2, GitMerge, Clock, Activity } from "lucide-react";

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
      {/* AI Daily Engineering Brief Card */}
      {summary && (
        <div className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-zinc-900/60 to-zinc-900/60 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <h3 className="font-semibold text-white text-sm">
                AI Daily Engineering Brief
              </h3>
            </div>
            <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full border border-zinc-700/60">
              {summary.generated_at}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-zinc-300 mb-3">
            {summary.executive_summary}
          </p>

          <div className="space-y-1.5 border-t border-zinc-800/80 pt-3">
            <span className="text-[11px] font-semibold text-violet-300 uppercase tracking-wider">
              DORA & Engineering Highlights
            </span>
            {summary.key_takeaways.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-zinc-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Engineering & DORA Alerts */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-400" />
            <h3 className="font-semibold text-zinc-100 text-sm">
              Engineering Velocity Alerts
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">DORA Metrics Watcher</span>
        </div>

        <div className="space-y-3">
          {alerts.map((item) => {
            const isWarning = item.severity === "warning" || item.severity === "critical";

            return (
              <div
                key={item.id}
                className={`rounded-lg border p-3 transition ${
                  isWarning
                    ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                    : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {isWarning ? (
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <GitMerge className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span className="font-semibold text-xs text-white">{item.metric}</span>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      item.severity === "critical"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : item.severity === "warning"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-snug">{item.description}</p>

                <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-500 font-mono">
                  <span>{item.timestamp}</span>
                  <span>Deviation: {item.z_score}σ</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
