import React from 'react';
import { motion } from 'motion/react';
import { STAGES } from '../types/game';

interface TimeProgressBarProps {
  currentStage: number;
  playbackProgress: number; // 0 to 1
  isPlaying: boolean;
}

export const TimeProgressBar: React.FC<TimeProgressBarProps> = ({
  currentStage,
  playbackProgress,
  isPlaying,
}) => {
  const totalStages = STAGES.length;
  // Progress fraction unlocked (from 0 to 1): currentStage / (totalStages - 1)
  const unlockedFraction = currentStage / (totalStages - 1);
  const unlockedPercent = unlockedFraction * 100;

  // Active playhead percentage across the entire bar during playback
  const activePlayheadPercent = playbackProgress * unlockedPercent;

  return (
    <div id="time-progression-bar" className="w-full select-none py-2 px-1">
      {/* 1. Stage Duration Labels */}
      <div className="relative flex justify-between items-center mb-2 px-0.5">
        {STAGES.map((seconds, idx) => {
          const isUnlocked = idx <= currentStage;
          const isCurrent = idx === currentStage;

          return (
            <div
              key={seconds}
              className={`text-xs tracking-wider theme-transition ${
                isCurrent
                  ? 'font-bold'
                  : isUnlocked
                  ? 'text-neutral-200'
                  : 'text-neutral-600'
              }`}
              style={{
                color: isCurrent ? 'var(--accent)' : undefined,
              }}
            >
              {seconds}s
            </div>
          );
        })}
      </div>

      {/* 2. Track Line with Nodes */}
      <div className="relative h-4 flex items-center">
        {/* Background Track Line (dark gray) */}
        <div className="absolute left-1 right-1 h-[2.5px] bg-neutral-800 rounded-full" />

        {/* Unlocked Track Line */}
        <motion.div
          className="absolute left-1 h-[2.5px] rounded-full theme-transition"
          style={{
            backgroundColor: 'var(--accent)',
            boxShadow: '0 0 8px var(--accent-glow)',
          }}
          initial={false}
          animate={{ width: `${unlockedPercent}%` }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        />

        {/* Real-time Playback Line fill */}
        {isPlaying && (
          <div
            className="absolute left-1 h-[2.5px] bg-white rounded-full transition-none"
            style={{
              width: `${Math.min(unlockedPercent, activePlayheadPercent)}%`,
              boxShadow: '0 0 8px var(--accent)',
            }}
          />
        )}

        {/* Stage Node Dots */}
        <div className="relative w-full flex justify-between items-center">
          {STAGES.map((seconds, idx) => {
            const isUnlocked = idx <= currentStage;
            const isCurrent = idx === currentStage;

            return (
              <div
                key={seconds}
                className="relative flex items-center justify-center"
              >
                <div
                  className={`w-3 h-3 rounded-full z-10 flex items-center justify-center theme-transition ${
                    !isUnlocked ? 'bg-neutral-800' : ''
                  }`}
                  style={{
                    backgroundColor: isUnlocked ? 'var(--accent)' : undefined,
                    boxShadow: isCurrent ? '0 0 10px var(--accent)' : undefined,
                    outline: isCurrent ? '3px solid var(--accent-soft)' : undefined,
                  }}
                >
                  {isUnlocked && (
                    <div className="w-1 h-1 rounded-full bg-black/40" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
