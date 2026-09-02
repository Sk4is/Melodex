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
  'reggaeton',
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
  reggaeton: 'REGGAETON',
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

  // Explicit track-level overrides:
  // Becky G - "Shower" is an English Pop hit, not Latin
  if (a.includes('becky g') && t.includes('shower')) {
    return ['pop'];
  }
  // Global Despacito override (Pop + Reggaeton)
  if (t.includes('despacito')) {
    return ['reggaeton', 'pop'];
  }

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

  // 7. Latin & Reggaeton Classification (Track-level classification)
  const isLatinOrUrbanSignal =
    g.includes('latin') ||
    g.includes('urbano') ||
    g.includes('reggaeton') ||
    g.includes('reggaetón') ||
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
    g.includes('musica mexicana');

  if (isLatinOrUrbanSignal) {
    // A. Latin Trap / Urban Hip-Hop tracks -> map to 'hiphop' (NOT latin or reggaeton)
    const isLatinTrapTrack =
      (a.includes('bad bunny') && (
        t === '<3' || t === '25/8' || t === 'bendiciones' ||
        t === 'no te hagas' || t.includes('me mata') || t === 'de museo' ||
        t.includes('monaco') || t.includes('vuelve')
      )) ||
      (a.includes('ozuna') && (
        t.includes('solita') || t.includes('patek')
      )) ||
      (a.includes('duki') && (
        t.includes("she don't give a fo") || t.includes('goteo') ||
        t.includes('hitboy') || t.includes('bzrp music sessions, vol. 50') ||
        t.includes('hablamos mañana') || t.includes('panamá') ||
        t.includes('si me sobrara el tiempo') || t.includes('alley oop') ||
        t.includes('la clase')
      )) ||
      (a.includes('myke towers') && (
        t.includes('piensan') || t.includes('pending') || t.includes('cuerpo en venta')
      )) ||
      (a.includes('arcángel') && (
        t.includes('infeliz') || t.includes('la ocasión') || t.includes('me ama me odia')
      )) ||
      (a.includes('bryant myers') && t.includes('ojalá')) ||
      (a.includes('fat joe') && t.includes('yes')) ||
      (a.includes('bizarrap') && (
        t.includes('vol. 36') || t.includes('vol. 46') || t.includes('vol. 49') ||
        t.includes('vol. 50') || t.includes('vol. 54') || t.includes('vol. 58') ||
        t.includes('lil baby') || t.includes('yamen fui') || t.includes('mamichula')
      ));

    if (isLatinTrapTrack) {
      set.add('hiphop');
    } else {
      // B. Reggaeton-Pop Crossovers -> 'reggaeton' + 'pop'
      const isReggaetonPopCrossover =
        t.includes('despacito') ||
        t.includes('con calma') ||
        t.includes('limbo') ||
        t.includes('llamado de emergencia') ||
        t.includes('la despedida') ||
        t.includes('danza kuduro') ||
        t.includes('dutty love') ||
        (t.includes('mía') && a.includes('bad bunny')) ||
        (t.includes('la canción') && a.includes('bad bunny')) ||
        (t.includes('si veo a tu mamá') && a.includes('bad bunny')) ||
        (t.includes('estamos bien') && a.includes('bad bunny')) ||
        (t.includes('pero ya no') && a.includes('bad bunny')) ||
        (t.includes('me fui de vacaciones') && a.includes('bad bunny')) ||
        (t.includes('ojitos lindos') && a.includes('bad bunny')) ||
        (t.includes('neverita') && a.includes('bad bunny')) ||
        t.includes('un dia (one day)') ||
        t.includes('échame la culpa') ||
        t.includes('karmika') ||
        t.includes('kármika') ||
        t.includes('está rico') ||
        t.includes('sensualidad') ||
        t.includes('mayores') ||
        t.includes('sin pijama') ||
        t.includes('mamiii') ||
        t.includes('dollar') ||
        (t.includes('chula') && a.includes('becky g')) ||
        (t.includes('epa') && a.includes('becky g')) ||
        (t.includes('que haces') && a.includes('becky g')) ||
        (t.includes('la respuesta') && a.includes('becky g')) ||
        t.includes('bubalú') ||
        t.includes('chantaje') ||
        t.includes('te felicito') ||
        t.includes('perro fiel') ||
        t.includes('la tortura') ||
        (t.includes('bailando') && a.includes('enrique')) ||
        t.includes('el perdón') ||
        t.includes('duele el corazón') ||
        t.includes('súbeme la radio') ||
        t.includes('felices los 4') ||
        t.includes('11 pm') ||
        (t.includes('el perdedor') && a.includes('maluma')) ||
        t.includes('hawái') ||
        (t.includes('corazón') && a.includes('maluma')) ||
        (t.includes('sobrio') && a.includes('maluma')) ||
        t.includes('créeme') ||
        t.includes('amigos con derechos') ||
        (t.includes('la temperatura') && a.includes('maluma')) ||
        (t.includes('bella') && a.includes('maluma')) ||
        t.includes('tusa') ||
        t.includes('tqg') ||
        t.includes('provenza') ||
        (t.includes('secreto') && a.includes('karol g')) ||
        (t.includes('china') && a.includes('anuel')) ||
        t.includes('baila baila baila') ||
        (t.includes('criminal') && a.includes('natti natasha')) ||
        (t.includes('la modelo') && a.includes('ozuna')) ||
        (t.includes('vaina loca') && a.includes('ozuna')) ||
        (t.includes('el farsante') && a.includes('ozuna')) ||
        t.includes('caramelo') ||
        t.includes('labios mordidos') ||
        t.includes('mi mala') ||
        t.includes('yo x ti, tú x mí') ||
        (t.includes('imposible') && a.includes('fonsi')) ||
        (t.includes('calypso') && a.includes('fonsi')) ||
        (t.includes('date la vuelta') && a.includes('fonsi')) ||
        (t.includes('vacío') && a.includes('fonsi')) ||
        (t.includes('cambiaré') && a.includes('fonsi')) ||
        (t.includes('beso') && a.includes('rosalía')) ||
        (t.includes('baila conmigo') && a.includes('selena')) ||
        (t.includes('tattoo') && a.includes('rauw')) ||
        (t.includes('algo mágico') && a.includes('rauw')) ||
        (t.includes('sci-fi') && a.includes('rauw')) ||
        (t.includes('loquita') && a.includes('rauw')) ||
        t.includes('pareja del año') ||
        t.includes('envolver') ||
        (t.includes('me gusta') && a.includes('anitta')) ||
        t.includes('yapaque') ||
        t.includes('una lady como tú') ||
        t.includes('loco contigo') ||
        (t.includes('mi gente') && a.includes('balvin')) ||
        (t.includes('rojo') && a.includes('balvin')) ||
        t.includes('sigo extrañándote') ||
        t.includes('x (feat. maluma') ||
        (t.includes('x') && a.includes('nicky jam') && a.includes('balvin')) ||
        (t.includes('safari') && a.includes('balvin')) ||
        t.includes('khé?') ||
        t.includes('desenfocao') ||
        (t.includes('santa') && a.includes('rauw')) ||
        t.includes('con altura') ||
        t.includes('hey ma') ||
        t.includes('bola rebola') ||
        t.includes('como si no importara') ||
        t.includes('2:50 remix') ||
        t.includes('los del espacio') ||
        (t.includes('unfollow') && a.includes('duki')) ||
        t.includes('bailando te conocí') ||
        t.includes('enchule');

      // C. Reggaeton-Dance Crossovers
      const isReggaetonDanceCrossover =
        t.includes('pepas') ||
        t.includes('in da getto') ||
        (t.includes('taboo') && a.includes('don omar')) ||
        (t.includes('zumba') && a.includes('don omar')) ||
        t.includes('virtual diva') ||
        t.includes('lovumba') ||
        t.includes('wapae') ||
        (t.includes('pa ti') && a.includes('6ix9ine')) ||
        t.includes('habla toro') ||
        t.includes('papita frita') ||
        t.includes('fulanito') ||
        t.includes('ella no es tuya') ||
        t.includes('el taxi') ||
        t.includes('como yo le doy') ||
        t.includes('tu pum pum');

      // D. Pure Reggaeton tracks
      const isPureReggaetonTrack =
        g.includes('reggaeton') ||
        g.includes('reggaetón') ||
        g.includes('reggaeton latino') ||
        (g.includes('urbano') && (
          a.includes('daddy yankee') || a.includes('don omar') ||
          a.includes('bad bunny') || a.includes('j balvin') ||
          a.includes('ozuna') || a.includes('karol g') ||
          a.includes('rauw alejandro') || a.includes('maluma') ||
          a.includes('plan b') || a.includes('j alvarez') ||
          a.includes('wisin') || a.includes('yandel') ||
          a.includes('anuel') || a.includes('nicky jam') ||
          a.includes('farruko') || a.includes('arcángel') ||
          a.includes('arcangel') || a.includes('de la ghetto') ||
          a.includes('myke towers') || a.includes('lunay') ||
          a.includes('sech') || a.includes('el alfa') ||
          a.includes('chencho') || a.includes('zion') ||
          a.includes('natti natasha') || a.includes('manuel turizo') ||
          a.includes('jhayco') || a.includes('jhay cortez') ||
          a.includes('mora') || a.includes('feid')
        )) ||
        a.includes('plan b') ||
        a.includes('j alvarez') ||
        (a.includes('daddy yankee') && (
          t.includes('gasolina') || t.includes('dura') || t.includes('shaky shaky') ||
          t.includes('no me dejes solo') || t.includes('tu príncipe') ||
          t.includes('lo que pasó, pasó') || t.includes('pose') ||
          t.includes('la rompe corazones') || t.includes('ella me levantó')
        )) ||
        (a.includes('don omar') && (
          t.includes('dile') || t.includes('dale don dale') || t.includes('pobre diabla') ||
          t.includes('bandoleros') || t.includes('te quiero pa') || t.includes('hooka') ||
          t.includes('mayor que yo') || t.includes('nadie como tú') || t.includes('myspace') ||
          t.includes('salió el sol') || t.includes('ángelito') || t.includes('ojitos chiquitos') ||
          t.includes('ayer la ví')
        )) ||
        (a.includes('wisin') && (
          t.includes('besos mojados') || t.includes('ahora es') ||
          t.includes('reggaetón en lo oscuro') || t.includes('besos moja2') ||
          t.includes('3g')
        )) ||
        (a.includes('arcángel') && (
          t.includes("pa' que la pases bien") || t.includes('por amar a ciegas') ||
          t.includes('ganas de ti') || t.includes('satisfacción') ||
          t.includes('te acuerdas') || t.includes('+linda')
        )) ||
        (a.includes('de la ghetto') && (
          t.includes('ahí ahí ahí') || t.includes('todo el amor') ||
          t.includes('relajate conmigo') || t.includes('tu te imaginas') ||
          t.includes('acércate') || t.includes('ultra solo') || t.includes('panti y colale')
        )) ||
        (a.includes('farruko') && (
          t.includes('chillax') || t.includes('hoy') || t.includes('la tóxica') ||
          t.includes('singapur') || t.includes('la cartera') || t.includes('fantasías')
        )) ||
        (a.includes('nicky jam') && (
          t.includes('polvo') || t.includes('travesuras') || t.includes('si tú no estás') ||
          t.includes('sube la music') || t.includes('despacio')
        )) ||
        (a.includes('el alfa') && (
          t.includes('goyard') || t.includes('singapur') || t.includes('dembow y reggaeton') ||
          t.includes('déjalo que corra') || t.includes('panti y colale')
        )) ||
        (a.includes('lunay') && (
          t.includes('soltera') || t.includes('la cama') || t.includes('aventura')
        )) ||
        (a.includes('sech') && (
          t.includes('sigues con él') || t.includes('te acuerdas') || t.includes('la tóxica')
        )) ||
        a.includes('chencho corleone') ||
        (a.includes('zion') && t.includes('tu príncipe')) ||
        t.includes('no me conoce') || t.includes('la cama') ||
        t.includes('la ocasión') || t.includes('ahora dice') || t.includes('una locura') ||
        t.includes('dembow 2020') || t.includes('problemón') || t.includes('fantasías') ||
        t.includes('el efecto') || t.includes('noche loca') || t.includes('muévelo') ||
        t.includes('gatúbela') || t.includes('el makinón') || t.includes('culpables') ||
        t.includes('mi cama') || t.includes('qué pretendes') || t.includes('mojaita') ||
        t.includes('yo le llego') || t.includes('cuidao por ahí') || t.includes('como antes') ||
        t.includes('la noche de anoche') || t.includes('azul') || t.includes('morado') ||
        t.includes('ay vamos') || t.includes('6 am') || t.includes('ginza') ||
        (t.includes('bonita') && a.includes('balvin')) || t.includes('se preparó') ||
        t.includes('dile que tú me quieres') || t.includes('tu foto') || t.includes('si no te quiere') ||
        (t.includes('bebé') && a.includes('ozuna')) || (t.includes('única') && a.includes('ozuna')) ||
        t.includes('síguelo bailando') || t.includes('no quiere enamorarse') ||
        t.includes('quiero repetir') || t.includes('hey mor') || t.includes('borró cassette') ||
        t.includes('mala mía') || t.includes('sin contrato') || t.includes('el préstamo') ||
        t.includes('almas gemelas') || t.includes('carita feliz') || t.includes('bella y sensual') ||
        (t.includes('te vas') && a.includes('ozuna')) || t.includes('luz apaga') ||
        t.includes('mala santa') || t.includes('perreo triste') ||
        t.includes('hace mucho tiempo') || t.includes('me prefieres a mi') ||
        t.includes('contigo quiero amores') || t.includes('50 sombras de austin') ||
        t.includes('te robo') || (t.includes('sola') && a.includes('arcángel')) ||
        t.includes('memoria rota') || t.includes('más que ayer') ||
        t.includes('mi fanática') || t.includes('zum zum') ||
        t.includes('enséñame a bailar') || t.includes('turista') ||
        t.includes('a tu merced') || t.includes('pasaporte') ||
        t.includes('guabansexxx') || t.includes('al mismo tiempo') ||
        t.includes('aloha') || t.includes('elegí') ||
        t.includes('pongo') || (t.includes('nubes') && a.includes('rauw')) ||
        t.includes('toda (remix)') || t.includes('no me sorprende') ||
        t.includes('cuándo fue') || (t.includes('detective') && a.includes('rauw')) ||
        t.includes('verde menta') || t.includes('amor bipolar') ||
        t.includes('no lo trates');

      // Exclude non-reggaeton Latin styles even if by urban artists:
      const isExplicitNonReggaetonLatin =
        (a.includes('karol g') && t.includes('ocean')) ||
        (t.includes('después de la playa') && a.includes('bad bunny')) ||
        (t.includes('nuevayol') && a.includes('bad bunny')) ||
        t.includes('si antes te hubiera conocido') || // Merengue
        t.includes('mi ex tenía razón') || // Tejano cumbia
        t.includes('200 copas') || // Corrido / Ranchera
        (t.includes('tú con él') && a.includes('rauw')) || // Salsa
        t.includes('coleccionando heridas') ||
        t.includes('por qué será') ||
        t.includes('cada quien') ||
        t.includes('si tú me vieras') ||
        (t.includes('alv') && a.includes('arcángel')) ||
        (t.includes('la chamba') && a.includes('arcángel')) ||
        t.includes('el pañuelo') ||
        (a.includes('becky g') && (
          t.includes('por el contrario') || t.includes('2ndo chance') ||
          t.includes('mercedes') || t.includes('ya acabó') || t.includes('chanel')
        ));

      if (isExplicitNonReggaetonLatin) {
        set.add('latin');
      } else if (isReggaetonPopCrossover) {
        set.add('reggaeton');
        set.add('pop');
      } else if (isReggaetonDanceCrossover) {
        set.add('reggaeton');
        set.add('dance');
      } else if (isPureReggaetonTrack) {
        set.add('reggaeton');
      } else {
        // E. Genuine Latin styles (Música Mexicana, Corridos, Norteño, Banda, Bachata, Salsa, Merengue, Latin Rock)
        set.add('latin');
        if (g.includes('pop latino') || g.includes('latin pop') || t.includes('ocean') || t.includes('marinero')) {
          set.add('pop');
        }
        if (a.includes('juanes') || a.includes('maná') || a.includes('mana')) {
          set.add('rock');
        }
      }
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
      else if (lower === 'reggaeton' || lower === 'reggaetn') valid.add('reggaeton');
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


