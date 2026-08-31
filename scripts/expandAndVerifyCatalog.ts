import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  year?: number;
  genre?: string;
  artworkUrl?: string;
  previewUrl: string;
  previewStart?: number;
}

export interface GenericTrackCandidate {
  sourceId: string;
  title: string;
  artist: string;
  albumName?: string;
  albumId?: string | number;
  releaseDate?: string;
  releaseYear?: number;
  genre?: string;
  artworkUrl?: string;
  previewUrl: string;
}

export interface ArtistConfig {
  name: string;
  queries: string[];
  primaryGenre: string;
  targetCount: number;
  isValidationArtist?: boolean;
}

const CATALOG_DATA_PATH = path.resolve(__dirname, '../src/data/melodex-catalog.json');
const CATALOG_PUBLIC_PATH = path.resolve(__dirname, '../public/melodex-catalog.json');

fs.mkdirSync(path.dirname(CATALOG_DATA_PATH), { recursive: true });
fs.mkdirSync(path.dirname(CATALOG_PUBLIC_PATH), { recursive: true });

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanSongTitle(rawTitle: string): string {
  let title = rawTitle;
  title = title.replace(/\s*(\(|\[).*?(remaster|deluxe|anniversary|expanded|edition|clean version|album version|single version|original mix|bonus track).*?(\)|\])/gi, '');
  title = title.replace(/\s*-\s*(remastered|deluxe|anniversary|bonus track|single version|clean|explicit|radio edit).*/gi, '');
  return title.trim();
}

export function cleanSongTitleForDeduplication(rawTitle: string): string {
  let title = cleanSongTitle(rawTitle);
  title = title.replace(/\s*(\(|\[)(feat\.|ft\.|with|featuring).*?(\)|\])/gi, '');
  return normalizeText(title);
}

export function createSignature(artist: string, title: string): string {
  const normArtist = normalizeText(artist);
  const cleanTitle = cleanSongTitleForDeduplication(title);
  return `${normArtist}:::${cleanTitle}`;
}

export function isArtistMatch(songArtist: string, targetArtist: string): boolean {
  const normSong = normalizeText(songArtist);
  const normTarget = normalizeText(targetArtist);

  if (normSong === normTarget) return true;

  const strippedSong = normSong.replace(/\s+/g, '');
  const strippedTarget = normTarget.replace(/\s+/g, '');
  if (strippedSong === strippedTarget) return true;

  // Check if primary artist matches
  const primaryArtist = normSong.split(/\s+(?:and|&|feat|ft|with|featuring|x|\+|,)\s+/)[0]?.trim();
  if (primaryArtist === normTarget || primaryArtist?.replace(/\s+/g, '') === strippedTarget) {
    return true;
  }

  // Check token inclusion
  const tokens = normSong.split(/\s+(?:and|&|feat|ft|with|featuring|x|\+|,)\s+/);
  if (tokens.some(t => t.trim() === normTarget || t.replace(/\s+/g, '') === strippedTarget)) {
    return true;
  }

  if (normSong.startsWith(normTarget + ' ') || normSong.endsWith(' ' + normTarget) || normSong.includes(' ' + normTarget + ' ')) {
    return true;
  }

  return false;
}

export function isBogusTrack(title: string, artist: string, album?: string, targetArtist = ''): boolean {
  const normTitle = (title || '').toLowerCase();
  const normArtist = (artist || '').toLowerCase();
  const normAlbum = (album || '').toLowerCase();

  const bogusKeywords = [
    'tribute',
    'karaoke',
    'originally performed by',
    'in the style of',
    'hit crew',
    'instrumental version',
    'piano tribute',
    'string quartet',
    'lullaby version',
    'cover band',
    'sound-a-like',
    'sound alike',
    'commentary',
    'interview',
    'track by track',
    'megamix',
    'ringtone',
    'workout mix',
    'remix tribute',
    'sleep music',
    'relaxing piano',
  ];

  for (const kw of bogusKeywords) {
    if (normArtist.includes(kw) || normTitle.includes(kw) || normAlbum.includes(kw)) {
      return true;
    }
  }

  if (targetArtist && !isArtistMatch(artist, targetArtist)) {
    return true;
  }

  return false;
}

