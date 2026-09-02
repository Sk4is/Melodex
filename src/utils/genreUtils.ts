import { Song } from '../types/song';
import { DecadeFilter, GenreFilter } from '../types/game';

/**
 * Melodex Canonical Genre Taxonomy:
 * Valid single genres: 'pop' | 'hiphop' | 'rock' | 'rnb' | 'electronic' | 'latin' | 'indie' | 'metal' | 'dance'
 */
export const CANONICAL_GENRES: GenreFilter[] = [
  'pop',
  'hiphop',
  'rock',
  'rnb',
  'electronic',
  'latin',
  'indie',
  'metal',
  'dance',
];

export const GENRE_DISPLAY_NAMES: Record<GenreFilter, string> = {
  all: 'ALL',
  pop: 'POP',
  hiphop: 'HIP-HOP',
  rock: 'ROCK',
  rnb: 'R&B',
  electronic: 'ELECTRONIC',
  latin: 'LATIN',
  indie: 'INDIE',
  metal: 'METAL',
  dance: 'DANCE',
};

/**
 * Normalizes any raw genre, alias, or existing normalized genres into canonical Melodex GenreFilters.
 * Supports multiple categories for valid crossover tracks (e.g. "Dance-Pop" -> ["pop", "dance", "electronic"]).
 */
