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
    genre: 'all',
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
    async (initialDecade: DecadeFilter = 'all', initialGenre: GenreFilter = 'all') => {
      setGameState((prev) => ({ ...prev, status: 'loading', errorMessage: undefined }));
      setInitError(null);

      try {
        const catalog = await musicService.loadInitialCatalog();

        if (catalog.length === 0) {
          throw new Error('Music catalog is empty. Please check your internet connection.');
        }

        const song = musicService.getRandomSong([], initialDecade, initialGenre);
        if (!song) {
          throw new Error('Could not find songs for this selection.');
        }

        setPlayedSongIds([song.id]);
        setGameState({
          currentSong: song,
          currentStage: 0,
          guesses: [],
          status: 'ready',
          score: 0,
          decade: initialDecade,
          genre: initialGenre,
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
    initializeGame('all', 'all');
    return () => {
      audioService.stop();
    };
  }, [initializeGame]);

  // Handle Decade selection
  const handleSelectDecade = (newDecade: DecadeFilter) => {
    if (newDecade === gameState.decade && gameState.currentSong) return;

    audioService.stop();
    const song = musicService.getRandomSong(playedSongIds, newDecade, gameState.genre);

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
      }));
    } else {
      // If all songs in session are exhausted, reset played history
      const freshSong = musicService.getRandomSong([], newDecade, gameState.genre);
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
        }));
      }
    }
  };

  // Handle Genre selection
  const handleSelectGenre = (newGenre: GenreFilter) => {
    if (newGenre === gameState.genre && gameState.currentSong) return;

    audioService.stop();
    const song = musicService.getRandomSong(playedSongIds, gameState.decade, newGenre);

    if (song) {
      setPlayedSongIds((prev) => [...prev, song.id]);
      setGameState((prev) => ({
        ...prev,
        currentSong: song,
        currentStage: 0,
        guesses: [],
        status: 'ready',
        score: 0,
        genre: newGenre,
      }));
    } else {
      const freshSong = musicService.getRandomSong([], gameState.decade, newGenre);
      if (freshSong) {
        setPlayedSongIds([freshSong.id]);
        setGameState((prev) => ({
          ...prev,
          currentSong: freshSong,
          currentStage: 0,
          guesses: [],
          status: 'ready',
          score: 0,
          genre: newGenre,
        }));
      }
    }
  };

  // Next Song transition (resets progression, guesses, audio, and loads new song)
  const handleNextSong = () => {
    audioService.stop();

    const song = musicService.getRandomSong(
      playedSongIds,
      gameState.decade,
      gameState.genre
    );
    if (!song) {
      const freshSong = musicService.getRandomSong(
        [],
        gameState.decade,
        gameState.genre
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

  // Seamless Gameplay Safety Net:
  // If an audio stream ever fails at runtime, silently blacklist it and pick another verified track
  const handleAudioFailure = useCallback(() => {
    if (!gameState.currentSong) return;
    const failedSongId = gameState.currentSong.id;
    musicService.rejectSong(failedSongId);

    const replacement = musicService.getRandomSong(
      playedSongIds,
      gameState.decade,
      gameState.genre
    );
    if (replacement) {
      setPlayedSongIds((prev) => [...prev, replacement.id]);
      setGameState((prev) => ({
        ...prev,
        currentSong: replacement,
      }));
    }
  }, [gameState.currentSong, playedSongIds, gameState.decade, gameState.genre]);

  // Player selects a guess from autocomplete
  const handleSelectGuess = (selectedSong: Song) => {
    if (!gameState.currentSong || gameState.status !== 'ready') return;

    audioService.stop();

    const isCorrect = gameService.validateGuess(selectedSong.id, gameState.currentSong.id);
    const newGuess: Guess = {
      songId: selectedSong.id,
      title: selectedSong.title,
      artist: selectedSong.artist,
      correct: isCorrect,
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

      {/* Main Responsive Grid Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex-1 flex flex-col justify-between">
        {/* Minimalist Top Header */}
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse theme-transition"
              style={{
                backgroundColor: 'var(--accent)',
                boxShadow: '0 0 12px var(--accent)',
              }}
            />
            <h1 className="text-xl font-black tracking-widest text-white uppercase">
              MELODEX
            </h1>
          </div>
        </header>

        {/* Content Layout: Desktop Left Rail + Central Game Board */}
        <div className="w-full flex-1 flex flex-col lg:flex-row items-stretch lg:items-start gap-6 lg:gap-10">
          {/* Desktop Left Rail: Genre Filter Navigation */}
          {!isGameOver && (
            <aside className="hidden lg:flex flex-col w-48 shrink-0 pt-1">
              <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-3 px-3">
                Genres
              </div>
              <GenreSelector
                selectedGenre={gameState.genre}
                selectedDecade={gameState.decade}
                onSelectGenre={handleSelectGenre}
                disabled={gameState.status === 'loading'}
                layoutMode="vertical"
              />
            </aside>
          )}

          {/* Central Gameplay Area (max-w-2xl) */}
          <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col justify-between">
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

            {/* Mobile / Tablet Horizontal Genre Strip */}
            {!isGameOver && (
              <div className="lg:hidden w-full mb-4">
                <GenreSelector
                  selectedGenre={gameState.genre}
                  selectedDecade={gameState.decade}
                  onSelectGenre={handleSelectGenre}
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
                  onClick={() => initializeGame(gameState.decade, gameState.genre)}
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
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="mt-8 text-center text-xs text-neutral-600">
          <p>Melodex</p>
        </footer>
      </div>
    </div>
  );
};

