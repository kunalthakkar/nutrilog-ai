import React from "react";
import { NutritionResult } from "../types";
import { Sparkles, ArrowRight, Dumbbell, ArrowUpRight } from "lucide-react";

interface HealthierAlternativesProps {
  alternatives: {
    name: string;
    protein: number;
    calories: number;
    reason: string;
  }[];
  onSelectAlternative: (name: string) => void;
  isLoadingAlt: boolean;
}

export default function HealthierAlternatives({
  alternatives,
  onSelectAlternative,
  isLoadingAlt,
}: HealthierAlternativesProps) {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mt-6" id="healthier-alternatives">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">
              Healthier & Cleaner Athletic Alternatives
            </h3>
            <p className="text-[11px] text-slate-400">
              Highly prioritized substitutes to maximize your muscle-building or fat-shredding performance
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">SCROLL SUBSTITUTE CARDS</span>
      </div>

      {/* Horizontal Scroll wrapper */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent rounded-lg">
          {alternatives.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-80 bg-slate-50 p-4.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100/30 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {item.name}
                  </h4>
                  <button
                    id={`substitute-alt-${index}`}
                    onClick={() => onSelectAlternative(item.name)}
                    disabled={isLoadingAlt}
                    title="Load Alternative Profile"
                    className="text-[10px] uppercase font-mono tracking-wider font-bold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-md transition-all flex items-center gap-0.5 shrink-0"
                  >
                    Analyze
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Macro comparison highlights */}
                <div className="grid grid-cols-2 gap-2 mb-3 bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-center border-r border-slate-200">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Protein</div>
                    <div className="text-xs font-mono font-bold text-emerald-600">
                      {item.protein}g <span className="text-[9.5px] font-normal text-slate-400">/100g</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Calories</div>
                    <div className="text-xs font-mono font-bold text-orange-600">
                      {item.calories} <span className="text-[9.5px] font-normal text-slate-400">kcal</span>
                    </div>
                  </div>
                </div>

                {/* Coach comparative insight */}
                <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-3 italic">
                  "{item.reason}"
                </p>
              </div>

              {/* Action replacement hint */}
              <div className="mt-3.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Dumbbell className="w-3 text-slate-500" /> Substitutes Active Menu
                </span>
                <span className="text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-bold">
                  Load & View <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
