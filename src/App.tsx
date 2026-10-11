/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LABS } from './data/labsData';
import { Lab, UserProgress } from './types/cyber';
import { AndroidStatusBar } from './components/android/AndroidStatusBar';
import { BottomNav, MainNavView } from './components/android/BottomNav';
import { HomeHub } from './components/home/HomeHub';
import { LabList } from './components/labs/LabList';
import { LabWorkspace } from './components/labs/LabWorkspace';
import { ProfileModal } from './components/profile/ProfileModal';
import { InstallPwaModal } from './components/android/InstallPwaModal';
import { sounds } from './utils/audio';

const STORAGE_KEY = 'kalidroid_cyberlab_progress_v2';

export default function App() {
  const [currentLabId, setCurrentLabId] = useState<string>(LABS[0].id);
  const [currentView, setCurrentView] = useState<'home' | 'labs' | 'workspace' | 'profile'>('home');
  const [workspaceTab, setWorkspaceTab] = useState<'terminal' | 'wireshark' | 'browser' | 'objectives' | 'guide'>('terminal');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // User state
  const [completedLabIds, setCompletedLabIds] = useState<string[]>([]);
  const [solvedFlags, setSolvedFlags] = useState<string[]>([]);
  const [completedObjectiveIds, setCompletedObjectiveIds] = useState<string[]>([]);
  const [xp, setXp] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Load saved progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.completedLabIds) setCompletedLabIds(parsed.completedLabIds);
        if (parsed.solvedFlags) setSolvedFlags(parsed.solvedFlags);
        if (parsed.completedObjectiveIds) setCompletedObjectiveIds(parsed.completedObjectiveIds);
        if (typeof parsed.xp === 'number') setXp(parsed.xp);
        if (parsed.currentLabId && LABS.some(l => l.id === parsed.currentLabId)) {
          setCurrentLabId(parsed.currentLabId);
        }
        if (typeof parsed.soundEnabled === 'boolean') {
          setSoundEnabled(parsed.soundEnabled);
          sounds.enabled = parsed.soundEnabled;
        }
      }
    } catch {
      // Storage unavailable or invalid
    }
  }, []);

  // Save progress on state change
  useEffect(() => {
    try {
      const dataToSave = {
        completedLabIds,
        solvedFlags,
        completedObjectiveIds,
        xp,
        currentLabId,
        soundEnabled,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch {
      // Storage full
    }
  }, [completedLabIds, solvedFlags, completedObjectiveIds, xp, currentLabId, soundEnabled]);

  const currentLab = LABS.find(l => l.id === currentLabId) || LABS[0];

  const handleSelectLab = (labId: string) => {
    setCurrentLabId(labId);
    setWorkspaceTab('terminal');
    setCurrentView('workspace');
  };

  const handleOpenTool = (tool: 'terminal' | 'wireshark' | 'browser' | 'objectives' | 'guide') => {
    setWorkspaceTab(tool);
    setCurrentView('workspace');
  };

  const handleObjectiveComplete = (objId: string) => {
    if (!completedObjectiveIds.includes(objId)) {
      setCompletedObjectiveIds(prev => [...prev, objId]);
      setXp(prev => prev + 50);

      // Check if all objectives for this lab are completed
      const allObjs = currentLab.objectives.map(o => o.id);
      const allDone = allObjs.every(id => id === objId || completedObjectiveIds.includes(id));
      if (allDone && !completedLabIds.includes(currentLab.id)) {
        setCompletedLabIds(prev => [...prev, currentLab.id]);
        setXp(prev => prev + currentLab.xpReward);
      }
    }
  };

  const handleFlagSubmit = (submittedFlag: string): boolean => {
    const clean = submittedFlag.trim();
    const matchedFlag = currentLab.flags.find(f => f.flag.toLowerCase() === clean.toLowerCase());

    if (matchedFlag) {
      if (!solvedFlags.includes(matchedFlag.flag)) {
        setSolvedFlags(prev => [...prev, matchedFlag.flag]);
        setXp(prev => prev + matchedFlag.points);

        // Mark corresponding flag objective as completed
        const flagObj = currentLab.objectives.find(o => o.flagId === matchedFlag.id);
        if (flagObj && !completedObjectiveIds.includes(flagObj.id)) {
          setCompletedObjectiveIds(prev => [...prev, flagObj.id]);
        }

        // Complete lab
        if (!completedLabIds.includes(currentLab.id)) {
          setCompletedLabIds(prev => [...prev, currentLab.id]);
        }
      }
      return true;
    }
    return false;
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  const handleResetProgress = () => {
    setCompletedLabIds([]);
    setSolvedFlags([]);
    setCompletedObjectiveIds([]);
    setXp(0);
    localStorage.removeItem(STORAGE_KEY);
    sounds.playError();
  };

  // BottomNav view mapping
  const activeNavView: MainNavView = 
    currentView === 'home'
      ? 'home'
      : currentView === 'labs' 
      ? 'labs' 
      : currentView === 'profile' 
      ? 'profile' 
      : workspaceTab === 'wireshark' 
      ? 'workspace_wireshark' 
      : workspaceTab === 'browser' 
      ? 'workspace_browser' 
      : 'workspace_terminal';

  const handleBottomNavChange = (navView: MainNavView) => {
    if (navView === 'home') {
      setCurrentView('home');
    } else if (navView === 'labs') {
      setCurrentView('labs');
    } else if (navView === 'profile') {
      setCurrentView('profile');
    } else if (navView === 'workspace_terminal') {
      setCurrentView('workspace');
      setWorkspaceTab('terminal');
    } else if (navView === 'workspace_wireshark') {
      setCurrentView('workspace');
      setWorkspaceTab('wireshark');
    } else if (navView === 'workspace_browser') {
      setCurrentView('workspace');
      setWorkspaceTab('browser');
    }
  };

  return (
    <div className="relative flex flex-col h-[100dvh] w-full overflow-hidden bg-[#070b14]">
      {/* Android Top Header */}
      <AndroidStatusBar
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenProfile={() => setCurrentView('profile')}
        onResetProgress={handleResetProgress}
        onOpenInstallPwa={() => setIsInstallModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 overflow-hidden relative">
        {currentView === 'home' && (
          <HomeHub
            currentLab={currentLab}
            completedLabIds={completedLabIds}
            totalLabsCount={LABS.length}
            xp={xp}
            onOpenTool={handleOpenTool}
            onNavigateToLabs={() => setCurrentView('labs')}
            onNavigateToProfile={() => setCurrentView('profile')}
          />
        )}

        {currentView === 'labs' && (
          <LabList
            labs={LABS}
            currentLabId={currentLabId}
            completedLabIds={completedLabIds}
            onSelectLab={handleSelectLab}
          />
        )}

        {currentView === 'workspace' && (
          <LabWorkspace
            lab={currentLab}
            completedObjectiveIds={completedObjectiveIds}
            solvedFlags={solvedFlags}
            onObjectiveComplete={handleObjectiveComplete}
            onFlagSubmit={handleFlagSubmit}
            onBackToCatalog={() => setCurrentView('labs')}
            activeTab={workspaceTab}
            onActiveTabChange={setWorkspaceTab}
          />
        )}

        {currentView === 'profile' && (
          <ProfileModal
            labs={LABS}
            completedLabIds={completedLabIds}
            solvedFlags={solvedFlags}
            xp={xp}
            onResetProgress={handleResetProgress}
          />
        )}
      </main>

      {/* Android Bottom Navigation Bar */}
      <BottomNav
        currentView={activeNavView}
        onChangeView={handleBottomNavChange}
        hasWireshark={true}
        hasBrowser={Boolean(currentLab.browserTargetUrl)}
        xp={xp}
      />

      {/* PWA / Android Install Modal */}
      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
