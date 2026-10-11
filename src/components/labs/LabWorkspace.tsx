import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Lab } from '../../types/cyber';
import { TerminalSimulator } from '../terminal/TerminalSimulator';
import { WiresharkAnalyzer } from '../wireshark/WiresharkAnalyzer';
import { TargetBrowser } from '../browser/TargetBrowser';
import { sounds } from '../../utils/audio';
import { 
  Terminal as TerminalIcon, 
  Radio, 
  Globe, 
  CheckSquare, 
  BookOpen, 
  Flag, 
  ChevronRight, 
  HelpCircle, 
  Sparkles, 
  Columns, 
  Maximize2,
  Check,
  AlertCircle,
  Copy
} from 'lucide-react';

interface LabWorkspaceProps {
  lab: Lab;
  completedObjectiveIds: string[];
  solvedFlags: string[];
  onObjectiveComplete: (objId: string) => void;
  onFlagSubmit: (flagText: string) => boolean;
  onBackToCatalog: () => void;
  activeTab?: 'terminal' | 'wireshark' | 'browser' | 'objectives' | 'guide';
  onActiveTabChange?: (tab: 'terminal' | 'wireshark' | 'browser' | 'objectives' | 'guide') => void;
}

export const LabWorkspace: React.FC<LabWorkspaceProps> = ({
  lab,
  completedObjectiveIds,
  solvedFlags,
  onObjectiveComplete,
  onFlagSubmit,
  onBackToCatalog,
  activeTab: controlledTab,
  onActiveTabChange,
}) => {
  // Navigation tabs in workspace
  const [internalTab, setInternalTab] = useState<'terminal' | 'wireshark' | 'browser' | 'objectives' | 'guide'>('terminal');
  const activeTab = controlledTab || internalTab;

  const handleTabSwitch = (tab: 'terminal' | 'wireshark' | 'browser' | 'objectives' | 'guide') => {
    sounds.playKeyClick();
    setInternalTab(tab);
    onActiveTabChange?.(tab);
  };

  const [shellType, setShellType] = useState<'kali' | 'powershell'>(lab.defaultShell);
  const [isSplitView, setIsSplitView] = useState(false);
  const [flagInput, setFlagInput] = useState('');
  const [flagMessage, setFlagMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [isCopiedIp, setIsCopiedIp] = useState(false);
  const [showTargetCard, setShowTargetCard] = useState(true);

  const handleCopyIp = () => {
    sounds.playKeyClick();
    navigator.clipboard.writeText(lab.target.ip);
    setIsCopiedIp(true);
    setTimeout(() => setIsCopiedIp(false), 2200);
  };

  // Command run callback to check objectives
  const handleCommandRun = (cmd: string) => {
    lab.objectives.forEach((obj) => {
      if (obj.requiredCommandPattern && !completedObjectiveIds.includes(obj.id)) {
        try {
          const regex = new RegExp(obj.requiredCommandPattern, 'i');
          if (regex.test(cmd)) {
            onObjectiveComplete(obj.id);
            sounds.playObjectiveComplete();
          }
        } catch {
          // Fallback simple match
          if (cmd.toLowerCase().includes(obj.id)) {
            onObjectiveComplete(obj.id);
          }
        }
      }
    });
  };

  const handleFlagSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFlag = flagInput.trim();
    if (!cleanFlag) return;

    const success = onFlagSubmit(cleanFlag);
    if (success) {
      sounds.playSuccess();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#22d3ee', '#10b981', '#f59e0b', '#ec4899']
      });
      setFlagMessage({ type: 'success', text: '¡BANDERA VÁLIDA! Puntos de XP y medalla acreditados.' });
      setFlagInput('');
    } else {
      sounds.playError();
      setFlagMessage({ type: 'error', text: 'Bandera incorrecta. Revisa las pistas o las herramientas.' });
    }
  };

  const toggleHint = (objId: string) => {
    sounds.playKeyClick();
    setRevealedHints((prev) => ({ ...prev, [objId]: !prev[objId] }));
  };

  return (
    <div className="flex flex-col h-full bg-[#080c14] overflow-hidden">
      {/* Workspace Subheader Bar */}
      <div className="px-3 py-2 bg-[#0a0f1c] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToCatalog}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-0.5 cursor-pointer py-1 px-1.5 rounded hover:bg-slate-800 transition-colors"
          >
            <span>Laboratorios</span>
            <ChevronRight size={12} />
          </button>
          <span className="font-semibold text-slate-100 text-xs sm:text-sm font-mono truncate max-w-[200px] sm:max-w-md">
            {lab.title}
          </span>
        </div>

        {/* Workspace Tool Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-xs font-mono overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleTabSwitch('terminal')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === 'terminal' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TerminalIcon size={13} />
            <span>Terminal</span>
          </button>

          {/* Wireshark Tab */}
          <button
            type="button"
            onClick={() => handleTabSwitch('wireshark')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === 'wireshark' ? 'bg-sky-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Radio size={13} />
            <span>Wireshark</span>
            {lab.wiresharkEnabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            )}
          </button>

          {/* Web Browser Tab */}
          <button
            type="button"
            onClick={() => handleTabSwitch('browser')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === 'browser' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Globe size={13} />
            <span>Navegador</span>
            {lab.browserTargetUrl && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* Objectives Tab */}
          <button
            type="button"
            onClick={() => handleTabSwitch('objectives')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === 'objectives' ? 'bg-amber-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckSquare size={13} />
            <span>Misiones</span>
            <span className="px-1.5 py-0.2 rounded bg-black/50 text-[10px] font-bold">
              {completedObjectiveIds.filter(id => lab.objectives.some(o => o.id === id)).length}/{lab.objectives.length}
            </span>
          </button>

          {/* Guide Tab */}
          <button
            type="button"
            onClick={() => handleTabSwitch('guide')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === 'guide' ? 'bg-purple-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen size={13} />
            <span>Teoría</span>
          </button>
        </div>

        {/* Split View Toggle for Desktop/Tablet */}
        <button
          onClick={() => {
            sounds.playKeyClick();
            setIsSplitView(!isSplitView);
          }}
          className={`hidden md:flex items-center gap-1 p-1.5 rounded text-xs font-mono border transition-colors ${
            isSplitView
              ? 'bg-slate-800 text-cyan-300 border-cyan-500/60'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title="Vista dividida (Split view)"
        >
          <Columns size={13} />
          <span className="text-[11px]">{isSplitView ? 'Split ON' : 'Split'}</span>
        </button>
      </div>

      {/* Tarjeta de información del objetivo */}
      {showTargetCard && (
        <div className="mx-2 sm:mx-3 mt-2 p-2.5 rounded-xl bg-[#0d1424] border border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-semibold text-slate-400">
              Dirección de prueba:
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-cyan-300">
              {lab.target.ip}
            </span>

            {/* Botón copiar IP */}
            <button
              onClick={handleCopyIp}
              className="px-2 py-0.5 rounded-md bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 text-[11px] font-medium flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
              title="Copiar dirección IP"
            >
              {isCopiedIp ? (
                <>
                  <Check size={11} className="text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copiada</span>
                </>
              ) : (
                <>
                  <Copy size={11} />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="hidden sm:inline text-[11px]">
              Sistema: <span className="text-slate-300">{lab.target.os}</span>
            </span>
            <button
              onClick={() => setShowTargetCard(false)}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Workspace Content */}
      <div className="flex-1 overflow-hidden p-2 sm:p-3">
        {isSplitView ? (
          /* SPLIT VIEW (Desktop / Tablet): Terminal on left, Active Secondary Tool on right */
          <div className="grid grid-cols-2 gap-3 h-full">
            <div className="h-full">
              <TerminalSimulator
                lab={lab}
                onCommandRun={handleCommandRun}
                shellType={shellType}
                onShellTypeChange={setShellType}
              />
            </div>
            <div className="h-full">
              {activeTab === 'wireshark' && (
                <WiresharkAnalyzer lab={lab} />
              )}
              {activeTab === 'browser' && (
                <TargetBrowser
                  lab={lab}
                  onFlagDiscovered={(discoveredFlag) => {
                    setFlagInput(discoveredFlag);
                    handleTabSwitch('objectives');
                  }}
                />
              )}
              {(activeTab === 'objectives' || activeTab === 'terminal') && (
                <ObjectivesPanel
                  lab={lab}
                  completedObjectiveIds={completedObjectiveIds}
                  solvedFlags={solvedFlags}
                  flagInput={flagInput}
                  setFlagInput={setFlagInput}
                  flagMessage={flagMessage}
                  handleFlagSubmission={handleFlagSubmission}
                  revealedHints={revealedHints}
                  toggleHint={toggleHint}
                />
              )}
              {activeTab === 'guide' && (
                <TheoryGuidePanel lab={lab} />
              )}
            </div>
          </div>
        ) : (
          /* SINGLE TAB VIEW (Mobile first responsive) */
          <div className="h-full">
            {activeTab === 'terminal' && (
              <TerminalSimulator
                lab={lab}
                onCommandRun={handleCommandRun}
                shellType={shellType}
                onShellTypeChange={setShellType}
              />
            )}
            {activeTab === 'wireshark' && (
              <WiresharkAnalyzer lab={lab} />
            )}
            {activeTab === 'browser' && (
              <TargetBrowser
                lab={lab}
                onFlagDiscovered={(discoveredFlag) => {
                  setFlagInput(discoveredFlag);
                  handleTabSwitch('objectives');
                }}
              />
            )}
            {activeTab === 'objectives' && (
              <ObjectivesPanel
                lab={lab}
                completedObjectiveIds={completedObjectiveIds}
                solvedFlags={solvedFlags}
                flagInput={flagInput}
                setFlagInput={setFlagInput}
                flagMessage={flagMessage}
                handleFlagSubmission={handleFlagSubmission}
                revealedHints={revealedHints}
                toggleHint={toggleHint}
              />
            )}
            {activeTab === 'guide' && (
              <TheoryGuidePanel lab={lab} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Subcomponent: Objectives and Flag Submission
interface ObjectivesPanelProps {
  lab: Lab;
  completedObjectiveIds: string[];
  solvedFlags: string[];
  flagInput: string;
  setFlagInput: (val: string) => void;
  flagMessage: { type: 'success' | 'error'; text: string } | null;
  handleFlagSubmission: (e: React.FormEvent) => void;
  revealedHints: Record<string, boolean>;
  toggleHint: (id: string) => void;
}

const ObjectivesPanel: React.FC<ObjectivesPanelProps> = ({
  lab,
  completedObjectiveIds,
  solvedFlags,
  flagInput,
  setFlagInput,
  flagMessage,
  handleFlagSubmission,
  revealedHints,
  toggleHint,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#0a0f1c] border border-slate-800 rounded-xl overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
          <CheckSquare className="text-amber-400" size={17} />
          <span>Misiones y Tareas Prácticas</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Sigue los pasos guiados. Al encontrar la bandera secreta (código de solución), canjéala para ganar puntos.
        </p>
      </div>

      {/* Flag Submission Form */}
      <div className="p-3.5 rounded-xl bg-[#0f172a] border border-amber-500/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold">
            <Flag size={14} />
            <span>Canjear Solución (Bandera / Flag)</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Ejemplo: <code className="text-cyan-300 font-mono">KALI{'{...}'}</code>
          </span>
        </div>

        <form onSubmit={handleFlagSubmission} className="flex gap-2">
          <input
            type="text"
            value={flagInput}
            onChange={(e) => setFlagInput(e.target.value)}
            placeholder="Pega aquí el código o bandera descubierta..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Canjear
          </button>
        </form>

        {flagMessage && (
          <div className={`p-2.5 rounded text-xs font-mono flex items-center gap-2 ${
            flagMessage.type === 'success' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60' : 'bg-rose-950/60 text-rose-300 border border-rose-700/60'
          }`}>
            {flagMessage.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
            <span>{flagMessage.text}</span>
          </div>
        )}
      </div>

      {/* Objectives Checklist */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          Lista de Objetivos Guiados:
        </h3>

        {lab.objectives.map((obj, index) => {
          const isDone = completedObjectiveIds.includes(obj.id);
          const isHintRevealed = revealedHints[obj.id];

          return (
            <div
              key={obj.id}
              className={`p-3.5 rounded-xl border transition-colors space-y-2 ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-700/40 text-slate-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold ${
                  isDone ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {isDone ? <Check size={12} /> : index + 1}
                </div>

                <div className="flex-1">
                  <p className="text-xs font-medium leading-relaxed">
                    {obj.text}
                  </p>

                  {/* Hint Toggle */}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => toggleHint(obj.id)}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <HelpCircle size={11} />
                      <span>{isHintRevealed ? 'Ocultar Pista' : 'Ver Pista'}</span>
                    </button>
                  </div>

                  {isHintRevealed && (
                    <div className="mt-2 p-2 rounded bg-cyan-950/30 border border-cyan-800/40 text-[11px] font-mono text-cyan-200">
                      💡 {obj.hint}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Subcomponent: Theory & Command Guide
const TheoryGuidePanel: React.FC<{ lab: Lab }> = ({ lab }) => {
  return (
    <div className="flex flex-col h-full bg-[#0a0f1c] border border-slate-800 rounded-xl overflow-y-auto p-4 space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="text-purple-400" size={18} />
          <span>Guía Teórica & Hoja de Trucos</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Conceptos de seguridad, vectores de ataque y sintaxis de comandos.
        </p>
      </div>

      {/* Security Concept Card */}
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-2">
        <h3 className="text-xs font-mono font-bold text-purple-300 uppercase">
          Concepto: {lab.theoryGuide.concept}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {lab.theoryGuide.summary}
        </p>
      </div>

      {/* Cheat sheet table */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          Comandos Clave de Kali Linux:
        </h3>
        <div className="space-y-2">
          {lab.theoryGuide.cheatSheet.map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <code className="text-xs font-mono font-bold text-cyan-300 block">
                {item.command}
              </code>
              <p className="text-xs text-slate-400">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
