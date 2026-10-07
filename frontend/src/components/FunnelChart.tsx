"use client";

import { GitPullRequest, ChevronRight, AlertCircle, Lightbulb, CheckCircle2 } from "lucide-react";

interface PRFunnelStage {
  stage_name: string;
  count: number;
  conversion_from_previous_pct: number;
  drop_off_pct: number;
  is_bottleneck?: boolean;
  diagnostic_tip?: string | null;
}

export function FunnelChart({ stages }: { stages: PRFunnelStage[] }) {
  if (!stages || stages.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm flex flex-col justify-center items-center h-full min-h-[260px] text-center">
        <GitPullRequest className="h-8 w-8 text-zinc-600 mb-2" />
        <h4 className="text-xs font-semibold text-zinc-300">Data PR Funnel Belum Tersedia</h4>
        <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
          Belum ada aktivitas pull request yang tercatat. Jalankan &apos;Sync Live Repo&apos; untuk mengambil data lifecycle PR.
        </p>
      </div>
    );
  }

  const maxCount = stages[0]?.count || 1;

  // Find any stage flagged as bottleneck
  const bottleneckStage = stages.find((s) => s.is_bottleneck && s.diagnostic_tip);

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitPullRequest className="h-4 w-4 text-violet-400" />
            <h3 className="font-semibold text-zinc-100 text-sm md:text-base">
              PR Lifecycle Funnel
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Conversion Stream</span>
        </div>

        <div className="space-y-4">
          {stages.map((stage, idx) => {
            const widthPercent = Math.max(14, Math.round((stage.count / maxCount) * 100));
            const isBottleneck = stage.is_bottleneck;

            return (
              <div key={idx} className="relative">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-zinc-300">{stage.stage_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white tabular-nums">
                      {stage.count.toLocaleString()}
                    </span>
                    {idx > 0 && (
                      <span
                        className={`text-[11px] font-semibold ${
                          isBottleneck ? "text-amber-400" : "text-emerald-400"
                        }`}
                      >
                        {stage.conversion_from_previous_pct}% pass
                      </span>
                    )}
                  </div>
                </div>

                {/* Bar track */}
                <div className="h-6 w-full rounded-lg bg-zinc-950 p-1">
                  <div
                    style={{ width: `${widthPercent}%` }}
                    className={`h-full rounded-md transition-all duration-700 ${
                      idx === 0
                        ? "bg-violet-600/80"
                        : idx === 1
                        ? "bg-indigo-500/80"
                        : idx === 2
                        ? "bg-cyan-500/80"
                        : "bg-emerald-500/80"
                    }`}
                  />
                </div>

                {/* Drop-off callout */}
                {idx > 0 && stage.drop_off_pct > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-1 pl-1">
                    <ChevronRight className="h-3 w-3 text-zinc-600" />
                    <span>Drop-off:</span>
                    <span className={isBottleneck ? "text-amber-400 font-semibold" : "text-zinc-400 font-medium"}>
                      {stage.drop_off_pct}%
                    </span>
                    {isBottleneck && (
                      <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-medium text-amber-400 border border-amber-500/20 ml-1">
                        <AlertCircle className="h-2.5 w-2.5 inline" /> Bottleneck
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Shopify-style Drop-off Diagnostic Box */}
      {bottleneckStage && (
        <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Shopify-Style Funnel Diagnostic</span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            {bottleneckStage.diagnostic_tip}
          </p>
        </div>
      )}
    </div>
  );
}
