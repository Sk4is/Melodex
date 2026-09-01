import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, UserCheck } from 'lucide-react';
import { Guess, STAGES } from '../types/game';

interface GuessHistoryProps {
  guesses: Guess[];
  currentStage: number;
}

export const GuessHistory: React.FC<GuessHistoryProps> = ({
  guesses,
  currentStage,
}) => {
  if (guesses.length === 0) {
    return null;
  }

  return (
    <div id="guess-history-list" className="w-full mt-4 select-none">
      <ul className="space-y-1.5">
        <AnimatePresence initial={false}>
          {guesses.map((guess, index) => {
            const snippetDuration = STAGES[guess.stageNumber] ?? 0.5;

            return (
              <motion.li
                key={`${guess.songId}-${index}`}
                id={`guess-history-item-${index}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`py-2 px-3.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  guess.correct
                    ? 'bg-neutral-900/80 text-white'
                    : guess.correctArtist
                    ? 'bg-neutral-900/80 text-neutral-200 border border-neutral-800'
                    : 'bg-neutral-900/60 text-neutral-300'
                }`}
                style={{
                  borderLeft: guess.correct
                    ? '3px solid var(--accent)'
                    : guess.correctArtist
                    ? '3px solid var(--accent)'
                    : undefined,
                  boxShadow: guess.correctArtist
                    ? '0 0 12px -4px var(--accent-glow)'
                    : undefined,
                }}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {guess.correct ? (
                    <Check
                      className="w-3.5 h-3.5 flex-shrink-0 theme-transition"
                      style={{ color: 'var(--accent)' }}
                    />
                  ) : guess.correctArtist ? (
                    <UserCheck
                      className="w-3.5 h-3.5 flex-shrink-0 theme-transition"
                      style={{ color: 'var(--accent)' }}
                    />
                  ) : (
                    <X className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                  )}
                  <div className="truncate flex items-center gap-1.5">
                    <span className="font-medium text-white truncate">{guess.title}</span>
                    <span className="text-neutral-400 truncate">— {guess.artist}</span>
                    {guess.correctArtist && !guess.correct && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 theme-transition"
                        style={{
                          backgroundColor: 'var(--accent-soft)',
                          color: 'var(--accent)',
                        }}
                      >
                        Correct artist
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-[11px] font-mono text-neutral-500 flex-shrink-0 ml-2">
                  {snippetDuration}s
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
};

