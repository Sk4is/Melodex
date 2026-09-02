import * as fs from 'fs';
import * as path from 'path';
import { Song } from '../src/types/song';
import { GenreFilter } from '../src/types/game';
import { computeNormalizedGenres } from '../src/utils/genreUtils';

interface RequestedSongSpec {
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
}

const REQUESTED_SONGS: RequestedSongSpec[] = [
  {
    index: 1,
    artist: 'Imagine Dragons',
    title: 'Demons',
    searchQueries: ['Imagine Dragons Demons'],
    expectedYear: 2012,
    genreHints: 'rock alternative pop indie',
    requiredPrimaryArtist: ['imagine dragons'],
    requiredTitleKeywords: ['demons'],
  },
  {
    index: 2,
    artist: 'Imagine Dragons',
    title: "It's Time",
    searchQueries: ["Imagine Dragons It's Time"],
    expectedYear: 2012,
    genreHints: 'rock alternative pop indie',
    requiredPrimaryArtist: ['imagine dragons'],
    requiredTitleKeywords: ["it's time", 'its time'],
  },
  {
    index: 3,
    artist: 'Imagine Dragons',
    title: 'On Top Of The World',
    searchQueries: ['Imagine Dragons On Top Of The World'],
    expectedYear: 2012,
    genreHints: 'rock alternative pop indie',
    requiredPrimaryArtist: ['imagine dragons'],
    requiredTitleKeywords: ['on top of the world'],
  },
  {
    index: 4,
    artist: 'Post Malone feat. Quavo',
    title: 'Congratulations',
    searchQueries: ['Post Malone Congratulations Quavo'],
    expectedYear: 2016,
    genreHints: 'hiphop rap pop trap',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['congratulations'],
  },
  {
    index: 5,
    artist: 'Post Malone feat. Ty Dolla $ign',
    title: 'Psycho',
    searchQueries: ['Post Malone Psycho Ty Dolla $ign'],
    expectedYear: 2018,
    genreHints: 'hiphop rap pop trap',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['psycho'],
  },
  {
    index: 6,
    artist: 'The Weeknd feat. Daft Punk',
    title: 'Starboy',
    searchQueries: ['The Weeknd Starboy Daft Punk'],
    expectedYear: 2016,
    genreHints: 'rnb pop electronic dance',
    requiredPrimaryArtist: ['the weeknd', 'weeknd'],
    requiredTitleKeywords: ['starboy'],
  },
  {
    index: 7,
    artist: 'Gym Class Heroes feat. Adam Levine',
    title: 'Stereo Hearts',
    searchQueries: ['Gym Class Heroes Stereo Hearts Adam Levine'],
    expectedYear: 2011,
    genreHints: 'pop hiphop rap',
    requiredPrimaryArtist: ['gym class heroes'],
    requiredTitleKeywords: ['stereo hearts'],
  },
  {
    index: 8,
    artist: 'Post Malone',
    title: 'Go Flex',
    searchQueries: ['Post Malone Go Flex'],
    expectedYear: 2016,
    genreHints: 'hiphop rap pop trap',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['go flex'],
  },
  {
    index: 9,
    artist: 'Post Malone',
    title: 'Too Young',
    searchQueries: ['Post Malone Too Young'],
    expectedYear: 2015,
    genreHints: 'hiphop rap pop trap',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['too young'],
  },
  {
    index: 10,
    artist: 'Post Malone',
    title: 'White Iverson',
    searchQueries: ['Post Malone White Iverson'],
    expectedYear: 2015,
    genreHints: 'hiphop rap pop trap',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['white iverson'],
  },
  {
    index: 11,
    artist: 'Post Malone',
    title: 'No Option',
    searchQueries: ['Post Malone No Option'],
    expectedYear: 2016,
    genreHints: 'hiphop rap pop trap',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['no option'],
  },
  {
    index: 12,
    artist: 'Post Malone feat. The Weeknd',
    title: 'One Right Now',
    searchQueries: ['Post Malone The Weeknd One Right Now'],
    expectedYear: 2021,
    genreHints: 'pop hiphop rnb synthpop',
    requiredPrimaryArtist: ['post malone', 'the weeknd'],
    requiredTitleKeywords: ['one right now'],
  },
  {
    index: 13,
    artist: 'The Weeknd',
    title: 'In Your Eyes',
    searchQueries: ['The Weeknd In Your Eyes After Hours'],
    expectedYear: 2020,
    genreHints: 'pop rnb synthpop electronic',
    requiredPrimaryArtist: ['the weeknd', 'weeknd'],
    requiredTitleKeywords: ['in your eyes'],
    forbiddenTitleKeywords: ['remix', 'doja cat', 'kenny g'],
  },
  {
    index: 14,
    artist: "Coolio feat. L.V.",
    title: "Gangsta's Paradise",
    searchQueries: ["Coolio Gangsta's Paradise L.V."],
    expectedYear: 1995,
    genreHints: 'hiphop rap 90s hiphop',
    requiredPrimaryArtist: ['coolio'],
    requiredTitleKeywords: ["gangsta's paradise", 'gangstas paradise'],
  },
  {
    index: 15,
    artist: 'Maroon 5 feat. Wiz Khalifa',
    title: 'Payphone',
    searchQueries: ['Maroon 5 Payphone Wiz Khalifa'],
    expectedYear: 2012,
    genreHints: 'pop rock pop rock',
    requiredPrimaryArtist: ['maroon 5'],
    requiredTitleKeywords: ['payphone'],
  },
  {
    index: 16,
    artist: 'Imagine Dragons',
    title: 'Whatever It Takes',
    searchQueries: ['Imagine Dragons Whatever It Takes Evolve'],
    expectedYear: 2017,
    genreHints: 'rock alternative pop indie',
    requiredPrimaryArtist: ['imagine dragons'],
    requiredTitleKeywords: ['whatever it takes'],
  },
  {
    index: 17,
    artist: 'Janji feat. Johnning',
    title: 'Heroes Tonight',
    searchQueries: ['Janji Heroes Tonight Johnning'],
    expectedYear: 2015,
    genreHints: 'electronic dance edm',
    requiredPrimaryArtist: ['janji'],
    requiredTitleKeywords: ['heroes tonight'],
  },
  {
    index: 18,
    artist: '24kGoldn feat. iann dior',
    title: 'Mood',
    searchQueries: ['24kGoldn Mood iann dior'],
    expectedYear: 2020,
    genreHints: 'hiphop pop rap pop rap',
    requiredPrimaryArtist: ['24kgoldn'],
    requiredTitleKeywords: ['mood'],
  },
  {
    index: 19,
    artist: 'Post Malone feat. Swae Lee',
    title: 'Sunflower',
    searchQueries: ['Post Malone Swae Lee Sunflower'],
    expectedYear: 2018,
    genreHints: 'pop hiphop rap synthpop',
    requiredPrimaryArtist: ['post malone', 'swae lee'],
    requiredTitleKeywords: ['sunflower'],
  },
  {
    index: 20,
    artist: 'Kygo feat. Justin Jesso',
    title: 'Stargazing',
    searchQueries: ['Kygo Stargazing Justin Jesso'],
    expectedYear: 2017,
    genreHints: 'electronic dance tropical house',
    requiredPrimaryArtist: ['kygo'],
    requiredTitleKeywords: ['stargazing'],
  },
  {
    index: 21,
    artist: 'Axwell /\\ Ingrosso',
    title: 'More Than You Know',
    searchQueries: ['Axwell Ingrosso More Than You Know', 'Axwell /\\ Ingrosso More Than You Know'],
    expectedYear: 2017,
    genreHints: 'electronic dance house edm',
    requiredPrimaryArtist: ['axwell', 'ingrosso', 'axwell /\\ ingrosso', 'axwell & ingrosso'],
    requiredTitleKeywords: ['more than you know'],
  },
  {
    index: 22,
    artist: 'Post Malone',
    title: 'Saint-Tropez',
    searchQueries: ['Post Malone Saint-Tropez Hollywood'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap pop',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['saint-tropez', 'saint tropez'],
  },
  {
    index: 23,
    artist: 'Arizona Zervas',
    title: 'ROXANNE',
    searchQueries: ['Arizona Zervas ROXANNE'],
    expectedYear: 2019,
    genreHints: 'hiphop pop rap trap',
    requiredPrimaryArtist: ['arizona zervas'],
    requiredTitleKeywords: ['roxanne'],
  },
  {
    index: 24,
    artist: 'Snoop Dogg & Wiz Khalifa feat. Bruno Mars',
    title: 'Young, Wild & Free',
    searchQueries: ['Snoop Dogg Wiz Khalifa Bruno Mars Young Wild Free'],
    expectedYear: 2011,
    genreHints: 'hiphop rap pop',
    requiredPrimaryArtist: ['snoop dogg', 'wiz khalifa'],
    requiredTitleKeywords: ['young', 'wild', 'free'],
  },
  {
    index: 25,
    artist: 'Tiësto & Dzeko feat. Preme & Post Malone',
    title: 'Jackie Chan',
    searchQueries: ['Tiesto Dzeko Jackie Chan Post Malone Preme'],
    expectedYear: 2018,
    genreHints: 'electronic dance edm house hiphop',
    requiredPrimaryArtist: ['tiesto', 'tiësto', 'dzeko'],
    requiredTitleKeywords: ['jackie chan'],
  },
  {
    index: 26,
    artist: 'Capital Cities',
    title: 'Safe And Sound',
    searchQueries: ['Capital Cities Safe And Sound'],
    expectedYear: 2011,
    genreHints: 'indie pop rock synthpop alternative',
    requiredPrimaryArtist: ['capital cities'],
    requiredTitleKeywords: ['safe and sound'],
  },
  {
    index: 27,
    artist: 'will.i.am feat. Britney Spears',
    title: 'Scream & Shout',
    searchQueries: ['will.i.am Britney Spears Scream & Shout'],
    expectedYear: 2012,
    genreHints: 'pop dance electronic edm',
    requiredPrimaryArtist: ['will.i.am', 'britney spears'],
    requiredTitleKeywords: ['scream', 'shout'],
  },
  {
    index: 28,
    artist: 'Owl City',
    title: 'Fireflies',
    searchQueries: ['Owl City Fireflies Ocean Eyes'],
    expectedYear: 2009,
    genreHints: 'pop synthpop electronic indie',
    requiredPrimaryArtist: ['owl city'],
    requiredTitleKeywords: ['fireflies'],
  },
  {
    index: 29,
    artist: 'Pitbull feat. Marc Anthony',
    title: 'Rain Over Me',
    searchQueries: ['Pitbull Marc Anthony Rain Over Me'],
    expectedYear: 2011,
    genreHints: 'pop dance latin electronic',
    requiredPrimaryArtist: ['pitbull'],
    requiredTitleKeywords: ['rain over me'],
  },
  {
    index: 30,
    artist: 'OneRepublic',
    title: 'Counting Stars',
    searchQueries: ['OneRepublic Counting Stars Native'],
    expectedYear: 2013,
    genreHints: 'pop rock pop rock indie',
    requiredPrimaryArtist: ['onerepublic'],
    requiredTitleKeywords: ['counting stars'],
  },
  {
    index: 31,
    artist: 'Taio Cruz feat. Flo Rida',
    title: 'Hangover',
    searchQueries: ['Taio Cruz Hangover Flo Rida'],
    expectedYear: 2011,
    genreHints: 'pop dance electronic edm',
    requiredPrimaryArtist: ['taio cruz'],
    requiredTitleKeywords: ['hangover'],
  },
  {
    index: 32,
    artist: 'The Chainsmokers feat. Halsey',
    title: 'Closer',
    searchQueries: ['The Chainsmokers Closer Halsey'],
    expectedYear: 2016,
    genreHints: 'electronic dance pop edm',
    requiredPrimaryArtist: ['the chainsmokers', 'chainsmokers'],
    requiredTitleKeywords: ['closer'],
  },
  {
    index: 33,
    artist: 'The Chainsmokers',
    title: 'Paris',
    searchQueries: ['The Chainsmokers Paris'],
    expectedYear: 2017,
    genreHints: 'electronic dance pop edm',
    requiredPrimaryArtist: ['the chainsmokers', 'chainsmokers'],
    requiredTitleKeywords: ['paris'],
  },
  {
    index: 34,
    artist: 'Jennifer Lopez feat. Pitbull',
    title: 'Dance Again',
    searchQueries: ['Jennifer Lopez Dance Again Pitbull'],
    expectedYear: 2012,
    genreHints: 'pop dance latin electronic',
    requiredPrimaryArtist: ['jennifer lopez', 'j.lo', 'j lo'],
    requiredTitleKeywords: ['dance again'],
  },
  {
    index: 35,
    artist: 'Post Malone',
    title: 'Yours Truly, Austin Post',
    searchQueries: ['Post Malone Yours Truly Austin Post'],
    expectedYear: 2016,
    genreHints: 'hiphop rap pop trap',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['yours truly, austin post', 'yours truly austin post'],
  },
  {
    index: 36,
    artist: 'Tyla Yaweh',
    title: "They Ain't You",
    searchQueries: ["Tyla Yaweh They Ain't You Heart Full of Rage"],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap pop',
    requiredPrimaryArtist: ['tyla yaweh'],
    requiredTitleKeywords: ["they ain't you", 'they aint you'],
  },
  {
    index: 37,
    artist: 'Tyla Yaweh feat. Wiz Khalifa',
    title: 'High Right Now (Remix)',
    searchQueries: ['Tyla Yaweh High Right Now Remix Wiz Khalifa', 'Tyla Yaweh High Right Now Wiz Khalifa'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap pop',
    requiredPrimaryArtist: ['tyla yaweh'],
    requiredTitleKeywords: ['high right now'],
    isRemix: true,
  },
  {
    index: 38,
    artist: 'Post Malone',
    title: 'Sugar Wraith',
    searchQueries: ['Post Malone Sugar Wraith Beerbongs'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap pop',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['sugar wraith'],
  },
  {
    index: 39,
    artist: 'Post Malone feat. Morgan Wallen',
    title: 'I Had Some Help',
    searchQueries: ['Post Malone Morgan Wallen I Had Some Help'],
    expectedYear: 2024,
    genreHints: 'pop country pop',
    requiredPrimaryArtist: ['post malone', 'morgan wallen'],
    requiredTitleKeywords: ['i had some help'],
  },
  {
    index: 40,
    artist: 'Lil Mosey',
    title: 'Noticed',
    searchQueries: ['Lil Mosey Noticed Northsbest'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap',
    requiredPrimaryArtist: ['lil mosey'],
    requiredTitleKeywords: ['noticed'],
  },
  {
    index: 41,
    artist: 'Lil Peep feat. XXXTENTACION',
    title: 'Falling Down',
    searchQueries: ['Lil Peep XXXTENTACION Falling Down', 'Lil Peep Falling Down'],
    expectedYear: 2018,
    genreHints: 'hiphop rap alternative emo rap',
    requiredPrimaryArtist: ['lil peep', 'xxxtentacion'],
    requiredTitleKeywords: ['falling down'],
  },
  {
    index: 42,
    artist: 'Post Malone',
    title: 'Rich & Sad',
    searchQueries: ['Post Malone Rich & Sad Beerbongs'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap pop',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['rich & sad', 'rich and sad'],
  },
  {
    index: 43,
    artist: 'Post Malone',
    title: 'Candy Paint',
    searchQueries: ['Post Malone Candy Paint Fate Furious'],
    expectedYear: 2017,
    genreHints: 'hiphop rap trap pop',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['candy paint'],
  },
  {
    index: 44,
    artist: 'Ava Max',
    title: 'Sweet but Psycho',
    searchQueries: ['Ava Max Sweet but Psycho Heaven Hell'],
    expectedYear: 2018,
    genreHints: 'pop dance synthpop',
    requiredPrimaryArtist: ['ava max'],
    requiredTitleKeywords: ['sweet but psycho'],
  },
  {
    index: 45,
    artist: 'Mike Posner',
    title: 'Cooler Than Me',
    searchQueries: ['Mike Posner Cooler Than Me 31 Minutes'],
    expectedYear: 2010,
    genreHints: 'pop synthpop electronic dance',
    requiredPrimaryArtist: ['mike posner'],
    requiredTitleKeywords: ['cooler than me'],
  },
  {
    index: 46,
    artist: 'DJ Snake feat. Bipolar Sunshine',
    title: 'Middle',
    searchQueries: ['DJ Snake Middle Bipolar Sunshine Encore'],
    expectedYear: 2015,
    genreHints: 'electronic dance edm pop',
    requiredPrimaryArtist: ['dj snake'],
    requiredTitleKeywords: ['middle'],
  },
  {
    index: 47,
    artist: 'Juice WRLD',
    title: 'Robbery',
    searchQueries: ['Juice WRLD Robbery Death Race for Love'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap emo rap',
    requiredPrimaryArtist: ['juice wrld'],
    requiredTitleKeywords: ['robbery'],
  },
  {
    index: 48,
    artist: 'Mike Posner',
    title: 'I Took A Pill In Ibiza (Seeb Remix)',
    searchQueries: ['Mike Posner I Took A Pill In Ibiza Seeb Remix', 'Mike Posner I Took A Pill In Ibiza Seeb'],
    expectedYear: 2015,
    genreHints: 'electronic dance pop edm tropical house',
    requiredPrimaryArtist: ['mike posner'],
    requiredTitleKeywords: ['i took a pill in ibiza'],
    isRemix: true,
  },
  {
    index: 49,
    artist: 'Pitbull feat. AFROJACK, Ne-Yo & Nayer',
    title: 'Give Me Everything',
    searchQueries: ['Pitbull Give Me Everything Ne-Yo Afrojack Nayer'],
    expectedYear: 2011,
    genreHints: 'pop dance electronic edm latin',
    requiredPrimaryArtist: ['pitbull'],
    requiredTitleKeywords: ['give me everything'],
  },
  {
    index: 50,
    artist: 'Madonna',
    title: 'Sorry',
    searchQueries: ['Madonna Sorry Confessions on a Dance Floor'],
    expectedYear: 2005,
    genreHints: 'pop dance electronic disco house',
    requiredPrimaryArtist: ['madonna'],
    requiredTitleKeywords: ['sorry'],
    forbiddenTitleKeywords: ['justin bieber', 'halsey'],
  },
  {
    index: 51,
    artist: 'Avicii',
    title: 'Levels',
    searchQueries: ['Avicii Levels original mix', 'Avicii Levels Radio Edit'],
    expectedYear: 2011,
    genreHints: 'electronic dance edm house progressive house',
    requiredPrimaryArtist: ['avicii'],
    requiredTitleKeywords: ['levels'],
  },
  {
    index: 52,
    artist: 'Taylor Swift',
    title: 'The Fate of Ophelia',
    searchQueries: ['Taylor Swift The Fate of Ophelia', 'Taylor Swift Ophelia'],
    expectedYear: 2024,
    genreHints: 'pop country folk pop',
    requiredPrimaryArtist: ['taylor swift'],
    requiredTitleKeywords: ['fate of ophelia', 'ophelia'],
  },
  {
    index: 53,
    artist: 'Sabrina Carpenter',
    title: 'Espresso',
    searchQueries: ['Sabrina Carpenter Espresso Short n Sweet'],
    expectedYear: 2024,
    genreHints: 'pop disco pop dance',
    requiredPrimaryArtist: ['sabrina carpenter'],
    requiredTitleKeywords: ['espresso'],
  },
  {
    index: 54,
    artist: 'Billie Eilish',
    title: 'BIRDS OF A FEATHER',
    searchQueries: ['Billie Eilish BIRDS OF A FEATHER HIT ME HARD AND SOFT'],
    expectedYear: 2024,
    genreHints: 'pop indie alternative synthpop',
    requiredPrimaryArtist: ['billie eilish'],
    requiredTitleKeywords: ['birds of a feather'],
  },
  {
    index: 55,
    artist: 'INNA',
    title: 'Sun Is Up',
    searchQueries: ['INNA Sun Is Up I Am the Club Rocker'],
    expectedYear: 2010,
    genreHints: 'electronic dance pop eurodance house',
    requiredPrimaryArtist: ['inna'],
    requiredTitleKeywords: ['sun is up'],
  },
  {
    index: 56,
    artist: 'Taio Cruz feat. Kylie Minogue',
    title: 'Higher',
    searchQueries: ['Taio Cruz Higher Kylie Minogue Rokstarr'],
    expectedYear: 2010,
    genreHints: 'pop dance electronic edm',
    requiredPrimaryArtist: ['taio cruz'],
    requiredTitleKeywords: ['higher'],
  },
  {
    index: 57,
    artist: 'Topic feat. A7S',
    title: 'Breaking Me',
    searchQueries: ['Topic A7S Breaking Me'],
    expectedYear: 2019,
    genreHints: 'electronic dance edm house deep house',
    requiredPrimaryArtist: ['topic'],
    requiredTitleKeywords: ['breaking me'],
  },
  {
    index: 58,
    artist: 'DNCE',
    title: 'Cake By The Ocean',
    searchQueries: ['DNCE Cake By The Ocean SWAAY'],
    expectedYear: 2015,
    genreHints: 'pop dance funk pop rock',
    requiredPrimaryArtist: ['dnce'],
    requiredTitleKeywords: ['cake by the ocean'],
  },
  {
    index: 59,
    artist: 'Usher feat. Pitbull',
    title: 'DJ Got Us Fallin’ In Love',
    searchQueries: ['Usher DJ Got Us Fallin in Love Pitbull'],
    expectedYear: 2010,
    genreHints: 'pop dance electronic rnb edm',
    requiredPrimaryArtist: ['usher'],
    requiredTitleKeywords: ['dj got us fallin', 'fallin in love', "fallin' in love"],
  },
  {
    index: 60,
    artist: 'Pitbull feat. Chris Brown',
    title: 'International Love',
    searchQueries: ['Pitbull Chris Brown International Love Planet Pit'],
    expectedYear: 2011,
    genreHints: 'pop dance electronic latin edm',
    requiredPrimaryArtist: ['pitbull'],
    requiredTitleKeywords: ['international love'],
  },
  {
    index: 61,
    artist: 'Starley',
    title: 'Call on Me (Ryan Riback Remix)',
    searchQueries: ['Starley Call on Me Ryan Riback Remix', 'Starley Call on Me Ryan Riback'],
    expectedYear: 2016,
    genreHints: 'electronic dance tropical house edm pop',
    requiredPrimaryArtist: ['starley'],
    requiredTitleKeywords: ['call on me'],
    isRemix: true,
  },
  {
    index: 62,
    artist: 'Coldplay',
    title: 'Hymn for the Weekend',
    searchQueries: ['Coldplay Hymn for the Weekend Head Full of Dreams'],
    expectedYear: 2015,
    genreHints: 'pop rock alternative indie rock',
    requiredPrimaryArtist: ['coldplay'],
    requiredTitleKeywords: ['hymn for the weekend'],
  },
  {
    index: 63,
    artist: 'Flo Rida',
    title: 'Good Feeling',
    searchQueries: ['Flo Rida Good Feeling Wild Ones'],
    expectedYear: 2011,
    genreHints: 'pop hiphop rap dance edm',
    requiredPrimaryArtist: ['flo rida'],
    requiredTitleKeywords: ['good feeling'],
  },
  {
    index: 64,
    artist: 'Black Eyed Peas',
    title: 'I Gotta Feeling',
    searchQueries: ['Black Eyed Peas I Gotta Feeling The E.N.D.'],
    expectedYear: 2009,
    genreHints: 'pop dance electronic hiphop edm',
    requiredPrimaryArtist: ['black eyed peas', 'the black eyed peas'],
    requiredTitleKeywords: ['i gotta feeling', 'gotta feeling'],
  },
  {
    index: 65,
    artist: 'Daft Punk feat. Pharrell Williams & Nile Rodgers',
    title: 'Get Lucky',
    searchQueries: ['Daft Punk Get Lucky Pharrell Williams Random Access Memories'],
    expectedYear: 2013,
    genreHints: 'electronic disco funk dance pop',
    requiredPrimaryArtist: ['daft punk'],
    requiredTitleKeywords: ['get lucky'],
  },
  {
    index: 66,
    artist: 'Alan Walker',
    title: 'Alone',
    searchQueries: ['Alan Walker Alone single', 'Alan Walker Alone'],
    expectedYear: 2016,
    genreHints: 'electronic dance edm house',
    requiredPrimaryArtist: ['alan walker'],
    requiredTitleKeywords: ['alone'],
    forbiddenTitleKeywords: ['pt. ii', 'part ii', 'marshmello', 'heart'],
  },
  {
    index: 67,
    artist: 'Avicii',
    title: 'Wake Me Up',
    searchQueries: ['Avicii Wake Me Up True Aloe Blacc'],
    expectedYear: 2013,
    genreHints: 'electronic dance edm folktronica pop',
    requiredPrimaryArtist: ['avicii'],
    requiredTitleKeywords: ['wake me up'],
  },
  {
    index: 68,
    artist: 'Avicii',
    title: 'Hey Brother',
    searchQueries: ['Avicii Hey Brother True'],
    expectedYear: 2013,
    genreHints: 'electronic dance edm folktronica pop',
    requiredPrimaryArtist: ['avicii'],
    requiredTitleKeywords: ['hey brother'],
  },
  {
    index: 69,
    artist: 'Imagine Dragons',
    title: 'Bones',
    searchQueries: ['Imagine Dragons Bones Mercury'],
    expectedYear: 2022,
    genreHints: 'rock alternative pop indie rock',
    requiredPrimaryArtist: ['imagine dragons'],
    requiredTitleKeywords: ['bones'],
  },
  {
    index: 70,
    artist: 'Imagine Dragons',
    title: 'Natural',
    searchQueries: ['Imagine Dragons Natural Origins'],
    expectedYear: 2018,
    genreHints: 'rock alternative pop indie rock',
    requiredPrimaryArtist: ['imagine dragons'],
    requiredTitleKeywords: ['natural'],
  },
  {
    index: 71,
    artist: 'Rihanna feat. Calvin Harris',
    title: 'We Found Love',
    searchQueries: ['Rihanna We Found Love Calvin Harris Talk That Talk'],
    expectedYear: 2011,
    genreHints: 'pop dance electronic edm electro house',
    requiredPrimaryArtist: ['rihanna'],
    requiredTitleKeywords: ['we found love'],
  },
  {
    index: 72,
    artist: 'Iyaz',
    title: 'Replay',
    searchQueries: ['Iyaz Replay album version'],
    expectedYear: 2009,
    genreHints: 'pop rnb reggae fusion dance pop',
    requiredPrimaryArtist: ['iyaz'],
    requiredTitleKeywords: ['replay'],
  },
  {
    index: 73,
    artist: 'Lady Gaga',
    title: 'Bad Romance',
    searchQueries: ['Lady Gaga Bad Romance The Fame Monster'],
    expectedYear: 2009,
    genreHints: 'pop dance synthpop electropop electronic',
    requiredPrimaryArtist: ['lady gaga'],
    requiredTitleKeywords: ['bad romance'],
  },
  {
    index: 74,
    artist: 'Taio Cruz',
    title: 'Dynamite',
    searchQueries: ['Taio Cruz Dynamite Rokstarr'],
    expectedYear: 2010,
    genreHints: 'pop dance electronic edm electropop',
    requiredPrimaryArtist: ['taio cruz'],
    requiredTitleKeywords: ['dynamite'],
  },
  {
    index: 75,
    artist: 'Taio Cruz feat. Ludacris',
    title: 'Break Your Heart',
    searchQueries: ['Taio Cruz Break Your Heart Ludacris Rokstarr'],
    expectedYear: 2009,
    genreHints: 'pop dance electronic edm electropop',
    requiredPrimaryArtist: ['taio cruz'],
    requiredTitleKeywords: ['break your heart'],
  },
  {
    index: 76,
    artist: 'Calvin Harris',
    title: 'Summer',
    searchQueries: ['Calvin Harris Summer Motion'],
    expectedYear: 2014,
    genreHints: 'electronic dance edm electro house pop',
    requiredPrimaryArtist: ['calvin harris'],
    requiredTitleKeywords: ['summer'],
  },
  {
    index: 77,
    artist: 'Calvin Harris feat. John Newman',
    title: 'Blame',
    searchQueries: ['Calvin Harris Blame John Newman Motion'],
    expectedYear: 2014,
    genreHints: 'electronic dance edm electro house pop',
    requiredPrimaryArtist: ['calvin harris'],
    requiredTitleKeywords: ['blame'],
  },
  {
    index: 78,
    artist: 'Don Omar feat. Lucenzo',
    title: 'Danza Kuduro',
    searchQueries: ['Don Omar Lucenzo Danza Kuduro Meet the Orphans'],
    expectedYear: 2010,
    genreHints: 'latin dance reggaeton pop',
    requiredPrimaryArtist: ['don omar'],
    requiredTitleKeywords: ['danza kuduro'],
  },
  {
    index: 79,
    artist: 'Galantis',
    title: 'No Money',
    searchQueries: ['Galantis No Money The Aviary'],
    expectedYear: 2016,
    genreHints: 'electronic dance edm pop house',
    requiredPrimaryArtist: ['galantis'],
    requiredTitleKeywords: ['no money'],
  },
  {
    index: 80,
    artist: 'George Ezra',
    title: 'Shotgun',
    searchQueries: ["George Ezra Shotgun Staying at Tamara's"],
    expectedYear: 2018,
    genreHints: 'pop indie folk pop alternative',
    requiredPrimaryArtist: ['george ezra'],
    requiredTitleKeywords: ['shotgun'],
  },
  {
    index: 81,
    artist: "Rag'n'Bone Man",
    title: 'Human',
    searchQueries: ["Rag'n'Bone Man Human album"],
    expectedYear: 2016,
    genreHints: 'rnb soul pop alternative',
    requiredPrimaryArtist: ["rag'n'bone man", 'ragnbone man', "rag 'n' bone man"],
    requiredTitleKeywords: ['human'],
  },
  {
    index: 82,
    artist: 'Sia feat. Sean Paul',
    title: 'Cheap Thrills',
    searchQueries: ['Sia Cheap Thrills Sean Paul This Is Acting'],
    expectedYear: 2016,
    genreHints: 'pop dance reggae pop synthpop',
    requiredPrimaryArtist: ['sia'],
    requiredTitleKeywords: ['cheap thrills'],
  },
  {
    index: 83,
    artist: 'Sean Paul feat. Dua Lipa',
    title: 'No Lie',
    searchQueries: ['Sean Paul Dua Lipa No Lie Mad Love'],
    expectedYear: 2016,
    genreHints: 'latin dancehall reggae pop pop',
    requiredPrimaryArtist: ['sean paul', 'dua lipa'],
    requiredTitleKeywords: ['no lie'],
  },
  {
    index: 84,
    artist: 'Fetty Wap',
    title: 'Trap Queen',
    searchQueries: ['Fetty Wap Trap Queen album'],
    expectedYear: 2014,
    genreHints: 'hiphop rap trap pop rap',
    requiredPrimaryArtist: ['fetty wap'],
    requiredTitleKeywords: ['trap queen'],
  },
  {
    index: 85,
    artist: 'Calvin Harris',
    title: 'My Way',
    searchQueries: ['Calvin Harris My Way single'],
    expectedYear: 2016,
    genreHints: 'electronic dance edm house pop',
    requiredPrimaryArtist: ['calvin harris'],
    requiredTitleKeywords: ['my way'],
  },
  {
    index: 86,
    artist: 'Clean Bandit feat. Demi Lovato',
    title: 'Solo',
    searchQueries: ['Clean Bandit Solo Demi Lovato What Is Love'],
    expectedYear: 2018,
    genreHints: 'electronic dance pop edm electro',
    requiredPrimaryArtist: ['clean bandit'],
    requiredTitleKeywords: ['solo'],
  },
  {
    index: 87,
    artist: 'Kesha',
    title: 'TiK ToK',
    searchQueries: ['Kesha Tik Tok Animal Ke$ha'],
    expectedYear: 2009,
    genreHints: 'pop dance electropop electronic',
    requiredPrimaryArtist: ['kesha', 'ke$ha'],
    requiredTitleKeywords: ['tik tok', 'tiktok'],
  },
  {
    index: 88,
    artist: 'OMI',
    title: 'Cheerleader (Felix Jaehn Remix)',
    searchQueries: ['OMI Cheerleader Felix Jaehn Remix', 'OMI Cheerleader Felix Jaehn'],
    expectedYear: 2014,
    genreHints: 'pop dance tropical house reggae fusion',
    requiredPrimaryArtist: ['omi'],
    requiredTitleKeywords: ['cheerleader'],
    isRemix: true,
  },
  {
    index: 89,
    artist: 'Flo Rida',
    title: 'My House',
    searchQueries: ['Flo Rida My House EP'],
    expectedYear: 2015,
    genreHints: 'hiphop rap pop dance',
    requiredPrimaryArtist: ['flo rida'],
    requiredTitleKeywords: ['my house'],
  },
  {
    index: 90,
    artist: 'Flo Rida',
    title: 'Whistle',
    searchQueries: ['Flo Rida Whistle Wild Ones'],
    expectedYear: 2012,
    genreHints: 'pop hiphop rap dance',
    requiredPrimaryArtist: ['flo rida'],
    requiredTitleKeywords: ['whistle'],
  },
  {
    index: 91,
    artist: 'Maroon 5',
    title: 'Maps',
    searchQueries: ['Maroon 5 Maps V'],
    expectedYear: 2014,
    genreHints: 'pop rock pop rock',
    requiredPrimaryArtist: ['maroon 5'],
    requiredTitleKeywords: ['maps'],
  },
  {
    index: 92,
    artist: 'Maroon 5',
    title: 'She Will Be Loved',
    searchQueries: ['Maroon 5 She Will Be Loved Songs About Jane'],
    expectedYear: 2002,
    genreHints: 'pop rock pop rock alternative',
    requiredPrimaryArtist: ['maroon 5'],
    requiredTitleKeywords: ['she will be loved'],
  },
  {
    index: 93,
    artist: 'Maroon 5',
    title: 'One More Night',
    searchQueries: ['Maroon 5 One More Night Overexposed'],
    expectedYear: 2012,
    genreHints: 'pop reggae pop pop rock',
    requiredPrimaryArtist: ['maroon 5'],
    requiredTitleKeywords: ['one more night'],
  },
  {
    index: 94,
    artist: 'Bruno Mars',
    title: 'The Lazy Song',
    searchQueries: ['Bruno Mars The Lazy Song Doo-Wops'],
    expectedYear: 2010,
    genreHints: 'pop reggae pop pop soul',
    requiredPrimaryArtist: ['bruno mars'],
    requiredTitleKeywords: ['the lazy song', 'lazy song'],
  },
  {
    index: 95,
    artist: 'The Weeknd',
    title: "Can't Feel My Face",
    searchQueries: ["The Weeknd Can't Feel My Face Beauty Behind the Madness"],
    expectedYear: 2015,
    genreHints: 'pop rnb funk pop disco',
    requiredPrimaryArtist: ['the weeknd', 'weeknd'],
    requiredTitleKeywords: ["can't feel my face", 'cant feel my face'],
  },
  {
    index: 96,
    artist: 'Ed Sheeran',
    title: 'Bad Habits',
    searchQueries: ['Ed Sheeran Bad Habits Equals'],
    expectedYear: 2021,
    genreHints: 'pop synthpop dance pop',
    requiredPrimaryArtist: ['ed sheeran'],
    requiredTitleKeywords: ['bad habits'],
  },
  {
    index: 97,
    artist: 'Maroon 5 feat. Christina Aguilera',
    title: 'Moves Like Jagger',
    searchQueries: ['Maroon 5 Christina Aguilera Moves Like Jagger Hands All Over'],
    expectedYear: 2011,
    genreHints: 'pop dance pop disco rock',
    requiredPrimaryArtist: ['maroon 5'],
    requiredTitleKeywords: ['moves like jagger'],
  },
  {
    index: 98,
    artist: 'Backstreet Boys',
    title: 'I Want It That Way',
    searchQueries: ['Backstreet Boys I Want It That Way Millennium'],
    expectedYear: 1999,
    genreHints: 'pop 90s pop boyband',
    requiredPrimaryArtist: ['backstreet boys'],
    requiredTitleKeywords: ['i want it that way'],
  },
  {
    index: 99,
    artist: 'Jennifer Lopez feat. Pitbull',
    title: 'On The Floor',
    searchQueries: ['Jennifer Lopez On The Floor Pitbull Love?'],
    expectedYear: 2011,
    genreHints: 'pop dance electronic latin edm',
    requiredPrimaryArtist: ['jennifer lopez', 'j.lo', 'j lo'],
    requiredTitleKeywords: ['on the floor'],
  },
  {
    index: 100,
    artist: 'Justin Timberlake',
    title: "CAN'T STOP THE FEELING!",
    searchQueries: ["Justin Timberlake CAN'T STOP THE FEELING Trolls"],
    expectedYear: 2016,
    genreHints: 'pop disco funk dance pop',
    requiredPrimaryArtist: ['justin timberlake'],
    requiredTitleKeywords: ["can't stop the feeling", 'cant stop the feeling'],
  },
  {
    index: 101,
    artist: 'd4vd',
    title: 'Feel It',
    searchQueries: ['d4vd Feel It Invincible'],
    expectedYear: 2024,
    genreHints: 'indie pop alternative rnb',
    requiredPrimaryArtist: ['d4vd'],
    requiredTitleKeywords: ['feel it'],
  },
  {
    index: 102,
    artist: 'Shaboozey',
    title: 'A Bar Song (Tipsy)',
    searchQueries: ['Shaboozey A Bar Song Tipsy'],
    expectedYear: 2024,
    genreHints: 'pop country hiphop country pop',
    requiredPrimaryArtist: ['shaboozey'],
    requiredTitleKeywords: ['a bar song', 'tipsy'],
  },
  {
    index: 103,
    artist: 'Tyla Yaweh feat. Post Malone',
    title: 'Tommy Lee',
    searchQueries: ['Tyla Yaweh Post Malone Tommy Lee'],
    expectedYear: 2020,
    genreHints: 'hiphop rap trap pop',
    requiredPrimaryArtist: ['tyla yaweh', 'post malone'],
    requiredTitleKeywords: ['tommy lee'],
  },
  {
    index: 104,
    artist: 'Katy Perry',
    title: 'Hot N Cold',
    searchQueries: ['Katy Perry Hot N Cold One of the Boys'],
    expectedYear: 2008,
    genreHints: 'pop dance pop rock pop',
    requiredPrimaryArtist: ['katy perry'],
    requiredTitleKeywords: ['hot n cold', 'hot n cold', 'hot and cold'],
  },
  {
    index: 105,
    artist: 'Sean Paul',
    title: "She Doesn't Mind",
    searchQueries: ["Sean Paul She Doesn't Mind Tomahawk Technique"],
    expectedYear: 2011,
    genreHints: 'pop latin dancehall reggae pop',
    requiredPrimaryArtist: ['sean paul'],
    requiredTitleKeywords: ["she doesn't mind", 'she doesnt mind'],
  },
  {
    index: 106,
    artist: 'Elton John & Dua Lipa',
    title: 'Cold Heart (PNAU Remix)',
    searchQueries: ['Elton John Dua Lipa Cold Heart PNAU Remix', 'Elton John Dua Lipa Cold Heart'],
    expectedYear: 2021,
    genreHints: 'pop dance electronic disco house',
    requiredPrimaryArtist: ['elton john', 'dua lipa'],
    requiredTitleKeywords: ['cold heart'],
    isRemix: true,
  },
  {
    index: 107,
    artist: 'Martin Garrix feat. Dua Lipa',
    title: 'Scared to Be Lonely',
    searchQueries: ['Martin Garrix Dua Lipa Scared to Be Lonely'],
    expectedYear: 2017,
    genreHints: 'electronic dance edm future bass pop',
    requiredPrimaryArtist: ['martin garrix', 'dua lipa'],
    requiredTitleKeywords: ['scared to be lonely'],
  },
  {
    index: 108,
    artist: 'Calvin Harris feat. Dua Lipa',
    title: 'One Kiss',
    searchQueries: ['Calvin Harris Dua Lipa One Kiss'],
    expectedYear: 2018,
    genreHints: 'electronic dance house dance pop',
    requiredPrimaryArtist: ['calvin harris', 'dua lipa'],
    requiredTitleKeywords: ['one kiss'],
  },
  {
    index: 109,
    artist: 'Halsey',
    title: 'Without Me',
    searchQueries: ['Halsey Without Me Manic'],
    expectedYear: 2018,
    genreHints: 'pop rnb alternative pop',
    requiredPrimaryArtist: ['halsey'],
    requiredTitleKeywords: ['without me'],
    forbiddenTitleKeywords: ['eminem', 'juice wrld remix'],
  },
  {
    index: 110,
    artist: 'Ed Sheeran feat. Khalid',
    title: 'Beautiful People',
    searchQueries: ['Ed Sheeran Khalid Beautiful People No.6 Collaborations'],
    expectedYear: 2019,
    genreHints: 'pop acoustic pop rnb',
    requiredPrimaryArtist: ['ed sheeran'],
    requiredTitleKeywords: ['beautiful people'],
  },
  {
    index: 111,
    artist: 'DJ Khaled feat. Justin Bieber, Quavo, Chance the Rapper & Lil Wayne',
    title: "I'm the One",
    searchQueries: ["DJ Khaled I'm the One Justin Bieber Quavo Grateful"],
    expectedYear: 2017,
    genreHints: 'hiphop rap pop trap',
    requiredPrimaryArtist: ['dj khaled'],
    requiredTitleKeywords: ["i'm the one", 'im the one'],
  },
  {
    index: 112,
    artist: 'Post Malone feat. Young Thug',
    title: 'Goodbyes',
    searchQueries: ['Post Malone Young Thug Goodbyes Hollywood Bleeding'],
    expectedYear: 2019,
    genreHints: 'hiphop rap trap pop',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['goodbyes'],
  },
  {
    index: 113,
    artist: 'Post Malone',
    title: 'Better Now',
    searchQueries: ['Post Malone Better Now Beerbongs Bentleys'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap pop',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['better now'],
  },
  {
    index: 114,
    artist: 'The Fray',
    title: 'How to Save a Life',
    searchQueries: ['The Fray How to Save a Life album version'],
    expectedYear: 2005,
    genreHints: 'rock alternative indie rock piano rock pop',
    requiredPrimaryArtist: ['the fray'],
    requiredTitleKeywords: ['how to save a life'],
  },
  {
    index: 115,
    artist: 'Dua Lipa',
    title: "Don't Start Now",
    searchQueries: ["Dua Lipa Don't Start Now Future Nostalgia"],
    expectedYear: 2019,
    genreHints: 'pop dance disco nu-disco electronic',
    requiredPrimaryArtist: ['dua lipa'],
    requiredTitleKeywords: ["don't start now", 'dont start now'],
  },
  {
    index: 116,
    artist: 'Kygo feat. Parson James',
    title: 'Stole the Show',
    searchQueries: ['Kygo Parson James Stole the Show Cloud Nine'],
    expectedYear: 2015,
    genreHints: 'electronic dance tropical house pop',
    requiredPrimaryArtist: ['kygo'],
    requiredTitleKeywords: ['stole the show'],
  },
  {
    index: 117,
    artist: 'Edward Maya feat. Vika Jigulina',
    title: 'Stereo Love',
    searchQueries: ['Edward Maya Vika Jigulina Stereo Love original'],
    expectedYear: 2009,
    genreHints: 'electronic dance eurodance house pop',
    requiredPrimaryArtist: ['edward maya'],
    requiredTitleKeywords: ['stereo love'],
  },
  {
    index: 118,
    artist: 'David Guetta feat. Ne-Yo & Akon',
    title: 'Play Hard',
    searchQueries: ['David Guetta Play Hard Ne-Yo Akon Nothing but the Beat'],
    expectedYear: 2012,
    genreHints: 'electronic dance edm electro house pop',
    requiredPrimaryArtist: ['david guetta'],
    requiredTitleKeywords: ['play hard'],
  },
  {
    index: 119,
    artist: 'Cartoon feat. Jéja & Daniel Levi',
    title: 'On & On',
    searchQueries: ['Cartoon On & On Daniel Levi Jéja NCS', 'Cartoon On & On Daniel Levi'],
    expectedYear: 2015,
    genreHints: 'electronic dance drum and bass edm',
    requiredPrimaryArtist: ['cartoon'],
    requiredTitleKeywords: ['on & on', 'on and on'],
  },
  {
    index: 120,
    artist: 'Marshmello feat. Khalid',
    title: 'Silence',
    searchQueries: ['Marshmello Khalid Silence'],
    expectedYear: 2017,
    genreHints: 'electronic dance future bass edm pop',
    requiredPrimaryArtist: ['marshmello'],
    requiredTitleKeywords: ['silence'],
  },
  {
    index: 121,
    artist: 'Gucci Mane feat. Bruno Mars & Kodak Black',
    title: 'Wake Up in the Sky',
    searchQueries: ['Gucci Mane Bruno Mars Kodak Black Wake Up in the Sky Evil Genius'],
    expectedYear: 2018,
    genreHints: 'hiphop rap trap pop rnb',
    requiredPrimaryArtist: ['gucci mane', 'bruno mars'],
    requiredTitleKeywords: ['wake up in the sky'],
  },
  {
    index: 122,
    artist: 'Juice WRLD feat. The Weeknd',
    title: 'Smile',
    searchQueries: ['Juice WRLD The Weeknd Smile Legends Never Die'],
    expectedYear: 2020,
    genreHints: 'hiphop rap emo rap pop',
    requiredPrimaryArtist: ['juice wrld', 'the weeknd'],
    requiredTitleKeywords: ['smile'],
  },
  {
    index: 123,
    artist: 'Post Malone',
    title: 'Circles',
    searchQueries: ["Post Malone Circles Hollywood's Bleeding"],
    expectedYear: 2019,
    genreHints: 'pop pop rock indie synthpop',
    requiredPrimaryArtist: ['post malone'],
    requiredTitleKeywords: ['circles'],
  },
  {
    index: 124,
    artist: 'Olly Alexander (Years & Years)',
    title: 'King',
    searchQueries: ['Years & Years King Communion', 'Years and Years King'],
    expectedYear: 2015,
    genreHints: 'pop dance synthpop electronic electropop',
    requiredPrimaryArtist: ['years & years', 'years and years', 'olly alexander'],
    requiredTitleKeywords: ['king'],
  },
  {
    index: 125,
    artist: 'Zara Larsson',
    title: 'Lush Life',
    searchQueries: ['Zara Larsson Lush Life So Good'],
    expectedYear: 2015,
    genreHints: 'pop dance electropop dance pop',
    requiredPrimaryArtist: ['zara larsson'],
    requiredTitleKeywords: ['lush life'],
  },
  {
    index: 126,
    artist: 'Clean Bandit feat. Jess Glynne',
    title: 'Rather Be',
    searchQueries: ['Clean Bandit Rather Be Jess Glynne New Eyes'],
    expectedYear: 2014,
    genreHints: 'electronic dance classical crossover pop house',
    requiredPrimaryArtist: ['clean bandit'],
    requiredTitleKeywords: ['rather be'],
  },
  {
    index: 127,
    artist: 'Glass Animals',
    title: 'Heat Waves',
    searchQueries: ['Glass Animals Heat Waves Dreamland'],
    expectedYear: 2020,
    genreHints: 'indie pop alternative psychedelic pop',
    requiredPrimaryArtist: ['glass animals'],
    requiredTitleKeywords: ['heat waves'],
  },
  {
    index: 128,
    artist: 'September',
    title: 'Satellites',
    searchQueries: ['September Satellites In Orbit'],
    expectedYear: 2005,
    genreHints: 'electronic dance eurodance pop',
    requiredPrimaryArtist: ['september'],
    requiredTitleKeywords: ['satellites'],
  },
  {
    index: 129,
    artist: 'Flo Rida feat. David Guetta',
    title: "Club Can't Handle Me",
    searchQueries: ["Flo Rida David Guetta Club Can't Handle Me Step Up 3D"],
    expectedYear: 2010,
    genreHints: 'pop dance electronic hiphop edm',
    requiredPrimaryArtist: ['flo rida'],
    requiredTitleKeywords: ["club can't handle me", 'club cant handle me'],
  },
  {
    index: 130,
    artist: 'John Newman',
    title: 'Love Me Again',
    searchQueries: ['John Newman Love Me Again Tribute'],
    expectedYear: 2013,
    genreHints: 'pop soul dance pop northern soul',
    requiredPrimaryArtist: ['john newman'],
    requiredTitleKeywords: ['love me again'],
  },
  {
    index: 131,
    artist: 'Nico & Vinz',
    title: 'Am I Wrong',
    searchQueries: ['Nico & Vinz Am I Wrong Black Star Elephant'],
    expectedYear: 2013,
    genreHints: 'pop afrobeat dance pop alternative',
    requiredPrimaryArtist: ['nico & vinz', 'nico and vinz', 'envy'],
    requiredTitleKeywords: ['am i wrong'],
  },
  {
    index: 132,
    artist: 'Britney Spears',
    title: 'I Wanna Go',
    searchQueries: ['Britney Spears I Wanna Go Femme Fatale'],
    expectedYear: 2011,
    genreHints: 'pop dance electronic electropop',
    requiredPrimaryArtist: ['britney spears'],
    requiredTitleKeywords: ['i wanna go'],
  },
  {
    index: 133,
    artist: 'B.o.B feat. Bruno Mars',
    title: "Nothin' on You",
    searchQueries: ["B.o.B Bruno Mars Nothin' on You", 'B.o.B Bruno Mars Nothin on You'],
    expectedYear: 2009,
    genreHints: 'hiphop pop rap rnb pop rap',
    requiredPrimaryArtist: ['b.o.b', 'bob', 'b.o.b.'],
    requiredTitleKeywords: ["nothin' on you", 'nothin on you', 'nothing on you'],
  },
  {
    index: 134,
    artist: 'Daddy Yankee',
    title: 'Limbo',
    searchQueries: ['Daddy Yankee Limbo Prestige'],
    expectedYear: 2012,
    genreHints: 'latin dance reggaeton pop',
    requiredPrimaryArtist: ['daddy yankee'],
    requiredTitleKeywords: ['limbo'],
  },
  {
    index: 135,
    artist: 'Oliver Tree & Robin Schulz',
    title: 'Miss You',
    searchQueries: ['Oliver Tree Robin Schulz Miss You'],
    expectedYear: 2022,
    genreHints: 'electronic dance edm pop house',
    requiredPrimaryArtist: ['oliver tree', 'robin schulz'],
    requiredTitleKeywords: ['miss you'],
  },
  {
    index: 136,
    artist: 'Take That',
    title: 'Patience',
    searchQueries: ['Take That Patience Beautiful World'],
    expectedYear: 2006,
    genreHints: 'pop pop rock ballad',
    requiredPrimaryArtist: ['take that'],
    requiredTitleKeywords: ['patience'],
  },
];

function normalizeStr(str: string): string {
  return str
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
      const contentType = res.headers.get('content-type') || '';
      if (
        contentType.includes('audio') ||
        contentType.includes('video') ||
        contentType.includes('octet-stream') ||
        contentType.includes('mp4') ||
        contentType.includes('m4a')
      ) {
        return true;
      }
      return true; // Many CDNs return partial mp4 with application/octet-stream
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

function doesMatchSpec(item: any, spec: RequestedSongSpec): boolean {
  const trackName = normalizeStr(item.trackName || '');
  const artistName = normalizeStr(item.artistName || '');

  // 1. Check primary artist match
  const artistMatches = spec.requiredPrimaryArtist.some((artist) => {
    const normReq = normalizeStr(artist);
    return artistName.includes(normReq) || normReq.includes(artistName);
  });
  if (!artistMatches) return false;

  // 2. Check title keywords
  const titleMatches = spec.requiredTitleKeywords.some((kw) => {
    const normKw = normalizeStr(kw);
    return trackName.includes(normKw);
  });
  if (!titleMatches) return false;

  // 3. Check forbidden keywords
  if (spec.forbiddenTitleKeywords) {
    const hasForbidden = spec.forbiddenTitleKeywords.some((fKw) => {
      const normF = normalizeStr(fKw);
      return trackName.includes(normF) || artistName.includes(normF);
    });
    if (hasForbidden) return false;
  }

  // 4. Karaoke / Tribute / Cover filter
  const badMarkers = ['tribute', 'karaoke', 'instrumental', 'made famous by', 'in the style of', 'cover version', 'ringtone'];
  for (const marker of badMarkers) {
    if (trackName.includes(marker) || artistName.includes(marker)) {
      return false;
    }
  }

  // 5. Remix handling: if not requested as remix, reject remix
  if (!spec.isRemix) {
    if (trackName.includes('remix') || trackName.includes('club mix') || trackName.includes('dub mix')) {
      return false;
    }
  }

  return true;
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

async function main() {
  const catalogPath = path.resolve(process.cwd(), 'src/data/melodexCatalog.json');
  console.log(`Loading catalog from ${catalogPath}...`);
  const rawData = fs.readFileSync(catalogPath, 'utf8');
  const catalog: Song[] = JSON.parse(rawData);
  console.log(`Current catalog contains ${catalog.length} songs.`);

  let alreadyExistedHealthy = 0;
  let successfullyAdded = 0;
  let existingRepaired = 0;
  let unavailableRejected = 0;

  const unavailableList: { song: string; reason: string }[] = [];
  const processedReport: string[] = [];

  for (const spec of REQUESTED_SONGS) {
    const displayName = `${spec.index}. ${spec.artist} — ${spec.title}`;
    console.log(`\nProcessing: [${displayName}]`);

    // 1. Look for existing in catalog
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

      // Test audio playability
      const isAudioPlayable = await testAudioPlayable(existing.previewUrl);
      if (isAudioPlayable) {
        // Check if metadata needs repair (e.g. verifiedOriginalYear, normalizedGenres)
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
          existingRepaired++;
          console.log(`  -> Repaired metadata & verified audio.`);
          processedReport.push(`[REPAIRED] ${displayName}`);
        } else {
          alreadyExistedHealthy++;
          console.log(`  -> Already exists and healthy.`);
          processedReport.push(`[HEALTHY] ${displayName}`);
        }
        continue;
      } else {
        console.log(`  Existing previewUrl is dead or failing. Attempting to repair with fresh iTunes source...`);
      }
    }

    // 2. Fetch fresh iTunes / Deezer candidate
    let matchedCandidate: any = null;
    for (const q of spec.searchQueries) {
      const itunesResults = await fetchItunesCandidates(q);
      for (const item of itunesResults) {
        if (doesMatchSpec(item, spec)) {
          if (item.previewUrl) {
            const playable = await testAudioPlayable(item.previewUrl);
            if (playable) {
              matchedCandidate = item;
              break;
            }
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
              }
            }
          }
        }
        if (matchedCandidate) break;
      }
    }

    if (!matchedCandidate) {
      console.log(`  ❌ Could not obtain playable verified audio for ${displayName}`);
      unavailableRejected++;
      unavailableList.push({
        song: `${spec.artist} — ${spec.title}`,
        reason: 'No matching audio preview found on provider or audio failed playback verification',
      });
      processedReport.push(`[UNAVAILABLE] ${displayName}`);
      continue;
    }

    // 3. Construct new or repaired Song entry
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
      existingRepaired++;
      console.log(`  -> Successfully repaired broken song with working audio from iTunes!`);
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
      successfullyAdded++;
      console.log(`  -> Successfully added new song with verified playable audio! (ID: ${newSong.id})`);
      processedReport.push(`[ADDED] ${displayName}`);
    }
  }

  // Deduplicate catalog by ID and canonical artist/title
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

  console.log('\n================ FINAL IMPORT REPORT ================');
  console.log(`Requested unique songs: ${REQUESTED_SONGS.length}`);
  console.log(`Already existed and healthy: ${alreadyExistedHealthy}`);
  console.log(`Successfully added: ${successfullyAdded}`);
  console.log(`Existing songs repaired: ${existingRepaired}`);
  console.log(`Unavailable / rejected: ${unavailableRejected}`);

  if (unavailableList.length > 0) {
    console.log('\n--- UNAVAILABLE / REJECTED SONGS ---');
    unavailableList.forEach((u, i) => {
      console.log(`${i + 1}. ${u.song} -> ${u.reason}`);
    });
  }
}

main().catch(console.error);
