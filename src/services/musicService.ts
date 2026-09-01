import { Song } from '../types/song';
import { DecadeFilter, GenreFilter } from '../types/game';
import { fuzzyMatchSong, extractPrimaryArtist, normalizeText } from '../utils/normalizeText';
import { MELODEX_BASE_CATALOG } from '../data/melodexCatalog';
import { audioService } from './audioService';

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

const STORAGE_RECENT_TRACKS = 'melodex_recent_tracks_v2';
const STORAGE_RECENT_ARTISTS = 'melodex_recent_artists_v2';
const STORAGE_QUARANTINED_SONGS = 'melodex_quarantined_songs_v2';
const MAX_RECENT_TRACKS = 250;
const MAX_RECENT_ARTISTS = 25;

class MusicService {
  private catalog: Map<string, Song> = new Map();
  private rejectedSongIds: Set<string> = new Set();
  private isCatalogLoaded = false;
  private loadPromise: Promise<Song[]> | null = null;
  private countCache: Map<DecadeFilter, Record<GenreFilter, number>> = new Map();

  // Session Deck & Balanced Distribution
  private sessionDeck: Song[] = [];
  private currentDeckKey = '';
  private sessionArtistExposure: Map<string, number> = new Map();

  // Persistent Cooldowns (loaded from localStorage, preserved across browser refreshes)
  private recentTrackIds: string[] = [];
  private recentArtistKeys: string[] = [];

  constructor() {
    this.loadPersistedState();
    this.bootstrapCatalog();
  }

