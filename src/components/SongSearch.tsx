import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Music, X, FastForward, Check } from 'lucide-react';
import { Song } from '../types/song';
import { musicService } from '../services/musicService';
import { STAGES } from '../types/game';

interface SongSearchProps {
  onSelectGuess: (song: Song) => void;
  onSkip: () => void;
  currentStage: number;
  disabled?: boolean;
  alreadyGuessedIds: string[];
  hasCorrectArtistGuess?: boolean;
}

export const SongSearch: React.FC<SongSearchProps> = ({
  onSelectGuess,
  onSkip,
  currentStage,
  disabled = false,
  alreadyGuessedIds,
  hasCorrectArtistGuess = false,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [hasUserEditedAfterSelection, setHasUserEditedAfterSelection] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search query
  useEffect(() => {
    // If user has a confirmed selection and has not edited the text, do NOT search or reopen dropdown
    if (selectedSong !== null && !hasUserEditedAfterSelection) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await musicService.searchSongs(trimmed, 8);
        setSuggestions(results);
        // Autocomplete should ONLY show if there is no selected song and we have results
        if (results.length > 0 && selectedSong === null) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Song search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, selectedSong, hasUserEditedAfterSelection]);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setQuery(`${song.title} — ${song.artist}`);
    setSuggestions([]);
    setIsOpen(false);
    setHasUserEditedAfterSelection(false);
    setSelectedIndex(-1);

    if (alreadyGuessedIds.includes(song.id)) {
      setDuplicateWarning(true);
    } else {
      setDuplicateWarning(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedSong(null);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setHasUserEditedAfterSelection(true);
    setDuplicateWarning(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter' && selectedSong && !disabled && !duplicateWarning) {
        e.preventDefault();
        handleSubmit();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSong(suggestions[selectedIndex]);
      } else if (suggestions.length > 0 && selectedIndex === -1) {
        handleSelectSong(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedSong || disabled) return;

    if (alreadyGuessedIds.includes(selectedSong.id)) {
      setDuplicateWarning(true);
      return;
    }

    onSelectGuess(selectedSong);
    setSelectedSong(null);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setHasUserEditedAfterSelection(false);
    setDuplicateWarning(false);
  };

  const nextStageDuration =
    currentStage < STAGES.length - 1 ? STAGES[currentStage + 1] : null;

  return (
    <div
      id="song-search-section"
      ref={containerRef}
      className="w-full mt-4 mb-2"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Search Input Container */}
        <div className="relative w-full">
          <div className="relative flex items-center">
            <Search className="absolute left-4.5 w-5 h-5 text-neutral-500 pointer-events-none" />
            <input
              id="song-search-input"
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                setHasUserEditedAfterSelection(true);
                if (selectedSong) {
                  setSelectedSong(null);
                  setDuplicateWarning(false);
                }
              }}
              onFocus={() => {
                if (
                  hasUserEditedAfterSelection &&
                  !selectedSong &&
                  suggestions.length > 0 &&
                  query.trim()
                ) {
                  setIsOpen(true);
                }
              }}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Guess the Song..."
              autoComplete="off"
              className="w-full pl-12 pr-11 py-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl text-base font-medium text-white placeholder:text-neutral-500 focus:outline-none transition-all disabled:opacity-50 theme-transition"
              style={{
                borderColor: isOpen ? 'var(--accent)' : undefined,
                boxShadow: isOpen ? '0 0 0 1px var(--accent-soft)' : undefined,
              }}
            />
            {query && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="absolute right-4 text-neutral-500 hover:text-white transition-colors p-1"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {isOpen && suggestions.length > 0 && !selectedSong && (
              <motion.div
                id="search-suggestions-dropdown"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-2 bg-neutral-900/95 border border-neutral-800 rounded-2xl shadow-2xl backdrop-blur-xl max-h-64 overflow-y-auto z-50 divide-y divide-neutral-800/60"
              >
                {suggestions.map((song, index) => {
                  const isGuessed = alreadyGuessedIds.includes(song.id);
                  const isHighlighted = selectedIndex === index;

                  return (
                    <div
                      key={song.id}
                      id={`suggestion-item-${song.id}`}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        handleSelectSong(song);
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelectSong(song);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`p-3.5 flex items-center justify-between cursor-pointer text-left transition-colors duration-150 select-none ${
                        isHighlighted
                          ? 'bg-neutral-800 text-white'
                          : 'hover:bg-neutral-800/60 text-neutral-200'
                      } ${isGuessed ? 'opacity-40' : ''}`}
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        {song.artworkUrl ? (
                          <img
                            src={song.artworkUrl}
                            alt={song.title}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-neutral-800"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center flex-shrink-0 text-neutral-500">
                            <Music className="w-5 h-5" />
                          </div>
                        )}
                        <div className="truncate">
                          <div className="font-semibold text-sm sm:text-base text-white truncate">
                            {song.title}
                          </div>
                          <div className="text-xs sm:text-sm text-neutral-400 truncate">
                            {song.artist} {song.year ? `• ${song.year}` : ''}
                          </div>
                        </div>
                      </div>

                      {isGuessed && (
                        <span className="text-[10px] uppercase font-mono text-neutral-500 px-2 py-0.5 rounded bg-neutral-800 flex-shrink-0 ml-2">
                          Guessed
                        </span>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected confirmation */}
        {selectedSong && !duplicateWarning && (
          <div
            className="text-xs sm:text-sm flex items-center gap-1.5 px-1 theme-transition"
            style={{ color: 'var(--accent)' }}
          >
            <Check className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              Selected: <strong className="font-semibold text-white">{selectedSong.title}</strong> by {selectedSong.artist}
            </span>
          </div>
        )}

        {/* Subtle Correct Artist Feedback Banner */}
        <AnimatePresence>
          {hasCorrectArtistGuess && !selectedSong && !duplicateWarning && (
            <motion.div
              id="correct-artist-banner"
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-semibold theme-transition"
              style={{
                backgroundColor: 'var(--accent-soft)',
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
                boxShadow: '0 0 16px -2px var(--accent-glow)',
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-ping flex-shrink-0"
                style={{ backgroundColor: 'var(--accent)' }}
              />
              <span>Correct artist</span>
            </motion.div>
          )}
        </AnimatePresence>

        {duplicateWarning && (
          <div className="text-xs sm:text-sm text-amber-400 bg-amber-950/20 px-3.5 py-2 rounded-xl border border-amber-800/30">
            You already tried this song in this round.
          </div>
        )}

        {/* Action Row: GUESS and SKIP side-by-side */}
        <div className="flex items-center gap-3 pt-1">
          {/* Primary Guess Button */}
          <motion.button
            id="submit-guess-btn"
            type="submit"
            disabled={disabled || !selectedSong || duplicateWarning}
            whileHover={{ scale: disabled || !selectedSong ? 1 : 1.02 }}
            whileTap={{ scale: disabled || !selectedSong ? 1 : 0.98 }}
            className="flex-1 py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm sm:text-base tracking-wider shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed theme-transition"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-text-color)',
              boxShadow: '0 4px 14px var(--accent-glow)',
            }}
          >
            GUESS
          </motion.button>

          {/* Secondary Skip Button */}
          <motion.button
            id="skip-stage-btn"
            type="button"
            onClick={onSkip}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className="flex-1 py-3.5 sm:py-4 px-5 rounded-2xl font-semibold text-sm sm:text-base tracking-wide bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FastForward className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
            <span>
              {nextStageDuration !== null
                ? `SKIP (${nextStageDuration}s)`
                : 'SKIP & REVEAL'}
            </span>
          </motion.button>
        </div>
      </form>
    </div>
  );
};
