import React from 'react';
import { motion } from 'motion/react';
import { GenreFilter, GENRE_OPTIONS, DecadeFilter } from '../types/game';
import { musicService } from '../services/musicService';

interface GenreSelectorProps {
  selectedGenres: GenreFilter[];
  selectedDecade: DecadeFilter;
  onToggleGenre: (genre: GenreFilter) => void;
  disabled?: boolean;
  layoutMode?: 'horizontal' | 'vertical';
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({
  selectedGenres,
  selectedDecade,
  onToggleGenre,
  disabled = false,
  layoutMode = 'horizontal',
}) => {
  const isAll = selectedGenres.includes('all') || selectedGenres.length === 0;

  if (layoutMode === 'vertical') {
    return (
      <nav
        id="genre-selector-vertical"
        aria-label="Genre Filters"
        className="flex flex-col gap-2.5 select-none w-36"
      >
        <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase px-1 mb-0.5">
          Genres
        </span>
        {GENRE_OPTIONS.map((option) => {
          const isAllOption = option.id === 'all';
          const isActive = isAllOption ? isAll : !isAll && selectedGenres.includes(option.id);
          const availableCount = musicService.getPlayableCount(selectedDecade, option.id);
          const isUnavailable = availableCount === 0;

          return (
            <button
              key={option.id}
              id={`genre-filter-btn-${option.id}`}
              type="button"
              disabled={disabled || (isUnavailable && !isActive)}
              onClick={() => onToggleGenre(option.id)}
              className={`group text-left text-xs sm:text-[13px] tracking-wider uppercase transition-all duration-150 focus:outline-none flex items-center gap-2 py-0.5 px-1 select-none ${
                isActive
                  ? 'font-bold'
                  : isUnavailable
                  ? 'text-neutral-700 cursor-not-allowed opacity-30'
                  : 'text-neutral-500 hover:text-neutral-200'
              }`}
              style={{
                color: isActive ? 'var(--accent)' : undefined,
                textShadow: isActive ? '0 0 16px var(--accent-glow)' : undefined,
              }}
            >
              {isActive && (
                <motion.span
                  layoutId={`active-dot-${option.id}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 theme-transition"
                  style={{
                    backgroundColor: 'var(--accent)',
                    boxShadow: '0 0 8px var(--accent)',
                  }}
                />
              )}
              <span>{option.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  // Horizontal mobile/tablet strip
  return (
    <nav
      id="genre-selector-horizontal"
      aria-label="Genre Filters"
      className="w-full flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5 px-0.5 select-none no-scrollbar"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {GENRE_OPTIONS.map((option) => {
        const isAllOption = option.id === 'all';
        const isActive = isAllOption ? isAll : !isAll && selectedGenres.includes(option.id);
        const availableCount = musicService.getPlayableCount(selectedDecade, option.id);
        const isUnavailable = availableCount === 0;

        return (
          <button
            key={option.id}
            id={`genre-filter-btn-mobile-${option.id}`}
            type="button"
            disabled={disabled || (isUnavailable && !isActive)}
            onClick={() => onToggleGenre(option.id)}
            className={`relative group flex items-center px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-all duration-200 focus:outline-none whitespace-nowrap select-none ${
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
            {isActive && (
              <motion.span
                layoutId={`active-genre-indicator-mobile-${option.id}`}
                className="absolute inset-0 rounded-lg bg-neutral-900/80 border theme-transition -z-10"
                style={{
                  boxShadow: '0 0 12px var(--accent-glow)',
                  borderColor: 'var(--accent)',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 tracking-wide">{option.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
