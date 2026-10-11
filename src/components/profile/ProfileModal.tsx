import React from 'react';
import { Lab } from '../../types/cyber';
import { sounds } from '../../utils/audio';
import { 
  Award, 
  Shield, 
  CheckCircle2, 
  RotateCcw, 
  User,
  Zap,
  Target
} from 'lucide-react';

interface ProfileModalProps {
  labs: Lab[];
  completedLabIds: string[];
  solvedFlags: string[];
  xp: number;
  onResetProgress: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  labs,
  completedLabIds,
  solvedFlags,
  xp,
  onResetProgress,
}) => {
  // Rango del usuario
  const getRankInfo = (currentXp: number) => {
    if (currentXp < 300) {
      return {
        title: 'Principiante en Ciberseguridad',
        level: 1,
        color: 'text-slate-300',
        nextRankXp: 300,
        desc: 'Iniciando los fundamentos de redes y herramientas de reconocimiento.'
      };
    }
    if (currentXp < 800) {
      return {
        title: 'Analista de Seguridad',
        level: 2,
        color: 'text-emerald-400',
        nextRankXp: 800,
        desc: 'Capaz de capturar paquetes en Wireshark y auditar servicios de red.'
      };
    }
    if (currentXp < 1600) {
      return {
        title: 'Auditor de Seguridad Web',
        level: 3,
        color: 'text-cyan-400',
        nextRankXp: 1600,
        desc: 'Dominio de ataques SQLi, Gobuster y cracking offline de hashes.'
      };
    }
    if (currentXp < 2500) {
      return {
        title: 'Especialista en Pruebas de Intrusión',
        level: 4,
        color: 'text-amber-400',
        nextRankXp: 2500,
        desc: 'Explotación remota con Metasploit y análisis forense de malware.'
      };
    }
    return {
      title: 'Experto en Ciberseguridad',
      level: 5,
      color: 'text-purple-400',
      nextRankXp: 3500,
      desc: 'Maestría total en auditoría de redes, bypass de defensas y reversing.'
    };
  };

  const rank = getRankInfo(xp);
  const completionPercentage = Math.round((completedLabIds.length / labs.length) * 100);

  return (
    <div className="flex flex-col h-full bg-[#070b14] overflow-y-auto p-4 space-y-4">
      {/* Tarjeta de perfil principal */}
      <div className="p-5 rounded-2xl bg-[#0b101d] border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shrink-0">
            <User size={24} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100">
                Tu Perfil de Aprendizaje
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50 text-[10px] font-semibold">
                Nivel {rank.level}
              </span>
            </div>
            <div className={`text-xs font-semibold ${rank.color}`}>
              {rank.title}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{rank.desc}</p>
          </div>
        </div>

        {/* Barra de progreso de puntos */}
        <div className="space-y-1.5 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Puntos de experiencia:</span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <Zap size={13} /> {xp} / {rank.nextRankXp} XP
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((xp / rank.nextRankXp) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl bg-[#0c1220] border border-slate-800 text-center space-y-1">
          <div className="text-emerald-400 font-bold text-base sm:text-lg">
            {completedLabIds.length}/{labs.length}
          </div>
          <div className="text-[11px] text-slate-400">
            Completados ({completionPercentage}%)
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0c1220] border border-slate-800 text-center space-y-1">
          <div className="text-amber-400 font-bold text-base sm:text-lg">
            {solvedFlags.length}
          </div>
          <div className="text-[11px] text-slate-400">
            Banderas (Flags)
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0c1220] border border-slate-800 text-center space-y-1">
          <div className="text-cyan-400 font-bold text-base sm:text-lg">
            {xp}
          </div>
          <div className="text-[11px] text-slate-400">
            Puntos Totales
          </div>
        </div>
      </div>

      {/* Logros y medallas desbloqueadas */}
      <div className="p-4 rounded-xl bg-[#0a0f1c] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Award size={15} className="text-amber-400" />
            <span>Medallas Obtenidas ({completedLabIds.length}/{labs.length}):</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {labs.map((lab) => {
            const isUnlocked = completedLabIds.includes(lab.id);

            return (
              <div
                key={lab.id}
                className={`p-2.5 rounded-lg border text-left space-y-1 transition-all ${
                  isUnlocked
                    ? 'bg-slate-900/90 border-amber-500/50 shadow-sm'
                    : 'bg-slate-950/40 border-slate-850 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {isUnlocked ? '🎖️' : '🔒'}
                  </span>
                  <span className={`text-[10px] capitalize font-medium ${
                    lab.difficulty === 'principiante' ? 'text-emerald-400' : lab.difficulty === 'intermedio' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {lab.difficulty === 'principiante' ? 'Fácil' : lab.difficulty === 'intermedio' ? 'Medio' : 'Avanzado'}
                  </span>
                </div>
                <div className="font-semibold text-xs text-slate-100 truncate">
                  {lab.badge.title}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {lab.title.split(':')[1] || lab.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón para reiniciar */}
      <div className="pt-2">
        <button
          onClick={() => {
            sounds.playError();
            if (window.confirm('¿Seguro que deseas reiniciar tu progreso y puntos de los laboratorios?')) {
              onResetProgress();
            }
          }}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/50 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Reiniciar Progreso de la Aplicación</span>
        </button>
      </div>
    </div>
  );
};
