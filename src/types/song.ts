import { GenreFilter } from './game';

export type AudioHealthStatus = 'healthy' | 'unknown' | 'temporary_failure' | 'temporarily_failed' | 'dead';

export interface Song {
  id: string;
  title: string;
  artist: string;
  normalizedArtist?: string;
  album?: string;
  year?: number;
  verifiedOriginalYear?: number;
  yearConfidence?: 'high' | 'medium' | 'low';
  genre?: string;
  normalizedGenres?: GenreFilter[]; // Precomputed canonical Melodex genres, e.g. ['pop', 'rnb']
  recognitionScore?: number;
  artworkUrl?: string;
  previewUrl: string;
  previewStart?: number;
  provider?: 'itunes' | 'deezer' | 'spotify' | string;
  trackIdentityVerified?: boolean;
  providerTrackId?: string;

  // Audio Health & Playability Tracking
  playable?: boolean;
  audioStatus?: AudioHealthStatus;
  audioValidatedAt?: number; // timestamp in ms
  failureCount?: number;
  lastReason?: string;
  lastFailureReason?: string;
}

