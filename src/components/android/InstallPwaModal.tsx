import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Check, X, Shield, ArrowRight } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPwaModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    sounds.playKeyClick();
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        sounds.playSuccess();
        onClose();
      }
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b1220] border border-cyan-500/50 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 font-mono text-xs text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="text-cyan-400" size={20} />
            <h2 className="font-bold text-sm text-slate-100">
              Instalar KaliDroid en Android
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 text-slate-300">
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-700/40 space-y-1.5">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Shield size={14} />
              <span>Aplicación Nativa para Android (PWA)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Disfruta de la experiencia completa de KaliDroid en pantalla completa, sin barra de direcciones web y con acceso directo desde tu menú de aplicaciones de Android.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 text-xs">Pasos de instalación rápida:</h3>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-cyan-600 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</span>
                <span>En Google Chrome o Brave en tu teléfono Android, pulsa el botón <b>Instalar</b> abajo.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-cyan-600 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</span>
                <span>O pulsa los tres puntos <b>⋮</b> del navegador y selecciona <b>"Instalar aplicación"</b> o <b>"Añadir a pantalla de inicio"</b>.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cancelar
          </button>

          {deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-950 transition-colors"
            >
              <Download size={14} />
              <span>Instalar Ahora</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold transition-colors"
            >
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
