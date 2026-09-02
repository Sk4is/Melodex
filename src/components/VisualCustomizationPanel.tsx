import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles, Play } from 'lucide-react';
import { useVisuals } from '../context/VisualContext';
import {
  BackgroundMotion,
  VisualizerStyle,
  GlowIntensity,
  AlbumArtStyle,
  CorrectAnswerEffect,
  AmbientDust,
  ScreenVignette,
} from '../types/visuals';
import { AnswerEffectRenderer } from './effects/AnswerEffectRenderer';
import { ArtworkPresenter } from './effects/ArtworkPresenter';

const ANSWER_EFFECT_OPTIONS: { id: CorrectAnswerEffect; label: string; desc: string }[] = [
  { id: 'RESONANCE', label: 'Resonance', desc: 'Concentric sound waves' },
  { id: 'SHOCKWAVE', label: 'Shockwave', desc: 'Snappy circular impact' },
  { id: 'SCAN', label: 'Scan', desc: 'Laser discovery beam' },
  { id: 'PORTAL', label: 'Portal', desc: 'Depth aperture reveal' },
  { id: 'ECHO', label: 'Echo', desc: 'Visual reverberations' },
  { id: 'AURORA', label: 'Aurora', desc: 'Flowing atmospheric light' },
  { id: 'GLITCH', label: 'Glitch', desc: 'Signal lock distortion' },
  { id: 'WARP', label: 'Warp', desc: 'Spatial inward compression' },
];

const ARTWORK_STYLE_OPTIONS: { id: AlbumArtStyle; label: string; desc: string }[] = [
  { id: 'CLASSIC', label: 'Classic', desc: 'Clean square cover' },
  { id: 'FLOAT', label: 'Float', desc: '3D perspective tilt' },
  { id: 'VINYL', label: 'Vinyl', desc: 'Rotating record disc' },
  { id: 'GLOW', label: 'Glow', desc: 'Ambient backlight bloom' },
  { id: 'HOLOGRAPHIC', label: 'Holo', desc: 'Specular prism sheen' },
];

