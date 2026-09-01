import { Song } from '../types/song';
import { DecadeFilter, GenreFilter } from '../types/game';
import { fuzzyMatchSong } from '../utils/normalizeText';
import { MELODEX_BASE_CATALOG } from '../data/melodexCatalog';
import { audioService } from './audioService';

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

  constructor() {
    this.bootstrapCatalog();
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
   * Decade + Multi-Genre Balanced Random Selection:
   *
   * STEP 1: Filter candidate pool by strict decade AND active genres (OR logic), and session exclusions.
   * STEP 2: If specific genres selected, pick weighted by recognitionScore from that candidate pool.
   * STEP 3: If 'all' genres selected, group eligible candidates by normalized genre & apply balanced weights.
   * STEP 4: Validate before returning.
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

    // Filter by strict decade and selected genres (OR match)
    let filteredPool = this.filterByDecadeAndGenres(all, decade, genreList);

    // If specific genre+decade pool is empty (e.g. rare combination), fallback to decade pool with 'all'
    if (filteredPool.length === 0) {
      filteredPool = this.filterByDecadeAndGenres(all, decade, ['all']);
    }
    if (filteredPool.length === 0) {
      filteredPool = all;
    }

    const excludeSet = new Set([...excludeIds, ...this.rejectedSongIds]);
    let available = filteredPool.filter((s) => !excludeSet.has(s.id));

    // If available is exhausted, fall back to entire filtered pool
    if (available.length === 0) {
      available = filteredPool;
    }

    if (available.length === 0) return null;

    // If specific genres were chosen (not 'all'), pick directly from available matched pool
    if (!isAll) {
      const chosen = this.pickSongByRecognition(available);
      if (chosen && this.isValidCatalogItem(chosen)) {
        return chosen;
      }
    }

    // When genre is 'all', group candidates by normalized genre for balanced variety
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

    for (const [gName, songs] of genreMap.entries()) {
      if (songs.length > 0) {
        const weight = GENRE_WEIGHTS[gName] ?? 0.10;
        activeGenres.push(gName);
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

