import { Song } from '../types/song';
import { normalizeText, squashSymbols, extractArtistCredits, extractPrimaryArtist } from './normalizeText';

export interface IndexedSong {
  song: Song;
  id: string;
  title: string;
  artist: string;
  cleanTitle: string;
  normTitle: string;
  squashedTitle: string;
  titleTokens: string[];
  normCleanTitle: string;
  squashedCleanTitle: string;
  cleanTitleTokens: string[];
  normArtist: string;
  squashedArtist: string;
  artistTokens: string[];
  normPrimaryArtist: string;
  squashedPrimaryArtist: string;
  creditedArtists: { original: string; norm: string; squashed: string }[];
  searchCorpus: string;
  recognitionScore: number;
}

export interface ExactArtistMatchInfo {
  artistName: string;
  totalCount: number;
}

export interface SearchResult {
  songs: Song[];
  exactArtistMatch?: ExactArtistMatchInfo;
}

/**
 * Strips bracketed feature, version, or remix metadata from title
 * e.g. "Falling Down (Bonus Track)" -> "Falling Down"
 * e.g. "Psycho (feat. Ty Dolla $ign)" -> "Psycho"
 * e.g. "Sunflower (Spider-Man: Into the Spider-Verse)" -> "Sunflower"
 * e.g. "Levels (Radio Edit)" -> "Levels"
 */
export function extractCleanTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/\s*[\(\[](?:feat\.|ft\.|featuring|with|remix|acoustic|radio edit|original|bonus track|from\s+|spider-man|soundtrack|version).*?[\)\]]/gi, '')
    .replace(/\s*-\s*(?:radio edit|bonus track|acoustic|remix|live).*$/gi, '')
    .trim();
}

/**
 * Extracts all credited artist names from both artist string and title annotations
 */
export function extractAllCreditedArtists(title: string, artist: string): { original: string; norm: string; squashed: string }[] {
  const map = new Map<string, string>(); // norm -> original

  // 1. From artist string
  const creditsFromArtist = extractArtistCredits(artist);
  for (const a of creditsFromArtist) {
    const trimmed = a.trim();
    if (trimmed) {
      const n = normalizeText(trimmed);
      if (n && !map.has(n)) map.set(n, trimmed);
    }
  }

  // 2. From title features, e.g. "(feat. Preme & Post Malone)" or "(with Logic, Ty Dolla $ign & X Ambassadors)"
  const titleFeatureMatches = title.match(/[\(\[](?:feat\.|ft\.|featuring|with)\s+([^\)\]]+)[\)\]]/gi);
  if (titleFeatureMatches) {
    for (const match of titleFeatureMatches) {
      const inside = match.replace(/[\(\[](?:feat\.|ft\.|featuring|with)\s+/i, '').replace(/[\)\]]/, '');
      const featCredits = extractArtistCredits(inside);
      for (const f of featCredits) {
        const trimmed = f.trim();
        if (trimmed) {
          const n = normalizeText(trimmed);
          if (n && !map.has(n)) map.set(n, trimmed);
        }
      }
    }
  }

  const result: { original: string; norm: string; squashed: string }[] = [];
  for (const [norm, original] of map.entries()) {
    result.push({
      original,
      norm,
      squashed: squashSymbols(original),
    });
  }
  return result;
}

/**
 * High-performance search indexing engine for Melodex catalog.
 */
export class MelodexSearchEngine {
  private indexedSongs: IndexedSong[] = [];
  private artistCatalogMap: Map<string, IndexedSong[]> = new Map();
  private canonicalArtistNames: Map<string, string> = new Map();

  constructor(songs: Song[] = []) {
    if (songs.length > 0) {
      this.buildIndex(songs);
    }
  }

