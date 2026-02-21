import { Home, Info, ThermometerSun } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const navItems = [
        { name: 'Dashboard', icon: Home, path: '/' },
    ];

    return (
        <div className="w-64 bg-surface/90 border-r border-white/5 backdrop-blur-xl h-full flex flex-col p-4 animate-slide-up">
            <div className="flex items-center gap-3 px-2 py-4 mb-6">
                <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg shadow-primary/30">
                    <ThermometerSun className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
                    DengueAI
                </h1>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-out group ${isActive
                                ? 'bg-primary/20 text-indigo-300 shadow-inner'
                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-4 rounded-xl border border-indigo-500/20">
                <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-indigo-300" />
                    <h4 className="text-sm font-semibold text-indigo-200">System Status</h4>
                </div>
                <p className="text-xs text-slate-400">ML Model Active (Acc: 95.5%)</p>
                <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 w-full animate-pulse" />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
