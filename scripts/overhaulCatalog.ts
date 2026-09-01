import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Song } from '../src/types/song';
import { normalizeText, squashSymbols, extractPrimaryArtist } from '../src/utils/normalizeText';
import { KNOWN_ORIGINAL_YEARS } from './knownSongYears';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_DATA_PATH = path.resolve(__dirname, '../src/data/melodexCatalog.json');
const CATALOG_ALT_PATH = path.resolve(__dirname, '../src/data/melodex-catalog.json');
const CATALOG_PUBLIC_PATH = path.resolve(__dirname, '../public/melodex-catalog.json');

// Interface for targeted tracks to ingest
interface TargetTrack {
  artist: string;
  title: string;
  searchQuery: string;
  verifiedYear: number;
  genre: string;
  recognitionScore: number;
}

// Target tracks covering missing seed artists, major artist gaps, and iconic global hits
const TARGET_TRACKS: TargetTrack[] = [
  // ==========================================
  // DR. DRE & WEST COAST CLASSICS
  // ==========================================
  { artist: 'Dr. Dre', title: 'Still D.R.E. (feat. Snoop Dogg)', searchQuery: 'Dr Dre Still DRE', verifiedYear: 1999, genre: 'Hip-Hop/Rap', recognitionScore: 97 },
  { artist: 'Dr. Dre', title: 'The Next Episode (feat. Snoop Dogg)', searchQuery: 'Dr Dre The Next Episode', verifiedYear: 1999, genre: 'Hip-Hop/Rap', recognitionScore: 96 },
  { artist: 'Dr. Dre', title: 'Forgot About Dre (feat. Eminem)', searchQuery: 'Dr Dre Forgot About Dre', verifiedYear: 1999, genre: 'Hip-Hop/Rap', recognitionScore: 95 },
  { artist: 'Dr. Dre', title: 'Nuthin\' But A "G" Thang (feat. Snoop Dogg)', searchQuery: 'Dr Dre Nuthin But A G Thang', verifiedYear: 1992, genre: 'Hip-Hop/Rap', recognitionScore: 95 },
  { artist: 'Dr. Dre', title: 'I Need A Doctor (feat. Eminem & Skylar Grey)', searchQuery: 'Dr Dre I Need A Doctor', verifiedYear: 2011, genre: 'Hip-Hop/Rap', recognitionScore: 90 },

  // ==========================================
  // T.I.
  // ==========================================
  { artist: 'T.I.', title: 'Live Your Life (feat. Rihanna)', searchQuery: 'TI Live Your Life Rihanna', verifiedYear: 2008, genre: 'Hip-Hop/Rap', recognitionScore: 94 },
  { artist: 'T.I.', title: 'Whatever You Like', searchQuery: 'TI Whatever You Like', verifiedYear: 2008, genre: 'Hip-Hop/Rap', recognitionScore: 94 },
  { artist: 'T.I.', title: 'Dead and Gone (feat. Justin Timberlake)', searchQuery: 'TI Dead and Gone Justin Timberlake', verifiedYear: 2008, genre: 'Hip-Hop/Rap', recognitionScore: 92 },
  { artist: 'T.I.', title: 'What You Know', searchQuery: 'TI What You Know', verifiedYear: 2006, genre: 'Hip-Hop/Rap', recognitionScore: 90 },
  { artist: 'T.I.', title: 'Bring Em Out', searchQuery: 'TI Bring Em Out', verifiedYear: 2004, genre: 'Hip-Hop/Rap', recognitionScore: 89 },

  // ==========================================
  // JAY-Z (MASSIVE EXPANSION)
  // ==========================================
  { artist: 'JAY-Z', title: 'Empire State of Mind (feat. Alicia Keys)', searchQuery: 'Jay Z Empire State of Mind Alicia Keys', verifiedYear: 2009, genre: 'Hip-Hop/Rap', recognitionScore: 98 },
  { artist: 'JAY-Z', title: '99 Problems', searchQuery: 'Jay Z 99 Problems', verifiedYear: 2003, genre: 'Hip-Hop/Rap', recognitionScore: 95 },
  { artist: 'JAY-Z & Kanye West', title: 'Ni**as in Paris', searchQuery: 'Jay Z Kanye West Paris', verifiedYear: 2011, genre: 'Hip-Hop/Rap', recognitionScore: 97 },
  { artist: 'JAY-Z', title: 'Hard Knock Life (Ghetto Anthem)', searchQuery: 'Jay Z Hard Knock Life', verifiedYear: 1998, genre: 'Hip-Hop/Rap', recognitionScore: 94 },
  { artist: 'JAY-Z', title: 'Run This Town (feat. Rihanna & Kanye West)', searchQuery: 'Jay Z Run This Town Rihanna', verifiedYear: 2009, genre: 'Hip-Hop/Rap', recognitionScore: 94 },
  { artist: 'JAY-Z', title: 'Dirt Off Your Shoulder', searchQuery: 'Jay Z Dirt Off Your Shoulder', verifiedYear: 2003, genre: 'Hip-Hop/Rap', recognitionScore: 93 },
  { artist: 'JAY-Z', title: 'Izzo (H.O.V.A.)', searchQuery: 'Jay Z Izzo HOVA', verifiedYear: 2001, genre: 'Hip-Hop/Rap', recognitionScore: 92 },
  { artist: 'JAY-Z', title: 'Holy Grail (feat. Justin Timberlake)', searchQuery: 'Jay Z Holy Grail Justin Timberlake', verifiedYear: 2013, genre: 'Hip-Hop/Rap', recognitionScore: 91 },

  // ==========================================
  // BONE THUGS-N-HARMONY
  // ==========================================
  { artist: 'Bone Thugs-N-Harmony', title: 'Tha Crossroads', searchQuery: 'Bone Thugs Tha Crossroads', verifiedYear: 1996, genre: 'Hip-Hop/Rap', recognitionScore: 95 },
  { artist: 'Bone Thugs-N-Harmony', title: '1st of Tha Month', searchQuery: 'Bone Thugs 1st of Tha Month', verifiedYear: 1995, genre: 'Hip-Hop/Rap', recognitionScore: 91 },
  { artist: 'Bone Thugs-N-Harmony', title: 'Thuggish Ruggish Bone', searchQuery: 'Bone Thugs Thuggish Ruggish Bone', verifiedYear: 1994, genre: 'Hip-Hop/Rap', recognitionScore: 89 },

  // ==========================================
  // MOBB DEEP
  // ==========================================
  { artist: 'Mobb Deep', title: 'Shook Ones, Pt. II', searchQuery: 'Mobb Deep Shook Ones Pt II', verifiedYear: 1995, genre: 'Hip-Hop/Rap', recognitionScore: 95 },
  { artist: 'Mobb Deep', title: 'Survival of the Fittest', searchQuery: 'Mobb Deep Survival of the Fittest', verifiedYear: 1995, genre: 'Hip-Hop/Rap', recognitionScore: 90 },
  { artist: 'Mobb Deep', title: 'Quiet Storm', searchQuery: 'Mobb Deep Quiet Storm', verifiedYear: 1999, genre: 'Hip-Hop/Rap', recognitionScore: 88 },

  // ==========================================
  // CYPRESS HILL
  // ==========================================
  { artist: 'Cypress Hill', title: 'Insane in the Brain', searchQuery: 'Cypress Hill Insane in the Brain', verifiedYear: 1993, genre: 'Hip-Hop/Rap', recognitionScore: 95 },
  { artist: 'Cypress Hill', title: 'Hits from the Bong', searchQuery: 'Cypress Hill Hits from the Bong', verifiedYear: 1993, genre: 'Hip-Hop/Rap', recognitionScore: 91 },
  { artist: 'Cypress Hill', title: 'How I Could Just Kill a Man', searchQuery: 'Cypress Hill How I Could Just Kill a Man', verifiedYear: 1991, genre: 'Hip-Hop/Rap', recognitionScore: 88 },

  // ==========================================
  // COOLIO
  // ==========================================
  { artist: 'Coolio', title: 'Gangsta\'s Paradise (feat. L.V.)', searchQuery: 'Coolio Gangstas Paradise', verifiedYear: 1995, genre: 'Hip-Hop/Rap', recognitionScore: 99 },
  { artist: 'Coolio', title: '1, 2, 3, 4 (Sumpin\' New)', searchQuery: 'Coolio 1 2 3 4 Sumpin New', verifiedYear: 1995, genre: 'Hip-Hop/Rap', recognitionScore: 88 },
  { artist: 'Coolio', title: 'Fantastic Voyage', searchQuery: 'Coolio Fantastic Voyage', verifiedYear: 1994, genre: 'Hip-Hop/Rap', recognitionScore: 89 },

  // ==========================================
  // FUGEES
  // ==========================================
  { artist: 'Fugees', title: 'Killing Me Softly With His Song', searchQuery: 'Fugees Killing Me Softly', verifiedYear: 1996, genre: 'Hip-Hop/Rap', recognitionScore: 97 },
  { artist: 'Fugees', title: 'Ready or Not', searchQuery: 'Fugees Ready or Not', verifiedYear: 1996, genre: 'Hip-Hop/Rap', recognitionScore: 95 },
  { artist: 'Fugees', title: 'Fu-Gee-La', searchQuery: 'Fugees Fu-Gee-La', verifiedYear: 1995, genre: 'Hip-Hop/Rap', recognitionScore: 92 },

  // ==========================================
  // WARREN G
  // ==========================================
  { artist: 'Warren G', title: 'Regulate (feat. Nate Dogg)', searchQuery: 'Warren G Regulate Nate Dogg', verifiedYear: 1994, genre: 'Hip-Hop/Rap', recognitionScore: 97 },
  { artist: 'Warren G', title: 'This D.J.', searchQuery: 'Warren G This DJ', verifiedYear: 1994, genre: 'Hip-Hop/Rap', recognitionScore: 89 },

  // ==========================================
  // THE GAME
  // ==========================================
  { artist: 'The Game', title: 'Hate It or Love It (feat. 50 Cent)', searchQuery: 'The Game Hate It Or Love It 50 Cent', verifiedYear: 2005, genre: 'Hip-Hop/Rap', recognitionScore: 95 },
  { artist: 'The Game', title: 'How We Do (feat. 50 Cent)', searchQuery: 'The Game How We Do 50 Cent', verifiedYear: 2004, genre: 'Hip-Hop/Rap', recognitionScore: 93 },
  { artist: 'The Game', title: 'My Life (feat. Lil Wayne)', searchQuery: 'The Game My Life Lil Wayne', verifiedYear: 2008, genre: 'Hip-Hop/Rap', recognitionScore: 90 },

  // ==========================================
  // JA RULE & FAT JOE
  // ==========================================
  { artist: 'Ja Rule', title: 'Always on Time (feat. Ashanti)', searchQuery: 'Ja Rule Always On Time Ashanti', verifiedYear: 2001, genre: 'Hip-Hop/Rap', recognitionScore: 94 },
  { artist: 'Ja Rule', title: 'Mesmerize (feat. Ashanti)', searchQuery: 'Ja Rule Mesmerize Ashanti', verifiedYear: 2002, genre: 'Hip-Hop/Rap', recognitionScore: 92 },
  { artist: 'Ja Rule', title: 'Livin\' It Up (feat. Case)', searchQuery: 'Ja Rule Livin It Up', verifiedYear: 2001, genre: 'Hip-Hop/Rap', recognitionScore: 91 },
  { artist: 'Fat Joe', title: 'Lean Back (feat. Remy Ma)', searchQuery: 'Fat Joe Lean Back Terror Squad', verifiedYear: 2004, genre: 'Hip-Hop/Rap', recognitionScore: 94 },
  { artist: 'Fat Joe', title: 'What\'s Luv? (feat. Ashanti & Ja Rule)', searchQuery: 'Fat Joe Whats Luv Ashanti', verifiedYear: 2001, genre: 'Hip-Hop/Rap', recognitionScore: 93 },
  { artist: 'Fat Joe', title: 'All The Way Up (feat. Remy Ma & French Montana)', searchQuery: 'Fat Joe All The Way Up French Montana', verifiedYear: 2016, genre: 'Hip-Hop/Rap', recognitionScore: 92 },

  // ==========================================
  // CARDI B & MEGAN THEE STALLION
  // ==========================================
  { artist: 'Cardi B', title: 'Bodak Yellow', searchQuery: 'Cardi B Bodak Yellow', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 96 },
  { artist: 'Cardi B', title: 'I Like It (feat. Bad Bunny & J Balvin)', searchQuery: 'Cardi B I Like It Bad Bunny J Balvin', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 96 },
  { artist: 'Cardi B', title: 'WAP (feat. Megan Thee Stallion)', searchQuery: 'Cardi B WAP Megan Thee Stallion', verifiedYear: 2020, genre: 'Hip-Hop/Rap', recognitionScore: 97 },
  { artist: 'Cardi B', title: 'Up', searchQuery: 'Cardi B Up', verifiedYear: 2021, genre: 'Hip-Hop/Rap', recognitionScore: 93 },
  { artist: 'Cardi B', title: 'Money', searchQuery: 'Cardi B Money', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 92 },
  { artist: 'Megan Thee Stallion', title: 'Savage', searchQuery: 'Megan Thee Stallion Savage', verifiedYear: 2020, genre: 'Hip-Hop/Rap', recognitionScore: 95 },
  { artist: 'Megan Thee Stallion', title: 'Body', searchQuery: 'Megan Thee Stallion Body', verifiedYear: 2020, genre: 'Hip-Hop/Rap', recognitionScore: 92 },
  { artist: 'Megan Thee Stallion', title: 'Hot Girl Summer (feat. Nicki Minaj & Ty Dolla $ign)', searchQuery: 'Megan Thee Stallion Hot Girl Summer', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 91 },
  { artist: 'Megan Thee Stallion', title: 'HISS', searchQuery: 'Megan Thee Stallion HISS', verifiedYear: 2024, genre: 'Hip-Hop/Rap', recognitionScore: 90 },

  // ==========================================
  // FRENCH MONTANA & G-EAZY
  // ==========================================
  { artist: 'French Montana', title: 'Unforgettable (feat. Swae Lee)', searchQuery: 'French Montana Unforgettable Swae Lee', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 96 },
  { artist: 'French Montana', title: 'Pop That (feat. Rick Ross, Drake & Lil Wayne)', searchQuery: 'French Montana Pop That Drake', verifiedYear: 2012, genre: 'Hip-Hop/Rap', recognitionScore: 92 },
  { artist: 'French Montana', title: 'No Stylist (feat. Drake)', searchQuery: 'French Montana No Stylist Drake', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 90 },
  { artist: 'G-Eazy', title: 'Me, Myself & I (feat. Bebe Rexha)', searchQuery: 'G Eazy Me Myself and I Bebe Rexha', verifiedYear: 2015, genre: 'Hip-Hop/Rap', recognitionScore: 95 },
  { artist: 'G-Eazy', title: 'No Limit (feat. A$AP Rocky & Cardi B)', searchQuery: 'G Eazy No Limit Cardi B ASAP Rocky', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 94 },
  { artist: 'G-Eazy', title: 'Him & I (feat. Halsey)', searchQuery: 'G Eazy Him and I Halsey', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 92 },
  { artist: 'G-Eazy', title: 'I Mean It (feat. Remo)', searchQuery: 'G Eazy I Mean It', verifiedYear: 2014, genre: 'Hip-Hop/Rap', recognitionScore: 89 },

  // ==========================================
  // CHILDISH GAMBINO & TYGA & DABABY & LIL YACHTY
  // ==========================================
  { artist: 'Childish Gambino', title: 'Redbone', searchQuery: 'Childish Gambino Redbone', verifiedYear: 2016, genre: 'R&B/Soul', recognitionScore: 96 },
  { artist: 'Childish Gambino', title: 'This Is America', searchQuery: 'Childish Gambino This Is America', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 96 },
  { artist: 'Childish Gambino', title: '3005', searchQuery: 'Childish Gambino 3005', verifiedYear: 2013, genre: 'Hip-Hop/Rap', recognitionScore: 93 },
  { artist: 'Tyga', title: 'Taste (feat. Offset)', searchQuery: 'Tyga Taste Offset', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 95 },
  { artist: 'Tyga', title: 'Rack City', searchQuery: 'Tyga Rack City', verifiedYear: 2011, genre: 'Hip-Hop/Rap', recognitionScore: 93 },
  { artist: 'Tyga', title: 'Ayy Macarena', searchQuery: 'Tyga Ayy Macarena', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 88 },
  { artist: 'DaBaby', title: 'Suge', searchQuery: 'DaBaby Suge', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 95 },
  { artist: 'DaBaby', title: 'BOP', searchQuery: 'DaBaby BOP', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 93 },
  { artist: 'DaBaby', title: 'ROCKSTAR (feat. Roddy Ricch)', searchQuery: 'DaBaby ROCKSTAR Roddy Ricch', verifiedYear: 2020, genre: 'Hip-Hop/Rap', recognitionScore: 96 },
  { artist: 'Lil Yachty', title: 'One Night', searchQuery: 'Lil Yachty One Night', verifiedYear: 2016, genre: 'Hip-Hop/Rap', recognitionScore: 90 },
  { artist: 'Lil Yachty', title: 'Poland', searchQuery: 'Lil Yachty Poland', verifiedYear: 2022, genre: 'Hip-Hop/Rap', recognitionScore: 91 },

  // ==========================================
  // THE KID LAROI & 2020s HITMAKERS
  // ==========================================
  { artist: 'The Kid LAROI & Justin Bieber', title: 'STAY', searchQuery: 'The Kid LAROI Justin Bieber STAY', verifiedYear: 2021, genre: 'Pop', recognitionScore: 98 },
  { artist: 'The Kid LAROI', title: 'WITHOUT YOU', searchQuery: 'The Kid LAROI WITHOUT YOU', verifiedYear: 2020, genre: 'Pop', recognitionScore: 94 },
  { artist: 'The Kid LAROI', title: 'Thousand Miles', searchQuery: 'The Kid LAROI Thousand Miles', verifiedYear: 2022, genre: 'Pop', recognitionScore: 88 },
  { artist: 'Iann Dior', title: 'gone girl (feat. Trippie Redd)', searchQuery: 'Iann Dior gone girl Trippie Redd', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 88 },
  { artist: 'Iann Dior', title: 'emotions', searchQuery: 'Iann Dior emotions', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 86 },
  { artist: 'Trevor Daniel', title: 'Falling', searchQuery: 'Trevor Daniel Falling', verifiedYear: 2018, genre: 'Pop', recognitionScore: 94 },
  { artist: 'Yung Lean', title: 'Ginseng Strip 2002', searchQuery: 'Yung Lean Ginseng Strip 2002', verifiedYear: 2013, genre: 'Hip-Hop/Rap', recognitionScore: 91 },
  { artist: 'Yung Lean', title: 'Kyoto', searchQuery: 'Yung Lean Kyoto', verifiedYear: 2013, genre: 'Hip-Hop/Rap', recognitionScore: 89 },
  { artist: 'Tay-K', title: 'The Race', searchQuery: 'Tay-K The Race', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 93 },
  { artist: 'Smokepurpp', title: 'Audi.', searchQuery: 'Smokepurpp Audi', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 88 },
  { artist: 'Rich Brian', title: 'Dat $tick', searchQuery: 'Rich Brian Dat Stick', verifiedYear: 2016, genre: 'Hip-Hop/Rap', recognitionScore: 91 },
  { artist: 'Big Pun', title: 'Still Not a Player (feat. Joe)', searchQuery: 'Big Pun Still Not a Player Joe', verifiedYear: 1998, genre: 'Hip-Hop/Rap', recognitionScore: 93 },
  { artist: 'A$AP Ferg', title: 'Plain Jane', searchQuery: 'ASAP Ferg Plain Jane', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 94 },
  { artist: 'A$AP Ferg', title: 'Work REMIX (feat. A$AP Rocky, French Montana, Trinidad James & ScHoolboy Q)', searchQuery: 'ASAP Ferg Work Remix', verifiedYear: 2013, genre: 'Hip-Hop/Rap', recognitionScore: 91 },
  { artist: 'Denzel Curry', title: 'Ultimate', searchQuery: 'Denzel Curry Ultimate', verifiedYear: 2015, genre: 'Hip-Hop/Rap', recognitionScore: 92 },
  { artist: 'Denzel Curry', title: 'CLOUT COBAIN | CLOUT CO13A1N', searchQuery: 'Denzel Curry Clout Cobain', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 89 },
  { artist: 'Dave', title: 'Location (feat. Burna Boy)', searchQuery: 'Dave Location Burna Boy', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 93 },
  { artist: 'Dave & Central Cee', title: 'Sprinter', searchQuery: 'Dave Central Cee Sprinter', verifiedYear: 2023, genre: 'Hip-Hop/Rap', recognitionScore: 95 },
  { artist: 'King Von', title: 'Took Her to the O', searchQuery: 'King Von Took Her to the O', verifiedYear: 2020, genre: 'Hip-Hop/Rap', recognitionScore: 93 },
  { artist: 'King Von', title: 'Crazy Story', searchQuery: 'King Von Crazy Story', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 91 },
  { artist: 'NLE Choppa', title: 'Shotta Flow', searchQuery: 'NLE Choppa Shotta Flow', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 93 },
  { artist: 'NLE Choppa', title: 'Camelot', searchQuery: 'NLE Choppa Camelot', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 90 },
  { artist: 'Cordae', title: 'RNP (feat. Anderson .Paak)', searchQuery: 'Cordae RNP Anderson Paak', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 90 },
  { artist: 'Joey Bada$$', title: 'TEMPTATION', searchQuery: 'Joey Badass Temptation', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 90 },
  { artist: 'Joey Bada$$', title: 'Devastated', searchQuery: 'Joey Badass Devastated', verifiedYear: 2016, genre: 'Hip-Hop/Rap', recognitionScore: 91 },

  // ==========================================
  // CELINE DION (POP SUPERSTAR)
  // ==========================================
  { artist: 'Céline Dion', title: 'My Heart Will Go On (Love Theme from "Titanic")', searchQuery: 'Celine Dion My Heart Will Go On', verifiedYear: 1997, genre: 'Pop', recognitionScore: 99 },
  { artist: 'Céline Dion', title: 'It\'s All Coming Back to Me Now', searchQuery: 'Celine Dion Its All Coming Back to Me Now', verifiedYear: 1996, genre: 'Pop', recognitionScore: 95 },
  { artist: 'Céline Dion', title: 'Because You Loved Me', searchQuery: 'Celine Dion Because You Loved Me', verifiedYear: 1996, genre: 'Pop', recognitionScore: 94 },
  { artist: 'Céline Dion', title: 'The Power of Love', searchQuery: 'Celine Dion The Power of Love', verifiedYear: 1993, genre: 'Pop', recognitionScore: 94 },
  { artist: 'Céline Dion', title: 'All By Myself', searchQuery: 'Celine Dion All By Myself', verifiedYear: 1996, genre: 'Pop', recognitionScore: 93 },

  // ==========================================
  // ROCK / ALTERNATIVE LEGENDS
  // ==========================================
  { artist: 'Weezer', title: 'Buddy Holly', searchQuery: 'Weezer Buddy Holly', verifiedYear: 1994, genre: 'Rock', recognitionScore: 96 },
  { artist: 'Weezer', title: 'Say It Ain\'t So', searchQuery: 'Weezer Say It Aint So', verifiedYear: 1994, genre: 'Rock', recognitionScore: 96 },
  { artist: 'Weezer', title: 'Island In The Sun', searchQuery: 'Weezer Island In The Sun', verifiedYear: 2001, genre: 'Rock', recognitionScore: 95 },
  { artist: 'Weezer', title: 'Beverly Hills', searchQuery: 'Weezer Beverly Hills', verifiedYear: 2005, genre: 'Rock', recognitionScore: 94 },
  { artist: 'The White Stripes', title: 'Seven Nation Army', searchQuery: 'The White Stripes Seven Nation Army', verifiedYear: 2003, genre: 'Rock', recognitionScore: 99 },
  { artist: 'The White Stripes', title: 'Fell In Love With a Girl', searchQuery: 'The White Stripes Fell In Love With a Girl', verifiedYear: 2001, genre: 'Rock', recognitionScore: 92 },
  { artist: 'The White Stripes', title: 'Icky Thump', searchQuery: 'The White Stripes Icky Thump', verifiedYear: 2007, genre: 'Rock', recognitionScore: 90 },
  { artist: 'The Doors', title: 'Light My Fire', searchQuery: 'The Doors Light My Fire', verifiedYear: 1967, genre: 'Rock', recognitionScore: 97 },
  { artist: 'The Doors', title: 'Riders on the Storm', searchQuery: 'The Doors Riders on the Storm', verifiedYear: 1971, genre: 'Rock', recognitionScore: 96 },
  { artist: 'The Doors', title: 'Break on Through (To the Other Side)', searchQuery: 'The Doors Break on Through', verifiedYear: 1967, genre: 'Rock', recognitionScore: 94 },
  { artist: 'Eagles', title: 'Hotel California', searchQuery: 'Eagles Hotel California', verifiedYear: 1976, genre: 'Rock', recognitionScore: 99 },
  { artist: 'Eagles', title: 'Take It Easy', searchQuery: 'Eagles Take It Easy', verifiedYear: 1972, genre: 'Rock', recognitionScore: 95 },
  { artist: 'Eagles', title: 'Desperado', searchQuery: 'Eagles Desperado', verifiedYear: 1973, genre: 'Rock', recognitionScore: 93 },
  { artist: 'Journey', title: 'Don\'t Stop Believin\'', searchQuery: 'Journey Dont Stop Believin', verifiedYear: 1981, genre: 'Rock', recognitionScore: 99 },
  { artist: 'Journey', title: 'Any Way You Want It', searchQuery: 'Journey Any Way You Want It', verifiedYear: 1980, genre: 'Rock', recognitionScore: 94 },
  { artist: 'Journey', title: 'Faithfully', searchQuery: 'Journey Faithfully', verifiedYear: 1983, genre: 'Rock', recognitionScore: 93 },
  { artist: 'Journey', title: 'Separate Ways (Worlds Apart)', searchQuery: 'Journey Separate Ways', verifiedYear: 1983, genre: 'Rock', recognitionScore: 94 },
  { artist: 'Sublime', title: 'Santeria', searchQuery: 'Sublime Santeria', verifiedYear: 1996, genre: 'Rock', recognitionScore: 97 },
  { artist: 'Sublime', title: 'What I Got', searchQuery: 'Sublime What I Got', verifiedYear: 1996, genre: 'Rock', recognitionScore: 96 },
  { artist: 'Sublime', title: 'Badfish', searchQuery: 'Sublime Badfish', verifiedYear: 1992, genre: 'Rock', recognitionScore: 92 },
  { artist: 'Kings of Leon', title: 'Sex on Fire', searchQuery: 'Kings of Leon Sex on Fire', verifiedYear: 2008, genre: 'Rock', recognitionScore: 97 },
  { artist: 'Kings of Leon', title: 'Use Somebody', searchQuery: 'Kings of Leon Use Somebody', verifiedYear: 2008, genre: 'Rock', recognitionScore: 97 },
  { artist: 'Kings of Leon', title: 'Radioactive', searchQuery: 'Kings of Leon Radioactive', verifiedYear: 2010, genre: 'Rock', recognitionScore: 90 },
  { artist: 'Alice in Chains', title: 'Man in the Box', searchQuery: 'Alice in Chains Man in the Box', verifiedYear: 1990, genre: 'Rock', recognitionScore: 95 },
  { artist: 'Alice in Chains', title: 'Rooster', searchQuery: 'Alice in Chains Rooster', verifiedYear: 1992, genre: 'Rock', recognitionScore: 94 },
  { artist: 'Alice in Chains', title: 'Would?', searchQuery: 'Alice in Chains Would', verifiedYear: 1992, genre: 'Rock', recognitionScore: 93 },
  { artist: 'Papa Roach', title: 'Last Resort', searchQuery: 'Papa Roach Last Resort', verifiedYear: 2000, genre: 'Rock', recognitionScore: 98 },
  { artist: 'Papa Roach', title: 'Scars', searchQuery: 'Papa Roach Scars', verifiedYear: 2004, genre: 'Rock', recognitionScore: 92 },
  { artist: 'Ghost', title: 'Mary On A Cross', searchQuery: 'Ghost Mary On A Cross', verifiedYear: 2019, genre: 'Rock', recognitionScore: 96 },
  { artist: 'Ghost', title: 'Square Hammer', searchQuery: 'Ghost Square Hammer', verifiedYear: 2016, genre: 'Rock', recognitionScore: 90 },
  { artist: 'Ghost', title: 'Dance Macabre', searchQuery: 'Ghost Dance Macabre', verifiedYear: 2018, genre: 'Rock', recognitionScore: 90 },
  { artist: 'Pantera', title: 'Walk', searchQuery: 'Pantera Walk', verifiedYear: 1992, genre: 'Metal', recognitionScore: 96 },
  { artist: 'Pantera', title: 'Cowboys from Hell', searchQuery: 'Pantera Cowboys from Hell', verifiedYear: 1990, genre: 'Metal', recognitionScore: 95 },
  { artist: 'Pantera', title: 'Cemetery Gates', searchQuery: 'Pantera Cemetery Gates', verifiedYear: 1990, genre: 'Metal', recognitionScore: 92 },
  { artist: 'Def Leppard', title: 'Pour Some Sugar On Me', searchQuery: 'Def Leppard Pour Some Sugar On Me', verifiedYear: 1987, genre: 'Rock', recognitionScore: 97 },
  { artist: 'Def Leppard', title: 'Photograph', searchQuery: 'Def Leppard Photograph', verifiedYear: 1983, genre: 'Rock', recognitionScore: 93 },
  { artist: 'Def Leppard', title: 'Hysteria', searchQuery: 'Def Leppard Hysteria', verifiedYear: 1987, genre: 'Rock', recognitionScore: 93 },
  { artist: 'The Who', title: 'Baba O\'Riley', searchQuery: 'The Who Baba ORiley', verifiedYear: 1971, genre: 'Rock', recognitionScore: 98 },
  { artist: 'The Who', title: 'Behind Blue Eyes', searchQuery: 'The Who Behind Blue Eyes', verifiedYear: 1971, genre: 'Rock', recognitionScore: 94 },
  { artist: 'The Who', title: 'Won\'t Get Fooled Again', searchQuery: 'The Who Wont Get Fooled Again', verifiedYear: 1971, genre: 'Rock', recognitionScore: 94 },
  { artist: 'Ramones', title: 'Blitzkrieg Bop', searchQuery: 'Ramones Blitzkrieg Bop', verifiedYear: 1976, genre: 'Rock', recognitionScore: 97 },
  { artist: 'Ramones', title: 'I Wanna Be Sedated', searchQuery: 'Ramones I Wanna Be Sedated', verifiedYear: 1978, genre: 'Rock', recognitionScore: 96 },
  { artist: 'New Order', title: 'Blue Monday', searchQuery: 'New Order Blue Monday', verifiedYear: 1983, genre: 'Electronic', recognitionScore: 97 },
  { artist: 'New Order', title: 'Bizarre Love Triangle', searchQuery: 'New Order Bizarre Love Triangle', verifiedYear: 1986, genre: 'Electronic', recognitionScore: 94 },
  { artist: 'Toto', title: 'Africa', searchQuery: 'Toto Africa', verifiedYear: 1982, genre: 'Pop', recognitionScore: 99 },
  { artist: 'Toto', title: 'Rosanna', searchQuery: 'Toto Rosanna', verifiedYear: 1982, genre: 'Rock', recognitionScore: 93 },
  { artist: 'Toto', title: 'Hold the Line', searchQuery: 'Toto Hold the Line', verifiedYear: 1978, genre: 'Rock', recognitionScore: 93 },
  { artist: 'Stone Temple Pilots', title: 'Plush', searchQuery: 'Stone Temple Pilots Plush', verifiedYear: 1992, genre: 'Rock', recognitionScore: 95 },
  { artist: 'Stone Temple Pilots', title: 'Interstate Love Song', searchQuery: 'Stone Temple Pilots Interstate Love Song', verifiedYear: 1994, genre: 'Rock', recognitionScore: 94 },
  { artist: 'Blur', title: 'Song 2', searchQuery: 'Blur Song 2', verifiedYear: 1997, genre: 'Rock', recognitionScore: 98 },
  { artist: 'Good Charlotte', title: 'The Anthem', searchQuery: 'Good Charlotte The Anthem', verifiedYear: 2002, genre: 'Rock', recognitionScore: 94 },
  { artist: 'Good Charlotte', title: 'Lifestyles of the Rich & Famous', searchQuery: 'Good Charlotte Lifestyles of the Rich and Famous', verifiedYear: 2002, genre: 'Rock', recognitionScore: 93 },
  { artist: 'Goo Goo Dolls', title: 'Iris', searchQuery: 'Goo Goo Dolls Iris', verifiedYear: 1998, genre: 'Rock', recognitionScore: 99 },
  { artist: 'Goo Goo Dolls', title: 'Slide', searchQuery: 'Goo Goo Dolls Slide', verifiedYear: 1998, genre: 'Rock', recognitionScore: 93 },
  { artist: 'Franz Ferdinand', title: 'Take Me Out', searchQuery: 'Franz Ferdinand Take Me Out', verifiedYear: 2004, genre: 'Rock', recognitionScore: 97 },
  { artist: 'Jimmy Eat World', title: 'The Middle', searchQuery: 'Jimmy Eat World The Middle', verifiedYear: 2001, genre: 'Rock', recognitionScore: 97 },
  { artist: 'Snow Patrol', title: 'Chasing Cars', searchQuery: 'Snow Patrol Chasing Cars', verifiedYear: 2006, genre: 'Rock', recognitionScore: 98 },
  { artist: 'Keane', title: 'Somewhere Only We Know', searchQuery: 'Keane Somewhere Only We Know', verifiedYear: 2004, genre: 'Rock', recognitionScore: 98 },
  { artist: 'Two Door Cinema Club', title: 'What You Know', searchQuery: 'Two Door Cinema Club What You Know', verifiedYear: 2010, genre: 'Indie', recognitionScore: 95 },
  { artist: 'The Lumineers', title: 'Ho Hey', searchQuery: 'The Lumineers Ho Hey', verifiedYear: 2012, genre: 'Indie', recognitionScore: 97 },
  { artist: 'The Lumineers', title: 'Ophelia', searchQuery: 'The Lumineers Ophelia', verifiedYear: 2016, genre: 'Indie', recognitionScore: 95 },
  { artist: 'Mitski', title: 'My Love Mine All Mine', searchQuery: 'Mitski My Love Mine All Mine', verifiedYear: 2023, genre: 'Indie', recognitionScore: 96 },
  { artist: 'Mitski', title: 'Washing Machine Heart', searchQuery: 'Mitski Washing Machine Heart', verifiedYear: 2018, genre: 'Indie', recognitionScore: 94 },
  { artist: 'Mötley Crüe', title: 'Kickstart My Heart', searchQuery: 'Motley Crue Kickstart My Heart', verifiedYear: 1989, genre: 'Rock', recognitionScore: 96 },
  { artist: 'Faithless', title: 'Insomnia', searchQuery: 'Faithless Insomnia', verifiedYear: 1995, genre: 'Dance', recognitionScore: 96 },

  // ==========================================
  // LATIN SUPERSTARS (FEID, QUEVEDO, MANA, ETC.)
  // ==========================================
  { artist: 'Bizarrap & Quevedo', title: 'Quevedo: Bzrp Music Sessions, Vol. 52', searchQuery: 'Bizarrap Quevedo Music Sessions 52', verifiedYear: 2022, genre: 'Latin', recognitionScore: 98 },
  { artist: 'Quevedo', title: 'Columbia', searchQuery: 'Quevedo Columbia', verifiedYear: 2023, genre: 'Latin', recognitionScore: 95 },
  { artist: 'Quevedo', title: 'Playa Del Inglés (feat. Myke Towers)', searchQuery: 'Quevedo Playa Del Ingles', verifiedYear: 2022, genre: 'Latin', recognitionScore: 93 },
  { artist: 'Feid', title: 'LUNA', searchQuery: 'Feid ATL Jacob LUNA', verifiedYear: 2023, genre: 'Latin', recognitionScore: 96 },
  { artist: 'Feid', title: 'FELIZ CUMPLEAÑOS FERXXO', searchQuery: 'Feid FELIZ CUMPLEAÑOS FERXXO', verifiedYear: 2022, genre: 'Latin', recognitionScore: 95 },
  { artist: 'Feid', title: 'NORMAL', searchQuery: 'Feid NORMAL', verifiedYear: 2022, genre: 'Latin', recognitionScore: 94 },
  { artist: 'Feid & Young Miko', title: 'CLASSY 101', searchQuery: 'Feid Young Miko CLASSY 101', verifiedYear: 2023, genre: 'Latin', recognitionScore: 95 },
  { artist: 'Feid & Yandel', title: 'Yandel 150', searchQuery: 'Yandel Feid Yandel 150', verifiedYear: 2022, genre: 'Latin', recognitionScore: 94 },
  { artist: 'Eslabon Armado & Peso Pluma', title: 'Ella Baila Sola', searchQuery: 'Eslabon Armado Peso Pluma Ella Baila Sola', verifiedYear: 2023, genre: 'Latin', recognitionScore: 98 },
  { artist: 'Grupo Firme', title: 'Ya Superame (En Vivo)', searchQuery: 'Grupo Firme Ya Superame', verifiedYear: 2021, genre: 'Latin', recognitionScore: 94 },
  { artist: 'Maná', title: 'Oye Mi Amor', searchQuery: 'Mana Oye Mi Amor', verifiedYear: 1992, genre: 'Latin', recognitionScore: 96 },
  { artist: 'Maná', title: 'Clavado En Un Rincón', searchQuery: 'Mana Clavado En Un Rincon', verifiedYear: 1997, genre: 'Latin', recognitionScore: 95 },
  { artist: 'Maná', title: 'Rayando El Sol', searchQuery: 'Mana Rayando El Sol', verifiedYear: 1990, genre: 'Latin', recognitionScore: 95 },
  { artist: 'Aventura', title: 'Obsesión (feat. Judy Santos)', searchQuery: 'Aventura Obsesion', verifiedYear: 2002, genre: 'Latin', recognitionScore: 96 },
  { artist: 'Prince Royce', title: 'Darte un Beso', searchQuery: 'Prince Royce Darte un Beso', verifiedYear: 2013, genre: 'Latin', recognitionScore: 95 },
  { artist: 'Manuel Turizo', title: 'La Bachata', searchQuery: 'Manuel Turizo La Bachata', verifiedYear: 2022, genre: 'Latin', recognitionScore: 97 },
  { artist: 'Manuel Turizo', title: 'El Merengue (feat. Marshmello)', searchQuery: 'Marshmello Manuel Turizo El Merengue', verifiedYear: 2023, genre: 'Latin', recognitionScore: 94 },
  { artist: 'Sebastián Yatra', title: 'Tacones Rojos', searchQuery: 'Sebastian Yatra Tacones Rojos', verifiedYear: 2021, genre: 'Latin', recognitionScore: 95 },
  { artist: 'Camilo', title: 'Vida de Rico', searchQuery: 'Camilo Vida de Rico', verifiedYear: 2020, genre: 'Latin', recognitionScore: 94 },

  // ==========================================
  // COUNTRY & FOLK MAJOR HITS
  // ==========================================
  { artist: 'Dan + Shay & Justin Bieber', title: '10,000 Hours', searchQuery: 'Dan Shay Justin Bieber 10000 Hours', verifiedYear: 2019, genre: 'Country', recognitionScore: 96 },
  { artist: 'Dan + Shay', title: 'Tequila', searchQuery: 'Dan Shay Tequila', verifiedYear: 2018, genre: 'Country', recognitionScore: 94 },
  { artist: 'Dan + Shay', title: 'Speechless', searchQuery: 'Dan Shay Speechless', verifiedYear: 2018, genre: 'Country', recognitionScore: 93 },
  { artist: 'Florida Georgia Line', title: 'Cruise', searchQuery: 'Florida Georgia Line Cruise', verifiedYear: 2012, genre: 'Country', recognitionScore: 96 },
  { artist: 'Bebe Rexha & Florida Georgia Line', title: 'Meant to Be', searchQuery: 'Bebe Rexha Florida Georgia Line Meant to Be', verifiedYear: 2017, genre: 'Country', recognitionScore: 97 },
  { artist: 'Willie Nelson', title: 'On the Road Again', searchQuery: 'Willie Nelson On the Road Again', verifiedYear: 1980, genre: 'Country', recognitionScore: 96 },
  { artist: 'Willie Nelson', title: 'Always on My Mind', searchQuery: 'Willie Nelson Always on My Mind', verifiedYear: 1982, genre: 'Country', recognitionScore: 95 },

  // ==========================================
  // BEBE REXHA & POP EXPANSION
  // ==========================================
  { artist: 'David Guetta & Bebe Rexha', title: 'I\'m Good (Blue)', searchQuery: 'David Guetta Bebe Rexha Im Good Blue', verifiedYear: 2022, genre: 'Dance', recognitionScore: 97 },
  { artist: 'Martin Garrix & Bebe Rexha', title: 'In the Name of Love', searchQuery: 'Martin Garrix Bebe Rexha In the Name of Love', verifiedYear: 2016, genre: 'Dance', recognitionScore: 96 },
  { artist: 'ZAYN', title: 'PILLOWTALK', searchQuery: 'ZAYN PILLOWTALK', verifiedYear: 2016, genre: 'Pop', recognitionScore: 96 },
  { artist: 'ZAYN & Sia', title: 'Dusk Till Dawn', searchQuery: 'ZAYN Sia Dusk Till Dawn', verifiedYear: 2017, genre: 'Pop', recognitionScore: 96 },
  { artist: 'Troye Sivan', title: 'Rush', searchQuery: 'Troye Sivan Rush', verifiedYear: 2023, genre: 'Pop', recognitionScore: 94 },
  { artist: 'Troye Sivan', title: 'One of Your Girls', searchQuery: 'Troye Sivan One of Your Girls', verifiedYear: 2023, genre: 'Pop', recognitionScore: 93 },
  { artist: 'Rita Ora', title: 'Let You Love Me', searchQuery: 'Rita Ora Let You Love Me', verifiedYear: 2018, genre: 'Pop', recognitionScore: 94 },
  { artist: 'Rita Ora', title: 'Anywhere', searchQuery: 'Rita Ora Anywhere', verifiedYear: 2017, genre: 'Pop', recognitionScore: 92 },
  { artist: 'Gracie Abrams', title: 'I Love You, I\'m Sorry', searchQuery: 'Gracie Abrams I Love You Im Sorry', verifiedYear: 2024, genre: 'Pop', recognitionScore: 94 },
  { artist: 'Gracie Abrams', title: 'That\'s So True', searchQuery: 'Gracie Abrams Thats So True', verifiedYear: 2024, genre: 'Pop', recognitionScore: 95 },
  { artist: 'Kehlani', title: 'Gangsta', searchQuery: 'Kehlani Gangsta', verifiedYear: 2016, genre: 'R&B/Soul', recognitionScore: 93 },
  { artist: 'Kehlani', title: 'Nights Like This (feat. Ty Dolla $ign)', searchQuery: 'Kehlani Nights Like This Ty Dolla Sign', verifiedYear: 2019, genre: 'R&B/Soul', recognitionScore: 92 },
  { artist: 'Summer Walker & Drake', title: 'Girls Need Love (Remix)', searchQuery: 'Summer Walker Drake Girls Need Love', verifiedYear: 2019, genre: 'R&B/Soul', recognitionScore: 94 },
  { artist: 'Tory Lanez', title: 'The Color Violet', searchQuery: 'Tory Lanez The Color Violet', verifiedYear: 2021, genre: 'R&B/Soul', recognitionScore: 96 },
  { artist: 'Tory Lanez', title: 'Say It', searchQuery: 'Tory Lanez Say It', verifiedYear: 2015, genre: 'R&B/Soul', recognitionScore: 92 },
  { artist: 'Tory Lanez', title: 'LUV', searchQuery: 'Tory Lanez LUV', verifiedYear: 2016, genre: 'R&B/Soul', recognitionScore: 93 }
];