// Known song release years for classic hits that often get tagged with reissue/remaster dates
const KNOWN_SONG_YEARS: Record<string, number> = {
  'queen:::bohemian rhapsody': 1975,
  'queen:::we are the champions': 1977,
  'queen:::we will rock you': 1977,
  'queen:::dont stop me now': 1978,
  'queen:::another one bites the dust': 1980,
  'queen:::under pressure': 1981,
  'queen:::radio ga ga': 1984,
  'queen:::i want to break free': 1984,
  'queen:::somebody to love': 1976,
  'queen:::killer queen': 1974,
  'queen:::crazy little thing called love': 1979,
  'nirvana:::smells like teen spirit': 1991,
  'nirvana:::come as you are': 1991,
  'nirvana:::in bloom': 1991,
  'nirvana:::lithium': 1991,
  'nirvana:::heart shaped box': 1993,
  'nirvana:::all apologies': 1993,
  'nirvana:::the man who sold the world': 1993,
  'nirvana:::about a girl': 1989,
  'the beatles:::hey jude': 1968,
  'the beatles:::let it be': 1970,
  'the beatles:::come together': 1969,
  'the beatles:::yesterday': 1965,
  'the beatles:::here comes the sun': 1969,
  'the beatles:::twist and shout': 1963,
  'the beatles:::help': 1965,
  'the beatles:::all you need is love': 1967,
  'the beatles:::in my life': 1965,
  'the beatles:::eleanor rigby': 1966,
  'michael jackson:::thriller': 1982,
  'michael jackson:::billie jean': 1982,
  'michael jackson:::beat it': 1982,
  'michael jackson:::smooth criminal': 1987,
  'michael jackson:::bad': 1987,
  'michael jackson:::man in the mirror': 1987,
  'michael jackson:::black or white': 1991,
  'michael jackson:::dont stop til you get enough': 1979,
  'michael jackson:::rock with you': 1979,
  'michael jackson:::the way you make me feel': 1987,
  'daft punk:::one more time': 2000,
  'daft punk:::around the world': 1997,
  'daft punk:::harder better faster stronger': 2001,
  'daft punk:::get lucky': 2013,
  'daft punk:::da funk': 1995,
  'daft punk:::instant crush': 2013,
  'daft punk:::lose yourself to dance': 2013,
  'avicii:::levels': 2011,
  'avicii:::wake me up': 2013,
  'avicii:::hey brother': 2013,
  'avicii:::the nights': 2014,
  'avicii:::waiting for love': 2015,
  'avicii:::without you': 2017,
  'avicii:::sos': 2019,
  'avicii:::i could be the one': 2012,
  'lil skies:::nowadays': 2017,
  'lil skies:::red roses': 2017,
  'lil skies:::lust': 2018,
  'lil skies:::welcome to the rodeo': 2018,
  'lil skies:::i': 2019,
  'lil skies:::signs of jealousy': 2017,
  'lil skies:::creeping': 2018,
  'lil skies:::strictly business': 2018,
  'lil skies:::magic': 2019,
  'lil skies:::rihanna': 2020,
  'lil skies:::havin my way': 2020,
  'lil skies:::on sight': 2020,
  'lil skies:::ok': 2020,
  'lil skies:::name in the sand': 2019,
  'post malone:::white iverson': 2015,
  'post malone:::congratulations': 2016,
  'post malone:::rockstar': 2017,
  'post malone:::psycho': 2018,
  'post malone:::better now': 2018,
  'post malone:::sunflower': 2018,
  'post malone:::circles': 2019,
  'post malone:::wow': 2018,
  'post malone:::goodbyes': 2019,
  'post malone:::i fall apart': 2016,
  'post malone:::take what you want': 2019,
  'post malone:::cooped up': 2022,
  'post malone:::i like you': 2022,
  'post malone:::chemical': 2023,
  'post malone:::mourning': 2023,
  'post malone:::overdrive': 2023,
  'post malone:::enough is enough': 2023,
  'post malone:::i had some help': 2024,
  'post malone:::guy for that': 2024,
  'post malone:::pour me a drink': 2024,
  'post malone:::go flex': 2016,
  'post malone:::candy paint': 2017,
  'post malone:::stay': 2018,
  'post malone:::saint tropez': 2019,
  'lil uzi vert:::xo tour llif3': 2017,
  'lil uzi vert:::money longer': 2016,
  'lil uzi vert:::you was right': 2016,
  'lil uzi vert:::the way life goes': 2017,
  'lil uzi vert:::sauce it up': 2017,
  'lil uzi vert:::20 min': 2017,
  'lil uzi vert:::just wanna rock': 2022,
  'lil uzi vert:::myron': 2020,
  'lil uzi vert:::futsal shuffle 2020': 2019,
  'lil uzi vert:::do what i want': 2016,
  'lil uzi vert:::ps qs': 2016,
  'lil uzi vert:::erase your social': 2016,
  'lil uzi vert:::baby pluto': 2020,
  'lil uzi vert:::p2': 2020,
  'lil uzi vert:::bean kobe': 2020,
  'juicewrld:::lucid dreams': 2018,
  'juicewrld:::all girls are the same': 2018,
  'juicewrld:::robbery': 2019,
  'juicewrld:::lean wit me': 2018,
  'juicewrld:::bandit': 2019,
  'juicewrld:::armed and dangerous': 2018,
  'juicewrld:::legends': 2018,
  'juicewrld:::fast': 2019,
  'juicewrld:::righteous': 2020,
  'juicewrld:::come go': 2020,
  'juicewrld:::wishing well': 2020,
  'juicewrld:::already dead': 2021,
  'juicewrld:::burn': 2021,
  'juicewrld:::black white': 2018,
  'juicewrld:::wasted': 2018,
  'juicewrld:::hear me calling': 2019,
  'juicewrld:::cigarettes': 2022,
  'juicewrld:::in my head': 2022,
  'xxxtentacion:::sad': 2018,
  'xxxtentacion:::moonlight': 2018,
  'xxxtentacion:::jocelyn flores': 2017,
  'xxxtentacion:::look at me': 2015,
  'xxxtentacion:::fuck love': 2017,
  'xxxtentacion:::changes': 2018,
  'xxxtentacion:::hope': 2018,
  'xxxtentacion:::everybody dies in their nightmares': 2017,
  'xxxtentacion:::revenge': 2017,
  'xxxtentacion:::bad': 2018,
  'xxxtentacion:::falling down': 2018,
  'xxxtentacion:::sauce': 2019,
  'xxxtentacion:::the remedy for a broken heart': 2018,
  'xxxtentacion:::numb': 2018,
  'trippie redd:::love scars': 2017,
  'trippie redd:::dark knight dummo': 2017,
  'trippie redd:::topanga': 2018,
  'trippie redd:::miss the rage': 2021,
  'trippie redd:::taking a walk': 2018,
  'trippie redd:::poles1469': 2017,
  'trippie redd:::1400 999 freestyle': 2018,
  'trippie redd:::who needs love': 2019,
  'trippie redd:::holy smokes': 2021,
  'trippie redd:::the grinch': 2019,
  'trippie redd:::wish': 2018,
  'trippie redd:::fuck love': 2017,
  'trippie redd:::hurts me': 2023,
  'ski mask the slump god:::catch me outside': 2017,
  'ski mask the slump god:::faucet failure': 2018,
  'ski mask the slump god:::take a step back': 2016,
  'ski mask the slump god:::nuketown': 2018,
  'ski mask the slump god:::babywipe': 2017,
  'ski mask the slump god:::unbothered': 2020,
  'ski mask the slump god:::foot fungus': 2018,
  'ski mask the slump god:::doremi': 2020,
  'ski mask the slump god:::burn the hoods': 2020,
  'ski mask the slump god:::shibuya': 2024,
  'ynw melly:::murder on my mind': 2017,
  'ynw melly:::223s': 2019,
  'ynw melly:::suicidal': 2019,
  'ynw melly:::mixed personalities': 2019,
  'ynw melly:::mama cry': 2018,
  'ynw melly:::virtual blue balenciagas': 2018,
  'ynw melly:::city girls': 2019,
  'ynw melly:::butter peckin': 2018,
  'ynw melly:::freddy krueger': 2019,
  'ynw melly:::thugged out': 2021,
  'ynw melly:::bang bang': 2019,
  'playboi carti:::magnolia': 2017,
  'playboi carti:::wokeuplikethis': 2017,
  'playboi carti:::shoota': 2018,
  'playboi carti:::sky': 2020,
  'playboi carti:::rip': 2018,
  'playboi carti:::location': 2017,
  'playboi carti:::vamp anthem': 2020,
  'playboi carti:::iloveuihateu': 2020,
  'playboi carti:::over': 2020,
  'playboi carti:::stop breathing': 2020,
  'playboi carti:::fell in luv': 2018,
  'playboi carti:::flatbed freestyle': 2018,
  'playboi carti:::long time': 2018,
  'playboi carti:::foreign': 2018,
  'playboi carti:::meh': 2020,
  'travis scott:::sicko mode': 2018,
  'travis scott:::goosebumps': 2016,
  'travis scott:::antidote': 2015,
  'travis scott:::butterfly effect': 2017,
  'travis scott:::highest in the room': 2019,
  'travis scott:::fein': 2023,
  'travis scott:::telekinesis': 2023,
  'travis scott:::i know': 2023,
  'travis scott:::meltdown': 2023,
  'travis scott:::my eyes': 2023,
  'travis scott:::yosemite': 2018,
  'travis scott:::stargazing': 2018,
  'travis scott:::pick up the phone': 2016,
  'travis scott:::90210': 2015,
  'future:::mask off': 2017,
  'future:::life is good': 2020,
  'future:::march madness': 2015,
  'future:::codeine crazy': 2014,
  'future:::where ya at': 2015,
  'future:::low life': 2016,
  'future:::fuck up some commas': 2015,
  'future:::used to this': 2016,
  'future:::turn on the lights': 2012,
  'future:::stick talk': 2015,
  'future:::too comfortable': 2020,
  'future:::solo': 2017,
  'future:::wait for u': 2022,
  'future:::superhero': 2022,
  'future:::like that': 2024,
  'future:::type shit': 2024,
  'future:::jumpman': 2015,
  '21 savage:::bank account': 2017,
  '21 savage:::a lot': 2018,
  '21 savage:::redrum': 2024,
  '21 savage:::ghostface killers': 2017,
  '21 savage:::no heart': 2016,
  '21 savage:::x': 2016,
  '21 savage:::ric flair drip': 2017,
  '21 savage:::glock in my lap': 2020,
  '21 savage:::runnin': 2020,
  '21 savage:::mr right now': 2020,
  '21 savage:::rich flex': 2022,
  '21 savage:::spin bout u': 2022,
  '21 savage:::on bs': 2022,
  '21 savage:::sneaky': 2024,
  '21 savage:::nee nah': 2024,
  '21 savage:::ball wo you': 2018,
  '21 savage:::10 freaky girls': 2018,
  'young thug:::the london': 2019,
  'young thug:::hot': 2019,
  'young thug:::digits': 2016,
  'young thug:::pick up the phone': 2016,
  'young thug:::best friend': 2015,
  'young thug:::check': 2015,
  'young thug:::stoner': 2014,
  'young thug:::with that': 2015,
  'young thug:::relationship': 2017,
  'young thug:::ski': 2021,
  'young thug:::solid': 2021,
  'young thug:::bubbly': 2021,
  'young thug:::out west': 2019,
  'young thug:::guwop': 2016,
  'young thug:::halftime': 2015,
  'young thug:::power': 2015,
  'young thug:::killed before': 2017,
  'young thug:::lifestyle': 2014,
  'a boogie wit da hoodie:::drowning': 2017,
  'a boogie wit da hoodie:::look back at it': 2018,
  'a boogie wit da hoodie:::swervin': 2018,
  'a boogie wit da hoodie:::my shit': 2016,
  'a boogie wit da hoodie:::jungle': 2016,
  'a boogie wit da hoodie:::timeless': 2016,
  'a boogie wit da hoodie:::bleed': 2020,
  'a boogie wit da hoodie:::secrets': 2020,
  'a boogie wit da hoodie:::me and my guitar': 2020,
  'a boogie wit da hoodie:::numbers': 2020,
  'a boogie wit da hoodie:::still think about you': 2016,
  'a boogie wit da hoodie:::startender': 2018,
  'a boogie wit da hoodie:::dtb interlude': 2020,
  'a boogie wit da hoodie:::man in the mirror': 2021,
  'a boogie wit da hoodie:::hello': 2020,
  'kodak black:::tunnel vision': 2017,
  'kodak black:::no flockin': 2014,
  'kodak black:::super gremlin': 2021,
  'kodak black:::zeze': 2018,
  'kodak black:::roll in peace': 2017,
  'kodak black:::transportin': 2017,
  'kodak black:::lockjaw': 2016,
  'kodak black:::wake up in the sky': 2018,
  'kodak black:::like dat': 2015,
  'kodak black:::calling my spirit': 2018,
  'kodak black:::skrt': 2014,
  'kodak black:::there he go': 2016,
  'kodak black:::pissed off': 2022,
  'kodak black:::patty cake': 2017,
  'kodak black:::feelin peachy': 2021,
  'kodak black:::walk': 2022,
  'polo g:::pop out': 2019,
  'polo g:::rapstar': 2021,
  'polo g:::martin gina': 2020,
  'polo g:::through da storm': 2019,
  'polo g:::finer things': 2018,
  'polo g:::21': 2020,
  'polo g:::heartless': 2019,
  'polo g:::go stupid': 2020,
  'polo g:::dnd': 2020,
  'polo g:::epidemic': 2020,
  'polo g:::gnf': 2021,
  'polo g:::black hearted': 2021,
  'polo g:::no return': 2021,
  'polo g:::flex': 2020,
  'polo g:::distraction': 2022,
  'polo g:::i know': 2020,
  'polo g:::bad man': 2021,
  'polo g:::toxic': 2021,
  'lil tjay:::calling my phone': 2021,
  'lil tjay:::fn': 2019,
  'lil tjay:::pop out': 2019,
  'lil tjay:::mood swings': 2020,
  'lil tjay:::leaked': 2019,
  'lil tjay:::brothers': 2018,
  'lil tjay:::resume': 2017,
  'lil tjay:::hold on': 2019,
  'lil tjay:::ruthless': 2019,
  'lil tjay:::none of your love': 2020,
  'lil tjay:::beat the odds': 2022,
  'lil tjay:::run it up': 2021,
  'lil tjay:::headshot': 2021,
  'lil tjay:::in my head': 2022,
  'lil tjay:::born 2 be great': 2021,
  'lil tjay:::sex sounds': 2019,
};

