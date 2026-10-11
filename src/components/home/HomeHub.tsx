import React from 'react';
import { 
  Terminal, 
  Radio, 
  Globe, 
  ListFilter, 
  Award,
  Play,
  ArrowRight,
  Shield,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Lab } from '../../types/cyber';
import { sounds } from '../../utils/audio';

interface HomeHubProps {
  currentLab: Lab;
  completedLabIds: string[];
  totalLabsCount: number;
  xp: number;
  onOpenTool: (tool: 'terminal' | 'wireshark' | 'browser' | 'objectives' | 'guide') => void;
  onNavigateToLabs: () => void;
  onNavigateToProfile: () => void;
}

export const HomeHub: React.FC<HomeHubProps> = ({
  currentLab,
  completedLabIds,
  totalLabsCount,
  xp,
  onOpenTool,
  onNavigateToLabs,
  onNavigateToProfile,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#070b14] overflow-y-auto px-4 py-5 space-y-6">
      {/* 1. Header con bienvenida limpia y estado actual */}
      <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-[11px] text-cyan-300 font-medium mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Laboratorio Activo</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100">
              {currentLab.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {currentLab.shortDescription}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                sounds.playKeyClick();
                onOpenTool('terminal');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all cursor-pointer"
            >
              <Play size={14} />
              <span>Empezar Práctica</span>
            </button>
            <button
              onClick={() => {
                sounds.playKeyClick();
                onNavigateToLabs();
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors cursor-pointer"
            >
              Cambiar Lab
            </button>
          </div>
        </div>

        {/* Resumen de progreso rápido */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>
              Laboratorios completados: <strong className="text-emerald-400">{completedLabIds.length}/{totalLabsCount}</strong>
            </span>
            <span>
              Puntos: <strong className="text-amber-400">{xp} XP</strong>
            </span>
          </div>
          <button
            onClick={() => {
              sounds.playKeyClick();
              onNavigateToProfile();
            }}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>Ver perfil</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* 2. Categorías sencillas de Herramientas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Herramientas de Ciberseguridad
          </h2>
          <span className="text-[11px] text-slate-500">
            Toca una herramienta para empezar
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Herramienta 1: Terminal */}
          <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 hover:border-cyan-500/50 transition-all group flex flex-col justify-between space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/40 shrink-0">
                <Terminal size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                    Terminal de Kali Linux
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-medium">
                    Básica
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Consola de comandos para escanear redes, auditar contraseñas y ejecutar programas de seguridad.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playKeyClick();
                onOpenTool('terminal');
              }}
              className="w-full py-2 rounded-lg bg-slate-800/80 hover:bg-cyan-600 hover:text-white text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Abrir Terminal</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Herramienta 2: Wireshark */}
          <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 hover:border-sky-500/50 transition-all group flex flex-col justify-between space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-800/40 shrink-0">
                <Radio size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-100 text-sm group-hover:text-sky-300 transition-colors">
                    Analizador de Red (Wireshark)
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800/50 font-medium">
                    Redes
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Captura y analiza los datos que viajan por la red en tiempo real para encontrar mensajes y contraseñas.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playKeyClick();
                onOpenTool('wireshark');
              }}
              className="w-full py-2 rounded-lg bg-slate-800/80 hover:bg-sky-600 hover:text-white text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Abrir Wireshark</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Herramienta 3: Navegador Web */}
          <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 hover:border-emerald-500/50 transition-all group flex flex-col justify-between space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 shrink-0">
                <Globe size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-100 text-sm group-hover:text-emerald-300 transition-colors">
                    Navegador Web Seguro
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50 font-medium">
                    Análisis Web
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Explora las páginas web de práctica para descubrir fallos como inyecciones de código y accesos inseguros.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playKeyClick();
                onOpenTool('browser');
              }}
              className="w-full py-2 rounded-lg bg-slate-800/80 hover:bg-emerald-600 hover:text-white text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Abrir Navegador</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Herramienta 4: Misiones & Banderas CTF */}
          <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 hover:border-amber-500/50 transition-all group flex flex-col justify-between space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/40 shrink-0">
                <Award size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-100 text-sm group-hover:text-amber-300 transition-colors">
                    Misiones y Pistas
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/50 font-medium">
                    Aprendizaje
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Guía paso a paso con pistas opcionales y canje de banderas (códigos de solución) para ganar puntos.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playKeyClick();
                onOpenTool('objectives');
              }}
              className="w-full py-2 rounded-lg bg-slate-800/80 hover:bg-amber-600 hover:text-white text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Ver Misiones</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Información clara para principiantes */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
        <HelpCircle size={18} className="text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-slate-200">
            ¿Cómo funciona esta aplicación?
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Esta aplicación es un entorno simulado de ciberseguridad diseñado para teléfonos móviles Android. Todo lo que practiques aquí ocurre de forma segura dentro de tu dispositivo. Para avanzar, abre la terminal o el navegador, completa las tareas indicadas y canjea la bandera encontrada en cada reto.
          </p>
        </div>
      </div>
    </div>
  );
};
