"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Trophy,
  X,
  Search,
  Star,
  GitFork,
  ShieldCheck,
  Zap,
  Users,
  ExternalLink,
  Flame,
  CheckCircle2,
  Filter,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Cloud,
  Terminal,
  Smartphone
} from "lucide-react";
import { LEADERBOARD_API_URL } from "@/lib/api";

export interface RepoLeaderboardItem {
  repo_name: string;
  category: string;
  category_label: string;
  description: string;
  stars: number;
  stars_formatted: string;
  forks: number;
  forks_formatted: string;
  license: string;
  license_type: string;
  license_notes: string;
  velocity_score: number;
  velocity_tier: string;
  active_contributors: number;
  health_score: number;
  primary_language: string;
  language_color: string;
  highlight_tag?: string;
  avatar_url: string;
  rank?: number;
  stars_today?: string;
  source?: "trending" | "search" | "fallback";
}

// Built-in benchmark fallback dataset for instant zero-latency rendering
const FALLBACK_LEADERBOARD: RepoLeaderboardItem[] = [
  {
    repo_name: "vllm-project/vllm",
    category: "ai",
    category_label: "AI & Machine Learning",
    description: "High-throughput and memory-efficient LLM serving and inference engine with PagedAttention.",
    stars: 38400,
    stars_formatted: "38.4k",
    forks: 5900,
    forks_formatted: "5.9k",
    license: "Apache-2.0",
    license_type: "permissive",
    license_notes: "Permissive + Patent Protection (Enterprise Ready)",
    velocity_score: 98,
    velocity_tier: "Hyper Velocity",
    active_contributors: 820,
    health_score: 96,
    primary_language: "Python",
    language_color: "#3572A5",
    highlight_tag: "🔥 #1 LLM Serving Engine",
    avatar_url: "https://avatars.githubusercontent.com/u/137792982?v=4"
  },
  {
    repo_name: "huggingface/transformers",
    category: "ai",
    category_label: "AI & Machine Learning",
    description: "State-of-the-art Machine Learning library for PyTorch, TensorFlow, and JAX with thousands of pre-trained models.",
    stars: 136500,
    stars_formatted: "136.5k",
    forks: 26400,
    forks_formatted: "26.4k",
    license: "Apache-2.0",
    license_type: "permissive",
    license_notes: "Permissive + Patent Protection (Enterprise Ready)",
    velocity_score: 96,
    velocity_tier: "Hyper Velocity",
    active_contributors: 2750,
    health_score: 94,
    primary_language: "Python",
    language_color: "#3572A5",
    highlight_tag: "Standard Model Hub",
    avatar_url: "https://avatars.githubusercontent.com/u/25720743?v=4"
  },
  {
    repo_name: "ollama/ollama",
    category: "ai",
    category_label: "AI & Machine Learning",
    description: "Run local LLM models like Llama 3, DeepSeek, and Mistral directly on personal computers.",
    stars: 118000,
    stars_formatted: "118.0k",
    forks: 10200,
    forks_formatted: "10.2k",
    license: "MIT",
    license_type: "permissive",
    license_notes: "Very Permissive (Commercial Friendly)",
    velocity_score: 97,
    velocity_tier: "Hyper Velocity",
    active_contributors: 490,
    health_score: 95,
    primary_language: "Go",
    language_color: "#00ADD8",
    highlight_tag: "Top Local LLM Runner",
    avatar_url: "https://avatars.githubusercontent.com/u/142991041?v=4"
  },
  {
    repo_name: "pytorch/pytorch",
    category: "ai",
    category_label: "AI & Machine Learning",
    description: "World-class tensor computation and deep learning neural network framework with GPU acceleration.",
    stars: 87200,
    stars_formatted: "87.2k",
    forks: 22900,
    forks_formatted: "22.9k",
    license: "BSD-3-Clause",
    license_type: "permissive",
    license_notes: "Permissive Academic & Commercial",
    velocity_score: 95,
    velocity_tier: "Hyper Velocity",
    active_contributors: 3400,
    health_score: 92,
    primary_language: "C++",
    language_color: "#f34b7d",
    highlight_tag: "AI Foundation Backbone",
    avatar_url: "https://avatars.githubusercontent.com/u/21003710?v=4"
  },
  {
    repo_name: "langchain-ai/langchain",
    category: "ai",
    category_label: "AI & Machine Learning",
    description: "Orchestration for intelligent agent applications, Retrieval-Augmented Generation (RAG), and LLM reasoning workflows.",
    stars: 99500,
    stars_formatted: "99.5k",
    forks: 16200,
    forks_formatted: "16.2k",
    license: "MIT",
    license_type: "permissive",
    license_notes: "Very Permissive (Commercial Friendly)",
    velocity_score: 93,
    velocity_tier: "High Velocity",
    active_contributors: 2600,
    health_score: 90,
    primary_language: "Python",
    language_color: "#3572A5",
    highlight_tag: "Top AI Agent Orchestration",
    avatar_url: "https://avatars.githubusercontent.com/u/126733545?v=4"
  },
  {
    repo_name: "vercel/next.js",
    category: "web",
    category_label: "Web & Frontend",
    description: "Industry standard production React framework with App Router, Server Components, and hybrid rendering.",
    stars: 128400,
    stars_formatted: "128.4k",
    forks: 27100,
    forks_formatted: "27.1k",
    license: "MIT",
    license_type: "permissive",
    license_notes: "Very Permissive (Commercial Friendly)",
    velocity_score: 97,
    velocity_tier: "Hyper Velocity",
    active_contributors: 3600,
    health_score: 95,
    primary_language: "TypeScript",
    language_color: "#3178C6",
    highlight_tag: "Industry Web Standard",
    avatar_url: "https://avatars.githubusercontent.com/u/14985020?v=4"
  },
  {
    repo_name: "facebook/react",
    category: "web",
    category_label: "Web & Frontend",
    description: "The world's most popular UI component library for building modular, interactive web interfaces.",
    stars: 231000,
    stars_formatted: "231.0k",
    forks: 46800,
    forks_formatted: "46.8k",
    license: "MIT",
    license_type: "permissive",
    license_notes: "Very Permissive (Commercial Friendly)",
    velocity_score: 92,
    velocity_tier: "High Velocity",
    active_contributors: 1780,
    health_score: 94,
    primary_language: "JavaScript",
    language_color: "#f1e05a",
    highlight_tag: "Global UI Pioneer",
    avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4"
  },
  {
    repo_name: "tailwindlabs/tailwindcss",
    category: "web",
    category_label: "Web & Frontend",
    description: "Utility-first CSS framework for rapid, flexible, and scalable modern interface design.",
    stars: 83900,
    stars_formatted: "83.9k",
    forks: 4200,
    forks_formatted: "4.2k",
    license: "MIT",
    license_type: "permissive",
    license_notes: "Very Permissive (Commercial Friendly)",
    velocity_score: 91,
    velocity_tier: "High Velocity",
    active_contributors: 370,
    health_score: 96,
    primary_language: "CSS / TypeScript",
    language_color: "#38bdf8",
    highlight_tag: "Modern Styling Leader",
    avatar_url: "https://avatars.githubusercontent.com/u/67109815?v=4"
  },
  {
    repo_name: "shadcn-ui/ui",
    category: "web",
    category_label: "Web & Frontend",
    description: "Re-usable UI component collection built on Radix UI and Tailwind CSS, copy-pasted directly into codebases.",
    stars: 76800,
    stars_formatted: "76.8k",
    forks: 6400,
    forks_formatted: "6.4k",
    license: "MIT",
    license_type: "permissive",
    license_notes: "Very Permissive (Commercial Friendly)",
    velocity_score: 94,
    velocity_tier: "High Velocity",
    active_contributors: 320,
    health_score: 97,
    primary_language: "TypeScript",
    language_color: "#3178C6",
    highlight_tag: "Fastest Growing UI Kit",
    avatar_url: "https://avatars.githubusercontent.com/u/139895814?v=4"
  },
  {
    repo_name: "kubernetes/kubernetes",
    category: "devops",
    category_label: "Cloud & DevOps",
    description: "Production-grade container orchestration system for automated deployment, scaling, and application management.",
    stars: 113000,
    stars_formatted: "113.0k",
    forks: 40100,
    forks_formatted: "40.1k",
    license: "Apache-2.0",
    license_type: "permissive",
    license_notes: "Permissive + Patent Protection (Enterprise Ready)",
    velocity_score: 99,
    velocity_tier: "Hyper Velocity",
    active_contributors: 4200,
    health_score: 98,
    primary_language: "Go",
    language_color: "#00ADD8",
    highlight_tag: "Cloud Native Standard",
    avatar_url: "https://avatars.githubusercontent.com/u/13629408?v=4"
  },
  {
    repo_name: "prometheus/prometheus",
    category: "devops",
    category_label: "Cloud & DevOps",
    description: "Industry standard telemetry monitoring and time-series database with reliable PromQL query engine.",
    stars: 58200,
    stars_formatted: "58.2k",
    forks: 9400,
    forks_formatted: "9.4k",
    license: "Apache-2.0",
    license_type: "permissive",
    license_notes: "Permissive + Patent Protection (Enterprise Ready)",
    velocity_score: 90,
    velocity_tier: "High Velocity",
    active_contributors: 980,
    health_score: 95,
    primary_language: "Go",
    language_color: "#00ADD8",
    highlight_tag: "Observability Benchmark",
    avatar_url: "https://avatars.githubusercontent.com/u/3380462?v=4"
  },
  {
    repo_name: "astral-sh/uv",
    category: "systems",
    category_label: "High-Performance Runtimes",
    description: "Extremely fast Python package manager and resolver written in Rust, replacing pip & virtualenv.",
    stars: 49200,
    stars_formatted: "49.2k",
    forks: 1500,
    forks_formatted: "1.5k",
    license: "Apache-2.0 / MIT",
    license_type: "permissive",
    license_notes: "Dual Licensed Permissive (Enterprise Safe)",
    velocity_score: 99,
    velocity_tier: "Hyper Velocity",
    active_contributors: 260,
    health_score: 99,
    primary_language: "Rust",
    language_color: "#DEA584",
    highlight_tag: "⚡ Breakthrough Rust Tooling",
    avatar_url: "https://avatars.githubusercontent.com/u/115962809?v=4"
  },
  {
    repo_name: "oven-sh/bun",
    category: "systems",
    category_label: "High-Performance Runtimes",
    description: "Incredibly fast all-in-one JavaScript & TypeScript runtime with built-in bundler, test runner, and package manager.",
    stars: 77200,
    stars_formatted: "77.2k",
    forks: 2700,
    forks_formatted: "2.7k",
    license: "MIT",
    license_type: "permissive",
    license_notes: "Very Permissive (Commercial Friendly)",
    velocity_score: 97,
    velocity_tier: "Hyper Velocity",
    active_contributors: 720,
    health_score: 96,
    primary_language: "Zig / C++",
    language_color: "#ec915c",
    highlight_tag: "Next-Gen JS Engine",
    avatar_url: "https://avatars.githubusercontent.com/u/904714?v=4"
  },
  {
    repo_name: "flutter/flutter",
    category: "mobile",
    category_label: "Mobile & Multiplatform",
    description: "Google's multiplatform SDK for building natively compiled applications from a single codebase.",
    stars: 166500,
    stars_formatted: "166.5k",
    forks: 27200,
    forks_formatted: "27.2k",
    license: "BSD-3-Clause",
    license_type: "permissive",
    license_notes: "Permissive Academic & Commercial",
    velocity_score: 96,
    velocity_tier: "Hyper Velocity",
    active_contributors: 1380,
    health_score: 95,
    primary_language: "Dart",
    language_color: "#00B4AB",
    highlight_tag: "Cross-Platform Mobile Leader",
    avatar_url: "https://avatars.githubusercontent.com/u/14101776?v=4"
  },
  {
    repo_name: "NAxel-code/gitpulse-analytics",
    category: "ai",
    category_label: "Developer Intelligence & Analytics",
    description: "High-throughput GitHub developer intelligence & DORA metrics engine with DuckDB and Hybrid AI.",
    stars: 1,
    stars_formatted: "1",
    forks: 0,
    forks_formatted: "0",
    license: "MIT",
    license_type: "permissive",
    license_notes: "Very Permissive (Commercial Friendly)",
    velocity_score: 88,
    velocity_tier: "High Velocity",
    active_contributors: 1,
    health_score: 100,
    primary_language: "TypeScript / Python",
    language_color: "#3178C6",
    highlight_tag: "⭐ Your Active Repository",
    avatar_url: "https://avatars.githubusercontent.com/u/104192800?v=4"
  }
];

