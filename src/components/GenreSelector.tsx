import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
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

  // Compute genre counts efficiently for the selected decade
  const genreCounts = useMemo(() => {
    return musicService.getGenreCountsForDecade(selectedDecade);
  }, [selectedDecade]);

  // Horizontal scroll container refs & state for visual discovery fades and smooth drag
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mouse drag support for desktop emulation & testing
  const isPointerDown = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScrollability();
    el.addEventListener('scroll', checkScrollability, { passive: true });
    window.addEventListener('resize', checkScrollability, { passive: true });
    return () => {
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [checkScrollability]);

  // Handle pointer down (mouse/touch drag for seamless swiping)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (layoutMode === 'vertical') return;
    isPointerDown.current = true;
    hasDragged.current = false;
    startX.current = e.pageX;
    startScrollLeft.current = scrollRef.current?.scrollLeft || 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown.current || !scrollRef.current) return;
    const dx = e.pageX - startX.current;
    if (Math.abs(dx) > 6) {
      hasDragged.current = true;
    }
    scrollRef.current.scrollLeft = startScrollLeft.current - dx;
  };

  const handlePointerUp = () => {
    isPointerDown.current = false;
  };

  const handlePointerCancel = () => {
    isPointerDown.current = false;
  };

  // Click handler that suppresses accidental clicks after dragging/swiping
  const handleGenreClick = (genre: GenreFilter) => {
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }
    onToggleGenre(genre);
  };

  if (layoutMode === 'vertical') {
    return (
      <nav
        id="genre-selector-vertical"
        aria-label="Genre Filters"
        className="flex flex-col gap-2.5 select-none w-44"
      >
        <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase px-1 mb-0.5">
          Genres
        </span>
        {GENRE_OPTIONS.map((option) => {
          const isAllOption = option.id === 'all';
          const isActive = isAllOption ? isAll : !isAll && selectedGenres.includes(option.id);
          const count = genreCounts[option.id] ?? 0;
          const isUnavailable = count === 0;

          return (
            <button
              key={option.id}
              id={`genre-filter-btn-${option.id}`}
              type="button"
              disabled={disabled || isUnavailable}
              onClick={() => handleGenreClick(option.id)}
              className={`group text-left text-xs sm:text-[13px] tracking-wider uppercase transition-all duration-150 focus:outline-none flex items-center justify-between py-0.5 px-1 select-none ${
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
              <div className="flex items-center gap-2 min-w-0">
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
                <span className="truncate">{option.label}</span>
              </div>
              <span
                className={`text-[11px] font-medium tracking-normal ml-2 select-none flex-shrink-0 transition-colors duration-150 ${
                  isActive
                    ? 'opacity-80'
                    : isUnavailable
                    ? 'text-neutral-800'
                    : 'text-neutral-600 group-hover:text-neutral-400'
                }`}
                style={{
                  color: isActive ? 'var(--accent)' : undefined,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </nav>
    );
  }

  // Horizontal Mobile / Tablet Swipeable Carousel
  return (
    <div
      id="genre-carousel-wrapper"
      className="relative w-full overflow-hidden select-none"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Left Edge Subtle Fade (indicates previous genres available) */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-6 z-20 pointer-events-none bg-gradient-to-r from-[#060709] to-transparent transition-opacity duration-200 ${
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Right Edge Subtle Fade (indicates more genres available) */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-8 z-20 pointer-events-none bg-gradient-to-l from-[#060709] to-transparent transition-opacity duration-200 ${
          canScrollRight ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Swipeable Scroll Container */}
      <div
        ref={scrollRef}
        id="genre-selector-horizontal"
        role="navigation"
        aria-label="Genre Filters Carousel"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="w-full flex items-center gap-2 overflow-x-auto py-1.5 px-2 select-none no-scrollbar touch-pan-x cursor-grab active:cursor-grabbing"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorX: 'contain',
        }}
      >
        {GENRE_OPTIONS.map((option) => {
          const isAllOption = option.id === 'all';
          const isActive = isAllOption ? isAll : !isAll && selectedGenres.includes(option.id);
          const count = genreCounts[option.id] ?? 0;
          const isUnavailable = count === 0;

          return (
            <button
              key={option.id}
              id={`genre-filter-btn-mobile-${option.id}`}
              type="button"
              disabled={disabled || isUnavailable}
              onClick={() => handleGenreClick(option.id)}
              className={`relative group flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-xl transition-all duration-150 focus:outline-none whitespace-nowrap select-none ${
                isActive
                  ? 'bg-neutral-900/90 border font-bold'
                  : isUnavailable
                  ? 'text-neutral-700 bg-neutral-950/40 border border-neutral-900 cursor-not-allowed opacity-40'
                  : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900/40 border border-neutral-800/40 hover:border-neutral-700/60'
              }`}
              style={{
                borderColor: isActive ? 'var(--accent)' : undefined,
                color: isActive ? 'var(--accent)' : undefined,
                textShadow: isActive ? '0 0 14px var(--accent-glow)' : undefined,
                boxShadow: isActive ? '0 0 10px var(--accent-glow)' : undefined,
              }}
            >
              <span className="relative z-10">{option.label}</span>
              <span
                className={`relative z-10 text-[11px] font-normal tracking-normal transition-colors duration-150 ${
                  isActive
                    ? 'opacity-80'
                    : isUnavailable
                    ? 'text-neutral-700'
                    : 'text-neutral-500 group-hover:text-neutral-400'
                }`}
                style={{
                  color: isActive ? 'var(--accent)' : undefined,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