export function computeNormalizedGenres(
  rawGenre?: string,
  artist = '',
  title = '',
  album = ''
): GenreFilter[] {
  if (!rawGenre && !artist && !title) return [];

  const g = (rawGenre || '').toLowerCase().trim();
  const a = (artist || '').toLowerCase().trim();
  const t = (title || '').toLowerCase().trim();
  const al = (album || '').toLowerCase().trim();
  const fullContext = `${g} ${a} ${t} ${al}`;
  const set = new Set<GenreFilter>();

  // 1. Hip-Hop / Rap
  if (
    g.includes('hip-hop') ||
    g.includes('hip hop') ||
    g.includes('hiphop') ||
    g.includes('rap') ||
    g.includes('trap') ||
    g.includes('drill') ||
    g.includes('boom bap') ||
    g.includes('cloud rap') ||
    g.includes('gangsta') ||
    g.includes('grime')
  ) {
    set.add('hiphop');
    if (g.includes('pop rap') || g.includes('dance') || g.includes('pop')) {
      set.add('pop');
    }
  }

  // 2. Pop
  if (
    g.includes('pop') ||
    g.includes('teen pop') ||
    g.includes('dance-pop') ||
    g.includes('dance pop') ||
    g.includes('synthpop') ||
    g.includes('synth-pop') ||
    g.includes('electropop') ||
    g.includes('k-pop') ||
    g.includes('j-pop') ||
    g.includes('adult contemporary') ||
    g.includes('chanson') ||
    g.includes('vocal') ||
    g.includes('soundtrack') ||
    g.includes('musical') ||
    g.includes('score') ||
    g.includes('holiday') ||
    g.includes('christmas') ||
    g.includes('classical crossover') ||
    g.includes('country') ||
    g.includes('folk pop') ||
    g.includes('europop')
  ) {
    set.add('pop');
  }

  // 3. Rock
  if (
    g.includes('rock') ||
    g.includes('grunge') ||
    g.includes('punk') ||
    g.includes('pop punk') ||
    g.includes('post-punk') ||
    g.includes('psychedelic') ||
    g.includes('garage') ||
    g.includes('glam') ||
    g.includes('southern rock') ||
    g.includes('arena rock') ||
    g.includes('hard rock') ||
    g.includes('classic rock') ||
    g.includes('soft rock') ||
    g.includes('alternative rock')
  ) {
    set.add('rock');
  }

  // 4. Metal
  if (
    g.includes('metal') ||
    g.includes('heavy metal') ||
    g.includes('nu metal') ||
    g.includes('metalcore') ||
    g.includes('death metal') ||
    g.includes('thrash metal') ||
    g.includes('power metal') ||
    g.includes('black metal') ||
    g.includes('doom metal') ||
    g.includes('speed metal')
  ) {
    set.add('metal');
    set.add('rock');
  }

  // 5. R&B / Soul / Jazz / Blues
  if (
    g.includes('r&b') ||
    g.includes('rnb') ||
    g.includes('soul') ||
    g.includes('funk') ||
    g.includes('motown') ||
    g.includes('neo-soul') ||
    g.includes('quiet storm') ||
    g.includes('doo wop') ||
    g.includes('contemporary r&b') ||
    g.includes('jazz') ||
    g.includes('blues')
  ) {
    set.add('rnb');
  }

  // 6. Dance / Electronic
  if (
    g.includes('dance') ||
    g.includes('electronic') ||
    g.includes('house') ||
    g.includes('techno') ||
    g.includes('trance') ||
    g.includes('edm') ||
    g.includes('club') ||
    g.includes('eurodance') ||
    g.includes('electro') ||
    g.includes('dubstep') ||
    g.includes('drum and bass') ||
    g.includes('drum & bass') ||
    g.includes("drum'n'bass") ||
    g.includes('jungle') ||
    g.includes('breakbeat') ||
    g.includes('lounge') ||
    g.includes('electronica') ||
    g.includes('synthwave') ||
    g.includes('disco') ||
    g.includes('dancehall')
  ) {
    set.add('electronic');
    set.add('dance');
    if (g.includes('dance pop') || g.includes('disco') || g.includes('electropop')) {
      set.add('pop');
    }
  }

  // 7. Latin
  if (
    g.includes('latin') ||
    g.includes('urbano') ||
    g.includes('reggaeton') ||
    g.includes('bachata') ||
    g.includes('salsa') ||
    g.includes('cumbia') ||
    g.includes('mexicana') ||
    g.includes('mexican') ||
    g.includes('corridos') ||
    g.includes('ranchera') ||
    g.includes('tropical') ||
    g.includes('merengue') ||
    g.includes('tango') ||
    g.includes('bossa nova') ||
    g.includes('samba') ||
    g.includes('brazilian') ||
    g.includes('música mexicana') ||
    g.includes('musica mexicana')
  ) {
    set.add('latin');
    if (g.includes('pop latino') || g.includes('latin pop')) {
      set.add('pop');
    }
    if (g.includes('urbano') || g.includes('reggaeton') || g.includes('trap latino')) {
      set.add('hiphop');
    }
  }

  // 8. Indie / Alternative
  if (
    g.includes('indie') ||
    g.includes('alternative') ||
    g.includes('singer/songwriter') ||
    g.includes('singer-songwriter') ||
    g.includes('folk') ||
    g.includes('contemporary folk') ||
    g.includes('indie pop') ||
    g.includes('indie rock') ||
    g.includes('shoegaze') ||
    g.includes('dream pop') ||
    g.includes('bedroom pop') ||
    g.includes('lo-fi') ||
    g.includes('americana')
  ) {
    set.add('indie');
    if (g.includes('alternative') || g.includes('indie rock') || g.includes('folk rock')) {
      set.add('rock');
    }
    if (g.includes('indie pop') || g.includes('dream pop') || g.includes('bedroom pop')) {
      set.add('pop');
    }
  }

  // 9. Reggae / Afro
  if (
    g.includes('reggae') ||
    g.includes('afrobeats') ||
    g.includes('afro-beat') ||
    g.includes('afro-pop')
  ) {
    set.add('pop');
    set.add('dance');
    if (
      fullContext.includes('nas') ||
      fullContext.includes('kendrick') ||
      fullContext.includes('drake') ||
      fullContext.includes('tory lanez')
    ) {
      set.add('hiphop');
    }
  }

  // 10. Christian / Gospel
  if (g.includes('christian') || g.includes('gospel')) {
    set.add('pop');
    if (fullContext.includes('missy') || fullContext.includes('yolanda') || fullContext.includes('mary mary')) {
      set.add('rnb');
      set.add('hiphop');
    }
    if (fullContext.includes('van dyk')) {
      set.add('electronic');
      set.add('dance');
    }
  }

  // Special track-level cases
  if (t.includes('big shot') && (a.includes('kendrick') || a.includes('travis scott'))) {
    set.add('hiphop');
    set.add('pop');
  }

  return Array.from(set);
}

/**
 * Migration & Normalization Compatibility Layer:
 * Normalizes any track into Melodex canonical genre IDs.
 * If normalizedGenres is already set, sanitizes and verifies it; otherwise computes it.
 */