interface RepoLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRepo: string;
  onSelectRepo: (repoName: string) => void;
}

export function RepoLeaderboardModal({
  isOpen,
  onClose,
  currentRepo,
  onSelectRepo,
}: RepoLeaderboardModalProps) {
  const [items, setItems] = useState<RepoLeaderboardItem[]>(FALLBACK_LEADERBOARD);
  const [activeCategory, setActiveCategory] = useState<string>("trending");
  const [sortBy, setSortBy] = useState<"stars" | "velocity" | "contributors" | "health">("stars");
  const [licenseFilter, setLicenseFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Debounce search query input by 350ms to query live GitHub Search API smoothly
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Keyboard shortcut ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch live benchmark leaderboard from GitHub Trending & GitHub Search API
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeCategory !== "all") params.append("category", activeCategory);
        if (activeCategory === "trending") params.append("timeframe", "daily");
        if (activeCategory === "trending_weekly") params.append("timeframe", "weekly");
        params.append("sort_by", sortBy);
        if (licenseFilter !== "all") params.append("license_filter", licenseFilter);
        if (debouncedQuery.trim()) params.append("query", debouncedQuery.trim());

        const res = await fetch(`${LEADERBOARD_API_URL}?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            setItems(data);
          }
        }
      } catch (err) {
        console.warn("Using offline benchmark leaderboard:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLeaderboard();
    return () => {
      isMounted = false;
    };
  }, [isOpen, activeCategory, sortBy, licenseFilter, debouncedQuery]);

  // Client-side fallback filtering & sorting
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (!debouncedQuery.trim() && !activeCategory.startsWith("trending") && activeCategory !== "all") {
      result = result.filter(
        (r) => r.category === activeCategory || r.category === "general"
      );
    }

    if (licenseFilter !== "all") {
      result = result.filter((r) =>
        r.license.toLowerCase().includes(licenseFilter.toLowerCase())
      );
    }

    if (debouncedQuery.trim() && items[0]?.source !== "search") {
      const q = debouncedQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.repo_name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.primary_language.toLowerCase().includes(q) ||
          (r.highlight_tag && r.highlight_tag.toLowerCase().includes(q))
      );
    }

    if (sortBy === "velocity") {
      result.sort((a, b) => b.velocity_score - a.velocity_score);
    } else if (sortBy === "contributors") {
      result.sort((a, b) => b.active_contributors - a.active_contributors);
    } else if (sortBy === "health") {
      result.sort((a, b) => b.health_score - a.health_score);
    } else {
      result.sort((a, b) => b.stars - a.stars);
    }

    return result.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [items, activeCategory, licenseFilter, debouncedQuery, sortBy]);

  const categories = [
    { id: "trending", label: "🔥 Trending Today", icon: Flame },
    { id: "trending_weekly", label: "📅 Trending This Week", icon: TrendingUp },
    { id: "all", label: "🌟 All Starred", icon: Layers },
    { id: "ai", label: "🤖 AI & Machine Learning", icon: Cpu },
    { id: "web", label: "⚡ Web & Frontend", icon: Sparkles },
    { id: "devops", label: "⚙️ Cloud & DevOps", icon: Cloud },
    { id: "systems", label: "🦀 Systems & Runtimes", icon: Terminal },
    { id: "mobile", label: "📱 Mobile Ecosystem", icon: Smartphone },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[90vh] rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-sm">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Open Source Benchmark Leaderboard
                </h2>
                {debouncedQuery.trim() ? (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live GitHub Search API
                  </span>
                ) : activeCategory.startsWith("trending") ? (
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Flame className="h-3 w-3 text-amber-400" />
                    Live Scraped from github.com/trending
                  </span>
                ) : (
                  <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-indigo-400" />
                    Live GitHub Search API
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Displaying {filteredItems.length} repositories across trending velocity and global GitHub search.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-zinc-800/80 bg-zinc-900/30 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-zinc-800 text-white border border-zinc-700 shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-amber-400" : "text-zinc-500"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 border-b border-zinc-800/60 bg-zinc-950/80">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all GitHub repositories (e.g., deepseek, transformers, linux, uv)..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Controls: License Filter & Sort By */}
          <div className="flex flex-wrap items-center gap-2">
            {/* License Dropdown */}
            <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/70 px-2.5 py-1 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <select
                value={licenseFilter}
                onChange={(e) => setLicenseFilter(e.target.value)}
                aria-label="Filter License"
                className="bg-transparent text-xs text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-zinc-900">All Licenses</option>
                <option value="apache" className="bg-zinc-900">Apache-2.0 (Enterprise Patent)</option>
                <option value="mit" className="bg-zinc-900">MIT (Commercial Friendly)</option>
                <option value="bsd" className="bg-zinc-900">BSD-3-Clause</option>
                <option value="gpl" className="bg-zinc-900">GPL-2.0 / GPL-3.0</option>
              </select>
            </div>

            {/* Sort By Pills */}
            <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/70 p-0.5">
              {[
                { id: "stars", label: "⭐ Stars", icon: Star },
                { id: "velocity", label: "⚡ Velocity", icon: Zap },
                { id: "contributors", label: "👥 Contributors", icon: Users },
                { id: "health", label: "🛡️ Health", icon: CheckCircle2 },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id as any)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                    sortBy === s.id
                      ? "bg-zinc-800 text-white font-semibold shadow-xs"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area: Repository List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {loading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 animate-pulse flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 flex-1">
                    <div className="h-8 w-8 rounded-xl bg-zinc-800" />
                    <div className="h-10 w-10 rounded-xl bg-zinc-800" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-44 rounded bg-zinc-800" />
                      <div className="h-3 w-72 rounded bg-zinc-800/60" />
                    </div>
                  </div>
                  <div className="h-8 w-24 rounded-xl bg-zinc-800" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
              <Filter className="h-8 w-8 mx-auto mb-2 text-zinc-600" />
              <p className="text-sm font-medium text-zinc-400">No repositories match your active filters.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                  setLicenseFilter("all");
                }}
                className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = currentRepo.toLowerCase() === item.repo_name.toLowerCase();
              const isTop1 = item.rank === 1;
              const isTop2 = item.rank === 2;
              const isTop3 = item.rank === 3;

              return (
                <div
                  key={item.repo_name}
                  className={`group relative rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-emerald-500/50 bg-emerald-500/5 shadow-md shadow-emerald-500/5"
                      : isTop1
                      ? "border-amber-500/30 bg-zinc-900/60 hover:border-amber-500/50"
                      : "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Left: Rank, Avatar & Info */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Rank Badge */}
                      <div className="shrink-0 mt-0.5">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-mono font-bold border ${
                            isTop1
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs shadow-amber-500/20"
                              : isTop2
                              ? "bg-zinc-700/30 text-zinc-200 border-zinc-500/40"
                              : isTop3
                              ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                              : "bg-zinc-800/80 text-zinc-400 border-zinc-700/50"
                          }`}
                        >
                          #{item.rank}
                        </span>
                      </div>

                      {/* Avatar */}
                      <img
                        src={item.avatar_url}
                        alt={item.repo_name}
                        className="h-10 w-10 rounded-xl border border-zinc-700/80 bg-zinc-800 object-cover shrink-0 mt-0.5"
                      />

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={`https://github.com/${item.repo_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm font-bold text-white hover:text-indigo-400 transition flex items-center gap-1 group-hover:underline"
                            title="Open repository on GitHub"
                          >
                            <span>{item.repo_name}</span>
                            <ExternalLink className="h-3 w-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition" />
                          </a>

                          {item.highlight_tag && (
                            <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-500/20">
                              {item.highlight_tag}
                            </span>
                          )}

                          <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                            <span
                              className="h-2 w-2 rounded-full inline-block"
                              style={{ backgroundColor: item.language_color }}
                            />
                            {item.primary_language}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        {/* License & Health Notes */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
                              item.license.includes("Apache")
                                ? "bg-sky-500/10 text-sky-300 border-sky-500/30"
                                : item.license.includes("MIT")
                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                : "bg-teal-500/10 text-teal-300 border-teal-500/30"
                            }`}
                            title={item.license_notes}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            {item.license}
                          </span>
                          <span className="text-[11px] text-zinc-500 truncate max-w-xs">
                            {item.license_notes}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Metrics & Action */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800/80">
                      {/* Community Stars */}
                      <div className="text-left sm:text-right min-w-[75px]">
                        <div className="flex items-center gap-1 text-xs sm:justify-end font-mono font-bold text-amber-300">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{item.stars_formatted}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 sm:justify-end font-mono mt-0.5">
                          <GitFork className="h-3 w-3 text-zinc-500" />
                          <span>{item.forks_formatted} forks</span>
                        </div>
                      </div>

                      {/* Velocity Meter */}
                      <div className="text-left sm:text-right min-w-[95px]">
                        <div className="flex items-center gap-1 text-xs sm:justify-end font-mono font-bold text-white">
                          <Zap className="h-3.5 w-3.5 text-indigo-400" />
                          <span>{item.velocity_score} pts</span>
                        </div>
                        <div className="text-[10px] text-indigo-300/80 font-medium sm:justify-end">
                          {item.velocity_tier}
                        </div>
                      </div>

                      {/* Contributors & Health */}
                      <div className="hidden sm:block text-right min-w-[90px]">
                        <div className="flex items-center gap-1 justify-end text-xs font-mono text-zinc-300">
                          <Users className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{item.active_contributors.toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                          {item.health_score}% Health
                        </div>
                      </div>

                      {/* 1-Click Action Button */}
                      <div className="shrink-0 ml-auto sm:ml-0">
                        {isSelected ? (
                          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Currently Active</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectRepo(item.repo_name);
                              onClose();
                            }}
                            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-indigo-600 hover:border-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition cursor-pointer group/btn"
                          >
                            <span>Analyze Repo</span>
                            <ArrowRight className="h-3.5 w-3.5 transition group-hover/btn:translate-x-0.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 px-6 py-3 bg-zinc-900/60 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Click <strong>&quot;Analyze Repo&quot;</strong> to load real-time GitHub data for your selected repository directly into the dashboard.</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            Close (Esc)
          </button>
        </div>

      </div>
    </div>
  );
}
