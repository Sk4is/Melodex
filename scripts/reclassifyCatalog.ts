import fs from 'fs';
import { Song } from '../src/types/song';
import { GenreFilter } from '../src/types/game';

// Load catalog
const catalogPath = 'public/melodex-catalog.json';
const catalog: Song[] = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log(`Analyzing ${catalog.length} catalog tracks...`);

// Let's track metrics required by prompt:
// REGGAETON playable tracks: X
// LATIN playable tracks: X
// Moved Latin → Reggaeton: X
// Classified Reggaeton + Pop: X
// Latin Urban classified as Hip-Hop/Latin Trap: X
// Ambiguous tracks left unchanged: X

let movedLatinToReggaeton = 0;
let classifiedReggaetonAndPop = 0;
let latinUrbanToHipHop = 0;
let ambiguousLeftUnchanged = 0;

// Specific track IDs or titles with designated classifications
const explicitTrackOverrides = new Map<string, GenreFilter[]>();

// Let's create a helper to assign overrides by title keywords or song IDs
function overrideTrack(id: string, genres: GenreFilter[]) {
  explicitTrackOverrides.set(id, genres);
}

// Write the classification engine
export function classifySong(song: Song): GenreFilter[] {
  const id = String(song.id || '');
  if (explicitTrackOverrides.has(id)) {
    return explicitTrackOverrides.get(id)!;
  }

  const rawGenre = (song.genre || '').toLowerCase().trim();
  const artist = (song.artist || '').toLowerCase().trim();
  const title = (song.title || '').toLowerCase().trim();
  const album = (song.album || '').toLowerCase().trim();
  const currentNorm = (song.normalizedGenres || []).map((x) => String(x).toLowerCase() as GenreFilter);

  // Default to keeping current if not Latin or Urban related
  const isLatinRelated =
    currentNorm.includes('latin') ||
    rawGenre.includes('urbano') ||
    rawGenre.includes('latin') ||
    rawGenre.includes('reggaeton') ||
    rawGenre.includes('tropical') ||
    rawGenre.includes('mexicana');

  if (!isLatinRelated) {
    // Check if artist or title is known reggaeton hit classified elsewhere (e.g. Despacito pop remix)
    if (title.includes('despacito')) return ['reggaeton', 'pop'];
    if (title.includes('con altura')) return ['reggaeton', 'pop'];
    if (title.includes('hey ma') && artist.includes('j balvin')) return ['reggaeton', 'pop'];
    if (title.includes('ritmo') && artist.includes('j balvin')) return ['reggaeton', 'dance', 'pop'];
    if (title.includes('algo me gusta de ti') && artist.includes('wisin')) return ['reggaeton', 'dance'];
    if (title.includes('ayer la ví') && artist.includes('don omar')) return ['reggaeton'];
    if (title.includes('darte') && artist.includes('myke towers')) return ['reggaeton'];
    if (title.includes('sigues con él') && artist.includes('arcángel')) return ['reggaeton'];
    if (title.includes('tu te imaginas') && artist.includes('de la ghetto')) return ['reggaeton'];
    if (title.includes('acércate') && artist.includes('de la ghetto')) return ['reggaeton'];
    if (title.includes('bola rebola')) return ['reggaeton', 'pop'];
    if (title.includes('top gone') && artist.includes('lunay')) return ['reggaeton', 'hiphop'];

    return currentNorm.length > 0 ? currentNorm : ['pop'];
  }

  // Handle English pop songs misclassified as Latin (e.g., Becky G - Shower, Pitbull - International Love)
  if (title === 'shower' && artist.includes('becky g')) return ['pop'];
  if (title === "can't stop dancin'" && artist.includes('becky g')) return ['pop'];
  if (title === "can't get enough" && artist.includes('becky g')) return ['pop'];
  if (title.includes('international love') && artist.includes('pitbull')) return ['pop', 'dance'];
  if (title.includes('parís') && artist.includes('morat')) return ['pop', 'rock'];
  if (title.includes('touching the sky') && artist.includes('rauw')) return ['pop', 'dance'];
  if (title === 'escape reality tonight') return ['electronic', 'dance'];

  // 1. LATIN TRAP / URBAN HIP-HOP
  // Specific Latin Trap tracks that must map to HIP-HOP
  const isLatinTrapTrack =
    (artist.includes('bad bunny') && (
      title === '<3' || title === '25/8' || title === 'bendiciones' ||
      title === 'no te hagas' || title === 'me mata' || title === 'de museo' ||
      title.includes('monaco') || title.includes('vuelve')
    )) ||
    (artist.includes('ozuna') && (
      title.includes('solita') || title.includes('patek')
    )) ||
    (artist.includes('duki') && (
      title.includes("she don't give a fo") || title.includes('goteo') ||
      title.includes('hitboy') || title.includes('bzrp music sessions, vol. 50') ||
      title.includes('hablamos mañana') || title.includes('panamá') ||
      title.includes('si me sobrara el tiempo') || title.includes('alley oop') ||
      title.includes('la clase')
    )) ||
    (artist.includes('myke towers') && (
      title.includes('piensan') || title.includes('pending') || title.includes('cuerpo en venta')
    )) ||
    (artist.includes('arcángel') && (
      title.includes('infeliz') || title.includes('la ocasión') || title.includes('me ama me odia')
    )) ||
    (artist.includes('bryant myers') && title.includes('ojalá')) ||
    (artist.includes('fat joe') && title.includes('yes')) ||
    (artist.includes('bizarrap') && (
      title.includes('vol. 36') || title.includes('vol. 46') || title.includes('vol. 49') ||
      title.includes('vol. 50') || title.includes('vol. 54') || title.includes('vol. 58') ||
      title.includes('lil baby') || title.includes('yamen fui') || title.includes('mamichula')
    ));

  if (isLatinTrapTrack) {
    return ['hiphop'];
  }

  // Rock songs by Bad Bunny or Rosalía
  if (title.includes('yo visto así') && artist.includes('bad bunny')) return ['rock', 'pop'];
  if (title.includes('hablamos mañana') && artist.includes('bad bunny')) return ['rock', 'hiphop'];
  if (title.includes('un peso') && artist.includes('bad bunny')) return ['rock', 'pop'];
  if (title.includes('como un bebé') && artist.includes('bad bunny')) return ['pop'];

  // Non-reggaeton Latin styles by Urban artists:
  // Bad Bunny Merengue / Mambo
  if (title.includes('después de la playa') && artist.includes('bad bunny')) return ['latin'];
  if (title.includes('nuevayol') && artist.includes('bad bunny')) return ['latin'];
  if (title.includes('neverita') && artist.includes('bad bunny')) return ['pop', 'dance'];

  // Karol G non-reggaeton styles
  if (title.includes('si antes te hubiera conocido')) return ['latin']; // Merengue
  if (title.includes('mi ex tenía razón')) return ['latin']; // Tejano cumbia
  if (title.includes('200 copas')) return ['latin']; // Corrido / Ranchera
  if (title.includes('ocean')) return ['pop', 'latin']; // Piano ballad
  if (title.includes('bby wow')) return ['pop', 'electronic'];
  if (title.includes('coleccionando heridas')) return ['latin'];

  // Rauw Alejandro non-reggaeton styles
  if (title.includes('tú con él') && artist.includes('rauw')) return ['latin']; // Salsa
  if (title.includes('hayami hana') && artist.includes('rauw')) return ['pop', 'latin'];
  if (title.includes('se fue') && artist.includes('rauw')) return ['pop', 'latin'];
  if (title.includes('carita linda') && artist.includes('rauw')) return ['pop', 'latin'];

  // Maluma non-reggaeton styles
  if (title.includes('marinero') && artist.includes('maluma')) return ['pop', 'latin'];
  if (title.includes('cosas pendientes') && artist.includes('maluma')) return ['pop', 'latin'];
  if (title.includes('por qué será')) return ['latin']; // Regional Mexican
  if (title.includes('cada quien')) return ['latin']; // Regional Mexican
  if (title.includes('si tú me vieras')) return ['latin']; // Regional Mexican

  // Arcangel non-reggaeton styles
  if (title.includes('alv') && artist.includes('arcángel')) return ['latin']; // Regional Mexican
  if (title.includes('la chamba') && artist.includes('arcángel')) return ['latin']; // Corrido

  // Romeo Santos & Rosalia bachata
  if (title.includes('el pañuelo')) return ['latin'];

  // Becky G Regional Mexican hits
  if (artist.includes('becky g') && (
    title.includes('por el contrario') || title.includes('2ndo chance') ||
    title.includes('mercedes') || title.includes('ya acabó') || title.includes('chanel')
  )) {
    return ['latin'];
  }

  // 2. REGGAETON / CROSSOVER TRACKS
  // Reggaeton Pop Crossovers:
  const isReggaetonPopCrossover =
    (title.includes('despacito')) ||
    (title.includes('con calma')) ||
    (title.includes('limbo')) ||
    (title.includes('llamado de emergencia')) ||
    (title.includes('la despedida')) ||
    (title.includes('danza kuduro')) ||
    (title.includes('dutty love')) ||
    (title.includes('mía') && artist.includes('bad bunny')) ||
    (title.includes('la canción') && artist.includes('bad bunny')) ||
    (title.includes('si veo a tu mamá') && artist.includes('bad bunny')) ||
    (title.includes('estamos bien') && artist.includes('bad bunny')) ||
    (title.includes('pero ya no') && artist.includes('bad bunny')) ||
    (title.includes('me fui de vacaciones') && artist.includes('bad bunny')) ||
    (title.includes('está rico')) ||
    (title.includes('sensualidad')) ||
    (title.includes('mayores')) ||
    (title.includes('sin pijama')) ||
    (title.includes('mamiii')) ||
    (title.includes('dollar')) ||
    (title.includes('chula') && artist.includes('becky g')) ||
    (title.includes('epa') && artist.includes('becky g')) ||
    (title.includes('que haces') && artist.includes('becky g')) ||
    (title.includes('la respuesta') && artist.includes('becky g')) ||
    (title.includes('bubalú')) ||
    (title.includes('chantaje')) ||
    (title.includes('te felicito')) ||
    (title.includes('perro fiel')) ||
    (title.includes('la tortura')) ||
    (title.includes('bailando') && artist.includes('enrique')) ||
    (title.includes('el perdón')) ||
    (title.includes('duele el corazón')) ||
    (title.includes('súbeme la radio')) ||
    (title.includes('felices los 4')) ||
    (title.includes('11 pm')) ||
    (title.includes('el perdedor') && artist.includes('maluma')) ||
    (title.includes('hawái')) ||
    (title.includes('corazón') && artist.includes('maluma')) ||
    (title.includes('sobrio') && artist.includes('maluma')) ||
    (title.includes('créeme')) ||
    (title.includes('amigos con derechos')) ||
    (title.includes('la temperatura') && artist.includes('maluma')) ||
    (title.includes('bella') && artist.includes('maluma')) ||
    (title.includes('tusa')) ||
    (title.includes('tqg')) ||
    (title.includes('provenza')) ||
    (title.includes('secreto') && artist.includes('karol g')) ||
    (title.includes('china') && artist.includes('anuel')) ||
    (title.includes('baila baila baila')) ||
    (title.includes('criminal') && artist.includes('natti natasha')) ||
    (title.includes('la modelo') && artist.includes('ozuna')) ||
    (title.includes('vaina loca') && artist.includes('ozuna')) ||
    (title.includes('el farsante') && artist.includes('ozuna')) ||
    (title.includes('caramelo')) ||
    (title.includes('labios mordidos')) ||
    (title.includes('mi mala')) ||
    (title.includes('yo x ti, tú x mí')) ||
    (title.includes('imposible') && artist.includes('fonsi')) ||
    (title.includes('calypso') && artist.includes('fonsi')) ||
    (title.includes('date la vuelta') && artist.includes('fonsi')) ||
    (title.includes('vacío') && artist.includes('fonsi')) ||
    (title.includes('cambiaré') && artist.includes('fonsi')) ||
    (title.includes('beso') && artist.includes('rosalía')) ||
    (title.includes('baila conmigo') && artist.includes('selena')) ||
    (title.includes('tattoo') && artist.includes('rauw')) ||
    (title.includes('algo mágico') && artist.includes('rauw')) ||
    (title.includes('sci-fi') && artist.includes('rauw')) ||
    (title.includes('loquita') && artist.includes('rauw')) ||
    (title.includes('pareja del año')) ||
    (title.includes('envolver')) ||
    (title.includes('me gusta') && artist.includes('anitta')) ||
    (title.includes('yapaque')) ||
    (title.includes('una lady como tú')) ||
    (title.includes('loco contigo')) ||
    (title.includes('mi gente') && artist.includes('balvin')) ||
    (title.includes('rojo') && artist.includes('balvin')) ||
    (title.includes('sigo extrañándote')) ||
    (title.includes('x (feat. maluma')) ||
    (title.includes('x') && artist.includes('nicky jam') && artist.includes('balvin')) ||
    (title.includes('safari') && artist.includes('balvin')) ||
    (title.includes('khé?')) ||
    (title.includes('desenfocao')) ||
    (title.includes('santa') && artist.includes('rauw')) ||
    (title.includes('con altura')) ||
    (title.includes('hey ma')) ||
    (title.includes('bola rebola')) ||
    (title.includes('como si no importara')) ||
    (title.includes('2:50 remix')) ||
    (title.includes('los del espacio')) ||
    (title.includes('unfollow') && artist.includes('duki')) ||
    (title.includes('bailando te conocí')) ||
    (title.includes('enchule'));

  if (isReggaetonPopCrossover) {
    return ['reggaeton', 'pop'];
  }

  // Reggaeton Dance Crossovers:
  if (title.includes('pepas')) return ['reggaeton', 'dance', 'electronic'];
  if (title.includes('in da getto')) return ['reggaeton', 'dance', 'electronic'];
  if (title.includes('taboo') && artist.includes('don omar')) return ['reggaeton', 'dance'];
  if (title.includes('zumba') && artist.includes('don omar')) return ['reggaeton', 'dance'];
  if (title.includes('virtual diva')) return ['reggaeton', 'dance', 'electronic'];
  if (title.includes('lovumba')) return ['reggaeton', 'dance'];
  if (title.includes('wapae')) return ['reggaeton', 'dance'];
  if (title.includes('pa ti') && artist.includes('6ix9ine')) return ['reggaeton', 'dance'];
  if (title.includes('habla toro')) return ['reggaeton', 'dance'];
  if (title.includes('papita frita')) return ['reggaeton', 'dance'];
  if (title.includes('fulanito')) return ['reggaeton', 'dance'];
  if (title.includes('ella no es tuya')) return ['reggaeton', 'dance'];
  if (title.includes('el taxi')) return ['reggaeton', 'dance', 'pop'];
  if (title.includes('como yo le doy')) return ['reggaeton', 'dance', 'pop'];
  if (title.includes('tu pum pum')) return ['reggaeton', 'dance'];

  // Pure Reggaeton tracks by artists or genres
  const isReggaetonTrack =
    rawGenre.includes('reggaeton') ||
    rawGenre.includes('reggaetón') ||
    (rawGenre.includes('urbano') && (
      artist.includes('daddy yankee') || artist.includes('don omar') ||
      artist.includes('bad bunny') || artist.includes('j balvin') ||
      artist.includes('ozuna') || artist.includes('karol g') ||
      artist.includes('rauw alejandro') || artist.includes('maluma') ||
      artist.includes('plan b') || artist.includes('j alvarez') ||
      artist.includes('wisin') || artist.includes('yandel') ||
      artist.includes('anuel') || artist.includes('nicky jam') ||
      artist.includes('farruko') || artist.includes('arcángel') ||
      artist.includes('arcangel') || artist.includes('de la ghetto') ||
      artist.includes('myke towers') || artist.includes('lunay') ||
      artist.includes('sech') || artist.includes('el alfa') ||
      artist.includes('chencho') || artist.includes('zion') ||
      artist.includes('natti natasha') || artist.includes('manuel turizo') ||
      artist.includes('jhayco') || artist.includes('jhay cortez') ||
      artist.includes('mora') || artist.includes('feid')
    )) ||
    (artist.includes('plan b')) ||
    (artist.includes('j alvarez')) ||
    (artist.includes('daddy yankee') && (
      title.includes('gasolina') || title.includes('dura') || title.includes('shaky shaky') ||
      title.includes('no me dejes solo') || title.includes('tu príncipe') ||
      title.includes('lo que pasó, pasó') || title.includes('pose') ||
      title.includes('la rompe corazones') || title.includes('ella me levantó')
    )) ||
    (artist.includes('don omar') && (
      title.includes('dile') || title.includes('dale don dale') || title.includes('pobre diabla') ||
      title.includes('bandoleros') || title.includes('te quiero pa') || title.includes('hooka') ||
      title.includes('mayor que yo') || title.includes('nadie como tú') || title.includes('myspace') ||
      title.includes('salió el sol') || title.includes('ángelito') || title.includes('ojitos chiquitos') ||
      title.includes('ayer la ví')
    )) ||
    (artist.includes('wisin') && (
      title.includes('besos mojados') || title.includes('ahora es') ||
      title.includes('reggaetón en lo oscuro') || title.includes('besos moja2') ||
      title.includes('3g')
    )) ||
    (artist.includes('arcángel') && (
      title.includes("pa' que la pases bien") || title.includes('por amar a ciegas') ||
      title.includes('ganas de ti') || title.includes('satisfacción') ||
      title.includes('te acuerdas') || title.includes('+linda')
    )) ||
    (artist.includes('de la ghetto') && (
      title.includes('ahí ahí ahí') || title.includes('todo el amor') ||
      title.includes('relajate conmigo') || title.includes('tu te imaginas') ||
      title.includes('acércate') || title.includes('ultra solo') || title.includes('panti y colale')
    )) ||
    (artist.includes('farruko') && (
      title.includes('chillax') || title.includes('hoy') || title.includes('la tóxica') ||
      title.includes('singapur') || title.includes('la cartera') || title.includes('fantasías')
    )) ||
    (artist.includes('nicky jam') && (
      title.includes('polvo') || title.includes('travesuras') || title.includes('si tú no estás') ||
      title.includes('sube la music') || title.includes('despacio')
    )) ||
    (artist.includes('anitta') && (title.includes('tócame') || title.includes('envolver'))) ||
    (artist.includes('el alfa') && (
      title.includes('goyard') || title.includes('singapur') || title.includes('dembow y reggaeton') ||
      title.includes('déjalo que corra') || title.includes('panti y colale')
    )) ||
    (artist.includes('lunay') && (
      title.includes('soltera') || title.includes('la cama') || title.includes('aventura')
    )) ||
    (artist.includes('sech') && (
      title.includes('sigues con él') || title.includes('te acuerdas') || title.includes('la tóxica')
    )) ||
    (artist.includes('chencho corleone')) ||
    (artist.includes('zion') && title.includes('tu príncipe'));

  if (isReggaetonTrack) {
    return ['reggaeton'];
  }

  // Check for Latin Urban collabs that are Reggaeton
  if (title.includes('no me conoce') || title.includes('soltera') || title.includes('la cama') ||
      title.includes('la ocasión') || title.includes('ahora dice') || title.includes('una locura') ||
      title.includes('dembow 2020') || title.includes('problemón') || title.includes('fantasías') ||
      title.includes('el efecto') || title.includes('noche loca') || title.includes('muévelo') ||
      title.includes('gatúbela') || title.includes('el makinón') || title.includes('culpables') ||
      title.includes('mi cama') || title.includes('qué pretendes') || title.includes('mojaita') ||
      title.includes('yo le llego') || title.includes('cuidao por ahí') || title.includes('como antes') ||
      title.includes('la noche de anoche') || title.includes('azul') || title.includes('morado') ||
      title.includes('ay vamos') || title.includes('6 am') || title.includes('ginza') ||
      title.includes('bonita') && artist.includes('balvin') || title.includes('se preparó') ||
      title.includes('dile que tú me quieres') || title.includes('tu foto') || title.includes('si no te quiere') ||
      title.includes('bebé') && artist.includes('ozuna') || title.includes('única') && artist.includes('ozuna') ||
      title.includes('síguelo bailando') || title.includes('no quiere enamorarse') ||
      title.includes('quiero repetir') || title.includes('hey mor') || title.includes('borró cassette') ||
      title.includes('mala mía') || title.includes('sin contrato') || title.includes('el préstamo') ||
      title.includes('almas gemelas') || title.includes('carita feliz') || title.includes('bella y sensual') ||
      title.includes('te vas') && artist.includes('ozuna') || title.includes('luz apaga') ||
      title.includes('mala santa') || title.includes('perreo triste') ||
      title.includes('hace mucho tiempo') || title.includes('me prefieres a mi') ||
      title.includes('contigo quiero amores') || title.includes('50 sombras de austin') ||
      title.includes('te robo') || title.includes('sola') && artist.includes('arcángel') ||
      title.includes('memoria rota') || title.includes('más que ayer') ||
      title.includes('mi fanática') || title.includes('zum zum') ||
      title.includes('enséñame a bailar') || title.includes('turista') ||
      title.includes('a tu merced') || title.includes('pasaporte') ||
      title.includes('guabansexxx') || title.includes('al mismo tiempo') ||
      title.includes('aloha') || title.includes('elegí') ||
      title.includes('pongo') || title.includes('nubes') && artist.includes('rauw') ||
      title.includes('toda (remix)') || title.includes('no me sorprende') ||
      title.includes('cuándo fue') || title.includes('detective') && artist.includes('rauw') ||
      title.includes('verde menta') || title.includes('amor bipolar') ||
      title.includes('no lo trates')) {
    return ['reggaeton'];
  }

  // 3. REMAINING LATIN (Música Mexicana, Bachata, Salsa, Latin Pop ballads, Latin Rock)
  // Check if Latin Pop
  if (rawGenre.includes('pop latino') || rawGenre.includes('latin pop')) {
    return ['pop', 'latin'];
  }

  // Rock en Español
  if (artist.includes('juanes') || artist.includes('maná') || artist.includes('mana')) {
    return ['latin', 'rock'];
  }

  // Default Latin track
  return ['latin'];
}