export function normalizeTrackGenres(track: {
  genre?: string;
  artist?: string;
  title?: string;
  album?: string;
  normalizedGenres?: string[] | GenreFilter[];
}): GenreFilter[] {
  if (!track) return [];

  if (Array.isArray(track.normalizedGenres) && track.normalizedGenres.length > 0) {
    const valid = new Set<GenreFilter>();
    for (const g of track.normalizedGenres) {
      const lower = String(g).toLowerCase().replace(/[^a-z]/g, '');
      if (lower === 'pop') valid.add('pop');
      else if (lower === 'hiphop' || lower === 'rap') valid.add('hiphop');
      else if (lower === 'rock') valid.add('rock');
      else if (lower === 'rnb' || lower === 'soul') valid.add('rnb');
      else if (lower === 'electronic' || lower === 'electro') valid.add('electronic');
      else if (lower === 'latin') valid.add('latin');
      else if (lower === 'indie') valid.add('indie');
      else if (lower === 'metal') valid.add('metal');
      else if (lower === 'dance') valid.add('dance');
    }
    if (valid.size > 0) {
      return Array.from(valid);
    }
  }

  return computeNormalizedGenres(track.genre, track.artist, track.title, track.album);
}

/**
 * Legacy Compatibility & Migration Layer:
 * Safely maps any legacy or incomplete track object into the canonical Song schema.
 * - Audio status: undefined -> "unknown" (or preserved if already set)
 * - Track identity: undefined -> true (or "unknown"), only false is quarantined
 * - Normalized genres: computed if missing
 * - Verified original year: derived from verifiedOriginalYear or year
 */
export function migrateLegacyCatalogTrack(track: any): Song {
  if (!track || typeof track !== 'object') {
    return track;
  }

  const verifiedOriginalYear =
    typeof track.verifiedOriginalYear === 'number' && !isNaN(track.verifiedOriginalYear)
      ? track.verifiedOriginalYear
      : typeof track.year === 'number' && !isNaN(track.year)
      ? track.year
      : undefined;

  const year = typeof track.year === 'number' && !isNaN(track.year) ? track.year : verifiedOriginalYear;

  const normalizedGenres =
    Array.isArray(track.normalizedGenres) && track.normalizedGenres.length > 0
      ? normalizeTrackGenres(track)
      : normalizeTrackGenres({ ...track, genre: track.genre, artist: track.artist, title: track.title, album: track.album });

  return {
    ...track,
    id: String(track.id || ''),
    title: String(track.title || ''),
    artist: String(track.artist || ''),
    album: track.album || undefined,
    previewUrl: String(track.previewUrl || ''),
    year,
    verifiedOriginalYear,
    yearConfidence: track.yearConfidence || 'high',
    trackIdentityVerified: track.trackIdentityVerified !== false,
    audioStatus: track.audioStatus ?? 'unknown',
    audioValidatedAt: track.audioValidatedAt ?? Date.now(),
    normalizedGenres,
  } as Song;
}

/**
 * Strict song-level genre matching.
 * FAIL-CLOSED: A song matches a single genre filter if and only if its normalizedGenres contains that genre.
 */
export function matchSongToSingleGenre(
  songNormalizedGenres: GenreFilter[] | undefined,
  genre: GenreFilter
): boolean {
  if (genre === 'all') return true;
  if (!songNormalizedGenres || !Array.isArray(songNormalizedGenres) || songNormalizedGenres.length === 0) {
    return false; // Fail closed: unclassified tracks never match specific genres
  }
  return songNormalizedGenres.includes(genre);
}

/**
 * Strict multi-genre matching (OR logic).
 * A song matches if ANY selected genre is in its normalizedGenres.
 */
export function matchSongToSelectedGenres(
  songNormalizedGenres: GenreFilter[] | undefined,
  selectedGenres: GenreFilter[]
): boolean {
  if (!selectedGenres || selectedGenres.length === 0 || selectedGenres.includes('all')) {
    return true;
  }
  if (!songNormalizedGenres || !Array.isArray(songNormalizedGenres) || songNormalizedGenres.length === 0) {
    return false;
  }
  return selectedGenres.some((g) => songNormalizedGenres.includes(g));
}

/**
 * Strict decade matching based strictly on verified original release year.
 * Boundaries:
 * PRE-2000: year < 2000
 * 2000s: 2000–2009
 * 2010s: 2010–2019
 * 2020s: 2020–2029
 */
