import fs from 'fs';
import path from 'path';
import { Song } from '../src/types/song';
import { KNOWN_ORIGINAL_YEARS } from './knownSongYears';

function norm(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*$/g, '')
    .replace(/ft\..*$/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Known iconic hits for key artists to prioritize in ranking
const ICONIC_HITS: Record<string, string[]> = {
  'lil skies': ['red roses', 'i', 'nowadays', 'lust', 'signs of jealousy', 'creeping', 'magic', 'breathe', 'riot', 'strictly business', 'name in the sand'],
  'lil mosey': ['blueberry faygo', 'noticed', 'kamikaze', 'stuck in a dream', 'pull up', 'boof pack', 'so bad', 'speed racin', 'burberry headband', 'g walk'],
  'lil peep': ['star shopping', 'witchblades', 'save that shit', 'awful things', 'beamer boy', 'falling down', 'crybaby', 'white tee', 'life is simple', 'nuts', 'spotlight'],
  'trippie redd': ['dark knight dummo', 'love scars', 'topanga', 'taking a walk', 'wish', 'miss the rage', 'poles1469', 'who needs love', 'love me more', 'death', 'the grinch', '1400 / 999 freestyle', 'mac 10', 'fuck love', 'snake skin'],
  'lil pump': ['gucci gang', 'esskeetit', 'i love it', 'boss', 'd rose', 'flex like ouu', 'be like me', 'arms around you', 'welcome to the party', 'molly', 'coronao now'],
  'famous dex': ['japan', 'pick it up', 'drip from my walk', 'hoes mad', 'goyard', 'nervous', 'ok dexter', 'two guns', 'with them', 'light'],
  'fetty wap': ['trap queen', '679', 'my way', 'again', 'rgf island', 'wake up', 'jugg', 'how we do things', 'jimmy choo', 'keké'],
  'youngboy never broke again': ['make no sense', 'valuable pain', 'slime belief', 'outside today', 'kacey talk', 'no smoke', 'untouchable', 'house arrest tingz', 'bad bad', 'right foot creep', 'bandit', 'self made'],
  'a boogie wit da hoodie': ['drowning', 'look back at it', 'swervin', 'my shit', 'jungle', 'timeless', 'demons and angels', 'bleed', 'startender', 'me and my guitar'],
  'chief keef': ['love sosa', 'dont like', 'hate bein sober', 'faneto', 'earned it', 'kobe', 'macaroni time', 'citgo', 'save that shit', 'fool ya', 'war'],
  'shakira': ['hips dont lie', 'whenever wherever', 'waka waka', 'she wolf', 'la tortura', 'chantaje', 'loca', 'can\'t remember to forget you', 'session 53', 'tqg', 'suerte'],
  'bee gees': ['stayin alive', 'night fever', 'how deep is your love', 'more than a woman', 'you should be dancing', 'to love somebody', 'tragedy', 'jive talkin', 'words', 'i started a joke'],
  'kendrick lamar': ['humble', 'dna', 'alright', 'swimming pools', 'bitch dont kill my vibe', 'king kunta', 'money trees', 'poetic justice', 'not like us', 'euphoria', 'loyalty', 'love', 'm.a.a.d city'],
  'tyler, the creator': ['see you again', 'earfquake', 'yonkers', 'new magic wand', 'wusyaname', 'she', 'who dat boy', 'best interest', 'are we still friends', 'lumberjack', 'a boy is a gun'],
  'outkast': ['ms. jackson', 'hey ya', 'roses', 'so fresh so clean', 'b.o.b.', 'atliens', 'elevators', 'the way you move', 'player\'s ball', 'skew it on the bar-b'],
  'marvin gaye': ['whats going on', 'sexual healing', 'lets get it on', 'aint no mountain high enough', 'i heard it through the grapevine', 'mercy mercy me', 'got to give it up', 'distants lover'],
  'alicia keys': ['fallin', 'no one', 'if i aint got you', 'empire state of mind', 'girl on fire', 'my boo', 'you dont know my name', 'karma', 'un-thinkable', 'a woman\'s worth'],
  'deadmau5': ['ghosts n stuff', 'strobe', 'i remember', 'some chords', 'the veldt', 'raise your weapon', 'monophobia', 'channel 42', 'sofi needs a ladder'],
  'kygo': ['firestone', 'stole the show', 'it aint me', 'higher love', 'born to be yours', 'remind me to forget', 'stay', 'first time', 'lose somebody', 'happy now'],
  'martin garrix': ['animals', 'scared to be lonely', 'in the name of love', 'there for you', 'high on life', 'tremor', 'virus', 'so far away', 'summer days', 'don\'t look down'],
  'zedd': ['clarity', 'the middle', 'stay', 'stay the night', 'i want you to know', 'beautiful now', 'spectrum', 'candyman', 'starving'],
  'daddy yankee': ['gasolina', 'despacito', 'dura', 'con calma', 'limbo', 'rompe', 'shaky shaky', 'lo que paso paso', 'ella me levanto', 'llamado de emergencia'],
  'karol g': ['tusa', 'provenza', 'bichota', 'mamiii', 'tqg', 'amargura', 'qllona', 'el makinon', 'mi cama', 'secreten'],
  'rosalía': ['despecha', 'malamente', 'con altura', 'saoko', 'bizcochito', 'la noche de anoche', 'pienso en tu mira', 'candy', 'beso', 'motomami'],
  'bad bunny': ['dakiti', 'tití me preguntó', 'mia', 'callaita', 'moscow mule', 'me porto bonito', 'yo perreo sola', 'safaera', 'la dificil', 'un x100to', 'monaco'],
  'zach bryan': ['something in the orange', 'i remember everything', 'heading south', 'sun to me', 'burn burn burn', 'dawns', 'hey driver', 'oklahoma smokeshow'],
  'luke combs': ['fast car', 'beautiful crazy', 'when it rains it pours', 'she got the best of me', 'beer never broke my heart', 'forever after all', 'the kind of love we make'],
  'james brown': ['i got you', 'get up', 'pap\'s got a brand new bag', 'living in america', 'it\'s a man\'s man\'s man\'s world', 'say it loud', 'cold sweat'],
  'john legend': ['all of me', 'ordinary people', 'green light', 'save room', 'glory', 'tonight', 'stay with you', 'love me now', 'wild'],
  'major lazer': ['lean on', 'cold water', 'light it up', 'que calor', 'get free', 'watch out for this', 'particula', 'know no better', 'original don'],
  'dj snake': ['turn down for what', 'lean on', 'let me love you', 'taki taki', 'middle', 'get low', 'loco contigo', 'you know you like it'],
  'aaliyah': ['are you that somebody', 'try again', 'one in a million', 'rock the boat', 'more than a woman', 'if your girl only knew', 'back & forth', 'miss you'],
  'toni braxton': ['un-break my heart', 'breathe again', 'you\'re makin me high', 'he wasn\'t man enough', 'another sad love song', 'spanish guitar'],
  'shania twain': ['man! i feel like a woman', 'you\'re still the one', 'that don\'t impress me much', 'from this moment on', 'any man of mine', 'whose bed have your boots been under'],
  'luis fonsi': ['despacito', 'échame la culpa', 'no me doy por vencido', 'aquí estoy yo', 'imposible', 'calypso'],
  'natanael cano': ['amor tumbado', 'pacas de billetes', 'prc', 'ch y la pizza', 'mi bello ángel', 'soy el diablo', 'madonna']
};

export async function checkAudioUrl(url: string, timeoutMs = 4000): Promise<boolean> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(id);
    return res.status === 200;
  } catch {
    clearTimeout(id);
    return false;
  }
}

