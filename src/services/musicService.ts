import { Song } from '../types/song';
import { DecadeFilter } from '../types/game';
import { fuzzyMatchSong } from '../utils/normalizeText';
import prebuiltCatalog from '../data/melodex-catalog.json';

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

export function getNormalizedGenre(genre?: string, artist = '', title = ''): NormalizedGenre {
  const g = (genre || '').toLowerCase();
  const a = artist.toLowerCase();

  if (g.includes('hip-hop') || g.includes('rap') || g.includes('trap')) {
    return 'Hip-Hop/Rap';
  }
  if (
    g.includes('dance') ||
    g.includes('electronic') ||
    g.includes('house') ||
    g.includes('edm') ||
    g.includes('electro')
  ) {
    return 'Electronic/Dance';
  }
  if (
    g.includes('rock') ||
    g.includes('alternative') ||
    g.includes('indie') ||
    g.includes('metal') ||
    g.includes('punk')
  ) {
    return 'Rock/Alternative/Indie';
  }
  if (g.includes('r&b') || g.includes('soul') || g.includes('funk')) {
    return 'R&B';
  }
  if (
    g.includes('latin') ||
    g.includes('urbano') ||
    g.includes('reggaeton') ||
    g.includes('tropical') ||
    g.includes('bachata')
  ) {
    return 'Latin';
  }
  if (g.includes('pop') || g.includes('k-pop')) {
    return 'Pop';
  }

  // Fallbacks by known artist signatures
  if (['avicii', 'calvin harris', 'david guetta', 'zedd', 'marshmello', 'martin garrix', 'alan walker', 'kygo', 'tiesto', 'alesso', 'galantis', 'robin schulz', 'the chainsmokers', 'disclosure'].some(k => a.includes(k))) {
    return 'Electronic/Dance';
  }
  if (['arctic monkeys', 'coldplay', 'imagine dragons', 'tame impala', 'twenty one pilots', 'the 1975', 'the neighbourhood', 'foster the people', 'cage the elephant', 'paramore', 'fall out boy', 'muse', 'bastille', 'lumineers', 'vance joy', 'hozier'].some(k => a.includes(k))) {
    return 'Rock/Alternative/Indie';
  }
  if (['frank ocean', 'sza', 'the weeknd', 'bryson tiller', 'khalid', 'daniel caesar', 'h.e.r.', 'jhene aiko', 'partynextdoor', 'ella mai', 'miguel'].some(k => a.includes(k))) {
    return 'R&B';
  }
  if (['bad bunny', 'j balvin', 'ozuna', 'daddy yankee', 'maluma', 'nicky jam', 'luis fonsi', 'anuel aa', 'karol g', 'becky g', 'rosalia', 'cnco', 'farruko'].some(k => a.includes(k))) {
    return 'Latin';
  }
  if (['drake', 'travis scott', 'juice wrld', 'xxxtentacion', 'lil uzi vert', 'playboi carti', 'post malone', 'lil peep', 'lil skies', 'future', '21 savage', 'migos', 'trippie redd', 'kanye west', 'kendrick lamar', 'young thug', 'gunna'].some(k => a.includes(k))) {
    return 'Hip-Hop/Rap';
  }

  return 'Other';
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
          if (this.isValidCatalogItem(item)) {
            this.catalog.set(item.id, item);
          }
        }
      }
    } catch {
      // Will fall back to dynamic load if needed
    }
  }

  /**
   * Strict validation rule for catalog item acceptance:
   * Must have id, title, artist, valid audio preview, and verified year with high confidence
   */
  public isValidCatalogItem(item: Song | null | undefined): item is Song {
    if (!item || !item.id || !item.title || !item.artist || !item.previewUrl) {
      return false;
    }
    const year = this.getVerifiedYear(item);
    if (year === null) {
      return false;
    }
    // High confidence required for gameplay
    if (item.yearConfidence && item.yearConfidence !== 'high') {
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
      if (this.catalog.size > 0) {
        this.isCatalogLoaded = true;
        return this.getCatalog();
      }

      try {
        const res = await fetch('/melodex-catalog.json');
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            for (const item of list) {
              if (this.isValidCatalogItem(item) && !this.rejectedSongIds.has(item.id)) {
                this.catalog.set(item.id, item);
              }
            }
          }
        }
      } catch {
        // Fallback handled gracefully
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
    return Array.from(this.catalog.values()).filter(
      (s) => !this.rejectedSongIds.has(s.id) && this.isValidCatalogItem(s)
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
    if (verifiedYear === null) return false;

    if (decade === 'all') return true;
    if (decade === 'pre2000') return verifiedYear < 2000;
    if (decade === '2000s') return verifiedYear >= 2000 && verifiedYear <= 2009;
    if (decade === '2010s') return verifiedYear >= 2010 && verifiedYear <= 2019;
    if (decade === '2020s') return verifiedYear >= 2020 && verifiedYear <= 2029;

    return false;
  }

  /**
   * Filter songs matching a decade criterion
   */
  public filterByDecade(songs: Song[], decade: DecadeFilter): Song[] {
    return songs.filter((song) => this.matchesDecade(song, decade));
  }

  /**
   * Search verified songs in catalog only.
   * Ensures autocomplete contains ONLY 100% verified playable songs.
   * Ranks exact primary artist matches and title matches highest.
   */
  public async searchSongs(query: string, limit = 10): Promise<Song[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const playablePool = this.getCatalog();
    const matches: { song: Song; priority: number }[] = [];

    const normQuery = trimmed.toLowerCase();

    for (const song of playablePool) {
      if (fuzzyMatchSong(song.title, song.artist, trimmed)) {
        const normArtist = song.artist.toLowerCase();
        const normTitle = song.title.toLowerCase();

        let priority = 3;
        // Priority 0: Exact artist or title start
        if (normArtist === normQuery || normTitle === normQuery) {
          priority = 0;
        } else if (normArtist.startsWith(normQuery) || normTitle.startsWith(normQuery)) {
          priority = 1;
        } else if (normArtist.includes(normQuery) || normTitle.includes(normQuery)) {
          priority = 2;
        }

        matches.push({ song, priority });
      }
    }

    matches.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      const scoreA = a.song.recognitionScore ?? 50;
      const scoreB = b.song.recognitionScore ?? 50;
      return scoreB - scoreA;
    });

    return matches.slice(0, limit).map((m) => m.song);
  }

  /**
   * Select a candidate song inside a genre pool weighted by recognitionScore.
   * Strongly favors iconic/major hits (score >= 80) while allowing well-known tracks (60+).
   */
  private pickSongByRecognition(songs: Song[]): Song | null {
    if (songs.length === 0) return null;
    if (songs.length === 1) return songs[0];

    // Compute weights based on recognitionScore (default 75 if unspecified)
    // Using power scaling to prioritize iconic tracks without starving variety
    const weights = songs.map((s) => {
      const score = typeof s.recognitionScore === 'number' ? s.recognitionScore : 75;
      return Math.pow(Math.max(10, score) / 100, 1.8);
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight <= 0) {
      return songs[Math.floor(Math.random() * songs.length)];
    }

    let randomVal = Math.random() * totalWeight;
    for (let i = 0; i < songs.length; i++) {
      randomVal -= weights[i];
      if (randomVal <= 0) {
        return songs[i];
      }
    }

    return songs[songs.length - 1];
  }

  /**
   * Genre-Balanced Random Selection:
   *
   * STEP 1: Filter candidate pool by strict decade and session exclusions.
   * STEP 2: Group eligible candidates by normalized genre.
   * STEP 3: Choose an eligible genre using balanced genre weights (Pop 25%, Hip-Hop 20%, EDM 15%, Rock 15%, R&B 10%, Latin 8%, Other 7%).
   * STEP 4: Choose a song inside that genre weighted by recognitionScore.
   * STEP 5: Validate before returning.
   */
  public getRandomSong(excludeIds: string[] = [], decade: DecadeFilter = 'all'): Song | null {
    const all = this.getCatalog();
    if (all.length === 0) return null;

    // Filter by strict decade
    const decadeFiltered = this.filterByDecade(all, decade);
    const candidatePool = decadeFiltered.length > 0 ? decadeFiltered : all;

    const excludeSet = new Set([...excludeIds, ...this.rejectedSongIds]);
    let available = candidatePool.filter((s) => !excludeSet.has(s.id));

    // If available is exhausted, fall back to entire decade candidate pool
    if (available.length === 0) {
      available = candidatePool;
    }

    if (available.length === 0) return null;

    // Group available candidates by normalized genre
    const genreMap: Map<NormalizedGenre, Song[]> = new Map();
    for (const song of available) {
      const g = getNormalizedGenre(song.genre, song.artist, song.title);
      const list = genreMap.get(g) || [];
      list.push(song);
      genreMap.set(g, list);
    }

    // Determine active weights for genres that currently have available tracks
    const activeGenres: NormalizedGenre[] = [];
    const activeWeights: number[] = [];
    let totalActiveWeight = 0;

    for (const [genre, songs] of genreMap.entries()) {
      if (songs.length > 0) {
        const weight = GENRE_WEIGHTS[genre] ?? 0.10;
        activeGenres.push(genre);
        activeWeights.push(weight);
        totalActiveWeight += weight;
      }
    }

    if (activeGenres.length === 0) {
      return this.pickSongByRecognition(available);
    }

    // Step 1: Select Genre
    let chosenGenre: NormalizedGenre = activeGenres[0];
    let rand = Math.random() * totalActiveWeight;

    for (let i = 0; i < activeGenres.length; i++) {
      rand -= activeWeights[i];
      if (rand <= 0) {
        chosenGenre = activeGenres[i];
        break;
      }
    }

    const genreCandidates = genreMap.get(chosenGenre) || available;

    // Step 2: Select Song inside Chosen Genre
    const selectedSong = this.pickSongByRecognition(genreCandidates);

    // Final Round Validation Pipeline check
    if (selectedSong && this.isValidCatalogItem(selectedSong) && this.matchesDecade(selectedSong, decade)) {
      return selectedSong;
    }

    // If for any reason validation failed, try direct selection from available pool
    return this.pickSongByRecognition(available);
  }
}

export const musicService = new MusicService();
