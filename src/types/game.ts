import { Song } from './song';

export const STAGES = [0.5, 1, 3, 5, 15] as const;

export type GameStatus = 'loading' | 'ready' | 'won' | 'lost' | 'error';

export type DecadeFilter = 'all' | 'pre2000' | '2000s' | '2010s' | '2020s';

export interface DecadeOption {
  id: DecadeFilter;
  label: string;
  sublabel?: string;
}

export const DECADE_OPTIONS: DecadeOption[] = [
  { id: 'all', label: 'Any Year' },
  { id: 'pre2000', label: '< 2000' },
  { id: '2000s', label: "2000's" },
  { id: '2010s', label: "2010's" },
  { id: '2020s', label: "2020's" },
];

export interface Guess {
  songId: string;
  title: string;
  artist: string;
  correct: boolean;
  stageNumber: number;
}

export interface GameState {
  currentSong: Song | null;
  currentStage: number; // 0 to 4 (stages.length - 1)
  guesses: Guess[];
  status: GameStatus;
  score: number;
  decade: DecadeFilter;
  errorMessage?: string;
}

export interface DeveloperDebugInfo {
  currentSong: Song | null;
  currentStage: number;
  stageDuration: number;
  previewUrl: string;
  previewStart: number;
  catalogSize: number;
  playedSongIds: string[];
}