export async function testAudioPlayability(previewUrl: string): Promise<{ playable: boolean; reason?: string }> {
  if (!previewUrl || !previewUrl.startsWith('http')) {
    return { playable: false, reason: 'Invalid URL format' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(previewUrl, {
      method: 'GET',
      headers: {
        Range: 'bytes=0-2048',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok && res.status !== 206) {
      return { playable: false, reason: `HTTP status ${res.status}` };
    }

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength < 50) {
      return { playable: false, reason: 'Empty audio stream' };
    }

    return { playable: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { playable: false, reason: message };
  }
}

// Album metadata cache to prevent duplicate queries
const albumCache = new Map<string | number, { year: number | null; genre: string }>();

export async function getDeezerAlbumInfo(albumId: string | number): Promise<{ year: number | null; genre: string }> {
  if (!albumId) return { year: null, genre: 'Pop' };
  if (albumCache.has(albumId)) {
    return albumCache.get(albumId)!;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`https://api.deezer.com/album/${albumId}`);
      if (!res.ok) {
        if (attempt === 2) {
          albumCache.set(albumId, { year: null, genre: 'Pop' });
          return { year: null, genre: 'Pop' };
        }
        await new Promise(r => setTimeout(r, 600));
        continue;
      }

      const data = await res.json();
      if (data.error) {
        if (data.error.code === 4 || data.error.message?.includes('Quota')) {
          await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
          continue;
        }
      }

      let year: number | null = null;
      if (data.release_date) {
        const parsed = parseInt(data.release_date.slice(0, 4), 10);
        if (!isNaN(parsed) && parsed >= 1950 && parsed <= 2026) {
          year = parsed;
        }
      }

      const genre = (Array.isArray(data.genres?.data) && data.genres.data[0]?.name) ? data.genres.data[0].name : 'Pop';
      const result = { year, genre };
      albumCache.set(albumId, result);
      return result;
    } catch {
      if (attempt === 2) {
        const fallback = { year: null, genre: 'Pop' };
        albumCache.set(albumId, fallback);
        return fallback;
      }
      await new Promise(r => setTimeout(r, 600));
    }
  }

  const fallback = { year: null, genre: 'Pop' };
  albumCache.set(albumId, fallback);
  return fallback;
}

export async function fetchDeezerTracksForArtist(artistName: string, queries: string[]): Promise<GenericTrackCandidate[]> {
  const candidates: GenericTrackCandidate[] = [];
  const seenIds = new Set<string>();

  const searchTerms = [
    `artist:"${artistName}"`,
    artistName,
    ...queries.map(q => `${artistName} ${q}`),
  ];

  for (const term of searchTerms) {
    try {
      const url = `https://api.deezer.com/search?q=${encodeURIComponent(term)}&limit=50`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data.data)) {
        for (const item of data.data) {
          if (!item || !item.id || !item.preview || seenIds.has(String(item.id))) continue;
          seenIds.add(String(item.id));

          candidates.push({
            sourceId: `dz_${item.id}`,
            title: item.title_short || item.title,
            artist: item.artist?.name || artistName,
            albumName: item.album?.title,
            albumId: item.album?.id,
            artworkUrl: item.album?.cover_big || item.album?.cover_medium || item.album?.cover,
            previewUrl: item.preview,
          });
        }
      }
      await new Promise(r => setTimeout(r, 40));
    } catch {
      // Continue
    }
  }

  return candidates;
}

