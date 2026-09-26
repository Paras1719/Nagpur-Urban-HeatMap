import type { FC } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Globe, 
  Flame, 
  TrendingUp, 
  Layers, 
  Crosshair, 
  Sliders, 
  Database,
  ChevronRight
} from 'lucide-react';

export const navItems = [
  { path: '/', label: 'Overview', code: '01', icon: Globe },
  { path: '/heat-map', label: 'Thermal Map', code: '02', icon: Flame },
  { path: '/temporal', label: 'Temporal Analysis', code: '03', icon: TrendingUp },
  { path: '/land-cover', label: 'Land Cover', code: '04', icon: Layers },
  { path: '/hotspots', label: 'Heat Hotspots', code: '05', icon: Crosshair },
  { path: '/scenario', label: 'Scenario Lab', code: '06', icon: Sliders },
  { path: '/methodology', label: 'Data & Methodology', code: '07', icon: Database },
];

export const SidebarNav: FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 z-40 select-none">
      {/* Top Branding */}
      <div>
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-blue-600 tracking-wider">ENVIRONMENTAL INTEL</span>
          </div>
          <h1 className="text-base font-bold text-slate-900 mt-1">
            Nagpur Heat Intel
          </h1>
          <p className="text-xs text-slate-500 font-mono-tech">UHI Analytics Platform</p>
        </div>

        {/* Navigation Links */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  group flex items-center justify-between px-3 py-2.5 rounded transition-all text-xs font-medium border
                  ${isActive
                    ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border-transparent'
                  }
                `}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={`text-[11px] font-mono-tech ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                    {item.code}
                  </span>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-blue-600 opacity-100' : 'opacity-0 group-hover:opacity-40'}`} />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-500">
          <span>Region</span>
          <span className="font-semibold text-slate-800">Nagpur, MH, India</span>
        </div>
        <div className="flex items-center justify-between text-slate-500">
          <span>Coordinates</span>
          <span className="font-mono-tech text-slate-700">21.1458°N 79.0882°E</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-200">
          <span className="text-slate-500">Pipeline Status</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Operational
          </span>
        </div>
      </div>
    </aside>
  );
};
