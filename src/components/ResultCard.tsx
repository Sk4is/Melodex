import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Song } from '../types/song';
import { audioService } from '../services/audioService';
import { useVisuals } from '../context/VisualContext';
import { AnswerEffectRenderer } from './effects/AnswerEffectRenderer';
import { ArtworkPresenter } from './effects/ArtworkPresenter';

interface ResultCardProps {
  status: 'won' | 'lost';
  currentSong: Song;
  currentStage: number;
  score: number;
  onNextSong: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  status,
  currentSong,
  score,
  onNextSong,
}) => {
  const { settings, effectiveAnswerEffect } = useVisuals();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSuccessText, setShowSuccessText] = useState(true);
  const isWon = status === 'won';
  const hasMountedRef = useRef(false);

  // Freeze the song snapshot to guarantee zero reveal flicker
  const frozenSongRef = useRef(currentSong);
  const displaySong = frozenSongRef.current || currentSong;

  useEffect(() => {
    const unsubscribe = audioService.subscribe((playbackStatus) => {
      setIsPlaying(playbackStatus.state === 'playing');
    });

    // Auto-Playback full snippet on reveal
    if (!hasMountedRef.current && displaySong.previewUrl) {
      hasMountedRef.current = true;
      audioService.playSnippet(displaySong.previewUrl, 0, 30).catch((err) => {
        console.warn('Auto-play blocked or failed:', err);
      });
    }

    // Success text fade timer (~800ms)
    if (isWon) {
      const timer = setTimeout(() => {
        setShowSuccessText(false);
      }, 1000);
      return () => {
        clearTimeout(timer);
        audioService.stop();
        unsubscribe();
      };
    }

    return () => {
      audioService.stop();
      unsubscribe();
    };
  }, [displaySong, isWon]);

  const handleToggleAudio = () => {
    if (isPlaying) {
      audioService.stop();
    } else if (displaySong.previewUrl) {
      audioService.playSnippet(displaySong.previewUrl, 0, 30);
    }
  };

  const handleNextClick = () => {
    audioService.stop();
    onNextSong();
  };

  // Glow calculation
  const glowMultiplier =
    settings.glowIntensity === 'OFF'
      ? 0
      : settings.glowIntensity === 'LOW'
      ? 0.5
      : settings.glowIntensity === 'HIGH'
      ? 1.6
      : 1;

  return (
    <motion.div
      id="centered-round-result"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex flex-col items-center text-center my-auto py-2 sm:py-4 select-none"
    >
      {/* 1. Subtle Micro-Label & Small Success Text */}
      <div className="h-6 flex items-center justify-center mb-2.5">
        <AnimatePresence mode="wait">
          {isWon && showSuccessText ? (
            <motion.div
              key="found-text"
              initial={{ opacity: 0, y: -4, letterSpacing: '0.4em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.35em' }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35 }}
              className="text-[11px] font-black text-white uppercase tracking-[0.35em] theme-transition"
              style={{
                color: 'var(--accent)',
                textShadow: '0 0 12px var(--accent-glow)',
              }}
            >
              F O U N D
            </motion.div>
          ) : isWon ? (
            <motion.div
              key="discovered-pill"
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.22em] uppercase text-neutral-400 px-2.5 py-0.5 rounded-full border border-neutral-800/80 bg-neutral-900/60 theme-transition"
              style={{ borderColor: 'var(--accent-soft)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full theme-transition"
                style={{
                  backgroundColor: 'var(--accent)',
                  boxShadow: '0 0 6px var(--accent)',
                }}
              />
              <span>DISCOVERED</span>
            </motion.div>
          ) : (
            <motion.span
              key="round-over"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-bold tracking-[0.22em] uppercase text-neutral-500"
            >
              ROUND OVER
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Central Artwork & Active Answer Effect Overlay */}
      <div className="relative flex items-center justify-center mb-5 sm:mb-6">
        {/* Real Answer Effect Triggered ONLY on Correct Guess */}
        {isWon && (
          <AnswerEffectRenderer
            effect={effectiveAnswerEffect}
            isTriggered={true}
            reducedMotion={settings.reducedMotion}
            glowMultiplier={glowMultiplier}
            size="normal"
          />
        )}

        {/* Selected Artwork Mode Presenter */}
        <ArtworkPresenter
          artworkUrl={displaySong.artworkUrl}
          title={displaySong.title}
          artist={displaySong.artist}
          style={settings.albumArtStyle}
          isPlaying={isPlaying}
          isWon={isWon}
          reducedMotion={settings.reducedMotion}
          glowMultiplier={glowMultiplier}
          artworkAmbience={settings.artworkAmbience}
          onTogglePlay={handleToggleAudio}
          size="normal"
        />
      </div>

      {/* 3. Staggered Text Reveal: Song Title */}
      <motion.div
        id="result-song-title-wrap"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: isWon ? 0.15 : 0.05,
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="max-w-md px-4"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug truncate">
          {displaySong.title}
        </h2>
      </motion.div>

      {/* 4. Staggered Text Reveal: Artist & Metadata */}
      <motion.div
        id="result-artist-meta-wrap"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: isWon ? 0.22 : 0.1,
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="max-w-md px-4 mb-6 sm:mb-8"
      >
        <p className="text-base font-medium text-neutral-300 mt-1 truncate">
          {displaySong.artist}
        </p>

        <div className="flex items-center justify-center gap-2.5 mt-2.5 text-xs text-neutral-500 font-mono">
          {displaySong.year && <span>{displaySong.year}</span>}
          {displaySong.genre && <span>• {displaySong.genre}</span>}
          {isWon && (
            <span
              className="font-semibold font-sans theme-transition"
              style={{ color: 'var(--accent)' }}
            >
              • +{score} pts
            </span>
          )}
        </div>
      </motion.div>

      {/* 5. Staggered Next Button */}
      <motion.div
        id="result-next-btn-wrap"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: isWon ? 0.3 : 0.15,
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="w-full max-w-xs px-4"
      >
        <button
          id="next-song-btn"
          type="button"
          onClick={handleNextClick}
          className="w-full py-3.5 px-8 rounded-full font-bold text-base tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 theme-transition"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text-color)',
            boxShadow: `0 8px ${Math.round(24 * glowMultiplier)}px var(--accent-glow)`,
          }}
        >
          <span>NEXT</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </motion.div>
    </motion.div>
  );
};
