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

    return () => {
      audioService.stop();
      unsubscribe();
    };
  }, [currentSong]);

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
      initial={{ opacity: 0, scale: 0.94, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -10 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex flex-col items-center text-center my-auto py-4 select-none"
    >
      {/* 1. Large Album Artwork with Hover/Tap Play/Pause Overlay & Dynamic Glow */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative group mb-6 cursor-pointer"
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
        {/* Playing pulse effect */}
        {isPlaying && (
          <motion.div
            initial={{ scale: 0.96, opacity: 0.5 }}
            animate={{ scale: 1.08, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
            className="absolute -inset-2 rounded-3xl pointer-events-none theme-transition"
            style={{ backgroundColor: 'var(--accent-glow)' }}
          />
        )}

        {currentSong.artworkUrl ? (
          <img
            src={currentSong.artworkUrl}
            alt={currentSong.title}
            className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl object-cover shadow-2xl transition-all duration-300 ring-1 ring-white/10"
            style={{
              boxShadow: isPlaying
                ? '0 12px 36px var(--accent-glow)'
                : isWon
                ? '0 10px 30px var(--accent-glow)'
                : '0 10px 30px rgba(0,0,0,0.8)',
              borderColor: isPlaying || isWon ? 'var(--accent)' : undefined,
            }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-neutral-900 flex items-center justify-center text-neutral-600 ring-1 ring-white/10 shadow-2xl">
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
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl theme-transition"
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

      {/* 2. Song Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="max-w-md px-4 mb-8"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug truncate">
          {currentSong.title}
        </h2>
        <p className="text-base font-medium text-neutral-300 mt-1 truncate">
          {currentSong.artist}
        </p>

        <div className="flex items-center justify-center gap-3 mt-3 text-xs text-neutral-500 font-mono">
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

      {/* 3. NEXT Button (Exact text: "NEXT") */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
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
    </motion.div>
  );
};
