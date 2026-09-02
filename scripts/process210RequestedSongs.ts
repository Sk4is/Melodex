import * as fs from 'fs';
import * as path from 'path';
import { Song } from '../src/types/song';
import { computeNormalizedGenres } from '../src/utils/genreUtils';

interface TrackSpec {
  index: number;
  artist: string;
  title: string;
  searchQueries: string[];
  expectedYear: number;
  genreHints: string;
  requiredPrimaryArtist: string[];
  requiredTitleKeywords: string[];
  forbiddenTitleKeywords?: string[];
  isRemix?: boolean;
  notes?: string;
}

const TRACKS_TO_PROCESS: TrackSpec[] = [
  {
    index: 1,
    artist: 'Lil Mosey & Gunna',
    title: 'Stuck In A Dream',
    searchQueries: ['Lil Mosey Stuck In A Dream Gunna', 'Lil Mosey Stuck In A Dream'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil mosey'],
    requiredTitleKeywords: ['stuck in a dream'],
  },
  {
    index: 2,
    artist: 'The Kid LAROI & Juice WRLD',
    title: 'GO',
    searchQueries: ['The Kid LAROI GO Juice WRLD', 'The Kid LAROI GO'],
    expectedYear: 2020,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['the kid laroi', 'kid laroi'],
    requiredTitleKeywords: ['go'],
  },
  {
    index: 3,
    artist: 'Kodak Black & Lil Pump',
    title: 'Gnarly',
    searchQueries: ['Kodak Black Gnarly Lil Pump', 'Kodak Black Gnarly'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['kodak black'],
    requiredTitleKeywords: ['gnarly'],
  },
  {
    index: 4,
    artist: 'The Kid LAROI & Lil Tecca',
    title: 'Diva',
    searchQueries: ['The Kid LAROI Diva Lil Tecca', 'The Kid LAROI Diva'],
    expectedYear: 2020,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['the kid laroi', 'kid laroi'],
    requiredTitleKeywords: ['diva'],
  },
  {
    index: 5,
    artist: 'The Kid LAROI',
    title: 'TELL ME WHY',
    searchQueries: ['The Kid LAROI TELL ME WHY'],
    expectedYear: 2020,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['the kid laroi', 'kid laroi'],
    requiredTitleKeywords: ['tell me why'],
  },
  {
    index: 6,
    artist: 'XXXTENTACION, Lil Pump, Swae Lee & Maluma',
    title: 'Arms Around You',
    searchQueries: ['XXXTENTACION Arms Around You Lil Pump Swae Lee', 'Arms Around You XXXTENTACION'],
    expectedYear: 2018,
    genreHints: 'hiphop rap latin pop',
    requiredPrimaryArtist: ['xxxtentacion', 'lil pump', 'swae lee', 'maluma'],
    requiredTitleKeywords: ['arms around you'],
  },
  {
    index: 7,
    artist: 'KHEA & Lenny Santos',
    title: 'Ayer Me Llamó Mi Ex',
    searchQueries: ['KHEA Ayer Me Llamó Mi Ex Lenny Santos', 'KHEA Ayer Me Llamo Mi Ex'],
    expectedYear: 2020,
    genreHints: 'latin trap urban',
    requiredPrimaryArtist: ['khea'],
    requiredTitleKeywords: ['ayer me llamo mi ex', 'ayer me llamó mi ex'],
  },
  {
    index: 8,
    artist: 'Duki',
    title: 'Goteo',
    searchQueries: ['Duki Goteo'],
    expectedYear: 2019,
    genreHints: 'latin trap urban',
    requiredPrimaryArtist: ['duki'],
    requiredTitleKeywords: ['goteo'],
  },
  {
    index: 9,
    artist: 'Travis Scott',
    title: 'goosebumps',
    searchQueries: ['Travis Scott goosebumps Kendrick Lamar', 'Travis Scott goosebumps'],
    expectedYear: 2016,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['travis scott'],
    requiredTitleKeywords: ['goosebumps'],
  },
  {
    index: 10,
    artist: 'The Weeknd',
    title: 'Blinding Lights',
    searchQueries: ['The Weeknd Blinding Lights'],
    expectedYear: 2019,
    genreHints: 'pop synthpop rnb',
    requiredPrimaryArtist: ['the weeknd', 'weeknd'],
    requiredTitleKeywords: ['blinding lights'],
  },
  {
    index: 11,
    artist: 'Yvng Swag',
    title: 'Hit My Phone',
    searchQueries: ['Yvng Swag Hit My Phone'],
    expectedYear: 2017,
    genreHints: 'hiphop rap',
    requiredPrimaryArtist: ['yvng swag'],
    requiredTitleKeywords: ['hit my phone'],
  },
  {
    index: 12,
    artist: 'Juice WRLD',
    title: 'All Girls Are The Same',
    searchQueries: ['Juice WRLD All Girls Are The Same'],
    expectedYear: 2018,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['all girls are the same'],
  },
  {
    index: 13,
    artist: 'Juice WRLD',
    title: 'Lucid Dreams',
    searchQueries: ['Juice WRLD Lucid Dreams'],
    expectedYear: 2018,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['lucid dreams'],
  },
  {
    index: 14,
    artist: 'Juice WRLD',
    title: 'Wishing Well',
    searchQueries: ['Juice WRLD Wishing Well'],
    expectedYear: 2020,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['wishing well'],
  },
  {
    index: 15,
    artist: 'Juice WRLD',
    title: 'Stay High',
    searchQueries: ['Juice WRLD Stay High'],
    expectedYear: 2020,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['stay high'],
  },
  {
    index: 16,
    artist: 'Juice WRLD',
    title: 'Legends',
    searchQueries: ['Juice WRLD Legends'],
    expectedYear: 2018,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['legends'],
  },
  {
    index: 17,
    artist: 'Juice WRLD & Seezyn',
    title: 'Hide',
    searchQueries: ['Juice WRLD Hide Seezyn', 'Juice WRLD Hide'],
    expectedYear: 2018,
    genreHints: 'hiphop rap soundtrack',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['hide'],
  },
  {
    index: 18,
    artist: 'Juice WRLD',
    title: 'Righteous',
    searchQueries: ['Juice WRLD Righteous'],
    expectedYear: 2020,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['righteous'],
  },
  {
    index: 19,
    artist: 'Lil Skies & Lil Durk',
    title: 'Havin My Way',
    searchQueries: ['Lil Skies Havin My Way Lil Durk', 'Lil Skies Havin My Way'],
    expectedYear: 2020,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['havin my way'],
  },
  {
    index: 20,
    artist: 'Lil Skies',
    title: 'Magic',
    searchQueries: ['Lil Skies Magic'],
    expectedYear: 2020,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['magic'],
  },
  {
    index: 21,
    artist: 'Trippie Redd & Juice WRLD',
    title: '1400 / 999 Freestyle',
    searchQueries: ['Trippie Redd 1400 / 999 Freestyle Juice WRLD', 'Trippie Redd 1400 999 Freestyle'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['trippie redd'],
    requiredTitleKeywords: ['1400 / 999', '1400/999', '1400 999'],
  },
  {
    index: 22,
    artist: 'Lil Skies & Trippie Redd',
    title: 'Ice Water',
    searchQueries: ['Lil Skies Ice Water Trippie Redd', 'Lil Skies Ice Water'],
    expectedYear: 2021,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['ice water'],
  },
  {
    index: 23,
    artist: 'Post Malone & DaBaby',
    title: 'Enemies',
    searchQueries: ['Post Malone Enemies DaBaby', 'Post Malone Enemies'],
    expectedYear: 2019,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['enemies'],
  },
  {
    index: 24,
    artist: 'Diplo & Trippie Redd',
    title: 'Wish',
    searchQueries: ['Diplo Wish Trippie Redd', 'Trippie Redd Wish Diplo'],
    expectedYear: 2018,
    genreHints: 'electronic hiphop rap',
    requiredPrimaryArtist: ['diplo', 'trippie redd'],
    requiredTitleKeywords: ['wish'],
  },
  {
    index: 25,
    artist: 'Lil Peep',
    title: 'Save That Shit',
    searchQueries: ['Lil Peep Save That Shit'],
    expectedYear: 2017,
    genreHints: 'emo rap alternative hiphop',
    requiredPrimaryArtist: ['lil peep'],
    requiredTitleKeywords: ['save that shit'],
  },
  {
    index: 26,
    artist: 'Polo G & Lil Wayne',
    title: 'GANG GANG',
    searchQueries: ['Polo G GANG GANG Lil Wayne', 'Polo G GANG GANG'],
    expectedYear: 2021,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['polo g'],
    requiredTitleKeywords: ['gang gang'],
  },
  {
    index: 27,
    artist: 'Juice WRLD',
    title: '734',
    searchQueries: ['Juice WRLD 734'],
    expectedYear: 2021,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['734'],
  },
  {
    index: 28,
    artist: 'Lil Yachty',
    title: 'One Night',
    searchQueries: ['Lil Yachty One Night'],
    expectedYear: 2016,
    genreHints: 'hiphop rap bubblegum trap',
    requiredPrimaryArtist: ['lil yachty'],
    requiredTitleKeywords: ['one night'],
  },
  {
    index: 29,
    artist: 'Polo G',
    title: 'RAPSTAR',
    searchQueries: ['Polo G RAPSTAR'],
    expectedYear: 2021,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['polo g'],
    requiredTitleKeywords: ['rapstar'],
  },
  {
    index: 30,
    artist: 'Lil Mosey & Lunay',
    title: 'Top Gone',
    searchQueries: ['Lil Mosey Top Gone Lunay', 'Lil Mosey Top Gone'],
    expectedYear: 2020,
    genreHints: 'latin urban hiphop rap',
    requiredPrimaryArtist: ['lil mosey'],
    requiredTitleKeywords: ['top gone'],
  },
  {
    index: 31,
    artist: 'Duki & Bizarrap',
    title: 'Malbec',
    searchQueries: ['Duki Malbec Bizarrap', 'Duki Malbec'],
    expectedYear: 2021,
    genreHints: 'latin trap urban',
    requiredPrimaryArtist: ['duki'],
    requiredTitleKeywords: ['malbec'],
  },
  {
    index: 32,
    artist: 'Lil Mosey',
    title: 'Kamikaze',
    searchQueries: ['Lil Mosey Kamikaze'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil mosey'],
    requiredTitleKeywords: ['kamikaze'],
  },
  {
    index: 33,
    artist: 'DDG & Paidway T.O',
    title: 'No Kizzy',
    searchQueries: ['DDG No Kizzy Paidway', 'DDG No Kizzy'],
    expectedYear: 2020,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['ddg'],
    requiredTitleKeywords: ['no kizzy'],
  },
  {
    index: 34,
    artist: 'Post Malone',
    title: 'Motley Crew',
    searchQueries: ['Post Malone Motley Crew'],
    expectedYear: 2021,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['motley crew'],
  },
  {
    index: 35,
    artist: 'The Kid LAROI & Justin Bieber',
    title: 'STAY',
    searchQueries: ['The Kid LAROI STAY Justin Bieber', 'The Kid LAROI STAY'],
    expectedYear: 2021,
    genreHints: 'pop synthpop',
    requiredPrimaryArtist: ['the kid laroi', 'kid laroi'],
    requiredTitleKeywords: ['stay'],
  },
  {
    index: 36,
    artist: 'Duki & KHEA',
    title: "She Don't Give a Fo",
    searchQueries: ["Duki She Don't Give a Fo KHEA", "Duki She Dont Give a Fo"],
    expectedYear: 2017,
    genreHints: 'latin trap urban',
    requiredPrimaryArtist: ['duki'],
    requiredTitleKeywords: ["she don't give a fo", "she dont give a fo"],
  },
  {
    index: 37,
    artist: 'Lil Skies & Rich The Kid',
    title: 'Creeping',
    searchQueries: ['Lil Skies Creeping Rich The Kid', 'Lil Skies Creeping'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['creeping'],
  },
  {
    index: 38,
    artist: 'Juice WRLD',
    title: 'Lean Wit Me',
    searchQueries: ['Juice WRLD Lean Wit Me'],
    expectedYear: 2018,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['lean wit me'],
  },
  {
    index: 39,
    artist: 'Lil Mosey',
    title: 'Live This Wild',
    searchQueries: ['Lil Mosey Live This Wild'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil mosey'],
    requiredTitleKeywords: ['live this wild'],
  },
  {
    index: 40,
    artist: 'Lil Skies',
    title: 'Dead Broke',
    searchQueries: ['Lil Skies Dead Broke'],
    expectedYear: 2021,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['dead broke'],
  },
  {
    index: 41,
    artist: 'Lil Nas X & Jack Harlow',
    title: 'INDUSTRY BABY',
    searchQueries: ['Lil Nas X INDUSTRY BABY Jack Harlow', 'Lil Nas X INDUSTRY BABY'],
    expectedYear: 2021,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['lil nas x'],
    requiredTitleKeywords: ['industry baby'],
  },
  {
    index: 42,
    artist: 'Lil Skies',
    title: 'I',
    searchQueries: ['Lil Skies I Shelby', 'Lil Skies "I"'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['i'],
  },
  {
    index: 43,
    artist: 'Lil Skies & Landon Cube',
    title: 'Red Roses',
    searchQueries: ['Lil Skies Red Roses Landon Cube', 'Lil Skies Red Roses'],
    expectedYear: 2017,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['red roses'],
  },
  {
    index: 44,
    artist: 'Lil Mosey',
    title: 'Pull Up',
    searchQueries: ['Lil Mosey Pull Up'],
    expectedYear: 2017,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil mosey'],
    requiredTitleKeywords: ['pull up'],
  },
  {
    index: 45,
    artist: 'Juice WRLD',
    title: 'Already Dead',
    searchQueries: ['Juice WRLD Already Dead'],
    expectedYear: 2021,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['already dead'],
  },
  {
    index: 46,
    artist: 'Juice WRLD & Justin Bieber',
    title: 'Wandered To LA',
    searchQueries: ['Juice WRLD Wandered To LA Justin Bieber', 'Juice WRLD Wandered To LA'],
    expectedYear: 2021,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['wandered to la'],
  },
  {
    index: 47,
    artist: 'Murda Beatz, YNW Melly & Lil Durk',
    title: 'Banana Split',
    searchQueries: ['Murda Beatz Banana Split YNW Melly Lil Durk', 'Banana Split Murda Beatz'],
    expectedYear: 2020,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['murda beatz', 'ynw melly'],
    requiredTitleKeywords: ['banana split'],
  },
  {
    index: 48,
    artist: 'YNW Melly & Kanye West',
    title: 'Mixed Personalities',
    searchQueries: ['YNW Melly Mixed Personalities Kanye West', 'YNW Melly Mixed Personalities'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['ynw melly'],
    requiredTitleKeywords: ['mixed personalities'],
  },
  {
    index: 49,
    artist: 'YNW Melly',
    title: 'Legendary',
    searchQueries: ['YNW Melly Legendary'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['ynw melly'],
    requiredTitleKeywords: ['legendary'],
  },
  {
    index: 50,
    artist: 'YNW Melly',
    title: 'Virtual (Blue Balenciagas)',
    searchQueries: ['YNW Melly Virtual Blue Balenciagas', 'YNW Melly Virtual'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['ynw melly'],
    requiredTitleKeywords: ['virtual'],
  },
  {
    index: 51,
    artist: 'Post Malone',
    title: 'Boy Bandz',
    searchQueries: ['Post Malone Boy Bandz'],
    expectedYear: 2016,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['boy bandz', 'boybandz'],
  },
  {
    index: 52,
    artist: 'Lil Skies',
    title: 'Rude',
    searchQueries: ['Lil Skies Rude'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['rude'],
  },
  {
    index: 53,
    artist: 'Lil Skies',
    title: 'Some Way',
    searchQueries: ['Lil Skies Some Way'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['some way'],
  },
  {
    index: 54,
    artist: 'Juice WRLD',
    title: 'Cigarettes',
    searchQueries: ['Juice WRLD Cigarettes'],
    expectedYear: 2022,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['cigarettes'],
  },
  {
    index: 55,
    artist: 'Lil Skies',
    title: 'Pop Star',
    searchQueries: ['Lil Skies Pop Star'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['pop star'],
  },
  {
    index: 56,
    artist: 'Juice WRLD',
    title: 'Conversations',
    searchQueries: ['Juice WRLD Conversations'],
    expectedYear: 2020,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['conversations'],
  },
  {
    index: 57,
    artist: 'Lil Uzi Vert',
    title: 'Erase Your Social',
    searchQueries: ['Lil Uzi Vert Erase Your Social'],
    expectedYear: 2016,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil uzi vert'],
    requiredTitleKeywords: ['erase your social'],
  },
  {
    index: 58,
    artist: 'Lil Uzi Vert',
    title: 'XO Tour Llif3',
    searchQueries: ['Lil Uzi Vert XO Tour Llif3', 'Lil Uzi Vert XO TOUR Llif3'],
    expectedYear: 2017,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['lil uzi vert'],
    requiredTitleKeywords: ['xo tour llif3', 'xo tour lif3', 'xo tour life'],
  },
  {
    index: 59,
    artist: 'Lil Mosey',
    title: 'Falling',
    searchQueries: ['Lil Mosey Falling'],
    expectedYear: 2021,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil mosey'],
    requiredTitleKeywords: ['falling'],
  },
  {
    index: 60,
    artist: 'Lil Skies & Landon Cube',
    title: 'Play This At My Funeral',
    searchQueries: ['Lil Skies Play This At My Funeral Landon Cube', 'Lil Skies Play This At My Funeral'],
    expectedYear: 2022,
    genreHints: 'hiphop rap alternative',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['play this at my funeral'],
  },
  {
    index: 61,
    artist: 'Pop Smoke & A Boogie Wit da Hoodie',
    title: 'Hello',
    searchQueries: ['Pop Smoke Hello A Boogie Wit da Hoodie', 'Pop Smoke Hello'],
    expectedYear: 2020,
    genreHints: 'hiphop rap drill',
    requiredPrimaryArtist: ['pop smoke'],
    requiredTitleKeywords: ['hello'],
  },
  {
    index: 62,
    artist: 'Isaac App',
    title: 'FALL',
    searchQueries: ['Isaac App FALL'],
    expectedYear: 2020,
    genreHints: 'hiphop rap r&b',
    requiredPrimaryArtist: ['isaac app'],
    requiredTitleKeywords: ['fall'],
  },
  {
    index: 63,
    artist: 'Lil Skies',
    title: 'Fake',
    searchQueries: ['Lil Skies Fake'],
    expectedYear: 2017,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['fake'],
    notes: 'Special handling: check for canonical release',
  },
  {
    index: 64,
    artist: 'Lil Skies',
    title: 'DA SAUCE',
    searchQueries: ['Lil Skies DA SAUCE', 'Lil Skies Da Sauce'],
    expectedYear: 2016,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['da sauce', 'the sauce'],
    notes: 'Special handling: check for canonical release',
  },
  {
    index: 65,
    artist: 'Internet Money, iann dior, Lil Skies & Lil Mosey',
    title: 'Lost Me',
    searchQueries: ['Internet Money Lost Me iann dior Lil Skies Lil Mosey', 'Internet Money Lost Me'],
    expectedYear: 2020,
    genreHints: 'hiphop rap trap pop',
    requiredPrimaryArtist: ['internet money'],
    requiredTitleKeywords: ['lost me'],
  },
  {
    index: 66,
    artist: 'Internet Money, Lil Tecca & A Boogie Wit da Hoodie',
    title: 'Somebody',
    searchQueries: ['Internet Money Somebody Lil Tecca A Boogie', 'Internet Money Somebody'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap pop',
    requiredPrimaryArtist: ['internet money', 'lil tecca'],
    requiredTitleKeywords: ['somebody'],
  },
  {
    index: 67,
    artist: 'Internet Money, Gunna, Don Toliver & NAV',
    title: 'Lemonade',
    searchQueries: ['Internet Money Lemonade Gunna Don Toliver NAV', 'Internet Money Lemonade'],
    expectedYear: 2020,
    genreHints: 'hiphop rap trap pop',
    requiredPrimaryArtist: ['internet money'],
    requiredTitleKeywords: ['lemonade'],
  },
  {
    index: 68,
    artist: 'Internet Money, Gunna, Don Toliver & Lil Uzi Vert',
    title: 'His & Hers',
    searchQueries: ['Internet Money His & Hers Gunna Don Toliver Lil Uzi Vert', 'Internet Money His and Hers'],
    expectedYear: 2021,
    genreHints: 'hiphop rap trap pop',
    requiredPrimaryArtist: ['internet money'],
    requiredTitleKeywords: ['his & hers', 'his and hers'],
  },
  {
    index: 69,
    artist: 'Internet Money, Trippie Redd, Diplo & Juice WRLD',
    title: 'Blastoff',
    searchQueries: ['Internet Money Blastoff Juice WRLD Trippie Redd', 'Internet Money Blastoff'],
    expectedYear: 2020,
    genreHints: 'hiphop rap trap pop',
    requiredPrimaryArtist: ['internet money'],
    requiredTitleKeywords: ['blastoff'],
  },
  {
    index: 70,
    artist: 'Don Toliver',
    title: 'No Idea',
    searchQueries: ['Don Toliver No Idea'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap rnb',
    requiredPrimaryArtist: ['don toliver'],
    requiredTitleKeywords: ['no idea'],
  },
  {
    index: 71,
    artist: 'Lil Skies',
    title: 'Name in the Sand',
    searchQueries: ['Lil Skies Name in the Sand'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['name in the sand'],
  },
  {
    index: 72,
    artist: 'Yung Bans & Lil Skies',
    title: 'Lonely',
    searchQueries: ['Yung Bans Lonely Lil Skies', 'Yung Bans Lonely'],
    expectedYear: 2017,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['yung bans'],
    requiredTitleKeywords: ['lonely'],
  },
  {
    index: 73,
    artist: 'Yung Bans, Landon Cube & YBN Nahmir',
    title: 'Ridin',
    searchQueries: ['Yung Bans Ridin Landon Cube YBN Nahmir', 'Yung Bans Ridin'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['yung bans'],
    requiredTitleKeywords: ['ridin'],
  },
  {
    index: 74,
    artist: 'Lil Uzi Vert & Oh Wonder',
    title: 'The Way Life Goes',
    searchQueries: ['Lil Uzi Vert The Way Life Goes', 'Lil Uzi Vert The Way Life Goes Nicki Minaj'],
    expectedYear: 2017,
    genreHints: 'hiphop rap emo rap pop',
    requiredPrimaryArtist: ['lil uzi vert'],
    requiredTitleKeywords: ['the way life goes'],
  },
  {
    index: 75,
    artist: 'Yung Pinch & Lil Skies',
    title: 'Nightmares',
    searchQueries: ['Yung Pinch Nightmares Lil Skies', 'Yung Pinch Nightmares'],
    expectedYear: 2019,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['yung pinch'],
    requiredTitleKeywords: ['nightmares'],
  },
  {
    index: 76,
    artist: 'Lil Skies & Yung Pinch',
    title: 'I Know You',
    searchQueries: ['Lil Skies I Know You Yung Pinch', 'Lil Skies I Know You'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['i know you'],
  },
  {
    index: 77,
    artist: 'Post Malone & Roddy Ricch',
    title: 'Cooped Up',
    searchQueries: ['Post Malone Cooped Up Roddy Ricch', 'Post Malone Cooped Up'],
    expectedYear: 2022,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['cooped up'],
  },
  {
    index: 78,
    artist: 'Lil Skies',
    title: 'No Rest',
    searchQueries: ['Lil Skies No Rest'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['no rest'],
  },
  {
    index: 79,
    artist: 'Lil Yachty & Trippie Redd',
    title: '66',
    searchQueries: ['Lil Yachty 66 Trippie Redd', 'Lil Yachty 66'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil yachty'],
    requiredTitleKeywords: ['66'],
  },
  {
    index: 80,
    artist: 'Yung Pinch',
    title: "Wouldn't Be Nothing",
    searchQueries: ["Yung Pinch Wouldn't Be Nothing", "Yung Pinch Wouldnt Be Nothing"],
    expectedYear: 2018,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['yung pinch'],
    requiredTitleKeywords: ["wouldn't be nothing", "wouldnt be nothing"],
  },
  {
    index: 81,
    artist: 'Yung Pinch',
    title: 'Perfect',
    searchQueries: ['Yung Pinch Perfect'],
    expectedYear: 2019,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['yung pinch'],
    requiredTitleKeywords: ['perfect'],
  },
  {
    index: 82,
    artist: 'Post Malone & Gunna',
    title: 'I Cannot Be (A Sadder Song)',
    searchQueries: ['Post Malone I Cannot Be Gunna', 'Post Malone I Cannot Be A Sadder Song'],
    expectedYear: 2022,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['i cannot be'],
  },
  {
    index: 83,
    artist: 'Post Malone',
    title: 'Wrapped Around Your Finger',
    searchQueries: ['Post Malone Wrapped Around Your Finger'],
    expectedYear: 2022,
    genreHints: 'pop hiphop rap',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['wrapped around your finger'],
  },
  {
    index: 84,
    artist: 'Post Malone & Doja Cat',
    title: 'I Like You (A Happier Song)',
    searchQueries: ['Post Malone I Like You Doja Cat', 'Post Malone I Like You A Happier Song'],
    expectedYear: 2022,
    genreHints: 'pop hiphop rap',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['i like you'],
  },
  {
    index: 85,
    artist: 'Post Malone',
    title: 'Reputation',
    searchQueries: ['Post Malone Reputation'],
    expectedYear: 2022,
    genreHints: 'hiphop rap pop alternative',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['reputation'],
  },
  {
    index: 86,
    artist: 'Post Malone',
    title: 'Waiting For Never',
    searchQueries: ['Post Malone Waiting For Never'],
    expectedYear: 2022,
    genreHints: 'pop hiphop rap',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['waiting for never'],
  },
  {
    index: 87,
    artist: 'Yung Pinch',
    title: 'Juicy Fruit',
    searchQueries: ['Yung Pinch Juicy Fruit'],
    expectedYear: 2019,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['yung pinch'],
    requiredTitleKeywords: ['juicy fruit'],
  },
  {
    index: 88,
    artist: 'Young Thug',
    title: 'Digits',
    searchQueries: ['Young Thug Digits'],
    expectedYear: 2016,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['young thug'],
    requiredTitleKeywords: ['digits'],
  },
  {
    index: 89,
    artist: 'Lil Baby & Gunna',
    title: 'Drip Too Hard',
    searchQueries: ['Lil Baby Drip Too Hard Gunna', 'Lil Baby Drip Too Hard'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil baby'],
    requiredTitleKeywords: ['drip too hard'],
  },
  {
    index: 90,
    artist: 'Bankrol Hayden & Lil Skies',
    title: 'Deep End',
    searchQueries: ['Bankrol Hayden Deep End Lil Skies', 'Bankrol Hayden Deep End'],
    expectedYear: 2021,
    genreHints: 'hiphop rap pop trap',
    requiredPrimaryArtist: ['bankrol hayden'],
    requiredTitleKeywords: ['deep end'],
  },
  {
    index: 91,
    artist: 'Rich The Kid',
    title: 'Plug Walk',
    searchQueries: ['Rich The Kid Plug Walk'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['rich the kid'],
    requiredTitleKeywords: ['plug walk'],
  },
  {
    index: 92,
    artist: 'Lil Pump',
    title: 'Splurgin',
    searchQueries: ['Lil Pump Splurgin'],
    expectedYear: 2021,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil pump'],
    requiredTitleKeywords: ['splurgin'],
  },
  {
    index: 93,
    artist: 'Lil Pump',
    title: 'D Rose',
    searchQueries: ['Lil Pump D Rose'],
    expectedYear: 2017,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil pump'],
    requiredTitleKeywords: ['d rose'],
  },
  {
    index: 94,
    artist: 'Lil Pump',
    title: 'Flex Like Ouu',
    searchQueries: ['Lil Pump Flex Like Ouu'],
    expectedYear: 2017,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil pump'],
    requiredTitleKeywords: ['flex like ouu'],
  },
  {
    index: 95,
    artist: 'Lil Pump',
    title: 'Boss',
    searchQueries: ['Lil Pump Boss'],
    expectedYear: 2017,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil pump'],
    requiredTitleKeywords: ['boss'],
  },
  {
    index: 96,
    artist: 'Lil Pump',
    title: 'Molly',
    searchQueries: ['Lil Pump Molly'],
    expectedYear: 2017,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil pump'],
    requiredTitleKeywords: ['molly'],
  },
  {
    index: 97,
    artist: 'Lil Pump',
    title: 'Gucci Gang',
    searchQueries: ['Lil Pump Gucci Gang'],
    expectedYear: 2017,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil pump'],
    requiredTitleKeywords: ['gucci gang'],
  },
  {
    index: 98,
    artist: 'XXXTENTACION & Trippie Redd',
    title: 'Fuck Love',
    searchQueries: ['XXXTENTACION Fuck Love Trippie Redd', 'XXXTENTACION Fuck Love'],
    expectedYear: 2017,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['xxxtentacion'],
    requiredTitleKeywords: ['fuck love'],
  },
  {
    index: 99,
    artist: 'Lil Skies & Gucci Mane',
    title: 'Bad Girls',
    searchQueries: ['Lil Skies Bad Girls Gucci Mane', 'Lil Skies Bad Girls'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['bad girls'],
  },
  {
    index: 100,
    artist: 'Lil Skies',
    title: 'Blue Strips',
    searchQueries: ['Lil Skies Blue Strips'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['blue strips'],
  },
  {
    index: 101,
    artist: 'Lil Skies',
    title: 'Ok 4 Now',
    searchQueries: ['Lil Skies Ok 4 Now', 'Lil Skies Ok 4 Now Shelby'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['ok 4 now', 'ok for now'],
  },
  {
    index: 102,
    artist: 'Lil Pump & Rich The Kid',
    title: 'Next',
    searchQueries: ['Lil Pump Next Rich The Kid', 'Lil Pump Next'],
    expectedYear: 2017,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil pump'],
    requiredTitleKeywords: ['next'],
  },
  {
    index: 103,
    artist: 'Lil Skies',
    title: 'Real Ties',
    searchQueries: ['Lil Skies Real Ties'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['real ties'],
  },
  {
    index: 104,
    artist: 'Kodak Black',
    title: 'I Wish',
    searchQueries: ['Kodak Black I Wish'],
    expectedYear: 2022,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['kodak black'],
    requiredTitleKeywords: ['i wish'],
  },
  {
    index: 105,
    artist: 'Lil Skies',
    title: 'Going Off',
    searchQueries: ['Lil Skies Going Off'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['going off'],
  },
  {
    index: 106,
    artist: 'Lil Skies',
    title: 'Fidget',
    searchQueries: ['Lil Skies Fidget'],
    expectedYear: 2020,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['fidget'],
  },
  {
    index: 107,
    artist: 'Kamrin Houser & Suigeneris',
    title: 'Cashing Out',
    searchQueries: ['Kamrin Houser Cashing Out Suigeneris', 'Kamrin Houser Cashing Out'],
    expectedYear: 2020,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['kamrin houser'],
    requiredTitleKeywords: ['cashing out'],
  },
  {
    index: 108,
    artist: 'The Kid LAROI',
    title: 'THOUSAND MILES',
    searchQueries: ['The Kid LAROI THOUSAND MILES'],
    expectedYear: 2022,
    genreHints: 'pop hiphop rap',
    requiredPrimaryArtist: ['the kid laroi', 'kid laroi'],
    requiredTitleKeywords: ['thousand miles'],
  },
  {
    index: 109,
    artist: 'DJ Khaled & Juice WRLD',
    title: 'Juice WRLD DID',
    searchQueries: ['DJ Khaled Juice WRLD DID', 'Juice WRLD DID DJ Khaled'],
    expectedYear: 2022,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['dj khaled', 'juice wrld'],
    requiredTitleKeywords: ['juice wrld did'],
  },
  {
    index: 110,
    artist: 'PnB Rock & XXXTENTACION',
    title: 'MIDDLE CHILD',
    searchQueries: ['PnB Rock MIDDLE CHILD XXXTENTACION', 'PnB Rock MIDDLE CHILD'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['pnb rock'],
    requiredTitleKeywords: ['middle child'],
  },
  {
    index: 111,
    artist: 'Denzel Curry',
    title: 'CLOUT COBAIN',
    searchQueries: ['Denzel Curry CLOUT COBAIN', 'Denzel Curry Clout Cobain'],
    expectedYear: 2018,
    genreHints: 'hiphop rap alternative rap',
    requiredPrimaryArtist: ['denzel curry'],
    requiredTitleKeywords: ['clout cobain', 'clout co13a1n'],
  },
  {
    index: 112,
    artist: 'Yung Pinch & blackbear',
    title: "Beach Ballin'",
    searchQueries: ["Yung Pinch Beach Ballin blackbear", "Yung Pinch Beach Ballin'"],
    expectedYear: 2020,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['yung pinch'],
    requiredTitleKeywords: ['beach ballin'],
  },
  {
    index: 113,
    artist: 'Lil Skies',
    title: 'World Rage',
    searchQueries: ['Lil Skies World Rage'],
    expectedYear: 2024,
    genreHints: 'hiphop rap trap rage',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['world rage'],
  },
  {
    index: 114,
    artist: 'Lil Skies',
    title: 'Opps Want Me Dead',
    searchQueries: ['Lil Skies Opps Want Me Dead'],
    expectedYear: 2021,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['opps want me dead'],
  },
  {
    index: 115,
    artist: 'Juice WRLD & Lil Uzi Vert',
    title: 'Wasted',
    searchQueries: ['Juice WRLD Wasted Lil Uzi Vert', 'Juice WRLD Wasted'],
    expectedYear: 2018,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['wasted'],
  },
  {
    index: 116,
    artist: 'Juice WRLD',
    title: 'Black & White',
    searchQueries: ['Juice WRLD Black & White', 'Juice WRLD Black and White'],
    expectedYear: 2018,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['black & white', 'black and white'],
  },
  {
    index: 117,
    artist: 'Lil Skies',
    title: 'Red Wine & Jodeci',
    searchQueries: ['Lil Skies Red Wine & Jodeci', 'Lil Skies Red Wine and Jodeci'],
    expectedYear: 2021,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['red wine & jodeci', 'red wine and jodeci'],
  },
  {
    index: 118,
    artist: 'Lil Mosey',
    title: 'Sick Today',
    searchQueries: ['Lil Mosey Sick Today'],
    expectedYear: 2022,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil mosey'],
    requiredTitleKeywords: ['sick today'],
  },
  {
    index: 119,
    artist: 'Lil Mosey',
    title: 'Drop Top',
    searchQueries: ['Lil Mosey Drop Top'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil mosey'],
    requiredTitleKeywords: ['drop top'],
  },
  {
    index: 120,
    artist: 'Lil Skies',
    title: 'Breathe',
    searchQueries: ['Lil Skies Breathe'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['breathe'],
  },
  {
    index: 121,
    artist: 'Don Toliver',
    title: 'After Party',
    searchQueries: ['Don Toliver After Party'],
    expectedYear: 2020,
    genreHints: 'hiphop rap trap rnb',
    requiredPrimaryArtist: ['don toliver'],
    requiredTitleKeywords: ['after party'],
  },
  {
    index: 122,
    artist: 'Juice WRLD',
    title: 'Autograph (On My Line)',
    searchQueries: ['Juice WRLD Autograph On My Line', 'Juice WRLD Autograph'],
    expectedYear: 2017,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['autograph'],
    notes: 'Special handling: check for canonical release',
  },
  {
    index: 123,
    artist: 'Lil Uzi Vert',
    title: '20 Min',
    searchQueries: ['Lil Uzi Vert 20 Min'],
    expectedYear: 2017,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil uzi vert'],
    requiredTitleKeywords: ['20 min'],
  },
  {
    index: 124,
    artist: 'Lil Tjay, Offset & Moneybagg Yo',
    title: 'Run It Up',
    searchQueries: ['Lil Tjay Run It Up Offset Moneybagg Yo', 'Lil Tjay Run It Up'],
    expectedYear: 2021,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil tjay'],
    requiredTitleKeywords: ['run it up'],
  },
  {
    index: 125,
    artist: 'Lil Skies',
    title: 'RAGE!',
    searchQueries: ['Lil Skies RAGE!'],
    expectedYear: 2022,
    genreHints: 'hiphop rap trap rage',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['rage!'],
  },
  {
    index: 126,
    artist: 'Lil Mosey',
    title: 'Rocket',
    searchQueries: ['Lil Mosey Rocket'],
    expectedYear: 2023,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil mosey'],
    requiredTitleKeywords: ['rocket'],
  },
  {
    index: 127,
    artist: 'Lil Mosey',
    title: 'Matte Red/Sum He Said',
    searchQueries: ['Lil Mosey Matte Red', 'Lil Mosey Sum He Said'],
    expectedYear: 2022,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil mosey'],
    requiredTitleKeywords: ['matte red', 'sum he said'],
  },
  {
    index: 128,
    artist: 'Lil Uzi Vert',
    title: 'Baby Pluto',
    searchQueries: ['Lil Uzi Vert Baby Pluto'],
    expectedYear: 2020,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil uzi vert'],
    requiredTitleKeywords: ['baby pluto'],
  },
  {
    index: 129,
    artist: 'Suigeneris',
    title: 'Star Player',
    searchQueries: ['Suigeneris Star Player'],
    expectedYear: 2020,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['suigeneris'],
    requiredTitleKeywords: ['star player'],
  },
  {
    index: 130,
    artist: 'Rvssian, Lil Mosey & Lil Tjay',
    title: 'Only The Team',
    searchQueries: ['Rvssian Only The Team Lil Mosey Lil Tjay', 'Rvssian Only The Team'],
    expectedYear: 2020,
    genreHints: 'hiphop rap trap latin',
    requiredPrimaryArtist: ['rvssian', 'lil mosey'],
    requiredTitleKeywords: ['only the team'],
  },
  {
    index: 131,
    artist: 'Landon Cube & Lil Skies',
    title: '17',
    searchQueries: ['Landon Cube 17 Lil Skies', 'Landon Cube 17'],
    expectedYear: 2018,
    genreHints: 'hiphop rap alternative',
    requiredPrimaryArtist: ['landon cube'],
    requiredTitleKeywords: ['17'],
  },
  {
    index: 132,
    artist: 'Lil Uzi Vert',
    title: 'FOR FUN',
    searchQueries: ['Lil Uzi Vert FOR FUN'],
    expectedYear: 2022,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil uzi vert'],
    requiredTitleKeywords: ['for fun'],
  },
  {
    index: 133,
    artist: 'Lil Skies',
    title: 'I Know x XO Tour Llif3 (Mashup)',
    searchQueries: ['Lil Skies I Know x XO Tour Llif3', 'Lil Skies I Know XO Tour Llif3'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap mashup',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['i know'],
    notes: 'Special handling: unofficial mashup check',
  },
  {
    index: 134,
    artist: 'YNW Melly & Lil Uzi Vert',
    title: 'Mind of Melvin',
    searchQueries: ['YNW Melly Mind of Melvin Lil Uzi Vert', 'YNW Melly Mind of Melvin'],
    expectedYear: 2021,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['ynw melly'],
    requiredTitleKeywords: ['mind of melvin'],
  },
  {
    index: 135,
    artist: 'YNW Melly',
    title: 'Melly the Menace',
    searchQueries: ['YNW Melly Melly the Menace'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['ynw melly'],
    requiredTitleKeywords: ['melly the menace'],
  },
  {
    index: 136,
    artist: 'YNW Melly',
    title: 'Murder on My Mind',
    searchQueries: ['YNW Melly Murder on My Mind'],
    expectedYear: 2017,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['ynw melly'],
    requiredTitleKeywords: ['murder on my mind'],
  },
  {
    index: 137,
    artist: 'Tyla Yaweh',
    title: 'High Right Now',
    searchQueries: ['Tyla Yaweh High Right Now'],
    expectedYear: 2019,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['tyla yaweh'],
    requiredTitleKeywords: ['high right now'],
  },
  {
    index: 138,
    artist: 'Tyla Yaweh & French Montana',
    title: 'Salute',
    searchQueries: ['Tyla Yaweh Salute French Montana', 'Tyla Yaweh Salute'],
    expectedYear: 2019,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['tyla yaweh'],
    requiredTitleKeywords: ['salute'],
  },
  {
    index: 139,
    artist: 'Ayo & Teo',
    title: 'Rolex',
    searchQueries: ['Ayo & Teo Rolex', 'Ayo Teo Rolex'],
    expectedYear: 2017,
    genreHints: 'hiphop rap dance trap',
    requiredPrimaryArtist: ['ayo & teo', 'ayo and teo'],
    requiredTitleKeywords: ['rolex'],
  },
  {
    index: 140,
    artist: 'Ayo & Teo',
    title: 'Fly N Ghetto',
    searchQueries: ['Ayo & Teo Fly N Ghetto', 'Ayo Teo Fly N Ghetto'],
    expectedYear: 2019,
    genreHints: 'hiphop rap dance',
    requiredPrimaryArtist: ['ayo & teo', 'ayo and teo'],
    requiredTitleKeywords: ['fly n ghetto', 'fly & ghetto'],
  },
  {
    index: 141,
    artist: 'Ayo & Teo',
    title: 'Bring a Friend',
    searchQueries: ['Ayo & Teo Bring a Friend', 'Ayo Teo Bring a Friend'],
    expectedYear: 2019,
    genreHints: 'hiphop rap dance',
    requiredPrimaryArtist: ['ayo & teo', 'ayo and teo'],
    requiredTitleKeywords: ['bring a friend'],
  },
  {
    index: 142,
    artist: 'Lil Tjay',
    title: 'Go In',
    searchQueries: ['Lil Tjay Go In'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil tjay'],
    requiredTitleKeywords: ['go in'],
  },
  {
    index: 143,
    artist: 'Post Malone',
    title: 'Chemical',
    searchQueries: ['Post Malone Chemical'],
    expectedYear: 2023,
    genreHints: 'pop synthpop alt-pop',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['chemical'],
  },
  {
    index: 144,
    artist: 'Bry Greatah & PnB Rock',
    title: 'No Cap',
    searchQueries: ['Bry Greatah No Cap PnB Rock', 'Bry Greatah No Cap'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['bry greatah'],
    requiredTitleKeywords: ['no cap'],
  },
  {
    index: 145,
    artist: 'Post Malone',
    title: 'Mourning',
    searchQueries: ['Post Malone Mourning'],
    expectedYear: 2023,
    genreHints: 'pop synthpop alt-pop',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['mourning'],
  },
  {
    index: 146,
    artist: 'Bry Greatah',
    title: 'Fear None',
    searchQueries: ['Bry Greatah Fear None'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['bry greatah'],
    requiredTitleKeywords: ['fear none'],
    notes: 'Special handling: check for canonical release',
  },
  {
    index: 147,
    artist: 'Bry Greatah',
    title: 'Gotta Go',
    searchQueries: ['Bry Greatah Gotta Go'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['bry greatah'],
    requiredTitleKeywords: ['gotta go'],
    notes: 'Special handling: check for canonical release',
  },
  {
    index: 148,
    artist: 'Kodak Black',
    title: "Transportin'",
    searchQueries: ["Kodak Black Transportin", "Kodak Black Transportin'"],
    expectedYear: 2017,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['kodak black'],
    requiredTitleKeywords: ['transportin'],
  },
  {
    index: 149,
    artist: 'YNW Melly',
    title: 'Whodie',
    searchQueries: ['YNW Melly Whodie'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['ynw melly'],
    requiredTitleKeywords: ['whodie'],
  },
  {
    index: 150,
    artist: 'Ozuna',
    title: 'El Farsante',
    searchQueries: ['Ozuna El Farsante', 'Ozuna Romeo Santos El Farsante'],
    expectedYear: 2017,
    genreHints: 'latin urban reggaeton',
    requiredPrimaryArtist: ['ozuna'],
    requiredTitleKeywords: ['el farsante'],
  },
  {
    index: 151,
    artist: 'Lil Skies',
    title: 'How Things Go',
    searchQueries: ['Lil Skies How Things Go'],
    expectedYear: 2023,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['how things go'],
  },
  {
    index: 152,
    artist: 'Lil Skies',
    title: 'Wake Up',
    searchQueries: ['Lil Skies Wake Up'],
    expectedYear: 2023,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['wake up'],
  },
  {
    index: 153,
    artist: 'Post Malone',
    title: 'Too Cool To Die',
    searchQueries: ['Post Malone Too Cool To Die'],
    expectedYear: 2023,
    genreHints: 'pop alt-pop',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['too cool to die'],
  },
  {
    index: 154,
    artist: 'Bry Greatah',
    title: 'Hold Your Hand Freestyle',
    searchQueries: ['Bry Greatah Hold Your Hand', 'Bry Greatah Hold Your Hand Freestyle'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['bry greatah'],
    requiredTitleKeywords: ['hold your hand'],
    notes: 'Special handling: check for canonical release',
  },
  {
    index: 155,
    artist: 'Lil Skies',
    title: 'Groupies',
    searchQueries: ['Lil Skies Groupies'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['groupies'],
    notes: 'Special handling: check for canonical release',
  },
  {
    index: 156,
    artist: 'Suigeneris',
    title: 'Sauce',
    searchQueries: ['Suigeneris Sauce'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['suigeneris'],
    requiredTitleKeywords: ['sauce'],
  },
  {
    index: 157,
    artist: 'YNW Melly',
    title: '772 Love',
    searchQueries: ['YNW Melly 772 Love'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['ynw melly'],
    requiredTitleKeywords: ['772 love'],
  },
  {
    index: 158,
    artist: 'Lil Xan',
    title: 'Betrayed',
    searchQueries: ['Lil Xan Betrayed'],
    expectedYear: 2017,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['lil xan'],
    requiredTitleKeywords: ['betrayed'],
  },
  {
    index: 159,
    artist: 'Tyla Yaweh',
    title: 'Who Shot Johnny?',
    searchQueries: ['Tyla Yaweh Who Shot Johnny'],
    expectedYear: 2019,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['tyla yaweh'],
    requiredTitleKeywords: ['who shot johnny'],
  },
  {
    index: 160,
    artist: 'Kodak Black',
    title: 'Tunnel Vision',
    searchQueries: ['Kodak Black Tunnel Vision'],
    expectedYear: 2017,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['kodak black'],
    requiredTitleKeywords: ['tunnel vision'],
  },
  {
    index: 161,
    artist: 'Lyrical Lemonade, Lil Tecca, The Kid LAROI & Lil Skies',
    title: 'This My Life',
    searchQueries: ['Lyrical Lemonade This My Life Lil Tecca The Kid LAROI Lil Skies', 'This My Life Lyrical Lemonade'],
    expectedYear: 2024,
    genreHints: 'hiphop rap trap pop',
    requiredPrimaryArtist: ['lyrical lemonade', 'lil tecca', 'the kid laroi', 'lil skies'],
    requiredTitleKeywords: ['this my life'],
  },
  {
    index: 162,
    artist: 'Lil Skies',
    title: 'THOUSANDS',
    searchQueries: ['Lil Skies THOUSANDS', 'Lil Skies Thousands'],
    expectedYear: 2023,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['thousands'],
  },
  {
    index: 163,
    artist: 'Lil Peep & rainy bear',
    title: 'nuts',
    searchQueries: ['Lil Peep nuts rainy bear', 'Lil Peep nuts'],
    expectedYear: 2015,
    genreHints: 'emo rap alternative hiphop',
    requiredPrimaryArtist: ['lil peep'],
    requiredTitleKeywords: ['nuts'],
  },
  {
    index: 164,
    artist: 'Bry Greatah',
    title: 'Whacky (Original Version)',
    searchQueries: ['Bry Greatah Whacky Original Version', 'Bry Greatah Whacky'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['bry greatah'],
    requiredTitleKeywords: ['whacky'],
  },
  {
    index: 165,
    artist: 'Trippie Redd',
    title: 'Love Scars',
    searchQueries: ['Trippie Redd Love Scars'],
    expectedYear: 2017,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['trippie redd'],
    requiredTitleKeywords: ['love scars'],
  },
  {
    index: 166,
    artist: 'JayDaYoungan & Yungeen Ace',
    title: 'Opps',
    searchQueries: ['JayDaYoungan Opps Yungeen Ace', 'JayDaYoungan Opps'],
    expectedYear: 2020,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['jaydayoungan'],
    requiredTitleKeywords: ['opps'],
  },
  {
    index: 167,
    artist: 'JayDaYoungan',
    title: 'Elimination',
    searchQueries: ['JayDaYoungan Elimination'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['jaydayoungan'],
    requiredTitleKeywords: ['elimination'],
  },
  {
    index: 168,
    artist: 'XXXTENTACION',
    title: 'Hope',
    searchQueries: ['XXXTENTACION Hope'],
    expectedYear: 2018,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['xxxtentacion'],
    requiredTitleKeywords: ['hope'],
  },
  {
    index: 169,
    artist: 'XXXTENTACION',
    title: 'Moonlight',
    searchQueries: ['XXXTENTACION Moonlight'],
    expectedYear: 2018,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['xxxtentacion'],
    requiredTitleKeywords: ['moonlight'],
  },
  {
    index: 170,
    artist: 'Yung Pinch',
    title: '714Ever',
    searchQueries: ['Yung Pinch 714Ever'],
    expectedYear: 2017,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['yung pinch'],
    requiredTitleKeywords: ['714ever'],
  },
  {
    index: 171,
    artist: 'Yung Pinch',
    title: 'Here We Go Again',
    searchQueries: ['Yung Pinch Here We Go Again'],
    expectedYear: 2019,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['yung pinch'],
    requiredTitleKeywords: ['here we go again'],
  },
  {
    index: 172,
    artist: 'Yung Pinch',
    title: 'My Friends, Not Yours',
    searchQueries: ['Yung Pinch My Friends Not Yours', 'Yung Pinch My Friends, Not Yours'],
    expectedYear: 2019,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['yung pinch'],
    requiredTitleKeywords: ['my friends'],
  },
  {
    index: 173,
    artist: 'Bry Greatah',
    title: 'Whacky',
    searchQueries: ['Bry Greatah Whacky'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['bry greatah'],
    requiredTitleKeywords: ['whacky'],
  },
  {
    index: 174,
    artist: 'Yung Pinch',
    title: 'Sober',
    searchQueries: ['Yung Pinch Sober'],
    expectedYear: 2019,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['yung pinch'],
    requiredTitleKeywords: ['sober'],
  },
  {
    index: 175,
    artist: 'Yung Pinch & G-Eazy',
    title: 'Why Would I Wait',
    searchQueries: ['Yung Pinch Why Would I Wait G-Eazy', 'Yung Pinch Why Would I Wait'],
    expectedYear: 2018,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['yung pinch'],
    requiredTitleKeywords: ['why would i wait'],
  },
  {
    index: 176,
    artist: 'Wiz Khalifa & Lil Skies',
    title: 'Fr Fr',
    searchQueries: ['Wiz Khalifa Fr Fr Lil Skies', 'Wiz Khalifa Fr Fr'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['wiz khalifa'],
    requiredTitleKeywords: ['fr fr', 'frfr'],
  },
  {
    index: 177,
    artist: 'Wiz Khalifa & Swae Lee',
    title: 'Hopeless Romantic',
    searchQueries: ['Wiz Khalifa Hopeless Romantic Swae Lee', 'Wiz Khalifa Hopeless Romantic'],
    expectedYear: 2018,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['wiz khalifa'],
    requiredTitleKeywords: ['hopeless romantic'],
  },
  {
    index: 178,
    artist: 'Wiz Khalifa',
    title: 'Black and Yellow',
    searchQueries: ['Wiz Khalifa Black and Yellow', 'Wiz Khalifa Black & Yellow'],
    expectedYear: 2010,
    genreHints: 'hiphop rap',
    requiredPrimaryArtist: ['wiz khalifa'],
    requiredTitleKeywords: ['black and yellow', 'black & yellow'],
  },
  {
    index: 179,
    artist: 'Juice WRLD',
    title: 'Burn',
    searchQueries: ['Juice WRLD Burn Fighting Demons', 'Juice WRLD Burn'],
    expectedYear: 2021,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['burn'],
  },
  {
    index: 180,
    artist: 'Juice WRLD',
    title: 'Empty Out Your Pockets',
    searchQueries: ['Juice WRLD Empty Out Your Pockets', 'Juice WRLD Empty Out Your Pockets The Party Never Ends'],
    expectedYear: 2024,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['empty out your pockets', 'empty out ur pockets'],
  },
  {
    index: 181,
    artist: 'Juice WRLD',
    title: 'Spend It',
    searchQueries: ['Juice WRLD Spend It', 'Juice WRLD Spend It The Party Never Ends'],
    expectedYear: 2024,
    genreHints: 'hiphop rap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['spend it'],
  },
  {
    index: 182,
    artist: 'Lil Skies',
    title: 'High Maintenance',
    searchQueries: ['Lil Skies High Maintenance'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['high maintenance'],
  },
  {
    index: 183,
    artist: 'Lil Loaded',
    title: '6locc 6a6y',
    searchQueries: ['Lil Loaded 6locc 6a6y', 'Lil Loaded 6locc 6aby', 'Lil Loaded 6block 6aby'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil loaded'],
    requiredTitleKeywords: ['6locc 6a6y', '6locc 6aby'],
  },
  {
    index: 184,
    artist: 'iann dior & Lil Skies',
    title: 'Halo',
    searchQueries: ['iann dior Halo Lil Skies', 'iann dior Halo'],
    expectedYear: 2019,
    genreHints: 'hiphop rap emo rap pop',
    requiredPrimaryArtist: ['iann dior'],
    requiredTitleKeywords: ['halo'],
  },
  {
    index: 185,
    artist: 'YNW Melly',
    title: 'Gang',
    searchQueries: ['YNW Melly Gang'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['ynw melly'],
    requiredTitleKeywords: ['gang'],
  },
  {
    index: 186,
    artist: 'YNW Melly',
    title: 'Butter Pecan',
    searchQueries: ['YNW Melly Butter Pecan'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['ynw melly'],
    requiredTitleKeywords: ['butter pecan'],
  },
  {
    index: 187,
    artist: 'YNW Juvy',
    title: 'Tissue',
    searchQueries: ['YNW Juvy Tissue', 'YNW Melly Tissue', 'YNW Juvy Tissue YNW Melly'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['ynw juvy', 'ynw melly'],
    requiredTitleKeywords: ['tissue'],
  },
  {
    index: 188,
    artist: 'YNW Melly',
    title: 'Slang That Iron',
    searchQueries: ['YNW Melly Slang That Iron'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['ynw melly'],
    requiredTitleKeywords: ['slang that iron'],
  },
  {
    index: 189,
    artist: 'YNW Melly',
    title: 'Hold Up (Wait 1 Min)',
    searchQueries: ['YNW Melly Hold Up Wait 1 Min', 'YNW Melly Hold Up'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['ynw melly'],
    requiredTitleKeywords: ['hold up'],
  },
  {
    index: 190,
    artist: 'YNW Juvy & YNW Duwap',
    title: 'Trap Getting Money',
    searchQueries: ['YNW Juvy Trap Getting Money YNW Duwap', 'YNW Juvy Trap Getting Money'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['ynw juvy'],
    requiredTitleKeywords: ['trap getting money'],
  },
  {
    index: 191,
    artist: 'Rich The Kid & Famous Dex',
    title: 'New Wave',
    searchQueries: ['Rich The Kid New Wave Famous Dex', 'Rich The Kid New Wave'],
    expectedYear: 2016,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['rich the kid'],
    requiredTitleKeywords: ['new wave'],
    notes: 'Special handling: check for canonical release',
  },
  {
    index: 192,
    artist: 'Yungeen Ace & JayDaYoungan',
    title: 'Jungle',
    searchQueries: ['Yungeen Ace Jungle JayDaYoungan', 'Yungeen Ace Jungle'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['yungeen ace'],
    requiredTitleKeywords: ['jungle'],
  },
  {
    index: 193,
    artist: 'Foolio',
    title: "Can't Stop",
    searchQueries: ["Foolio Can't Stop", "Foolio Cant Stop"],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['foolio'],
    requiredTitleKeywords: ["can't stop", "cant stop"],
    notes: 'Special handling: check for canonical release',
  },
  {
    index: 194,
    artist: 'Foolio',
    title: 'Voo Doo',
    searchQueries: ['Foolio Voo Doo', 'Foolio Voodoo'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['foolio'],
    requiredTitleKeywords: ['voo doo', 'voodoo'],
  },
  {
    index: 195,
    artist: 'Lil Skies & Landon Cube',
    title: 'Burn',
    searchQueries: ['Lil Skies Burn Landon Cube', 'Lil Skies Burn'],
    expectedYear: 2021,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['burn'],
  },
  {
    index: 196,
    artist: 'Lil Skies',
    title: 'Benjis',
    searchQueries: ['Lil Skies Benjis'],
    expectedYear: 2021,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil skies'],
    requiredTitleKeywords: ['benjis'],
  },
  {
    index: 197,
    artist: 'Famous Dex & MadeinTYO',
    title: 'Wit Yo Bitch (Remix)',
    searchQueries: ['Famous Dex Wit Yo Bitch Remix MadeinTYO', 'Famous Dex Wit Yo Bitch Remix', 'Famous Dex Wit Yo Bitch'],
    expectedYear: 2016,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['famous dex'],
    requiredTitleKeywords: ['wit yo bitch', 'with your bitch'],
    isRemix: true,
  },
  {
    index: 198,
    artist: 'Kevin Gates',
    title: '2 Phones',
    searchQueries: ['Kevin Gates 2 Phones'],
    expectedYear: 2015,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['kevin gates'],
    requiredTitleKeywords: ['2 phones', 'two phones'],
  },
  {
    index: 199,
    artist: 'EsDeeKid & Rico Ace',
    title: 'Phantom',
    searchQueries: ['EsDeeKid Phantom Rico Ace', 'EsDeeKid Phantom'],
    expectedYear: 2023,
    genreHints: 'hiphop rap drill',
    requiredPrimaryArtist: ['esdeekid'],
    requiredTitleKeywords: ['phantom'],
  },
  {
    index: 200,
    artist: 'EsDeeKid',
    title: '4 Raws',
    searchQueries: ['EsDeeKid 4 Raws'],
    expectedYear: 2024,
    genreHints: 'hiphop rap drill',
    requiredPrimaryArtist: ['esdeekid'],
    requiredTitleKeywords: ['4 raws', 'four raws'],
  },
  {
    index: 201,
    artist: 'Rae Sremmurd',
    title: 'Swang',
    searchQueries: ['Rae Sremmurd Swang'],
    expectedYear: 2016,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['rae sremmurd'],
    requiredTitleKeywords: ['swang'],
  },
  {
    index: 202,
    artist: 'Lil Peep',
    title: 'Star Shopping',
    searchQueries: ['Lil Peep Star Shopping'],
    expectedYear: 2015,
    genreHints: 'emo rap alternative hiphop',
    requiredPrimaryArtist: ['lil peep'],
    requiredTitleKeywords: ['star shopping'],
  },
  {
    index: 203,
    artist: 'Lil Peep',
    title: '16 Lines',
    searchQueries: ['Lil Peep 16 Lines'],
    expectedYear: 2018,
    genreHints: 'emo rap alternative hiphop',
    requiredPrimaryArtist: ['lil peep'],
    requiredTitleKeywords: ['16 lines'],
  },
  {
    index: 204,
    artist: 'Lil Peep',
    title: 'haunt u',
    searchQueries: ['Lil Peep haunt u', 'Lil Peep haunt you'],
    expectedYear: 2015,
    genreHints: 'emo rap alternative hiphop',
    requiredPrimaryArtist: ['lil peep'],
    requiredTitleKeywords: ['haunt u', 'haunt you'],
  },
  {
    index: 205,
    artist: 'Lil Uzi Vert & Pharrell Williams',
    title: 'Neon Guts',
    searchQueries: ['Lil Uzi Vert Neon Guts Pharrell Williams', 'Lil Uzi Vert Neon Guts'],
    expectedYear: 2017,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil uzi vert'],
    requiredTitleKeywords: ['neon guts'],
  },
  {
    index: 206,
    artist: 'Lil Uzi Vert',
    title: 'SideLine Watching (Hold Up)',
    searchQueries: ['Lil Uzi Vert SideLine Watching Hold Up', 'Lil Uzi Vert SideLine Watching'],
    expectedYear: 2016,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil uzi vert'],
    requiredTitleKeywords: ['sideline watching'],
  },
  {
    index: 207,
    artist: 'Lil Uzi Vert',
    title: 'What You Saying',
    searchQueries: ['Lil Uzi Vert What You Saying'],
    expectedYear: 2022,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil uzi vert'],
    requiredTitleKeywords: ['what you saying'],
  },
  {
    index: 208,
    artist: 'Lil Peep & Lil Tracy',
    title: 'witchblades',
    searchQueries: ['Lil Peep witchblades Lil Tracy', 'Lil Peep witchblades'],
    expectedYear: 2017,
    genreHints: 'emo rap alternative hiphop',
    requiredPrimaryArtist: ['lil peep'],
    requiredTitleKeywords: ['witchblades'],
  },
  {
    index: 209,
    artist: 'Lil Uzi Vert',
    title: 'Do What I Want',
    searchQueries: ['Lil Uzi Vert Do What I Want'],
    expectedYear: 2016,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil uzi vert'],
    requiredTitleKeywords: ['do what i want'],
  },
  {
    index: 210,
    artist: 'Lil Peep',
    title: 'Benz Truck (гелик)',
    searchQueries: ['Lil Peep Benz Truck', 'Lil Peep Benz Truck гелик'],
    expectedYear: 2017,
    genreHints: 'emo rap alternative hiphop',
    requiredPrimaryArtist: ['lil peep'],
    requiredTitleKeywords: ['benz truck'],
  },
];

function normalizeStr(s: string): string {
  if (!s) return '';
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function testAudioPlayable(url: string): Promise<boolean> {
  if (!url || !url.startsWith('http')) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-8192' },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.status === 200 || res.status === 206) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function fetchItunesCandidates(query: string): Promise<any[]> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
      query
    )}&entity=song&limit=15`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Melodex-Importer/1.0' } });
    if (!res.ok) return [];
    const data = (await res.json()) as any;
    return data.results || [];
  } catch (err) {
    console.error(`iTunes search error for "${query}":`, err);
    return [];
  }
}

async function fetchDeezerCandidates(query: string): Promise<any[]> {
  try {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=10`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as any;
    return (data.data || []).map((d: any) => ({
      trackId: d.id,
      trackName: d.title,
      artistName: d.artist?.name || '',
      collectionName: d.album?.title || '',
      artworkUrl100: d.album?.cover_medium || d.album?.cover || '',
      previewUrl: d.preview,
      primaryGenreName: 'Hip-Hop/Rap',
      provider: 'deezer',
    }));
  } catch (err) {
    console.error(`Deezer search error for "${query}":`, err);
    return [];
  }
}

function doesMatchSpec(item: any, spec: TrackSpec): boolean {
  const trackName = normalizeStr(item.trackName || '');
  const artistName = normalizeStr(item.artistName || '');

  // 1. Primary artist match
  const artistMatches = spec.requiredPrimaryArtist.some((artist) => {
    const normReq = normalizeStr(artist);
    return artistName.includes(normReq) || normReq.includes(artistName);
  });
  if (!artistMatches) return false;

  // 2. Title keywords
  const titleMatches = spec.requiredTitleKeywords.some((kw) => {
    const normKw = normalizeStr(kw);
    return trackName.includes(normKw);
  });
  if (!titleMatches) return false;

  // 3. Forbidden keywords
  if (spec.forbiddenTitleKeywords) {
    const hasForbidden = spec.forbiddenTitleKeywords.some((fKw) => {
      const normF = normalizeStr(fKw);
      return trackName.includes(normF) || artistName.includes(normF);
    });
    if (hasForbidden) return false;
  }

  // 4. Karaoke / Tribute / Cover filter
  const badMarkers = [
    'tribute',
    'karaoke',
    'instrumental',
    'made famous by',
    'in the style of',
    'cover version',
    'ringtone',
    're-recorded',
  ];
  for (const marker of badMarkers) {
    if (trackName.includes(marker) || artistName.includes(marker)) {
      return false;
    }
  }

  // 5. Remix handling
  if (!spec.isRemix) {
    if (trackName.includes('remix') || trackName.includes('club mix') || trackName.includes('dub mix')) {
      return false;
    }
  }

  return true;
}

async function run() {
  const catalogPath = path.resolve(process.cwd(), 'src/data/melodexCatalog.json');
  console.log(`Loading catalog from ${catalogPath}...`);
  const rawData = fs.readFileSync(catalogPath, 'utf8');
  const catalog: Song[] = JSON.parse(rawData);
  console.log(`Current catalog contains ${catalog.length} songs.`);

  let alreadyPresentCount = 0;
  let successfullyAddedCount = 0;
  let successfullyRepairedCount = 0;
  let identityMismatchCount = 0;
  let audioFailureCount = 0;
  let unavailableCount = 0;

  const rejectedList: { index: number; song: string; reason: string }[] = [];
  const processedReport: string[] = [];

  for (const spec of TRACKS_TO_PROCESS) {
    const displayName = `${spec.index}. ${spec.artist} — ${spec.title}`;
    console.log(`\nProcessing [${displayName}]...`);

    // 1. Check if song already exists in catalog
    const existingIndex = catalog.findIndex((s) => {
      const sTitle = normalizeStr(s.title);
      const sArtist = normalizeStr(s.artist);

      const artistMatch = spec.requiredPrimaryArtist.some((a) => {
        const nA = normalizeStr(a);
        return sArtist.includes(nA) || nA.includes(sArtist);
      });
      const titleMatch = spec.requiredTitleKeywords.some((kw) => {
        const nKw = normalizeStr(kw);
        return sTitle.includes(nKw);
      });

      if (spec.forbiddenTitleKeywords) {
        const hasForbidden = spec.forbiddenTitleKeywords.some((f) => {
          return sTitle.includes(normalizeStr(f)) || sArtist.includes(normalizeStr(f));
        });
        if (hasForbidden) return false;
      }

      if (!spec.isRemix && sTitle.includes('remix')) return false;

      return artistMatch && titleMatch;
    });

    if (existingIndex !== -1) {
      const existing = catalog[existingIndex];
      console.log(`  Found existing catalog entry: "${existing.title}" by "${existing.artist}" (ID: ${existing.id})`);

      const isAudioPlayable = await testAudioPlayable(existing.previewUrl);
      if (isAudioPlayable) {
        let neededRepair = false;
        if (existing.year !== spec.expectedYear || existing.verifiedOriginalYear !== spec.expectedYear) {
          existing.year = spec.expectedYear;
          existing.verifiedOriginalYear = spec.expectedYear;
          existing.yearConfidence = 'high';
          neededRepair = true;
        }

        const normGenres = computeNormalizedGenres(
          `${existing.genre || ''} ${spec.genreHints}`,
          existing.artist,
          existing.title,
          existing.album
        );
        if (!existing.normalizedGenres || existing.normalizedGenres.length === 0) {
          existing.normalizedGenres = normGenres;
          neededRepair = true;
        }

        existing.audioStatus = 'healthy';
        existing.audioValidatedAt = Date.now();
        existing.trackIdentityVerified = true;

        if (neededRepair) {
          successfullyRepairedCount++;
          console.log(`  -> Repaired metadata & verified healthy audio.`);
          processedReport.push(`[REPAIRED] ${displayName}`);
        } else {
          alreadyPresentCount++;
          console.log(`  -> Already present and healthy.`);
          processedReport.push(`[ALREADY_PRESENT] ${displayName}`);
        }
        continue;
      } else {
        console.log(`  Existing previewUrl is dead or failing. Attempting to repair via fresh candidate...`);
      }
    }

    // Special handling check for unreleased/unofficial filenames
    if (spec.notes?.includes('unofficial') || spec.notes?.includes('Special handling')) {
      console.log(`  Note: ${spec.notes}`);
    }

    // 2. Fetch candidates from iTunes and Deezer
    let matchedCandidate: any = null;
    let foundIdentityMismatch = false;
    let foundAudioDead = false;

    for (const q of spec.searchQueries) {
      const itunesResults = await fetchItunesCandidates(q);
      for (const item of itunesResults) {
        if (doesMatchSpec(item, spec)) {
          if (item.previewUrl) {
            const playable = await testAudioPlayable(item.previewUrl);
            if (playable) {
              matchedCandidate = item;
              break;
            } else {
              foundAudioDead = true;
            }
          }
        } else {
          // If title matched loosely but artist was wrong, record mismatch possibility
          const normTrack = normalizeStr(item.trackName || '');
          if (spec.requiredTitleKeywords.some(kw => normTrack.includes(normalizeStr(kw)))) {
            foundIdentityMismatch = true;
          }
        }
      }
      if (matchedCandidate) break;
    }

    if (!matchedCandidate) {
      for (const q of spec.searchQueries) {
        const deezerResults = await fetchDeezerCandidates(q);
        for (const item of deezerResults) {
          if (doesMatchSpec(item, spec)) {
            if (item.previewUrl) {
              const playable = await testAudioPlayable(item.previewUrl);
              if (playable) {
                matchedCandidate = item;
                break;
              } else {
                foundAudioDead = true;
              }
            }
          }
        }
        if (matchedCandidate) break;
      }
    }

    if (!matchedCandidate) {
      if (spec.notes?.includes('mashup')) {
        console.log(`  ❌ Rejected: Unofficial mashup not available via official streaming providers.`);
        unavailableCount++;
        rejectedList.push({
          index: spec.index,
          song: `${spec.artist} — ${spec.title}`,
          reason: 'Unofficial mashup not available via official licensed streaming provider',
        });
      } else if (foundAudioDead) {
        console.log(`  ❌ Rejected: Candidate found but audio preview failed playback verification.`);
        audioFailureCount++;
        rejectedList.push({
          index: spec.index,
          song: `${spec.artist} — ${spec.title}`,
          reason: 'Audio stream preview URL failed HTTP playback verification',
        });
      } else if (foundIdentityMismatch) {
        console.log(`  ❌ Rejected: Candidates returned failed strict artist/track identity verification.`);
        identityMismatchCount++;
        rejectedList.push({
          index: spec.index,
          song: `${spec.artist} — ${spec.title}`,
          reason: 'Track identity mismatch (karaoke/cover or different artist release)',
        });
      } else {
        console.log(`  ❌ Rejected: No matching recording found on iTunes / Deezer providers.`);
        unavailableCount++;
        rejectedList.push({
          index: spec.index,
          song: `${spec.artist} — ${spec.title}`,
          reason: 'No matching track found on streaming providers (unreleased / unofficial leak)',
        });
      }
      continue;
    }

    // 3. Add or repair song
    const cleanArtwork = (matchedCandidate.artworkUrl100 || matchedCandidate.artworkUrl60 || '')
      .replace('100x100bb', '600x600bb')
      .replace('60x60bb', '600x600bb');

    const normGenres = computeNormalizedGenres(
      `${matchedCandidate.primaryGenreName || ''} ${spec.genreHints}`,
      matchedCandidate.artistName,
      matchedCandidate.trackName,
      matchedCandidate.collectionName
    );

    const songId = String(matchedCandidate.trackId || Date.now());

    if (existingIndex !== -1) {
      catalog[existingIndex] = {
        ...catalog[existingIndex],
        id: songId,
        title: matchedCandidate.trackName || spec.title,
        artist: matchedCandidate.artistName || spec.artist,
        album: matchedCandidate.collectionName || catalog[existingIndex].album,
        year: spec.expectedYear,
        verifiedOriginalYear: spec.expectedYear,
        yearConfidence: 'high',
        genre: matchedCandidate.primaryGenreName || catalog[existingIndex].genre,
        normalizedGenres: normGenres,
        artworkUrl: cleanArtwork || catalog[existingIndex].artworkUrl,
        previewUrl: matchedCandidate.previewUrl,
        provider: 'itunes',
        providerTrackId: songId,
        trackIdentityVerified: true,
        audioStatus: 'healthy',
        audioValidatedAt: Date.now(),
      };
      successfullyRepairedCount++;
      console.log(`  -> Successfully repaired song with working verified audio!`);
      processedReport.push(`[REPAIRED] ${displayName}`);
    } else {
      const newSong: Song = {
        id: songId,
        title: matchedCandidate.trackName || spec.title,
        artist: matchedCandidate.artistName || spec.artist,
        album: matchedCandidate.collectionName || '',
        year: spec.expectedYear,
        verifiedOriginalYear: spec.expectedYear,
        yearConfidence: 'high',
        genre: matchedCandidate.primaryGenreName || '',
        normalizedGenres: normGenres,
        artworkUrl: cleanArtwork,
        previewUrl: matchedCandidate.previewUrl,
        provider: 'itunes',
        providerTrackId: songId,
        trackIdentityVerified: true,
        audioStatus: 'healthy',
        audioValidatedAt: Date.now(),
      };
      catalog.push(newSong);
      successfullyAddedCount++;
      console.log(`  -> Successfully added new song with verified playable audio! (ID: ${newSong.id})`);
      processedReport.push(`[ADDED] ${displayName}`);
    }
  }

  // Deduplicate catalog
  const uniqueCatalog: Song[] = [];
  const seenIds = new Set<string>();
  const seenArtistTitle = new Set<string>();

  for (const s of catalog) {
    if (seenIds.has(s.id)) continue;
    const key = `${normalizeStr(s.artist)}:::${normalizeStr(s.title)}`;
    if (seenArtistTitle.has(key)) continue;
    seenIds.add(s.id);
    seenArtistTitle.add(key);
    uniqueCatalog.push(s);
  }

  console.log(`\nFinal unique catalog size: ${uniqueCatalog.length} songs.`);
  fs.writeFileSync(catalogPath, JSON.stringify(uniqueCatalog, null, 2), 'utf8');
  console.log(`Saved updated catalog to ${catalogPath}`);

  // Also update melodexCatalog.ts comment / export
  const tsContent = `// Auto-generated Melodex verified base catalog (${uniqueCatalog.length} tracks)\nimport { Song } from '../types/song';\nimport rawCatalog from './melodexCatalog.json';\n\nexport const MELODEX_BASE_CATALOG: Song[] = rawCatalog as Song[];\n`;
  fs.writeFileSync(path.resolve(process.cwd(), 'src/data/melodexCatalog.ts'), tsContent, 'utf8');

  // Also update melodex-catalog.json if present
  const altCatalogPath = path.resolve(process.cwd(), 'src/data/melodex-catalog.json');
  if (fs.existsSync(altCatalogPath)) {
    fs.writeFileSync(altCatalogPath, JSON.stringify(uniqueCatalog, null, 2), 'utf8');
  }

  console.log('\n================ FINAL IMPORT REPORT ================');
  console.log(`New requested tracks processed: ${TRACKS_TO_PROCESS.length}`);
  console.log(`Already present: ${alreadyPresentCount}`);
  console.log(`Successfully added: ${successfullyAddedCount}`);
  console.log(`Successfully repaired: ${successfullyRepairedCount}`);
  console.log(`Unavailable/skipped: ${unavailableCount}`);
  console.log(`Identity mismatch rejected: ${identityMismatchCount}`);
  console.log(`Audio failure rejected: ${audioFailureCount}`);

  if (rejectedList.length > 0) {
    console.log('\n--- UNAVAILABLE / REJECTED SONGS ---');
    rejectedList.forEach((r) => {
      console.log(`${r.index}. ${r.song} -> ${r.reason}`);
    });
  }
}

run().catch(console.error);
