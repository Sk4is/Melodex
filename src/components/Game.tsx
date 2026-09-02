import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RefreshCw, 
  AlertTriangle,
  Music,
} from 'lucide-react';
import { Song } from '../types/song';
import { GameState, STAGES, Guess, DecadeFilter, GenreFilter } from '../types/game';
import { CATEGORY_THEMES } from '../types/theme';
import { musicService } from '../services/musicService';
import { audioService } from '../services/audioService';
import { gameService } from '../services/gameService';
import { isTrackEligibleForFilters } from '../utils/genreUtils';
import { DecadeSelector } from './DecadeSelector';
import { GenreSelector } from './GenreSelector';
import { AudioPlayer } from './AudioPlayer';
import { SongSearch } from './SongSearch';
import { GuessHistory } from './GuessHistory';
import { ResultCard } from './ResultCard';
import { AudioBackground } from './AudioBackground';
import { VisualCustomizationPanel } from './VisualCustomizationPanel';
import { StreakIndicator } from './StreakIndicator';
import { useVisuals } from '../context/VisualContext';

function generateRoundId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `round-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const Game: React.FC = () => {
  const { settings, isPlayingAudio, triggerRoundShuffle } = useVisuals();
  
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialRoundId = generateRoundId();
    return {
      roundId: initialRoundId,
      roundState: 'loading',
      currentSong: null,
      revealedSong: null,
      nextSongCandidate: null,
      roundAnswerSongId: null,
      currentStage: 0,
      guesses: [],
      status: 'loading',
      score: 0,
      decade: 'all',
      genres: ['all'],
    };
  });

  const [playedSongIds, setPlayedSongIds] = useState<string[]>([]);
  const [initError, setInitError] = useState<string | null>(null);

  // Guess Streak State (Session-based, persists across next song and filter changes)
  const [streak, setStreak] = useState<number>(0);
  const [isStreakBroken, setIsStreakBroken] = useState<boolean>(false);
  const lastIncrementedRoundIdRef = useRef<string | null>(null);
  const lastFailedRoundIdRef = useRef<string | null>(null);
  const streakTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (streakTimeoutRef.current) {
        clearTimeout(streakTimeoutRef.current);
      }
    };
  }, []);

  const handleStreakBreakComplete = useCallback(() => {
    setIsStreakBroken(false);
    setStreak(0);
  }, []);

  const filterGenerationRef = useRef(0);
  const activeRoundIdRef = useRef(gameState.roundId);
  const nextSongCandidateRef = useRef<Song | null>(null);
  const isPreparingNextRef = useRef<boolean>(false);

  // Sync active round ID ref and active song with musicService
  useEffect(() => {
    activeRoundIdRef.current = gameState.roundId;
    musicService.setActiveRoundSong(gameState.currentSong?.id || null);
  }, [gameState.roundId, gameState.currentSong?.id]);

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

  // Out-of-band next song preparation during reveal screen
  const prepareNextSongCandidate = useCallback(
    async (
      prepRoundId: string,
      prepFilterGen: number,
      excludeIds: string[],
      decade: DecadeFilter,
      genres: GenreFilter[]
    ) => {
      if (isPreparingNextRef.current) return;
      isPreparingNextRef.current = true;
      nextSongCandidateRef.current = null;

      try {
        const candidate = await musicService.getPlayableSongForRound(
          excludeIds,
          decade,
          genres,
          20,
          () =>
            filterGenerationRef.current !== prepFilterGen ||
            activeRoundIdRef.current !== prepRoundId
        );

        if (
          filterGenerationRef.current !== prepFilterGen ||
          activeRoundIdRef.current !== prepRoundId
        ) {
          return;
        }

        if (candidate) {
          nextSongCandidateRef.current = candidate;
          setGameState((prev) => {
            if (prev.roundId !== prepRoundId) return prev;
            return { ...prev, nextSongCandidate: candidate };
          });
          // Background audio preload (isolated, non-blocking)
          if (candidate.previewUrl) {
            audioService.preloadAudio(candidate.previewUrl).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Background candidate preparation failed:', err);
      } finally {
        isPreparingNextRef.current = false;
      }
    },
    []
  );

  // Initialize music catalog and select first song
  const initializeGame = useCallback(
    async (
      initialDecade: DecadeFilter = 'all',
      initialGenres: GenreFilter[] = ['all']
    ) => {
      const gen = ++filterGenerationRef.current;
      const newRoundId = generateRoundId();
      activeRoundIdRef.current = newRoundId;
      nextSongCandidateRef.current = null;

      setGameState((prev) => ({
        ...prev,
        roundId: newRoundId,
        roundState: 'loading',
        status: 'loading',
        errorMessage: undefined,
        currentSong: null,
        revealedSong: null,
        nextSongCandidate: null,
        roundAnswerSongId: null,
        guesses: [],
        currentStage: 0,
      }));
      setInitError(null);
      triggerRoundShuffle();

      try {
        const catalog = await musicService.loadInitialCatalog();

        if (catalog.length === 0) {
          throw new Error('Music catalog is empty. Please check your internet connection.');
        }

        const song = await musicService.getPlayableSongForRound(
          [],
          initialDecade,
          initialGenres,
          20,
          () => filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId
        );
        if (filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId) return;

        if (!song) {
          setGameState({
            roundId: newRoundId,
            roundState: 'playing',
            currentSong: null,
            revealedSong: null,
            nextSongCandidate: null,
            roundAnswerSongId: null,
            currentStage: 0,
            guesses: [],
            status: 'ready',
            score: 0,
            decade: initialDecade,
            genres: initialGenres,
          });
          return;
        }

        setPlayedSongIds([song.id]);
        setGameState({
          roundId: newRoundId,
          roundState: 'playing',
          currentSong: song,
          revealedSong: null,
          nextSongCandidate: null,
          roundAnswerSongId: song.id,
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
    [triggerRoundShuffle]
  );

  useEffect(() => {
    initializeGame('all', ['all']);
    return () => {
      audioService.stop();
    };
  }, [initializeGame]);

  // Handle Reset Filters to Any Year + All Genres
  const handleResetFilters = async () => {
    audioService.stop();
    triggerRoundShuffle();

    const gen = ++filterGenerationRef.current;
    const newRoundId = generateRoundId();
    activeRoundIdRef.current = newRoundId;
    nextSongCandidateRef.current = null;
    musicService.invalidateSessionDeck();

    setGameState((prev) => ({
      ...prev,
      roundId: newRoundId,
      roundState: 'loading',
      status: 'loading',
      currentSong: null,
      revealedSong: null,
      nextSongCandidate: null,
      roundAnswerSongId: null,
      currentStage: 0,
      guesses: [],
      decade: 'all',
      genres: ['all'],
    }));

    const song = await musicService.getPlayableSongForRound(
      playedSongIds,
      'all',
      ['all'],
      20,
      () => filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId
    );
    if (filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId) return;

    if (song) {
      setPlayedSongIds((prev) => [...prev, song.id]);
      setGameState((prev) => ({
        ...prev,
        roundId: newRoundId,
        roundState: 'playing',
        currentSong: song,
        revealedSong: null,
        nextSongCandidate: null,
        roundAnswerSongId: song.id,
        currentStage: 0,
        guesses: [],
        status: 'ready',
        score: 0,
        decade: 'all',
        genres: ['all'],
      }));
    } else {
      const freshSong = await musicService.getPlayableSongForRound(
        [],
        'all',
        ['all'],
        20,
        () => filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId
      );
      if (filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId) return;

      if (freshSong) {
        setPlayedSongIds([freshSong.id]);
        setGameState((prev) => ({
          ...prev,
          roundId: newRoundId,
          roundState: 'playing',
          currentSong: freshSong,
          revealedSong: null,
          nextSongCandidate: null,
          roundAnswerSongId: freshSong.id,
          currentStage: 0,
          guesses: [],
          status: 'ready',
          score: 0,
          decade: 'all',
          genres: ['all'],
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          roundId: newRoundId,
          roundState: 'playing',
          currentSong: null,
          revealedSong: null,
          nextSongCandidate: null,
          roundAnswerSongId: null,
          currentStage: 0,
          guesses: [],
          status: 'ready',
          score: 0,
          decade: 'all',
          genres: ['all'],
        }));
      }
    }
  };

  // Handle Decade selection (preserves valid multi-selected genres)
  const handleSelectDecade = async (newDecade: DecadeFilter) => {
    if (newDecade === gameState.decade && gameState.currentSong) return;

    audioService.stop();
    triggerRoundShuffle();

    const gen = ++filterGenerationRef.current;
    const newRoundId = generateRoundId();
    activeRoundIdRef.current = newRoundId;
    nextSongCandidateRef.current = null;
    musicService.invalidateSessionDeck();

    const activeGenres = gameState.genres;

    setGameState((prev) => ({
      ...prev,
      roundId: newRoundId,
      roundState: 'loading',
      status: 'loading',
      currentSong: null,
      revealedSong: null,
      nextSongCandidate: null,
      roundAnswerSongId: null,
      currentStage: 0,
      guesses: [],
      decade: newDecade,
      genres: activeGenres,
    }));

    const song = await musicService.getPlayableSongForRound(
      playedSongIds,
      newDecade,
      activeGenres,
      20,
      () => filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId
    );
    if (filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId) return;

    if (song) {
      setPlayedSongIds((prev) => [...prev, song.id]);
      setGameState((prev) => ({
        ...prev,
        roundId: newRoundId,
        roundState: 'playing',
        currentSong: song,
        revealedSong: null,
        nextSongCandidate: null,
        roundAnswerSongId: song.id,
        currentStage: 0,
        guesses: [],
        status: 'ready',
        score: 0,
        decade: newDecade,
        genres: activeGenres,
      }));
    } else {
      const freshSong = await musicService.getPlayableSongForRound(
        [],
        newDecade,
        activeGenres,
        20,
        () => filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId
      );
      if (filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId) return;

      if (freshSong) {
        setPlayedSongIds([freshSong.id]);
        setGameState((prev) => ({
          ...prev,
          roundId: newRoundId,
          roundState: 'playing',
          currentSong: freshSong,
          revealedSong: null,
          nextSongCandidate: null,
          roundAnswerSongId: freshSong.id,
          currentStage: 0,
          guesses: [],
          status: 'ready',
          score: 0,
          decade: newDecade,
          genres: activeGenres,
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          roundId: newRoundId,
          roundState: 'playing',
          currentSong: null,
          revealedSong: null,
          nextSongCandidate: null,
          roundAnswerSongId: null,
          currentStage: 0,
          guesses: [],
          status: 'ready',
          score: 0,
          decade: newDecade,
          genres: activeGenres,
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
        newGenres = [clickedGenre];
      } else if (gameState.genres.includes(clickedGenre)) {
        const remaining = gameState.genres.filter((g) => g !== clickedGenre);
        newGenres = remaining.length > 0 ? remaining : ['all'];
      } else {
        newGenres = [...gameState.genres, clickedGenre];
      }
    }

    const isSame =
      newGenres.length === gameState.genres.length &&
      newGenres.every((g) => gameState.genres.includes(g));
    if (isSame && gameState.currentSong) return;

    audioService.stop();
    triggerRoundShuffle();

    const gen = ++filterGenerationRef.current;
    const newRoundId = generateRoundId();
    activeRoundIdRef.current = newRoundId;
    nextSongCandidateRef.current = null;
    musicService.invalidateSessionDeck();

    setGameState((prev) => ({
      ...prev,
      roundId: newRoundId,
      roundState: 'loading',
      status: 'loading',
      currentSong: null,
      revealedSong: null,
      nextSongCandidate: null,
      roundAnswerSongId: null,
      currentStage: 0,
      guesses: [],
      genres: newGenres,
    }));

    const song = await musicService.getPlayableSongForRound(
      playedSongIds,
      gameState.decade,
      newGenres,
      20,
      () => filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId
    );
    if (filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId) return;

    if (song) {
      setPlayedSongIds((prev) => [...prev, song.id]);
      setGameState((prev) => ({
        ...prev,
        roundId: newRoundId,
        roundState: 'playing',
        currentSong: song,
        revealedSong: null,
        nextSongCandidate: null,
        roundAnswerSongId: song.id,
        currentStage: 0,
        guesses: [],
        status: 'ready',
        score: 0,
        genres: newGenres,
      }));
    } else {
      const freshSong = await musicService.getPlayableSongForRound(
        [],
        gameState.decade,
        newGenres,
        20,
        () => filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId
      );
      if (filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId) return;

      if (freshSong) {
        setPlayedSongIds([freshSong.id]);
        setGameState((prev) => ({
          ...prev,
          roundId: newRoundId,
          roundState: 'playing',
          currentSong: freshSong,
          revealedSong: null,
          nextSongCandidate: null,
          roundAnswerSongId: freshSong.id,
          currentStage: 0,
          guesses: [],
          status: 'ready',
          score: 0,
          genres: newGenres,
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          roundId: newRoundId,
          roundState: 'playing',
          currentSong: null,
          revealedSong: null,
          nextSongCandidate: null,
          roundAnswerSongId: null,
          currentStage: 0,
          guesses: [],
          status: 'ready',
          score: 0,
          genres: newGenres,
        }));
      }
    }
  };

  // Move to next song in round after win/loss when user clicks NEXT
  const handleNextSong = async () => {
    audioService.stop();
    triggerRoundShuffle();

    if (isStreakBroken) {
      setIsStreakBroken(false);
      setStreak(0);
    }

    const newRoundId = generateRoundId();
    activeRoundIdRef.current = newRoundId;

    // 1. If pre-validated candidate is ready and eligible, promote immediately
    const candidate = nextSongCandidateRef.current;
    nextSongCandidateRef.current = null;

    if (
      candidate &&
      isTrackEligibleForFilters(candidate, {
        decade: gameState.decade,
        genres: gameState.genres,
      })
    ) {
      setPlayedSongIds((prev) => [...prev, candidate.id]);
      setGameState((prev) => ({
        ...prev,
        roundId: newRoundId,
        roundState: 'playing',
        currentSong: candidate,
        revealedSong: null,
        nextSongCandidate: null,
        roundAnswerSongId: candidate.id,
        currentStage: 0,
        guesses: [],
        status: 'ready',
        score: 0,
      }));
      return;
    }

    // 2. Fetch fresh next song
    const gen = ++filterGenerationRef.current;
    setGameState((prev) => ({
      ...prev,
      roundId: newRoundId,
      roundState: 'loading',
      status: 'loading',
      currentSong: null,
      revealedSong: null,
      nextSongCandidate: null,
      roundAnswerSongId: null,
      currentStage: 0,
      guesses: [],
    }));

    const song = await musicService.getPlayableSongForRound(
      playedSongIds,
      gameState.decade,
      gameState.genres,
      20,
      () => filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId
    );
    if (filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId) return;

    if (!song) {
      const freshSong = await musicService.getPlayableSongForRound(
        [],
        gameState.decade,
        gameState.genres,
        20,
        () => filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId
      );
      if (filterGenerationRef.current !== gen || activeRoundIdRef.current !== newRoundId) return;

      if (freshSong) {
        setPlayedSongIds([freshSong.id]);
        setGameState((prev) => ({
          ...prev,
          roundId: newRoundId,
          roundState: 'playing',
          currentSong: freshSong,
          revealedSong: null,
          nextSongCandidate: null,
          roundAnswerSongId: freshSong.id,
          currentStage: 0,
          guesses: [],
          status: 'ready',
          score: 0,
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          roundId: newRoundId,
          roundState: 'playing',
          currentSong: null,
          revealedSong: null,
          nextSongCandidate: null,
          roundAnswerSongId: null,
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
      roundId: newRoundId,
      roundState: 'playing',
      currentSong: song,
      revealedSong: null,
      nextSongCandidate: null,
      roundAnswerSongId: song.id,
      currentStage: 0,
      guesses: [],
      status: 'ready',
      score: 0,
    }));
  };

  // Seamless Gameplay Safety Net for active gameplay ONLY
  const handleAudioFailure = useCallback(async () => {
    // CRITICAL: NEVER replace song if in reveal or if round is not actively playing
    if (gameState.roundState === 'revealed' || gameState.revealedSong || !gameState.currentSong) {
      return;
    }

    const failedSong = gameState.currentSong;
    const currentRoundId = gameState.roundId;

    // 1. Attempt to resolve fresh preview URL without modifying game state
    try {
      const freshUrl = await musicService.resolveFreshPreviewUrl(failedSong);
      if (freshUrl && freshUrl !== failedSong.previewUrl && activeRoundIdRef.current === currentRoundId) {
        setGameState((prev) => {
          if (prev.roundId !== currentRoundId || !prev.currentSong) return prev;
          return {
            ...prev,
            currentSong: { ...failedSong, previewUrl: freshUrl },
          };
        });
        return;
      }
    } catch {
      // Continue to replacement fallback
    }

    // 2. If re-resolution fails: record temporary failure (not dead) to avoid purging valid songs on transient network errors
    musicService.recordAudioHealth(failedSong.id, 'temporary_failure', 'Audio playback error during round');

    // 3. If player has already made guesses or revealed, freeze round state so the answer doesn't switch
    if (gameState.guesses.length > 0 || gameState.roundState === 'revealed' || gameState.revealedSong) {
      return;
    }

    // 4. Only if no guesses were submitted yet, attempt seamless replacement
    const replacement = await musicService.getPlayableSongForRound(
      playedSongIds,
      gameState.decade,
      gameState.genres,
      20,
      () => activeRoundIdRef.current !== currentRoundId
    );

    if (replacement && activeRoundIdRef.current === currentRoundId) {
      setPlayedSongIds((prev) => [...prev, replacement.id]);
      setGameState((prev) => {
        if (prev.roundId !== currentRoundId) return prev;
        return {
          ...prev,
          currentSong: replacement,
          roundAnswerSongId: replacement.id,
        };
      });
    }
  }, [
    gameState.roundState,
    gameState.revealedSong,
    gameState.currentSong,
    gameState.roundId,
    gameState.guesses.length,
    gameState.decade,
    gameState.genres,
    playedSongIds,
  ]);

  // Player selects a guess from autocomplete
  const handleSelectGuess = (selectedSong: Song) => {
    if (!gameState.currentSong || gameState.status !== 'ready' || gameState.roundState !== 'playing') {
      return;
    }

    audioService.stop();

    const activeSong = gameState.currentSong;
    const isCorrect = gameService.validateGuess(selectedSong.id, activeSong.id);
    const correctArtist =
      !isCorrect &&
      gameService.isArtistMatch(selectedSong.artist, activeSong.artist);

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
      const activeRoundId = gameState.roundId;
      const activeFilterGen = filterGenerationRef.current;

      // Safe streak increment: exactly once per unique round
      if (lastIncrementedRoundIdRef.current !== activeRoundId) {
        lastIncrementedRoundIdRef.current = activeRoundId;
        setIsStreakBroken(false);
        // Stagger streak increment by ~140ms so Answer Effect initiates first,
        // followed by the streak badge pulse and number scale-up
        if (streakTimeoutRef.current) clearTimeout(streakTimeoutRef.current);
        streakTimeoutRef.current = setTimeout(() => {
          setStreak((prev) => prev + 1);
        }, 140);
      }

      setGameState((prev) => ({
        ...prev,
        revealedSong: activeSong,
        roundAnswerSongId: activeSong.id,
        roundState: 'revealed',
        status: 'won',
        score: earnedScore,
        guesses: updatedGuesses,
      }));

      // Background preparation for next round
      prepareNextSongCandidate(
        activeRoundId,
        activeFilterGen,
        [...playedSongIds, activeSong.id],
        gameState.decade,
        gameState.genres
      );
    } else {
      if (gameState.currentStage < STAGES.length - 1) {
        setGameState((prev) => ({
          ...prev,
          guesses: updatedGuesses,
          currentStage: prev.currentStage + 1,
        }));
      } else {
        const activeRoundId = gameState.roundId;
        const activeFilterGen = filterGenerationRef.current;

        // Break streak on round failure
        if (lastFailedRoundIdRef.current !== activeRoundId) {
          lastFailedRoundIdRef.current = activeRoundId;
          if (streak > 0) {
            setIsStreakBroken(true);
          }
        }

        setGameState((prev) => ({
          ...prev,
          revealedSong: activeSong,
          roundAnswerSongId: activeSong.id,
          roundState: 'revealed',
          status: 'lost',
          score: 0,
          guesses: updatedGuesses,
        }));

        // Background preparation for next round
        prepareNextSongCandidate(
          activeRoundId,
          activeFilterGen,
          [...playedSongIds, activeSong.id],
          gameState.decade,
          gameState.genres
        );
      }
    }
  };

  // Skip to next stage duration or end round
  const handleSkip = () => {
    if (!gameState.currentSong || gameState.status !== 'ready' || gameState.roundState !== 'playing') {
      return;
    }

    audioService.stop();

    if (gameState.currentStage < STAGES.length - 1) {
      setGameState((prev) => ({
        ...prev,
        currentStage: prev.currentStage + 1,
      }));
    } else {
      // Skipped at 15s -> End round and freeze revealed song
      const activeSong = gameState.currentSong;
      const activeRoundId = gameState.roundId;
      const activeFilterGen = filterGenerationRef.current;

      // Break streak on round surrender
      if (lastFailedRoundIdRef.current !== activeRoundId) {
        lastFailedRoundIdRef.current = activeRoundId;
        if (streak > 0) {
          setIsStreakBroken(true);
        }
      }

      setGameState((prev) => ({
        ...prev,
        revealedSong: activeSong,
        roundAnswerSongId: activeSong.id,
        roundState: 'revealed',
        status: 'lost',
        score: 0,
      }));

      // Background preparation for next round
      prepareNextSongCandidate(
        activeRoundId,
        activeFilterGen,
        [...playedSongIds, activeSong.id],
        gameState.decade,
        gameState.genres
      );
    }
  };

  const isGameOver = gameState.roundState === 'revealed' || gameState.status === 'won' || gameState.status === 'lost';
  const displayRevealSong = gameState.revealedSong || gameState.currentSong;
  const alreadyGuessedIds = gameState.guesses.map((g) => g.songId);
  const isImmersiveDimmed = settings.immersive && isPlayingAudio && !isGameOver;
  const glowMultiplier =
    settings.glowIntensity === 'OFF'
      ? 0
      : settings.glowIntensity === 'LOW'
      ? 0.5
      : settings.glowIntensity === 'HIGH'
      ? 1.6
      : 1;

  return (
    <div className="relative min-h-screen bg-[#060709] text-neutral-100 py-6 sm:py-10 px-4 sm:px-6 font-sans flex flex-col justify-between items-center overflow-x-hidden theme-transition">
      {/* 1. Atmospheric Audio-Reactive Background Canvas */}
      <AudioBackground
        artworkUrl={
          isGameOver
            ? displayRevealSong?.artworkUrl
            : gameState.currentSong?.artworkUrl
        }
        isResultRevealed={isGameOver}
        isWon={gameState.status === 'won'}
        decade={gameState.decade}
      />

      {/* 2. Floating Desktop Genre Rail (Fixed Left - Zero Impact on Center Layout) */}
      {!isGameOver && (
        <aside
          id="desktop-genre-rail"
          className={`hidden xl:flex fixed left-6 2xl:left-12 top-1/2 -translate-y-1/2 z-30 flex-col pointer-events-auto transition-opacity duration-400 ${
            isImmersiveDimmed ? 'opacity-25 hover:opacity-90' : 'opacity-100'
          }`}
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
          <div
            className={`w-full mb-3 transition-opacity duration-400 ${
              isImmersiveDimmed ? 'opacity-30 hover:opacity-90' : 'opacity-100'
            }`}
          >
            <DecadeSelector
              selectedDecade={gameState.decade}
              onSelectDecade={handleSelectDecade}
              disabled={gameState.status === 'loading'}
            />
          </div>
        )}

        {/* Mobile / Tablet Horizontal Genre Strip (Multi-Select, Hidden on XL where Rail is Fixed) */}
        {!isGameOver && (
          <div
            className={`xl:hidden w-full mb-4 transition-opacity duration-400 ${
              isImmersiveDimmed ? 'opacity-25' : 'opacity-100'
            }`}
          >
            <GenreSelector
              selectedGenres={gameState.genres}
              selectedDecade={gameState.decade}
              onToggleGenre={handleToggleGenre}
              disabled={gameState.status === 'loading'}
              layoutMode="horizontal"
            />
          </div>
        )}

        {/* Guess Streak Indicator (Centered horizontally between Filters and Timeline) */}
        <StreakIndicator
          streak={streak}
          isBroken={isStreakBroken}
          onBreakComplete={handleStreakBreakComplete}
          reducedMotion={settings.reducedMotion}
          glowMultiplier={glowMultiplier}
          className={`transition-opacity duration-400 ${
            isImmersiveDimmed ? 'opacity-30 hover:opacity-100' : 'opacity-100'
          }`}
        />

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
          {!isGameOver && gameState.status === 'ready' && !gameState.currentSong && (
            <motion.main
              key="no-songs-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="w-full flex-1 flex flex-col justify-center items-center my-auto py-12 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3">
                <Music className="w-6 h-6 text-neutral-400" />
              </div>
              <h2 className="text-base font-bold text-white mb-1">No playable songs available</h2>
              <p className="text-xs text-neutral-400 max-w-sm mb-5">
                No songs match the selected decade and genre filters. Try selecting a different filter combination or reset to all.
              </p>
              <button
                id="reset-filters-btn"
                onClick={handleResetFilters}
                className="px-5 py-2 text-xs font-bold rounded-full transition-colors theme-transition cursor-pointer"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-text-color)',
                }}
              >
                Reset Filters
              </button>
            </motion.main>
          )}

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

          {isGameOver && displayRevealSong && (
            <motion.main
              key={`result-view-${gameState.roundId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full flex-1 flex flex-col justify-center items-center my-auto"
            >
              <ResultCard
                status={gameState.status as 'won' | 'lost'}
                currentSong={displayRevealSong}
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

      {/* 4. Hidden Right Edge Visual Customization Panel (Fixed Overlay) */}
      <VisualCustomizationPanel />
    </div>
  );
};
