"use client";

import { AlertTriangle, FileText, CheckCircle2, GitMerge, Clock, Activity, ShieldCheck } from "lucide-react";
import { ContributorItem, isBotAccount } from "./ContributorTable";

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
  contributors = [],
}: {
  alerts: DORAAlert[];
  summary: ExecutiveSummaryData | null;
  contributors?: ContributorItem[];
}) {
  // Compute Team Resilience & Bus Factor
  const humanContribs = (contributors || []).filter((c) => !isBotAccount(c.login));
  const totalCommits = humanContribs.reduce((acc, c) => acc + (c.commits || 0), 0);
  const sorted = [...humanContribs].sort((a, b) => (b.commits || 0) - (a.commits || 0));

  let cumulative = 0;
  let busFactor = 0;
  const topContributors: { login: string; pct: number }[] = [];

  for (const c of sorted) {
    busFactor++;
    cumulative += c.commits || 0;
    const pct = totalCommits > 0 ? Math.round((c.commits / totalCommits) * 100) : 0;
    topContributors.push({ login: c.login, pct });
    if (cumulative >= totalCommits * 0.65 || busFactor >= 4) break;
  }

  const busFactorDisplay = Math.max(1, busFactor || (humanContribs.length > 0 ? 1 : 0));
  const top1Pct = topContributors[0]?.pct || 0;
  const top2Pct = (topContributors[0]?.pct || 0) + (topContributors[1]?.pct || 0);

  const isHighRisk = busFactorDisplay === 1 || top1Pct >= 60;
  const isModerateRisk = busFactorDisplay === 2 || top2Pct >= 70;

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;

  let score = 94;
  score -= criticalCount * 12;
  score -= warningCount * 5;
  if (isHighRisk) score -= 12;
  else if (isModerateRisk) score -= 6;
  score = Math.max(45, Math.min(99, score));

  let healthGrade = "A";
  let healthColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  if (score >= 90) {
    healthGrade = "A+";
    healthColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  } else if (score >= 82) {
    healthGrade = "A";
    healthColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  } else if (score >= 72) {
    healthGrade = "B+";
    healthColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
  } else if (score >= 60) {
    healthGrade = "B";
    healthColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
  } else {
    healthGrade = "C";
    healthColor = "text-rose-400 bg-rose-500/10 border-rose-500/30";
  }
  return (
    <div className="flex flex-col gap-4">
      {/* Team Resilience & Bus Factor Card */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-zinc-800 border border-zinc-700/60 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-semibold text-zinc-100 text-sm">
              Team Resilience &amp; Bus Factor
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Health Grade</span>
            <span className={`rounded-md px-2 py-0.5 text-xs font-mono font-bold border ${healthColor}`}>
              {healthGrade}
            </span>
          </div>
        </div>

        {/* Bus Factor Score Display */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/80 bg-zinc-950/60 mb-3">
          <div>
            <div className="text-[11px] font-medium text-zinc-400">Bus Factor Index</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {busFactorDisplay} {busFactorDisplay === 1 ? "Maintainer" : "Maintainers"}
            </div>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-mono font-semibold border ${
                isHighRisk
                  ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                  : isModerateRisk
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
              }`}
            >
              {isHighRisk ? (
                <>
                  <AlertTriangle className="h-3 w-3" />
                  <span>High Risk</span>
                </>
              ) : isModerateRisk ? (
                <>
                  <Clock className="h-3 w-3" />
                  <span>Moderate Dependency</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3 w-3" />
                  <span>Decentralized</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Code Concentration Segmented Bar */}
        {topContributors.length > 0 && (
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Code Concentration</span>
              <span className="font-mono text-zinc-300 text-[10px]">
                Top {topContributors.length} = {topContributors.reduce((s, c) => s + c.pct, 0)}% of commits
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden flex">
              {topContributors.map((c, i) => {
                const colors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-sky-500"];
                return (
                  <div
                    key={i}
                    style={{ width: `${c.pct}%` }}
                    className={`${colors[i % colors.length]} h-full`}
                    title={`@${c.login}: ${c.pct}%`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono text-zinc-400 mt-1">
              {topContributors.map((c, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-sky-500"][i % 4]}`} />
                  <span className="text-zinc-300 font-medium">@{c.login}</span> ({c.pct}%)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actionable Resilience Insight */}
        <p className="text-[11px] text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-2.5">
          {isHighRisk
            ? "⚠️ Critical dependency on a single developer. Distribute PR reviews and knowledge to protect deployment cadence."
            : isModerateRisk
            ? "💡 Top 2 maintainers author most releases. Promote peer code reviews to expand architectural ownership."
            : "🛡️ Healthy commit distribution across team members. Strong engineering continuity and low bottleneck risk."}
        </p>
      </div>

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
              DORA Highlights & Recommendations
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
                  <span className="text-zinc-500">Deviation: {item.z_score > 0 ? `+${item.z_score}` : item.z_score}σ</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
