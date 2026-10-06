"use client";

import { useState } from "react";
import { Sparkles, X, Terminal, Loader2, Send, Check } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AI_API_URL } from "@/lib/api";

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRepo: string;
}

interface AIResponse {
  query: string;
  generated_sql: string;
  summary: string;
  chart_type: string;
  chart_data: any[];
  confidence: number;
  execution_time_ms: number;
}

export function AIModal({ isOpen, onClose, currentRepo }: AIModalProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAsk = async (queryText?: string) => {
    const q = queryText || prompt;
    if (!q.trim()) return;

    setLoading(true);
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

  const sampleQueries = [
    "Top contributor dengan PR merge terbanyak",
    "Distribusi status Pull Request",
    "Tren harian aktivitas commit",
    "Volume kode per kontributor utama",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                GitPulse AI — Natural Language Code Analytics
              </h3>
              <p className="text-xs text-zinc-400">
                Text-to-SQL AST Sanitized on DuckDB · Repo: <span className="font-mono text-zinc-200">{currentRepo}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
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
            className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 p-2 focus-within:border-violet-500"
          >
            <input
              type="text"
              placeholder="Tanyakan metriks dev (misal: 'Siapa contributor paling produktif?')..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              <span>Tanya</span>
            </button>
          </form>

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
            {/* Business Summary */}
            <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-3.5">
              <div className="flex items-center justify-between text-xs text-violet-300 font-semibold mb-1">
                <span>Insight Engineering</span>
                <span className="font-mono text-[10px] text-zinc-400">
                  {result.execution_time_ms}ms · Conf: {Math.round(result.confidence * 100)}%
                </span>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed">{result.summary}</p>
            </div>

            {/* Visual Chart if applicable */}
            {result.chart_data && result.chart_data.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <span className="text-xs font-semibold text-zinc-400 mb-2 block">
                  Grafik Visualisasi Hasil
                </span>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
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
                      <Bar
                        dataKey={Object.keys(result.chart_data[0])[1] || "total_commits"}
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Generated SQL AST Sandbox */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                  <Terminal className="h-3.5 w-3.5 text-zinc-500" />
                  <span>Sandboxed Read-Only SQL (DuckDB)</span>
                </div>
                <button
                  onClick={copySQL}
                  className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300 hover:bg-zinc-700"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : null}
                  <span>{copied ? "Copied" : "Copy SQL"}</span>
                </button>
              </div>
              <pre className="overflow-x-auto rounded bg-zinc-950 p-2 font-mono text-[11px] text-emerald-400">
                {result.generated_sql}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
