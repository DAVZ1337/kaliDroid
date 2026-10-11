import React, { useState } from 'react';
import { Lab, DifficultyLevel } from '../../types/cyber';
import { sounds } from '../../utils/audio';
import { 
  Shield, 
  Search, 
  CheckCircle2, 
  ChevronRight, 
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

interface LabListProps {
  labs: Lab[];
  currentLabId: string;
  completedLabIds: string[];
  onSelectLab: (labId: string) => void;
}

export const LabList: React.FC<LabListProps> = ({
  labs,
  currentLabId,
  completedLabIds,
  onSelectLab,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'redes' | 'web' | 'analisis'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const difficultyLabels: Record<DifficultyLevel, { name: string; style: string }> = {
    principiante: { name: 'Fácil', style: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' },
    intermedio: { name: 'Medio', style: 'bg-amber-950/60 text-amber-300 border-amber-800/60' },
    avanzado: { name: 'Avanzado', style: 'bg-rose-950/60 text-rose-300 border-rose-800/60' },
  };

  const filteredLabs = labs.filter((lab) => {
    if (selectedDifficulty !== 'all' && lab.difficulty !== selectedDifficulty) return false;
    
    // Categorías sencillas
    if (selectedCategory === 'redes') {
      const isNet = lab.category === 'redes' || lab.wiresharkEnabled;
      if (!isNet) return false;
    } else if (selectedCategory === 'web') {
      const isWeb = lab.category === 'web' || Boolean(lab.browserTargetUrl);
      if (!isWeb) return false;
    } else if (selectedCategory === 'analisis') {
      const isAnalysis = lab.category === 'forense' || lab.category === 'criptografia' || lab.category === 'malware';
      if (!isAnalysis) return false;
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = lab.title.toLowerCase().includes(q);
      const matchDesc = lab.shortDescription.toLowerCase().includes(q);
      const matchTools = lab.theoryGuide.tools.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTools;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#070b14] overflow-hidden">
      {/* Header & Filtros sencillos */}
      <div className="p-4 bg-[#0a0f1c] border-b border-slate-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <Shield className="text-cyan-400" size={20} />
              <span>Laboratorios Prácticos</span>
            </h1>
            <p className="text-xs text-slate-400">
              {labs.length} retos disponibles · {completedLabIds.length} completados
            </p>
          </div>

          {/* Buscador sencillo */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar práctica o herramienta..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* Categorías sencillas */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'redes', label: 'Redes' },
            { id: 'web', label: 'Análisis Web' },
            { id: 'analisis', label: 'Criptografía y Datos' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playKeyClick();
                setSelectedCategory(cat.id as any);
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista limpia de tarjetas */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {filteredLabs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No se encontraron laboratorios con los filtros seleccionados.
          </div>
        ) : (
          filteredLabs.map((lab) => {
            const isCompleted = completedLabIds.includes(lab.id);
            const isCurrent = lab.id === currentLabId;
            const diffInfo = difficultyLabels[lab.difficulty];

            return (
              <div
                key={lab.id}
                onClick={() => {
                  sounds.playKeyClick();
                  onSelectLab(lab.id);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer group relative ${
                  isCurrent
                    ? 'bg-[#0f172a] border-cyan-500/70 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-[#0c1220] border-slate-800 hover:border-slate-700 hover:bg-[#0e1628]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <h2 className="font-semibold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                      {lab.title}
                    </h2>
                  </div>

                  <span className={`px-2 py-0.5 rounded border text-[11px] font-medium shrink-0 ${diffInfo.style}`}>
                    {diffInfo.name}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                  {lab.shortDescription}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>Herramientas:</span>
                    <span className="text-slate-300 font-mono text-[11px]">
                      {lab.theoryGuide.tools.slice(0, 3).join(', ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-cyan-400 font-medium text-xs">
                    <span>{isCurrent ? 'Abierto' : 'Practicar'}</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
