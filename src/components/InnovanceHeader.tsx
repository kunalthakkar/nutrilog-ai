import React, { useState } from "react";
import { LogOut, Activity, Dumbbell, ShieldCheck, Heart, Key } from "lucide-react";

interface InnovanceHeaderProps {
  userMobile: string;
  onLogout: () => void;
  activeTab: "analyze" | "logs";
  setActiveTab: (tab: "analyze" | "logs") => void;
  logsCount: number;
  hasApiKey: boolean;
  onOpenSettings: () => void;
}

export default function InnovanceHeader({
  userMobile,
  onLogout,
  activeTab,
  setActiveTab,
  logsCount,
  hasApiKey,
  onOpenSettings,
}: InnovanceHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shrink-0" id="innovance-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-start leading-none gap-1 py-1">
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="text-2xl font-black tracking-tight text-emerald-800 font-sans leading-none select-none">
              Vital.
            </span>
            <span className="text-xs sm:text-sm italic font-medium tracking-wide text-slate-500 select-none">
              Eat with intention
            </span>
          </div>
        </div>

        {/* Navigation & Tab Selection */}
        <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-end">
          {/* Navigation tabs styled beautifully with subtle border */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex gap-1">
            <button
              id="tab-analyze"
              onClick={() => setActiveTab("analyze")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === "analyze"
                  ? "bg-white text-slate-800 border border-slate-200/80 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Analyze & Scan
            </button>
            <button
              id="tab-logs"
              onClick={() => setActiveTab("logs")}
              className={`relative px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === "logs"
                  ? "bg-white text-slate-800 border border-slate-200/80 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />
              Fitness Logs
              {logsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-sans font-bold text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center border border-white animate-pulse">
                  {logsCount}
                </span>
              )}
            </button>
          </div>

          {/* User Session Info / Badges */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end text-right leading-none">
              <span className="text-xs font-semibold text-slate-600 font-mono">
                +91 {userMobile.replace(/(\d{5})(\d{5})/, "$1 $2")}
              </span>
              <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-widest flex items-center gap-0.5 mt-0.5">
                <ShieldCheck className="w-2.5 h-2.5" /> Checked Pro
              </span>
            </div>

            {/* API Key Modal trigger */}
            <button
              id="settings-api-key-btn"
              onClick={onOpenSettings}
              title="Configure Gemini API Key"
              className={`p-2 border rounded-lg transition-colors ${
                hasApiKey 
                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200" 
                  : "bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border-slate-200"
              }`}
            >
              <Key className="w-3.5 h-3.5" />
            </button>

            {/* Logout actions */}
            <button
              id="logout-btn"
              onClick={onLogout}
              title="Logout session"
              className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>


    </header>
  );
}
