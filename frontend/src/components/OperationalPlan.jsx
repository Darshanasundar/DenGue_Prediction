import React from 'react';
import { useTheme } from '../ThemeContext';

const OperationalPlan = ({ cityPopulation, riskLevel }) => {
    const { isDark } = useTheme();

    // Remove the early return so we can render the Safe Zone.
    // Domain Logic Constants
    const pop = cityPopulation || 500000; // default to 500k if unavailable
    const INSECTICIDE_PER_1K = 1.2; // Liters
    const BED_REQUIREMENT_RATE = riskLevel === "High" ? 0.005 : 0.001; // 0.5% or 0.1%

    const estimatedInsecticide = Math.round((pop / 1000) * INSECTICIDE_PER_1K);
    const estimatedBeds = Math.round(pop * BED_REQUIREMENT_RATE);

    const isHigh = riskLevel === "High";

    if (!isHigh && riskLevel !== "Moderate") {
        // Low Risk (Safe Zone)
        return (
            <div className={`rounded-3xl p-6 border shadow-sm ${isDark ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-emerald-50 border-emerald-200'}`}>
                <h3 className={`text-lg font-extrabold mb-4 flex items-center gap-2 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Safe Zone — Routine Monitoring Active
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-2xl border shadow-sm flex items-start gap-3 ${isDark ? 'bg-[#111110]/80 border-slate-800' : 'bg-white border-white'}`}>
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                            <svg className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </div>
                        <div>
                            <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Drain stagnant water</p>
                            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Weekly Inspection</p>
                        </div>
                    </div>
                    
                    <div className={`p-4 rounded-2xl border shadow-sm flex items-start gap-3 ${isDark ? 'bg-[#111110]/80 border-slate-800' : 'bg-white border-white'}`}>
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                            <svg className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                        <div>
                            <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Public awareness</p>
                            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>SMS/WhatsApp alerts</p>
                        </div>
                    </div>
                    
                    <div className={`p-4 rounded-2xl border shadow-sm flex items-start gap-3 ${isDark ? 'bg-[#111110]/80 border-slate-800' : 'bg-white border-white'}`}>
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                            <svg className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <div>
                            <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Beds on standby</p>
                            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>600 beds reserved</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // High / Moderate Risk Output
    return (
        <div className={`rounded-3xl p-6 border shadow-sm ${isDark 
            ? (isHigh ? 'bg-red-950/20 border-red-900/50' : 'bg-amber-950/20 border-amber-900/50') 
            : (isHigh ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200')
        }`}>
            <h3 className={`text-lg font-extrabold mb-4 flex items-center gap-2 ${isDark 
                ? (isHigh ? 'text-red-400' : 'text-amber-400') 
                : (isHigh ? 'text-red-700' : 'text-amber-700')
            }`}>
                {isHigh ? '🚨 Critical Action Plan' : '⚠️ Preventative Action Plan'}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl shadow-sm border ${isDark ? 'bg-[#111110]/80 border-slate-800' : 'bg-white border-white'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Stockpile Required</p>
                    <p className={`text-2xl font-black mt-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{estimatedInsecticide.toLocaleString()} L</p>
                    <p className={`text-[10px] uppercase font-bold tracking-wider mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Fogging Chemical</p>
                </div>
                <div className={`p-4 rounded-2xl shadow-sm border ${isDark ? 'bg-[#111110]/80 border-slate-800' : 'bg-white border-white'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Capacity Allocation</p>
                    <p className={`text-2xl font-black mt-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>+{estimatedBeds.toLocaleString()}</p>
                    <p className={`text-[10px] uppercase font-bold tracking-wider mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Emergency Beds</p>
                </div>
            </div>
            
            <p className={`mt-4 text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                * Estimates based on catchment population of {pop.toLocaleString()}.
            </p>
        </div>
    );
};

export default OperationalPlan;
