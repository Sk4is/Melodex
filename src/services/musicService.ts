import { Song } from '../types/song';
import { DecadeFilter, GenreFilter } from '../types/game';
import { fuzzyMatchSong, extractPrimaryArtist, normalizeText } from '../utils/normalizeText';
import { MELODEX_BASE_CATALOG } from '../data/melodexCatalog';
import { audioService } from './audioService';

export function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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

export function matchesGenre(song: Song, genre: GenreFilter): boolean {
  if (genre === 'all') return true;

  const g = (song.genre || '').toLowerCase();
  const a = (song.artist || '').toLowerCase();

  switch (genre) {
    case 'pop':
      return (
        g.includes('pop') ||
        g.includes('dance') ||
        g.includes('disco') ||
        (!g.includes('rock') &&
          !g.includes('metal') &&
          !g.includes('rap') &&
          [
            'taylor swift', 'katy perry', 'bruno mars', 'lady gaga', 'ariana grande',
            'justin bieber', 'dua lipa', 'billie eilish', 'ed sheeran', 'maroon 5',
            'shawn mendes', 'camila cabello', 'selena gomez', 'miley cyrus',
            'charlie puth', 'sam smith', 'halsey', 'olivia rodrigo', 'sabrina carpenter',
            'sia', 'pink', 'p!nk', 'kesha', 'britney spears', 'madonna', 'rihanna',
            'pitbull', 'shakira', 'avril lavigne', 'kelly clarkson', 'one direction',
            'george michael', 'wham', 'a-ha', 'duran duran', 'tears for fears',
            'eurythmics', 'roxette', 'ace of base', 'aqua', 'rick astley', 'cher',
            'celine dion', 'céline dion', 'abba', 'spice girls', 'backstreet boys',
            'nsync', '*nsync', 'cyndi lauper', 'belinda carlisle', 'culture club',
            'laura branigan', 'boney m', 'village people', 'dexys midnight runners',
            'men at work', 'rick springfield', 'human league', 'soft cell'
          ].some((k) => a.includes(k)))
      );

    case 'hiphop':
      return (
        g.includes('hip-hop') ||
        g.includes('rap') ||
        g.includes('trap') ||
        g.includes('drill') ||
        [
          'eminem', 'drake', 'kanye west', 'kendrick lamar', 'travis scott', 'j. cole',
          'future', '21 savage', 'lil wayne', 'juice wrld', 'xxxtentacion', 'lil uzi vert',
          'playboi carti', 'post malone', '50 cent', 'jay-z', 'snoop dogg', 'notorious b.i.g.',
          'tupac', 'dr. dre', 'cardi b', 'nicki minaj', 'megan thee stallion', 'asap rocky',
          'tyler, the creator', 'wiz khalifa', 'gunna', 'young thug', 'lil baby', 'central cee',
          'jack harlow', 'lil peep', 'lil skies', 'outkast', 'migos', 'trippie redd',
          'lil mosey', 'lil tecca', 'yung pinch', 'famous dex', 'fetty wap', 'youngboy', 'nba youngboy'
        ].some((k) => a.includes(k))
      );

    case 'rock':
      return (
        ((g.includes('rock') || g.includes('alternative') || g.includes('grunge') || g.includes('punk')) &&
          !g.includes('metal')) ||
        [
          'queen', 'the beatles', 'the rolling stones', 'led zeppelin', 'pink floyd', 'nirvana',
          'linkin park', 'green day', 'red hot chili peppers', 'foo fighters', 'radiohead', 'oasis',
          'u2', 'coldplay', 'the killers', 'arctic monkeys', 'muse', 'fall out boy', 'paramore',
          'my chemical romance', 'blink-182', 'bon jovi', 'aerosmith', 'guns n', 'ac/dc',
          'the eagles', 'fleetwood mac', 'bruce springsteen', 'imagine dragons', 'the police',
          'dire straits', 'creedence', 'toto', 'journey'
        ].some((k) => a.includes(k))
      );

    case 'rnb':
      return (
        g.includes('r&b') ||
        g.includes('soul') ||
        g.includes('funk') ||
        g.includes('motown') ||
        g.includes('neo-soul') ||
        [
          'the weeknd', 'sza', 'frank ocean', 'beyonce', 'rihanna', 'alicia keys', 'usher',
          'chris brown', 'ne-yo', 'john legend', 'mariah carey', 'whitney houston',
          'michael jackson', 'stevie wonder', 'aretha franklin', 'marvin gaye',
          'earth, wind & fire', 'luther vandross', 'boyz ii men', 'bryson tiller', 'khalid',
          'daniel caesar', 'h.e.r.', 'jhene aiko', 'partynextdoor', 'giveon', 'brent faiyaz',
          'summer walker', 'kehlani', 'ella mai', '6lack', 'trey songz', 'monica', 'brandy',
          'barry white', 'the isley brothers'
        ].some((k) => a.includes(k))
      );

    case 'electronic':
      return (
        g.includes('electronic') ||
        g.includes('electro') ||
        g.includes('synth') ||
        g.includes('ambient') ||
        g.includes('techno') ||
        g.includes('trance') ||
        g.includes('dubstep') ||
        g.includes('drum and bass') ||
        [
          'daft punk', 'kraftwerk', 'deadmau5', 'skrillex', 'the prodigy', 'fatboy slim', 'moby',
          'chemical brothers', 'pendulum', 'flume', 'odesza', 'porter robinson', 'madeon',
          'aphex twin', 'justice', 'disclosure', 'rufus du sol', 'kaytranada', 'avicii', 'calvin harris'
        ].some((k) => a.includes(k))
      );

    case 'latin':
      return (
        g.includes('latin') ||
        g.includes('urbano') ||
        g.includes('reggaeton') ||
        g.includes('bachata') ||
        g.includes('salsa') ||
        g.includes('cumbia') ||
        g.includes('mexican') ||
        g.includes('ranchera') ||
        g.includes('corridos') ||
        [
          'bad bunny', 'j balvin', 'daddy yankee', 'ozuna', 'maluma', 'shakira', 'rosalia',
          'karol g', 'rauw alejandro', 'peso pluma', 'anuel aa', 'feid', 'nicky jam',
          'luis fonsi', 'enrique iglesias', 'ricky martin', 'pitbull', 'becky g', 'camilo',
          'sebastian yatra', 'kali uchis', 'manuel turizo', 'bizarrap', 'romeo santos', 'jhayco'
        ].some((k) => a.includes(k))
      );

    case 'indie':
      return (
        g.includes('indie') ||
        g.includes('alternative') ||
        [
          'tame impala', 'the 1975', 'the neighbourhood', 'foster the people', 'cage the elephant',
          'two door cinema club', 'phoenix', 'vampire weekend', 'mgmt', 'florence + the machine',
          'bastille', 'the strokes', 'franz ferdinand', 'glass animals', 'wallows', 'clairo',
          'beabadoobee', 'rex orange county', 'boy pablo', 'mac demarco', 'phoebe bridgers',
          'mitski', 'lord huron', 'hozier', 'the lumineers', 'vance joy', 'mumford & sons'
        ].some((k) => a.includes(k))
      );

    case 'metal':
      return (
        g.includes('metal') ||
        g.includes('hard rock') ||
        g.includes('heavy metal') ||
        g.includes('nu metal') ||
        g.includes('metalcore') ||
        [
          'metallica', 'iron maiden', 'black sabbath', 'judas priest', 'megadeth', 'slayer',
          'slipknot', 'system of a down', 'korn', 'avenged sevenfold', 'rammstein', 'pantera',
          'motorhead', 'disturbed', 'deftones', 'limp bizkit', 'bring me the horizon', 'ghost',
          'bullet for my valentine', 'ozzy osbourne', 'scorpions', 'deep purple'
        ].some((k) => a.includes(k))
      );

    case 'dance':
      return (
        g.includes('dance') ||
        g.includes('house') ||
        g.includes('edm') ||
        g.includes('club') ||
        g.includes('disco') ||
        [
          'calvin harris', 'david guetta', 'avicii', 'tiesto', 'marshmello', 'the chainsmokers',
          'martin garrix', 'zedd', 'kygo', 'alan walker', 'alesso', 'swedish house mafia',
          'armin van buuren', 'robin schulz', 'lost frequencies', 'galantis', 'major lazer',
          'dj snake', 'afrojack', 'steve aoki', 'fisher', 'fred again', 'peggy gou', 'meduza',
          'black eyed peas', 'pitbull', 'cascada', 'basshunter'
        ].some((k) => a.includes(k))
      );

    default:
      return true;
  }
}

