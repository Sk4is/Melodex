import { Song } from '../types/song';
import { DecadeFilter } from '../types/game';
import { normalizeText, fuzzyMatchSong } from '../utils/normalizeText';
import prebuiltCatalog from '../data/melodex-catalog.json';

export interface ITunesRawTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  releaseDate?: string;
  primaryGenreName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
}

export interface ITunesResponse {
  resultCount: number;
  results: ITunesRawTrack[];
}

class MusicService {
  private catalog: Map<string, Song> = new Map();
  private rejectedSongIds: Set<string> = new Set();
  private isCatalogLoaded = false;
  private loadPromise: Promise<Song[]> | null = null;

  constructor() {
    this.bootstrapCatalog();
  }

  /**
   * Initializes catalog with prebuilt verified songs
   */
  private bootstrapCatalog() {
    try {
      if (Array.isArray(prebuiltCatalog)) {
        for (const item of prebuiltCatalog as Song[]) {
          if (item && item.id && item.previewUrl && item.year) {
            this.catalog.set(item.id, item);
          }
        }
      }
    } catch {
      // Will fall back to dynamic load if needed
    }
  }

  /**
   * Blacklist a song in the current session (e.g. if audio unexpectedly fails at runtime)
   */
  public rejectSong(songId: string): void {
    if (!songId) return;
    this.rejectedSongIds.add(songId);
    this.catalog.delete(songId);
  }

  /**
   * Check if a song has been blacklisted in this session
   */
  public isSongRejected(songId: string): boolean {
    return this.rejectedSongIds.has(songId);
  }

  /**
   * Loads initial verified catalog
   */
  public async loadInitialCatalog(): Promise<Song[]> {
    if (this.isCatalogLoaded && this.catalog.size > 0) {
      return this.getCatalog();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      // If prebuilt catalog is populated, use it immediately
      if (this.catalog.size > 0) {
        this.isCatalogLoaded = true;
        return this.getCatalog();
      }

      // Try fetching public static catalog
      try {
        const res = await fetch('/melodex-catalog.json');
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            for (const item of list) {
              if (item?.id && item?.previewUrl && item?.year && !this.rejectedSongIds.has(item.id)) {
                this.catalog.set(item.id, item);
              }
            }
          }
        }
      } catch {
        // Fallback
      }

      this.isCatalogLoaded = true;
      return this.getCatalog();
    })();

    return this.loadPromise;
  }

  /**
   * Get full in-memory playable verified catalog
   */
  public getCatalog(): Song[] {
    return Array.from(this.catalog.values()).filter((s) => !this.rejectedSongIds.has(s.id));
  }

  /**
   * Get single song by ID
   */
  public getSongById(id: string): Song | undefined {
    if (this.rejectedSongIds.has(id)) return undefined;
    return this.catalog.get(id);
  }

  /**
   * Filter songs matching a decade criterion
   */
  public filterByDecade(songs: Song[], decade: DecadeFilter): Song[] {
    if (decade === 'all') return songs;

    return songs.filter((song) => {
      if (song.year === undefined) return false;
      if (decade === 'pre2000') {
        return song.year < 2000;
      }
      if (decade === '2000s') {
        return song.year >= 2000 && song.year <= 2009;
      }
      if (decade === '2010s') {
        return song.year >= 2010 && song.year <= 2019;
      }
      if (decade === '2020s') {
        return song.year >= 2020 && song.year <= 2029;
      }
      return true;
    });
  }

  /**
   * Search verified songs in catalog only.
   * Ensures autocomplete contains ONLY 100% verified playable songs.
   */
  public async searchSongs(query: string, limit = 10): Promise<Song[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const playablePool = this.getCatalog();
    const catalogMatches = playablePool.filter((song) =>
      fuzzyMatchSong(song.title, song.artist, trimmed)
    );

    return catalogMatches.slice(0, limit);
  }

  /**
   * Pick a random song from catalog avoiding given excludeIds and respecting decade filter
   */
  public getRandomSong(excludeIds: string[] = [], decade: DecadeFilter = 'all'): Song | null {
    const all = this.getCatalog();
    if (all.length === 0) return null;

    const decadeFiltered = this.filterByDecade(all, decade);
    const candidatePool = decadeFiltered.length > 0 ? decadeFiltered : all;

    const excludeSet = new Set([...excludeIds, ...this.rejectedSongIds]);
    const available = candidatePool.filter((s) => !excludeSet.has(s.id));

    const finalPool = available.length > 0 ? available : candidatePool;
    const randomIndex = Math.floor(Math.random() * finalPool.length);
    return finalPool[randomIndex] || null;
  }
}

export const musicService = new MusicService();
