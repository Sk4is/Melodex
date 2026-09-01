import React from 'react';
import { motion } from 'motion/react';
import { GenreFilter, GENRE_OPTIONS, DecadeFilter } from '../types/game';
import { musicService } from '../services/musicService';

interface GenreSelectorProps {
  selectedGenre: GenreFilter;
  selectedDecade: DecadeFilter;
  onSelectGenre: (genre: GenreFilter) => void;
  disabled?: boolean;
  layoutMode?: 'horizontal' | 'vertical';
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({
  selectedGenre,
  selectedDecade,
  onSelectGenre,
  disabled = false,
  layoutMode = 'horizontal',
}) => {
  return (
    <nav
      id={`genre-selector-${layoutMode}`}
      aria-label="Music Genres"
      className={
        layoutMode === 'vertical'
          ? 'w-full flex flex-col gap-1 py-1'
          : 'w-full flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5 px-0.5 select-none no-scrollbar'
      }
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {GENRE_OPTIONS.map((option) => {
        const isActive = selectedGenre === option.id;
        const availableCount = musicService.getPlayableCount(selectedDecade, option.id);
        const isUnavailable = availableCount === 0;

        return (
          <button
            key={option.id}
            id={`genre-filter-btn-${option.id}`}
            type="button"
            disabled={disabled || (isUnavailable && !isActive)}
            onClick={() => onSelectGenre(option.id)}
            className={`relative group flex items-center transition-all duration-200 focus:outline-none whitespace-nowrap select-none ${
              layoutMode === 'vertical'
                ? 'w-full px-3.5 py-2 text-left text-sm font-medium rounded-xl'
                : 'px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg'
            } ${
              isActive
                ? 'font-bold'
                : isUnavailable
                ? 'text-neutral-700 cursor-not-allowed opacity-40'
                : 'text-neutral-500 hover:text-neutral-200'
            }`}
            style={{
              color: isActive ? 'var(--accent)' : undefined,
              textShadow: isActive ? '0 0 16px var(--accent-glow)' : undefined,
            }}
          >
            {/* Active Pill / Dot indicator */}
            {isActive && (
              <motion.span
                layoutId={`active-genre-indicator-${layoutMode}`}
                className={
                  layoutMode === 'vertical'
                    ? 'absolute left-0 w-1 h-5 rounded-r-full theme-transition'
                    : 'absolute inset-0 rounded-lg bg-neutral-900/80 border border-neutral-800 theme-transition -z-10'
                }
                style={{
                  backgroundColor: layoutMode === 'vertical' ? 'var(--accent)' : undefined,
                  boxShadow:
                    layoutMode === 'vertical'
                      ? '0 0 10px var(--accent)'
                      : '0 0 12px var(--accent-glow)',
                  borderColor: layoutMode === 'horizontal' ? 'var(--accent)' : undefined,
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}

            <span className="relative z-10 tracking-wide flex items-center gap-1.5">
              <span>{option.label}</span>
              {layoutMode === 'vertical' && option.id !== 'all' && (
                <span className="text-[11px] font-normal text-neutral-600 ml-auto tabular-nums">
                  {availableCount}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