export const ARTISTS_TO_EXPAND: ArtistConfig[] = [
  // 1. Target Priority Validation Artists
  {
    name: 'Post Malone',
    queries: ['Stoney', 'beerbongs bentleys', 'Hollywoods Bleeding', 'Austin', 'F-1 Trillion', 'Twelve Carat Toothache', 'White Iverson', 'Congratulations', 'rockstar', 'Circles', 'Better Now', 'Sunflower', 'Chemical', 'I Had Some Help'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 28,
    isValidationArtist: true,
  },
  {
    name: 'Lil Skies',
    queries: ['Life of a Dark Rose', 'Shelby', 'Unbothered', 'Nowadays', 'Red Roses', 'Lust', 'Welcome to the Rodeo', 'I', 'Signs of Jealousy', 'Creeping', 'Havin My Way', 'Magic', 'Riot', 'Name in the Sand'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 18,
    isValidationArtist: true,
  },
  {
    name: 'Lil Uzi Vert',
    queries: ['Luv Is Rage', 'Lil Uzi Vert Vs The World', 'The Perfect Luv Tape', 'Luv Is Rage 2', 'Eternal Atake', 'Pink Tape', 'XO Tour Llif3', 'Money Longer', 'Do What I Want', 'You Was Right', '20 Min', 'The Way Life Goes', 'Sauce It Up', 'Just Wanna Rock', 'Myron'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 26,
    isValidationArtist: true,
  },
  {
    name: 'Lil Peep',
    queries: ['Come Over When Youre Sober', 'Hellboy', 'Crybaby', 'Star Shopping', 'Falling Down', 'Beamer Boy', 'Witchblades', 'Save That Shit', 'Awful Things', 'Life is Beautiful', 'Spotlight', 'Benz Truck', 'Cry Alone', '16 Lines'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 20,
    isValidationArtist: true,
  },
  {
    name: 'Juice WRLD',
    queries: ['Goodbye Good Riddance', 'Death Race For Love', 'Legends Never Die', 'Fighting Demons', 'Lucid Dreams', 'All Girls Are the Same', 'Robbery', 'Bandit', 'Lean Wit Me', 'Armed and Dangerous', 'Legends', 'Fast', 'Righteous', 'Come Go', 'Wishing Well', 'Already Dead', 'Burn', 'Black White', 'Wasted'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 28,
    isValidationArtist: true,
  },
  {
    name: 'XXXTentacion',
    queries: ['17', '?', 'Skins', 'Bad Vibes Forever', 'SAD', 'Moonlight', 'Look At Me', 'Jocelyn Flores', 'Changes', 'Fuck Love', 'Hope', 'Everybody Dies in Their Nightmares', 'Revenge', 'BAD', 'Falling Down', 'Sauce', 'The Remedy for a Broken Heart', 'NUMB'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 25,
    isValidationArtist: true,
  },
  {
    name: 'Trippie Redd',
    queries: ['A Love Letter To You', 'Lifes A Trip', 'Trip At Knight', 'Love Scars', 'Dark Knight Dummo', 'Topanga', 'Miss The Rage', 'Taking a Walk', 'Poles1469', '1400 999 Freestyle', 'Who Needs Love', 'Holy Smokes', 'The Grinch', 'Wish'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 25,
    isValidationArtist: true,
  },
  {
    name: 'Ski Mask the Slump God',
    queries: ['Stokeley', 'You Will Regret', '11th Dimension', 'Faucet Failure', 'Catch Me Outside', 'Take A Step Back', 'BabyWipe', 'Nuketown', 'Unbothered', 'Foot Fungus', 'DoReMi', 'Burn The Hoods', 'Shibuya'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 18,
    isValidationArtist: true,
  },
  {
    name: 'YNW Melly',
    queries: ['I Am You', 'We All Shine', 'Melly vs Melvin', 'Murder on My Mind', '223s', 'Suicidal', 'Mixed Personalities', 'Mama Cry', 'Virtual Blue Balenciagas', 'City Girls', 'Butter Peckin', 'Freddy Krueger', 'Bang Bang'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 16,
    isValidationArtist: true,
  },
  {
    name: 'Playboi Carti',
    queries: ['Playboi Carti', 'Die Lit', 'Whole Lotta Red', 'Magnolia', 'wokeuplikethis', 'Sky', 'Shoota', 'RIP', 'Location', 'Vamp Anthem', 'ILoveUIHateU', 'Over', 'Stop Breathing', 'Fell in Luv', 'FlatBed Freestyle', 'Long Time', 'Foreign'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 22,
    isValidationArtist: true,
  },
  {
    name: 'Travis Scott',
    queries: ['Astroworld', 'Utopia', 'Rodeo', 'Birds In The Trap', 'Sicko Mode', 'Goosebumps', 'Antidote', 'Butterfly Effect', 'Highest in the Room', 'Fein', 'Telekinesis', 'I Know', 'Meltdown', 'My Eyes', 'Yosemite', 'Stargazing', 'Pick Up the Phone'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 26,
    isValidationArtist: true,
  },
  {
    name: 'Future',
    queries: ['DS2', 'Monster', 'I Never Liked You', 'We Dont Trust You', 'Mask Off', 'Life Is Good', 'March Madness', 'Codeine Crazy', 'Where Ya At', 'Low Life', 'Fuck Up Some Commas', 'Used to This', 'Turn On the Lights', 'Stick Talk', 'Wait For U', 'Superhero', 'Like That'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 25,
    isValidationArtist: true,
  },
  {
    name: '21 Savage',
    queries: ['Issa Album', 'Savage Mode', 'I Am I Was', 'American Dream', 'Bank Account', 'a lot', 'Redrum', 'Ghostface Killers', 'No Heart', 'X', 'Ric Flair Drip', 'Glock in My Lap', 'Runnin', 'Mr Right Now', 'Rich Flex', 'Spin Bout U', 'Nee Nah'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 24,
    isValidationArtist: true,
  },
  {
    name: 'Young Thug',
    queries: ['So Much Fun', 'Barter 6', 'Jeffery', 'Business Is Business', 'The London', 'Hot', 'Digits', 'Pick Up the Phone', 'Best Friend', 'Check', 'Stoner', 'Relationship', 'Ski', 'Solid', 'Bubbly', 'Out West', 'Power', 'Lifestyle'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 24,
    isValidationArtist: true,
  },
  {
    name: 'A Boogie wit da Hoodie',
    queries: ['Hoodie SZN', 'Artist 2.0', 'The Bigger Artist', 'Drowning', 'Look Back At It', 'Swervin', 'My Shit', 'Jungle', 'Timeless', 'Bleed', 'Secrets', 'Me and My Guitar', 'Numbers', 'Still Think About You', 'Startender', 'Hello'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 20,
    isValidationArtist: true,
  },
  {
    name: 'Kodak Black',
    queries: ['Painting Pictures', 'Dying To Live', 'Back For Everything', 'Tunnel Vision', 'Super Gremlin', 'ZEZE', 'No Flockin', 'Roll in Peace', 'Transportin', 'Lockjaw', 'Wake Up in the Sky', 'Calling My Spirit', 'SKRT', 'Feelin Peachy'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 20,
    isValidationArtist: true,
  },
  {
    name: 'Polo G',
    queries: ['Die A Legend', 'The GOAT', 'Hall Of Fame', 'Pop Out', 'RAPSTAR', 'Martin Gina', 'Through Da Storm', 'Finer Things', '21', 'Heartless', 'Go Stupid', 'DND', 'Epidemic', 'GNF', 'Black Hearted', 'Flex'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 22,
    isValidationArtist: true,
  },
  {
    name: 'Lil Tjay',
    queries: ['True 2 Myself', 'Destined 2 Win', '222', 'Calling My Phone', 'F.N', 'Pop Out', 'Mood Swings', 'Leaked', 'Brothers', 'Resume', 'Hold On', 'Ruthless', 'Beat the Odds', 'Run It Up', 'In My Head', 'Sex Sounds'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 20,
    isValidationArtist: true,
  },

  // 2. Global & Other Prominent Melodex Artists
  {
    name: 'Drake',
    queries: ['Take Care', 'Views', 'Scorpion', 'Certified Lover Boy', 'Her Loss', 'For All The Dogs', 'Gods Plan', 'One Dance', 'Hotline Bling', 'In My Feelings', 'Passionfruit'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 28,
  },
  {
    name: 'Kendrick Lamar',
    queries: ['Good Kid MAAD City', 'To Pimp A Butterfly', 'DAMN', 'Mr Morale', 'HUMBLE', 'Not Like Us', 'Alright', 'Money Trees', 'Swimming Pools', 'DNA', 'King Kunta'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 26,
  },
  {
    name: 'Eminem',
    queries: ['The Marshall Mathers LP', 'The Eminem Show', 'Recovery', 'Music To Be Murdered By', 'Lose Yourself', 'Houdini', 'Without Me', 'The Real Slim Shady', 'Mockingbird', 'Stan', 'Till I Collapse'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 26,
  },
  {
    name: 'Kanye West',
    queries: ['The College Dropout', 'Graduation', 'My Beautiful Dark Twisted Fantasy', 'Donda', 'Stronger', 'Heartless', 'Gold Digger', 'Flashing Lights', 'Father Stretch My Hands', 'Power', 'Bound 2'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 26,
  },
  {
    name: 'The Weeknd',
    queries: ['After Hours', 'Starboy', 'Beauty Behind The Madness', 'Dawn FM', 'Blinding Lights', 'The Hills', 'Can’t Feel My Face', 'Save Your Tears', 'Die For You', 'I Feel It Coming'],
    primaryGenre: 'R&B/Soul',
    targetCount: 26,
  },
  {
    name: 'Taylor Swift',
    queries: ['1989', 'Folklore', 'Midnights', 'The Tortured Poets Department', 'Anti-Hero', 'Blank Space', 'Shake It Off', 'Cruel Summer', 'Cardigan', 'Love Story', 'You Belong With Me'],
    primaryGenre: 'Pop',
    targetCount: 28,
  },
  {
    name: 'Billie Eilish',
    queries: ['When We All Fall Asleep', 'Happier Than Ever', 'Hit Me Hard and Soft', 'bad guy', 'birds of a feather', 'ocean eyes', 'everything i wanted', 'lovely', 'what was i made for'],
    primaryGenre: 'Pop',
    targetCount: 22,
  },
  {
    name: 'Rihanna',
    queries: ['Good Girl Gone Bad', 'Loud', 'Anti', 'Umbrella', 'Diamonds', 'We Found Love', 'Work', 'Only Girl In The World', 'Stay', 'Disturbia', 'Don’t Stop The Music'],
    primaryGenre: 'Pop',
    targetCount: 25,
  },
  {
    name: 'Ariana Grande',
    queries: ['Thank U Next', 'Sweetener', 'Positions', 'Eternal Sunshine', '7 rings', 'Side to Side', 'no tears left to cry', 'Into You', 'we can’t be friends', 'Positions'],
    primaryGenre: 'Pop',
    targetCount: 24,
  },
  {
    name: 'Dua Lipa',
    queries: ['Future Nostalgia', 'Radical Optimism', 'Don’t Start Now', 'Levitating', 'New Rules', 'Dance The Night', 'Houdini', 'Physical', 'Break My Heart'],
    primaryGenre: 'Pop',
    targetCount: 22,
  },
  {
    name: 'Queen',
    queries: ['A Night At The Opera', 'News Of The World', 'Bohemian Rhapsody', 'Another One Bites The Dust', 'We Will Rock You', 'Don’t Stop Me Now', 'We Are The Champions', 'Under Pressure', 'Radio Ga Ga'],
    primaryGenre: 'Rock',
    targetCount: 22,
  },
  {
    name: 'Nirvana',
    queries: ['Nevermind', 'In Utero', 'Bleach', 'Smells Like Teen Spirit', 'Come As You Are', 'Heart-Shaped Box', 'Lithium', 'In Bloom', 'The Man Who Sold The World', 'About A Girl'],
    primaryGenre: 'Rock',
    targetCount: 18,
  },
  {
    name: 'The Beatles',
    queries: ['Abbey Road', 'Sgt Pepper', 'Let It Be', 'Hey Jude', 'Come Together', 'Yesterday', 'Here Comes The Sun', 'Twist And Shout', 'Help', 'All You Need Is Love'],
    primaryGenre: 'Rock',
    targetCount: 22,
  },
  {
    name: 'Michael Jackson',
    queries: ['Thriller', 'Bad', 'Dangerous', 'Off The Wall', 'Billie Jean', 'Beat It', 'Smooth Criminal', 'Man In The Mirror', 'Black Or White', 'Rock With You'],
    primaryGenre: 'Pop',
    targetCount: 25,
  },
  {
    name: 'Avicii',
    queries: ['True', 'Stories', 'TIM', 'Levels', 'Wake Me Up', 'The Nights', 'Hey Brother', 'Waiting For Love', 'Without You', 'SOS'],
    primaryGenre: 'Dance',
    targetCount: 18,
  },
  {
    name: 'Daft Punk',
    queries: ['Discovery', 'Random Access Memories', 'Homework', 'One More Time', 'Get Lucky', 'Around The World', 'Harder Better Faster Stronger', 'Instant Crush', 'Da Funk'],
    primaryGenre: 'Dance',
    targetCount: 18,
  },
  {
    name: 'Coldplay',
    queries: ['Parachutes', 'A Rush Of Blood To The Head', 'Viva La Vida', 'Yellow', 'The Scientist', 'Fix You', 'Viva La Vida', 'Paradise', 'Adventure Of A Lifetime', 'Clocks'],
    primaryGenre: 'Alternative',
    targetCount: 20,
  },
  {
    name: 'Bruno Mars',
    queries: ['Doo-Wops Hooligans', 'Unorthodox Jukebox', '24K Magic', 'Silk Sonic', 'Just The Way You Are', 'Uptown Funk', 'That’s What I Like', 'Locked Out Of Heaven', 'Grenade', 'Leave The Door Open'],
    primaryGenre: 'Pop',
    targetCount: 22,
  },
  {
    name: 'SZA',
    queries: ['Ctrl', 'SOS', 'Kill Bill', 'Snooze', 'The Weekend', 'Good Days', 'Saturn', 'Broken Clocks', 'Love Galore', 'I Hate U', 'Low'],
    primaryGenre: 'R&B/Soul',
    targetCount: 20,
  },
  {
    name: 'Frank Ocean',
    queries: ['Channel Orange', 'Blonde', 'Thinkin Bout You', 'Novacane', 'Pyramids', 'Nights', 'Ivy', 'Pink + White', 'Lost', 'Chanel'],
    primaryGenre: 'R&B/Soul',
    targetCount: 18,
  },
  {
    name: 'Adele',
    queries: ['21', '25', '30', 'Rolling in the Deep', 'Someone Like You', 'Hello', 'Easy On Me', 'Set Fire to the Rain', 'Send My Love', 'Skyfall', 'When We Were Young'],
    primaryGenre: 'Pop',
    targetCount: 20,
  },
  {
    name: 'Justin Bieber',
    queries: ['Purpose', 'Justice', 'Changes', 'Peaches', 'Sorry', 'Love Yourself', 'Stay', 'What Do You Mean', 'Ghost', 'Baby', 'Intentions'],
    primaryGenre: 'Pop',
    targetCount: 24,
  },
  {
    name: 'Ed Sheeran',
    queries: ['Divide', 'Multiply', 'Equals', 'Shape of You', 'Perfect', 'Thinking Out Loud', 'Bad Habits', 'Photograph', 'Castle on the Hill', 'Shivers'],
    primaryGenre: 'Pop',
    targetCount: 22,
  },
  {
    name: 'Olivia Rodrigo',
    queries: ['SOUR', 'GUTS', 'drivers license', 'good 4 u', 'vampire', 'deja vu', 'bad idea right', 'traitor', 'get him back', 'brutal'],
    primaryGenre: 'Pop',
    targetCount: 16,
  },
  {
    name: 'Harry Styles',
    queries: ['Fine Line', 'Harrys House', 'As It Was', 'Watermelon Sugar', 'Sign of the Times', 'Adore You', 'Late Night Talking', 'Golden', 'Falling'],
    primaryGenre: 'Pop',
    targetCount: 16,
  },
  {
    name: 'Mac Miller',
    queries: ['Swimming', 'Circles', 'GO:OD AM', 'The Divine Feminine', 'Self Care', 'Good News', 'Donald Trump', 'Weekend', 'Come Back to Earth', 'Ladders', 'Blue World'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 20,
  },
  {
    name: 'Lil Wayne',
    queries: ['Tha Carter III', 'Tha Carter IV', 'Tha Carter V', 'Lollipop', 'A Milli', '6 Foot 7 Foot', 'Mona Lisa', 'Mrs. Officer', 'How to Love', 'Drop the World'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 22,
  },
  {
    name: '2Pac',
    queries: ['All Eyez On Me', 'Me Against The World', 'Changes', 'California Love', 'Dear Mama', 'Hit Em Up', 'Ambitionz Az A Ridah', 'Hail Mary', 'Keep Ya Head Up'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 20,
  },
  {
    name: 'The Notorious B.I.G.',
    queries: ['Ready To Die', 'Life After Death', 'Juicy', 'Big Poppa', 'Hypnotize', 'Mo Money Mo Problems', 'One More Chance', 'Warning', 'Ten Crack Commandments'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 18,
  },
  {
    name: '50 Cent',
    queries: ['Get Rich Or Die Tryin', 'The Massacre', 'In Da Club', '21 Questions', 'Candy Shop', 'Many Men', 'P.I.M.P.', 'Just A Lil Bit', 'Window Shopper'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 18,
  },
  {
    name: 'Gunna',
    queries: ['DS4Ever', 'a Gift & a Curse', 'One of Wun', 'fukumean', 'pushin P', 'Drip Too Hard', 'Banking on Me', 'Top Off', 'whatsapp (wassam)', 'alright'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 18,
  },
  {
    name: 'Lil Baby',
    queries: ['My Turn', 'Its Only Me', 'Drip Harder', 'Drip Too Hard', 'Freestyle', 'The Bigger Picture', 'Woah', 'Close Friends', 'In a Minute', 'Yes Indeed'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 20,
  },
  {
    name: 'Metro Boomin',
    queries: ['Heroes & Villains', 'Not All Heroes Wear Capes', 'Creepin', 'Superhero', 'Space Cadet', 'Too Many Nights', 'Am I Dreaming', 'Trance', '10 Freaky Girls'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 20,
  },
  {
    name: 'Don Toliver',
    queries: ['Heaven Or Hell', 'Life Of A Don', 'Hardstone Psycho', 'No Idea', 'After Party', 'Cardigan', 'Bandit', 'Too Many Nights', 'Private Landing', 'Tore Up'],
    primaryGenre: 'Hip-Hop/Rap',
    targetCount: 18,
  },
  {
    name: 'Bad Bunny',
    queries: ['Un Verano Sin Ti', 'YHLQMDLG', 'Nadie Sabe Lo Que Va A Pasar Manana', 'Titi Me Pregunto', 'Me Porto Bonito', 'Diles', 'Monaco', 'Ojitos Lindos', 'Dakiti', 'Yonaguni'],
    primaryGenre: 'Latin',
    targetCount: 24,
  },
  {
    name: 'Linkin Park',
    queries: ['Hybrid Theory', 'Meteora', 'Minutes To Midnight', 'In The End', 'Numb', 'Crawling', 'Faint', 'What I’ve Done', 'Somewhere I Belong', 'Breaking The Habit', 'Bleed It Out'],
    primaryGenre: 'Rock',
    targetCount: 20,
  },
  {
    name: 'Red Hot Chili Peppers',
    queries: ['Californication', 'By The Way', 'Stadium Arcadium', 'Under The Bridge', 'Can’t Stop', 'Scar Tissue', 'Otherside', 'Snow (Hey Oh)', 'Dani California'],
    primaryGenre: 'Rock',
    targetCount: 20,
  },
  {
    name: 'Arctic Monkeys',
    queries: ['AM', 'Whatever People Say I Am', 'Do I Wanna Know', '505', 'Why’d You Only Call Me When You’re High', 'I Wanna Be Yours', 'R U Mine', 'Fluorescent Adolescent'],
    primaryGenre: 'Alternative',
    targetCount: 18,
  },
  {
    name: 'Calvin Harris',
    queries: ['18 Months', 'Motion', 'Funk Wav Bounces', 'Summer', 'This Is What You Came For', 'Feel So Close', 'One Kiss', 'How Deep Is Your Love', 'Slide', 'Sweet Nothing'],
    primaryGenre: 'Dance',
    targetCount: 20,
  },
  {
    name: 'The Chainsmokers',
    queries: ['Memories Do Not Open', 'Closer', 'Something Just Like This', 'Don’t Let Me Down', 'Roses', 'Paris', 'Takeaway', 'Selfie', 'Side Effects'],
    primaryGenre: 'Dance',
    targetCount: 18,
  },
  {
    name: 'Marshmello',
    queries: ['Joytime', 'Happier', 'Silence', 'Friends', 'Alone', 'Wolves', 'Come & Go', 'Here With Me', 'Be Kind', 'Miles On It'],
    primaryGenre: 'Dance',
    targetCount: 18,
  },
  {
    name: 'Morgan Wallen',
    queries: ['One Thing At A Time', 'Dangerous', 'Last Night', 'You Proof', 'Wasted On You', 'Thought You Should Know', 'Whiskey Glasses', 'Sand in My Boots', 'Chasin You', 'Cowgirls'],
    primaryGenre: 'Country',
    targetCount: 20,
  },
  {
    name: 'Luke Combs',
    queries: ['This Ones For You', 'What You See Is What You Get', 'Fast Car', 'Beautiful Crazy', 'When It Rains It Pours', 'Beer Never Broke My Heart', 'She Got The Best Of Me', 'Forever After All'],
    primaryGenre: 'Country',
    targetCount: 18,
  },
  {
    name: 'Zach Bryan',
    queries: ['American Heartbreak', 'Zach Bryan', 'Something in the Orange', 'I Remember Everything', 'Heading South', 'Sun to Me', 'Pink Skies', 'Oklahoma Smokeshow', 'Dawns'],
    primaryGenre: 'Country',
    targetCount: 18,
  },
];

interface ArtistReport {
  artist: string;
  candidatesFound: number;
  verifiedPlayable: number;
  rejected: number;
  totalMelodexSongs: number;
  isValidationArtist?: boolean;
}

async function main() {
  console.log('====================================================');
  console.log('🎵 Melodex Deep Music Catalog Expansion & Audio Verification');
  console.log('====================================================\n');

  const catalogMap = new Map<string, Song>();
  const signatureMap = new Map<string, string>();

  // 1. AUDIT EXISTING SONGS
  let existingAuditPassed = 0;
  let existingAuditFailed = 0;

  if (fs.existsSync(CATALOG_DATA_PATH)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(CATALOG_DATA_PATH, 'utf-8'));
      if (Array.isArray(existingData)) {
        console.log(`Auditing ${existingData.length} existing catalog entries...`);

        for (const item of existingData) {
          if (!item.id || !item.title || !item.artist || !item.previewUrl || !item.year) {
            existingAuditFailed++;
            continue;
          }

          const sig = createSignature(item.artist, item.title);
          if (signatureMap.has(sig) || catalogMap.has(item.id)) {
            continue;
          }

          // Test audio playability
          const test = await testAudioPlayability(item.previewUrl);
          if (!test.playable) {
            existingAuditFailed++;
            continue;
          }

          catalogMap.set(item.id, item);
          signatureMap.set(sig, item.id);
          existingAuditPassed++;
        }
        console.log(`✅ Audit complete: ${existingAuditPassed} existing songs kept, ${existingAuditFailed} broken/invalid dropped.\n`);
      }
    } catch (err) {
      console.warn('Could not parse existing catalog:', err);
    }
  }

  function getArtistSongCount(artistName: string): number {
    let count = 0;
    for (const song of catalogMap.values()) {
      if (isArtistMatch(song.artist, artistName)) {
        count++;
      }
    }
    return count;
  }

  let totalCandidatesProcessed = 0;
  let totalNewVerifiedSongs = 0;
  let totalAudioFailures = 0;
  let totalInvalidYears = 0;
  let totalDuplicates = 0;
  let totalBogus = 0;

  const artistReports: ArtistReport[] = [];

  console.log(`Starting targeted multi-source expansion across ${ARTISTS_TO_EXPAND.length} prioritized artists...\n`);

  for (let i = 0; i < ARTISTS_TO_EXPAND.length; i++) {
    const config = ARTISTS_TO_EXPAND[i];
    const initialCount = getArtistSongCount(config.name);
    let candidatesForArtist = 0;
    let addedForArtist = 0;
    let rejectedForArtist = 0;

    if (initialCount >= config.targetCount) {
      console.log(
        `[${i + 1}/${ARTISTS_TO_EXPAND.length}] ${config.name.padEnd(26)} | Target already met (${initialCount}/${config.targetCount})`
      );
      artistReports.push({
        artist: config.name,
        candidatesFound: 0,
        verifiedPlayable: 0,
        rejected: 0,
        totalMelodexSongs: initialCount,
        isValidationArtist: config.isValidationArtist,
      });
      continue;
    }

    try {
      const candidates = await fetchDeezerTracksForArtist(config.name, config.queries);
      candidatesForArtist = candidates.length;
      totalCandidatesProcessed += candidatesForArtist;

      for (const cand of candidates) {
        if (getArtistSongCount(config.name) >= config.targetCount) {
          break;
        }

        if (!isArtistMatch(cand.artist, config.name)) {
          rejectedForArtist++;
          continue;
        }

        if (isBogusTrack(cand.title, cand.artist, cand.albumName, config.name)) {
          totalBogus++;
          rejectedForArtist++;
          continue;
        }

        const cleanTitle = cleanSongTitle(cand.title);
        const sig = createSignature(cand.artist, cleanTitle);

        if (signatureMap.has(sig) || catalogMap.has(cand.sourceId)) {
          totalDuplicates++;
          rejectedForArtist++;
          continue;
        }

        // Determine year
        let year: number | null = null;
        if (KNOWN_SONG_YEARS[sig]) {
          year = KNOWN_SONG_YEARS[sig];
        } else if (cand.albumId) {
          const albumInfo = await getDeezerAlbumInfo(cand.albumId);
          year = albumInfo.year;
        }

        if (!year) {
          // Check for year in title or album title (e.g. '1989', '2014', etc.)
          const titleYearMatch = (cand.title + ' ' + (cand.albumName || '')).match(/\b(19[6-9]\d|20[0-2]\d)\b/);
          if (titleYearMatch) {
            year = parseInt(titleYearMatch[1], 10);
          }
        }

        if (!year) {
          totalInvalidYears++;
          rejectedForArtist++;
          continue;
        }

        // Audio verification
        const audioTest = await testAudioPlayability(cand.previewUrl);
        if (!audioTest.playable) {
          totalAudioFailures++;
          rejectedForArtist++;
          continue;
        }

        const song: Song = {
          id: cand.sourceId,
          title: cleanTitle,
          artist: cand.artist,
          album: cand.albumName,
          year,
          genre: config.primaryGenre,
          artworkUrl: cand.artworkUrl,
          previewUrl: cand.previewUrl,
          previewStart: 0,
        };

        catalogMap.set(song.id, song);
        signatureMap.set(sig, song.id);
        addedForArtist++;
        totalNewVerifiedSongs++;
      }
    } catch (artistErr) {
      console.warn(`Notice processing ${config.name}:`, artistErr);
    }

    const currentTotal = getArtistSongCount(config.name);
    artistReports.push({
      artist: config.name,
      candidatesFound: candidatesForArtist,
      verifiedPlayable: addedForArtist,
      rejected: rejectedForArtist,
      totalMelodexSongs: currentTotal,
      isValidationArtist: config.isValidationArtist,
    });

    console.log(
      `[${i + 1}/${ARTISTS_TO_EXPAND.length}] ${config.name.padEnd(26)} | Start: ${String(initialCount).padStart(2)} | Added: +${String(addedForArtist).padStart(2)} | Total: ${String(currentTotal).padStart(2)} verified`
    );

    // Incremental disk save after each artist
    const intermediateCatalog = Array.from(catalogMap.values());
    fs.writeFileSync(CATALOG_DATA_PATH, JSON.stringify(intermediateCatalog, null, 2), 'utf-8');
    fs.writeFileSync(CATALOG_PUBLIC_PATH, JSON.stringify(intermediateCatalog, null, 2), 'utf-8');
  }

  // 3. PERSIST THE ENRICHED, AUDITED CATALOG
  const finalCatalog = Array.from(catalogMap.values());
  fs.writeFileSync(CATALOG_DATA_PATH, JSON.stringify(finalCatalog, null, 2), 'utf-8');
  fs.writeFileSync(CATALOG_PUBLIC_PATH, JSON.stringify(finalCatalog, null, 2), 'utf-8');

  // Decade breakdown
  const pre2000 = finalCatalog.filter(s => s.year && s.year < 2000).length;
  const s2000s = finalCatalog.filter(s => s.year && s.year >= 2000 && s.year < 2010).length;
  const s2010s = finalCatalog.filter(s => s.year && s.year >= 2010 && s.year < 2020).length;
  const s2020s = finalCatalog.filter(s => s.year && s.year >= 2020).length;

  console.log('\n====================================================');
  console.log('📊 INTERNAL QUALITY & EXPANSION REPORT');
  console.log('====================================================');

  console.log('\n--- CORE VALIDATION ARTISTS ---');
  for (const rep of artistReports.filter(r => r.isValidationArtist)) {
    console.log(`${rep.artist}:`);
    console.log(`  Candidates found: ${rep.candidatesFound}`);
    console.log(`  Verified playable: ${rep.verifiedPlayable}`);
    console.log(`  Rejected: ${rep.rejected}`);
    console.log(`  Total Melodex songs: ${rep.totalMelodexSongs}\n`);
  }

  console.log('--- OTHER EXPANDED ARTISTS ---');
  for (const rep of artistReports.filter(r => !r.isValidationArtist)) {
    console.log(`${rep.artist}:`);
    console.log(`  Candidates found: ${rep.candidatesFound}`);
    console.log(`  Verified playable: ${rep.verifiedPlayable}`);
    console.log(`  Rejected: ${rep.rejected}`);
    console.log(`  Total Melodex songs: ${rep.totalMelodexSongs}\n`);
  }

  console.log('--- OVERALL METRICS ---');
  console.log(`Artists processed: ${ARTISTS_TO_EXPAND.length}`);
  console.log(`Candidate songs processed: ${totalCandidatesProcessed}`);
  console.log(`New verified songs added: ${totalNewVerifiedSongs}`);
  console.log(`Audio failures: ${totalAudioFailures}`);
  console.log(`Invalid years: ${totalInvalidYears}`);
  console.log(`Duplicates: ${totalDuplicates}`);
  console.log(`Bogus / Tribute filtered: ${totalBogus}`);
  console.log(`Total playable catalog size: ${finalCatalog.length} songs`);
  console.log(`Decade distribution: Pre-2000: ${pre2000} | 2000s: ${s2000s} | 2010s: ${s2010s} | 2020s: ${s2020s}`);
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('Fatal error in catalog expander:', err);
});
