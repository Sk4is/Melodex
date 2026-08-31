import { Song } from '../types/song';
import { DecadeFilter } from '../types/game';
import { normalizeText, fuzzyMatchSong } from '../utils/normalizeText';

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

// Diverse multi-genre seed queries grouped by era
const SEED_ARTISTS_2000S = [
  'Britney Spears',
  'Eminem',
  'Coldplay',
  'Linkin Park',
  'Beyoncé',
  'The Killers',
  'Green Day',
  'Shakira',
  'Rihanna',
  'Usher',
  'Amy Winehouse',
  'System of a Down',
  'Daft Punk',
  'Alicia Keys',
  'Gorillaz',
  'Outkast',
  '50 Cent',
  'Fall Out Boy',
  'Evanescence',
];

const SEED_ARTISTS_2010S = [
  'Adele',
  'Bruno Mars',
  'Taylor Swift',
  'Drake',
  'Avicii',
  'Katy Perry',
  'Ed Sheeran',
  'Ariana Grande',
  'Arctic Monkeys',
  'Kendrick Lamar',
  'The Weeknd',
  'Sia',
  'Imagine Dragons',
  'Calvin Harris',
  'Post Malone',
  'Lady Gaga',
  'Justin Bieber',
  'Lorde',
  'Twenty One Pilots',
];

const SEED_ARTISTS_2020S = [
  'Dua Lipa',
  'Billie Eilish',
  'Olivia Rodrigo',
  'Bad Bunny',
  'Harry Styles',
  'SZA',
  'Doja Cat',
  'Sabrina Carpenter',
  'Chappell Roan',
  'Rosalía',
  'The Kid LAROI',
  'Peso Pluma',
  'Morgan Wallen',
  'Fred again..',
  'Miley Cyrus',
  'Charli XCX',
  'Glass Animals',
];

const SEED_ARTISTS_PRE2000 = [
  'Queen',
  'Michael Jackson',
  'Madonna',
  'Prince',
  'Whitney Houston',
  'Nirvana',
  'Oasis',
  'Fleetwood Mac',
  'AC/DC',
  'ABBA',
  'The Beatles',
  'David Bowie',
  'Elton John',
  'Guns N Roses',
  'Stevie Wonder',
  'Earth Wind & Fire',
  'Bon Jovi',
  'The Police',
  'Cyndi Lauper',
  'George Michael',
];

class MusicService {
  private catalog: Map<string, Song> = new Map();
  private isCatalogLoaded = false;
  private loadPromise: Promise<Song[]> | null = null;

  /**
   * Transforms raw iTunes API record into clean internal Song model
   */
  private transformITunesTrack(raw: ITunesRawTrack): Song | null {
    if (!raw.trackId || !raw.trackName || !raw.artistName || !raw.previewUrl) {
      return null;
    }

    let year: number | undefined = undefined;
    if (raw.releaseDate) {
      const parsedDate = new Date(raw.releaseDate);
      if (!isNaN(parsedDate.getFullYear())) {
        year = parsedDate.getFullYear();
      }
    }

    // High quality artwork fallback
    let artwork = raw.artworkUrl100;
    if (artwork && artwork.includes('100x100bb')) {
      artwork = artwork.replace('100x100bb', '600x600bb');
    }

    return {
      id: String(raw.trackId),
      title: raw.trackName.trim(),
      artist: raw.artistName.trim(),
      album: raw.collectionName?.trim(),
      year,
      genre: raw.primaryGenreName?.trim(),
      artworkUrl: artwork,
      previewUrl: raw.previewUrl,
      previewStart: 0, // ready for future custom start timestamp
    };
  }

