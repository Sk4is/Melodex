import fs from 'fs';
import path from 'path';
import { Song } from '../src/types/song';
import { computeNormalizedGenres } from '../src/utils/genreUtils';

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fast audio probe to verify playable audio stream
async function probeAudioUrl(url: string, timeoutMs = 3500): Promise<boolean> {
  if (!url || !url.startsWith('http')) return false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-4096' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.status === 200 || res.status === 206;
  } catch {
    return false;
  }
}

// iTunes Search
async function searchItunes(term: string, limit = 50): Promise<any[]> {
  try {
    const url = `${ITUNES_SEARCH_URL}?term=${encodeURIComponent(term)}&entity=song&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.results) ? data.results : [];
  } catch {
    return [];
  }
}

// iTunes Album Lookup
async function lookupAlbumTracks(albumTerm: string): Promise<any[]> {
  try {
    const url = `${ITUNES_SEARCH_URL}?term=${encodeURIComponent(albumTerm)}&entity=song&limit=50`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.results) ? data.results : [];
  } catch {
    return [];
  }
}

// Targeted List of Major Artists to Expand
const MAJOR_ARTISTS_TARGETS: {
  artist: string;
  defaultGenre: string;
  minDepth: number;
  priorityTracks?: string[];
}[] = [
  // 1. Lil Skies (High Priority)
  {
    artist: 'Lil Skies',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 25,
    priorityTracks: [
      'Red Roses',
      'Lust',
      'Nowadays',
      'Welcome to the Rodeo',
      'Signs of Jealousy',
      'The Morals',
      'Boss Moves',
      'Big Hits',
      'Garden',
      'Through the Day',
      'Tell My Haters',
      'Kill4something',
      'Cloudy Skies',
      'Strictly Business',
      'I',
      'Breathe',
      'Name in the Sand',
      'Flooded',
      'Stop the Madness',
      'No Rest',
      'Creeping',
      'Havin My Way',
      'Riot',
      'Ok',
      'Magic',
      'Fidget',
      'My Baby',
      'PlayThisWhenImGone',
    ],
  },
  // Pop Icons & Superstars
  {
    artist: 'Michael Jackson',
    defaultGenre: 'Pop',
    minDepth: 25,
    priorityTracks: [
      'Billie Jean', 'Beat It', 'Thriller', 'Smooth Criminal', 'Bad', 'Black or White',
      'Rock With You', "Don't Stop 'Til You Get Enough", 'Man in the Mirror', 'The Way You Make Me Feel',
      'Dirty Diana', 'Remember the Time', "They Don't Care About Us", 'Earth Song', 'You Rock My World',
      "Wanna Be Startin' Somethin'", 'P.Y.T.', 'Off the Wall', 'Human Nature', 'Heal the World'
    ],
  },
  {
    artist: 'Madonna',
    defaultGenre: 'Pop',
    minDepth: 25,
    priorityTracks: [
      'Like a Prayer', 'Like a Virgin', 'Material Girl', 'Vogue', 'Hung Up', 'Holiday',
      'Into the Groove', "Papa Don't Preach", 'La Isla Bonita', '4 Minutes', 'Frozen',
      'Music', 'Express Yourself', 'Ray of Light', 'Crazy for You', 'Open Your Heart'
    ],
  },
  {
    artist: 'Prince',
    defaultGenre: 'Pop',
    minDepth: 22,
    priorityTracks: [
      'Purple Rain', 'When Doves Cry', '1999', 'Little Red Corvette', 'Kiss', "Let's Go Crazy",
      'I Wanna Be Your Lover', 'Raspberry Beret', 'Sign o the Times', 'Cream', 'Diamonds and Pearls'
    ],
  },
  {
    artist: 'Whitney Houston',
    defaultGenre: 'R&B/Soul',
    minDepth: 22,
    priorityTracks: [
      'I Will Always Love You', 'I Wanna Dance with Somebody', 'How Will I Know', 'Greatest Love of All',
      'Saving All My Love for You', 'I Have Nothing', 'Where Do Broken Hearts Go', 'Run to You',
      "It's Not Right but It's Okay", 'My Love Is Your Love', "I'm Every Woman", 'Step by Step'
    ],
  },
  {
    artist: 'Elton John',
    defaultGenre: 'Pop',
    minDepth: 25,
    priorityTracks: [
      'Rocket Man', 'Tiny Dancer', 'Your Song', "I'm Still Standing", 'Bennie and the Jets',
      'Goodbye Yellow Brick Road', "Don't Go Breaking My Heart", 'Crocodile Rock', 'Candle in the Wind',
      'Cold Heart', 'Sacrifice', 'Can You Feel the Love Tonight', 'Circle of Life'
    ],
  },
  {
    artist: 'ABBA',
    defaultGenre: 'Pop',
    minDepth: 22,
    priorityTracks: [
      'Dancing Queen', 'Mamma Mia', 'Gimme! Gimme! Gimme!', 'Waterloo', 'The Winner Takes It All',
      'Super Trouper', 'Take a Chance on Me', 'Voulez-Vous', 'SOS', 'Money, Money, Money',
      'Chiquitita', 'Lay All Your Love on Me', 'Fernando', 'Knowing Me, Knowing You'
    ],
  },
  {
    artist: 'Britney Spears',
    defaultGenre: 'Pop',
    minDepth: 25,
    priorityTracks: [
      '...Baby One More Time', 'Oops!... I Did It Again', 'Toxic', 'Gimme More', 'Womanizer',
      'Circus', 'Piece of Me', 'Stronger', '(You Drive Me) Crazy', "I'm a Slave 4 U",
      'Everytime', 'Lucky', 'Work Bitch', 'Till the World Ends', 'If U Seek Amy'
    ],
  },
  {
    artist: 'Beyoncé',
    defaultGenre: 'R&B/Soul',
    minDepth: 25,
    priorityTracks: [
      'Crazy in Love', 'Halo', 'Single Ladies', 'Love on Top', 'Irreplaceable', 'If I Were a Boy',
      'Run the World (Girls)', 'Drunk in Love', 'CUFF IT', 'TEXAS HOLD EM', 'BREAK MY SOUL',
      'Formation', 'Partition', '7/11', 'Best Thing I Never Had', 'Sweet Dreams'
    ],
  },
  {
    artist: 'Rihanna',
    defaultGenre: 'Pop',
    minDepth: 30,
    priorityTracks: [
      'Umbrella', 'Diamonds', 'We Found Love', 'Stay', 'Work', 'Only Girl (In the World)',
      'Disturbia', "Don't Stop the Music", 'SOS', 'Pon de Replay', 'Rude Boy', 'S&M',
      'Where Have You Been', 'Love on the Brain', 'Needed Me', 'Love the Way You Lie',
      'Bitch Better Have My Money', 'Take a Bow', 'Shut Up and Drive'
    ],
  },
  {
    artist: 'Lady Gaga',
    defaultGenre: 'Pop',
    minDepth: 25,
    priorityTracks: [
      'Bad Romance', 'Poker Face', 'Just Dance', 'Paparazzi', 'Born This Way', 'Shallow',
      'Telephone', 'Alejandro', 'Judas', 'Applause', 'Million Reasons', 'Rain on Me',
      'Always Remember Us This Way', 'The Edge of Glory', 'LoveGame', 'Die With a Smile'
    ],
  },
  {
    artist: 'Shakira',
    defaultGenre: 'Latin',
    minDepth: 25,
    priorityTracks: [
      "Hips Don't Lie", 'Whenever, Wherever', 'Waka Waka', 'She Wolf', "Can't Remember to Forget You",
      'Chantaje', 'La Tortura', 'Loca', 'Rabiosa', 'Bzrp Music Sessions, Vol. 53', 'Te Felicito',
      'Monotonía', 'TQG', 'Puntería', 'Ojos Así', 'Suerte'
    ],
  },
  {
    artist: 'Black Eyed Peas',
    defaultGenre: 'Pop',
    minDepth: 22,
    priorityTracks: [
      'I Gotta Feeling', 'Where Is the Love?', 'Boom Boom Pow', 'Pump It', "Let's Get It Started",
      'Meet Me Halfway', 'My Humps', 'The Time (Dirty Bit)', "Don't Phunk with My Heart",
      "Just Can't Get Enough", 'Shut Up', "Don't Stop the Party", 'MAMACITA', 'RITMO'
    ],
  },
  {
    artist: 'Maroon 5',
    defaultGenre: 'Pop',
    minDepth: 25,
    priorityTracks: [
      'Sugar', 'Moves Like Jagger', 'She Will Be Loved', 'Maps', 'Payphone', 'Animals',
      'This Love', 'Girls Like You', 'One More Night', 'Memories', 'Sunday Morning',
      'Makes Me Wonder', "Won't Go Home Without You", 'Misery', 'Daylight'
    ],
  },
  {
    artist: 'Taylor Swift',
    defaultGenre: 'Pop',
    minDepth: 35,
    priorityTracks: [
      'Blank Space', 'Shake It Off', 'Cruel Summer', 'Anti-Hero', 'Love Story', 'You Belong With Me',
      'I Knew You Were Trouble', 'Style', 'Bad Blood', 'cardigan', 'willow', 'Look What You Made Me Do',
      'Lover', 'Delicate', 'Enchanted', 'All Too Well', 'Karma', 'Fortnight', 'I Can Do It With a Broken Heart',
      'We Are Never Ever Getting Back Together', '22', 'Wildest Dreams', 'Getaway Car'
    ],
  },
  {
    artist: 'The Weeknd',
    defaultGenre: 'R&B/Soul',
    minDepth: 30,
    priorityTracks: [
      'Blinding Lights', 'Starboy', "Can't Feel My Face", 'The Hills', 'Save Your Tears',
      'Die for You', 'Call Out My Name', 'Often', 'I Feel It Coming', 'In Your Eyes',
      'Earned It', 'Heartless', 'Take My Breath', 'Out of Time', 'Sacrifice', 'Creepin',
      'Popular', 'Dancing in the Flames', 'Timeless', 'Wicked Games'
    ],
  },
  {
    artist: 'Adele',
    defaultGenre: 'Pop',
    minDepth: 22,
    priorityTracks: [
      'Rolling in the Deep', 'Someone Like You', 'Set Fire to the Rain', 'Hello', 'Easy On Me',
      'Skyfall', 'When We Were Young', 'Send My Love', 'Chasing Pavements', 'Hometown Glory',
      'Make You Feel My Love', 'Oh My God', 'I Drink Wine', 'Rumour Has It'
    ],
  },
  {
    artist: 'Bruno Mars',
    defaultGenre: 'Pop',
    minDepth: 25,
    priorityTracks: [
      'Uptown Funk', '24K Magic', "That's What I Like", 'Just the Way You Are', 'Grenade',
      'Locked Out of Heaven', 'When I Was Your Man', 'Treasure', 'Count on Me', 'Leave the Door Open',
      'Smokin Out the Window', 'Skate', 'Marry You', 'Versace on the Floor', 'Die With a Smile'
    ],
  },
  {
    artist: 'Justin Bieber',
    defaultGenre: 'Pop',
    minDepth: 30,
    priorityTracks: [
      'Baby', 'Sorry', 'Love Yourself', 'What Do You Mean?', 'Peaches', 'STAY', 'Ghost',
      'Intentions', 'Boyfriend', 'As Long As You Love Me', 'Beauty and a Beat', 'Company',
      'Yummy', 'Holy', 'Never Say Never', 'Where Are Ü Now'
    ],
  },
  {
    artist: 'Ariana Grande',
    defaultGenre: 'Pop',
    minDepth: 30,
    priorityTracks: [
      '7 rings', 'thank u, next', 'Side to Side', 'no tears left to cry', 'Into You',
      'positions', 'Bang Bang', 'Problem', 'Break Free', 'One Last Time', 'Dangerous Woman',
      'God is a woman', 'we cant be friends', 'yes, and?', '34+35', 'pov', 'Santa Tell Me'
    ],
  },
  {
    artist: 'Ed Sheeran',
    defaultGenre: 'Pop',
    minDepth: 25,
    priorityTracks: [
      'Shape of You', 'Perfect', 'Thinking Out Loud', 'Photograph', 'Bad Habits', 'Shivers',
      'Castle on the Hill', 'Galway Girl', 'The A Team', 'Sing', "Don't", "I Don't Care",
      'Beautiful People', 'Eyes Closed', 'Give Me Love', 'Happier'
    ],
  },
  {
    artist: 'Sia',
    defaultGenre: 'Pop',
    minDepth: 20,
    priorityTracks: [
      'Chandelier', 'Cheap Thrills', 'Elastic Heart', 'Unstoppable', 'Titanium', 'Alive',
      'The Greatest', 'Snowman', 'Together', 'Move Your Body', 'Big Girls Cry'
    ],
  },
  {
    artist: 'Dua Lipa',
    defaultGenre: 'Pop',
    minDepth: 25,
    priorityTracks: [
      'Levitating', "Don't Start Now", 'New Rules', 'Physical', 'Break My Heart', 'One Kiss',
      'IDGAF', 'Love Again', 'Dance the Night', 'Houdini', 'Training Season', 'Illusion',
      'Blow Your Mind (Mwah)', 'Hallucinate', 'Be the One', 'Cold Heart'
    ],
  },
  {
    artist: 'Billie Eilish',
    defaultGenre: 'Pop',
    minDepth: 25,
    priorityTracks: [
      'bad guy', 'lovely', 'ocean eyes', 'when the party is over', 'everything i wanted',
      'Happier Than Ever', 'bury a friend', 'idontwannabeyouanymore', 'bellyache',
      'What Was I Made For?', 'BIRDS OF A FEATHER', 'LUNCH', 'CHIHIRO', 'Therefore I Am',
      'you should see me in a crown'
    ],
  },
  {
    artist: 'Olivia Rodrigo',
    defaultGenre: 'Pop',
    minDepth: 20,
    priorityTracks: [
      'drivers license', 'good 4 u', 'deja vu', 'traitor', 'happier', 'vampire',
      'bad idea right?', 'get him back!', 'brutal', 'favorite crime', 'jealousy, jealousy',
      'love is embarrassing', 'obsessed', 'all-american bitch'
    ],
  },
  {
    artist: 'Pitbull',
    defaultGenre: 'Pop',
    minDepth: 25,
    priorityTracks: [
      'Give Me Everything', 'Timber', 'Fireball', 'Time of Our Lives', "Don't Stop the Party",
      'Hotel Room Service', 'I Know You Want Me (Calle Ocho)', 'Rain Over Me', 'Feel This Moment',
      'International Love', 'Hey Baby (Drop It to the Floor)', 'On the Floor'
    ],
  },

  // Rock & Alternative Icons
  {
    artist: 'Queen',
    defaultGenre: 'Rock',
    minDepth: 25,
    priorityTracks: [
      'Bohemian Rhapsody', "Don't Stop Me Now", 'Another One Bites the Dust', 'We Will Rock You',
      'We Are the Champions', 'Radio Ga Ga', 'Under Pressure', 'Somebody to Love', 'I Want to Break Free',
      'Killer Queen', 'Crazy Little Thing Called Love', 'The Show Must Go On', 'Fat Bottomed Girls', 'Bicycle Race'
    ],
  },
  {
    artist: 'The Beatles',
    defaultGenre: 'Rock',
    minDepth: 30,
    priorityTracks: [
      'Hey Jude', 'Here Comes the Sun', 'Let It Be', 'Yesterday', 'Come Together', 'Eleanor Rigby',
      'Help!', 'All You Need Is Love', 'Something', 'In My Life', 'Twist and Shout', 'Yellow Submarine',
      'Blackbird', 'While My Guitar Gently Weeps', 'Penny Lane', 'Strawberry Fields Forever', 'Lucy in the Sky with Diamonds'
    ],
  },
  {
    artist: 'Fleetwood Mac',
    defaultGenre: 'Rock',
    minDepth: 22,
    priorityTracks: [
      'Dreams', 'The Chain', 'Go Your Own Way', 'Everywhere', 'Rhiannon', 'Landslide', "Don't Stop",
      'Gypsy', 'Little Lies', 'You Make Loving Fun', 'Sara', 'Big Love', 'Seven Wonders'
    ],
  },
  {
    artist: 'AC/DC',
    defaultGenre: 'Rock',
    minDepth: 25,
    priorityTracks: [
      'Back in Black', 'Highway to Hell', 'Thunderstruck', 'You Shook Me All Night Long', 'T.N.T.',
      'Hells Bells', 'Shoot to Thrill', 'Dirty Deeds Done Dirt Cheap', 'For Those About to Rock',
      'Whole Lotta Rosie', "It's a Long Way to the Top"
    ],
  },
  {
    artist: 'Nirvana',
    defaultGenre: 'Rock',
    minDepth: 22,
    priorityTracks: [
      'Smells Like Teen Spirit', 'Come as You Are', 'Heart-Shaped Box', 'In Bloom', 'Lithium',
      'All Apologies', 'The Man Who Sold the World', 'About a Girl', 'Polly', 'Dumb', 'Pennyroyal Tea'
    ],
  },
  {
    artist: 'Oasis',
    defaultGenre: 'Rock',
    minDepth: 22,
    priorityTracks: [
      'Wonderwall', "Don't Look Back in Anger", 'Champagne Supernova', 'Stand by Me', 'Live Forever',
      'Supersonic', 'Stop Crying Your Heart Out', 'Slide Away', 'Half the World Away', "She's Electric"
    ],
  },
  {
    artist: 'Radiohead',
    defaultGenre: 'Rock',
    minDepth: 20,
    priorityTracks: [
      'Creep', 'Karma Police', 'No Surprises', 'High and Dry', 'Fake Plastic Trees', 'Paranoid Android',
      'Reckoner', 'Jigsaw Falling Into Place', '15 Step', 'Exit Music (For a Film)', 'Street Spirit'
    ],
  },
  {
    artist: 'Red Hot Chili Peppers',
    defaultGenre: 'Rock',
    minDepth: 25,
    priorityTracks: [
      'Californication', 'Under the Bridge', "Can't Stop", 'Scar Tissue', 'Snow (Hey Oh)',
      'Dani California', 'Otherside', 'By the Way', 'Give It Away', 'Tell Me Baby', 'Dark Necessities'
    ],
  },
  {
    artist: 'Green Day',
    defaultGenre: 'Rock',
    minDepth: 25,
    priorityTracks: [
      'Basket Case', 'Boulevard of Broken Dreams', 'American Idiot', 'Wake Me Up When September Ends',
      'Good Riddance (Time of Your Life)', '21 Guns', 'Holiday', 'When I Come Around', 'Brain Stew',
      'Jesus of Suburbia', '21st Century Breakdown'
    ],
  },
  {
    artist: 'Linkin Park',
    defaultGenre: 'Rock',
    minDepth: 25,
    priorityTracks: [
      'In the End', 'Numb', 'Faint', 'Crawling', 'One Step Closer', 'Somewhere I Belong',
      'Breaking the Habit', 'What I Have Done', 'Bleed It Out', 'Shadow of the Day',
      'Leave Out All the Rest', 'Burn It Down', 'Castle of Glass', 'New Divide', 'Numb / Encore',
      'The Emptiness Machine', 'Heavy Is the Crown'
    ],
  },
  {
    artist: 'Coldplay',
    defaultGenre: 'Rock',
    minDepth: 25,
    priorityTracks: [
      'Yellow', 'The Scientist', 'Fix You', 'Viva La Vida', 'Clocks', 'Paradise',
      'A Sky Full of Stars', 'Hymn for the Weekend', 'Adventure of a Lifetime', 'In My Place',
      'Speed of Sound', 'Magic', 'Everglow', 'Higher Power', 'My Universe'
    ],
  },
  {
    artist: 'Imagine Dragons',
    defaultGenre: 'Rock',
    minDepth: 22,
    priorityTracks: [
      'Radioactive', 'Believer', 'Demons', 'Thunder', 'Whatever It Takes', 'Enemy',
      'Natural', 'Bones', "It's Time", 'Bad Liar', 'On Top of the World', 'Sharks'
    ],
  },
  {
    artist: 'OneRepublic',
    defaultGenre: 'Pop',
    minDepth: 20,
    priorityTracks: [
      'Counting Stars', 'Apologize', 'Secrets', 'Good Life', "I Ain't Worried",
      'All the Right Moves', 'Stop and Stare', 'Love Runs Out', 'If I Lose Myself', 'Rescue Me'
    ],
  },

  // Hip-Hop / Rap Icons & 2010s Melodic Legends
  {
    artist: 'Eminem',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 30,
    priorityTracks: [
      'Lose Yourself', 'Without Me', 'The Real Slim Shady', 'Stan', 'Mockingbird',
      'Love the Way You Lie', 'Not Afraid', "'Till I Collapse", 'Godzilla', 'Rap God',
      "When I'm Gone", "Cleanin' Out My Closet", 'The Monster', 'Venom', 'Houdini', 'Somebody Save Me'
    ],
  },
  {
    artist: '50 Cent',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 22,
    priorityTracks: [
      'In da Club', 'Candy Shop', '21 Questions', 'Many Men', 'P.I.M.P.', 'Just a Lil Bit',
      'Disco Inferno', 'Window Shopper', 'Best Friend', 'Ayo Technology', 'Hate It or Love It',
      'Baby By Me', 'Wanksta', 'I Get Money'
    ],
  },
  {
    artist: 'Kanye West',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 30,
    priorityTracks: [
      'Stronger', 'Gold Digger', 'Heartless', 'Flashing Lights', 'POWER', 'Runaway',
      'All of the Lights', "Can't Tell Me Nothing", 'Good Life', 'Bound 2',
      'Father Stretch My Hands Pt. 1', 'Touch the Sky', 'Love Lockdown', 'Praise God', 'CARNIVAL'
    ],
  },
  {
    artist: 'Lil Wayne',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 25,
    priorityTracks: [
      'Lollipop', 'A Milli', '6 Foot 7 Foot', 'How to Love', 'Mirror', 'Drop the World',
      'Love Me', 'Mona Lisa', 'Mrs. Officer', 'Got Money', 'Right Above It', 'She Will'
    ],
  },
  {
    artist: 'Drake',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 35,
    priorityTracks: [
      "God's Plan", 'One Dance', 'Hotline Bling', 'In My Feelings', 'Passionfruit',
      'Hold On, We are Going Home', 'Nonstop', 'Laugh Now Cry Later', 'Rich Flex',
      'Started From the Bottom', 'Toosie Slide', 'Jimmy Cooks', 'Sticky', 'IDGAF',
      'First Person Shooter', 'Take Care', 'Headlines', 'Controlla', 'Nice For What'
    ],
  },
  {
    artist: 'Nicki Minaj',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 25,
    priorityTracks: [
      'Super Bass', 'Starships', 'Anaconda', 'Chun-Li', 'Super Freaky Girl', 'Bang Bang',
      'Moment 4 Life', 'Pound the Alarm', 'Va Va Voom', 'BedRock', 'Only', 'Fly',
      'Pills N Potions', 'Red Ruby Da Sleeze', 'Everybody', 'FTCU'
    ],
  },
  {
    artist: 'J. Cole',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 25,
    priorityTracks: [
      'No Role Modelz', 'MIDDLE CHILD', 'Wet Dreamz', 'Power Trip', 'Deja Vu', 'Work Out',
      'Crooked Smile', 'ATM', "Kevin's Heart", 'Neighbors', 'Apparently', 'G.O.M.D.',
      'p r i d e . i s . t h e . d e v i l', 'm y . l i f e', 'She Knows'
    ],
  },
  {
    artist: 'Kendrick Lamar',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 25,
    priorityTracks: [
      'HUMBLE.', 'Alright', 'DNA.', 'Swimming Pools (Drank)', 'King Kunta', 'LOVE.',
      'LOYALTY.', "Bitch, Don't Kill My Vibe", 'Money Trees', 'Not Like Us', 'Euphoria',
      'Count Me Out', 'N95', 'All The Stars', 'Poetic Justice', 'ELEMENT.'
    ],
  },
  {
    artist: 'Future',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 25,
    priorityTracks: [
      'Mask Off', 'Life Is Good', 'March Madness', 'Fuck Up Some Commas', 'Low Life',
      'Codeine Crazy', 'WAIT FOR U', 'Like That', 'Superhero (Heroes & Villains)',
      'Too Comfortable', 'Thought It Was a Drought', 'Where Ya At', 'Stick Talk', 'Solo'
    ],
  },
  {
    artist: 'Travis Scott',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 25,
    priorityTracks: [
      'SICKO MODE', 'goosebumps', 'HIGHEST IN THE ROOM', 'Antidote', 'BUTTERFLY EFFECT',
      'FE!N', 'MELTDOWN', 'MY EYES', 'TELEKINESIS', 'I KNOW ?', "CAN'T SAY", 'STARGAZING',
      'YOSEMITE', 'FRANCHISE', 'beibs in the trap', '90210'
    ],
  },
  {
    artist: 'Juice WRLD',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 25,
    priorityTracks: [
      'Lucid Dreams', 'All Girls Are the Same', 'Robbery', 'Bandit', 'Come & Go',
      'Wishing Well', 'Legends', 'Righteous', 'Lean Wit Me', 'Armed and Dangerous',
      'Black & White', 'Hear Me Calling', 'Fast', 'Hate the Other Side', 'Already Dead', 'In My Head'
    ],
  },
  {
    artist: 'XXXTentacion',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 25,
    priorityTracks: [
      'SAD!', 'Moonlight', 'Jocelyn Flores', 'Look At Me!', 'changes', 'Fuck Love',
      'Hope', 'Everybody Dies In Their Nightmares', 'Revenge', 'Falling Down', 'BAD!',
      'the remedy for a broken heart', 'NUMB', 'Depression & Obsession'
    ],
  },
  {
    artist: 'Lil Uzi Vert',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 25,
    priorityTracks: [
      'XO Tour Llif3', '20 Min', 'The Way Life Goes', 'Money Longer', 'You Was Right',
      'Just Wanna Rock', 'Myron', 'Sauce It Up', 'Erase Your Social', 'Do What I Want',
      "P's & Q's", 'Dark Queen', 'Bean (Kobe)', 'Futsal Shuffle 2020', 'Baby Pluto'
    ],
  },
  {
    artist: 'Trippie Redd',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 22,
    priorityTracks: [
      'Dark Knight Dummo', 'Love Scars', 'Topanga', 'Taking a Walk', 'Miss the Rage',
      'Poles1469', 'Who Needs Love', '1400 / 999 Freestyle', 'Wish', 'Fuck Love', '6 Kiss', 'The Grinch'
    ],
  },
  {
    artist: 'Lil Peep',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 20,
    priorityTracks: [
      'Falling Down', 'Star Shopping', 'Beamer Boy', 'Save That Shit', 'Witchblades',
      'Awful Things', 'Benz Truck', 'The Way I See Things', 'White Wine', 'Life Is Beautiful', 'Crybaby'
    ],
  },
  {
    artist: 'Lil Pump',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 15,
    priorityTracks: [
      'Gucci Gang', 'Esskeetit', 'I Love It', 'Boss', 'D Rose', 'Arms Around You', 'Be Like Me'
    ],
  },
  {
    artist: 'Famous Dex',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 15,
    priorityTracks: [
      'Pick It Up', 'JAPAN', 'Drip from My Walk', 'Hoes Mad', 'OK Dexter', 'Glock Tucked'
    ],
  },
  {
    artist: 'Fetty Wap',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 15,
    priorityTracks: [
      'Trap Queen', '679', 'My Way', 'Again', 'Jugg', 'Jimmy Choo', 'RGF Island'
    ],
  },
  {
    artist: 'Lil Mosey',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 18,
    priorityTracks: [
      'Noticed', 'Blueberry Faygo', 'Kamikaze', 'Stuck in a Dream', 'Boof Pack', 'Greet Her', 'Live This Wild'
    ],
  },
  {
    artist: 'Lil Tecca',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 20,
    priorityTracks: [
      'Ransom', 'Did It Again', 'Shots', '500lbs', 'Never Left', 'LOT OF ME', 'Down with Me', 'HVN ON EARTH'
    ],
  },
  {
    artist: 'YoungBoy Never Broke Again',
    defaultGenre: 'Hip-Hop/Rap',
    minDepth: 25,
    priorityTracks: [
      'Bandit', 'Outside Today', 'Nevada', 'Right Foot Creep', 'No Smoke', 'Kacey Talk',
      'Valuable Pain', 'Genie', 'Untouchable', 'Make No Sense', 'All In', 'Lonely Child', 'House Arrest Tingz'
    ],
  },

  // Dance / Electronic Icons
  {
    artist: 'Avicii',
    defaultGenre: 'Dance',
    minDepth: 25,
    priorityTracks: [
      'Wake Me Up', 'Levels', 'Hey Brother', 'The Nights', 'Waiting For Love', 'Without You',
      'I Could Be the One', 'Lonely Together', 'SOS', 'Heaven', 'Addicted to You', 'Silhouettes',
      'Lay Me Down', 'Fade Into Darkness', 'You Make Me'
    ],
  },
  {
    artist: 'Calvin Harris',
    defaultGenre: 'Dance',
    minDepth: 25,
    priorityTracks: [
      'Summer', 'This Is What You Came For', 'One Kiss', 'Feel So Close', 'How Deep Is Your Love',
      'We Found Love', 'Outside', 'Sweet Nothing', 'I Need Your Love', 'Blame', 'Giant',
      'Promises', 'Slide', 'My Way', 'Under Control', 'Miracle'
    ],
  },
  {
    artist: 'David Guetta',
    defaultGenre: 'Dance',
    minDepth: 25,
    priorityTracks: [
      'Titanium', 'Memories', 'Sexy Bitch', 'Without You', 'Play Hard', 'Hey Mama', "I'm Good (Blue)",
      'When Love Takes Over', 'Dangerous', 'Turn Me On', 'Where Them Girls At', 'Lovers on the Sun',
      '2U', 'Flames', 'Baby Don’t Hurt Me'
    ],
  },
];

async function main() {
  console.log('🚀 Starting Melodex Master Iconic Expansion, Lil Skies Enrichment & Genre Normalization Engine...');

  const catalogPath = path.resolve('src/data/melodex-catalog.json');
  let currentCatalog: Song[] = [];
  try {
    currentCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  } catch {
    currentCatalog = [];
  }
  console.log(`Initial Catalog Count: ${currentCatalog.length}`);

  const songMap = new Map<string, Song>();
  const titleArtistIndex = new Set<string>();

  function makeKey(artist: string, title: string) {
    const cleanA = artist.toLowerCase().trim().replace(/[^\w]/g, '');
    const cleanT = title.toLowerCase().trim().replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/[^\w]/g, '');
    return `${cleanA}:::${cleanT}`;
  }

  // 1. Ingest existing healthy tracks and compute their normalizedGenres immediately
  let deadCount = 0;
  for (const song of currentCatalog) {
    if (!song.previewUrl || !song.previewUrl.startsWith('http')) continue;
    if (song.audioStatus === 'dead' || song.previewUrl.includes('dzcdn.net')) {
      deadCount++;
      continue;
    }

    const key = makeKey(song.artist, song.title);
    if (!titleArtistIndex.has(key)) {
      const normalizedGenres = computeNormalizedGenres(song.genre, song.artist, song.title, song.album);
      songMap.set(song.id, {
        ...song,
        normalizedGenres,
        audioStatus: song.audioStatus || 'healthy',
        audioValidatedAt: song.audioValidatedAt || Date.now(),
        failureCount: song.failureCount || 0,
      });
      titleArtistIndex.add(key);
    }
  }

  console.log(`Ingested ${songMap.size} existing clean tracks (Purged ${deadCount} dead/invalid).`);

  // Helper to test & add a song
  async function verifyAndAddSong(
    item: any,
    targetGenre: string,
    priorityRecognition = 85
  ): Promise<boolean> {
    if (!item.previewUrl || !item.trackName || !item.artistName) return false;
    const releaseYear = item.releaseDate ? parseInt(item.releaseDate.substring(0, 4), 10) : 0;
    if (!releaseYear || isNaN(releaseYear) || releaseYear < 1950 || releaseYear > 2026) return false;

    const key = makeKey(item.artistName, item.trackName);
    if (titleArtistIndex.has(key)) return false;

    // Probe audio
    const isAudioHealthy = await probeAudioUrl(item.previewUrl, 3000);
    if (!isAudioHealthy) return false;

    const rawGenre = item.primaryGenreName || targetGenre;
    const normalizedGenres = computeNormalizedGenres(rawGenre, item.artistName, item.trackName, item.collectionName);

    const songId = `itunes_${item.trackId || Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const song: Song = {
      id: songId,
      title: item.trackName,
      artist: item.artistName,
      album: item.collectionName || 'Single',
      year: releaseYear,
      verifiedOriginalYear: releaseYear,
      yearConfidence: 'high',
      genre: rawGenre,
      normalizedGenres,
      recognitionScore: priorityRecognition,
      previewUrl: item.previewUrl,
      previewStart: 0,
      provider: 'itunes',
      trackIdentityVerified: true,
      audioStatus: 'healthy',
      audioValidatedAt: Date.now(),
      failureCount: 0,
      artworkUrl: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : undefined,
    };

    songMap.set(song.id, song);
    titleArtistIndex.add(key);
    return true;
  }

  // 2. High Priority: Lil Skies - Life of a Dark Rose Album Import & Hits
  console.log('\n========================================');
  console.log('🌟 STEP 1: LIL SKIES - LIFE OF A DARK ROSE & COMPLETE DISCOGRAPHY IMPORT');
  console.log('========================================');

  // Search canonical album
  const darkRoseTracks = await lookupAlbumTracks('Lil Skies Life of a Dark Rose');
  let darkRoseAdded = 0;
  for (const track of darkRoseTracks) {
    if (track.artistName && track.artistName.toLowerCase().includes('lil skies')) {
      const added = await verifyAndAddSong(track, 'Hip-Hop/Rap', 90);
      if (added) {
        darkRoseAdded++;
        console.log(`  ✅ Added Life of a Dark Rose track: ${track.trackName}`);
      }
    }
    await sleep(60);
  }
  console.log(`Added ${darkRoseAdded} verified tracks from Life of a Dark Rose.`);

  // Search Lil Skies hits and Shelby
  const skiesResults = await searchItunes('Lil Skies', 50);
  let skiesHitsAdded = 0;
  for (const track of skiesResults) {
    if (track.artistName && track.artistName.toLowerCase().includes('lil skies')) {
      const added = await verifyAndAddSong(track, 'Hip-Hop/Rap', 88);
      if (added) {
        skiesHitsAdded++;
        console.log(`  ✅ Added Lil Skies track: ${track.trackName}`);
      }
    }
    await sleep(60);
  }

  // 3. Expand All Targeted Major Artists to required depth
  console.log('\n========================================');
  console.log('🌟 STEP 2: EXPANDING MAJOR ARTISTS TO 15-30+ VERIFIED TRACK DEPTH');
  console.log('========================================');

  let majorArtistsExpanded = 0;
  let totalNewVerifiedTracks = darkRoseAdded + skiesHitsAdded;

  for (const target of MAJOR_ARTISTS_TARGETS) {
    if (target.artist === 'Lil Skies') continue; // Already processed above

    const existingForArtist = Array.from(songMap.values()).filter(
      (s) => s.artist.toLowerCase().includes(target.artist.toLowerCase())
    );

    console.log(`\nAuditing [${target.artist}] (Current count: ${existingForArtist.length}, Target min: ${target.minDepth})`);

    let addedForArtist = 0;

    // Search for priority tracks first
    if (target.priorityTracks && target.priorityTracks.length > 0) {
      for (const trackTitle of target.priorityTracks) {
        const query = `${target.artist} ${trackTitle}`;
        const searchResults = await searchItunes(query, 10);
        for (const item of searchResults) {
          const itemArtist = (item.artistName || '').toLowerCase();
          const targetA = target.artist.toLowerCase();
          if (itemArtist.includes(targetA) || targetA.includes(itemArtist)) {
            const added = await verifyAndAddSong(item, target.defaultGenre, 92);
            if (added) {
              addedForArtist++;
              totalNewVerifiedTracks++;
              console.log(`  🎯 Priority hit added: ${item.artistName} - ${item.trackName}`);
              break;
            }
          }
        }
        await sleep(60);
      }
    }

    // Top-up search if still below minDepth
    const currentArtistCount = Array.from(songMap.values()).filter(
      (s) => s.artist.toLowerCase().includes(target.artist.toLowerCase())
    ).length;

    if (currentArtistCount < target.minDepth) {
      const broadResults = await searchItunes(target.artist, 50);
      for (const item of broadResults) {
        const itemArtist = (item.artistName || '').toLowerCase();
        const targetA = target.artist.toLowerCase();
        if (itemArtist.includes(targetA) || targetA.includes(itemArtist)) {
          const added = await verifyAndAddSong(item, target.defaultGenre, 82);
          if (added) {
            addedForArtist++;
            totalNewVerifiedTracks++;
          }
        }
        await sleep(50);
      }
    }

    const finalArtistCount = Array.from(songMap.values()).filter(
      (s) => s.artist.toLowerCase().includes(target.artist.toLowerCase())
    ).length;

    console.log(`  => Finished ${target.artist}: ${finalArtistCount} verified tracks (Added ${addedForArtist}).`);
    majorArtistsExpanded++;
  }

  // 4. Final verification pass: Ensure EVERY song in catalog has precomputed normalizedGenres
  const finalCatalog = Array.from(songMap.values());
  for (const s of finalCatalog) {
    if (!s.normalizedGenres || s.normalizedGenres.length === 0) {
      s.normalizedGenres = computeNormalizedGenres(s.genre, s.artist, s.title, s.album);
    }
  }

  // 5. Generate Stats Report
  const genreBreakdown: Record<string, number> = {
    pop: 0,
    hiphop: 0,
    rock: 0,
    rnb: 0,
    electronic: 0,
    latin: 0,
    indie: 0,
    metal: 0,
    dance: 0,
  };

  for (const s of finalCatalog) {
    for (const g of s.normalizedGenres || []) {
      if (genreBreakdown[g] !== undefined) {
        genreBreakdown[g]++;
      }
    }
  }

  const lilSkiesTracks = finalCatalog.filter((s) => s.artist.toLowerCase().includes('lil skies'));

  console.log('\n========================================');
  console.log('🎉 EXPANSION & NORMALIZATION COMPLETE');
  console.log('========================================');
  console.log(`Total Playable Songs in Catalog: ${finalCatalog.length}`);
  console.log(`Major Artists Expanded: ${majorArtistsExpanded}`);
  console.log(`New Verified Playable Tracks Added: ${totalNewVerifiedTracks}`);
  console.log(`Lil Skies Verified Playable Tracks: ${lilSkiesTracks.length}`);
  console.log('Playable Songs by Normalized Genre:');
  console.table(genreBreakdown);

  // 6. Write out all synchronized files
  const jsonStr = JSON.stringify(finalCatalog, null, 2);
  fs.writeFileSync(path.resolve('src/data/melodex-catalog.json'), jsonStr, 'utf8');
  fs.writeFileSync(path.resolve('src/data/melodexCatalog.json'), jsonStr, 'utf8');
  fs.writeFileSync(path.resolve('public/melodex-catalog.json'), jsonStr, 'utf8');
  fs.writeFileSync(path.resolve('public/data/melodex-catalog-v2.json'), jsonStr, 'utf8');

  console.log('✅ Synchronized all JSON catalog files successfully!');
}

main().catch(console.error);