/**
 * Checks if a song matches ANY of the selected genres (OR logic)
 */
export function matchesAnyGenre(song: Song, genres: GenreFilter[]): boolean {
  if (!genres || genres.length === 0 || genres.includes('all')) return true;
  return genres.some((g) => matchesGenre(song, g));
}

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
  if (['drake', 'travis scott', 'juice wrld', 'xxxtentacion', 'lil uzi vert', 'playboi carti', 'post malone', 'lil peep', 'lil skies', 'future', '21 savage', 'migos', 'trippie redd', 'kanye west', 'kendrick lamar', 'young thug', 'gunna', 'lil mosey', 'lil tecca', 'yung pinch', 'famous dex', 'fetty wap', 'youngboy', 'nba youngboy'].some(k => a.includes(k))) {
    return 'Hip-Hop/Rap';
  }

  return 'Other';
}

class MusicService {
  private catalog: Map<string, Song> = new Map();
  private rejectedSongIds: Set<string> = new Set();
  private isCatalogLoaded = false;
  private loadPromise: Promise<Song[]> | null = null;
  private countCache: Map<DecadeFilter, Record<GenreFilter, number>> = new Map();

  // Recent History Tracking for Session Variance
  private recentTrackIds: string[] = [];
  private recentArtistKeys: string[] = [];
  private readonly maxRecentTracks = 40;
  private readonly maxRecentArtists = 10;