  /**
   * Fetch songs from iTunes Search API
   */
  public async fetchFromITunes(term: string, limit = 25): Promise<Song[]> {
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
        term
      )}&entity=song&limit=${limit}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`iTunes API responded with status ${response.status}`);
      }

      const data: ITunesResponse = await response.json();
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      const songs: Song[] = [];
      for (const item of data.results) {
        const song = this.transformITunesTrack(item);
        if (song && song.previewUrl) {
          songs.push(song);
        }
      }
      return songs;
    } catch (error) {
      console.error(`Failed to fetch songs for term "${term}":`, error);
      return [];
    }
  }

  /**
   * Loads initial temporary catalog of popular songs from diverse artists across decades
   */
  public async loadInitialCatalog(): Promise<Song[]> {
    if (this.isCatalogLoaded && this.catalog.size > 0) {
      return Array.from(this.catalog.values());
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      const seenSignatures = new Set<string>();

      // Sample a rich mix across all eras
      const initialSeeds = [
        ...SEED_ARTISTS_PRE2000.slice(0, 8),
        ...SEED_ARTISTS_2000S.slice(0, 8),
        ...SEED_ARTISTS_2010S.slice(0, 8),
        ...SEED_ARTISTS_2020S.slice(0, 8),
      ];

      const batchPromises = initialSeeds.map(async (artist) => {
        const tracks = await this.fetchFromITunes(artist, 10);
        return tracks;
      });

      const batchResults = await Promise.allSettled(batchPromises);

      for (const res of batchResults) {
        if (res.status === 'fulfilled') {
          for (const song of res.value) {
            const sig = normalizeText(`${song.title} ${song.artist}`);
            if (!this.catalog.has(song.id) && !seenSignatures.has(sig)) {
              this.catalog.set(song.id, song);
              seenSignatures.add(sig);
            }
          }
        }
      }

      // Background fetch the rest to expand the catalog seamlessly
      this.expandCatalogBackground();

      if (this.catalog.size === 0) {
        throw new Error('Could not load songs from music provider. Please check your internet connection.');
      }

      this.isCatalogLoaded = true;
      return Array.from(this.catalog.values());
    })();

    return this.loadPromise;
  }

  private async expandCatalogBackground() {
    const remainingSeeds = [
      ...SEED_ARTISTS_PRE2000.slice(8),
      ...SEED_ARTISTS_2000S.slice(8),
      ...SEED_ARTISTS_2010S.slice(8),
      ...SEED_ARTISTS_2020S.slice(8),
    ];

    for (const artist of remainingSeeds) {
      try {
        const tracks = await this.fetchFromITunes(artist, 10);
        for (const song of tracks) {
          const sig = normalizeText(`${song.title} ${song.artist}`);
          const already = Array.from(this.catalog.values()).some(
            (c) => normalizeText(`${c.title} ${c.artist}`) === sig
          );
          if (!this.catalog.has(song.id) && !already) {
            this.catalog.set(song.id, song);
          }
        }
      } catch {
        // Background ignore
      }
    }
  }

  /**
   * Get full in-memory catalog
   */
  public getCatalog(): Song[] {
    return Array.from(this.catalog.values());
  }

  /**
   * Get single song by ID
   */
  public getSongById(id: string): Song | undefined {
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
   * Search songs in catalog and/or live music service.
   * Auto-completes matching songs from in-memory pool and augments with live search if needed.
   */
  public async searchSongs(query: string, limit = 10): Promise<Song[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    // Filter in-memory catalog
    const catalogMatches = Array.from(this.catalog.values()).filter((song) =>
      fuzzyMatchSong(song.title, song.artist, trimmed)
    );

    if (catalogMatches.length >= limit) {
      return catalogMatches.slice(0, limit);
    }

    // Live iTunes search for complete suggestions
    try {
      const liveTracks = await this.fetchFromITunes(trimmed, limit);
      for (const track of liveTracks) {
        const sig = normalizeText(`${track.title} ${track.artist}`);
        const exists = catalogMatches.some(
          (m) => normalizeText(`${m.title} ${m.artist}`) === sig
        );
        if (!exists) {
          catalogMatches.push(track);
          if (!this.catalog.has(track.id)) {
            this.catalog.set(track.id, track);
          }
        }
      }
    } catch {
      // Return local matches
    }

    return catalogMatches.slice(0, limit);
  }

  /**
   * Pick a random song from catalog avoiding given excludeIds and respecting decade filter
   */
  public getRandomSong(excludeIds: string[] = [], decade: DecadeFilter = 'all'): Song | null {
    const all = Array.from(this.catalog.values());
    if (all.length === 0) return null;

    const decadeFiltered = this.filterByDecade(all, decade);
    const candidatePool = decadeFiltered.length > 0 ? decadeFiltered : all;

    const excludeSet = new Set(excludeIds);
    const available = candidatePool.filter((s) => !excludeSet.has(s.id));

    const finalPool = available.length > 0 ? available : candidatePool;
    const randomIndex = Math.floor(Math.random() * finalPool.length);
    return finalPool[randomIndex] || null;
  }
}

export const musicService = new MusicService();
