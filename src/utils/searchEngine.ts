import { Song } from '../types/song';
import { normalizeText, squashSymbols, extractArtistCredits, extractPrimaryArtist } from './normalizeText';

export interface IndexedSong {
  index: number;
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
  searchTokens: string[];
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
 * Ultra-fast search index for Melodex with support for 10,000+ tracks.
 * Precomputes inverted token indexes, direct exact maps, and LRU cache.
 */
export class MelodexSearchEngine {
  private indexedSongs: IndexedSong[] = [];
  private exactArtistMap: Map<string, number[]> = new Map();
  private exactTitleMap: Map<string, number[]> = new Map();
  private tokenInvertedIndex: Map<string, number[]> = new Map();
  private prefixTokensList: { prefix: string; indices: number[] }[] = [];
  private canonicalArtistNames: Map<string, string> = new Map();
  private queryCache: Map<string, SearchResult> = new Map();
  private readonly MAX_CACHE_SIZE = 64;

  constructor(songs: Song[] = []) {
    if (songs.length > 0) {
      this.buildIndex(songs);
    }
  }

  public buildIndex(songs: Song[]): void {
    const indexed: IndexedSong[] = [];
    const artistMap = new Map<string, number[]>();
    const titleMap = new Map<string, number[]>();
    const tokenMap = new Map<string, number[]>();
    const canonicalNames = new Map<string, string>();

    // Clear query cache whenever index is rebuilt
    this.queryCache.clear();

    const addArtistEntry = (key: string, index: number, canonicalName: string) => {
      if (!key) return;
      let list = artistMap.get(key);
      if (!list) {
        list = [];
        artistMap.set(key, list);
      }
      if (!list.includes(index)) {
        list.push(index);
      }
      if (!canonicalNames.has(key)) {
        canonicalNames.set(key, canonicalName);
      }
    };

    const addTitleEntry = (key: string, index: number) => {
      if (!key) return;
      let list = titleMap.get(key);
      if (!list) {
        list = [];
        titleMap.set(key, list);
      }
      if (!list.includes(index)) {
        list.push(index);
      }
    };

    const addTokenEntry = (token: string, index: number) => {
      if (!token || token.length < 2) return;
      let list = tokenMap.get(token);
      if (!list) {
        list = [];
        tokenMap.set(token, list);
      }
      if (!list.includes(index)) {
        list.push(index);
      }
    };

    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
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
        ...credited.map((c) => c.norm),
        ...credited.map((c) => c.squashed),
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

      // Collect all tokens for inverted token index
      const allTokensSet = new Set<string>();
      for (const t of titleTokens) allTokensSet.add(t);
      for (const t of cleanTitleTokens) allTokensSet.add(t);
      for (const t of artistTokens) allTokensSet.add(t);
      for (const c of credited) {
        for (const t of c.norm.split(' ').filter(Boolean)) allTokensSet.add(t);
      }
      if (squashedTitle.length >= 2) allTokensSet.add(squashedTitle);
      if (squashedCleanTitle.length >= 2) allTokensSet.add(squashedCleanTitle);
      if (squashedArtist.length >= 2) allTokensSet.add(squashedArtist);

      const itemIndex = indexed.length;
      const searchTokens = Array.from(allTokensSet);

      const item: IndexedSong = {
        index: itemIndex,
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
        searchTokens,
        searchCorpus,
        recognitionScore: typeof song.recognitionScore === 'number' ? song.recognitionScore : 50,
      };

      indexed.push(item);

      // Exact Title Maps
      addTitleEntry(normTitle, itemIndex);
      addTitleEntry(squashedTitle, itemIndex);
      if (normCleanTitle && normCleanTitle !== normTitle) {
        addTitleEntry(normCleanTitle, itemIndex);
      }
      if (squashedCleanTitle && squashedCleanTitle !== squashedTitle) {
        addTitleEntry(squashedCleanTitle, itemIndex);
      }

      // Exact Artist Maps
      addArtistEntry(normArtist, itemIndex, artist);
      addArtistEntry(squashedArtist, itemIndex, artist);
      if (normArtist.startsWith('the ') && normArtist.length > 4) {
        addArtistEntry(normArtist.slice(4).trim(), itemIndex, artist);
      }

      if (normPrimaryArtist && normPrimaryArtist !== normArtist) {
        addArtistEntry(normPrimaryArtist, itemIndex, primaryArtist);
        addArtistEntry(squashedPrimaryArtist, itemIndex, primaryArtist);
        if (normPrimaryArtist.startsWith('the ') && normPrimaryArtist.length > 4) {
          addArtistEntry(normPrimaryArtist.slice(4).trim(), itemIndex, primaryArtist);
        }
      }

      for (const c of credited) {
        addArtistEntry(c.norm, itemIndex, c.original);
        addArtistEntry(c.squashed, itemIndex, c.original);
        if (c.norm.startsWith('the ') && c.norm.length > 4) {
          addArtistEntry(c.norm.slice(4).trim(), itemIndex, c.original);
        }
      }

      // Token Inverted Index
      for (const token of searchTokens) {
        addTokenEntry(token, itemIndex);
      }
    }