export function matchesDecadeYear(
  year: number | undefined | null,
  decade: DecadeFilter
): boolean {
  if (typeof year !== 'number' || isNaN(year)) return false;
  if (decade === 'all') return true;
  if (decade === 'pre2000') return year < 2000;
  if (decade === '2000s') return year >= 2000 && year <= 2009;
  if (decade === '2010s') return year >= 2010 && year <= 2019;
  if (decade === '2020s') return year >= 2020 && year <= 2029;
  return false;
}

export interface FilterCriteria {
  decade: DecadeFilter;
  genres: GenreFilter[] | GenreFilter;
}

/**
 * Canonical Track-Level Filter Eligibility Function.
 * Used identically across gameplay, session deck construction, candidate selection,
 * decade counters, and genre counters.
 * FAIL-CLOSED: In specific genre mode, only tracks with matching normalized genre pass.
 * ALL MODE: Bypasses genre checks completely; only requires valid decade and healthy audio.
 */
export function isTrackEligibleForFilters(
  track: Song | null | undefined,
  filters: FilterCriteria
): boolean {
  if (!track || !track.id || !track.title || !track.artist) return false;
  if (track.audioStatus === 'dead') return false;

  // 1. Decade must come strictly from verifiedOriginalYear (or year)
  const year = track.verifiedOriginalYear ?? track.year;
  if (typeof year !== 'number' || isNaN(year) || year < 1920 || year > 2030) {
    return false;
  }
  if (track.yearConfidence && track.yearConfidence === 'low') {
    return false;
  }

  if (!matchesDecadeYear(year, filters.decade)) {
    return false;
  }

  // 2. Genre classification
  const selectedGenres = Array.isArray(filters.genres) ? filters.genres : [filters.genres];
  if (!selectedGenres || selectedGenres.length === 0 || selectedGenres.includes('all')) {
    // In ALL mode, genre requirement is bypassed completely
    return true;
  }

  // Specific genre mode: require track to match selected genres
  const trackGenres =
    Array.isArray(track.normalizedGenres) && track.normalizedGenres.length > 0
      ? track.normalizedGenres
      : normalizeTrackGenres(track);

  if (!trackGenres || trackGenres.length === 0) {
    return false;
  }

  return matchSongToSelectedGenres(trackGenres, selectedGenres);
}

/**
 * Diagnostics logger for tracking pool counts across filter stages.
 */
export function logFilterDiagnostics(
  allSongs: Song[],
  decade: DecadeFilter,
  genres: GenreFilter[] | GenreFilter
): void {
  const genreList = Array.isArray(genres) ? genres : [genres];
  const isAllGenres = !genreList || genreList.length === 0 || genreList.includes('all');

  const healthyCatalog = allSongs.filter((s) => s.audioStatus !== 'dead');
  const tracksWithVerifiedYear = healthyCatalog.filter((s) => {
    const yr = s.verifiedOriginalYear ?? s.year;
    return typeof yr === 'number' && !isNaN(yr) && yr >= 1920 && yr <= 2030;
  });
  const tracksMatchingDecade = tracksWithVerifiedYear.filter((s) => {
    const yr = s.verifiedOriginalYear ?? s.year;
    return matchesDecadeYear(yr, decade);
  });
  const tracksWithNormalizedGenres = tracksMatchingDecade.filter((s) => {
    const g = s.normalizedGenres || normalizeTrackGenres(s);
    return Array.isArray(g) && g.length > 0;
  });
  const tracksMatchingGenre = isAllGenres
    ? tracksMatchingDecade
    : tracksMatchingDecade.filter((s) => {
        const g = s.normalizedGenres || normalizeTrackGenres(s);
        return matchSongToSelectedGenres(g, genreList);
      });
  const finalEligibleTracks = tracksMatchingGenre.filter((s) =>
    isTrackEligibleForFilters(s, { decade, genres: genreList })
  );

  console.info('[Melodex Filter Diagnostics]', {
    selectedDecade: decade,
    selectedGenres: genreList,
    healthyPlayableCatalog: healthyCatalog.length,
    tracksWithVerifiedYear: tracksWithVerifiedYear.length,
    tracksMatchingDecade: tracksMatchingDecade.length,
    tracksWithNormalizedGenres: tracksWithNormalizedGenres.length,
    tracksMatchingGenre: tracksMatchingGenre.length,
    finalEligibleTracks: finalEligibleTracks.length,
  });
}