// Let's run simulation
let countReggaeton = 0;
let countLatin = 0;
let countReggaetonPop = 0;
let countTrapHipHop = 0;
let countMovedLatinToReggaeton = 0;
let countAmbiguousUnchanged = 0;

for (const song of catalog) {
  const origNorm = (song.normalizedGenres || []).map((x) => String(x).toLowerCase());
  const hadLatinOrig = origNorm.includes('latin');
  const wasUrban = (song.genre || '').toLowerCase().includes('urbano');

  const newNorm = classifySong(song);

  const hasReggaeton = newNorm.includes('reggaeton');
  const hasLatin = newNorm.includes('latin');
  const hasPop = newNorm.includes('pop');
  const hasHipHop = newNorm.includes('hiphop');

  if (hasReggaeton) countReggaeton++;
  if (hasLatin) countLatin++;

  if (hadLatinOrig && hasReggaeton && !hasLatin) {
    countMovedLatinToReggaeton++;
  }
  if (hasReggaeton && hasPop) {
    countReggaetonPop++;
  }
  if (hadLatinOrig && hasHipHop && !hasReggaeton && !hasLatin) {
    countTrapHipHop++;
  }
  if (hadLatinOrig && hasLatin && !hasReggaeton && !hasHipHop) {
    countAmbiguousUnchanged++;
  }
}

console.log('--- SIMULATION RESULTS ---');
console.log(`REGGAETON playable tracks: ${countReggaeton}`);
console.log(`LATIN playable tracks: ${countLatin}`);
console.log(`Moved Latin → Reggaeton: ${countMovedLatinToReggaeton}`);
console.log(`Classified Reggaeton + Pop: ${countReggaetonPop}`);
console.log(`Latin Urban classified as Hip-Hop/Latin Trap: ${countTrapHipHop}`);
console.log(`Ambiguous tracks left unchanged: ${countAmbiguousUnchanged}`);
