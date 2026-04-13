import { useTheme } from '../ThemeContext';
import { ShieldCheck, Droplets, SprayCan, AlertTriangle, Stethoscope, Info } from 'lucide-react';

const PreventionChecklist = ({ riskLevel }) => {
    const { isDark } = useTheme();

    const isHigh = riskLevel === 'High';
    const isMod = riskLevel === 'Moderate';
    const isLow = riskLevel === 'Low';

    const checklist = [
        {
            icon: <Droplets className="w-5 h-5 text-sky-500" />,
            title: "Eliminate Standing Water",
            desc: "Empty pots, tires, and gutters where Aedes mosquitoes breed.",
            active: true
        },
        {
            icon: <SprayCan className="w-5 h-5 text-indigo-500" />,
            title: "Indoor Spraying & Repellents",
            desc: "Use DEET-based repellents and spray dark indoor corners.",
            active: isHigh || isMod
        },
        {
            icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
            title: "Community Fogging",
            desc: "Coordinate with local health authorities for chemical fogging.",
            active: isHigh
        },
        {
            icon: <Stethoscope className="w-5 h-5 text-emerald-500" />,
            title: "Clinical Awareness",
            desc: "Monitor for sudden high fever, severe headaches, and joint pain.",
            active: true
        }
    ];

    const borderRisk = isHigh ? 'border-red-500/50' : isMod ? 'border-amber-500/50' : 'border-emerald-500/50';
    const glowRisk = isHigh ? 'shadow-[0_0_15px_rgba(239,68,68,0.15)]' : isMod ? 'shadow-[0_0_15px_rgba(245,158,11,0.1)]' : '';

    return (
        <div className={`p-6 rounded-3xl border ${borderRisk} ${glowRisk} transition-all ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className={`text-xl font-extrabold flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        <ShieldCheck className="w-6 h-6 text-indigo-500" />
                        Actionable Prevention Checklist
                    </h2>
                    <p className={`text-sm mt-1 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Info className="w-4 h-4" />
                        Tailored interventions based on the current 
                        <span className={`font-bold ml-1 ${isHigh ? 'text-red-500' : isMod ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {riskLevel || 'Unknown'} Risk
                        </span> level.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {checklist.map((item, i) => (
                    <div 
                        key={i} 
                        className={`p-5 rounded-2xl border transition-all 
                            ${item.active 
                                ? (isDark ? 'border-indigo-500/30 bg-indigo-500/5 shadow-sm' : 'border-indigo-200 bg-indigo-50 shadow-sm') 
                                : (isDark ? 'border-slate-800 bg-slate-900/40 opacity-60' : 'border-slate-200 bg-slate-50 opacity-60')}`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
                                {item.icon}
                            </div>
                            {item.active && (
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                                    Recommended
                                </span>
                            )}
                        </div>
                        <h3 className={`font-bold text-sm mb-1 line-clamp-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {item.title}
                        </h3>
                        <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PreventionChecklist;
