import { useState } from 'react';
import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { navItems } from './SidebarNav';
import { Menu, X } from 'lucide-react';

export const MobileNav: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-2">
        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
        <span className="text-sm font-bold text-slate-900">Nagpur Heat Intel</span>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-slate-600 hover:text-blue-600 focus:outline-none"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-lg p-4 space-y-2 text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center space-x-3 p-2.5 rounded border
                  ${isActive ? 'bg-blue-50 text-blue-600 border-blue-200 font-semibold' : 'text-slate-600 border-transparent'}
                `}
              >
                <span className="text-slate-400 font-mono-tech">{item.code}</span>
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <div className="pt-3 border-t border-slate-200 text-slate-500 flex items-center justify-between">
            <span>Nagpur, MH, India</span>
            <span className="text-emerald-600 font-semibold">Operational</span>
          </div>
        </div>
      )}
    </div>
  );
};
