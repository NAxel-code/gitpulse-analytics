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
  const isAllZero = !stages || stages.length === 0 || stages.every((s) => s.count === 0);

  if (isAllZero) {
    return (
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm flex flex-col justify-center items-center h-full min-h-[260px] text-center">
        <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-2 shadow-inner">
          <GitPullRequest className="h-5 w-5 text-violet-400" />
        </div>
        <h4 className="text-xs font-semibold text-zinc-200">Belum Ada Pull Request</h4>
        <p className="text-[11px] text-zinc-400 mt-1 max-w-xs leading-relaxed">
          Repositori ini belum memiliki catatan Pull Request. Semua riwayat pengembangan tercatat melalui push commit langsung ke branch.
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
            const isFinalStage = idx === stages.length - 1;

            return (
              <div key={idx} className="relative">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-zinc-300">{stage.stage_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white tabular-nums">
                      {stage.count.toLocaleString()}
                    </span>
                    {idx > 0 && (
                      <span
                        className={`text-[11px] font-mono font-semibold ${
                          isBottleneck ? "text-amber-400" : "text-emerald-400"
                        }`}
                      >
                        {stage.conversion_from_previous_pct}% pass
                      </span>
                    )}
                  </div>
                </div>

                {/* Bar track */}
                <div className="h-5 w-full rounded-lg bg-zinc-950 p-1">
                  <div
                    style={{ width: `${widthPercent}%` }}
                    className={`h-full rounded-md transition-all duration-500 ${
                      isBottleneck
                        ? "bg-amber-500/85"
                        : isFinalStage
                        ? "bg-emerald-500/85"
                        : idx === 0
                        ? "bg-indigo-500/80"
                        : "bg-indigo-600/75"
                    }`}
                  />
                </div>

                {/* Drop-off callout */}
                {idx > 0 && stage.drop_off_pct > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-1 pl-1">
                    <ChevronRight className="h-3 w-3 text-zinc-500" />
                    <span>Drop-off:</span>
                    <span className={`font-mono ${isBottleneck ? "text-amber-400 font-semibold" : "text-zinc-300 font-medium"}`}>
                      {stage.drop_off_pct}%
                    </span>
                    {isBottleneck && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.2 text-[10px] font-mono font-medium text-amber-300 border border-amber-500/30 ml-1">
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

      {/* Pipeline Diagnostic Box */}
      {bottleneckStage && (
        <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Rekomendasi Optimalisasi Review Pipeline</span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            {bottleneckStage.diagnostic_tip}
          </p>
        </div>
      )}
    </div>
  );
}
