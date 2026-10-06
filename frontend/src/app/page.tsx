"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { KPICards } from "@/components/KPICards";
import { ActivityChart } from "@/components/ActivityChart";
import { FunnelChart } from "@/components/FunnelChart";
import { ContributorTable } from "@/components/ContributorTable";
import { ContributorJourneyModal } from "@/components/ContributorJourneyModal";
import { DORAFeed } from "@/components/DORAFeed";
import { AIModal } from "@/components/AIModal";

export default function GitPulseDashboard() {
  const [currentRepo, setCurrentRepo] = useState("vercel/next.js");
  const [days, setDays] = useState(14);
  const [githubToken, setGithubToken] = useState("");
  const [kpiData, setKpiData] = useState<any>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState<any>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState<string | null>(null);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Load saved GitHub PAT from localStorage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("gitpulse_github_token");
      if (savedToken) {
        setGithubToken(savedToken);
      }
    } catch (e) {
      console.warn("Could not read localStorage for token:", e);
    }
  }, []);

  const handleTokenChange = (token: string) => {
    setGithubToken(token);
    try {
      if (token) {
        localStorage.setItem("gitpulse_github_token", token);
      } else {
        localStorage.removeItem("gitpulse_github_token");
      }
    } catch (e) {
      console.warn("Could not write localStorage token:", e);
    }
  };

  // Keyboard shortcut Cmd+K or Ctrl+K for AI modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsAIModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchData = async () => {
    const baseUrl = "http://127.0.0.1:8000/api/v1/github";

    try {
      const [kpiRes, timelineRes, funnelRes, contribRes, anomalyRes, summaryRes] = await Promise.all([
        fetch(`${baseUrl}/overview?repo=${encodeURIComponent(currentRepo)}&days=${days}`).then((r) => r.json()),
        fetch(`${baseUrl}/timeline?repo=${encodeURIComponent(currentRepo)}&days=${days}`).then((r) => r.json()),
        fetch(`${baseUrl}/pr-funnel?repo=${encodeURIComponent(currentRepo)}&days=${days}`).then((r) => r.json()),
        fetch(`${baseUrl}/contributors?repo=${encodeURIComponent(currentRepo)}&days=${days}`).then((r) => r.json()),
        fetch(`${baseUrl}/anomalies?repo=${encodeURIComponent(currentRepo)}`).then((r) => r.json()),
        fetch(`${baseUrl}/executive-summary?repo=${encodeURIComponent(currentRepo)}`).then((r) => r.json()),
      ]);

      setKpiData(kpiRes);
      setTimelineData(timelineRes);
      setFunnelData(funnelRes);
      setContributors(contribRes);
      setAnomalies(anomalyRes);
      setExecutiveSummary(summaryRes);
    } catch (err) {
      console.error("Error fetching GitPulse metrics:", err);
    }
  };

  const handleSyncRepo = async (repoName: string) => {
    setSyncing(true);
    try {
      await fetch("http://127.0.0.1:8000/api/v1/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_name: repoName,
          days: days,
          github_token: githubToken ? githubToken.trim() : undefined,
        }),
      });
      await fetchData();
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentRepo, days]);

  const handleOpenJourney = (login: string) => {
    setSelectedContributor(login);
    setIsJourneyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Sticky Header with Token & Sync controls */}
      <Header
        currentRepo={currentRepo}
        onRepoChange={(r) => {
          setCurrentRepo(r);
          handleSyncRepo(r);
        }}
        onSyncRepo={handleSyncRepo}
        syncing={syncing}
        days={days}
        onDaysChange={(d) => setDays(d)}
        onOpenAI={() => setIsAIModalOpen(true)}
        githubToken={githubToken}
        onTokenChange={handleTokenChange}
      />

      {/* Main Content Bento Grid */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Top: Bento KPI Cards with Number Ticker & DORA Velocity */}
        <KPICards data={kpiData} />

        {/* Middle Section: Activity Timeline Chart (65%) vs PR Lifecycle Funnel (35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <ActivityChart data={timelineData} repoName={currentRepo} />
          </div>
          <div className="lg:col-span-4">
            <FunnelChart stages={funnelData} />
          </div>
        </div>

        {/* Bottom Section: Contributor Velocity Table (60%) vs DORA Feed (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <ContributorTable
              data={contributors}
              onSelectContributor={handleOpenJourney}
            />
          </div>
          <div className="lg:col-span-5">
            <DORAFeed alerts={anomalies} summary={executiveSummary} />
          </div>
        </div>
      </main>

      {/* Woopra-style Contributor Journey Modal */}
      <ContributorJourneyModal
        isOpen={isJourneyModalOpen}
        onClose={() => setIsJourneyModalOpen(false)}
        login={selectedContributor}
        repoName={currentRepo}
      />

      {/* AI Text-to-Insight Modal */}
      <AIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        currentRepo={currentRepo}
      />
    </div>
  );
}
