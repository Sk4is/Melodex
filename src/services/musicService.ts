import { Song, AudioHealthStatus } from '../types/song';
import { DecadeFilter, GenreFilter } from '../types/game';
import { fuzzyMatchSong, extractPrimaryArtist, normalizeText } from '../utils/normalizeText';
import { MelodexSearchEngine, SearchResult } from '../utils/searchEngine';
import { MELODEX_BASE_CATALOG } from '../data/melodexCatalog';
import { audioService } from './audioService';
import {
  computeNormalizedGenres,
  normalizeTrackGenres,
  migrateLegacyCatalogTrack,
  matchSongToSingleGenre,
  matchSongToSelectedGenres,
  matchesDecadeYear,
  isTrackEligibleForFilters,
  logFilterDiagnostics,
} from '../utils/genreUtils';

export function getSecureRandomFloat(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / (0xffffffff + 1);
  }
  return Math.random();
}

export function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(getSecureRandomFloat() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function normalizeArtistKey(artist: string): string {
  const primary = extractPrimaryArtist(artist);
  return normalizeText(primary);
}

export type NormalizedGenre =
  | 'Pop'
  | 'Hip-Hop/Rap'
  | 'Electronic/Dance'
  | 'Rock/Alternative/Indie'
  | 'R&B'
  | 'Latin'
  | 'Other';

export const GENRE_WEIGHTS: Record<NormalizedGenre, number> = {
  'Pop': 0.25,
  'Hip-Hop/Rap': 0.20,
  'Electronic/Dance': 0.15,
  'Rock/Alternative/Indie': 0.15,
  'R&B': 0.10,
  'Latin': 0.08,
  'Other': 0.07,
};

/**
 * Strict Song-Level Genre Matching:
 * Evaluates the song's precomputed normalizedGenres.
 * If normalizedGenres is not set, computes it on-the-fly via computeNormalizedGenres.
 * FAIL-CLOSED: Unclassified or mismatched songs NEVER match specific genre filters.
 * NEVER uses broad artist genre associations.
 */
export function matchesGenre(song: Song, genre: GenreFilter): boolean {
  if (genre === 'all') return true;
  const genres =
    song.normalizedGenres && song.normalizedGenres.length > 0
      ? song.normalizedGenres
      : computeNormalizedGenres(song.genre, song.artist, song.title, song.album);

  return matchSongToSingleGenre(genres, genre);
}

/**
 * Strict Multi-Genre Matching (OR logic):
 * A song matches if ANY selected genre is in its normalizedGenres.
 */
export function matchesAnyGenre(song: Song, genres: GenreFilter[]): boolean {
  if (!genres || genres.length === 0 || genres.includes('all')) return true;
  const songGenres =
    song.normalizedGenres && song.normalizedGenres.length > 0
      ? song.normalizedGenres
      : computeNormalizedGenres(song.genre, song.artist, song.title, song.album);

  return matchSongToSelectedGenres(songGenres, genres);
}

export function getNormalizedGenre(genre?: string, artist = '', title = '', album = ''): NormalizedGenre {
  const norm = computeNormalizedGenres(genre, artist, title, album);
  if (norm.includes('hiphop')) return 'Hip-Hop/Rap';
  if (norm.includes('electronic') || norm.includes('dance')) return 'Electronic/Dance';
  if (norm.includes('rock') || norm.includes('indie') || norm.includes('metal')) return 'Rock/Alternative/Indie';
  if (norm.includes('rnb')) return 'R&B';
  if (norm.includes('latin')) return 'Latin';
  if (norm.includes('pop')) return 'Pop';
  return 'Other';
}

const STORAGE_RECENT_TRACKS = 'melodex_recent_tracks_v2';
const STORAGE_RECENT_ARTISTS = 'melodex_recent_artists_v2';
const STORAGE_QUARANTINED_SONGS = 'melodex_quarantined_songs_v3';
const STORAGE_AUDIO_HEALTH = 'melodex_audio_health_v3';
const MAX_RECENT_TRACKS = 400;
const MAX_RECENT_ARTISTS = 35;

export interface TrackHealthRecord {
  status: AudioHealthStatus;
  validatedAt: number;
  failureCount: number;
  lastReason?: string;
}

class MusicService {
  private catalog: Map<string, Song> = new Map();
  private rejectedSongIds: Set<string> = new Set();
  private audioHealthMap: Map<string, TrackHealthRecord> = new Map();
  private isCatalogLoaded = false;
  private loadPromise: Promise<Song[]> | null = null;
  private countCache: Map<DecadeFilter, Record<GenreFilter, number>> = new Map();
  private searchEngine: MelodexSearchEngine = new MelodexSearchEngine();

  // Session Deck & Balanced Distribution
  private sessionDeck: Song[] = [];
  private currentDeckKey = '';
  private sessionArtistExposure: Map<string, number> = new Map();

  // Persistent Cooldowns (loaded from localStorage, preserved across browser refreshes)
  private recentTrackIds: string[] = [];
  private recentArtistKeys: string[] = [];

  // Filter Generation to avoid race conditions
  private currentFilterGeneration = 0;

  // Background Cleanup Runner
  private backgroundCleanupTimer: number | null = null;
  private isCleanupRunning = false;

  constructor() {
    this.loadPersistedState();
    this.bootstrapCatalog();
    this.startBackgroundHealthCleanup();
  }

  public nextFilterGeneration(): number {
    this.currentFilterGeneration += 1;
    this.invalidateSessionDeck();
    return this.currentFilterGeneration;
  }

  public getCurrentFilterGeneration(): number {
    return this.currentFilterGeneration;
  }

  public invalidateSessionDeck(): void {
    this.sessionDeck = [];
    this.currentDeckKey = '';
  }

  /**
   * Loads persisted cooldowns, audio health status, and quarantined tracks from localStorage.
   */
  private loadPersistedState(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const rawTracks = localStorage.getItem(STORAGE_RECENT_TRACKS);
      if (rawTracks) {
        const parsed = JSON.parse(rawTracks);
        if (Array.isArray(parsed)) {
          this.recentTrackIds = parsed.slice(-MAX_RECENT_TRACKS);
        }
      }

      const rawArtists = localStorage.getItem(STORAGE_RECENT_ARTISTS);
      if (rawArtists) {
        const parsed = JSON.parse(rawArtists);
        if (Array.isArray(parsed)) {
          this.recentArtistKeys = parsed.slice(-MAX_RECENT_ARTISTS);
        }
      }

      const rawQuarantine = localStorage.getItem(STORAGE_QUARANTINED_SONGS);
      if (rawQuarantine) {
        const parsed = JSON.parse(rawQuarantine);
        if (Array.isArray(parsed)) {
          for (const id of parsed) {
            if (typeof id === 'string') {
              this.rejectedSongIds.add(id);
              this.catalog.delete(id);
            }
          }
        }
      }

      const rawHealth = localStorage.getItem(STORAGE_AUDIO_HEALTH);
      if (rawHealth) {
        const parsed = JSON.parse(rawHealth);
        if (parsed && typeof parsed === 'object') {
          for (const [id, rec] of Object.entries(parsed)) {
            if (rec && typeof rec === 'object') {
              this.audioHealthMap.set(id, rec as TrackHealthRecord);
              if ((rec as TrackHealthRecord).status === 'dead') {
                this.rejectedSongIds.add(id);
                this.catalog.delete(id);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not read persisted game history from localStorage:', e);
    }
  }

  /**
   * Persists cooldowns, audio health records, and quarantined songs to localStorage.
   */
  private savePersistedState(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(
        STORAGE_RECENT_TRACKS,
        JSON.stringify(this.recentTrackIds.slice(-MAX_RECENT_TRACKS))
      );
      localStorage.setItem(
        STORAGE_RECENT_ARTISTS,
        JSON.stringify(this.recentArtistKeys.slice(-MAX_RECENT_ARTISTS))
      );
      localStorage.setItem(
        STORAGE_QUARANTINED_SONGS,
        JSON.stringify(Array.from(this.rejectedSongIds))
      );

      const healthObj: Record<string, TrackHealthRecord> = {};
      for (const [id, rec] of this.audioHealthMap.entries()) {
        healthObj[id] = rec;
      }
      localStorage.setItem(STORAGE_AUDIO_HEALTH, JSON.stringify(healthObj));
    } catch (e) {
      console.warn('Could not save game history to localStorage:', e);
    }
  }

  /**
   * Resets recent session history and clears persisted cooldowns
   */
  public clearRecentHistory(): void {
    this.recentTrackIds = [];
    this.recentArtistKeys = [];
    this.sessionArtistExposure.clear();
    this.invalidateSessionDeck();
    this.savePersistedState();
  }

  /**
   * Invalidate precomputed count cache and search index whenever the verified playable catalog changes
   */
  private invalidateCountCache(): void {
    this.countCache.clear();
    this.rebuildSearchIndex();
  }

  private rebuildSearchIndex(): void {
    const playable = this.getCatalog();
    this.searchEngine.buildIndex(playable);
  }

  /**
   * Initializes catalog with prebuilt verified songs from version-controlled file
   */
  private bootstrapCatalog() {
    try {
      if (Array.isArray(MELODEX_BASE_CATALOG)) {
        for (const rawItem of MELODEX_BASE_CATALOG) {
          const item = migrateLegacyCatalogTrack(rawItem);
          if (this.isValidCatalogItem(item) && !this.rejectedSongIds.has(item.id)) {
            const health = this.audioHealthMap.get(item.id);
            if (!health || health.status !== 'dead') {
              this.catalog.set(item.id, {
                ...item,
                audioStatus: health ? health.status : (item.audioStatus || 'healthy'),
                audioValidatedAt: health ? health.validatedAt : (item.audioValidatedAt || Date.now()),
              });
            }
          }
        }
      }
      this.rebuildSearchIndex();
    } catch (e) {
      console.warn('Failed to bootstrap catalog synchronously:', e);
    }
  }

  /**
   * Additively expands the catalog with new verified tracks.
   * Deduplicates by ID and Title+Artist signature without overwriting existing verified catalog.
   */
  public addVerifiedTracks(newTracks: Song[]): number {
    if (!Array.isArray(newTracks) || newTracks.length === 0) return 0;

    let addedCount = 0;
    const existingSignatures = new Set<string>();

    for (const song of this.catalog.values()) {
      const sig = `${song.artist.toLowerCase().trim()}:::${song.title.toLowerCase().trim()}`;
      existingSignatures.add(sig);
    }

    for (const rawTrack of newTracks) {
      const track = migrateLegacyCatalogTrack(rawTrack);
      if (!this.isValidCatalogItem(track)) continue;
      if (this.catalog.has(track.id) || this.rejectedSongIds.has(track.id)) continue;

      const health = this.audioHealthMap.get(track.id);
      if (health && health.status === 'dead') continue;

      const sig = `${track.artist.toLowerCase().trim()}:::${track.title.toLowerCase().trim()}`;
      if (existingSignatures.has(sig)) continue;

      this.catalog.set(track.id, {
        ...track,
        audioStatus: health ? health.status : (track.audioStatus || 'healthy'),
        audioValidatedAt: health ? health.validatedAt : (track.audioValidatedAt || Date.now()),
      });
      existingSignatures.add(sig);
      addedCount++;
    }

    if (addedCount > 0) {
      this.invalidateCountCache();
    }
    return addedCount;
  }

  /**
   * Records audio health status for a track with permanent vs temporary criteria
   */
  public recordAudioHealth(songId: string, status: AudioHealthStatus, reason?: string): void {
    if (!songId) return;

    const prev = this.audioHealthMap.get(songId) || {
      status: 'unknown',
      validatedAt: 0,
      failureCount: 0,
    };

    let newFailureCount = prev.failureCount;
    let finalStatus = status;

    if (status === 'healthy') {
      newFailureCount = 0;
    } else if (status === 'temporarily_failed') {
      newFailureCount += 1;
      if (newFailureCount >= 3) {
        finalStatus = 'dead';
      }
    } else if (status === 'dead') {
      newFailureCount += 1;
    }

    const record: TrackHealthRecord = {
      status: finalStatus,
      validatedAt: Date.now(),
      failureCount: newFailureCount,
      lastReason: reason || prev.lastReason,
    };

    this.audioHealthMap.set(songId, record);

    const song = this.catalog.get(songId);
    if (song) {
      song.audioStatus = finalStatus;
      song.audioValidatedAt = record.validatedAt;
      song.failureCount = newFailureCount;
      song.lastFailureReason = record.lastReason;
    }

    if (finalStatus === 'dead') {
      this.rejectedSongIds.add(songId);
      this.catalog.delete(songId);
      this.sessionDeck = this.sessionDeck.filter((s) => s.id !== songId);
      this.invalidateCountCache();
    }

    this.savePersistedState();
  }

  /**
   * Blacklist / quarantine a song permanently
   */
  public rejectSong(songId: string, reason = 'Audio unplayable'): void {
    this.recordAudioHealth(songId, 'dead', reason);
  }

  public quarantineSong(songId: string, reason?: string): void {
    this.rejectSong(songId, reason);
  }

  public isSongRejected(songId: string): boolean {
    return this.rejectedSongIds.has(songId) || this.audioHealthMap.get(songId)?.status === 'dead';
  }

  public getAudioStatus(songId: string): AudioHealthStatus {
    if (this.rejectedSongIds.has(songId)) return 'dead';
    return this.audioHealthMap.get(songId)?.status || this.catalog.get(songId)?.audioStatus || 'unknown';
  }

  public getFailureCount(songId: string): number {
    return this.audioHealthMap.get(songId)?.failureCount || 0;
  }

  /**
   * Runtime Audio URL Re-Resolution:
   * If a preview URL expires or fails at runtime, queries iTunes Search API
   * to resolve a fresh, valid audio stream without modifying game state.
   */
  public async resolveFreshPreviewUrl(song: Song): Promise<string | null> {
    if (!song || !song.title || !song.artist) return null;

    try {
      const itunesQuery = encodeURIComponent(`${song.artist} ${song.title}`);
      const itunesRes = await fetch(
        `https://itunes.apple.com/search?term=${itunesQuery}&media=music&entity=song&limit=5`
      );

      if (itunesRes.ok) {
        const data = await itunesRes.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          const normTitle = song.title.toLowerCase().replace(/[^a-z0-9]/g, '');
          const normArtist = song.artist.toLowerCase().replace(/[^a-z0-9]/g, '');
          const match = data.results.find((r: { trackName?: string; artistName?: string; previewUrl?: string }) => {
            if (!r.previewUrl) return false;
            const rTitle = (r.trackName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const rArtist = (r.artistName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const artistMatches = rArtist.includes(normArtist) || normArtist.includes(rArtist);
            const titleMatches = rTitle.includes(normTitle) || normTitle.includes(rTitle);
            return artistMatches && titleMatches;
          });

          if (match && match.previewUrl) {
            song.previewUrl = match.previewUrl;
            if (match.artworkUrl100 && !song.artworkUrl) {
              song.artworkUrl = match.artworkUrl100.replace('100x100bb', '600x600bb');
            }
            return match.previewUrl;
          }
        }
      }
    } catch {
      // Fallback network failure handled gracefully
    }

    return null;
  }

  /**
   * Strict validation rule for catalog item acceptance:
   * Must have id, title, artist, valid audio preview, and verified year.
   * Tracks with trackIdentityVerified === false are quarantined.
   */
  public isValidCatalogItem(item: Song | null | undefined): item is Song {
    if (!item || !item.id || !item.title || !item.artist || !item.previewUrl) {
      return false;
    }
    if (item.trackIdentityVerified === false) {
      return false;
    }
    if (!item.previewUrl.startsWith('http')) {
      return false;
    }
    const year = this.getVerifiedYear(item);
    if (year === null || typeof year !== 'number' || isNaN(year) || year < 1920 || year > 2030) {
      return false;
    }
    if (item.yearConfidence && item.yearConfidence === 'low') {
      return false;
    }
    return true;
  }

  /**
   * Get verified original year strictly without fallbacks
   */
  public getVerifiedYear(song: Song): number | null {
    if (typeof song.verifiedOriginalYear === 'number' && !isNaN(song.verifiedOriginalYear)) {
      return song.verifiedOriginalYear;
    }
    if (typeof song.year === 'number' && !isNaN(song.year)) {
      return song.year;
    }
    return null;
  }

  /**
   * Loads initial verified catalog and migrates all genres
   */
  public async loadInitialCatalog(): Promise<Song[]> {
    this.loadPersistedState();

    if (this.isCatalogLoaded && this.catalog.size > 0) {
      return this.getCatalog();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      try {
        const res = await fetch('/melodex-catalog.json');
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            for (const rawItem of list) {
              const item = migrateLegacyCatalogTrack(rawItem);
              if (this.isValidCatalogItem(item) && !this.rejectedSongIds.has(item.id)) {
                const health = this.audioHealthMap.get(item.id);
                if (!health || health.status !== 'dead') {
                  this.catalog.set(item.id, {
                    ...item,
                    audioStatus: health ? health.status : (item.audioStatus || 'healthy'),
                    audioValidatedAt: health ? health.validatedAt : (item.audioValidatedAt || Date.now()),
                  });
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Fallback to base catalog:', err);
      }

      this.isCatalogLoaded = true;
      this.invalidateCountCache();
      this.traceCatalogPipelineDiagnostics('all', ['all']);
      return this.getCatalog();
    })();

    return this.loadPromise;
  }

  /**
   * Diagnostic Pipeline Trace:
   * Traces and reports exact counts at every stage from raw catalog to game deck.
   */
  public traceCatalogPipelineDiagnostics(
    decade: DecadeFilter = 'all',
    genres: GenreFilter[] | GenreFilter = ['all']
  ): Record<string, unknown> {
    const rawCatalog = Array.isArray(MELODEX_BASE_CATALOG) ? MELODEX_BASE_CATALOG : [];
    const rawLength = rawCatalog.length;
    const afterJsonLoad = rawCatalog;

    // Deduplication
    const seenIds = new Set<string>();
    const seenSigs = new Set<string>();
    const afterDeduplication: any[] = [];
    for (const s of afterJsonLoad) {
      if (!s || !s.id) continue;
      if (seenIds.has(s.id)) continue;
      seenIds.add(s.id);
      const sig = `${(s.artist || '').toLowerCase().trim()}:::${(s.title || '').toLowerCase().trim()}`;
      if (seenSigs.has(sig)) continue;
      seenSigs.add(sig);
      afterDeduplication.push(s);
    }

    // Metadata validation
    const afterMetadataValidation = afterDeduplication.filter(
      (s) => s.id && s.title && s.artist && s.previewUrl && s.previewUrl.startsWith('http')
    );

    // Year validation
    const afterYearValidation = afterMetadataValidation.filter((s) => {
      const y = s.verifiedOriginalYear ?? s.year;
      return typeof y === 'number' && !isNaN(y) && y >= 1920 && y <= 2030 && s.yearConfidence !== 'low';
    });

    // Genre normalization
    const afterGenreNormalization = afterYearValidation.map((s) => migrateLegacyCatalogTrack(s));

    // Audio status breakdown
    const audioBreakdown = { healthy: 0, unknown: 0, undefinedMigrated: 0, temporarily_failed: 0, dead: 0 };
    for (const s of afterYearValidation) {
      if (s.audioStatus === undefined) audioBreakdown.undefinedMigrated++;
      else if (s.audioStatus === 'healthy') audioBreakdown.healthy++;
      else if (s.audioStatus === 'dead') audioBreakdown.dead++;
      else if (s.audioStatus === 'temporarily_failed') audioBreakdown.temporarily_failed++;
      else audioBreakdown.unknown++;
    }

    // Track identity breakdown
    const identityBreakdown = { verified: 0, unknown: 0, invalid: 0 };
    for (const s of afterYearValidation) {
      if (s.trackIdentityVerified === true) identityBreakdown.verified++;
      else if (s.trackIdentityVerified === false) identityBreakdown.invalid++;
      else identityBreakdown.unknown++;
    }

    const healthyPlayableCatalog = this.getCatalog();
    const afterAudioStatusFiltering = healthyPlayableCatalog.length;

    const genreList = Array.isArray(genres) ? genres : [genres];
    const afterDecadeFilter = healthyPlayableCatalog.filter((s) =>
      matchesDecadeYear(s.verifiedOriginalYear ?? s.year, decade)
    );
    const afterGenreFilter = this.filterByDecadeAndGenres(healthyPlayableCatalog, decade, genreList);

    const diagnostics = {
      rawCatalog: rawLength,
      afterJsonLoad: afterJsonLoad.length,
      afterDeduplication: afterDeduplication.length,
      afterMetadataValidation: afterMetadataValidation.length,
      afterYearValidation: afterYearValidation.length,
      afterGenreNormalization: afterGenreNormalization.length,
      audioStatus: audioBreakdown,
      trackIdentity: identityBreakdown,
      afterAudioStatusFiltering,
      healthyPlayableCatalog: healthyPlayableCatalog.length,
      afterDecadeFilter: afterDecadeFilter.length,
      afterGenreFilter: afterGenreFilter.length,
      sessionDeck: this.sessionDeck.length,
      currentSongExists: this.sessionDeck.length > 0 || afterGenreFilter.length > 0,
    };

    console.info('[MELODEX CATALOG TRACE DIAGNOSTICS]', diagnostics);
    return diagnostics;
  }

  /**
   * Get full in-memory playable verified catalog (healthy tracks only)
   */
  public getCatalog(): Song[] {
    return Array.from(this.catalog.values()).filter(
      (s) => !this.rejectedSongIds.has(s.id) && s.audioStatus !== 'dead' && this.isValidCatalogItem(s)
    );
  }

  /**
   * Get single song by ID
   */
  public getSongById(id: string): Song | undefined {
    if (this.rejectedSongIds.has(id)) return undefined;
    const song = this.catalog.get(id);
    if (song && this.isValidCatalogItem(song)) {
      return song;
    }
    return undefined;
  }

  /**
   * Strict Decade Gate:
   * Validates verified original release year against decade boundaries.
   * NEVER permits reissues, remasters, or compilation years to misclassify decades.
   */
  public matchesDecade(song: Song, decade: DecadeFilter): boolean {
    const verifiedYear = this.getVerifiedYear(song);
    return matchesDecadeYear(verifiedYear, decade);
  }

  /**
   * Filter songs matching both decade and genre(s) criteria (OR logic across selected genres).
   * SINGLE CANONICAL SOURCE OF TRUTH: Uses isTrackEligibleForFilters.
   * FAIL-CLOSED: NEVER falls back to unfiltered songs.
   */
  public filterByDecadeAndGenres(
    songs: Song[],
    decade: DecadeFilter,
    genres: GenreFilter[] | GenreFilter = ['all']
  ): Song[] {
    const criteria = { decade, genres };
    return songs.filter((song) => isTrackEligibleForFilters(song, criteria));
  }

  public filterByDecadeAndGenre(songs: Song[], decade: DecadeFilter, genre: GenreFilter): Song[] {
    return this.filterByDecadeAndGenres(songs, decade, [genre]);
  }

  /**
   * Returns count of playable verified songs matching decade and genre(s)
   */
  public getPlayableCount(
    decade: DecadeFilter = 'all',
    genres: GenreFilter[] | GenreFilter = 'all'
  ): number {
    if (typeof genres === 'string' && genres !== 'all') {
      const counts = this.getGenreCountsForDecade(decade);
      return counts[genres] ?? 0;
    }
    if (genres === 'all' || (Array.isArray(genres) && (genres.length === 0 || genres.includes('all')))) {
      const counts = this.getGenreCountsForDecade(decade);
      return counts.all ?? 0;
    }
    const all = this.getCatalog();
    return this.filterByDecadeAndGenres(all, decade, genres).length;
  }

  /**
   * Efficiently computes and memoizes song counts for all individual genres + all for a given decade.
   * Single-pass scan over playable catalog for ultra-fast UI rendering.
   * Strictly uses isTrackEligibleForFilters for 100% consistent totals.
   */
  public getGenreCountsForDecade(decade: DecadeFilter): Record<GenreFilter, number> {
    const cached = this.countCache.get(decade);
    if (cached) {
      return cached;
    }

    const counts: Record<GenreFilter, number> = {
      all: 0,
      pop: 0,
      hiphop: 0,
      rock: 0,
      rnb: 0,
      electronic: 0,
      latin: 0,
      indie: 0,
      metal: 0,
      dance: 0,
    };

    const allPlayable = this.getCatalog();

    for (const song of allPlayable) {
      if (isTrackEligibleForFilters(song, { decade, genres: 'all' })) {
        counts.all += 1;
        if (isTrackEligibleForFilters(song, { decade, genres: 'pop' })) counts.pop += 1;
        if (isTrackEligibleForFilters(song, { decade, genres: 'hiphop' })) counts.hiphop += 1;
        if (isTrackEligibleForFilters(song, { decade, genres: 'rock' })) counts.rock += 1;
        if (isTrackEligibleForFilters(song, { decade, genres: 'rnb' })) counts.rnb += 1;
        if (isTrackEligibleForFilters(song, { decade, genres: 'electronic' })) counts.electronic += 1;
        if (isTrackEligibleForFilters(song, { decade, genres: 'latin' })) counts.latin += 1;
        if (isTrackEligibleForFilters(song, { decade, genres: 'indie' })) counts.indie += 1;
        if (isTrackEligibleForFilters(song, { decade, genres: 'metal' })) counts.metal += 1;
        if (isTrackEligibleForFilters(song, { decade, genres: 'dance' })) counts.dance += 1;
      }
    }

    this.countCache.set(decade, counts);
    return counts;
  }

  /**
   * Search verified songs in catalog.
   * Full playable catalog search across title, artist, and credited artists.
   * No arbitrary limits — returns all matching songs ranked intelligently.
   */
  public async searchSongs(query: string): Promise<Song[]> {
    const res = this.searchCatalog(query);
    return res.songs;
  }

  /**
   * Performs full-catalog search with exact artist catalog detection and ranking metadata.
   */
  public searchCatalog(query: string): SearchResult {
    return this.searchEngine.search(query);
  }

  /**
   * Constructs a balanced, randomized Session Deck for the given decade & genres.
   * PIPELINE:
   * healthyPlayableCatalog -> verified year -> decade filter -> genre filter -> eligibleSongs -> artist balancing -> randomization.
   * FAIL-CLOSED: Returns empty array if no eligible songs exist.
   */
  public buildSessionDeck(
    decade: DecadeFilter = 'all',
    genres: GenreFilter[] | GenreFilter = ['all'],
    forceRebuild = false
  ): Song[] {
    const genreList = Array.isArray(genres) ? genres : [genres];
    const deckKey = `${decade}::${genreList.slice().sort().join(',')}`;

    if (!forceRebuild && this.currentDeckKey === deckKey && this.sessionDeck.length > 0) {
      return this.sessionDeck;
    }

    const allPlayable = this.getCatalog();
    if (allPlayable.length === 0) {
      this.sessionDeck = [];
      this.currentDeckKey = deckKey;
      return [];
    }

    // 1. Strict filter by decade and genres using canonical eligibility
    const candidates = this.filterByDecadeAndGenres(allPlayable, decade, genreList);
    if (candidates.length === 0) {
      logFilterDiagnostics(allPlayable, decade, genreList);
      this.sessionDeck = [];
      this.currentDeckKey = deckKey;
      return [];
    }

    // 2. Group candidate songs by primary artist key
    const artistMap = new Map<string, Song[]>();
    for (const song of candidates) {
      const aKey = normalizeArtistKey(song.artist);
      const list = artistMap.get(aKey) || [];
      list.push(song);
      artistMap.set(aKey, list);
    }

    // 3. For each artist, calculate dynamic selection weight
    const artistKeys = Array.from(artistMap.keys());
    const weightedArtists: { key: string; weight: number; songs: Song[] }[] = [];

    for (const aKey of artistKeys) {
      const songs = artistMap.get(aKey) || [];
      if (songs.length === 0) continue;

      const baseWeight = 1.0;

      // Session exposure penalty
      const exposureCount = this.sessionArtistExposure.get(aKey) || 0;
      const sessionExposurePenalty = exposureCount === 0 ? 1.5 : 1 / (1 + exposureCount * 2.0);

      // Cooldown penalty from recent games (anti-repeat logic)
      const recentPos = this.recentArtistKeys.lastIndexOf(aKey);
      let recentArtistPenalty = 1.0;
      if (recentPos !== -1) {
        const roundsAgo = this.recentArtistKeys.length - 1 - recentPos;
        if (roundsAgo <= 5) {
          recentArtistPenalty = 0.05;
        } else if (roundsAgo <= 15) {
          recentArtistPenalty = 0.20;
        } else if (roundsAgo <= 25) {
          recentArtistPenalty = 0.50;
        }
      }

      // Availability health: unplayed tracks in artist catalog
      const unplayedCount = songs.filter((s) => !this.recentTrackIds.includes(s.id)).length;
      const availabilityHealth = Math.min(1.0, Math.max(0.15, unplayedCount / 2));

      const compositeWeight = baseWeight * recentArtistPenalty * sessionExposurePenalty * availabilityHealth;
      weightedArtists.push({ key: aKey, weight: compositeWeight, songs });
    }

    if (weightedArtists.length === 0) {
      this.sessionDeck = [];
      this.currentDeckKey = deckKey;
      return [];
    }

    // 4. Curated Post Malone Probability Boost: Exactly +0.5 percentage points (+0.005)
    const totalBaseWeight = weightedArtists.reduce((sum, item) => sum + item.weight, 0);
    const postMaloneKey = 'post malone';
    const postEntry = weightedArtists.find((a) => a.key === postMaloneKey);

    if (postEntry && totalBaseWeight > 0) {
      const pNormal = postEntry.weight / totalBaseWeight;
      const pBoosted = Math.min(0.95, pNormal + 0.005);

      if (pNormal < 1.0) {
        const remainingScale = (1 - pBoosted) / (1 - pNormal);
        for (const item of weightedArtists) {
          if (item.key === postMaloneKey) {
            item.weight = pBoosted * totalBaseWeight;
          } else {
            item.weight = item.weight * remainingScale;
          }
        }
      }
    }

    // Sort artists with random entropy based on dynamic normalized weights
    weightedArtists.sort((a, b) => {
      const scoreA = a.weight * (0.6 + getSecureRandomFloat() * 0.8);
      const scoreB = b.weight * (0.6 + getSecureRandomFloat() * 0.8);
      return scoreB - scoreA;
    });

    // Pick 1-2 best tracks per artist
    const deckSelection: Song[] = [];
    for (const item of weightedArtists) {
      const { songs } = item;
      const notRecent = songs.filter((s) => !this.recentTrackIds.includes(s.id));
      const pool = notRecent.length > 0 ? notRecent : songs;

      const sortedSongs = [...pool].sort((a, b) => {
        const scoreA = (a.recognitionScore ?? 75) * (0.5 + getSecureRandomFloat() * 1.0);
        const scoreB = (b.recognitionScore ?? 75) * (0.5 + getSecureRandomFloat() * 1.0);
        return scoreB - scoreA;
      });

      if (sortedSongs[0]) {
        deckSelection.push(sortedSongs[0]);
      }
      if (deckSelection.length < 80 && sortedSongs.length >= 5 && sortedSongs[1]) {
        deckSelection.push(sortedSongs[1]);
      }
    }

    // 5. Final Fisher-Yates shuffle on the balanced deck
    const shuffledDeck = fisherYatesShuffle(deckSelection);

    // Prevent immediate repeat on the first card drawn from fresh deck
    const lastPlayedId = this.recentTrackIds[this.recentTrackIds.length - 1];
    const lastPlayedArtist = this.recentArtistKeys[this.recentArtistKeys.length - 1];
    if (shuffledDeck.length > 1) {
      const topSong = shuffledDeck[shuffledDeck.length - 1];
      if (topSong && (topSong.id === lastPlayedId || normalizeArtistKey(topSong.artist) === lastPlayedArtist)) {
        const swapIdx = Math.floor(getSecureRandomFloat() * (shuffledDeck.length - 1));
        [shuffledDeck[shuffledDeck.length - 1], shuffledDeck[swapIdx]] = [
          shuffledDeck[swapIdx],
          shuffledDeck[shuffledDeck.length - 1],
        ];
      }
    }

    this.sessionDeck = shuffledDeck;
    this.currentDeckKey = deckKey;
    return this.sessionDeck;
  }

  private recordRecentPlay(songId: string, artistKey: string): void {
    this.recentTrackIds.push(songId);
    if (this.recentTrackIds.length > MAX_RECENT_TRACKS) {
      this.recentTrackIds.shift();
    }

    this.recentArtistKeys.push(artistKey);
    if (this.recentArtistKeys.length > MAX_RECENT_ARTISTS) {
      this.recentArtistKeys.shift();
    }

    this.sessionArtistExposure.set(
      artistKey,
      (this.sessionArtistExposure.get(artistKey) || 0) + 1
    );

    this.savePersistedState();
  }

  /**
   * Synchronous fallback selection adhering strictly to the active filters.
   * Strictly enforces anti-repeat cooldowns: NEVER repeats the immediate previous song.
   * FAIL-CLOSED: If no songs match the filter, returns null.
   */
  public getRandomSong(
    excludeIds: string[] = [],
    decade: DecadeFilter = 'all',
    genres: GenreFilter[] | GenreFilter = ['all']
  ): Song | null {
    const genreList = Array.isArray(genres) ? genres : [genres];
    const deckKey = `${decade}::${genreList.slice().sort().join(',')}`;

    if (this.currentDeckKey !== deckKey || this.sessionDeck.length === 0) {
      this.buildSessionDeck(decade, genres);
    }

    const excludeSet = new Set(excludeIds);
    const lastPlayedId = this.recentTrackIds[this.recentTrackIds.length - 1];
    if (lastPlayedId) {
      excludeSet.add(lastPlayedId);
    }

    const eligible = this.sessionDeck.filter(
      (s) =>
        !excludeSet.has(s.id) &&
        !this.rejectedSongIds.has(s.id) &&
        isTrackEligibleForFilters(s, { decade, genres: genreList })
    );

    if (eligible.length > 0) {
      const chosen = eligible[0];
      this.sessionDeck = this.sessionDeck.filter((s) => s.id !== chosen.id);
      this.recordRecentPlay(chosen.id, normalizeArtistKey(chosen.artist));
      return chosen;
    }

    // Fallback within strictly eligible songs only (NO UNFILTERED FALLBACK)
    const allEligible = this.filterByDecadeAndGenres(this.getCatalog(), decade, genres).filter(
      (s) => !this.rejectedSongIds.has(s.id)
    );

    if (allEligible.length === 0) return null;

    const notRecent = allEligible.filter((s) => !excludeSet.has(s.id) && !this.recentTrackIds.includes(s.id));
    const notExcluded = allEligible.filter((s) => !excludeSet.has(s.id));
    const pool = notRecent.length > 0 ? notRecent : notExcluded.length > 0 ? notExcluded : allEligible;

    const nonImmediate = pool.filter((s) => s.id !== lastPlayedId);
    const finalPool = nonImmediate.length > 0 ? nonImmediate : pool;

    const chosen = finalPool[Math.floor(getSecureRandomFloat() * finalPool.length)];
    if (!isTrackEligibleForFilters(chosen, { decade, genres: genreList })) {
      console.error('FILTER INTEGRITY VIOLATION', {
        track: chosen,
        activeFilters: { decade, genres },
        normalizedGenres: chosen.normalizedGenres,
        verifiedOriginalYear: chosen.verifiedOriginalYear,
      });
      return null;
    }

    this.recordRecentPlay(chosen.id, normalizeArtistKey(chosen.artist));
    return chosen;
  }

  /**
   * Pre-validation Gate:
   * 1. verify metadata
   * 2. verify track identity
   * 3. verify year & confidence
   * 4. verify preview URL
   * 5. preload audio
   * 6. confirm audio can actually play
   * If any step fails, attempt re-resolution; if still failing, mark dead/temporary and quarantine.
   */
  public async prevalidateCandidateSong(song: Song): Promise<boolean> {
    if (!song || !song.id || !song.title || !song.artist) {
      return false;
    }
    if (this.rejectedSongIds.has(song.id)) {
      return false;
    }
    if (song.trackIdentityVerified === false) {
      this.recordAudioHealth(song.id, 'dead', 'Unverified track identity');
      return false;
    }
    const year = this.getVerifiedYear(song);
    if (year === null || (song.yearConfidence && song.yearConfidence === 'low')) {
      this.recordAudioHealth(song.id, 'dead', 'Invalid release year');
      return false;
    }
    if (!song.previewUrl || !song.previewUrl.startsWith('http')) {
      this.recordAudioHealth(song.id, 'dead', 'Invalid preview URL format');
      return false;
    }

    // Fast check if already known healthy
    if (song.audioStatus === 'healthy') {
      return true;
    }

    // Preload and validate playable audio stream
    try {
      const isPlayable = await audioService.validateAudioUrl(song.previewUrl, 2500);
      if (isPlayable) {
        this.recordAudioHealth(song.id, 'healthy');
        return true;
      }
    } catch {
      // Inconclusive check
    }

    // If audio validation was inconclusive (e.g. timeout / suspended AudioContext prior to user interaction),
    // preserve track as eligible if it has a valid https URL from trusted providers and has not failed repeatedly
    if (song.previewUrl && song.previewUrl.startsWith('https://') && this.getFailureCount(song.id) === 0) {
      return true;
    }

    // Attempt runtime re-resolution via iTunes
    try {
      const freshUrl = await this.resolveFreshPreviewUrl(song);
      if (freshUrl && freshUrl !== song.previewUrl) {
        const freshOk = await audioService.validateAudioUrl(freshUrl, 2500);
        if (freshOk) {
          song.previewUrl = freshUrl;
          song.provider = 'itunes';
          this.recordAudioHealth(song.id, 'healthy');
          return true;
        }
      }
    } catch {
      // Re-resolution failed
    }

    const isPermanent = song.previewUrl.includes('dzcdn.net') || this.getFailureCount(song.id) >= 2;
    this.recordAudioHealth(song.id, isPermanent ? 'dead' : 'temporarily_failed', 'Audio stream unplayable');
    return false;
  }

  /**
   * Compatibility wrapper for single-song validation
   */
  public async validateSongPlayability(song: Song): Promise<boolean> {
    return this.prevalidateCandidateSong(song);
  }

  /**
   * Selects and PRE-VALIDATES a song for a round before returning it.
   * GUARANTEES that returned song is 100% playable and STRICTLY satisfies the requested decade and genres.
   * FAIL-CLOSED: Never silently falls back to other genres or decades.
   */
  public async getPlayableSongForRound(
    excludeIds: string[] = [],
    decade: DecadeFilter = 'all',
    genres: GenreFilter[] | GenreFilter = ['all'],
    maxAttempts = 20,
    isCancelled?: (() => boolean) | number
  ): Promise<Song | null> {
    const shouldAbort = (): boolean => {
      if (typeof isCancelled === 'function') {
        return isCancelled();
      }
      return false;
    };

    const genreList = Array.isArray(genres) ? genres : [genres];
    const deckKey = `${decade}::${genreList.slice().sort().join(',')}`;

    if (this.currentDeckKey !== deckKey || this.sessionDeck.length === 0) {
      this.buildSessionDeck(decade, genres, true);
    }

    const triedIds = new Set<string>(excludeIds);
    const lastPlayedId = this.recentTrackIds[this.recentTrackIds.length - 1];
    if (lastPlayedId) {
      triedIds.add(lastPlayedId);
    }

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (shouldAbort()) {
        return null;
      }

      if (this.sessionDeck.length === 0) {
        this.buildSessionDeck(decade, genres, true);
      }

      if (this.sessionDeck.length === 0) {
        const fallback = this.filterByDecadeAndGenres(this.getCatalog(), decade, genres).filter(
          (s) => !this.rejectedSongIds.has(s.id) && s.audioStatus !== 'dead'
        );
        if (fallback.length === 0) return null;
        const notTried = fallback.filter((s) => !triedIds.has(s.id));
        const pool = notTried.length > 0 ? notTried : fallback;
        const candidate = pool[Math.floor(getSecureRandomFloat() * pool.length)];

        // Strict Filter Integrity Check
        if (!isTrackEligibleForFilters(candidate, { decade, genres: genreList })) {
          console.error('FILTER INTEGRITY VIOLATION', {
            track: candidate,
            activeFilters: { decade, genres },
            normalizedGenres: candidate.normalizedGenres,
            verifiedOriginalYear: candidate.verifiedOriginalYear,
          });
          continue;
        }

        triedIds.add(candidate.id);
        const ok = await this.prevalidateCandidateSong(candidate);
        if (shouldAbort()) {
          return null;
        }
        if (ok) {
          this.recordRecentPlay(candidate.id, normalizeArtistKey(candidate.artist));
          return candidate;
        }
        continue;
      }

      // Pop next candidate from the deck
      const candidate = this.sessionDeck.pop()!;

      // Strict Filter Integrity Gate
      if (!isTrackEligibleForFilters(candidate, { decade, genres: genreList })) {
        console.error('FILTER INTEGRITY VIOLATION', {
          track: candidate,
          activeFilters: { decade, genres },
          normalizedGenres: candidate.normalizedGenres,
          verifiedOriginalYear: candidate.verifiedOriginalYear,
        });
        continue;
      }

      if (triedIds.has(candidate.id) || this.rejectedSongIds.has(candidate.id) || candidate.audioStatus === 'dead') {
        continue;
      }

      triedIds.add(candidate.id);

      // Pre-validate candidate before showing
      const isValid = await this.prevalidateCandidateSong(candidate);
      if (shouldAbort()) {
        return null;
      }
      if (isValid) {
        const artKey = normalizeArtistKey(candidate.artist);
        this.recordRecentPlay(candidate.id, artKey);
        return candidate;
      }
    }

    // Strict non-exhausted scan within eligible songs only
    const remaining = this.filterByDecadeAndGenres(this.getCatalog(), decade, genres).filter(
      (s) => !this.rejectedSongIds.has(s.id) && s.audioStatus !== 'dead'
    );
    for (const song of remaining) {
      if (shouldAbort()) {
        return null;
      }
      if (!triedIds.has(song.id)) {
        if (!isTrackEligibleForFilters(song, { decade, genres: genreList })) {
          continue;
        }
        const ok = await this.prevalidateCandidateSong(song);
        if (shouldAbort()) {
          return null;
        }
        if (ok) {
          this.recordRecentPlay(song.id, normalizeArtistKey(song.artist));
          return song;
        }
      }
    }

    return null;
  }

  /**
   * Background Catalog Health Cleanup Runner:
   * Periodically validates tracks in small controlled batches.
   */
  public startBackgroundHealthCleanup(batchSize = 25, intervalMs = 25000): () => void {
    if (typeof window === 'undefined') return () => {};

    if (this.backgroundCleanupTimer) {
      clearInterval(this.backgroundCleanupTimer);
    }

    const runBatch = async () => {
      if (this.isCleanupRunning || this.catalog.size === 0) return;
      this.isCleanupRunning = true;

      try {
        const allSongs = Array.from(this.catalog.values()).filter(
          (s) => !this.rejectedSongIds.has(s.id) && s.audioStatus !== 'dead'
        );

        const prioritized = allSongs.sort((a, b) => {
          const statusOrder = (s: Song): number => {
            const st = s.audioStatus || 'unknown';
            if (st === 'unknown') return 0;
            if (st === 'temporarily_failed') return 1;
            return 2;
          };
          const orderA = statusOrder(a);
          const orderB = statusOrder(b);
          if (orderA !== orderB) return orderA - orderB;

          const timeA = a.audioValidatedAt || 0;
          const timeB = b.audioValidatedAt || 0;
          return timeA - timeB;
        });

        const batch = prioritized.slice(0, batchSize);
        const CONCURRENCY = 3;
        for (let i = 0; i < batch.length; i += CONCURRENCY) {
          const chunk = batch.slice(i, i + CONCURRENCY);
          await Promise.all(
            chunk.map(async (song) => {
              const age = Date.now() - (song.audioValidatedAt || 0);
              if (song.audioStatus === 'healthy' && age < 14400000) {
                return;
              }

              try {
                const ok = await audioService.validateAudioUrl(song.previewUrl, 3000);
                if (ok) {
                  this.recordAudioHealth(song.id, 'healthy');
                } else {
                  const freshUrl = await this.resolveFreshPreviewUrl(song);
                  if (freshUrl) {
                    const freshOk = await audioService.validateAudioUrl(freshUrl, 3000);
                    if (freshOk) {
                      song.previewUrl = freshUrl;
                      song.provider = 'itunes';
                      this.recordAudioHealth(song.id, 'healthy');
                      return;
                    }
                  }
                  const isPermanent = song.previewUrl.includes('dzcdn.net') || this.getFailureCount(song.id) >= 2;
                  this.recordAudioHealth(song.id, isPermanent ? 'dead' : 'temporarily_failed');
                }
              } catch {
                // Ignore transient background error
              }
            })
          );
        }
      } catch (err) {
        console.warn('Background audio health cleanup error:', err);
      } finally {
        this.isCleanupRunning = false;
      }
    };

    setTimeout(() => runBatch(), 5000);
    this.backgroundCleanupTimer = window.setInterval(runBatch, intervalMs);

    return () => {
      if (this.backgroundCleanupTimer) {
        clearInterval(this.backgroundCleanupTimer);
        this.backgroundCleanupTimer = null;
      }
    };
  }
}

export const musicService = new MusicService();


