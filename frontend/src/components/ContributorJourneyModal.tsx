"use client";

import { useEffect, useState } from "react";
import { X, GitCommit, GitPullRequest, AlertCircle, Award, Clock, ArrowRight } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { GITHUB_API_URL } from "@/lib/api";

interface JourneyEvent {
  timestamp: string;
  event_type: string;
  title: string;
  lines_added: number;
  lines_deleted: number;
  badge: string;
}

interface JourneyData {
  login: string;
  avatar_url: string;
  repo_name: string;
  total_commits: number;
  prs_merged: number;
  velocity_score: number;
  rank: number;
  events: JourneyEvent[];
}

export function ContributorJourneyModal({
  isOpen,
  onClose,
  login,
  repoName,
}: {
  isOpen: boolean;
  onClose: () => void;
  login: string | null;
  repoName: string;
}) {
  const [data, setData] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !login) return;
    setLoading(true);
    fetch(`${GITHUB_API_URL}/contributor-journey?repo=${encodeURIComponent(repoName)}&login=${encodeURIComponent(login)}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error("Error fetching journey:", err))
      .finally(() => setLoading(false));
  }, [isOpen, login, repoName]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !login) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header Profile */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <img
              src={data?.avatar_url || "https://avatars.githubusercontent.com/u/583231?v=4"}
              alt={login}
              className="h-12 w-12 rounded-full border border-zinc-700 bg-zinc-800 object-cover shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-zinc-100 text-lg">@{login}</h3>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-300 border border-zinc-700/60">
                  Contributor Profile
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Activity timeline and contribution history in <span className="font-mono text-zinc-300">{repoName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-700 focus:outline-none transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Stats Banner */}
        {data && (
          <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shrink-0 text-center">
            <div>
              <span className="text-[11px] font-mono text-zinc-400 block mb-0.5">Total Commits</span>
              <span className="text-base font-mono font-semibold text-zinc-100 tabular-nums">{formatNumber(data.total_commits)}</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-zinc-400 block mb-0.5">PRs Merged</span>
              <span className="text-base font-mono font-semibold text-emerald-400 tabular-nums">{data.prs_merged}</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-zinc-400 block mb-0.5">Velocity Score</span>
              <span className="text-base font-mono font-semibold text-zinc-100 tabular-nums">{data.velocity_score} <span className="text-xs text-zinc-500 font-normal">pts</span></span>
            </div>
          </div>
        )}

        {/* Chronological Action Journey */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 mt-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-2">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span>Chronological Activity Timeline</span>
          </div>

          {loading ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-zinc-900/80 animate-pulse border border-zinc-800/60" />
              ))}
            </div>
          ) : data?.events && data.events.length > 0 ? (
            <div className="relative border-l border-zinc-800 ml-3 space-y-4 py-1">
              {data.events.map((evt, idx) => (
                <div key={idx} className="relative pl-5 group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border border-zinc-950 bg-zinc-400" />

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-2.5 hover:border-zinc-700/80 transition-colors">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono text-zinc-400 tabular-nums">{evt.timestamp}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase border ${
                          evt.badge === "pr_merged"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                            : evt.badge === "pr"
                            ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/25"
                            : evt.badge === "issue"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/25"
                            : "bg-zinc-800 text-zinc-300 border-zinc-750"
                        }`}
                      >
                        {evt.badge}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-200 leading-snug">{evt.title}</p>

                    {(evt.lines_added > 0 || evt.lines_deleted > 0) && (
                      <div className="mt-1.5 font-mono tabular-nums text-[11px] text-zinc-400 flex gap-2">
                        <span className="text-emerald-400">+{formatNumber(evt.lines_added)} lines</span>
                        <span className="text-rose-400">-{formatNumber(evt.lines_deleted)} lines</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 text-center py-6">No activity history recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}
