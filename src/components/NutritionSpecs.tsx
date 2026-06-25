import React, { useState } from "react";
import { NutritionResult } from "../types";
import {
  Sparkles,
  Flame,
  Gauge,
  PlusCircle,
  HelpCircle,
  Info,
  Scale,
  Brain,
  Droplets,
  Heart,
  ShieldCheck,
} from "lucide-react";

interface NutritionSpecsProps {
  data: NutritionResult;
  onLog: (scaledResult: NutritionResult, quantityGrams: number) => void;
  isLogging: boolean;
}

export default function NutritionSpecs({ data, onLog, isLogging }: NutritionSpecsProps) {
  const baseGrams = data.estimatedGrams || 100;
  const [portionGrams, setPortionGrams] = useState<number>(baseGrams);

  // Sync portionGrams whenever new data loads
  React.useEffect(() => {
    setPortionGrams(data.estimatedGrams || 100);
  }, [data]);

  // Scaler multiplier based on entered portion size relative to the base portion
  const scale = portionGrams / baseGrams;

  const scaledCalories = Math.round(data.calories * scale);
  const scaledProtein = Number((data.protein * scale).toFixed(1));
  const scaledCarbs = Number((data.carbs * scale).toFixed(1));
  const scaledFat = Number((data.fat * scale).toFixed(1));
  const scaledFiber = Number((data.fiber * scale).toFixed(1));

  // Ions
  const scaledSodium = Math.round(data.sodium * scale);
  const scaledPotassium = Math.round(data.potassium * scale);
  const scaledCalcium = Math.round(data.calcium * scale);

  // Minerals
  const scaledIron = Number((data.iron * scale).toFixed(2));
  const scaledMagnesium = Math.round(data.magnesium * scale);
  const scaledZinc = Number((data.zinc * scale).toFixed(2));

  const totalMacros = (scaledProtein + scaledCarbs + scaledFat) || 1;
  const proteinPercent = Math.round((scaledProtein / totalMacros) * 100);
  const carbsPercent = Math.round((scaledCarbs / totalMacros) * 100);
  const fatPercent = Math.round((scaledFat / totalMacros) * 100);

  const handleLogClick = () => {
    // Return scaled stats to save in log history
    const scaledResult: NutritionResult = {
      ...data,
      calories: scaledCalories,
      protein: scaledProtein,
      carbs: scaledCarbs,
      fat: scaledFat,
      sodium: scaledSodium,
      potassium: scaledPotassium,
      calcium: scaledCalcium,
      iron: scaledIron,
      magnesium: scaledMagnesium,
      zinc: scaledZinc,
      fiber: scaledFiber,
    };
    onLog(scaledResult, portionGrams);
  };

  return (
    <div className="space-y-6" id="nutrition-specs-container">
      {/* Name and Portion Selector Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden" id="item-info-card">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100/30 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">
                Item Analyzed
              </span>
              {data.servingSizeName && (
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider font-mono">
                  Portion: {data.servingSizeName}
                </span>
              )}
              {data.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-mono font-semibold py-0.5 px-2 rounded uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              {data.product}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-slate-500" />
              Adjust portion weight to scale nutritional metrics
            </p>
          </div>

          {/* Gram Adjuster */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/90 flex items-center gap-4 self-start md:self-center min-w-[240px]">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-slate-500 font-mono mb-1">
                <span className="font-semibold text-slate-600">Portion Size</span>
                <span className="text-emerald-600 font-bold">{portionGrams}g</span>
              </div>
              <input
                id="portion-slider"
                type="range"
                min={Math.max(10, Math.round(baseGrams / 4))}
                max={Math.round(baseGrams * 3)}
                step={baseGrams > 100 ? 10 : 5}
                value={portionGrams}
                onChange={(e) => setPortionGrams(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
            <div className="flex flex-col">
              <input
                id="portion-number-input"
                type="number"
                min="5"
                max="5000"
                value={portionGrams}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val > 0) setPortionGrams(val);
                }}
                className="w-16 bg-white border border-slate-200 rounded px-1.5 py-1 text-center font-mono text-sm text-slate-800 outline-none focus:border-emerald-500"
              />
              <span className="text-[9px] text-slate-400 text-center font-mono mt-0.5">GRAMS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Core Macros Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold font-mono text-slate-400 tracking-wider">Calories</span>
            <div className="text-xl font-black text-slate-800 font-mono">{scaledCalories} <span className="text-xs font-normal text-slate-500">kcal</span></div>
          </div>
        </div>

        {/* Proteins Card (Crucial for Gym) */}
        <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold font-mono text-slate-400 tracking-wider">Protein</span>
            <div className="text-xl font-black text-emerald-600 font-mono">{scaledProtein} <span className="text-xs font-normal text-slate-500">g</span></div>
          </div>
        </div>

        {/* Carbohydrates Card */}
        <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold font-mono text-slate-400 tracking-wider">Carbs</span>
            <div className="text-xl font-black text-slate-800 font-mono">{scaledCarbs} <span className="text-xs font-normal text-slate-500">g</span></div>
          </div>
        </div>

        {/* Fats Card */}
        <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
          <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold font-mono text-slate-400 tracking-wider">Fats</span>
            <div className="text-xl font-black text-slate-800 font-mono">{scaledFat} <span className="text-xs font-normal text-slate-500">g</span></div>
          </div>
        </div>
      </div>

      {/* Dynamic Breakdown Bars */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          Macro Energy Contribution Ratio
        </h3>
        <div className="h-3.5 bg-slate-200 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${proteinPercent || 0}%` }}
            title={`Protein: ${proteinPercent}%`}
          />
          <div
            className="bg-amber-400 h-full transition-all duration-500"
            style={{ width: `${carbsPercent || 0}%` }}
            title={`Carbohydrates: ${carbsPercent}%`}
          />
          <div
            className="bg-sky-400 h-full transition-all duration-500"
            style={{ width: `${fatPercent || 0}%` }}
            title={`Fats: ${fatPercent}%`}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">Protein: {proteinPercent}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-600 font-medium">Carbs: {carbsPercent}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="text-slate-600 font-medium">Fats: {fatPercent}%</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics: Electrolytes & Minerals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Electrolytes Panel */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Droplets className="w-4.5 h-4.5 text-emerald-500" />
            Core Electrolytes
          </h3>
          <p className="text-[11px] text-slate-400 leading-snug">
            Electrolytes regulate muscular hydration, muscle contractility, neuromuscular impulses, and prevent muscle cramps during intense lifting splits.
          </p>

          <div className="space-y-2.5 pt-1">
            {/* Sodium */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Sodium</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-800">{scaledSodium} mg</span>
                <span className="text-[10px] text-slate-400">/ {portionGrams}g</span>
              </div>
            </div>

            {/* Potassium */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Potassium</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-800">{scaledPotassium} mg</span>
                <span className="text-[10px] text-slate-400">/ {portionGrams}g</span>
              </div>
            </div>

            {/* Calcium */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Calcium</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-800">{scaledCalcium} mg</span>
                <span className="text-[10px] text-slate-400">/ {portionGrams}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Micronutrient Minerals panel */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Heart className="w-4.5 h-4.5 text-emerald-500" />
            Essential Minerals & Fiber
          </h3>
          <p className="text-[11px] text-slate-400 leading-snug">
            Sustains high metabolic rates, optimizes blood oxygen flow, aids massive high-protein diet gut digestion, and supports physical performance.
          </p>

          <div className="space-y-2.5 pt-1">
            {/* Iron */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Iron</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-800">{scaledIron} mg</span>
                <span className="text-[10px] text-slate-400">/ {portionGrams}g</span>
              </div>
            </div>

            {/* Magnesium */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Magnesium</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-800">{scaledMagnesium} mg</span>
                <span className="text-[10px] text-slate-400">/ {portionGrams}g</span>
              </div>
            </div>

            {/* Zinc */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Zinc</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-800">{scaledZinc} mg</span>
                <span className="text-[10px] text-slate-400">/ {portionGrams}g</span>
              </div>
            </div>

            {/* Fiber */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700">Dietary Fiber</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-800">{scaledFiber} g</span>
                <span className="text-[10px] text-emerald-600">/ {portionGrams}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredient Chip block */}
      {data.ingredients && data.ingredients.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3 block">Detected Primary Ingredients</h3>
          <div className="flex flex-wrap gap-2">
            {data.ingredients.map((ingredient, ind) => (
              <span
                key={ind}
                className="bg-slate-50 text-slate-700 text-xs py-1.5 px-3 rounded-lg border border-slate-100 font-mono"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Coach Expert Insight */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute right-4 top-4 text-emerald-600/5">
          <Brain className="w-16 h-16" />
        </div>
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-white shadow-sm flex items-center justify-center text-emerald-600 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold block mb-1">
              Athletic Coach Advisory
            </span>
            <p className="text-emerald-900 text-sm leading-relaxed italic">
              "{data.explanation}"
            </p>
          </div>
        </div>
      </div>

      {/* Log Meal Action Button */}
      <div className="flex items-center justify-end" id="action-log-container">
        <button
          id="log-to-history-btn"
          onClick={handleLogClick}
          disabled={isLogging}
          className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white disabled:bg-slate-300 font-extrabold px-8 py-4 rounded-xl shadow-sm hover:shadow active:scale-99 transition-all text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2.5"
        >
          <PlusCircle className="w-5 h-5" />
          {isLogging ? "Saving and Tracking Meal..." : `Log ${portionGrams}g to My Gym Records`}
        </button>
      </div>
    </div>
  );
}
