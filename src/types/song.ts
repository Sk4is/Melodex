export type AudioHealthStatus = 'healthy' | 'unknown' | 'temporarily_failed' | 'dead';

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
  recognitionScore?: number;
  artworkUrl?: string;
  previewUrl: string;
  previewStart?: number;
  provider?: 'itunes' | 'deezer' | 'spotify' | string;
  trackIdentityVerified?: boolean;
  providerTrackId?: string;

  // Audio Health Tracking
  audioStatus?: AudioHealthStatus;
  audioValidatedAt?: number; // timestamp in ms
  failureCount?: number;
  lastFailureReason?: string;
}