  public buildIndex(songs: Song[]): void {
    const indexed: IndexedSong[] = [];
    const artistMap = new Map<string, IndexedSong[]>();
    const canonicalNames = new Map<string, string>();

    for (const song of songs) {
      if (!song || !song.id || !song.title || !song.artist) continue;

      const title = song.title;
      const artist = song.artist;
      const cleanTitle = extractCleanTitle(title) || title;
      const primaryArtist = extractPrimaryArtist(artist) || artist;
      const credited = extractAllCreditedArtists(title, artist);

      const normTitle = normalizeText(title);
      const squashedTitle = squashSymbols(title);
      const titleTokens = normTitle.split(' ').filter(Boolean);

      const normCleanTitle = normalizeText(cleanTitle);
      const squashedCleanTitle = squashSymbols(cleanTitle);
      const cleanTitleTokens = normCleanTitle.split(' ').filter(Boolean);

      const normArtist = normalizeText(artist);
      const squashedArtist = squashSymbols(artist);
      const artistTokens = normArtist.split(' ').filter(Boolean);

      const normPrimaryArtist = normalizeText(primaryArtist);
      const squashedPrimaryArtist = squashSymbols(primaryArtist);

      // Search corpus
      const corpusParts = [
        normTitle,
        squashedTitle,
        normCleanTitle,
        squashedCleanTitle,
        normArtist,
        squashedArtist,
        normPrimaryArtist,
        squashedPrimaryArtist,
        ...credited.map(c => c.norm),
        ...credited.map(c => c.squashed),
      ];

      // Artist aliases
      if (normArtist.includes('pink') || squashedArtist.includes('pnk')) corpusParts.push('p!nk pink');
      if (normArtist.includes('kesha') || squashedArtist.includes('keha')) corpusParts.push('ke$ha kesha');
      if (normArtist.includes('asap') || squashedArtist.includes('aap')) corpusParts.push('a$ap asap');
      if (normArtist.includes('nsync')) corpusParts.push('*nsync nsync n sync');
      if (normArtist.includes('jay z') || squashedArtist.includes('jayz')) corpusParts.push('jay-z jayz');
      if (normArtist.includes('blink 182') || squashedArtist.includes('blink182')) corpusParts.push('blink-182 blink182');
      if (normArtist.includes('weeknd')) corpusParts.push('the weeknd weeknd');
      if (normArtist.includes('beyonce')) corpusParts.push('beyonce beyoncé');

      const searchCorpus = corpusParts.join(' ').toLowerCase();

      const item: IndexedSong = {
        song,
        id: song.id,
        title,
        artist,
        cleanTitle,
        normTitle,
        squashedTitle,
        titleTokens,
        normCleanTitle,
        squashedCleanTitle,
        cleanTitleTokens,
        normArtist,
        squashedArtist,
        artistTokens,
        normPrimaryArtist,
        squashedPrimaryArtist,
        creditedArtists: credited,
        searchCorpus,
        recognitionScore: typeof song.recognitionScore === 'number' ? song.recognitionScore : 50,
      };

      indexed.push(item);

      // Register primary artist
      const primaryKeys = new Set<string>([normPrimaryArtist, squashedPrimaryArtist]);
      if (normPrimaryArtist.startsWith('the ') && normPrimaryArtist.length > 4) {
        primaryKeys.add(normPrimaryArtist.slice(4).trim());
      }
      for (const k of primaryKeys) {
        if (!k) continue;
        if (!canonicalNames.has(k)) {
          canonicalNames.set(k, primaryArtist);
        }
        const list = artistMap.get(k) || [];
        if (!list.some(existing => existing.id === item.id)) {
          list.push(item);
        }
        artistMap.set(k, list);
      }

      // Register full artist string
      const fullArtistKeys = new Set<string>([normArtist, squashedArtist]);
      if (normArtist.startsWith('the ') && normArtist.length > 4) {
        fullArtistKeys.add(normArtist.slice(4).trim());
      }
      for (const k of fullArtistKeys) {
        if (!k) continue;
        if (!canonicalNames.has(k)) {
          canonicalNames.set(k, artist);
        }
        const list = artistMap.get(k) || [];
        if (!list.some(existing => existing.id === item.id)) {
          list.push(item);
        }
        artistMap.set(k, list);
      }

      // Register each credited artist individually with their own canonical name
      for (const c of credited) {
        const cKeys = new Set<string>([c.norm, c.squashed]);
        if (c.norm.startsWith('the ') && c.norm.length > 4) {
          cKeys.add(c.norm.slice(4).trim());
        }
        for (const k of cKeys) {
          if (!k) continue;
          if (!canonicalNames.has(k)) {
            canonicalNames.set(k, c.original);
          }
          const list = artistMap.get(k) || [];
          if (!list.some(existing => existing.id === item.id)) {
            list.push(item);
          }
          artistMap.set(k, list);
        }
      }
    }

    this.indexedSongs = indexed;
    this.artistCatalogMap = artistMap;
    this.canonicalArtistNames = canonicalNames;
  }

  public get totalIndexed(): number {
    return this.indexedSongs.length;
  }

