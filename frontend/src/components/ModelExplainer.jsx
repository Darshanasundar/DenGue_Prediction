import React from 'react';
import { useTheme } from '../ThemeContext';

const ModelExplainer = ({ featureImportance }) => {
    const { isDark } = useTheme();

    if (!featureImportance) {
        return (
            <div className={`p-6 rounded-3xl shadow-sm border h-full flex flex-col ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    AI Decision Interpretability
                </h3>
                <div className="space-y-3">
                    {['Temperature Focus', 'Humidity Saturation', 'Precipitation Impact'].map((label, i) => (
                        <div key={label}>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className={isDark ? 'text-stone-400' : 'text-stone-500'}>{label}</span>
                                <span className={`font-mono text-indigo-400 font-semibold`}>—%</span>
                            </div>
                            <div className={`w-full ${isDark ? 'bg-stone-800' : 'bg-stone-100'} rounded-full h-2`}>
                                <div className="bg-gradient-to-r from-indigo-500/30 to-purple-500/30 h-2 rounded-full w-1/2 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className={`mt-5 pt-4 border-t ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
                    <p className={`text-[10px] leading-relaxed ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
                        Start the backend server to load live SHAP/LIME feature weights for the current city.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-6 rounded-3xl shadow-sm border h-full flex flex-col ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                AI Decision Interpretability
            </h3>
            <div className="space-y-4">
                {Object.entries(featureImportance).map(([feature, weight]) => (
                    <div key={feature}>
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className={isDark ? 'text-stone-300' : 'text-stone-600'}>{feature}</span>
                            <span className="font-mono text-indigo-500 font-semibold">{weight}%</span>
                        </div>
                        <div className={`w-full ${isDark ? 'bg-stone-800' : 'bg-stone-100'} rounded-full h-2`}>
                            <div 
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000" 
                                style={{ width: `${weight}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className={`mt-5 pt-4 border-t ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
                <p className={`text-[10px] leading-relaxed ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    * Interpreted using Surrogate Explainer models (SHAP/LIME). Higher percentages indicate a stronger causal link to the current risk score.
                </p>
            </div>
        </div>
    );
};

export default ModelExplainer;
