import { Home, Map, BarChart3, ChevronRight, Activity } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

const Sidebar = () => {
    const { isDark, toggle } = useTheme();

    const nav = [
        { name: 'Dashboard', icon: Home, path: '/', desc: 'Live overview' },
        { name: 'Risk Map', icon: Map, path: '/map', desc: 'Outbreak heatmap' },
        { name: 'Analytics', icon: BarChart3, path: '/analytics', desc: 'Weather insights' },
    ];

    return (
        <aside className={`w-64 h-full flex flex-col border-r transition-colors z-10 relative
            ${isDark ? 'bg-[#0d1321] border-[#1e293b]' : 'bg-white border-slate-200'}`}>

            {/* Brand */}
            <div className={`px-6 pt-7 pb-6 border-b ${isDark ? 'border-[#1e293b]' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden relative flex items-center justify-center shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-blue-700" />
                        <Activity className="relative w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className={`text-xl font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>DengueAI</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>India Portal</p>
                    </div>
                </div>
            </div>

            {/* Nav Label */}
            <div className="px-5 pt-5 pb-2">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Navigation</p>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-3 space-y-0.5">
                {nav.map(item => (
                    <NavLink key={item.name} to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) =>
                            `group flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200
                            ${isActive
                                ? isDark
                                    ? 'bg-sky-950/50 text-sky-300 border border-sky-900/60 shadow-sm'
                                    : 'bg-sky-50 text-sky-700 border border-sky-100 shadow-sm'
                                : isDark
                                    ? 'text-slate-500 border border-transparent hover:text-slate-200 hover:bg-slate-800/60'
                                    : 'text-slate-500 border border-transparent hover:text-slate-700 hover:bg-slate-50'
                            }`
                        }>
                        {({ isActive }) => (
                            <>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                    ${isActive
                                        ? isDark ? 'bg-sky-900/60' : 'bg-sky-100'
                                        : isDark ? 'bg-slate-800/80 group-hover:bg-slate-700' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                                    <item.icon className={`w-4 h-4 ${isActive ? 'text-sky-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="leading-tight">{item.name}</p>
                                    <p className={`text-[10px] font-normal leading-tight mt-0.5 ${isActive ? isDark ? 'text-sky-400/70' : 'text-sky-500/70' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>{item.desc}</p>
                                </div>
                                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Status Badge */}
            <div className={`mx-3 mb-3 px-3 py-2.5 rounded-xl border flex items-center gap-2.5
                ${isDark ? 'bg-teal-950/30 border-teal-900/40' : 'bg-teal-50 border-teal-100'}`}>
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse flex-shrink-0" />
                <div>
                    <p className={`text-xs font-semibold ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>System Active</p>
                    <p className={`text-[10px] ${isDark ? 'text-teal-600' : 'text-teal-500'}`}>AI model operational</p>
                </div>
            </div>

            {/* Theme Toggle Only */}
            <div className={`m-3 mt-0 p-3 rounded-xl border transition-colors
                ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}>
                <button onClick={toggle} className="w-full flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                    </span>
                    <div className={`w-10 h-[22px] rounded-full p-[3px] transition-colors shadow-inner ${isDark ? 'bg-sky-500' : 'bg-slate-300'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isDark ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                    </div>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
