import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  VisualSettings,
  DEFAULT_VISUAL_SETTINGS,
  VisualizerStyle,
  CorrectAnswerEffect,
} from '../types/visuals';

interface VisualContextType {
  settings: VisualSettings;
  effectiveVisualizerStyle: VisualizerStyle;
  effectiveAnswerEffect: CorrectAnswerEffect;
  updateSetting: <K extends keyof VisualSettings>(key: K, value: VisualSettings[K]) => void;
  resetSettings: () => void;
  isPanelOpen: boolean;
  setIsPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openCount: number;
  incrementOpenCount: () => void;
  triggerRoundShuffle: () => void;
  isPlayingAudio: boolean;
  setIsPlayingAudio: (playing: boolean) => void;
}

const STORAGE_KEY = 'melodex_visual_settings_v2';
const OPEN_COUNT_KEY = 'melodex_visual_open_count_v2';

const VisualContext = createContext<VisualContextType | undefined>(undefined);

const SHUFFLE_VISUALIZERS: VisualizerStyle[] = ['WAVE', 'BARS', 'ORBIT', 'RINGS', 'MINIMAL'];
const SHUFFLE_ANSWER_EFFECTS: CorrectAnswerEffect[] = [
  'RESONANCE',
  'SHOCKWAVE',
  'SCAN',
  'PORTAL',
  'ECHO',
  'AURORA',
  'GLITCH',
  'WARP',
];

export const VisualProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<VisualSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_VISUAL_SETTINGS, ...parsed };
      }
    } catch {
      // Fallback to defaults
    }

    const systemReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return {
      ...DEFAULT_VISUAL_SETTINGS,
      reducedMotion: Boolean(systemReducedMotion),
    };
  });

  const [openCount, setOpenCount] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(OPEN_COUNT_KEY) || '0', 10);
    } catch {
      return 0;
    }
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [roundSeed, setRoundSeed] = useState(0);

  // Save to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save visual settings:', e);
    }
  }, [settings]);

  // Sync CSS properties for glow intensity
  useEffect(() => {
    const root = document.documentElement;
    let multiplier = 1;
    switch (settings.glowIntensity) {
      case 'OFF':
        multiplier = 0;
        break;
      case 'LOW':
        multiplier = 0.45;
        break;
      case 'NORMAL':
        multiplier = 1;
        break;
      case 'HIGH':
        multiplier = 1.75;
        break;
    }
    root.style.setProperty('--glow-multiplier', multiplier.toString());
  }, [settings.glowIntensity]);

  const updateSetting = useCallback(
    <K extends keyof VisualSettings>(key: K, value: VisualSettings[K]) => {
      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const resetSettings = useCallback(() => {
    const systemReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setSettings({
      ...DEFAULT_VISUAL_SETTINGS,
      reducedMotion: Boolean(systemReducedMotion),
    });
  }, []);

  const incrementOpenCount = useCallback(() => {
    setOpenCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(OPEN_COUNT_KEY, next.toString());
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const triggerRoundShuffle = useCallback(() => {
    setRoundSeed((prev) => prev + 1);
  }, []);

  // Compute effective styles (with support for round shuffle)
  const effectiveVisualizerStyle = useMemo<VisualizerStyle>(() => {
    if (settings.shuffleVisuals && roundSeed > 0) {
      return SHUFFLE_VISUALIZERS[roundSeed % SHUFFLE_VISUALIZERS.length];
    }
    return settings.visualizerStyle;
  }, [settings.shuffleVisuals, settings.visualizerStyle, roundSeed]);

  const effectiveAnswerEffect = useMemo<CorrectAnswerEffect>(() => {
    if (settings.shuffleVisuals && roundSeed > 0) {
      return SHUFFLE_ANSWER_EFFECTS[roundSeed % SHUFFLE_ANSWER_EFFECTS.length];
    }
    return settings.correctAnswerEffect;
  }, [settings.shuffleVisuals, settings.correctAnswerEffect, roundSeed]);

  return (
    <VisualContext.Provider
      value={{
        settings,
        effectiveVisualizerStyle,
        effectiveAnswerEffect,
        updateSetting,
        resetSettings,
        isPanelOpen,
        setIsPanelOpen,
        openCount,
        incrementOpenCount,
        triggerRoundShuffle,
        isPlayingAudio,
        setIsPlayingAudio,
      }}
    >
      {children}
    </VisualContext.Provider>
  );
};

export const useVisuals = () => {
  const context = useContext(VisualContext);
  if (!context) {
    throw new Error('useVisuals must be used within a VisualProvider');
  }
  return context;
};