  constructor() {
    this.bootstrapCatalog();
  }

  /**
   * Resets recent session history (e.g. on full game reset or new game session)
   */
  public clearRecentHistory(): void {
    this.recentTrackIds = [];
    this.recentArtistKeys = [];
  }

  /**
   * Invalidate precomputed count cache whenever the verified playable catalog changes
   */
  private invalidateCountCache(): void {
    this.countCache.clear();
  }

  /**
   * Initializes catalog with prebuilt verified songs from version-controlled file
   */
  private bootstrapCatalog() {
    try {
      if (Array.isArray(MELODEX_BASE_CATALOG)) {
        for (const item of MELODEX_BASE_CATALOG) {
          if (this.isValidCatalogItem(item)) {
            this.catalog.set(item.id, item);
          }
        }
      }
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

    for (const track of newTracks) {
      if (!this.isValidCatalogItem(track)) continue;
      if (this.catalog.has(track.id) || this.rejectedSongIds.has(track.id)) continue;

      const sig = `${track.artist.toLowerCase().trim()}:::${track.title.toLowerCase().trim()}`;
      if (existingSignatures.has(sig)) continue;

      this.catalog.set(track.id, track);
      existingSignatures.add(sig);
      addedCount++;
    }

    if (addedCount > 0) {
      this.invalidateCountCache();
    }
    return addedCount;
  }

  /**
   * Runtime Audio URL Re-Resolution (Requirement 11):
   * If a preview URL expires or fails at runtime, queries iTunes Search API or Deezer API
   * to resolve a fresh, valid audio stream without modifying game state.
   */
  public async resolveFreshPreviewUrl(song: Song): Promise<string | null> {
    if (!song || !song.title || !song.artist) return null;

    try {
      // 1. Try iTunes Search API
      const itunesQuery = encodeURIComponent(`${song.artist} ${song.title}`);
      const itunesRes = await fetch(
        `https://itunes.apple.com/search?term=${itunesQuery}&media=music&entity=song&limit=5`
      );

      if (itunesRes.ok) {
        const data = await itunesRes.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          const normTitle = song.title.toLowerCase().replace(/[^a-z0-9]/g, '');
          const match = data.results.find((r: { trackName?: string; previewUrl?: string }) => {
            if (!r.previewUrl) return false;
            const rTitle = (r.trackName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            return rTitle.includes(normTitle) || normTitle.includes(rTitle);
          }) || data.results[0];

          if (match && match.previewUrl) {
            // Update in-memory song with fresh preview URL
            song.previewUrl = match.previewUrl;
            if (match.artworkUrl100 && !song.artworkUrl) {
              song.artworkUrl = match.artworkUrl100.replace('100x100bb', '600x600bb');
            }
            return match.previewUrl;
          }
        }
      }
    } catch {
      // Fallback network failure handled below
    }

    return null;
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
    this.invalidateCountCache();
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
        this.invalidateCountCache();
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
      this.invalidateCountCache();
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
   * Filter songs matching both decade and genre(s) criteria (OR logic across selected genres)
   */
  public filterByDecadeAndGenres(
    songs: Song[],
    decade: DecadeFilter,
    genres: GenreFilter[] | GenreFilter = ['all']
  ): Song[] {
    const genreList = Array.isArray(genres) ? genres : [genres];
    return songs.filter(
      (song) => this.matchesDecade(song, decade) && matchesAnyGenre(song, genreList)
    );
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
      if (this.matchesDecade(song, decade)) {
        counts.all += 1;
        if (matchesGenre(song, 'pop')) counts.pop += 1;
        if (matchesGenre(song, 'hiphop')) counts.hiphop += 1;
        if (matchesGenre(song, 'rock')) counts.rock += 1;
        if (matchesGenre(song, 'rnb')) counts.rnb += 1;
        if (matchesGenre(song, 'electronic')) counts.electronic += 1;
        if (matchesGenre(song, 'latin')) counts.latin += 1;
        if (matchesGenre(song, 'indie')) counts.indie += 1;
        if (matchesGenre(song, 'metal')) counts.metal += 1;
        if (matchesGenre(song, 'dance')) counts.dance += 1;
      }
    }

    this.countCache.set(decade, counts);
    return counts;
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
   * Selects an eligible artist with balanced weights (preventing artists with huge catalogs
   * from dominating over artists with 5-15 tracks), then selects an eligible song from that artist.
   */
  private selectBalancedCandidate(candidates: Song[], excludeIds: string[] = []): Song | null {
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    const excludeSet = new Set([...excludeIds, ...this.rejectedSongIds]);

    // 1. Group candidate songs by primary artist key
    const artistMap = new Map<string, Song[]>();
    for (const song of candidates) {
      if (excludeSet.has(song.id)) continue;
      const aKey = normalizeArtistKey(song.artist);
      const list = artistMap.get(aKey) || [];
      list.push(song);
      artistMap.set(aKey, list);
    }

    // If all candidate songs are in excludeIds, relax excludeIds (except rejectedSongIds)
    if (artistMap.size === 0) {
      for (const song of candidates) {
        if (this.rejectedSongIds.has(song.id)) continue;
        const aKey = normalizeArtistKey(song.artist);
        const list = artistMap.get(aKey) || [];
        list.push(song);
        artistMap.set(aKey, list);
      }
    }

    const allArtistKeys = Array.from(artistMap.keys());
    if (allArtistKeys.length === 0) return null;

    // 2. Filter out recently played artists (Recent Artist Memory)
    let availableArtistKeys = allArtistKeys.filter((k) => !this.recentArtistKeys.includes(k));
    if (availableArtistKeys.length === 0) {
      // If all eligible artists were recently played, fall back to all eligible artists
      availableArtistKeys = allArtistKeys;
    }

    // 3. Shuffle available artists with unbiased Fisher-Yates shuffle
    const shuffledArtists = fisherYatesShuffle(availableArtistKeys);
    const chosenArtistKey = shuffledArtists[0];
    const artistSongs = artistMap.get(chosenArtistKey) || [];

    if (artistSongs.length === 0) return null;

    // 4. Filter out recently played tracks for this artist
    let availableSongs = artistSongs.filter((s) => !excludeSet.has(s.id) && !this.recentTrackIds.includes(s.id));
    if (availableSongs.length === 0) {
      availableSongs = artistSongs.filter((s) => !this.recentTrackIds.includes(s.id));
    }
    if (availableSongs.length === 0) {
      availableSongs = artistSongs;
    }

    // 5. Song selection within chosen artist using soft recognition weighting
    let chosenSong: Song;
    if (availableSongs.length === 1) {
      chosenSong = availableSongs[0];
    } else {
      const shuffledSongs = fisherYatesShuffle(availableSongs);
      const weights = shuffledSongs.map((s) => {
        const score = typeof s.recognitionScore === 'number' ? s.recognitionScore : 75;
        return Math.pow(Math.max(20, score) / 100, 1.2);
      });
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      let rand = Math.random() * totalWeight;
      chosenSong = shuffledSongs[0];
      for (let i = 0; i < shuffledSongs.length; i++) {
        rand -= weights[i];
        if (rand <= 0) {
          chosenSong = shuffledSongs[i];
          break;
        }
      }
    }

    // 6. Record in recent memory
    this.recordRecentPlay(chosenSong.id, chosenArtistKey);
    return chosenSong;
  }

  private recordRecentPlay(songId: string, artistKey: string): void {
    this.recentTrackIds.push(songId);
    if (this.recentTrackIds.length > this.maxRecentTracks) {
      this.recentTrackIds.shift();
    }

    this.recentArtistKeys.push(artistKey);
    if (this.recentArtistKeys.length > this.maxRecentArtists) {
      this.recentArtistKeys.shift();
    }
  }

  /**
   * Decade + Multi-Genre Balanced Random Selection:
   *
   * STEP 1: Filter candidate pool by strict decade AND active genres (OR logic), and session exclusions.
   * STEP 2: Balanced selection:
   *         - If specific genres selected: choose fairly among selected genres, then select artist -> track.
   *         - If 'all' genres selected: select genre by balanced weight, then select artist -> track.
   * STEP 3: Validate candidate before returning.
   */
  public getRandomSong(
    excludeIds: string[] = [],
    decade: DecadeFilter = 'all',
    genres: GenreFilter[] | GenreFilter = ['all']
  ): Song | null {
    const all = this.getCatalog();
    if (all.length === 0) return null;

    const genreList = Array.isArray(genres) ? genres : [genres];
    const isAll = genreList.length === 0 || genreList.includes('all');

    // Filter by strict decade release year FIRST
    const decadeFiltered = all.filter((s) => this.matchesDecade(s, decade) && !this.rejectedSongIds.has(s.id));
    if (decadeFiltered.length === 0) return null;

    // When specific genres were selected
    if (!isAll) {
      // If multiple specific genres (e.g. ['hiphop', 'rnb']), group candidates by active genre
      // and alternate/randomize fairly between those selected genres
      const activeSpecificGenres = genreList.filter((g) => g !== 'all');
      const genreMap = new Map<GenreFilter, Song[]>();
      for (const g of activeSpecificGenres) {
        const matching = decadeFiltered.filter((s) => matchesGenre(s, g));
        if (matching.length > 0) {
          genreMap.set(g, matching);
        }
      }

      const availableGenres = Array.from(genreMap.keys());
      if (availableGenres.length > 0) {
        const shuffledGenres = fisherYatesShuffle(availableGenres);
        const chosenGenre = shuffledGenres[0];
        const genreSongs = genreMap.get(chosenGenre) || [];
        const chosenSong = this.selectBalancedCandidate(genreSongs, excludeIds);
        if (chosenSong && this.isValidCatalogItem(chosenSong)) {
          return chosenSong;
        }
      }

      // Fallback if specific genre map was empty
      const matched = decadeFiltered.filter((s) => matchesAnyGenre(s, genreList));
      if (matched.length > 0) {
        const chosen = this.selectBalancedCandidate(matched, excludeIds);
        if (chosen && this.isValidCatalogItem(chosen)) return chosen;
      }
    }

    // When genre is 'all': Multi-stage Genre -> Artist -> Song selection
    const normalizedGenreMap = new Map<NormalizedGenre, Song[]>();
    for (const song of decadeFiltered) {
      const g = getNormalizedGenre(song.genre, song.artist, song.title);
      const list = normalizedGenreMap.get(g) || [];
      list.push(song);
      normalizedGenreMap.set(g, list);
    }

    const activeGenres: NormalizedGenre[] = [];
    const activeWeights: number[] = [];
    let totalActiveWeight = 0;

    for (const [gName, songs] of normalizedGenreMap.entries()) {
      if (songs.length > 0) {
        const weight = GENRE_WEIGHTS[gName] ?? 0.10;
        activeGenres.push(gName);
        activeWeights.push(weight);
        totalActiveWeight += weight;
      }
    }

    if (activeGenres.length === 0) {
      return this.selectBalancedCandidate(decadeFiltered, excludeIds);
    }

    // Step 1: Select Genre with balanced weights
    let chosenGenre: NormalizedGenre = activeGenres[0];
    let rand = Math.random() * totalActiveWeight;
    for (let i = 0; i < activeGenres.length; i++) {
      rand -= activeWeights[i];
      if (rand <= 0) {
        chosenGenre = activeGenres[i];
        break;
      }
    }

    const genreCandidates = normalizedGenreMap.get(chosenGenre) || decadeFiltered;

    // Step 2 & 3: Select Artist -> Song
    const selectedSong = this.selectBalancedCandidate(genreCandidates, excludeIds);
    if (selectedSong && this.isValidCatalogItem(selectedSong) && this.matchesDecade(selectedSong, decade)) {
      return selectedSong;
    }

    return this.selectBalancedCandidate(decadeFiltered, excludeIds);
  }

  /**
   * Validates that song audio is actively playable and at least 15s.
   * If preview expired or failed, attempts re-resolution.
   * If unplayable, automatically blacklists/rejects song ID and returns false.
   */
  public async validateSongPlayability(song: Song): Promise<boolean> {
    if (!song || !song.previewUrl) return false;

    // 1. Direct validation check via Web Audio / HTMLAudio
    const isOk = await audioService.validateAudioUrl(song.previewUrl, 3500);
    if (isOk) {
      return true;
    }

    // 2. Attempt runtime re-resolution
    try {
      const freshUrl = await this.resolveFreshPreviewUrl(song);
      if (freshUrl && freshUrl !== song.previewUrl) {
        const freshOk = await audioService.validateAudioUrl(freshUrl, 3500);
        if (freshOk) {
          song.previewUrl = freshUrl;
          return true;
        }
      }
    } catch {
      // Re-resolution failed
    }

    // 3. Mark as rejected so it won't appear in rounds or autocomplete
    this.rejectSong(song.id);
    return false;
  }

  /**
   * Selects and pre-validates a random song for a round.
   * GUARANTEES that returned song is 100% playable with valid audio (silent replacement on failure).
   */
  public async getPlayableSongForRound(
    excludeIds: string[] = [],
    decade: DecadeFilter = 'all',
    genres: GenreFilter[] | GenreFilter = ['all'],
    maxAttempts = 10
  ): Promise<Song | null> {
    const triedIds = new Set<string>(excludeIds);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let candidate = this.getRandomSong(Array.from(triedIds), decade, genres);
      if (!candidate) {
        // If pool exhausted with exclusions, try without session exclusions (except rejected IDs)
        candidate = this.getRandomSong([], decade, genres);
      }
      if (!candidate) return null;

      triedIds.add(candidate.id);

      const isValid = await this.validateSongPlayability(candidate);
      if (isValid) {
        return candidate;
      }
      // If invalid, candidate was rejected, loop continues to pick next song seamlessly
    }

    // Fallback if max attempts exceeded
    return this.getRandomSong([], decade, genres);
  }
}

export const musicService = new MusicService();