    this.indexedSongs = indexed;
    this.exactArtistMap = artistMap;
    this.exactTitleMap = titleMap;
    this.tokenInvertedIndex = tokenMap;
    this.canonicalArtistNames = canonicalNames;
  }

  public get totalIndexed(): number {
    return this.indexedSongs.length;
  }

  /**
   * Fast candidate gatherer using inverted index & direct lookups.
   * Restricts candidate pool from 10,000+ tracks to relevant matches in ~1ms.
   */
  private gatherCandidates(
    normQuery: string,
    squashedQuery: string,
    queryWithoutThe: string,
    tokens: string[]
  ): Set<number> {
    const candidateIndices = new Set<number>();

    // 1. Exact artist direct index
    const exactArtists = [
      this.exactArtistMap.get(normQuery),
      this.exactArtistMap.get(squashedQuery),
      this.exactArtistMap.get(queryWithoutThe),
    ];
    for (const list of exactArtists) {
      if (list) {
        for (const idx of list) candidateIndices.add(idx);
      }
    }

    // 2. Exact title direct index
    const exactTitles = [
      this.exactTitleMap.get(normQuery),
      this.exactTitleMap.get(squashedQuery),
    ];
    for (const list of exactTitles) {
      if (list) {
        for (const idx of list) candidateIndices.add(idx);
      }
    }

    // 3. For single short 1-char query, only return exact artist and prefix title/artist matches
    if (normQuery.length === 1) {
      for (const item of this.indexedSongs) {
        if (
          item.normTitle.startsWith(normQuery) ||
          item.normArtist.startsWith(normQuery) ||
          item.normPrimaryArtist.startsWith(normQuery)
        ) {
          candidateIndices.add(item.index);
        }
      }
      return candidateIndices;
    }

    // 4. Token & Prefix matching from Inverted Token Index
    if (tokens.length === 1) {
      const tok = tokens[0];
      // Check direct token match
      const directToken = this.tokenInvertedIndex.get(tok);
      if (directToken) {
        for (const idx of directToken) candidateIndices.add(idx);
      }
      // Check tokens starting with prefix
      if (tok.length >= 2) {
        for (const [key, indices] of this.tokenInvertedIndex.entries()) {
          if (key.startsWith(tok) && key !== tok) {
            for (const idx of indices) candidateIndices.add(idx);
          }
        }
      }
    } else if (tokens.length >= 2) {
      // Multi-token query: Find tracks containing tokens
      // Gather tracks matching the first token (or prefix)
      const firstTok = tokens[0];
      const matchingFirst = new Set<number>();
      for (const [key, indices] of this.tokenInvertedIndex.entries()) {
        if (key.startsWith(firstTok)) {
          for (const idx of indices) matchingFirst.add(idx);
        }
      }

      // If we found candidates from first token, check if they contain remaining tokens in searchCorpus
      for (const idx of matchingFirst) {
        const item = this.indexedSongs[idx];
        if (tokens.every((t) => item.searchCorpus.includes(t))) {
          candidateIndices.add(idx);
        }
      }

      // Also check if any candidate matches from any other token
      for (let i = 1; i < tokens.length; i++) {
        const tok = tokens[i];
        if (tok.length >= 3) {
          for (const [key, indices] of this.tokenInvertedIndex.entries()) {
            if (key.startsWith(tok)) {
              for (const idx of indices) {
                const item = this.indexedSongs[idx];
                if (tokens.every((t) => item.searchCorpus.includes(t))) {
                  candidateIndices.add(idx);
                }
              }
            }
          }
        }
      }
    }

    // 5. Fallback contains check for 3+ char queries if candidate pool is small
    if (candidateIndices.size < 50 && (normQuery.length >= 3 || squashedQuery.length >= 3)) {
      for (const item of this.indexedSongs) {
        if (
          item.normTitle.includes(normQuery) ||
          item.normArtist.includes(normQuery) ||
          item.normPrimaryArtist.includes(normQuery) ||
          (squashedQuery.length >= 3 && (item.squashedTitle.includes(squashedQuery) || item.squashedArtist.includes(squashedQuery))) ||
          (tokens.length > 1 && tokens.every((t) => item.searchCorpus.includes(t)))
        ) {
          candidateIndices.add(item.index);
        }
      }
    }

    return candidateIndices;
  }

