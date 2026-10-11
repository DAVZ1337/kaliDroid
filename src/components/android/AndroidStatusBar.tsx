import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw, Smartphone, Settings, X } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface AndroidStatusBarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenProfile: () => void;
  onResetProgress: () => void;
  onOpenInstallPwa: () => void;
}

/**
 * Barra superior limpia y moderna para Android
 * Sin baterías falsas, sin datos simulados de red.
 * Proporciona acceso directo a instalar app, sonido y configuración.
 */
export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  soundEnabled,
  onToggleSound,
  onResetProgress,
  onOpenInstallPwa,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="bg-[#070b14] border-b border-slate-850 px-3.5 py-2 flex items-center justify-between select-none z-30">
        {/* App Title & Badge */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="font-semibold text-xs tracking-wide text-slate-100">
            KaliDroid <span className="text-cyan-400 font-mono text-[11px]">Lab</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono hidden xs:inline">
            Aprende Ciberseguridad
          </span>
        </div>

        {/* Action buttons: Instalar en Android & Ajustes */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sounds.playKeyClick();
              onOpenInstallPwa();
            }}
            className="px-2.5 py-1 rounded-md bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[11px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Instalar como aplicación en Android"
          >
            <Smartphone size={12} />
            <span>Instalar en Android</span>
          </button>

          <button
            onClick={() => {
              sounds.playKeyClick();
              setShowSettings(!showSettings);
            }}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Ajustes rápidos"
            title="Ajustes"
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      {/* Quick Settings Dropdown */}
      {showSettings && (
        <div className="fixed top-12 right-3 z-50 bg-[#0e1626] border border-slate-700/80 rounded-xl shadow-2xl p-3 w-64 space-y-2 text-xs animate-in fade-in zoom-in-95 duration-100">
          <div className="font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>Opciones de la Aplicación</span>
            <button
              onClick={() => setShowSettings(false)}
              className="text-slate-400 hover:text-slate-100 p-0.5"
            >
              <X size={14} />
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sounds.playKeyClick();
            }}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {soundEnabled ? <Volume2 size={14} className="text-cyan-400" /> : <VolumeX size={14} className="text-slate-500" />}
              <span>Sonidos del teclado</span>
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${soundEnabled ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
              {soundEnabled ? 'Activado' : 'Silencio'}
            </span>
          </button>

          {/* Reset progress */}
          <button
            onClick={() => {
              setShowSettings(false);
              onResetProgress();
            }}
            className="w-full flex items-center gap-2 p-2 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 transition-colors text-[11px] cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reiniciar progreso de laboratorios</span>
          </button>
        </div>
      )}
    </>
  );
};