  /**
   * Search catalog across track title, artist, and all credited artists.
   * Returns complete match set without arbitrary result limits.
   */
  public search(rawQuery: string): SearchResult {
    const trimmed = (rawQuery || '').trim();
    if (!trimmed) {
      return { songs: [] };
    }

    const normQuery = normalizeText(trimmed);
    const squashedQuery = squashSymbols(trimmed);
    if (!normQuery && !squashedQuery) {
      return { songs: [] };
    }

    const queryTokens = normQuery.split(' ').filter(Boolean);
    const queryWithoutThe = normQuery.startsWith('the ') && normQuery.length > 4 ? normQuery.slice(4).trim() : normQuery;

    // 1. Check for EXACT ARTIST MATCH
    const exactArtistList =
      this.artistCatalogMap.get(normQuery) ||
      this.artistCatalogMap.get(squashedQuery) ||
      this.artistCatalogMap.get(queryWithoutThe);

    let exactArtistInfo: ExactArtistMatchInfo | undefined = undefined;

    if (exactArtistList && exactArtistList.length > 0) {
      const canonicalName =
        this.canonicalArtistNames.get(normQuery) ||
        this.canonicalArtistNames.get(squashedQuery) ||
        this.canonicalArtistNames.get(queryWithoutThe) ||
        exactArtistList[0].song.artist;

      exactArtistInfo = {
        artistName: canonicalName,
        totalCount: exactArtistList.length,
      };
    }

    // 2. Score and rank every matching song
    interface ScoredItem {
      item: IndexedSong;
      tier: number; // 1 to 9 (1 is highest priority)
      score: number; // Higher is better
    }

    const scoredItems: ScoredItem[] = [];

    for (const item of this.indexedSongs) {
      const {
        title,
        normTitle,
        squashedTitle,
        cleanTitle,
        normCleanTitle,
        squashedCleanTitle,
        normArtist,
        squashedArtist,
        normPrimaryArtist,
        squashedPrimaryArtist,
        creditedArtists,
        searchCorpus,
        recognitionScore,
      } = item;

      let tier = 99;
      let score = 0;

      // Exact Artist Match check
      const isExactArtist =
        normArtist === normQuery ||
        squashedArtist === squashedQuery ||
        normPrimaryArtist === normQuery ||
        squashedPrimaryArtist === squashedQuery ||
        creditedArtists.some(c => c.norm === normQuery || c.squashed === squashedQuery) ||
        (queryWithoutThe.length > 2 && (normPrimaryArtist === queryWithoutThe || normArtist === queryWithoutThe));

      // Exact Title Match check (full title or clean title without feat/remix)
      const isExactFullTitle = normTitle === normQuery || squashedTitle === squashedQuery;
      const isExactCleanTitle = normCleanTitle === normQuery || squashedCleanTitle === squashedQuery;
      const isExactTitle = isExactFullTitle || isExactCleanTitle;

      // Check Artist + Title combo queries (e.g. "post malone psycho", "psycho post malone", "lil skies nowadays")
      let isArtistAndTitleCombo = false;
      let comboBonus = 0;

      if (queryTokens.length >= 2) {
        // Find if one part of query matches artist and other matches title
        const normCreditedNames = creditedArtists.map(c => c.norm);
        
        // Try partitioning query tokens into artist part and title part
        for (let split = 1; split < queryTokens.length; split++) {
          const part1 = queryTokens.slice(0, split).join(' ');
          const part2 = queryTokens.slice(split).join(' ');

          // Case A: part1 = artist, part2 = title
          const part1MatchesArtist =
            normArtist === part1 ||
            normPrimaryArtist === part1 ||
            normCreditedNames.some(c => c === part1) ||
            normArtist.includes(part1) ||
            normPrimaryArtist.includes(part1) ||
            normCreditedNames.some(c => c.includes(part1));

          const part2MatchesTitle =
            normTitle === part2 ||
            normCleanTitle === part2 ||
            normTitle.startsWith(part2) ||
            normCleanTitle.startsWith(part2) ||
            normTitle.includes(part2);

          if (part1MatchesArtist && part2MatchesTitle) {
            isArtistAndTitleCombo = true;
            if (normTitle === part2 || normCleanTitle === part2) comboBonus += 500;
            if (normArtist === part1 || normPrimaryArtist === part1) comboBonus += 500;
            break;
          }

          // Case B: part1 = title, part2 = artist
          const part1MatchesTitle =
            normTitle === part1 ||
            normCleanTitle === part1 ||
            normTitle.startsWith(part1) ||
            normCleanTitle.startsWith(part1) ||
            normTitle.includes(part1);

          const part2MatchesArtist =
            normArtist === part2 ||
            normPrimaryArtist === part2 ||
            normCreditedNames.some(c => c === part2) ||
            normArtist.includes(part2) ||
            normPrimaryArtist.includes(part2) ||
            normCreditedNames.some(c => c.includes(part2));

          if (part1MatchesTitle && part2MatchesArtist) {
            isArtistAndTitleCombo = true;
            if (normTitle === part1 || normCleanTitle === part1) comboBonus += 500;
            if (normArtist === part2 || normPrimaryArtist === part2) comboBonus += 500;
            break;
          }
        }
      }

      // TIER 1: Exact Artist + Title Combo Match OR Exact Title + Exact Artist
      if (isArtistAndTitleCombo || (isExactTitle && isExactArtist)) {
        tier = 1;
        score = 12000 + comboBonus;
        if (isExactTitle) score += 300;
        if (isExactArtist) score += 300;
      }
      // TIER 2: Exact Title Match (e.g. searching "psycho" -> "Psycho", "demons" -> "Demons", "falling down" -> "Falling Down")
      else if (isExactTitle) {
        tier = 2;
        score = 10000;
        if (isExactFullTitle) score += 200;
      }
      // TIER 3: Exact Artist Match (e.g. searching "post malone", "lil skies", "imagine dragons")
      else if (isExactArtist) {
        tier = 3;
        score = 8500;
        // Primary artist gets slight bonus
        if (normPrimaryArtist === normQuery || squashedPrimaryArtist === squashedQuery) {
          score += 200;
        }
      }
      // TIER 4: Title Starts With Query (e.g. "want you" -> "Want You Back")
      else if (
        normTitle.startsWith(normQuery) ||
        normCleanTitle.startsWith(normQuery) ||
        (squashedQuery.length >= 3 && (squashedTitle.startsWith(squashedQuery) || squashedCleanTitle.startsWith(squashedQuery)))
      ) {
        tier = 4;
        score = 7000;
        if (normTitle.startsWith(normQuery) || normCleanTitle.startsWith(normQuery)) score += 100;
      }
      // TIER 5: Artist Starts With Query (e.g. "post mal" -> Post Malone tracks, "lil ski" -> Lil Skies tracks, "imagine drag" -> Imagine Dragons tracks)
      else if (
        normPrimaryArtist.startsWith(normQuery) ||
        normArtist.startsWith(normQuery) ||
        creditedArtists.some(c => c.norm.startsWith(normQuery)) ||
        (squashedQuery.length >= 3 && (
          squashedPrimaryArtist.startsWith(squashedQuery) ||
          squashedArtist.startsWith(squashedQuery) ||
          creditedArtists.some(c => c.squashed.startsWith(squashedQuery))
        ))
      ) {
        tier = 5;
        score = 5500;
        if (normPrimaryArtist.startsWith(normQuery)) score += 200;
      }
      // TIER 6: Title Contains Query as whole word or substring
      else if (
        normTitle.includes(normQuery) ||
        normCleanTitle.includes(normQuery) ||
        (squashedQuery.length >= 3 && squashedTitle.includes(squashedQuery))
      ) {
        tier = 6;
        score = 4000;
        // Whole word match bonus
        const wordRegex = new RegExp(`\\b${normQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (wordRegex.test(normTitle) || wordRegex.test(normCleanTitle)) {
          score += 300;
        }
      }
      // TIER 7: Artist Contains Query as whole word or substring
      else if (
        normArtist.includes(normQuery) ||
        normPrimaryArtist.includes(normQuery) ||
        creditedArtists.some(c => c.norm.includes(normQuery)) ||
        (squashedQuery.length >= 3 && (
          squashedArtist.includes(squashedQuery) ||
          squashedPrimaryArtist.includes(squashedQuery) ||
          creditedArtists.some(c => c.squashed.includes(squashedQuery))
        ))
      ) {
        tier = 7;
        score = 3000;
        if (normPrimaryArtist.includes(normQuery)) score += 150;
      }
      // TIER 8: All Query Tokens Present in Title + Artist / Credits
      else if (queryTokens.length > 1 && queryTokens.every(tok => searchCorpus.includes(tok))) {
        tier = 8;
        score = 2000;
        for (const tok of queryTokens) {
          if (normTitle.includes(tok) || normCleanTitle.includes(tok)) score += 60;
          if (normArtist.includes(tok)) score += 40;
        }
      }
      // TIER 9: Squashed / Fuzzy Token Match
      else if (
        (squashedQuery.length >= 3 && searchCorpus.includes(squashedQuery)) ||
        queryTokens.every(tok => {
          const sq = squashSymbols(tok);
          return searchCorpus.includes(tok) || (sq.length >= 2 && searchCorpus.includes(sq));
        })
      ) {
        tier = 9;
        score = 1000;
      }

      if (tier < 99) {
        // Recognition score weighting (0-100)
        score += (recognitionScore || 50) * 3;
        // Slight penalty for overly long titles when matching title query
        score -= Math.min(40, title.length * 0.15);

        scoredItems.push({
          item,
          tier,
          score,
        });
      }
    }

    // Sort items: Tier ascending, then score descending, then title alphabetically
    scoredItems.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      if (a.score !== b.score) return b.score - a.score;
      return a.item.title.localeCompare(b.item.title);
    });

    return {
      songs: scoredItems.map(s => s.item.song),
      exactArtistMatch: exactArtistInfo,
    };
  }
}
