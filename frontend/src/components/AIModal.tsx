"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  Terminal,
  Loader2,
  Send,
  Check,
  User,
  GitCommit,
  GitPullRequest,
  Code2,
  ArrowRight,
  RefreshCw,
  FolderGit2,
  AlertCircle,
  Search,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { AI_API_URL } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRepo: string;
  onViewJourney?: (login: string) => void;
  onRepoChange?: (repo: string) => void;
  onSyncRepo?: (repo: string) => void;
}

interface AIResponse {
  query: string;
  generated_sql: string;
  summary: string;
  chart_type: string;
  chart_data: any[];
  confidence: number;
  execution_time_ms: number;
  action?: {
    type: string;
    login?: string;
    target?: string;
    repo?: string;
    label: string;
  } | null;
}

export function AIModal({
  isOpen,
  onClose,
  currentRepo,
  onViewJourney,
  onRepoChange,
  onSyncRepo,
}: AIModalProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [liveRepos, setLiveRepos] = useState<any[]>([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [showSQL, setShowSQL] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Live GitHub Repository Search as user types (like GitHub's ⌘K search bar)
  useEffect(() => {
    const q = prompt.trim();
    if (!q || q.length < 2) {
      setLiveRepos([]);
      setIsSearchingLive(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLive(true);
      try {
        const res = await fetch(`/api/github/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setLiveRepos(data.items || []);
        }
      } catch (err) {
        console.warn("Live GitHub search error:", err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [prompt]);

  if (!isOpen) return null;

  const handleAsk = async (queryText?: string) => {
    const q = queryText || prompt;
    if (!q.trim()) return;

    setLoading(true);
    setShowSQL(false);
    try {
      const res = await fetch(`${AI_API_URL}/insight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, repo_name: currentRepo }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copySQL = () => {
    if (result?.generated_sql) {
      navigator.clipboard.writeText(result.generated_sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExecuteAction = () => {
    if (!result?.action) return;
    const { type, login, target, repo } = result.action;

    if (type === "view_journey" && login && onViewJourney) {
      onClose();
      onViewJourney(login);
    } else if (type === "switch_repo" && target && onRepoChange) {
      onClose();
      onRepoChange(target);
    } else if ((type === "sync" || type === "suggest_sync") && onSyncRepo) {
      onClose();
      onSyncRepo(repo || currentRepo);
    }
  };

  const sampleQueries = [
    "Top human contributors",
    "Pull Request status distribution",
    "Daily commit activity trend",
    "Code churn line volume",
    "@sokra",
    "sync",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-200 border border-zinc-700/80">
              <Search className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-base">
                GitHub Universal Search &amp; AI Analytics
              </h3>
              <p className="text-xs text-zinc-400">
                Search repositories worldwide, @developers, or query DuckDB SQL · Active:{" "}
                <span className="font-mono text-zinc-200">{currentRepo}</span>
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

        {/* Input Form */}
        <div className="mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 p-2 focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600 transition-colors"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                autoFocus
                placeholder="Search repositories (e.g. OreOdyssey, react, uv), @developer, or ask dev questions..."
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (result) setResult(null);
                }}
                className="w-full bg-transparent pl-9 pr-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-medium text-zinc-950 hover:bg-white disabled:opacity-40 transition-colors shadow-sm cursor-pointer shrink-0"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-950" />
              ) : (
                <Send className="h-3.5 w-3.5 text-zinc-950" />
              )}
              <span>Ask AI</span>
            </button>
          </form>

          {/* Live GitHub Search Autocomplete Results (seperti milik GitHub) */}
          {prompt.trim().length >= 2 && !result && (
            <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-xl overflow-hidden divide-y divide-zinc-800/60 max-h-64 overflow-y-auto">
              <div className="px-3 py-2 bg-zinc-900/70 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <FolderGit2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>GitHub Repositories Matching &quot;{prompt}&quot;</span>
                </span>
                {isSearchingLive && (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                    <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                    Searching GitHub...
                  </span>
                )}
              </div>

              {liveRepos.length > 0 ? (
                liveRepos.slice(0, 6).map((repo) => (
                  <button
                    key={repo.full_name}
                    type="button"
                    onClick={() => {
                      onClose();
                      onRepoChange?.(repo.full_name);
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-zinc-850 transition flex items-center justify-between gap-3 group cursor-pointer border-b border-zinc-900/60"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                          {repo.full_name}
                        </span>
                        {repo.language && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                            {repo.language}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {repo.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-300 shrink-0">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{repo.stars_formatted}</span>
                    </div>
                  </button>
                ))
              ) : !isSearchingLive ? (
                <div className="p-3 text-center text-xs text-zinc-500">
                  No public repositories found. Press &quot;Ask AI&quot; or Enter to execute natural language query.
                </div>
              ) : null}
            </div>
          )}

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(q);
                  handleAsk(q);
                }}
                className="rounded-md border border-zinc-800/80 bg-zinc-900/50 px-2 py-1 text-[11px] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Response Visualization */}
        {result && (
          <div className="mt-5 space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {/* Business / Engineering Summary */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3.5">
              <div className="flex items-center justify-between text-xs text-zinc-200 font-medium mb-1.5">
                <span>Engineering Insights</span>
                <span className="font-mono text-[10px] tabular-nums text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700/60">
                  {result.execution_time_ms}ms · Conf: {Math.round(result.confidence * 100)}%
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {result.summary}
              </p>

              {/* Action shortcut button if available */}
              {result.action && (
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex justify-end">
                  <button
                    onClick={handleExecuteAction}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80 px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    <span>{result.action.label}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Special 1: Developer Profile Card (When searching user/entity) */}
            {result.chart_type === "developer_profile" &&
              result.chart_data.length > 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          result.chart_data[0].avatar_url ||
                          "https://avatars.githubusercontent.com/u/583231?v=4"
                        }
                        alt={result.chart_data[0].actor_login}
                        className="h-10 w-10 rounded-full border border-zinc-700 bg-zinc-800 object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">
                            @{result.chart_data[0].actor_login}
                          </h4>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                            Verified Contributor
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400">
                          Target repository: {currentRepo}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                        Commits
                      </span>
                      <span className="text-sm font-bold text-white">
                        {formatNumber(result.chart_data[0].commits || 0)}
                      </span>
                    </div>
                    <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                        PRs Merged
                      </span>
                      <span className="text-sm font-bold text-emerald-400">
                        {result.chart_data[0].prs_merged || 0}
                      </span>
                    </div>
                    <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-800/80">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                        Lines +/-
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        +{formatNumber(result.chart_data[0].lines_added || 0)} / -
                        {formatNumber(result.chart_data[0].lines_deleted || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {/* Special 2: Not Found Visual Indicator */}
            {result.chart_type === "not_found" && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-center">
                <AlertCircle className="h-6 w-6 text-zinc-500 mx-auto mb-1.5" />
                <span className="text-xs font-semibold text-zinc-300 block">
                  No Direct Activity Recorded
                </span>
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  DuckDB analytics indexed 14 days of event history for{" "}
                  <code className="text-zinc-400">{currentRepo}</code>.
                </span>
              </div>
            )}

            {/* General Visual Chart (BarChart or LineChart) */}
            {result.chart_type !== "developer_profile" &&
              result.chart_type !== "not_found" &&
              result.chart_type !== "command_action" &&
              result.chart_data &&
              result.chart_data.length > 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <span className="text-xs font-semibold text-zinc-400 mb-2 block">
                    Query Result Visualization
                  </span>
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {result.chart_type === "line" ? (
                        <LineChart
                          data={result.chart_data}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <XAxis
                            dataKey={Object.keys(result.chart_data[0])[0]}
                            stroke="#71717a"
                            fontSize={10}
                          />
                          <YAxis stroke="#71717a" fontSize={10} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#18181b",
                              borderColor: "#3f3f46",
                              borderRadius: "0.5rem",
                              fontSize: "11px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey={
                              Object.keys(result.chart_data[0])[1] || "commits"
                            }
                            stroke="#6366f1"
                            strokeWidth={2}
                            dot={{ fill: "#6366f1", r: 3 }}
                          />
                        </LineChart>
                      ) : (
                        <BarChart
                          data={result.chart_data}
                          margin={{ top: 10, right: 10, left: -20, bottom: 15 }}
                        >
                          <XAxis
                            dataKey={Object.keys(result.chart_data[0])[0]}
                            stroke="#71717a"
                            fontSize={10}
                            tickFormatter={(val: string) =>
                              val && val.length > 12 ? `${val.slice(0, 10)}…` : val
                            }
                          />
                          <YAxis stroke="#71717a" fontSize={10} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#18181b",
                              borderColor: "#3f3f46",
                              borderRadius: "0.5rem",
                              fontSize: "11px",
                            }}
                          />
                          <Bar
                            dataKey={
                              Object.keys(result.chart_data[0])[1] ||
                              "total_commits"
                            }
                            fill="#6366f1"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

            {/* Generated SQL AST Sandbox (Collapsible & Non-Command Filtered) */}
            {result.generated_sql &&
              result.chart_type !== "command_action" &&
              !result.generated_sql.trim().startsWith("-- COMMAND:") && (
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden transition-all duration-200">
                  <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/80 border-b border-zinc-800/60">
                    <button
                      type="button"
                      onClick={() => setShowSQL((prev) => !prev)}
                      className="flex items-center gap-2 text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer select-none group"
                    >
                      <Terminal className="h-3.5 w-3.5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                      <span className="font-medium">Sandboxed Read-Only SQL (DuckDB)</span>
                      <span className="rounded bg-zinc-800/80 px-1.5 py-0.2 text-[10px] text-zinc-400 border border-zinc-700/50 font-sans">
                        {showSQL ? "Hide" : "Inspect"}
                      </span>
                      {showSQL ? (
                        <ChevronUp className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200" />
                      )}
                    </button>
                    {showSQL && (
                      <button
                        onClick={copySQL}
                        className="flex items-center gap-1 rounded bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 text-[10px] text-zinc-300 border border-zinc-700/60 hover:text-white transition cursor-pointer"
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : null}
                        <span>{copied ? "Copied" : "Copy SQL"}</span>
                      </button>
                    )}
                  </div>
                  {showSQL && (
                    <div className="p-3 bg-zinc-950/90 border-t border-zinc-900">
                      <pre className="overflow-x-auto font-mono text-[11px] text-emerald-400 leading-relaxed selection:bg-emerald-500/20">
                        {result.generated_sql}
                      </pre>
                    </div>
                  )}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
