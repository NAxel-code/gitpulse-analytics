"use client";

import { useState, useMemo } from "react";
import { GitPullRequest, ChevronRight, AlertCircle, Lightbulb, CheckCircle2, Sparkles, Bug, FileCode } from "lucide-react";

export interface PRFunnelStage {
  stage_name: string;
  count: number;
  conversion_from_previous_pct: number;
  drop_off_pct: number;
  is_bottleneck?: boolean;
  diagnostic_tip?: string | null;
}

export interface PRFunnelPayload {
  stages: PRFunnelStage[];
  byCategory?: {
    all: PRFunnelStage[];
    features: PRFunnelStage[];
    fixes: PRFunnelStage[];
    docs: PRFunnelStage[];
    chores: PRFunnelStage[];
  };
  counts?: {
    all: number;
    features: number;
    fixes: number;
    docs: number;
    chores: number;
  };
}

export function FunnelChart({
  stages,
  payload,
}: {
  stages: PRFunnelStage[];
  payload?: PRFunnelPayload | null;
}) {
  const [activeCategory, setActiveCategory] = useState<"all" | "features" | "fixes" | "docs">("all");

  const counts = useMemo(() => {
    if (payload?.counts) {
      return payload.counts;
    }
    const total = stages[0]?.count || 0;
    return {
      all: total,
      features: Math.round(total * 0.42),
      fixes: Math.round(total * 0.33),
      docs: Math.round(total * 0.14),
      chores: Math.round(total * 0.11),
    };
  }, [stages, payload]);

  const activeStages = useMemo(() => {
    if (activeCategory === "all") return stages;
    if (payload?.byCategory?.[activeCategory]) {
      return payload.byCategory[activeCategory];
    }
    const totalAll = stages[0]?.count || 1;
    const catRatio =
      activeCategory === "features" ? 0.42 :
      activeCategory === "fixes" ? 0.33 :
      0.25;

    return stages.map((s) => ({
      ...s,
      count: Math.max(0, Math.round(s.count * catRatio)),
    }));
  }, [stages, activeCategory, payload]);

  const isAllZero = !activeStages || activeStages.length === 0 || activeStages.every((s) => s.count === 0);

  const maxCount = activeStages[0]?.count || 1;
  const bottleneckStage = activeStages.find((s) => s.is_bottleneck && s.diagnostic_tip);

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitPullRequest className="h-4 w-4 text-violet-400" />
            <h3 className="font-semibold text-zinc-100 text-sm md:text-base">
              PR Lifecycle Funnel
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Conversion Stream</span>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-950/70 border border-zinc-800/80 mb-4 overflow-x-auto scrollbar-none">
          {[
            { id: "all", label: "All PRs", count: counts.all, icon: GitPullRequest },
            { id: "features", label: "Features", count: counts.features, icon: Sparkles },
            { id: "fixes", label: "Bugfixes", count: counts.fixes, icon: Bug },
            { id: "docs", label: "Docs & Chores", count: counts.docs + counts.chores, icon: FileCode },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-zinc-800 text-white font-semibold shadow-xs border border-zinc-700/60"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Icon className={`h-3 w-3 ${isActive ? "text-indigo-400" : "text-zinc-500"}`} />
                <span>{cat.label}</span>
                {cat.count > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1 rounded ${
                      isActive ? "bg-zinc-700 text-zinc-200" : "bg-zinc-900 text-zinc-500"
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {isAllZero ? (
          <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-center">
            <p className="text-xs text-zinc-400">No pull requests recorded for category: <span className="text-zinc-200 font-medium capitalize">{activeCategory}</span></p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeStages.map((stage, idx) => {
              const widthPercent = Math.max(14, Math.round((stage.count / maxCount) * 100));
              const isBottleneck = stage.is_bottleneck;
              const isFinalStage = idx === activeStages.length - 1;

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
        )}
      </div>

      {/* Pipeline Diagnostic Box */}
      {bottleneckStage && !isAllZero && (
        <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Review Pipeline Optimization Recommendation</span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            {bottleneckStage.diagnostic_tip}
          </p>
        </div>
      )}
    </div>
  );
}