export const VisualCustomizationPanel: React.FC = () => {
  const {
    settings,
    updateSetting,
    resetSettings,
    isPanelOpen,
    setIsPanelOpen,
    openCount,
    incrementOpenCount,
  } = useVisuals();

  const [isHoveredNearEdge, setIsHoveredNearEdge] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(true);
  const closeTimeoutRef = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hasEverOpenedRef = useRef(false);

  // Track opening count for reduced cue intensity
  useEffect(() => {
    if (isPanelOpen && !hasEverOpenedRef.current) {
      hasEverOpenedRef.current = true;
      incrementOpenCount();
    }
  }, [isPanelOpen, incrementOpenCount]);

  // Cleanup close timer
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnterZone = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsHoveredNearEdge(true);
    setIsPanelOpen(true);
  };

  const handleMouseLeaveZone = () => {
    setIsHoveredNearEdge(false);
    if (isPinned) return;

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsPanelOpen(false);
    }, 320);
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPanelOpen) {
      setIsPanelOpen(true);
      setIsPinned(true);
    } else {
      setIsPinned((prev) => !prev);
    }
  };

  const handleManualClose = () => {
    setIsPinned(false);
    setIsPanelOpen(false);
  };

  // Mobile touch swipe handling
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartX.current;
    if (diffX > 40) {
      setIsPinned(false);
      setIsPanelOpen(false);
    }
    touchStartX.current = null;
  };

  // Trigger preview replay when user selects an effect or clicks replay
  const handleSelectAnswerEffect = (effect: CorrectAnswerEffect) => {
    updateSetting('correctAnswerEffect', effect);
    setPreviewKey((prev) => prev + 1);
  };

  const handleSelectArtworkStyle = (style: AlbumArtStyle) => {
    updateSetting('albumArtStyle', style);
    setPreviewKey((prev) => prev + 1);
  };

  const handleReplayPreview = () => {
    setPreviewKey((prev) => prev + 1);
  };

  const isSubtleIndicator = openCount >= 4;
  const glowMultiplier =
    settings.glowIntensity === 'OFF'
      ? 0
      : settings.glowIntensity === 'LOW'
      ? 0.5
      : settings.glowIntensity === 'HIGH'
      ? 1.6
      : 1;

  return (
    <>
      {/* 1. Desktop Invisible Right Activation Zone (25-35px wide) */}
      <div
        id="visual-panel-activation-zone"
        aria-hidden="true"
        onMouseEnter={handleMouseEnterZone}
        onMouseLeave={handleMouseLeaveZone}
        className="hidden md:block fixed right-0 top-0 bottom-0 w-7 z-40 cursor-pointer pointer-events-auto"
      />

      {/* 2. Small Right-Edge Subtle Handle Indicator (When Closed or Hovering) */}
      <div
        id="visual-panel-edge-handle"
        onClick={handleTogglePin}
        onMouseEnter={handleMouseEnterZone}
        onMouseLeave={handleMouseLeaveZone}
        role="button"
        tabIndex={0}
        aria-label="Open Visual Customization Panel"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center cursor-pointer select-none py-3 pl-1.5 pr-0.5"
      >
        <div
          className={`relative flex items-center justify-center transition-all duration-300 rounded-l-md ${
            isPanelOpen
              ? 'opacity-0 pointer-events-none'
              : isHoveredNearEdge
              ? 'opacity-100 -translate-x-1'
              : isSubtleIndicator
              ? 'opacity-30 hover:opacity-90'
              : 'opacity-55 hover:opacity-100'
          }`}
          style={{
            height: '28px',
            width: '14px',
            backgroundColor: 'rgba(15, 15, 17, 0.85)',
            borderLeft: '1.5px solid var(--accent)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: isHoveredNearEdge
              ? '0 0 14px var(--accent-glow), -2px 0 6px var(--accent-soft)'
              : '0 0 6px var(--accent-soft)',
          }}
        >
          {!isSubtleIndicator && !isHoveredNearEdge && (
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-l-md pointer-events-none theme-transition"
              style={{
                boxShadow: 'inset 2px 0 6px var(--accent-soft)',
              }}
            />
          )}

          <ChevronLeft
            className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
              isHoveredNearEdge ? '-translate-x-0.5 text-white' : ''
            }`}
            style={{ color: isHoveredNearEdge ? 'var(--accent)' : undefined }}
          />
        </div>
      </div>

      {/* 3. Mobile Floating Backdrop */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleManualClose}
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-[2px] z-45"
          />
        )}
      </AnimatePresence>

      {/* 4. Sliding Visual Customization Panel (Fixed Right Overlay - Zero Layout Shift) */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.aside
            ref={panelRef}
            id="visual-customization-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            onMouseEnter={handleMouseEnterZone}
            onMouseLeave={handleMouseLeaveZone}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            aria-label="Visual Customization Panel"
            className="fixed right-0 top-0 bottom-0 z-50 w-[88vw] sm:w-[340px] max-w-[360px] bg-[#0a0a0ae6] backdrop-blur-[20px] border-l border-white/10 shadow-2xl flex flex-col justify-between select-none overflow-hidden theme-transition pointer-events-auto"
            style={{
              boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.75)',
            }}
          >
            {/* Panel Top Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles
                  className="w-3.5 h-3.5 theme-transition"
                  style={{ color: 'var(--accent)' }}
                />
                <h2 className="text-[11px] font-bold tracking-[0.25em] text-neutral-300 uppercase">
                  VISUALS
                </h2>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="close-visual-panel-btn"
                  onClick={handleManualClose}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors"
                  aria-label="Close Visual Panel"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Panel Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4 text-xs">
              {/* INTERACTIVE LIVE PREVIEW BOX */}
              <div className="p-3 bg-neutral-950/90 rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold tracking-widest text-neutral-500 uppercase">
                    EFFECT & ART PREVIEW
                  </span>
                  <button
                    type="button"
                    onClick={handleReplayPreview}
                    className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full text-neutral-400 hover:text-white bg-neutral-900 border border-white/10 transition-colors"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>REPLAY</span>
                  </button>
                </div>

                {/* Live Preview Container */}
                <div className="relative my-2 w-full flex items-center justify-center h-32 overflow-visible">
                  <div key={previewKey} className="relative flex items-center justify-center">
                    {/* Live Answer Effect in Preview mode */}
                    <AnswerEffectRenderer
                      effect={settings.correctAnswerEffect}
                      isTriggered={true}
                      reducedMotion={settings.reducedMotion}
                      glowMultiplier={glowMultiplier}
                      size="preview"
                    />

                    {/* Mini Sample Artwork Card in current Artwork Style */}
                    <ArtworkPresenter
                      artworkUrl="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80"
                      title="Sample Track"
                      artist="Melodex"
                      style={settings.albumArtStyle}
                      isPlaying={isPlayingPreview}
                      isWon={true}
                      reducedMotion={settings.reducedMotion}
                      glowMultiplier={glowMultiplier}
                      artworkAmbience={settings.artworkAmbience}
                      onTogglePlay={() => setIsPlayingPreview((prev) => !prev)}
                      size="preview"
                    />
                  </div>
                </div>

                <div className="text-[10px] font-medium text-neutral-400 mt-1 truncate max-w-full">
                  <span className="theme-transition font-bold" style={{ color: 'var(--accent)' }}>
                    {settings.correctAnswerEffect}
                  </span>
                  <span className="text-neutral-600 mx-1.5">•</span>
                  <span>{settings.albumArtStyle}</span>
                </div>
              </div>

              {/* 1. Correct Answer Effect (8 Distinct Modes) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                    Answer Effect
                  </label>
                  <span className="text-[9px] text-neutral-500 font-mono">
                    {settings.correctAnswerEffect}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-950/80 rounded-2xl border border-white/5">
                  {ANSWER_EFFECT_OPTIONS.map((opt) => {
                    const isActive = settings.correctAnswerEffect === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectAnswerEffect(opt.id)}
                        className={`flex flex-col items-start px-2.5 py-1.5 rounded-xl transition-all duration-150 relative text-left ${
                          isActive
                            ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-white/10'
                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                        }`}
                        style={{
                          borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                        }}
                      >
                        <span
                          className="font-bold text-[10px] tracking-wider theme-transition"
                          style={{
                            color: isActive ? 'var(--accent)' : undefined,
                            textShadow: isActive ? '0 0 10px var(--accent-glow)' : undefined,
                          }}
                        >
                          {opt.label}
                        </span>
                        <span className="text-[9px] text-neutral-500 truncate w-full">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Album Art Style (5 Distinct Modes) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                    Artwork Mode
                  </label>
                  <span className="text-[9px] text-neutral-500 font-mono">
                    {settings.albumArtStyle}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-950/80 rounded-2xl border border-white/5">
                  {ARTWORK_STYLE_OPTIONS.map((opt) => {
                    const isActive = settings.albumArtStyle === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectArtworkStyle(opt.id)}
                        className={`py-1.5 px-1.5 rounded-xl font-semibold text-[10px] tracking-wider transition-all duration-150 text-center truncate ${
                          isActive
                            ? 'bg-neutral-800 text-white shadow-sm ring-1 ring-white/10'
                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                        }`}
                        style={{
                          color: isActive ? 'var(--accent)' : undefined,
                          borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                          textShadow: isActive ? '0 0 10px var(--accent-glow)' : undefined,
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Visualizer Style */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                  Visualizer
                </label>
                <div className="grid grid-cols-5 gap-1 p-0.5 bg-neutral-950/80 rounded-xl border border-white/5">
                  {(['WAVE', 'BARS', 'ORBIT', 'RINGS', 'MINIMAL'] as VisualizerStyle[]).map((val) => {
                    const isActive = settings.visualizerStyle === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => updateSetting('visualizerStyle', val)}
                        className={`py-1.5 px-1 rounded-lg font-semibold text-[10px] tracking-wider transition-all duration-150 truncate ${
                          isActive
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                        style={{
                          color: isActive ? 'var(--accent)' : undefined,
                        }}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Glow Intensity */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                  Glow Intensity
                </label>
                <div className="grid grid-cols-4 gap-1 p-0.5 bg-neutral-950/80 rounded-xl border border-white/5">
                  {(['OFF', 'LOW', 'NORMAL', 'HIGH'] as GlowIntensity[]).map((val) => {
                    const isActive = settings.glowIntensity === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => updateSetting('glowIntensity', val)}
                        className={`py-1.5 px-1 rounded-lg font-semibold text-[10px] tracking-wider transition-all duration-150 ${
                          isActive
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                        style={{
                          color: isActive ? 'var(--accent)' : undefined,
                        }}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Dynamic Artwork Glow / Ambience */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                  Artwork Ambience
                </label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-neutral-950/80 rounded-xl border border-white/5">
                  {[true, false].map((val) => {
                    const isActive = settings.artworkAmbience === val;
                    const label = val ? 'ON' : 'OFF';
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => updateSetting('artworkAmbience', val)}
                        className={`py-1.5 px-2 rounded-lg font-semibold text-[10px] tracking-wider transition-all duration-150 ${
                          isActive
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                        style={{
                          color: isActive ? 'var(--accent)' : undefined,
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Background Motion */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                  Background Motion
                </label>
                <div className="grid grid-cols-4 gap-1 p-0.5 bg-neutral-950/80 rounded-xl border border-white/5">
                  {(['OFF', 'LOW', 'NORMAL', 'HIGH'] as BackgroundMotion[]).map((val) => {
                    const isActive = settings.backgroundMotion === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => updateSetting('backgroundMotion', val)}
                        className={`py-1.5 px-1 rounded-lg font-semibold text-[10px] tracking-wider transition-all duration-150 ${
                          isActive
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                        style={{
                          color: isActive ? 'var(--accent)' : undefined,
                        }}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 7. Audio Reactive Background */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                  Audio Reactive Background
                </label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-neutral-950/80 rounded-xl border border-white/5">
                  {[true, false].map((val) => {
                    const isActive = settings.audioReactive === val;
                    const label = val ? 'ON' : 'OFF';
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => updateSetting('audioReactive', val)}
                        className={`py-1.5 px-2 rounded-lg font-semibold text-[10px] tracking-wider transition-all duration-150 ${
                          isActive
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                        style={{
                          color: isActive ? 'var(--accent)' : undefined,
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 8. Play Energy */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                  Play Energy
                </label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-neutral-950/80 rounded-xl border border-white/5">
                  {[true, false].map((val) => {
                    const isActive = settings.playEnergy === val;
                    const label = val ? 'ON' : 'OFF';
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => updateSetting('playEnergy', val)}
                        className={`py-1.5 px-2 rounded-lg font-semibold text-[10px] tracking-wider transition-all duration-150 ${
                          isActive
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                        style={{
                          color: isActive ? 'var(--accent)' : undefined,
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 9. Ambient Dust */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                  Ambient Dust
                </label>
                <div className="grid grid-cols-3 gap-1 p-0.5 bg-neutral-950/80 rounded-xl border border-white/5">
                  {(['OFF', 'LOW', 'NORMAL'] as AmbientDust[]).map((val) => {
                    const isActive = settings.ambientDust === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => updateSetting('ambientDust', val)}
                        className={`py-1.5 px-1 rounded-lg font-semibold text-[10px] tracking-wider transition-all duration-150 ${
                          isActive
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                        style={{
                          color: isActive ? 'var(--accent)' : undefined,
                        }}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 10. Screen Vignette */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                  Vignette
                </label>
                <div className="grid grid-cols-3 gap-1 p-0.5 bg-neutral-950/80 rounded-xl border border-white/5">
                  {(['OFF', 'SOFT', 'DEEP'] as ScreenVignette[]).map((val) => {
                    const isActive = settings.screenVignette === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => updateSetting('screenVignette', val)}
                        className={`py-1.5 px-1 rounded-lg font-semibold text-[10px] tracking-wider transition-all duration-150 ${
                          isActive
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                        style={{
                          color: isActive ? 'var(--accent)' : undefined,
                        }}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 11. Immersive Mode */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                  Immersive Playback
                </label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-neutral-950/80 rounded-xl border border-white/5">
                  {[true, false].map((val) => {
                    const isActive = settings.immersive === val;
                    const label = val ? 'ON' : 'OFF';
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => updateSetting('immersive', val)}
                        className={`py-1.5 px-2 rounded-lg font-semibold text-[10px] tracking-wider transition-all duration-150 ${
                          isActive
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                        style={{
                          color: isActive ? 'var(--accent)' : undefined,
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 12. Reduced Motion */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                  Reduced Motion
                </label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-neutral-950/80 rounded-xl border border-white/5">
                  {[true, false].map((val) => {
                    const isActive = settings.reducedMotion === val;
                    const label = val ? 'ON' : 'OFF';
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => updateSetting('reducedMotion', val)}
                        className={`py-1.5 px-2 rounded-lg font-semibold text-[10px] tracking-wider transition-all duration-150 ${
                          isActive
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                        style={{
                          color: isActive ? 'var(--accent)' : undefined,
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 13. Shuffle Visuals */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
                  Shuffle Round Visuals
                </label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-neutral-950/80 rounded-xl border border-white/5">
                  {[true, false].map((val) => {
                    const isActive = settings.shuffleVisuals === val;
                    const label = val ? 'ON' : 'OFF';
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => updateSetting('shuffleVisuals', val)}
                        className={`py-1.5 px-2 rounded-lg font-semibold text-[10px] tracking-wider transition-all duration-150 ${
                          isActive
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                        style={{
                          color: isActive ? 'var(--accent)' : undefined,
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Panel Bottom Reset Footer */}
            <div className="p-3 border-t border-white/10 flex items-center justify-center">
              <button
                id="reset-visuals-btn"
                type="button"
                onClick={resetSettings}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-semibold tracking-widest text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900/60 rounded-full transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RESET VISUALS</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