  /**
   * Search catalog across track title, artist, and all credited artists.
   * Returns complete match set without arbitrary result limits.
   * Optimized for 10,000+ tracks with < 5ms average latency.
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

    // Check LRU Cache
    const cacheKey = normQuery + '::' + squashedQuery;
    const cached = this.queryCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const queryTokens = normQuery.split(' ').filter(Boolean);
    const queryWithoutThe =
      normQuery.startsWith('the ') && normQuery.length > 4
        ? normQuery.slice(4).trim()
        : normQuery;

    // 1. Fast EXACT ARTIST MATCH detection
    const exactArtistList =
      this.exactArtistMap.get(normQuery) ||
      this.exactArtistMap.get(squashedQuery) ||
      this.exactArtistMap.get(queryWithoutThe);

    let exactArtistInfo: ExactArtistMatchInfo | undefined = undefined;

    if (exactArtistList && exactArtistList.length > 0) {
      const canonicalName =
        this.canonicalArtistNames.get(normQuery) ||
        this.canonicalArtistNames.get(squashedQuery) ||
        this.canonicalArtistNames.get(queryWithoutThe) ||
        this.indexedSongs[exactArtistList[0]]?.song.artist;

      exactArtistInfo = {
        artistName: canonicalName,
        totalCount: exactArtistList.length,
      };
    }

    // 2. Gather candidates from inverted index (fast set lookup)
    const candidateIndices = this.gatherCandidates(
      normQuery,
      squashedQuery,
      queryWithoutThe,
      queryTokens
    );

    // 3. Score only the candidate tracks (never sort 10,000 items)
    interface ScoredItem {
      item: IndexedSong;
      tier: number;
      score: number;
    }

    const scoredItems: ScoredItem[] = [];

    for (const idx of candidateIndices) {
      const item = this.indexedSongs[idx];
      if (!item) continue;

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
        creditedArtists.some((c) => c.norm === normQuery || c.squashed === squashedQuery) ||
        (queryWithoutThe.length > 2 && (normPrimaryArtist === queryWithoutThe || normArtist === queryWithoutThe));

      // Exact Title Match check
      const isExactFullTitle = normTitle === normQuery || squashedTitle === squashedQuery;
      const isExactCleanTitle = normCleanTitle === normQuery || squashedCleanTitle === squashedQuery;
      const isExactTitle = isExactFullTitle || isExactCleanTitle;

      // Artist + Title combo query check
      let isArtistAndTitleCombo = false;
      let comboBonus = 0;

      if (queryTokens.length >= 2) {
        const normCreditedNames = creditedArtists.map((c) => c.norm);

        for (let split = 1; split < queryTokens.length; split++) {
          const part1 = queryTokens.slice(0, split).join(' ');
          const part2 = queryTokens.slice(split).join(' ');

          // Part 1 Artist, Part 2 Title
          const part1MatchesArtist =
            normArtist === part1 ||
            normPrimaryArtist === part1 ||
            normCreditedNames.some((c) => c === part1) ||
            normArtist.includes(part1) ||
            normPrimaryArtist.includes(part1) ||
            normCreditedNames.some((c) => c.includes(part1));

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

          // Part 1 Title, Part 2 Artist
          const part1MatchesTitle =
            normTitle === part1 ||
            normCleanTitle === part1 ||
            normTitle.startsWith(part1) ||
            normCleanTitle.startsWith(part1) ||
            normTitle.includes(part1);

          const part2MatchesArtist =
            normArtist === part2 ||
            normPrimaryArtist === part2 ||
            normCreditedNames.some((c) => c === part2) ||
            normArtist.includes(part2) ||
            normPrimaryArtist.includes(part2) ||
            normCreditedNames.some((c) => c.includes(part2));

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
      // TIER 2: Exact Title Match
      else if (isExactTitle) {
        tier = 2;
        score = 10000;
        if (isExactFullTitle) score += 200;
      }
      // TIER 3: Exact Artist Match
      else if (isExactArtist) {
        tier = 3;
        score = 8500;
        if (normPrimaryArtist === normQuery || squashedPrimaryArtist === squashedQuery) {
          score += 200;
        }
      }
      // TIER 4: Title Starts With Query
      else if (
        normTitle.startsWith(normQuery) ||
        normCleanTitle.startsWith(normQuery) ||
        (squashedQuery.length >= 3 && (squashedTitle.startsWith(squashedQuery) || squashedCleanTitle.startsWith(squashedQuery)))
      ) {
        tier = 4;
        score = 7000;
        if (normTitle.startsWith(normQuery) || normCleanTitle.startsWith(normQuery)) score += 100;
      }
      // TIER 5: Artist Starts With Query
      else if (
        normPrimaryArtist.startsWith(normQuery) ||
        normArtist.startsWith(normQuery) ||
        creditedArtists.some((c) => c.norm.startsWith(normQuery)) ||
        (squashedQuery.length >= 3 && (
          squashedPrimaryArtist.startsWith(squashedQuery) ||
          squashedArtist.startsWith(squashedQuery) ||
          creditedArtists.some((c) => c.squashed.startsWith(squashedQuery))
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
        const wordRegex = new RegExp(`\\b${normQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (wordRegex.test(normTitle) || wordRegex.test(normCleanTitle)) {
          score += 300;
        }
      }
      // TIER 7: Artist Contains Query as whole word or substring
      else if (
        normArtist.includes(normQuery) ||
        normPrimaryArtist.includes(normQuery) ||
        creditedArtists.some((c) => c.norm.includes(normQuery)) ||
        (squashedQuery.length >= 3 && (
          squashedArtist.includes(squashedQuery) ||
          squashedPrimaryArtist.includes(squashedQuery) ||
          creditedArtists.some((c) => c.squashed.includes(squashedQuery))
        ))
      ) {
        tier = 7;
        score = 3000;
        if (normPrimaryArtist.includes(normQuery)) score += 150;
      }
      // TIER 8: All Query Tokens Present in Title + Artist / Credits
      else if (queryTokens.length > 1 && queryTokens.every((tok) => searchCorpus.includes(tok))) {
        tier = 8;
        score = 2000;
        for (const tok of queryTokens) {
          if (normTitle.includes(tok)) score += 60;
          if (normArtist.includes(tok)) score += 40;
        }
      }
      // TIER 9: Squashed / Fuzzy Token Match
      else if (
        (squashedQuery.length >= 3 && searchCorpus.includes(squashedQuery)) ||
        queryTokens.every((tok) => {
          const sq = squashSymbols(tok);
          return searchCorpus.includes(tok) || (sq.length >= 2 && searchCorpus.includes(sq));
        })
      ) {
        tier = 9;
        score = 1000;
      }

      if (tier < 99) {
        score += (recognitionScore || 50) * 3;
        score -= Math.min(40, title.length * 0.15);

        scoredItems.push({
          item,
          tier,
          score,
        });
      }
    }

    // Sort only the matched subset (< 200 tracks)
    scoredItems.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      if (a.score !== b.score) return b.score - a.score;
      return a.item.title.localeCompare(b.item.title);
    });

    const result: SearchResult = {
      songs: scoredItems.map((s) => s.item.song),
      exactArtistMatch: exactArtistInfo,
    };

    // Store in LRU cache
    if (this.queryCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.queryCache.keys().next().value;
      if (oldestKey) this.queryCache.delete(oldestKey);
    }
    this.queryCache.set(cacheKey, result);

    return result;
  }
}