async function verifyAudio(url: string): Promise<boolean> {
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-1000' }
    });
    return res.ok || res.status === 206 || res.status === 200;
  } catch {
    return false;
  }
}

async function fetchMusicTrack(artist: string, title: string, query: string): Promise<{
  id: string;
  artist: string;
  title: string;
  album: string;
  artworkUrl?: string;
  previewUrl: string;
  provider: 'deezer' | 'itunes';
} | null> {
  const cleanQ = query.replace(/[^\w\s]/g, ' ').trim();
  const normTargetArt = normalizeText(artist);
  const normTargetTitle = normalizeText(title);

  // 1. Try Deezer Search API first (fast, reliable, no 403)
  try {
    const dRes = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(cleanQ)}&limit=5`, {
      signal: AbortSignal.timeout(3500)
    });
    if (dRes.ok) {
      const data = await dRes.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        const match = data.data.find((item: any) => {
          if (!item.preview) return false;
          const iArt = normalizeText(item.artist?.name || '');
          const iTrk = normalizeText(item.title || '');
          const artPrimary = normalizeText(extractPrimaryArtist(artist));

          const artOk = iArt.includes(artPrimary) || artPrimary.includes(iArt);
          const trkOk = iTrk.includes(normTargetTitle) || normTargetTitle.includes(iTrk);
          return artOk && trkOk;
        });

        if (match && match.preview) {
          return {
            id: `deezer_${match.id}`,
            artist,
            title,
            album: match.album?.title || '',
            artworkUrl: match.album?.cover_big || match.album?.cover_medium,
            previewUrl: match.preview,
            provider: 'deezer',
          };
        }
      }
    }
  } catch {
    // Fallback to iTunes
  }

  // 2. Fallback to iTunes Search API
  try {
    const itRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&entity=song&limit=5`, {
      signal: AbortSignal.timeout(3500)
    });
    if (itRes.ok) {
      const itData = await itRes.json();
      if (Array.isArray(itData.results) && itData.results.length > 0) {
        const match = itData.results.find((r: any) => {
          if (!r.previewUrl) return false;
          const rArt = normalizeText(r.artistName || '');
          const rTrk = normalizeText(r.trackName || '');
          const artPrimary = normalizeText(extractPrimaryArtist(artist));

          const artOk = rArt.includes(artPrimary) || artPrimary.includes(rArt);
          const trkOk = rTrk.includes(normTargetTitle) || normTargetTitle.includes(rTrk);
          return artOk && trkOk;
        });

        if (match && match.previewUrl) {
          return {
            id: `itunes_${match.trackId}`,
            artist,
            title,
            album: match.collectionName || '',
            artworkUrl: match.artworkUrl100 ? match.artworkUrl100.replace('100x100', '600x600') : undefined,
            previewUrl: match.previewUrl,
            provider: 'itunes',
          };
        }
      }
    }
  } catch {
    // Search failed
  }

  return null;
}

