import React, { useState, useMemo } from "react";
import { LogEntry } from "../types";
import {
  Calendar,
  Trash2,
  Flame,
  Gauge,
  Apple,
  Filter,
  CheckCircle,
  TrendingUp,
  History,
  TrendingDown,
  Cloud,
  ChevronRight,
  X,
} from "lucide-react";

interface FitnessHistoryLogsProps {
  logs: LogEntry[];
  onDeleteLog: (id: string) => void;
  syncStatus?: "synced" | "syncing" | "error";
}

export default function FitnessHistoryLogs({ logs, onDeleteLog, syncStatus = "synced" }: FitnessHistoryLogsProps) {
  const [dateFilterType, setDateFilterType] = useState<"all" | "today" | "yesterday" | "custom">("all");
  const [customDateValue, setCustomDateValue] = useState<string>(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const adjusted = new Date(today.getTime() - offset * 60 * 1000);
    return adjusted.toISOString().split("T")[0];
  });
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  // Calculate formatted dates for filtering (India & Local timezone stability)
  const dateStrings = useMemo(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const format = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return {
      today: format(today),
      yesterday: format(yesterday),
    };
  }, []);

  // Filter logs according to filter choice
  const filteredLogs = useMemo(() => {
    let list = [...logs];

    // Sort by timestamp descending (newest logged entries show up first)
    list.sort((a, b) => b.timestamp - a.timestamp);

    if (dateFilterType === "today") {
      return list.filter((item) => item.dateStr === dateStrings.today);
    }
    if (dateFilterType === "yesterday") {
      return list.filter((item) => item.dateStr === dateStrings.yesterday);
    }
    if (dateFilterType === "custom") {
      return list.filter((item) => item.dateStr === customDateValue);
    }
    return list;
  }, [logs, dateFilterType, customDateValue, dateStrings]);

  // Aggregate stats totals for the selected period
  const aggregates = useMemo(() => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFiber = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalSodium = 0;
    let totalPotassium = 0;
    let totalCalcium = 0;
    let totalIron = 0;
    let totalMagnesium = 0;
    let totalZinc = 0;

    filteredLogs.forEach((item) => {
      totalCalories += item.calories;
      totalProtein += item.protein;
      totalFiber += item.fiber || 0;
      totalCarbs += item.carbs;
      totalFats += item.fat;
      totalSodium += item.sodium || 0;
      totalPotassium += item.potassium || 0;
      totalCalcium += item.calcium || 0;
      totalIron += item.iron || 0;
      totalMagnesium += item.magnesium || 0;
      totalZinc += item.zinc || 0;
    });

    return {
      calories: totalCalories,
      protein: Number(totalProtein.toFixed(1)),
      fiber: Number(totalFiber.toFixed(1)),
      carbs: Number(totalCarbs.toFixed(1)),
      fats: Number(totalFats.toFixed(1)),
      sodium: Number(totalSodium.toFixed(1)),
      potassium: Number(totalPotassium.toFixed(1)),
      calcium: Number(totalCalcium.toFixed(1)),
      iron: Number(totalIron.toFixed(1)),
      magnesium: Number(totalMagnesium.toFixed(1)),
      zinc: Number(totalZinc.toFixed(1)),
    };
  }, [filteredLogs]);

  // Daily target benchmarks (standard active male/female lifter benchmarks)
  const targets = {
    calories: 2500,
    protein: 140, // 140g protein
    fiber: 30, // 30g fiber
  };

  return (
    <div className="space-y-6" id="fitness-history-logs">
      {/* Filters Header Option Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Filter className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm tracking-tight">
                  Historical Intake Filters
                </h3>
                {/* Cloud Sync Status Indicator */}
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold select-none border ${
                  syncStatus === "syncing"
                    ? "bg-amber-50 text-amber-600 border-amber-200"
                    : syncStatus === "error"
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-emerald-50 text-emerald-600 border-emerald-200"
                }`}>
                  <Cloud className={`w-2.5 h-2.5 ${syncStatus === "syncing" ? "animate-bounce" : ""}`} />
                  <span>
                    {syncStatus === "syncing" && "Syncing"}
                    {syncStatus === "error" && "Sync Error"}
                    {syncStatus === "synced" && "Cloud Synced"}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Track, aggregate, and review your logged daily nutrition levels
              </p>
            </div>
          </div>

          {/* Quick Filters buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="filter-all"
              onClick={() => setDateFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all border ${
                dateFilterType === "all"
                  ? "bg-emerald-55 border-emerald-300 text-emerald-700 font-bold"
                  : "bg-slate-50 border-slate-100 text-slate-600 hover:text-slate-800"
              }`}
            >
              SHOW ALL ({logs.length})
            </button>
            <button
              id="filter-today"
              onClick={() => setDateFilterType("today")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all border ${
                dateFilterType === "today"
                  ? "bg-emerald-55 border-emerald-300 text-emerald-700 font-bold"
                  : "bg-slate-50 border-slate-100 text-slate-600 hover:text-slate-800"
              }`}
            >
              TODAY
            </button>
            <button
              id="filter-yesterday"
              onClick={() => setDateFilterType("yesterday")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all border ${
                dateFilterType === "yesterday"
                  ? "bg-emerald-55 border-emerald-300 text-emerald-700 font-bold"
                  : "bg-slate-50 border-slate-100 text-slate-600 hover:text-slate-800"
              }`}
            >
              YESTERDAY
            </button>

            {/* Custom Calendar date pick */}
            <div className="flex items-center gap-1.5">
              <button
                id="filter-custom"
                onClick={() => setDateFilterType("custom")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all border flex items-center gap-1.5 ${
                  dateFilterType === "custom"
                    ? "bg-emerald-55 border-emerald-300 text-emerald-700 font-bold"
                    : "bg-slate-50 border-slate-100 text-slate-600 hover:text-slate-800"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                DATE PICK
              </button>
              {dateFilterType === "custom" && (
                <input
                  id="custom-date-picker"
                  type="date"
                  value={customDateValue}
                  onChange={(e) => setCustomDateValue(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-800 rounded-lg px-2 py-1 text-xs font-mono outline-none focus:border-emerald-500"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Score Panel for selected day */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Calories Aggregation */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest">
              Total Intake Energy
            </span>
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <div className="text-3xl font-black font-mono text-slate-800">
              {aggregates.calories}
            </div>
            <span className="text-xs text-slate-500">kcal</span>
          </div>
          {/* Target Progress Bar */}
          <div className="h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((aggregates.calories / targets.calories) * 100, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">
            Target benchmark: {targets.calories} kcal
          </span>
        </div>

        {/* Total Protein Aggregation */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest">
              Anabolic Proteins
            </span>
            <Gauge className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <div className="text-3xl font-black font-mono text-emerald-600">
              {aggregates.protein}
            </div>
            <span className="text-xs text-slate-500">grams (g)</span>
          </div>
          {/* Target Progress Bar */}
          <div className="h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((aggregates.protein / targets.protein) * 100, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">
            Protein objective: {targets.protein}g protein
          </span>
        </div>

        {/* Total Fiber Aggregation */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest">
              Digestion & Fiber
            </span>
            <Apple className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <div className="text-3xl font-black font-mono text-teal-600">
              {aggregates.fiber}
            </div>
            <span className="text-xs text-slate-500">grams (g)</span>
          </div>
          {/* Target Progress Bar */}
          <div className="h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((aggregates.fiber / targets.fiber) * 100, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">
            Gut objective: {targets.fiber}g fiber
          </span>
        </div>
      </div>

      {/* Aggregate Carb/Fat ratios under current filtered view */}
      {filteredLogs.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
              <span className="text-xs font-mono text-slate-700 uppercase font-bold">
                Current Filtered Period Totals:
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              Accumulated nutrition benchmarks
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5 text-xs font-mono">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Protein</span>
              <span className="text-emerald-650 font-extrabold text-sm">{aggregates.protein}g</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Carbs</span>
              <span className="text-amber-650 font-extrabold text-sm">{aggregates.carbs}g</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Fats</span>
              <span className="text-sky-650 font-extrabold text-sm">{aggregates.fats}g</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Fiber</span>
              <span className="text-teal-650 font-extrabold text-sm">{aggregates.fiber}g</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Sodium</span>
              <span className="text-blue-650 font-extrabold text-sm">{aggregates.sodium}mg</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Potassium</span>
              <span className="text-indigo-650 font-extrabold text-sm">{aggregates.potassium}mg</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Calcium</span>
              <span className="text-purple-650 font-extrabold text-sm">{aggregates.calcium}mg</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Iron</span>
              <span className="text-amber-700 font-extrabold text-sm">{aggregates.iron}mg</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Magnesium</span>
              <span className="text-rose-650 font-extrabold text-sm">{aggregates.magnesium}mg</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Zinc</span>
              <span className="text-teal-650 font-extrabold text-sm">{aggregates.zinc}mg</span>
            </div>
          </div>
        </div>
      )}

      {/* Feed log results block */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-slate-800 font-bold text-sm">No gym meals logged yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Log daily items from your analyzer. Or alter the filter date to check if elements were recorded on other days.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5" id="log-list-wrapper">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1 font-mono">
            <span>CONSUMED ITEM</span>
            <span className="hidden sm:inline">MACROS & QUANTITY</span>
          </div>
          {filteredLogs.map((item) => {
            // Form timestamp to human time
            const logTimeStr = new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div
                key={item.id}
                onClick={() => setSelectedLog(item)}
                className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4 hover:border-slate-350 hover:bg-slate-50/40 cursor-pointer transition-all shadow-sm group select-none"
                title="Click to view full nutrition details"
              >
                {/* Left Side: Product name, Quantity, Protein & Calories */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-800 text-sm sm:text-base leading-tight truncate">
                      {item.productName}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 shrink-0">
                      {item.quantityGrams}g
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-mono">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">{item.protein}g Protein</span>
                    <span>•</span>
                    <span className="text-slate-700 font-bold">{item.calories} kcal</span>
                    <span>•</span>
                    <span className="text-slate-400 font-medium">
                      Logged {item.dateStr === dateStrings.today ? "Today" : item.dateStr} at {logTimeStr}
                    </span>
                  </div>
                </div>

                {/* Right Side: Navigation helper & Delete Action */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-600 transition-colors">
                    <span className="hidden md:inline text-[10px] font-mono uppercase tracking-wider font-bold">Details</span>
                    <ChevronRight className="w-4.5 h-4.5" />
                  </div>

                  {/* Delete Button */}
                  <button
                    id={`delete-entry-${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent opening details modal on delete click
                      onDeleteLog(item.id);
                    }}
                    className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 rounded-lg hover:border-red-200 active:scale-95 transition-all"
                    title="Delete log entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed sub-screen overlay modal with all metrics */}
      {selectedLog && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          id="nutrition-details-modal"
          onClick={() => setSelectedLog(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header section */}
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-400 block mb-1">
                  Detailed Intake Record
                </span>
                <h3 className="text-lg font-black tracking-tight leading-tight">
                  {selectedLog.productName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors outline-none"
                title="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
              {/* Portion size & timing */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 select-none">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">PORTION SIZE</span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {selectedLog.quantityGrams} grams (g)
                  </span>
                </div>
                <div className="space-y-0.5 sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">RECORDED TIMESTAMP</span>
                  <span className="text-sm font-bold text-slate-700 font-mono">
                    {selectedLog.dateStr} at {new Date(selectedLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Core Macronutrients breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">
                  Macronutrient Balance
                </h4>
                <div className="grid grid-cols-4 gap-3 select-none">
                  {/* Energy calories */}
                  <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl text-center">
                    <span className="text-[10px] text-orange-600 uppercase font-mono font-bold block mb-1">Calories</span>
                    <span className="text-orange-700 font-black text-base font-mono">{selectedLog.calories}</span>
                    <span className="text-[9px] text-orange-500 font-mono block">kcal</span>
                  </div>
                  {/* Protein */}
                  <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center">
                    <span className="text-[10px] text-emerald-600 uppercase font-mono font-bold block mb-1">Protein</span>
                    <span className="text-emerald-700 font-black text-base font-mono">{selectedLog.protein}g</span>
                    <span className="text-[9px] text-emerald-500 font-mono block">muscle</span>
                  </div>
                  {/* Carbs */}
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-center">
                    <span className="text-[10px] text-amber-600 uppercase font-mono font-bold block mb-1">Carbs</span>
                    <span className="text-amber-700 font-black text-base font-mono">{selectedLog.carbs}g</span>
                    <span className="text-[9px] text-amber-500 font-mono block">energy</span>
                  </div>
                  {/* Fat */}
                  <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl text-center">
                    <span className="text-[10px] text-sky-600 uppercase font-mono font-bold block mb-1">Fat</span>
                    <span className="text-sky-700 font-black text-base font-mono">{selectedLog.fat}g</span>
                    <span className="text-[9px] text-sky-500 font-mono block">hormone</span>
                  </div>
                </div>
              </div>

              {/* Fiber & Core Electrolytes Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">
                    Dietary Fiber & Essential Minerals
                  </h4>
                  <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Micronutrients
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs select-none">
                  {/* Fiber */}
                  <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold">Fiber</span>
                    <span className="text-teal-650 font-black text-base mt-1">
                      {selectedLog.fiber !== undefined ? selectedLog.fiber : 0}g
                    </span>
                  </div>
                  {/* Sodium */}
                  <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold">Sodium</span>
                    <span className="text-blue-600 font-black text-base mt-1">
                      {selectedLog.sodium !== undefined ? selectedLog.sodium : 0}mg
                    </span>
                  </div>
                  {/* Potassium */}
                  <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold">Potassium</span>
                    <span className="text-indigo-650 font-black text-base mt-1">
                      {selectedLog.potassium !== undefined ? selectedLog.potassium : 0}mg
                    </span>
                  </div>
                  {/* Calcium */}
                  <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold">Calcium</span>
                    <span className="text-purple-600 font-black text-base mt-1">
                      {selectedLog.calcium !== undefined ? selectedLog.calcium : 0}mg
                    </span>
                  </div>
                  {/* Iron */}
                  <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold">Iron</span>
                    <span className="text-amber-700 font-black text-base mt-1">
                      {selectedLog.iron !== undefined ? selectedLog.iron : 0}mg
                    </span>
                  </div>
                  {/* Magnesium */}
                  <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold">Magnesium</span>
                    <span className="text-rose-650 font-black text-base mt-1">
                      {selectedLog.magnesium !== undefined ? selectedLog.magnesium : 0}mg
                    </span>
                  </div>
                  {/* Zinc */}
                  <div className="bg-slate-50 border border-slate-200/80 col-span-2 sm:col-span-1 p-3 rounded-lg flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold">Zinc</span>
                    <span className="text-teal-600 font-black text-base mt-1">
                      {selectedLog.zinc !== undefined ? selectedLog.zinc : 0}mg
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with actions */}
            <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex items-center justify-end gap-3 select-none">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-mono rounded-lg transition-all"
              >
                CLOSE DETAILS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
