import React from 'react';
import { Home, Terminal, Radio, Globe, Shield, User } from 'lucide-react';
import { sounds } from '../../utils/audio';

export type MainNavView = 'home' | 'labs' | 'workspace_terminal' | 'workspace_wireshark' | 'workspace_browser' | 'profile';

interface BottomNavProps {
  currentView: MainNavView;
  onChangeView: (view: MainNavView) => void;
  hasWireshark: boolean;
  hasBrowser: boolean;
  xp: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onChangeView,
}) => {
  const navItems = [
    {
      id: 'home' as MainNavView,
      label: 'Inicio',
      icon: Home,
    },
    {
      id: 'labs' as MainNavView,
      label: 'Laboratorios',
      icon: Shield,
    },
    {
      id: 'workspace_terminal' as MainNavView,
      label: 'Terminal',
      icon: Terminal,
    },
    {
      id: 'workspace_wireshark' as MainNavView,
      label: 'Wireshark',
      icon: Radio,
    },
    {
      id: 'workspace_browser' as MainNavView,
      label: 'Navegador',
      icon: Globe,
    },
    {
      id: 'profile' as MainNavView,
      label: 'Perfil',
      icon: User,
    },
  ];

  return (
    <nav className="bg-[#05080f] border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around z-30 shrink-0">
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              sounds.playKeyClick();
              onChangeView(item.id);
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-2 min-w-[50px] min-h-[46px] rounded-lg transition-all relative cursor-pointer active:scale-95 ${
              isActive
                ? 'text-cyan-400 font-semibold bg-cyan-950/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon size={20} className={isActive ? 'scale-105 transition-transform' : ''} />
            <span className="text-[11px] mt-1 font-medium tracking-tight">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
