import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RefreshCw, 
  AlertTriangle,
} from 'lucide-react';
import { Song } from '../types/song';
import { GameState, STAGES, Guess, DecadeFilter, GenreFilter } from '../types/game';
import { CATEGORY_THEMES } from '../types/theme';
import { musicService } from '../services/musicService';
import { audioService } from '../services/audioService';
import { gameService } from '../services/gameService';
import { DecadeSelector } from './DecadeSelector';
import { GenreSelector } from './GenreSelector';
import { AudioPlayer } from './AudioPlayer';
import { SongSearch } from './SongSearch';
import { GuessHistory } from './GuessHistory';
import { ResultCard } from './ResultCard';
import { AudioBackground } from './AudioBackground';

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentSong: null,
    currentStage: 0,
    guesses: [],
    status: 'loading',
    score: 0,
    decade: 'all',
    genres: ['all'],
  });

  const [playedSongIds, setPlayedSongIds] = useState<string[]>([]);
  const [initError, setInitError] = useState<string | null>(null);

  // Sync CSS variables with current category theme
  useEffect(() => {
    const theme = CATEGORY_THEMES[gameState.decade] || CATEGORY_THEMES.all;
    const root = document.documentElement;
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-rgb', theme.accentRgb);
    root.style.setProperty('--accent-hover', theme.accentHover);
    root.style.setProperty('--accent-soft', theme.accentSoft);
    root.style.setProperty('--accent-glow', theme.accentGlow);
    root.style.setProperty(
      '--accent-text-color',
      theme.textColorOnAccent === 'text-white' ? '#ffffff' : '#000000'
    );
  }, [gameState.decade]);

  // Initialize music catalog and select first song
  const initializeGame = useCallback(
    async (
      initialDecade: DecadeFilter = 'all',
      initialGenres: GenreFilter[] = ['all']
    ) => {
      setGameState((prev) => ({ ...prev, status: 'loading', errorMessage: undefined }));
      setInitError(null);

      try {
        const catalog = await musicService.loadInitialCatalog();

        if (catalog.length === 0) {
          throw new Error('Music catalog is empty. Please check your internet connection.');
        }

        const song = await musicService.getPlayableSongForRound([], initialDecade, initialGenres);
        if (!song) {
          throw new Error('Could not find playable songs for this selection.');
        }

        setPlayedSongIds([song.id]);
        setGameState({
          currentSong: song,
          currentStage: 0,
          guesses: [],
          status: 'ready',
          score: 0,
          decade: initialDecade,
          genres: initialGenres,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load music catalog';
        console.error('Initialization error:', err);
        setInitError(message);
        setGameState((prev) => ({ ...prev, status: 'error', errorMessage: message }));
      }
    },
    []
  );

  useEffect(() => {
    initializeGame('all', ['all']);
    return () => {
      audioService.stop();
    };
  }, [initializeGame]);

  // Handle Decade selection (preserves valid multi-selected genres)
  const handleSelectDecade = async (newDecade: DecadeFilter) => {
    if (newDecade === gameState.decade && gameState.currentSong) return;

    audioService.stop();

    // Check if currently selected genres still have playable songs in the new decade
    let validGenres = gameState.genres;
    if (!gameState.genres.includes('all')) {
      const filtered = gameState.genres.filter(
        (g) => musicService.getPlayableCount(newDecade, [g]) > 0
      );
      validGenres = filtered.length > 0 ? filtered : ['all'];
    }

    const song = await musicService.getPlayableSongForRound(playedSongIds, newDecade, validGenres);

    if (song) {
      setPlayedSongIds((prev) => [...prev, song.id]);
      setGameState((prev) => ({
        ...prev,
        currentSong: song,
        currentStage: 0,
        guesses: [],
        status: 'ready',
        score: 0,
        decade: newDecade,
        genres: validGenres,
      }));
    } else {
      // If all songs in session are exhausted, reset played history
      const freshSong = await musicService.getPlayableSongForRound([], newDecade, validGenres);
      if (freshSong) {
        setPlayedSongIds([freshSong.id]);
        setGameState((prev) => ({
          ...prev,
          currentSong: freshSong,
          currentStage: 0,
          guesses: [],
          status: 'ready',
          score: 0,
          decade: newDecade,
          genres: validGenres,
        }));
      }
    }
  };

  // Handle Multi-Select Genre toggling
  const handleToggleGenre = async (clickedGenre: GenreFilter) => {
    let newGenres: GenreFilter[];

    if (clickedGenre === 'all') {
      newGenres = ['all'];
    } else {
      if (gameState.genres.includes('all')) {
        // If ALL was active, disable ALL and activate clicked genre
        newGenres = [clickedGenre];
      } else if (gameState.genres.includes(clickedGenre)) {
        // If already active, remove it
        const remaining = gameState.genres.filter((g) => g !== clickedGenre);
        // If empty after deselecting, automatically return to ALL
        newGenres = remaining.length > 0 ? remaining : ['all'];
      } else {
        // Add to active genres
        newGenres = [...gameState.genres, clickedGenre];
      }
    }

    // Check if selection is effectively unchanged
    const isSame =
      newGenres.length === gameState.genres.length &&
      newGenres.every((g) => gameState.genres.includes(g));
    if (isSame && gameState.currentSong) return;

    audioService.stop();
    const song = await musicService.getPlayableSongForRound(playedSongIds, gameState.decade, newGenres);

    if (song) {
      setPlayedSongIds((prev) => [...prev, song.id]);
      setGameState((prev) => ({
        ...prev,
        currentSong: song,
        currentStage: 0,
        guesses: [],
        status: 'ready',
        score: 0,
        genres: newGenres,
      }));
    } else {
      const freshSong = await musicService.getPlayableSongForRound([], gameState.decade, newGenres);
      if (freshSong) {
        setPlayedSongIds([freshSong.id]);
        setGameState((prev) => ({
          ...prev,
          currentSong: freshSong,
          currentStage: 0,
          guesses: [],
          status: 'ready',
          score: 0,
          genres: newGenres,
        }));
      }
    }
  };

  // Move to next song in round after win/loss
  const handleNextSong = async () => {
    audioService.stop();

    const song = await musicService.getPlayableSongForRound(
      playedSongIds,
      gameState.decade,
      gameState.genres
    );
    if (!song) {
      const freshSong = await musicService.getPlayableSongForRound(
        [],
        gameState.decade,
        gameState.genres
      );
      if (freshSong) {
        setPlayedSongIds([freshSong.id]);
        setGameState((prev) => ({
          ...prev,
          currentSong: freshSong,
          currentStage: 0,
          guesses: [],
          status: 'ready',
          score: 0,
        }));
      }
      return;
    }

    setPlayedSongIds((prev) => [...prev, song.id]);
    setGameState((prev) => ({
      ...prev,
      currentSong: song,
      currentStage: 0,
      guesses: [],
      status: 'ready',
      score: 0,
    }));
  };

  // Seamless Gameplay Safety Net with Auto Re-Resolution
  const handleAudioFailure = useCallback(async () => {
    if (!gameState.currentSong) return;
    const failedSong = gameState.currentSong;

    // 1. Attempt to resolve a fresh preview URL if the preview expired
    try {
      const freshUrl = await musicService.resolveFreshPreviewUrl(failedSong);
      if (freshUrl && freshUrl !== failedSong.previewUrl) {
        setGameState((prev) => ({
          ...prev,
          currentSong: { ...failedSong, previewUrl: freshUrl },
        }));
        return;
      }
    } catch {
      // Continue to replacement fallback
    }

    // 2. If re-resolution fails or preview is permanently gone, reject and replace
    musicService.rejectSong(failedSong.id);

    const replacement = await musicService.getPlayableSongForRound(
      playedSongIds,
      gameState.decade,
      gameState.genres
    );
    if (replacement) {
      setPlayedSongIds((prev) => [...prev, replacement.id]);
      setGameState((prev) => ({
        ...prev,
        currentSong: replacement,
      }));
    }
  }, [gameState.currentSong, playedSongIds, gameState.decade, gameState.genres]);

  // Player selects a guess from autocomplete
  const handleSelectGuess = (selectedSong: Song) => {
    if (!gameState.currentSong || gameState.status !== 'ready') return;

    audioService.stop();

    const isCorrect = gameService.validateGuess(selectedSong.id, gameState.currentSong.id);
    const correctArtist =
      !isCorrect &&
      gameService.isArtistMatch(selectedSong.artist, gameState.currentSong.artist);

    const newGuess: Guess = {
      songId: selectedSong.id,
      title: selectedSong.title,
      artist: selectedSong.artist,
      correct: isCorrect,
      correctArtist,
      stageNumber: gameState.currentStage,
    };

    const updatedGuesses = [...gameState.guesses, newGuess];

    if (isCorrect) {
      const earnedScore = gameService.calculateScore(gameState.currentStage, true);
      setGameState((prev) => ({
        ...prev,
        guesses: updatedGuesses,
        status: 'won',
        score: earnedScore,
      }));
    } else {
      if (gameState.currentStage < STAGES.length - 1) {
        setGameState((prev) => ({
          ...prev,
          guesses: updatedGuesses,
          currentStage: prev.currentStage + 1,
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          guesses: updatedGuesses,
          status: 'lost',
          score: 0,
        }));
      }
    }
  };

  // Skip to next stage duration or end round
  const handleSkip = () => {
    if (!gameState.currentSong || gameState.status !== 'ready') return;

    audioService.stop();

    if (gameState.currentStage < STAGES.length - 1) {
      setGameState((prev) => ({
        ...prev,
        currentStage: prev.currentStage + 1,
      }));
    } else {
      // Skipped at 15s -> End round and reveal
      setGameState((prev) => ({
        ...prev,
        status: 'lost',
        score: 0,
      }));
    }
  };

  const isGameOver = gameState.status === 'won' || gameState.status === 'lost';
  const alreadyGuessedIds = gameState.guesses.map((g) => g.songId);

  return (
    <div className="relative min-h-screen bg-[#060709] text-neutral-100 py-6 sm:py-10 px-4 sm:px-6 font-sans flex flex-col justify-between items-center overflow-x-hidden theme-transition">
      {/* 1. Atmospheric Audio-Reactive Background Canvas */}
      <AudioBackground
        artworkUrl={gameState.currentSong?.artworkUrl}
        isResultRevealed={isGameOver}
        decade={gameState.decade}
      />

      {/* 2. Floating Desktop Genre Rail (Fixed Left - Zero Impact on Center Layout) */}
      {!isGameOver && (
        <aside
          id="desktop-genre-rail"
          className="hidden xl:flex fixed left-6 2xl:left-12 top-1/2 -translate-y-1/2 z-30 flex-col pointer-events-auto"
          aria-label="Genre Filters"
        >
          <GenreSelector
            selectedGenres={gameState.genres}
            selectedDecade={gameState.decade}
            onToggleGenre={handleToggleGenre}
            disabled={gameState.status === 'loading'}
            layoutMode="vertical"
          />
        </aside>
      )}

      {/* 3. Main Screen-Centered Game Container (Centering is Viewport-Aligned) */}
      <div className="relative z-10 w-full max-w-xl mx-auto flex-1 flex flex-col justify-between items-center">
        {/* Minimalist Top Header (Centered on Viewport Axis) */}
        <header className="w-full mb-5 sm:mb-6 flex items-center justify-center text-center">
          <div className="inline-flex items-center justify-center gap-2.5">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse theme-transition flex-shrink-0"
              style={{
                backgroundColor: 'var(--accent)',
                boxShadow: '0 0 12px var(--accent)',
              }}
            />
            <h1 className="text-xl font-black tracking-widest text-white uppercase select-none">
              MELODEX
            </h1>
          </div>
        </header>

        {/* Decade Selector */}
        {!isGameOver && (
          <div className="w-full mb-3">
            <DecadeSelector
              selectedDecade={gameState.decade}
              onSelectDecade={handleSelectDecade}
              disabled={gameState.status === 'loading'}
            />
          </div>
        )}

        {/* Mobile / Tablet Horizontal Genre Strip (Multi-Select, Hidden on XL where Rail is Fixed) */}
        {!isGameOver && (
          <div className="xl:hidden w-full mb-4">
            <GenreSelector
              selectedGenres={gameState.genres}
              selectedDecade={gameState.decade}
              onToggleGenre={handleToggleGenre}
              disabled={gameState.status === 'loading'}
              layoutMode="horizontal"
            />
          </div>
        )}

        {/* Loading State */}
        {gameState.status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="my-auto py-16 text-center"
          >
            <RefreshCw
              className="w-8 h-8 animate-spin mx-auto mb-3 theme-transition"
              style={{ color: 'var(--accent)' }}
            />
            <h2 className="text-base font-semibold text-white">Loading Melodex...</h2>
          </motion.div>
        )}

        {/* Error State */}
        {gameState.status === 'error' && (
          <div className="my-auto py-12 text-center">
            <AlertTriangle className="w-9 h-9 mx-auto text-rose-400 mb-2" />
            <h2 className="text-base font-bold text-white">Unable to Load Music</h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 mb-4">
              {initError || 'An error occurred while loading tracks.'}
            </p>
            <button
              id="retry-init-btn"
              onClick={() => initializeGame(gameState.decade, gameState.genres)}
              className="px-6 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-colors theme-transition"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-text-color)',
              }}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Dynamic Game View: Gameplay vs Centered Result */}
        <AnimatePresence mode="wait">
          {!isGameOver && gameState.status === 'ready' && gameState.currentSong && (
            <motion.main
              key="gameplay-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="w-full flex-1 flex flex-col justify-center my-auto"
            >
              {/* Audio Player Controls */}
              <AudioPlayer
                previewUrl={gameState.currentSong.previewUrl}
                previewStart={gameState.currentSong.previewStart ?? 0}
                currentStage={gameState.currentStage}
                disabled={false}
                onAudioError={handleAudioFailure}
              />

              {/* Song Search / Guess Field */}
              <SongSearch
                onSelectGuess={handleSelectGuess}
                onSkip={handleSkip}
                currentStage={gameState.currentStage}
                disabled={false}
                alreadyGuessedIds={alreadyGuessedIds}
                hasCorrectArtistGuess={gameState.guesses.some((g) => g.correctArtist && !g.correct)}
              />

              {/* Previous Wrong Guesses */}
              <GuessHistory
                guesses={gameState.guesses}
                currentStage={gameState.currentStage}
              />
            </motion.main>
          )}

          {isGameOver && gameState.currentSong && (
            <motion.main
              key="result-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full flex-1 flex flex-col justify-center items-center my-auto"
            >
              <ResultCard
                status={gameState.status as 'won' | 'lost'}
                currentSong={gameState.currentSong}
                currentStage={gameState.currentStage}
                score={gameState.score}
                onNextSong={handleNextSong}
              />
            </motion.main>
          )}
        </AnimatePresence>

        {/* Minimal Footer */}
        <footer className="mt-8 text-center text-xs text-neutral-600">
          <p>Melodex</p>
        </footer>
      </div>
    </div>
  );
};