  /**
   * Loads persisted cooldowns and quarantined tracks from localStorage.
   * Prevents repeating songs/artists even when the user refreshes the page.
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
    } catch (e) {
      console.warn('Could not read persisted game history from localStorage:', e);
    }
  }

  /**
   * Persists cooldowns and quarantined songs to localStorage.
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
    this.sessionDeck = [];
    this.currentDeckKey = '';
    this.savePersistedState();
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
   * ONLY trackIdentityVerified === true may enter gameplay.
   */
  public isValidCatalogItem(item: Song | null | undefined): item is Song {
    if (!item || !item.id || !item.title || !item.artist || !item.previewUrl) {
      return false;
    }
    // Strict requirement: trackIdentityVerified must be true
    if (item.trackIdentityVerified !== true) {
      return false;
    }
    if (!item.previewUrl.startsWith('http')) {
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
   * Automatically persists quarantined tracks to prevent them from ever loading again.
   */
  public rejectSong(songId: string): void {
    if (!songId) return;
    this.rejectedSongIds.add(songId);
    this.catalog.delete(songId);
    this.sessionDeck = this.sessionDeck.filter((s) => s.id !== songId);
    this.invalidateCountCache();
    this.savePersistedState();
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
    this.loadPersistedState();

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
   * Constructs a balanced, randomized Session Deck for the given decade & genres.
   * Solves the catalog distribution problem:
   * 1. Groups candidate songs by artist so huge artists don't drown out smaller curated artists.
   * 2. Applies session exposure penalty + recent artist cooldown penalty.
   * 3. Samples 1-2 tracks per artist using soft recognition weighting with randomness.
   * 4. Ensures genre balance if 'all' or multiple genres are active.
   * 5. Shuffles using Fisher-Yates and stores as this.sessionDeck.
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

    // 1. Strict filter by decade and genres
    const candidates = this.filterByDecadeAndGenres(allPlayable, decade, genreList);
    if (candidates.length === 0) {
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

    // 3. For each artist, calculate dynamic selection weight and pick 1-2 representative tracks
    const deckSelection: Song[] = [];
    const artistKeys = Array.from(artistMap.keys());

    const weightedArtists: { key: string; weight: number; songs: Song[] }[] = [];

    for (const aKey of artistKeys) {
      const songs = artistMap.get(aKey) || [];
      if (songs.length === 0) continue;

      // Base weight = 1.0 (Requirement 17: GENRE -> ARTIST -> SONG, fair artist baseline)
      const baseWeight = 1.0;

      // Session exposure penalty (Requirement 20: 0 appearances gain preference vs multiple appearances)
      const exposureCount = this.sessionArtistExposure.get(aKey) || 0;
      const sessionExposurePenalty = exposureCount === 0 ? 1.5 : 1 / (1 + exposureCount * 2.0);

      // Cooldown penalty from recent games / reloads (Requirement 19: strongly penalize recent artists)
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

      // Availability health: count of tracks not in recentTrackIds (Requirement 20: availabilityHealth)
      const unplayedCount = songs.filter(s => !this.recentTrackIds.includes(s.id)).length;
      const availabilityHealth = Math.min(1.0, Math.max(0.15, unplayedCount / 2));

      // Final composite artist weight
      const finalWeight = baseWeight * recentArtistPenalty * sessionExposurePenalty * availabilityHealth;
      weightedArtists.push({ key: aKey, weight: finalWeight, songs });
    }

    // Sort artists with random entropy based on dynamic weights
    weightedArtists.sort((a, b) => {
      const scoreA = a.weight * (0.6 + getSecureRandomFloat() * 0.8);
      const scoreB = b.weight * (0.6 + getSecureRandomFloat() * 0.8);
      return scoreB - scoreA;
    });

    // Pick 1 best track per artist (Requirement 21: weighted randomness among recognizable tracks, not always #1 hit)
    for (const item of weightedArtists) {
      const { songs } = item;
      const notRecent = songs.filter((s) => !this.recentTrackIds.includes(s.id));
      const pool = notRecent.length > 0 ? notRecent : songs;

      // Weighted selection among artist's pool
      const sortedSongs = [...pool].sort((a, b) => {
        const scoreA = (a.recognitionScore ?? 75) * (0.5 + getSecureRandomFloat() * 1.0);
        const scoreB = (b.recognitionScore ?? 75) * (0.5 + getSecureRandomFloat() * 1.0);
        return scoreB - scoreA;
      });

      if (sortedSongs[0]) {
        deckSelection.push(sortedSongs[0]);
      }
      // If total deck is small, allow a 2nd song for artists with ample catalog
      if (deckSelection.length < 80 && sortedSongs.length >= 5 && sortedSongs[1]) {
        deckSelection.push(sortedSongs[1]);
      }
    }

    // 4. Final Fisher-Yates shuffle on the balanced deck
    const shuffledDeck = fisherYatesShuffle(deckSelection);

    // Prevent immediate repeat on the first card drawn from fresh deck
    const lastPlayedId = this.recentTrackIds[this.recentTrackIds.length - 1];
    const lastPlayedArtist = this.recentArtistKeys[this.recentArtistKeys.length - 1];
    if (shuffledDeck.length > 1) {
      const topSong = shuffledDeck[shuffledDeck.length - 1];
      if (topSong && (topSong.id === lastPlayedId || normalizeArtistKey(topSong.artist) === lastPlayedArtist)) {
        const swapIdx = Math.floor(getSecureRandomFloat() * (shuffledDeck.length - 1));
        [shuffledDeck[shuffledDeck.length - 1], shuffledDeck[swapIdx]] = [shuffledDeck[swapIdx], shuffledDeck[shuffledDeck.length - 1]];
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
   * Synchronous fallback selection adhering to the Session Deck.
   * Strictly enforces anti-repeat cooldowns: NEVER repeats the immediate previous song.
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
    // Hard constraint: Never repeat the immediately preceding played song
    const lastPlayedId = this.recentTrackIds[this.recentTrackIds.length - 1];
    if (lastPlayedId) {
      excludeSet.add(lastPlayedId);
    }

    const eligible = this.sessionDeck.filter((s) => !excludeSet.has(s.id) && !this.rejectedSongIds.has(s.id));

    if (eligible.length > 0) {
      const chosen = eligible[0];
      this.sessionDeck = this.sessionDeck.filter((s) => s.id !== chosen.id);
      this.recordRecentPlay(chosen.id, normalizeArtistKey(chosen.artist));
      return chosen;
    }

    // Fallback if sessionDeck exhausted
    const allEligible = this.filterByDecadeAndGenres(this.getCatalog(), decade, genres)
      .filter((s) => !this.rejectedSongIds.has(s.id));

    if (allEligible.length === 0) return null;

    // Prioritize non-recent songs
    const notRecent = allEligible.filter((s) => !excludeSet.has(s.id) && !this.recentTrackIds.includes(s.id));
    const notExcluded = allEligible.filter((s) => !excludeSet.has(s.id));
    const pool = notRecent.length > 0 ? notRecent : notExcluded.length > 0 ? notExcluded : allEligible;

    // If pool has more than 1 item and lastPlayedId is in pool, strictly remove lastPlayedId
    const nonImmediate = pool.filter((s) => s.id !== lastPlayedId);
    const finalPool = nonImmediate.length > 0 ? nonImmediate : pool;

    const chosen = finalPool[Math.floor(getSecureRandomFloat() * finalPool.length)];
    this.recordRecentPlay(chosen.id, normalizeArtistKey(chosen.artist));
    return chosen;
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
   * Selects and pre-validates a random song for a round from the Session Deck.
   * GUARANTEES that returned song is 100% playable with valid audio (silent replacement on failure).
   * Consumes tracks without replacement from the deck.
   */
  public async getPlayableSongForRound(
    excludeIds: string[] = [],
    decade: DecadeFilter = 'all',
    genres: GenreFilter[] | GenreFilter = ['all'],
    maxAttempts = 15
  ): Promise<Song | null> {
    const genreList = Array.isArray(genres) ? genres : [genres];
    const deckKey = `${decade}::${genreList.slice().sort().join(',')}`;

    // If deck is empty or filters changed, build fresh deck
    if (this.currentDeckKey !== deckKey || this.sessionDeck.length === 0) {
      this.buildSessionDeck(decade, genres, true);
    }

    const triedIds = new Set<string>(excludeIds);
    // Hard constraint: Never repeat the immediately preceding played song
    const lastPlayedId = this.recentTrackIds[this.recentTrackIds.length - 1];
    if (lastPlayedId) {
      triedIds.add(lastPlayedId);
    }

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Rebuild deck if exhausted
      if (this.sessionDeck.length === 0) {
        this.buildSessionDeck(decade, genres, true);
      }

      if (this.sessionDeck.length === 0) {
        const fallback = this.filterByDecadeAndGenres(this.getCatalog(), decade, genres)
          .filter((s) => !this.rejectedSongIds.has(s.id));
        if (fallback.length === 0) return null;
        const notTried = fallback.filter((s) => !triedIds.has(s.id));
        const pool = notTried.length > 0 ? notTried : fallback;
        const chosen = pool[Math.floor(getSecureRandomFloat() * pool.length)];
        this.recordRecentPlay(chosen.id, normalizeArtistKey(chosen.artist));
        return chosen;
      }

      // Pop next candidate from the deck (consumed without replacement!)
      const candidate = this.sessionDeck.pop()!;

      // If already played in this game session or quarantined, skip to next
      if (triedIds.has(candidate.id) || this.rejectedSongIds.has(candidate.id)) {
        continue;
      }

      triedIds.add(candidate.id);

      // Silent pre-validation: verify audio URL before returning to game
      const isValid = await this.validateSongPlayability(candidate);
      if (isValid) {
        const artKey = normalizeArtistKey(candidate.artist);
        this.recordRecentPlay(candidate.id, artKey);
        return candidate;
      }
      // If invalid, validateSongPlayability automatically called rejectSong() which blacklisted it.
      // Loop seamlessly draws next card from sessionDeck!
    }

    // Fallback if max attempts exceeded
    const remaining = this.filterByDecadeAndGenres(this.getCatalog(), decade, genres)
      .filter((s) => !this.rejectedSongIds.has(s.id));
    if (remaining.length === 0) return null;
    const notTried = remaining.filter((s) => !triedIds.has(s.id));
    const pool = notTried.length > 0 ? notTried : remaining;
    const chosen = pool[Math.floor(getSecureRandomFloat() * pool.length)];
    this.recordRecentPlay(chosen.id, normalizeArtistKey(chosen.artist));
    return chosen;
  }
}

export const musicService = new MusicService();

