import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Music, Play, Square, ArrowRight } from 'lucide-react';
import { Song } from '../types/song';
import { audioService } from '../services/audioService';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCollapsedWaveform, setHasCollapsedWaveform] = useState(false);
  const isWon = status === 'won';
  const hasMountedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = audioService.subscribe((playbackStatus) => {
      setIsPlaying(playbackStatus.state === 'playing');
    });

    // Auto-Playback on reveal
    if (!hasMountedRef.current && currentSong.previewUrl) {
      hasMountedRef.current = true;
      audioService.playSnippet(currentSong.previewUrl, 0, 30).catch((err) => {
        console.warn('Auto-play blocked or failed:', err);
      });
    }

    // Trigger waveform convergence to art transition
    if (isWon) {
      const timer = setTimeout(() => {
        setHasCollapsedWaveform(true);
      }, 280);
      return () => {
        clearTimeout(timer);
        audioService.stop();
        unsubscribe();
      };
    } else {
      setHasCollapsedWaveform(true);
    }

    return () => {
      audioService.stop();
      unsubscribe();
    };
  }, [currentSong, isWon]);

  const handleToggleAudio = () => {
    if (isPlaying) {
      audioService.stop();
    } else if (currentSong.previewUrl) {
      audioService.playSnippet(currentSong.previewUrl, 0, 30);
    }
  };

  const handleNextClick = () => {
    audioService.stop();
    onNextSong();
  };

  return (
    <motion.div
      id="centered-round-result"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col items-center text-center my-auto py-2 sm:py-4 select-none"
    >
      {/* Waveform Convergence Animation (Active only in the initial 280ms of winning moment) */}
      {isWon && !hasCollapsedWaveform && (
        <div className="h-44 sm:h-56 flex items-center justify-center mb-6">
          <motion.div
            initial={{ opacity: 1, scaleX: 1 }}
            animate={{ opacity: 0, scaleX: 0.05, scaleY: 0.1 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center justify-center gap-1.5 h-10 px-6"
          >
            {[4, 12, 22, 16, 28, 14, 20, 8, 18, 24, 10, 6].map((h, i) => (
              <motion.span
                key={i}
                initial={{ height: h, opacity: 0.9 }}
                animate={{ height: 2, opacity: 0.2 }}
                transition={{ duration: 0.26 }}
                className="w-1 rounded-full theme-transition"
                style={{ backgroundColor: 'var(--accent)' }}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Main Content Reveal */}
      {(hasCollapsedWaveform || !isWon) && (
        <>
          {/* Subtle Micro-Label above artwork */}
          <motion.div
            id="result-micro-label"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-1.5 mb-2.5"
          >
            {isWon ? (
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.22em] uppercase text-neutral-400 px-2.5 py-0.5 rounded-full border border-neutral-800/80 bg-neutral-900/60 theme-transition"
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
              </span>
            ) : (
              <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-neutral-500">
                ROUND OVER
              </span>
            )}
          </motion.div>

          {/* Central Album Artwork & Color Resonance Container */}
          <div className="relative flex items-center justify-center mb-5 sm:mb-6">
            {/* Circular Color Resonance Waves from behind artwork */}
            {isWon && (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.45 }}
                  animate={{ scale: 2.15, opacity: 0 }}
                  transition={{
                    duration: 1.3,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-0 rounded-full pointer-events-none theme-transition"
                  style={{
                    border: '1.5px solid var(--accent)',
                    boxShadow: '0 0 28px -2px var(--accent-glow)',
                  }}
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.3 }}
                  animate={{ scale: 2.65, opacity: 0 }}
                  transition={{
                    delay: 0.1,
                    duration: 1.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="absolute inset-0 rounded-full pointer-events-none theme-transition"
                  style={{
                    border: '1px solid var(--accent)',
                    boxShadow: '0 0 36px -4px var(--accent-glow)',
                  }}
                />
              </>
            )}

            {/* Continuous subtle pulse while song preview is actively playing */}
            {isPlaying && (
              <motion.div
                initial={{ scale: 0.96, opacity: 0.5 }}
                animate={{ scale: 1.1, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
                className="absolute -inset-2 rounded-3xl pointer-events-none theme-transition"
                style={{ backgroundColor: 'var(--accent-glow)' }}
              />
            )}

            {/* Artwork Container with Smooth Scale & Blur Bloom */}
            <motion.div
              id="album-art-container"
              initial={{
                scale: isWon ? 0.88 : 0.95,
                filter: isWon ? 'blur(12px)' : 'blur(0px)',
                opacity: 0,
              }}
              animate={{
                scale: 1,
                filter: 'blur(0px)',
                opacity: 1,
              }}
              transition={{
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative group cursor-pointer"
              onClick={handleToggleAudio}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggleAudio();
                }
              }}
              aria-label={isPlaying ? 'Pause song preview' : 'Play song preview'}
            >
              {currentSong.artworkUrl ? (
                <img
                  src={currentSong.artworkUrl}
                  alt={currentSong.title}
                  className="w-44 h-44 sm:w-56 sm:h-56 rounded-3xl object-cover shadow-2xl transition-all duration-300 ring-1 ring-white/10"
                  style={{
                    boxShadow: isPlaying || isWon
                      ? '0 12px 36px var(--accent-glow), 0 4px 16px rgba(0,0,0,0.6)'
                      : '0 10px 30px rgba(0,0,0,0.8)',
                    borderColor: isPlaying || isWon ? 'var(--accent)' : undefined,
                  }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-3xl bg-neutral-900 flex items-center justify-center text-neutral-600 ring-1 ring-white/10 shadow-2xl">
                  <Music className="w-16 h-16" />
                </div>
              )}

              {/* Subtle Hover/Tap Play/Pause Overlay */}
              <div
                className={`absolute inset-0 rounded-3xl bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-200 ${
                  isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus:opacity-100'
                }`}
              >
                <div
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-xl theme-transition"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-text-color)',
                  }}
                >
                  {isPlaying ? (
                    <Square className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Staggered Text Reveal: Song Title */}
          <motion.div
            id="result-song-title-wrap"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: isWon ? 0.12 : 0.05,
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="max-w-md px-4"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug truncate">
              {currentSong.title}
            </h2>
          </motion.div>

          {/* Staggered Text Reveal: Artist & Metadata */}
          <motion.div
            id="result-artist-meta-wrap"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: isWon ? 0.20 : 0.1,
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="max-w-md px-4 mb-6 sm:mb-8"
          >
            <p className="text-base font-medium text-neutral-300 mt-1 truncate">
              {currentSong.artist}
            </p>

            <div className="flex items-center justify-center gap-2.5 mt-2.5 text-xs text-neutral-500 font-mono">
              {currentSong.year && <span>{currentSong.year}</span>}
              {currentSong.genre && <span>• {currentSong.genre}</span>}
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

          {/* Staggered Next Button */}
          <motion.div
            id="result-next-btn-wrap"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: isWon ? 0.30 : 0.15,
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
                boxShadow: '0 8px 24px var(--accent-glow)',
              }}
            >
              <span>NEXT</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};