export async function fetchCanonicalTracksForArtist(
  artistName: string,
  targetCount = 15,
  primaryGenre = 'Hip-Hop/Rap'
): Promise<Song[]> {
  const query = encodeURIComponent(artistName);
  const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=80`;
  let rawResults: any[] = [];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = await res.json();
    rawResults = data.results || [];
  } catch {
    return [];
  }

  const nTargetArtist = norm(artistName);
  const iconicList = ICONIC_HITS[artistName.toLowerCase()] || [];

  // Filter candidates strictly
  const candidates: any[] = [];
  for (const r of rawResults) {
    if (!r.trackId || !r.trackName || !r.artistName || !r.previewUrl) continue;

    const nRArtist = norm(r.artistName);
    const nRPrimary = norm(r.artistName.split(/[,&x+]|\sfeat\.\s|\sft\.\s|\swith\s/i)[0]);

    const artistMatches =
      nRArtist === nTargetArtist ||
      nRPrimary === nTargetArtist ||
      nRArtist.includes(nTargetArtist) ||
      nTargetArtist.includes(nRArtist);

    if (!artistMatches) continue;

    const lTitle = r.trackName.toLowerCase();
    const lArtist = r.artistName.toLowerCase();
    if (
      lTitle.includes('karaoke') || lTitle.includes('tribute') || lTitle.includes('parody') ||
      lTitle.includes('instrumental version') || lTitle.includes('originally performed') ||
      lArtist.includes('karaoke') || lArtist.includes('tribute')
    ) {
      continue;
    }

    // Determine release year
    let year: number | undefined = undefined;
    const cleanTitle = r.trackName.replace(/\(.*?\)/g, '').trim();
    if (KNOWN_ORIGINAL_YEARS[cleanTitle]) {
      year = KNOWN_ORIGINAL_YEARS[cleanTitle];
    } else if (r.releaseDate) {
      year = parseInt(r.releaseDate.slice(0, 4), 10);
    }

    if (!year || isNaN(year) || year < 1950 || year > 2026) continue;

    // Calculate iconic/popularity rank
    let rank = 100;
    const nTitle = norm(r.trackName);
    for (let i = 0; i < iconicList.length; i++) {
      const icon = norm(iconicList[i]);
      if (nTitle.includes(icon) || icon.includes(nTitle)) {
        rank = i; // lower is better
        break;
      }
    }

    candidates.push({ r, year, rank, nTitle });
  }

  // Sort candidates: iconic hits first, then original API order (which is popularity-ranked in iTunes)
  candidates.sort((a, b) => a.rank - b.rank);

  const seenTitles = new Set<string>();
  const uniqueCandidates: typeof candidates = [];

  for (const c of candidates) {
    if (seenTitles.has(c.nTitle)) continue;
    seenTitles.add(c.nTitle);
    uniqueCandidates.push(c);
  }

  // Fast validation of Apple preview URL
  const verified: Song[] = [];

  for (const c of uniqueCandidates) {
    const { r, year } = c;
    if (!r.previewUrl || !r.previewUrl.startsWith('https://') || !r.previewUrl.includes('m4a')) {
      continue;
    }

    const song: Song = {
      id: `itunes-${r.trackId}`,
      title: r.trackName,
      artist: r.artistName,
      normalizedArtist: artistName.toLowerCase(),
      album: r.collectionName || 'Single',
      year: year,
      verifiedOriginalYear: year,
      yearConfidence: 'high',
      genre: r.primaryGenreName || primaryGenre,
      recognitionScore: Math.min(95, Math.max(65, 95 - verified.length * 2)),
      artworkUrl: r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb', '600x600bb') : undefined,
      previewUrl: r.previewUrl,
      previewStart: 0,
      provider: 'itunes',
      trackIdentityVerified: true,
      providerTrackId: String(r.trackId)
    };
    verified.push(song);
    if (verified.length >= targetCount) break;
  }

  return verified;
}