export async function overhaulCatalog() {
  console.log('=== STARTING MELODEX CATALOG QUALITY OVERHAUL & EXPANSION ===');

  const catalogRaw = JSON.parse(fs.readFileSync(CATALOG_DATA_PATH, 'utf-8')) as Song[];
  console.log(`Current catalog items: ${catalogRaw.length}`);

  const catalogMap = new Map<string, Song>();
  for (const s of catalogRaw) {
    catalogMap.set(s.id, s);
  }

  // 1. Ingest targeted missing iconic songs and major artists
  console.log(`Targeting ${TARGET_TRACKS.length} iconic missing tracks for verified ingestion...`);
  let addedCount = 0;
  let alreadyExists = 0;
  let failedCount = 0;

  for (let i = 0; i < TARGET_TRACKS.length; i++) {
    const target = TARGET_TRACKS[i];
    const normTargetArt = normalizeText(target.artist);
    const normTargetTitle = normalizeText(target.title);

    // Check if song already exists in catalog
    const existing = Array.from(catalogMap.values()).find((s) => {
      const a = normalizeText(s.artist);
      const t = normalizeText(s.title);
      return (
        (a.includes(normTargetArt) || normTargetArt.includes(a)) &&
        (t.includes(normTargetTitle) || normTargetTitle.includes(t))
      );
    });

    if (existing) {
      alreadyExists++;
      // Ensure recognitionScore is boosted if it was low
      existing.recognitionScore = Math.max(existing.recognitionScore ?? 75, target.recognitionScore);
      existing.verifiedOriginalYear = target.verifiedYear;
      existing.genre = target.genre;
      continue;
    }

    // Search Deezer / iTunes
    const track = await fetchMusicTrack(target.artist, target.title, target.searchQuery);
    if (!track) {
      console.warn(`[FAILED] No match for: ${target.artist} - ${target.title}`);
      failedCount++;
      await new Promise((r) => setTimeout(r, 100));
      continue;
    }

    // Verify audio stream
    const audioOk = await verifyAudio(track.previewUrl);
    if (!audioOk) {
      console.warn(`[FAILED] Dead audio preview for: ${target.artist} - ${target.title}`);
      failedCount++;
      await new Promise((r) => setTimeout(r, 100));
      continue;
    }

    // Create verified Song
    const newSong: Song = {
      id: track.id,
      title: target.title, // Use clean canonical title
      artist: target.artist, // Use clean canonical artist
      album: track.album || '',
      year: target.verifiedYear,
      verifiedOriginalYear: target.verifiedYear,
      yearConfidence: 'high',
      genre: target.genre,
      recognitionScore: target.recognitionScore,
      artworkUrl: track.artworkUrl,
      previewUrl: track.previewUrl,
      provider: track.provider,
    };

    catalogMap.set(newSong.id, newSong);
    addedCount++;
    console.log(`[ADDED] ${newSong.artist} - ${newSong.title} (${newSong.verifiedOriginalYear}) [Score: ${newSong.recognitionScore}]`);

    // Safe throttle
    await new Promise((r) => setTimeout(r, 120));
  }

  console.log(`\nTargeted Ingestion Summary:`);
  console.log(`  Added: ${addedCount}`);
  console.log(`  Already exists (updated): ${alreadyExists}`);
  console.log(`  Failed: ${failedCount}`);

  // 2. Comprehensive Recognition Score Rebalancing & Iconic Hits Boost
  console.log('\nRebalancing recognition scores across entire catalog...');

  // Diamond / Iconic hits that must have 95+ recognition
  const ICONIC_HITS_BOOST: { pattern: RegExp; score: number }[] = [
    { pattern: /pitbull.*timber/i, score: 96 },
    { pattern: /shakira.*waka waka/i, score: 97 },
    { pattern: /shakira.*hips don't lie/i, score: 98 },
    { pattern: /eminem.*lose yourself/i, score: 99 },
    { pattern: /queen.*bohemian rhapsody/i, score: 99 },
    { pattern: /queen.*we will rock you/i, score: 98 },
    { pattern: /michael jackson.*billie jean/i, score: 99 },
    { pattern: /michael jackson.*thriller/i, score: 99 },
    { pattern: /michael jackson.*beat it/i, score: 98 },
    { pattern: /the beatles.*hey jude/i, score: 99 },
    { pattern: /nirvana.*smells like teen spirit/i, score: 99 },
    { pattern: /gotye.*somebody that i used to know/i, score: 97 },
    { pattern: /foster the people.*pumped up kicks/i, score: 96 },
    { pattern: /passenger.*let her go/i, score: 96 },
    { pattern: /walk the moon.*shut up and dance/i, score: 96 },
    { pattern: /magic!.*rude/i, score: 95 },
    { pattern: /vance joy.*riptide/i, score: 95 },
    { pattern: /hozier.*take me to church/i, score: 96 },
    { pattern: /psy.*gangnam style/i, score: 98 },
    { pattern: /bruno mars.*uptown funk/i, score: 98 },
    { pattern: /avicii.*wake me up/i, score: 98 },
    { pattern: /ed sheeran.*shape of you/i, score: 98 },
    { pattern: /luis fonsi.*despacito/i, score: 99 },
    { pattern: /post malone.*rockstar/i, score: 97 },
    { pattern: /post malone.*sunflower/i, score: 98 },
    { pattern: /post malone.*congratulations/i, score: 96 },
    { pattern: /juice wrld.*lucid dreams/i, score: 97 },
    { pattern: /xxxtentacion.*sad!/i, score: 97 },
    { pattern: /lil uzi vert.*xo tour llif3/i, score: 97 },
    { pattern: /fetty wap.*trap queen/i, score: 96 },
    { pattern: /fetty wap.*679/i, score: 95 },
    { pattern: /lil skies.*nowadays/i, score: 92 },
    { pattern: /lil skies.*red roses/i, score: 92 },
    { pattern: /lil tecca.*ransom/i, score: 95 },
    { pattern: /lil mosey.*noticed/i, score: 92 },
    { pattern: /lil mosey.*blueberry faygo/i, score: 95 },
    { pattern: /famous dex.*japan/i, score: 93 },
    { pattern: /famous dex.*pick it up/i, score: 92 },
    { pattern: /youngboy never broke again.*outside today/i, score: 93 },
    { pattern: /trippie redd.*dark knight dummo/i, score: 93 },
    { pattern: /lil pump.*gucci gang/i, score: 94 },
    { pattern: /jack harlow.*whats poppin/i, score: 94 },
    { pattern: /jack harlow.*first class/i, score: 94 },
    { pattern: /jack harlow.*lovin on me/i, score: 93 },
  ];

  let boostedCount = 0;
  for (const song of catalogMap.values()) {
    const combo = `${song.artist} ${song.title}`;
    for (const rule of ICONIC_HITS_BOOST) {
      if (rule.pattern.test(combo)) {
        song.recognitionScore = Math.max(song.recognitionScore ?? 75, rule.score);
        boostedCount++;
        break;
      }
    }
  }
  console.log(`Boosted ${boostedCount} iconic tracks to highest recognition tier.`);

  // 3. Remove Obscure Filler (tracks from unknown one-off artists that have low recognition)
  console.log('\nPruning low-value obscure filler...');
  const artistTrackCounts = new Map<string, number>();
  for (const s of catalogMap.values()) {
    const a = normalizeText(extractPrimaryArtist(s.artist));
    artistTrackCounts.set(a, (artistTrackCounts.get(a) || 0) + 1);
  }

  // Famous one-hit wonders or iconic artists to NEVER remove
  const PROTECTED_ARTISTS = new Set([
    'gotye', 'passenger', 'walk the moon', 'magic', 'vance joy', 'hozier', 'psy',
    'silento', 'baauer', 'ylvis', 'desiigner', 'omi', 'gnarls barkley', 'lumineers',
    'foster the people', 'carly rae jepsen', 'surfaces', 'glass animals', 'saint jhn',
    'lil nas x', 'chubby checker', 'los del rio', 'lou bega', 'smash mouth', 'wheatus',
    'american authors', 'capital cities', 'milky chance', 'of monsters and men',
    'portugal the man', 'fitz and the tantrums', 'eiffel 65', 'darude', 'edward maya'
  ]);

  let prunedCount = 0;
  for (const [id, song] of catalogMap.entries()) {
    const aKey = normalizeText(extractPrimaryArtist(song.artist));
    const count = artistTrackCounts.get(aKey) || 0;
    const score = song.recognitionScore ?? 75;

    // Remove if single-track artist with low score (<65) AND not a protected one-hit wonder AND not curated
    if (count === 1 && score < 66 && !PROTECTED_ARTISTS.has(aKey)) {
      // Check title for known massive single
      const t = normalizeText(song.title);
      if (t.length < 3) continue;
      catalogMap.delete(id);
      prunedCount++;
    }
  }
  console.log(`Pruned ${prunedCount} obscure filler tracks.`);

  const finalCatalog = Array.from(catalogMap.values());
  console.log(`\nFinal Healthy Playable Catalog size: ${finalCatalog.length}`);

  // Write catalog to all persistent files
  console.log('Persisting catalog to src/data and public...');
  fs.writeFileSync(CATALOG_DATA_PATH, JSON.stringify(finalCatalog, null, 2), 'utf-8');
  fs.writeFileSync(CATALOG_ALT_PATH, JSON.stringify(finalCatalog, null, 2), 'utf-8');
  fs.writeFileSync(CATALOG_PUBLIC_PATH, JSON.stringify(finalCatalog, null, 2), 'utf-8');

  console.log('=== OVERHAUL COMPLETED SUCCESSFULLY ===');
}

overhaulCatalog().catch(console.error);
