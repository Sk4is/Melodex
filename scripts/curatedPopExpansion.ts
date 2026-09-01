import { CuratedSongTarget } from './rebalanceCatalog.ts';

export const CURATED_POP_EXPANSION: CuratedSongTarget[] = [
  // ==========================================
  // PRE-2000 POP HITS (1970s, 1980s, 1990s)
  // ==========================================

  // --- a-ha ---
  { artist: 'a-ha', query: 'a-ha Take On Me', genre: 'Pop', expectedYear: 1985, recognitionScore: 100 },
  { artist: 'a-ha', query: 'a-ha The Sun Always Shines on T.V.', genre: 'Pop', expectedYear: 1985, recognitionScore: 85 },
  { artist: 'a-ha', query: 'a-ha Hunting High and Low', genre: 'Pop', expectedYear: 1985, recognitionScore: 80 },
  { artist: 'a-ha', query: 'a-ha Crying in the Rain', genre: 'Pop', expectedYear: 1990, recognitionScore: 80 },
  { artist: 'a-ha', query: 'a-ha The Living Daylights', genre: 'Pop', expectedYear: 1987, recognitionScore: 80 },

  // --- Tears for Fears ---
  { artist: 'Tears for Fears', query: 'Tears for Fears Everybody Wants to Rule the World', genre: 'Pop', expectedYear: 1985, recognitionScore: 100 },
  { artist: 'Tears for Fears', query: 'Tears for Fears Shout', genre: 'Pop', expectedYear: 1984, recognitionScore: 95 },
  { artist: 'Tears for Fears', query: 'Tears for Fears Head Over Heels', genre: 'Pop', expectedYear: 1985, recognitionScore: 90 },
  { artist: 'Tears for Fears', query: 'Tears for Fears Mad World', genre: 'Pop', expectedYear: 1982, recognitionScore: 90 },
  { artist: 'Tears for Fears', query: 'Tears for Fears Sowing the Seeds of Love', genre: 'Pop', expectedYear: 1989, recognitionScore: 85 },

  // --- Duran Duran ---
  { artist: 'Duran Duran', query: 'Duran Duran Hungry Like the Wolf', genre: 'Pop', expectedYear: 1982, recognitionScore: 95 },
  { artist: 'Duran Duran', query: 'Duran Duran Rio', genre: 'Pop', expectedYear: 1982, recognitionScore: 90 },
  { artist: 'Duran Duran', query: 'Duran Duran Ordinary World', genre: 'Pop', expectedYear: 1993, recognitionScore: 95 },
  { artist: 'Duran Duran', query: 'Duran Duran Come Undone', genre: 'Pop', expectedYear: 1993, recognitionScore: 90 },
  { artist: 'Duran Duran', query: 'Duran Duran Save a Prayer', genre: 'Pop', expectedYear: 1982, recognitionScore: 90 },
  { artist: 'Duran Duran', query: 'Duran Duran The Reflex', genre: 'Pop', expectedYear: 1983, recognitionScore: 90 },
  { artist: 'Duran Duran', query: 'Duran Duran Girls on Film', genre: 'Pop', expectedYear: 1981, recognitionScore: 85 },
  { artist: 'Duran Duran', query: 'Duran Duran A View to a Kill', genre: 'Pop', expectedYear: 1985, recognitionScore: 90 },

  // --- Eurythmics / Annie Lennox ---
  { artist: 'Eurythmics', query: 'Eurythmics Sweet Dreams Are Made of This', genre: 'Pop', expectedYear: 1983, recognitionScore: 100 },
  { artist: 'Eurythmics', query: 'Eurythmics Here Comes the Rain Again', genre: 'Pop', expectedYear: 1983, recognitionScore: 90 },
  { artist: 'Eurythmics', query: 'Eurythmics There Must Be an Angel', genre: 'Pop', expectedYear: 1985, recognitionScore: 85 },
  { artist: 'Eurythmics', query: 'Eurythmics Would I Lie to You', genre: 'Pop', expectedYear: 1985, recognitionScore: 85 },
  { artist: 'Annie Lennox', query: 'Annie Lennox Walking on Broken Glass', genre: 'Pop', expectedYear: 1992, recognitionScore: 90 },
  { artist: 'Annie Lennox', query: 'Annie Lennox No More I Love Yous', genre: 'Pop', expectedYear: 1995, recognitionScore: 90 },

  // --- Celine Dion ---
  { artist: 'Céline Dion', query: 'Celine Dion My Heart Will Go On', genre: 'Pop', expectedYear: 1997, recognitionScore: 100 },
  { artist: 'Céline Dion', query: 'Celine Dion Because You Loved Me', genre: 'Pop', expectedYear: 1996, recognitionScore: 95 },
  { artist: 'Céline Dion', query: 'Celine Dion Its All Coming Back to Me Now', genre: 'Pop', expectedYear: 1996, recognitionScore: 95 },
  { artist: 'Céline Dion', query: 'Celine Dion The Power of Love', genre: 'Pop', expectedYear: 1993, recognitionScore: 95 },
  { artist: 'Céline Dion', query: 'Celine Dion All by Myself', genre: 'Pop', expectedYear: 1996, recognitionScore: 90 },
  { artist: 'Céline Dion', query: 'Celine Dion That\'s the Way It Is', genre: 'Pop', expectedYear: 1999, recognitionScore: 90 },
  { artist: 'Céline Dion', query: 'Celine Dion I\'m Alive', genre: 'Pop', expectedYear: 2002, recognitionScore: 90 },

  // --- Roxette ---
  { artist: 'Roxette', query: 'Roxette It Must Have Been Love', genre: 'Pop', expectedYear: 1990, recognitionScore: 100 },
  { artist: 'Roxette', query: 'Roxette Listen to Your Heart', genre: 'Pop', expectedYear: 1988, recognitionScore: 95 },
  { artist: 'Roxette', query: 'Roxette The Look', genre: 'Pop', expectedYear: 1988, recognitionScore: 95 },
  { artist: 'Roxette', query: 'Roxette Joyride', genre: 'Pop', expectedYear: 1991, recognitionScore: 90 },
  { artist: 'Roxette', query: 'Roxette Fading Like a Flower', genre: 'Pop', expectedYear: 1991, recognitionScore: 85 },
  { artist: 'Roxette', query: 'Roxette Spending My Time', genre: 'Pop', expectedYear: 1991, recognitionScore: 85 },
  { artist: 'Roxette', query: 'Roxette Dangerous', genre: 'Pop', expectedYear: 1988, recognitionScore: 85 },

  // --- Ace of Base ---
  { artist: 'Ace of Base', query: 'Ace of Base All That She Wants', genre: 'Pop', expectedYear: 1992, recognitionScore: 95 },
  { artist: 'Ace of Base', query: 'Ace of Base The Sign', genre: 'Pop', expectedYear: 1993, recognitionScore: 100 },
  { artist: 'Ace of Base', query: 'Ace of Base Don\'t Turn Around', genre: 'Pop', expectedYear: 1993, recognitionScore: 90 },
  { artist: 'Ace of Base', query: 'Ace of Base Beautiful Life', genre: 'Pop', expectedYear: 1995, recognitionScore: 90 },
  { artist: 'Ace of Base', query: 'Ace of Base Wheel of Fortune', genre: 'Pop', expectedYear: 1992, recognitionScore: 85 },

  // --- Haddaway ---
  { artist: 'Haddaway', query: 'Haddaway What Is Love', genre: 'Electronic/Dance', expectedYear: 1993, recognitionScore: 100 },
  { artist: 'Haddaway', query: 'Haddaway Life', genre: 'Electronic/Dance', expectedYear: 1993, recognitionScore: 85 },
  { artist: 'Haddaway', query: 'Haddaway Rock My Heart', genre: 'Electronic/Dance', expectedYear: 1994, recognitionScore: 80 },

  // --- Aqua ---
  { artist: 'Aqua', query: 'Aqua Barbie Girl', genre: 'Pop', expectedYear: 1997, recognitionScore: 100 },
  { artist: 'Aqua', query: 'Aqua Doctor Jones', genre: 'Pop', expectedYear: 1997, recognitionScore: 90 },
  { artist: 'Aqua', query: 'Aqua My Oh My', genre: 'Pop', expectedYear: 1997, recognitionScore: 85 },
  { artist: 'Aqua', query: 'Aqua Turn Back Time', genre: 'Pop', expectedYear: 1997, recognitionScore: 85 },
  { artist: 'Aqua', query: 'Aqua Cartoon Heroes', genre: 'Pop', expectedYear: 2000, recognitionScore: 85 },

  // --- Rick Astley ---
  { artist: 'Rick Astley', query: 'Rick Astley Never Gonna Give You Up', genre: 'Pop', expectedYear: 1987, recognitionScore: 100 },
  { artist: 'Rick Astley', query: 'Rick Astley Together Forever', genre: 'Pop', expectedYear: 1987, recognitionScore: 95 },
  { artist: 'Rick Astley', query: 'Rick Astley Whenever You Need Somebody', genre: 'Pop', expectedYear: 1987, recognitionScore: 85 },
  { artist: 'Rick Astley', query: 'Rick Astley She Wants to Dance with Me', genre: 'Pop', expectedYear: 1988, recognitionScore: 80 },

  // --- George Michael / Wham! ---
  { artist: 'George Michael', query: 'George Michael Careless Whisper', genre: 'Pop', expectedYear: 1984, recognitionScore: 100 },
  { artist: 'George Michael', query: 'George Michael Faith', genre: 'Pop', expectedYear: 1987, recognitionScore: 100 },
  { artist: 'George Michael', query: 'George Michael Freedom! \'90', genre: 'Pop', expectedYear: 1990, recognitionScore: 95 },
  { artist: 'George Michael', query: 'George Michael Father Figure', genre: 'Pop', expectedYear: 1987, recognitionScore: 90 },
  { artist: 'George Michael', query: 'George Michael Fastlove', genre: 'Pop', expectedYear: 1996, recognitionScore: 85 },
  { artist: 'Wham!', query: 'Wham! Wake Me Up Before You Go-Go', genre: 'Pop', expectedYear: 1984, recognitionScore: 100 },
  { artist: 'Wham!', query: 'Wham! Last Christmas', genre: 'Pop', expectedYear: 1984, recognitionScore: 100 },
  { artist: 'Wham!', query: 'Wham! Club Tropicana', genre: 'Pop', expectedYear: 1983, recognitionScore: 90 },

  // --- Cher ---
  { artist: 'Cher', query: 'Cher Believe', genre: 'Pop', expectedYear: 1998, recognitionScore: 100 },
  { artist: 'Cher', query: 'Cher If I Could Turn Back Time', genre: 'Pop', expectedYear: 1989, recognitionScore: 95 },
  { artist: 'Cher', query: 'Cher Strong Enough', genre: 'Pop', expectedYear: 1998, recognitionScore: 90 },
  { artist: 'Cher', query: 'Cher The Shoop Shoop Song', genre: 'Pop', expectedYear: 1990, recognitionScore: 90 },
  { artist: 'Cher', query: 'Cher Gypsys Tramps Thieves', genre: 'Pop', expectedYear: 1971, recognitionScore: 85 },

  // --- Whitney Houston ---
  { artist: 'Whitney Houston', query: 'Whitney Houston I Wanna Dance with Somebody', genre: 'Pop', expectedYear: 1987, recognitionScore: 100 },
  { artist: 'Whitney Houston', query: 'Whitney Houston I Will Always Love You', genre: 'Pop', expectedYear: 1992, recognitionScore: 100 },
  { artist: 'Whitney Houston', query: 'Whitney Houston How Will I Know', genre: 'Pop', expectedYear: 1985, recognitionScore: 95 },
  { artist: 'Whitney Houston', query: 'Whitney Houston Greatest Love of All', genre: 'Pop', expectedYear: 1985, recognitionScore: 95 },
  { artist: 'Whitney Houston', query: 'Whitney Houston Saving All My Love for You', genre: 'Pop', expectedYear: 1985, recognitionScore: 90 },
  { artist: 'Whitney Houston', query: 'Whitney Houston It\'s Not Right but It\'s Okay', genre: 'R&B/Soul', expectedYear: 1998, recognitionScore: 90 },
  { artist: 'Whitney Houston', query: 'Whitney Houston I Have Nothing', genre: 'Pop', expectedYear: 1992, recognitionScore: 95 },
  { artist: 'Whitney Houston', query: 'Whitney Houston One Moment in Time', genre: 'Pop', expectedYear: 1988, recognitionScore: 90 },
  { artist: 'Whitney Houston', query: 'Whitney Houston My Love Is Your Love', genre: 'R&B/Soul', expectedYear: 1998, recognitionScore: 90 },

  // --- ABBA ---
  { artist: 'ABBA', query: 'ABBA Dancing Queen', genre: 'Pop', expectedYear: 1976, recognitionScore: 100 },
  { artist: 'ABBA', query: 'ABBA Mamma Mia', genre: 'Pop', expectedYear: 1975, recognitionScore: 100 },
  { artist: 'ABBA', query: 'ABBA Gimme! Gimme! Gimme!', genre: 'Pop', expectedYear: 1979, recognitionScore: 100 },
  { artist: 'ABBA', query: 'ABBA Waterloo', genre: 'Pop', expectedYear: 1974, recognitionScore: 95 },
  { artist: 'ABBA', query: 'ABBA The Winner Takes It All', genre: 'Pop', expectedYear: 1980, recognitionScore: 95 },
  { artist: 'ABBA', query: 'ABBA Super Trouper', genre: 'Pop', expectedYear: 1980, recognitionScore: 95 },
  { artist: 'ABBA', query: 'ABBA Take a Chance on Me', genre: 'Pop', expectedYear: 1977, recognitionScore: 95 },
  { artist: 'ABBA', query: 'ABBA Fernando', genre: 'Pop', expectedYear: 1976, recognitionScore: 95 },
  { artist: 'ABBA', query: 'ABBA SOS', genre: 'Pop', expectedYear: 1975, recognitionScore: 90 },
  { artist: 'ABBA', query: 'ABBA Chiquitita', genre: 'Pop', expectedYear: 1979, recognitionScore: 90 },
  { artist: 'ABBA', query: 'ABBA Money, Money, Money', genre: 'Pop', expectedYear: 1976, recognitionScore: 90 },
  { artist: 'ABBA', query: 'ABBA Lay All Your Love on Me', genre: 'Pop', expectedYear: 1980, recognitionScore: 95 },
  { artist: 'ABBA', query: 'ABBA Voulez-Vous', genre: 'Pop', expectedYear: 1979, recognitionScore: 90 },
  { artist: 'ABBA', query: 'ABBA Knowing Me, Knowing You', genre: 'Pop', expectedYear: 1976, recognitionScore: 90 },

  // --- Michael Jackson ---
  { artist: 'Michael Jackson', query: 'Michael Jackson Billie Jean', genre: 'Pop', expectedYear: 1982, recognitionScore: 100 },
  { artist: 'Michael Jackson', query: 'Michael Jackson Beat It', genre: 'Pop', expectedYear: 1982, recognitionScore: 100 },
  { artist: 'Michael Jackson', query: 'Michael Jackson Thriller', genre: 'Pop', expectedYear: 1982, recognitionScore: 100 },
  { artist: 'Michael Jackson', query: 'Michael Jackson Smooth Criminal', genre: 'Pop', expectedYear: 1987, recognitionScore: 100 },
  { artist: 'Michael Jackson', query: 'Michael Jackson Bad', genre: 'Pop', expectedYear: 1987, recognitionScore: 100 },
  { artist: 'Michael Jackson', query: 'Michael Jackson Man in the Mirror', genre: 'Pop', expectedYear: 1987, recognitionScore: 95 },
  { artist: 'Michael Jackson', query: 'Michael Jackson Black or White', genre: 'Pop', expectedYear: 1991, recognitionScore: 95 },
  { artist: 'Michael Jackson', query: 'Michael Jackson Rock with You', genre: 'R&B/Soul', expectedYear: 1979, recognitionScore: 95 },
  { artist: 'Michael Jackson', query: 'Michael Jackson Don\'t Stop Til You Get Enough', genre: 'Pop', expectedYear: 1979, recognitionScore: 95 },
  { artist: 'Michael Jackson', query: 'Michael Jackson The Way You Make Me Feel', genre: 'Pop', expectedYear: 1987, recognitionScore: 95 },
  { artist: 'Michael Jackson', query: 'Michael Jackson Remember the Time', genre: 'R&B/Soul', expectedYear: 1991, recognitionScore: 90 },
  { artist: 'Michael Jackson', query: 'Michael Jackson Heal the World', genre: 'Pop', expectedYear: 1991, recognitionScore: 90 },
  { artist: 'Michael Jackson', query: 'Michael Jackson Earth Song', genre: 'Pop', expectedYear: 1995, recognitionScore: 90 },
  { artist: 'Michael Jackson', query: 'Michael Jackson Wanna Be Startin Somethin', genre: 'Pop', expectedYear: 1982, recognitionScore: 90 },
  { artist: 'Michael Jackson', query: 'Michael Jackson They Don\'t Care About Us', genre: 'Pop', expectedYear: 1995, recognitionScore: 95 },
  { artist: 'Michael Jackson', query: 'Michael Jackson Dirty Diana', genre: 'Rock', expectedYear: 1987, recognitionScore: 90 },

  // --- Madonna ---
  { artist: 'Madonna', query: 'Madonna Like a Virgin', genre: 'Pop', expectedYear: 1984, recognitionScore: 100 },
  { artist: 'Madonna', query: 'Madonna Material Girl', genre: 'Pop', expectedYear: 1984, recognitionScore: 100 },
  { artist: 'Madonna', query: 'Madonna Like a Prayer', genre: 'Pop', expectedYear: 1989, recognitionScore: 100 },
  { artist: 'Madonna', query: 'Madonna Vogue', genre: 'Pop', expectedYear: 1990, recognitionScore: 100 },
  { artist: 'Madonna', query: 'Madonna Holiday', genre: 'Pop', expectedYear: 1983, recognitionScore: 95 },
  { artist: 'Madonna', query: 'Madonna Papa Don\'t Preach', genre: 'Pop', expectedYear: 1986, recognitionScore: 95 },
  { artist: 'Madonna', query: 'Madonna La Isla Bonita', genre: 'Pop', expectedYear: 1986, recognitionScore: 100 },
  { artist: 'Madonna', query: 'Madonna Into the Groove', genre: 'Pop', expectedYear: 1985, recognitionScore: 95 },
  { artist: 'Madonna', query: 'Madonna Ray of Light', genre: 'Pop', expectedYear: 1998, recognitionScore: 90 },
  { artist: 'Madonna', query: 'Madonna Frozen', genre: 'Pop', expectedYear: 1998, recognitionScore: 95 },
  { artist: 'Madonna', query: 'Madonna Crazy for You', genre: 'Pop', expectedYear: 1985, recognitionScore: 90 },
  { artist: 'Madonna', query: 'Madonna Express Yourself', genre: 'Pop', expectedYear: 1989, recognitionScore: 90 },
  { artist: 'Madonna', query: 'Madonna Hung Up', genre: 'Pop', expectedYear: 2005, recognitionScore: 100 },
  { artist: 'Madonna', query: 'Madonna 4 Minutes Justin Timberlake', genre: 'Pop', expectedYear: 2008, recognitionScore: 95 },
  { artist: 'Madonna', query: 'Madonna Music', genre: 'Pop', expectedYear: 2000, recognitionScore: 90 },

  // --- Prince ---
  { artist: 'Prince', query: 'Prince Purple Rain', genre: 'Pop', expectedYear: 1984, recognitionScore: 100 },
  { artist: 'Prince', query: 'Prince When Doves Cry', genre: 'Pop', expectedYear: 1984, recognitionScore: 100 },
  { artist: 'Prince', query: 'Prince Kiss', genre: 'R&B/Soul', expectedYear: 1986, recognitionScore: 95 },
  { artist: 'Prince', query: 'Prince 1999', genre: 'Pop', expectedYear: 1982, recognitionScore: 95 },
  { artist: 'Prince', query: 'Prince Little Red Corvette', genre: 'Pop', expectedYear: 1982, recognitionScore: 90 },
  { artist: 'Prince', query: 'Prince Let\'s Go Crazy', genre: 'Rock', expectedYear: 1984, recognitionScore: 90 },
  { artist: 'Prince', query: 'Prince Raspberry Beret', genre: 'Pop', expectedYear: 1985, recognitionScore: 95 },
  { artist: 'Prince', query: 'Prince I Wanna Be Your Lover', genre: 'R&B/Soul', expectedYear: 1979, recognitionScore: 90 },
  { artist: 'Prince', query: 'Prince Cream', genre: 'Pop', expectedYear: 1991, recognitionScore: 85 },
  { artist: 'Prince', query: 'Prince Diamonds and Pearls', genre: 'Pop', expectedYear: 1991, recognitionScore: 85 },

  // --- Cyndi Lauper ---
  { artist: 'Cyndi Lauper', query: 'Cyndi Lauper Girls Just Want to Have Fun', genre: 'Pop', expectedYear: 1983, recognitionScore: 100 },
  { artist: 'Cyndi Lauper', query: 'Cyndi Lauper Time After Time', genre: 'Pop', expectedYear: 1983, recognitionScore: 100 },
  { artist: 'Cyndi Lauper', query: 'Cyndi Lauper True Colors', genre: 'Pop', expectedYear: 1986, recognitionScore: 95 },
  { artist: 'Cyndi Lauper', query: 'Cyndi Lauper She Bop', genre: 'Pop', expectedYear: 1983, recognitionScore: 85 },
  { artist: 'Cyndi Lauper', query: 'Cyndi Lauper All Through the Night', genre: 'Pop', expectedYear: 1983, recognitionScore: 85 },

  // --- Elton John ---
  { artist: 'Elton John', query: 'Elton John Rocket Man', genre: 'Pop', expectedYear: 1972, recognitionScore: 100 },
  { artist: 'Elton John', query: 'Elton John Tiny Dancer', genre: 'Pop', expectedYear: 1971, recognitionScore: 100 },
  { artist: 'Elton John', query: 'Elton John Your Song', genre: 'Pop', expectedYear: 1970, recognitionScore: 100 },
  { artist: 'Elton John', query: 'Elton John I\'m Still Standing', genre: 'Pop', expectedYear: 1983, recognitionScore: 100 },
  { artist: 'Elton John', query: 'Elton John Crocodile Rock', genre: 'Pop', expectedYear: 1972, recognitionScore: 95 },
  { artist: 'Elton John', query: 'Elton John Bennie and the Jets', genre: 'Pop', expectedYear: 1973, recognitionScore: 95 },
  { artist: 'Elton John', query: 'Elton John Candle in the Wind', genre: 'Pop', expectedYear: 1973, recognitionScore: 95 },
  { artist: 'Elton John', query: 'Elton John Kiki Dee Don\'t Go Breaking My Heart', genre: 'Pop', expectedYear: 1976, recognitionScore: 95 },
  { artist: 'Elton John', query: 'Elton John Can You Feel the Love Tonight', genre: 'Pop', expectedYear: 1994, recognitionScore: 95 },
  { artist: 'Elton John', query: 'Elton John Goodbye Yellow Brick Road', genre: 'Pop', expectedYear: 1973, recognitionScore: 90 },

  // --- Bee Gees ---
  { artist: 'Bee Gees', query: 'Bee Gees Stayin Alive', genre: 'Pop', expectedYear: 1977, recognitionScore: 100 },
  { artist: 'Bee Gees', query: 'Bee Gees Night Fever', genre: 'Pop', expectedYear: 1977, recognitionScore: 95 },
  { artist: 'Bee Gees', query: 'Bee Gees How Deep Is Your Love', genre: 'Pop', expectedYear: 1977, recognitionScore: 95 },
  { artist: 'Bee Gees', query: 'Bee Gees More Than a Woman', genre: 'Pop', expectedYear: 1977, recognitionScore: 95 },
  { artist: 'Bee Gees', query: 'Bee Gees You Should Be Dancing', genre: 'Pop', expectedYear: 1976, recognitionScore: 95 },
  { artist: 'Bee Gees', query: 'Bee Gees Tragedy', genre: 'Pop', expectedYear: 1979, recognitionScore: 90 },

  // --- Spice Girls ---
  { artist: 'Spice Girls', query: 'Spice Girls Wannabe', genre: 'Pop', expectedYear: 1996, recognitionScore: 100 },
  { artist: 'Spice Girls', query: 'Spice Girls Stop', genre: 'Pop', expectedYear: 1997, recognitionScore: 95 },
  { artist: 'Spice Girls', query: 'Spice Girls 2 Become 1', genre: 'Pop', expectedYear: 1996, recognitionScore: 95 },
  { artist: 'Spice Girls', query: 'Spice Girls Say You\'ll Be There', genre: 'Pop', expectedYear: 1996, recognitionScore: 95 },
  { artist: 'Spice Girls', query: 'Spice Girls Spice Up Your Life', genre: 'Pop', expectedYear: 1997, recognitionScore: 95 },
  { artist: 'Spice Girls', query: 'Spice Girls Viva Forever', genre: 'Pop', expectedYear: 1997, recognitionScore: 90 },
  { artist: 'Spice Girls', query: 'Spice Girls Who Do You Think You Are', genre: 'Pop', expectedYear: 1996, recognitionScore: 90 },

  // --- Backstreet Boys ---
  { artist: 'Backstreet Boys', query: 'Backstreet Boys I Want It That Way', genre: 'Pop', expectedYear: 1999, recognitionScore: 100 },
  { artist: 'Backstreet Boys', query: 'Backstreet Boys Everybody Backstreets Back', genre: 'Pop', expectedYear: 1997, recognitionScore: 100 },
  { artist: 'Backstreet Boys', query: 'Backstreet Boys As Long as You Love Me', genre: 'Pop', expectedYear: 1997, recognitionScore: 95 },
  { artist: 'Backstreet Boys', query: 'Backstreet Boys Quit Playing Games With My Heart', genre: 'Pop', expectedYear: 1996, recognitionScore: 95 },
  { artist: 'Backstreet Boys', query: 'Backstreet Boys Larger Than Life', genre: 'Pop', expectedYear: 1999, recognitionScore: 95 },
  { artist: 'Backstreet Boys', query: 'Backstreet Boys Show Me the Meaning of Being Lonely', genre: 'Pop', expectedYear: 1999, recognitionScore: 90 },
  { artist: 'Backstreet Boys', query: 'Backstreet Boys Shape of My Heart', genre: 'Pop', expectedYear: 2000, recognitionScore: 95 },
  { artist: 'Backstreet Boys', query: 'Backstreet Boys Incomplete', genre: 'Pop', expectedYear: 2005, recognitionScore: 90 },

  // --- NSYNC ---
  { artist: '*NSYNC', query: 'NSYNC Bye Bye Bye', genre: 'Pop', expectedYear: 2000, recognitionScore: 100 },
  { artist: '*NSYNC', query: 'NSYNC It\'s Gonna Be Me', genre: 'Pop', expectedYear: 2000, recognitionScore: 100 },
  { artist: '*NSYNC', query: 'NSYNC Tearin\' Up My Heart', genre: 'Pop', expectedYear: 1997, recognitionScore: 95 },
  { artist: '*NSYNC', query: 'NSYNC Pop', genre: 'Pop', expectedYear: 2001, recognitionScore: 90 },
  { artist: '*NSYNC', query: 'NSYNC This I Promise You', genre: 'Pop', expectedYear: 2000, recognitionScore: 95 },
  { artist: '*NSYNC', query: 'NSYNC Girlfriend', genre: 'Pop', expectedYear: 2001, recognitionScore: 90 },

  // --- TLC ---
  { artist: 'TLC', query: 'TLC No Scrubs', genre: 'R&B/Soul', expectedYear: 1999, recognitionScore: 100 },
  { artist: 'TLC', query: 'TLC Waterfalls', genre: 'R&B/Soul', expectedYear: 1994, recognitionScore: 100 },
  { artist: 'TLC', query: 'TLC Creep', genre: 'R&B/Soul', expectedYear: 1994, recognitionScore: 95 },
  { artist: 'TLC', query: 'TLC Unpretty', genre: 'R&B/Soul', expectedYear: 1999, recognitionScore: 90 },
  { artist: 'TLC', query: 'TLC Red Light Special', genre: 'R&B/Soul', expectedYear: 1994, recognitionScore: 85 },
  { artist: 'TLC', query: 'TLC Diggin\' on You', genre: 'R&B/Soul', expectedYear: 1994, recognitionScore: 85 },

  // --- Destiny's Child ---
  { artist: 'Destiny\'s Child', query: 'Destinys Child Say My Name', genre: 'R&B/Soul', expectedYear: 1999, recognitionScore: 100 },
  { artist: 'Destiny\'s Child', query: 'Destinys Child Survivor', genre: 'R&B/Soul', expectedYear: 2001, recognitionScore: 100 },
  { artist: 'Destiny\'s Child', query: 'Destinys Child Bills Bills Bills', genre: 'R&B/Soul', expectedYear: 1999, recognitionScore: 95 },
  { artist: 'Destiny\'s Child', query: 'Destinys Child Bootylicious', genre: 'R&B/Soul', expectedYear: 2001, recognitionScore: 95 },
  { artist: 'Destiny\'s Child', query: 'Destinys Child Jumpin Jumpin', genre: 'R&B/Soul', expectedYear: 1999, recognitionScore: 95 },
  { artist: 'Destiny\'s Child', query: 'Destinys Child Independent Women Pt I', genre: 'R&B/Soul', expectedYear: 2000, recognitionScore: 95 },
  { artist: 'Destiny\'s Child', query: 'Destinys Child Lose My Breath', genre: 'R&B/Soul', expectedYear: 2004, recognitionScore: 95 },
  { artist: 'Destiny\'s Child', query: 'Destinys Child Cater 2 U', genre: 'R&B/Soul', expectedYear: 2004, recognitionScore: 90 },
  { artist: 'Destiny\'s Child', query: 'Destinys Child Soldier', genre: 'R&B/Soul', expectedYear: 2004, recognitionScore: 90 },
  { artist: 'Destiny\'s Child', query: 'Destinys Child Emotion', genre: 'R&B/Soul', expectedYear: 2001, recognitionScore: 85 },

  // --- Pre-2000 Pop/Disco Classics ---
  { artist: 'Earth, Wind & Fire', query: 'Earth Wind Fire September', genre: 'R&B/Soul', expectedYear: 1978, recognitionScore: 100 },
  { artist: 'Earth, Wind & Fire', query: 'Earth Wind Fire Boogie Wonderland', genre: 'R&B/Soul', expectedYear: 1979, recognitionScore: 95 },
  { artist: 'Earth, Wind & Fire', query: 'Earth Wind Fire Let\'s Groove', genre: 'R&B/Soul', expectedYear: 1981, recognitionScore: 95 },
  { artist: 'Kool & The Gang', query: 'Kool The Gang Celebration', genre: 'R&B/Soul', expectedYear: 1980, recognitionScore: 100 },
  { artist: 'Kool & The Gang', query: 'Kool The Gang Get Down On It', genre: 'R&B/Soul', expectedYear: 1981, recognitionScore: 95 },
  { artist: 'Bonnie Tyler', query: 'Bonnie Tyler Total Eclipse of the Heart', genre: 'Pop', expectedYear: 1983, recognitionScore: 100 },
  { artist: 'Bonnie Tyler', query: 'Bonnie Tyler Holding Out for a Hero', genre: 'Pop', expectedYear: 1984, recognitionScore: 100 },
  { artist: 'Men at Work', query: 'Men at Work Down Under', genre: 'Pop', expectedYear: 1981, recognitionScore: 100 },
  { artist: 'Men at Work', query: 'Men at Work Who Can It Be Now', genre: 'Pop', expectedYear: 1981, recognitionScore: 95 },
  { artist: 'Soft Cell', query: 'Soft Cell Tainted Love', genre: 'Pop', expectedYear: 1981, recognitionScore: 100 },
  { artist: 'Dexys Midnight Runners', query: 'Dexys Midnight Runners Come On Eileen', genre: 'Pop', expectedYear: 1982, recognitionScore: 100 },
  { artist: 'Rick Springfield', query: 'Rick Springfield Jessie\'s Girl', genre: 'Rock', expectedYear: 1981, recognitionScore: 100 },
  { artist: 'The Pointer Sisters', query: 'The Pointer Sisters I\'m So Excited', genre: 'Pop', expectedYear: 1982, recognitionScore: 95 },
  { artist: 'Starship', query: 'Starship Nothing\'s Gonna Stop Us Now', genre: 'Pop', expectedYear: 1987, recognitionScore: 95 },
  { artist: 'Belinda Carlisle', query: 'Belinda Carlisle Heaven Is a Place on Earth', genre: 'Pop', expectedYear: 1987, recognitionScore: 95 },
  { artist: 'Laura Branigan', query: 'Laura Branigan Gloria', genre: 'Pop', expectedYear: 1982, recognitionScore: 95 },
  { artist: 'Laura Branigan', query: 'Laura Branigan Self Control', genre: 'Pop', expectedYear: 1984, recognitionScore: 90 },
  { artist: 'Lionel Richie', query: 'Lionel Richie All Night Long', genre: 'Pop', expectedYear: 1983, recognitionScore: 100 },
  { artist: 'Lionel Richie', query: 'Lionel Richie Hello', genre: 'Pop', expectedYear: 1983, recognitionScore: 95 },
  { artist: 'Culture Club', query: 'Culture Club Karma Chameleon', genre: 'Pop', expectedYear: 1983, recognitionScore: 100 },
  { artist: 'Culture Club', query: 'Culture Club Do You Really Want to Hurt Me', genre: 'Pop', expectedYear: 1982, recognitionScore: 95 },
  { artist: 'The Human League', query: 'The Human League Don\'t You Want Me', genre: 'Pop', expectedYear: 1981, recognitionScore: 100 },
  { artist: 'Phil Collins', query: 'Phil Collins In the Air Tonight', genre: 'Pop', expectedYear: 1981, recognitionScore: 100 },
  { artist: 'Phil Collins', query: 'Phil Collins Another Day in Paradise', genre: 'Pop', expectedYear: 1989, recognitionScore: 95 },
  { artist: 'Phil Collins', query: 'Phil Collins Against All Odds', genre: 'Pop', expectedYear: 1984, recognitionScore: 95 },
  { artist: 'Phil Collins', query: 'Phil Collins You Can\'t Hurry Love', genre: 'Pop', expectedYear: 1982, recognitionScore: 95 },
  { artist: 'Genesis', query: 'Genesis Invisible Touch', genre: 'Pop', expectedYear: 1986, recognitionScore: 90 },
  { artist: 'Village People', query: 'Village People Y.M.C.A.', genre: 'Pop', expectedYear: 1978, recognitionScore: 100 },
  { artist: 'Village People', query: 'Village People In the Navy', genre: 'Pop', expectedYear: 1979, recognitionScore: 90 },
  { artist: 'Boney M.', query: 'Boney M Rasputin', genre: 'Pop', expectedYear: 1978, recognitionScore: 100 },
  { artist: 'Boney M.', query: 'Boney M Daddy Cool', genre: 'Pop', expectedYear: 1976, recognitionScore: 95 },
  { artist: 'Boney M.', query: 'Boney M Rivers of Babylon', genre: 'Pop', expectedYear: 1978, recognitionScore: 95 },
  { artist: 'Donna Summer', query: 'Donna Summer Hot Stuff', genre: 'Pop', expectedYear: 1979, recognitionScore: 100 },
  { artist: 'Donna Summer', query: 'Donna Summer I Feel Love', genre: 'Electronic/Dance', expectedYear: 1977, recognitionScore: 95 },
  { artist: 'Gloria Gaynor', query: 'Gloria Gaynor I Will Survive', genre: 'Pop', expectedYear: 1978, recognitionScore: 100 },
  { artist: 'KC & The Sunshine Band', query: 'KC Sunshine Band That\'s the Way I Like It', genre: 'Pop', expectedYear: 1975, recognitionScore: 95 },

  // ==========================================
  // 2000s POP HITS (2000–2009)
  // ==========================================

  // --- Mika ---
  { artist: 'MIKA', query: 'Mika Grace Kelly', genre: 'Pop', expectedYear: 2007, recognitionScore: 100 },
  { artist: 'MIKA', query: 'Mika Relax Take It Easy', genre: 'Pop', expectedYear: 2007, recognitionScore: 95 },
  { artist: 'MIKA', query: 'Mika Lollipop', genre: 'Pop', expectedYear: 2007, recognitionScore: 90 },
  { artist: 'MIKA', query: 'Mika Big Girl You Are Beautiful', genre: 'Pop', expectedYear: 2007, recognitionScore: 90 },
  { artist: 'MIKA', query: 'Mika Love Today', genre: 'Pop', expectedYear: 2007, recognitionScore: 85 },
  { artist: 'MIKA', query: 'Mika Happy Ending', genre: 'Pop', expectedYear: 2007, recognitionScore: 85 },
  { artist: 'MIKA', query: 'Mika We Are Golden', genre: 'Pop', expectedYear: 2009, recognitionScore: 85 },

  // --- Jason Mraz ---
  { artist: 'Jason Mraz', query: 'Jason Mraz I\'m Yours', genre: 'Pop', expectedYear: 2008, recognitionScore: 100 },
  { artist: 'Jason Mraz', query: 'Jason Mraz I Won\'t Give Up', genre: 'Pop', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Jason Mraz', query: 'Jason Mraz Colbie Caillat Lucky', genre: 'Pop', expectedYear: 2008, recognitionScore: 95 },
  { artist: 'Jason Mraz', query: 'Jason Mraz The Remedy I Won\'t Worry', genre: 'Pop', expectedYear: 2002, recognitionScore: 90 },
  { artist: 'Jason Mraz', query: 'Jason Mraz Geek in the Pink', genre: 'Pop', expectedYear: 2005, recognitionScore: 85 },
  { artist: 'Jason Mraz', query: 'Jason Mraz Have It All', genre: 'Pop', expectedYear: 2018, recognitionScore: 85 },

  // --- Owl City ---
  { artist: 'Owl City', query: 'Owl City Fireflies', genre: 'Pop', expectedYear: 2009, recognitionScore: 100 },
  { artist: 'Owl City', query: 'Owl City Carly Rae Jepsen Good Time', genre: 'Pop', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Owl City', query: 'Owl City Vanilla Twilight', genre: 'Pop', expectedYear: 2009, recognitionScore: 90 },
  { artist: 'Owl City', query: 'Owl City Shooting Star', genre: 'Pop', expectedYear: 2012, recognitionScore: 85 },
  { artist: 'Owl City', query: 'Owl City When Can I See You Again', genre: 'Pop', expectedYear: 2012, recognitionScore: 85 },

  // --- Natasha Bedingfield ---
  { artist: 'Natasha Bedingfield', query: 'Natasha Bedingfield Unwritten', genre: 'Pop', expectedYear: 2004, recognitionScore: 100 },
  { artist: 'Natasha Bedingfield', query: 'Natasha Bedingfield Pocketful of Sunshine', genre: 'Pop', expectedYear: 2007, recognitionScore: 100 },
  { artist: 'Natasha Bedingfield', query: 'Natasha Bedingfield These Words', genre: 'Pop', expectedYear: 2004, recognitionScore: 95 },
  { artist: 'Natasha Bedingfield', query: 'Natasha Bedingfield Single', genre: 'Pop', expectedYear: 2004, recognitionScore: 85 },
  { artist: 'Natasha Bedingfield', query: 'Natasha Bedingfield Sean Kingston Love Like This', genre: 'Pop', expectedYear: 2007, recognitionScore: 90 },
  { artist: 'Natasha Bedingfield', query: 'Natasha Bedingfield Soulmate', genre: 'Pop', expectedYear: 2007, recognitionScore: 85 },

  // --- Leona Lewis ---
  { artist: 'Leona Lewis', query: 'Leona Lewis Bleeding Love', genre: 'Pop', expectedYear: 2007, recognitionScore: 100 },
  { artist: 'Leona Lewis', query: 'Leona Lewis Better in Time', genre: 'Pop', expectedYear: 2007, recognitionScore: 95 },
  { artist: 'Leona Lewis', query: 'Leona Lewis Run', genre: 'Pop', expectedYear: 2008, recognitionScore: 90 },
  { artist: 'Leona Lewis', query: 'Leona Lewis A Moment Like This', genre: 'Pop', expectedYear: 2006, recognitionScore: 90 },
  { artist: 'Leona Lewis', query: 'Leona Lewis Happy', genre: 'Pop', expectedYear: 2009, recognitionScore: 85 },

  // --- Timbaland ---
  { artist: 'Timbaland', query: 'Timbaland OneRepublic Apologize', genre: 'Pop', expectedYear: 2007, recognitionScore: 100 },
  { artist: 'Timbaland', query: 'Timbaland Keri Hilson The Way I Are', genre: 'Pop', expectedYear: 2007, recognitionScore: 100 },
  { artist: 'Timbaland', query: 'Timbaland Nelly Furtado Justin Timberlake Give It to Me', genre: 'Pop', expectedYear: 2007, recognitionScore: 95 },
  { artist: 'Timbaland', query: 'Timbaland Justin Timberlake Carry Out', genre: 'Pop', expectedYear: 2009, recognitionScore: 90 },
  { artist: 'Timbaland', query: 'Timbaland Katy Perry If We Ever Meet Again', genre: 'Pop', expectedYear: 2009, recognitionScore: 95 },
  { artist: 'Timbaland', query: 'Timbaland Morning After Dark', genre: 'Pop', expectedYear: 2009, recognitionScore: 85 },

  // --- OneRepublic ---
  { artist: 'OneRepublic', query: 'OneRepublic Counting Stars', genre: 'Pop', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'OneRepublic', query: 'OneRepublic Secrets', genre: 'Pop', expectedYear: 2009, recognitionScore: 95 },
  { artist: 'OneRepublic', query: 'OneRepublic Good Life', genre: 'Pop', expectedYear: 2009, recognitionScore: 95 },
  { artist: 'OneRepublic', query: 'OneRepublic All the Right Moves', genre: 'Pop', expectedYear: 2009, recognitionScore: 95 },
  { artist: 'OneRepublic', query: 'OneRepublic Stop and Stare', genre: 'Pop', expectedYear: 2007, recognitionScore: 90 },
  { artist: 'OneRepublic', query: 'OneRepublic Love Runs Out', genre: 'Pop', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'OneRepublic', query: 'OneRepublic I Ain\'t Worried', genre: 'Pop', expectedYear: 2022, recognitionScore: 100 },
  { artist: 'OneRepublic', query: 'OneRepublic Rescue Me', genre: 'Pop', expectedYear: 2019, recognitionScore: 90 },
  { artist: 'OneRepublic', query: 'OneRepublic Run', genre: 'Pop', expectedYear: 2021, recognitionScore: 85 },

  // --- Nelly Furtado ---
  { artist: 'Nelly Furtado', query: 'Nelly Furtado Promiscuous', genre: 'Pop', expectedYear: 2006, recognitionScore: 100 },
  { artist: 'Nelly Furtado', query: 'Nelly Furtado Maneater', genre: 'Pop', expectedYear: 2006, recognitionScore: 100 },
  { artist: 'Nelly Furtado', query: 'Nelly Furtado Say It Right', genre: 'Pop', expectedYear: 2006, recognitionScore: 100 },
  { artist: 'Nelly Furtado', query: 'Nelly Furtado I\'m Like a Bird', genre: 'Pop', expectedYear: 2000, recognitionScore: 95 },
  { artist: 'Nelly Furtado', query: 'Nelly Furtado Turn Off the Light', genre: 'Pop', expectedYear: 2000, recognitionScore: 90 },
  { artist: 'Nelly Furtado', query: 'Nelly Furtado All Good Things Come to an End', genre: 'Pop', expectedYear: 2006, recognitionScore: 95 },

  // --- Avril Lavigne ---
  { artist: 'Avril Lavigne', query: 'Avril Lavigne Complicated', genre: 'Pop', expectedYear: 2002, recognitionScore: 100 },
  { artist: 'Avril Lavigne', query: 'Avril Lavigne Sk8er Boi', genre: 'Pop', expectedYear: 2002, recognitionScore: 100 },
  { artist: 'Avril Lavigne', query: 'Avril Lavigne I\'m with You', genre: 'Pop', expectedYear: 2002, recognitionScore: 95 },
  { artist: 'Avril Lavigne', query: 'Avril Lavigne Girlfriend', genre: 'Pop', expectedYear: 2007, recognitionScore: 100 },
  { artist: 'Avril Lavigne', query: 'Avril Lavigne My Happy Ending', genre: 'Pop', expectedYear: 2004, recognitionScore: 95 },
  { artist: 'Avril Lavigne', query: 'Avril Lavigne When You\'re Gone', genre: 'Pop', expectedYear: 2007, recognitionScore: 95 },
  { artist: 'Avril Lavigne', query: 'Avril Lavigne Keep Holding On', genre: 'Pop', expectedYear: 2006, recognitionScore: 90 },
  { artist: 'Avril Lavigne', query: 'Avril Lavigne What the Hell', genre: 'Pop', expectedYear: 2011, recognitionScore: 95 },
  { artist: 'Avril Lavigne', query: 'Avril Lavigne Here\'s to Never Growing Up', genre: 'Pop', expectedYear: 2013, recognitionScore: 90 },

  // --- Kelly Clarkson ---
  { artist: 'Kelly Clarkson', query: 'Kelly Clarkson Since U Been Gone', genre: 'Pop', expectedYear: 2004, recognitionScore: 100 },
  { artist: 'Kelly Clarkson', query: 'Kelly Clarkson Because of You', genre: 'Pop', expectedYear: 2004, recognitionScore: 100 },
  { artist: 'Kelly Clarkson', query: 'Kelly Clarkson Stronger What Doesn\'t Kill You', genre: 'Pop', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Kelly Clarkson', query: 'Kelly Clarkson Behind These Hazel Eyes', genre: 'Pop', expectedYear: 2004, recognitionScore: 95 },
  { artist: 'Kelly Clarkson', query: 'Kelly Clarkson Breakaway', genre: 'Pop', expectedYear: 2004, recognitionScore: 95 },
  { artist: 'Kelly Clarkson', query: 'Kelly Clarkson My Life Would Suck Without You', genre: 'Pop', expectedYear: 2009, recognitionScore: 95 },
  { artist: 'Kelly Clarkson', query: 'Kelly Clarkson Already Gone', genre: 'Pop', expectedYear: 2009, recognitionScore: 90 },
  { artist: 'Kelly Clarkson', query: 'Kelly Clarkson Miss Independent', genre: 'Pop', expectedYear: 2003, recognitionScore: 85 },

  // --- Gwen Stefani ---
  { artist: 'Gwen Stefani', query: 'Gwen Stefani Hollaback Girl', genre: 'Pop', expectedYear: 2004, recognitionScore: 100 },
  { artist: 'Gwen Stefani', query: 'Gwen Stefani Akon The Sweet Escape', genre: 'Pop', expectedYear: 2006, recognitionScore: 100 },
  { artist: 'Gwen Stefani', query: 'Gwen Stefani Eve Rich Girl', genre: 'Pop', expectedYear: 2004, recognitionScore: 95 },
  { artist: 'Gwen Stefani', query: 'Gwen Stefani What You Waiting For', genre: 'Pop', expectedYear: 2004, recognitionScore: 95 },
  { artist: 'Gwen Stefani', query: 'Gwen Stefani Cool', genre: 'Pop', expectedYear: 2004, recognitionScore: 95 },
  { artist: 'Gwen Stefani', query: 'Gwen Stefani Wind It Up', genre: 'Pop', expectedYear: 2006, recognitionScore: 85 },
  { artist: 'Gwen Stefani', query: 'Gwen Stefani Early Winter', genre: 'Pop', expectedYear: 2006, recognitionScore: 85 },
  { artist: 'No Doubt', query: 'No Doubt Don\'t Speak', genre: 'Pop', expectedYear: 1995, recognitionScore: 100 },
  { artist: 'No Doubt', query: 'No Doubt It\'s My Life', genre: 'Pop', expectedYear: 2003, recognitionScore: 95 },
  { artist: 'No Doubt', query: 'No Doubt Just a Girl', genre: 'Rock', expectedYear: 1995, recognitionScore: 95 },

  // --- P!nk ---
  { artist: 'P!nk', query: 'Pink So What', genre: 'Pop', expectedYear: 2008, recognitionScore: 100 },
  { artist: 'P!nk', query: 'Pink Raise Your Glass', genre: 'Pop', expectedYear: 2010, recognitionScore: 100 },
  { artist: 'P!nk', query: 'Pink Get the Party Started', genre: 'Pop', expectedYear: 2001, recognitionScore: 100 },
  { artist: 'P!nk', query: 'Pink Just Like a Pill', genre: 'Pop', expectedYear: 2001, recognitionScore: 95 },
  { artist: 'P!nk', query: 'Pink Who Knew', genre: 'Pop', expectedYear: 2006, recognitionScore: 95 },
  { artist: 'P!nk', query: 'Pink U + Ur Hand', genre: 'Pop', expectedYear: 2006, recognitionScore: 95 },
  { artist: 'P!nk', query: 'Pink Just Give Me a Reason', genre: 'Pop', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'P!nk', query: 'Pink Try', genre: 'Pop', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'P!nk', query: 'Pink What About Us', genre: 'Pop', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'P!nk', query: 'Pink Fuckin Perfect', genre: 'Pop', expectedYear: 2010, recognitionScore: 95 },

  // --- Shakira ---
  { artist: 'Shakira', query: 'Shakira Wyclef Jean Hips Don\'t Lie', genre: 'Pop', expectedYear: 2006, recognitionScore: 100 },
  { artist: 'Shakira', query: 'Shakira Whenever Wherever', genre: 'Pop', expectedYear: 2001, recognitionScore: 100 },
  { artist: 'Shakira', query: 'Shakira Underneath Your Clothes', genre: 'Pop', expectedYear: 2001, recognitionScore: 95 },
  { artist: 'Shakira', query: 'Shakira She Wolf', genre: 'Pop', expectedYear: 2009, recognitionScore: 95 },
  { artist: 'Shakira', query: 'Shakira Alejandro Sanz La Tortura', genre: 'Latin', expectedYear: 2005, recognitionScore: 95 },
  { artist: 'Shakira', query: 'Shakira Waka Waka This Time for Africa', genre: 'Pop', expectedYear: 2010, recognitionScore: 100 },
  { artist: 'Shakira', query: 'Shakira Loca', genre: 'Pop', expectedYear: 2010, recognitionScore: 90 },
  { artist: 'Shakira', query: 'Shakira Maluma Chantaje', genre: 'Latin', expectedYear: 2016, recognitionScore: 95 },

  // --- Justin Timberlake ---
  { artist: 'Justin Timberlake', query: 'Justin Timberlake Cry Me a River', genre: 'Pop', expectedYear: 2002, recognitionScore: 100 },
  { artist: 'Justin Timberlake', query: 'Justin Timberlake SexyBack', genre: 'Pop', expectedYear: 2006, recognitionScore: 100 },
  { artist: 'Justin Timberlake', query: 'Justin Timberlake Rock Your Body', genre: 'Pop', expectedYear: 2002, recognitionScore: 95 },
  { artist: 'Justin Timberlake', query: 'Justin Timberlake Mirrors', genre: 'Pop', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Justin Timberlake', query: 'Justin Timberlake Can\'t Stop the Feeling', genre: 'Pop', expectedYear: 2016, recognitionScore: 100 },
  { artist: 'Justin Timberlake', query: 'Justin Timberlake What Goes Around Comes Around', genre: 'Pop', expectedYear: 2006, recognitionScore: 95 },
  { artist: 'Justin Timberlake', query: 'Justin Timberlake Like I Love You', genre: 'Pop', expectedYear: 2002, recognitionScore: 90 },
  { artist: 'Justin Timberlake', query: 'Justin Timberlake My Love', genre: 'Pop', expectedYear: 2006, recognitionScore: 95 },
  { artist: 'Justin Timberlake', query: 'Justin Timberlake Summer Love', genre: 'Pop', expectedYear: 2006, recognitionScore: 90 },
  { artist: 'Justin Timberlake', query: 'Justin Timberlake JAY-Z Suit & Tie', genre: 'Pop', expectedYear: 2013, recognitionScore: 90 },

  // --- Christina Aguilera ---
  { artist: 'Christina Aguilera', query: 'Christina Aguilera Genie in a Bottle', genre: 'Pop', expectedYear: 1999, recognitionScore: 100 },
  { artist: 'Christina Aguilera', query: 'Christina Aguilera Beautiful', genre: 'Pop', expectedYear: 2002, recognitionScore: 100 },
  { artist: 'Christina Aguilera', query: 'Christina Aguilera Dirrty', genre: 'Pop', expectedYear: 2002, recognitionScore: 95 },
  { artist: 'Christina Aguilera', query: 'Christina Aguilera Fighter', genre: 'Pop', expectedYear: 2002, recognitionScore: 95 },
  { artist: 'Christina Aguilera', query: 'Christina Aguilera Candyman', genre: 'Pop', expectedYear: 2006, recognitionScore: 90 },
  { artist: 'Christina Aguilera', query: 'Christina Aguilera Hurt', genre: 'Pop', expectedYear: 2006, recognitionScore: 95 },
  { artist: 'Christina Aguilera', query: 'Christina Aguilera Ain\'t No Other Man', genre: 'Pop', expectedYear: 2006, recognitionScore: 90 },
  { artist: 'Christina Aguilera', query: 'Christina Aguilera What a Girl Wants', genre: 'Pop', expectedYear: 1999, recognitionScore: 90 },
  { artist: 'Christina Aguilera', query: 'Christina Aguilera Lil Kim Mya Pink Lady Marmalade', genre: 'Pop', expectedYear: 2001, recognitionScore: 100 },
  { artist: 'A Great Big World', query: 'A Great Big World Christina Aguilera Say Something', genre: 'Pop', expectedYear: 2013, recognitionScore: 95 },

  // --- The Black Eyed Peas ---
  { artist: 'The Black Eyed Peas', query: 'Black Eyed Peas I Gotta Feeling', genre: 'Pop', expectedYear: 2009, recognitionScore: 100 },
  { artist: 'The Black Eyed Peas', query: 'Black Eyed Peas Where Is the Love', genre: 'Pop', expectedYear: 2003, recognitionScore: 100 },
  { artist: 'The Black Eyed Peas', query: 'Black Eyed Peas Boom Boom Pow', genre: 'Pop', expectedYear: 2009, recognitionScore: 100 },
  { artist: 'The Black Eyed Peas', query: 'Black Eyed Peas Pump It', genre: 'Pop', expectedYear: 2005, recognitionScore: 95 },
  { artist: 'The Black Eyed Peas', query: 'Black Eyed Peas Let\'s Get It Started', genre: 'Pop', expectedYear: 2003, recognitionScore: 95 },
  { artist: 'The Black Eyed Peas', query: 'Black Eyed Peas Don\'t Phunk with My Heart', genre: 'Pop', expectedYear: 2005, recognitionScore: 90 },
  { artist: 'The Black Eyed Peas', query: 'Black Eyed Peas My Humps', genre: 'Pop', expectedYear: 2005, recognitionScore: 95 },
  { artist: 'The Black Eyed Peas', query: 'Black Eyed Peas Meet Me Halfway', genre: 'Pop', expectedYear: 2009, recognitionScore: 95 },
  { artist: 'The Black Eyed Peas', query: 'Black Eyed Peas Imma Be', genre: 'Pop', expectedYear: 2009, recognitionScore: 90 },
  { artist: 'The Black Eyed Peas', query: 'Black Eyed Peas The Time Dirty Bit', genre: 'Pop', expectedYear: 2010, recognitionScore: 95 },

  // --- Other 2000s Pop Hits ---
  { artist: 'Gnarls Barkley', query: 'Gnarls Barkley Crazy', genre: 'Pop', expectedYear: 2006, recognitionScore: 100 },
  { artist: 'Outkast', query: 'Outkast Hey Ya', genre: 'Pop', expectedYear: 2003, recognitionScore: 100 },
  { artist: 'Outkast', query: 'Outkast Ms Jackson', genre: 'Hip-Hop/Rap', expectedYear: 2000, recognitionScore: 100 },
  { artist: 'Outkast', query: 'Outkast Roses', genre: 'Hip-Hop/Rap', expectedYear: 2003, recognitionScore: 95 },
  { artist: 'Cascada', query: 'Cascada Everytime We Touch', genre: 'Electronic/Dance', expectedYear: 2005, recognitionScore: 100 },
  { artist: 'Cascada', query: 'Cascada Evacuate the Dancefloor', genre: 'Electronic/Dance', expectedYear: 2009, recognitionScore: 95 },
  { artist: 'Cascada', query: 'Cascada Miracle', genre: 'Electronic/Dance', expectedYear: 2004, recognitionScore: 90 },
  { artist: 'Basshunter', query: 'Basshunter Now You\'re Gone', genre: 'Electronic/Dance', expectedYear: 2007, recognitionScore: 95 },
  { artist: 'Basshunter', query: 'Basshunter All I Ever Wanted', genre: 'Electronic/Dance', expectedYear: 2008, recognitionScore: 90 },
  { artist: 'Basshunter', query: 'Basshunter Boten Anna', genre: 'Electronic/Dance', expectedYear: 2006, recognitionScore: 90 },
  { artist: 'Daniel Powter', query: 'Daniel Powter Bad Day', genre: 'Pop', expectedYear: 2005, recognitionScore: 100 },
  { artist: 'James Blunt', query: 'James Blunt You\'re Beautiful', genre: 'Pop', expectedYear: 2004, recognitionScore: 100 },
  { artist: 'James Blunt', query: 'James Blunt Goodbye My Lover', genre: 'Pop', expectedYear: 2004, recognitionScore: 90 },
  { artist: 'James Blunt', query: 'James Blunt 1973', genre: 'Pop', expectedYear: 2007, recognitionScore: 90 },
  { artist: 'Vanessa Carlton', query: 'Vanessa Carlton A Thousand Miles', genre: 'Pop', expectedYear: 2002, recognitionScore: 100 },
  { artist: 'Michelle Branch', query: 'Michelle Branch Everywhere', genre: 'Pop', expectedYear: 2001, recognitionScore: 90 },
  { artist: 'Michelle Branch', query: 'Michelle Branch All You Wanted', genre: 'Pop', expectedYear: 2001, recognitionScore: 90 },
  { artist: 'JoJo', query: 'JoJo Leave Get Out', genre: 'Pop', expectedYear: 2004, recognitionScore: 95 },
  { artist: 'JoJo', query: 'JoJo Too Little Too Late', genre: 'Pop', expectedYear: 2006, recognitionScore: 95 },
  { artist: 'Sean Kingston', query: 'Sean Kingston Beautiful Girls', genre: 'Pop', expectedYear: 2007, recognitionScore: 100 },
  { artist: 'Sean Kingston', query: 'Sean Kingston Fire Burning', genre: 'Pop', expectedYear: 2009, recognitionScore: 95 },
  { artist: 'Sean Kingston', query: 'Sean Kingston Take You There', genre: 'Pop', expectedYear: 2007, recognitionScore: 90 },
  { artist: 'Jay Sean', query: 'Jay Sean Lil Wayne Down', genre: 'Pop', expectedYear: 2009, recognitionScore: 100 },
  { artist: 'Jay Sean', query: 'Jay Sean Sean Paul Do You Remember', genre: 'Pop', expectedYear: 2009, recognitionScore: 90 },
  { artist: 'Train', query: 'Train Hey Soul Sister', genre: 'Pop', expectedYear: 2009, recognitionScore: 100 },
  { artist: 'Train', query: 'Train Drops of Jupiter', genre: 'Pop', expectedYear: 2001, recognitionScore: 100 },
  { artist: 'Train', query: 'Train Drive By', genre: 'Pop', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'The Fray', query: 'The Fray How to Save a Life', genre: 'Pop', expectedYear: 2005, recognitionScore: 100 },
  { artist: 'The Fray', query: 'The Fray You Found Me', genre: 'Pop', expectedYear: 2008, recognitionScore: 95 },
  { artist: 'The Fray', query: 'The Fray Over My Head Cable Car', genre: 'Pop', expectedYear: 2005, recognitionScore: 90 },
  { artist: 'Snow Patrol', query: 'Snow Patrol Chasing Cars', genre: 'Alternative', expectedYear: 2006, recognitionScore: 100 },
  { artist: 'Colbie Caillat', query: 'Colbie Caillat Bubbly', genre: 'Pop', expectedYear: 2007, recognitionScore: 95 },
  { artist: 'Colbie Caillat', query: 'Colbie Caillat Realize', genre: 'Pop', expectedYear: 2007, recognitionScore: 85 },
  { artist: 'Sara Bareilles', query: 'Sara Bareilles Love Song', genre: 'Pop', expectedYear: 2007, recognitionScore: 95 },
  { artist: 'Sara Bareilles', query: 'Sara Bareilles Brave', genre: 'Pop', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'Dido', query: 'Dido Thank You', genre: 'Pop', expectedYear: 2000, recognitionScore: 95 },
  { artist: 'Dido', query: 'Dido White Flag', genre: 'Pop', expectedYear: 2003, recognitionScore: 95 },
  { artist: 'Dido', query: 'Dido Here with Me', genre: 'Pop', expectedYear: 1999, recognitionScore: 90 },
  { artist: 'Kylie Minogue', query: 'Kylie Minogue Can\'t Get You Out of My Head', genre: 'Pop', expectedYear: 2001, recognitionScore: 100 },
  { artist: 'Kylie Minogue', query: 'Kylie Minogue In Your Eyes', genre: 'Pop', expectedYear: 2001, recognitionScore: 90 },
  { artist: 'Kylie Minogue', query: 'Kylie Minogue Love at First Sight', genre: 'Pop', expectedYear: 2001, recognitionScore: 90 },
  { artist: 'Kylie Minogue', query: 'Kylie Minogue Padam Padam', genre: 'Pop', expectedYear: 2023, recognitionScore: 95 },
  { artist: 'Enrique Iglesias', query: 'Enrique Iglesias Hero', genre: 'Pop', expectedYear: 2001, recognitionScore: 100 },
  { artist: 'Enrique Iglesias', query: 'Enrique Iglesias Bailamos', genre: 'Latin', expectedYear: 1999, recognitionScore: 95 },
  { artist: 'Enrique Iglesias', query: 'Enrique Iglesias Escape', genre: 'Pop', expectedYear: 2001, recognitionScore: 90 },
  { artist: 'Enrique Iglesias', query: 'Enrique Iglesias Pitbull I Like It', genre: 'Pop', expectedYear: 2010, recognitionScore: 95 },
  { artist: 'Enrique Iglesias', query: 'Enrique Iglesias Tonight I\'m Lovin\' You', genre: 'Pop', expectedYear: 2010, recognitionScore: 95 },
  { artist: 'Enrique Iglesias', query: 'Enrique Iglesias Bailando', genre: 'Latin', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'Ricky Martin', query: 'Ricky Martin Livin la Vida Loca', genre: 'Pop', expectedYear: 1999, recognitionScore: 100 },
  { artist: 'Ricky Martin', query: 'Ricky Martin She Bangs', genre: 'Pop', expectedYear: 2000, recognitionScore: 95 },
  { artist: 'Santana', query: 'Santana Rob Thomas Smooth', genre: 'Rock', expectedYear: 1999, recognitionScore: 100 },
  { artist: 'Santana', query: 'Santana The Product G&B Maria Maria', genre: 'R&B/Soul', expectedYear: 1999, recognitionScore: 95 },

  // ==========================================
  // 2010s POP & DANCE EXPANSION (2010–2019)
  // ==========================================

  // --- LMFAO ---
  { artist: 'LMFAO', query: 'LMFAO Party Rock Anthem', genre: 'Pop', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'LMFAO', query: 'LMFAO Sexy and I Know It', genre: 'Pop', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'LMFAO', query: 'LMFAO Lil Jon Shots', genre: 'Pop', expectedYear: 2009, recognitionScore: 95 },
  { artist: 'LMFAO', query: 'LMFAO Champagne Showers', genre: 'Pop', expectedYear: 2011, recognitionScore: 90 },
  { artist: 'LMFAO', query: 'LMFAO Sorry for Party Rocking', genre: 'Pop', expectedYear: 2011, recognitionScore: 90 },

  // --- Macklemore & Ryan Lewis ---
  { artist: 'Macklemore & Ryan Lewis', query: 'Macklemore Ryan Lewis Wanz Thrift Shop', genre: 'Hip-Hop/Rap', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'Macklemore & Ryan Lewis', query: 'Macklemore Ryan Lewis Ray Dalton Can\'t Hold Us', genre: 'Hip-Hop/Rap', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Macklemore & Ryan Lewis', query: 'Macklemore Ryan Lewis Mary Lambert Same Love', genre: 'Hip-Hop/Rap', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Macklemore & Ryan Lewis', query: 'Macklemore Ryan Lewis Downtown', genre: 'Hip-Hop/Rap', expectedYear: 2015, recognitionScore: 90 },
  { artist: 'Macklemore', query: 'Macklemore Skylar Grey Glorious', genre: 'Pop', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Macklemore', query: 'Macklemore Kesha Good Old Days', genre: 'Pop', expectedYear: 2017, recognitionScore: 90 },

  // --- Demi Lovato ---
  { artist: 'Demi Lovato', query: 'Demi Lovato Heart Attack', genre: 'Pop', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Demi Lovato', query: 'Demi Lovato Cool for the Summer', genre: 'Pop', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'Demi Lovato', query: 'Demi Lovato Sorry Not Sorry', genre: 'Pop', expectedYear: 2017, recognitionScore: 100 },
  { artist: 'Demi Lovato', query: 'Demi Lovato Give Your Heart a Break', genre: 'Pop', expectedYear: 2011, recognitionScore: 95 },
  { artist: 'Demi Lovato', query: 'Demi Lovato Skyscraper', genre: 'Pop', expectedYear: 2011, recognitionScore: 95 },
  { artist: 'Demi Lovato', query: 'Demi Lovato Confident', genre: 'Pop', expectedYear: 2015, recognitionScore: 90 },
  { artist: 'Demi Lovato', query: 'Demi Lovato Stone Cold', genre: 'Pop', expectedYear: 2015, recognitionScore: 90 },
  { artist: 'Luis Fonsi', query: 'Luis Fonsi Demi Lovato Echame La Culpa', genre: 'Latin', expectedYear: 2017, recognitionScore: 95 },

  // --- Halsey ---
  { artist: 'Halsey', query: 'Halsey Without Me', genre: 'Pop', expectedYear: 2018, recognitionScore: 100 },
  { artist: 'Halsey', query: 'Halsey Bad at Love', genre: 'Pop', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Halsey', query: 'Halsey Colors', genre: 'Pop', expectedYear: 2015, recognitionScore: 90 },
  { artist: 'Halsey', query: 'Halsey You Should Be Sad', genre: 'Pop', expectedYear: 2020, recognitionScore: 95 },
  { artist: 'Halsey', query: 'Halsey Graveyard', genre: 'Pop', expectedYear: 2019, recognitionScore: 90 },
  { artist: 'Halsey', query: 'Halsey Now or Never', genre: 'Pop', expectedYear: 2017, recognitionScore: 85 },
  { artist: 'Halsey', query: 'Halsey Nightmare', genre: 'Pop', expectedYear: 2019, recognitionScore: 85 },
  { artist: 'Benny Blanco', query: 'Benny Blanco Halsey Khalid Eastside', genre: 'Pop', expectedYear: 2018, recognitionScore: 100 },

  // --- Fun. ---
  { artist: 'Fun.', query: 'Fun Janelle Monae We Are Young', genre: 'Pop', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Fun.', query: 'Fun Some Nights', genre: 'Pop', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'Fun.', query: 'Fun Carry On', genre: 'Pop', expectedYear: 2012, recognitionScore: 90 },

  // --- Gotye ---
  { artist: 'Gotye', query: 'Gotye Kimbra Somebody That I Used to Know', genre: 'Pop', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Gotye', query: 'Gotye Eyes Wide Open', genre: 'Alternative', expectedYear: 2010, recognitionScore: 85 },
  { artist: 'Gotye', query: 'Gotye Hearts a Mess', genre: 'Alternative', expectedYear: 2006, recognitionScore: 80 },

  // --- Walk the Moon ---
  { artist: 'Walk the Moon', query: 'Walk the Moon Shut Up and Dance', genre: 'Pop', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'Walk the Moon', query: 'Walk the Moon One Foot', genre: 'Pop', expectedYear: 2017, recognitionScore: 85 },
  { artist: 'Walk the Moon', query: 'Walk the Moon Anna Sun', genre: 'Alternative', expectedYear: 2010, recognitionScore: 85 },

  // --- Passenger ---
  { artist: 'Passenger', query: 'Passenger Let Her Go', genre: 'Pop', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'Passenger', query: 'Passenger Holes', genre: 'Pop', expectedYear: 2012, recognitionScore: 85 },
  { artist: 'Passenger', query: 'Passenger The Wrong Direction', genre: 'Pop', expectedYear: 2012, recognitionScore: 80 },

  // --- George Ezra ---
  { artist: 'George Ezra', query: 'George Ezra Budapest', genre: 'Pop', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'George Ezra', query: 'George Ezra Shotgun', genre: 'Pop', expectedYear: 2018, recognitionScore: 100 },
  { artist: 'George Ezra', query: 'George Ezra Blame It on Me', genre: 'Pop', expectedYear: 2014, recognitionScore: 90 },
  { artist: 'George Ezra', query: 'George Ezra Paradise', genre: 'Pop', expectedYear: 2018, recognitionScore: 90 },
  { artist: 'George Ezra', query: 'George Ezra Green Green Grass', genre: 'Pop', expectedYear: 2022, recognitionScore: 90 },

  // --- MAGIC! ---
  { artist: 'MAGIC!', query: 'MAGIC Rude', genre: 'Pop', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'MAGIC!', query: 'MAGIC No Way No', genre: 'Pop', expectedYear: 2014, recognitionScore: 85 },
  { artist: 'MAGIC!', query: 'MAGIC Let Your Hair Down', genre: 'Pop', expectedYear: 2014, recognitionScore: 80 },

  // --- Mike Posner ---
  { artist: 'Mike Posner', query: 'Mike Posner I Took a Pill in Ibiza Seeb', genre: 'Pop', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'Mike Posner', query: 'Mike Posner Cooler Than Me', genre: 'Pop', expectedYear: 2010, recognitionScore: 100 },
  { artist: 'Mike Posner', query: 'Mike Posner Please Don\'t Go', genre: 'Pop', expectedYear: 2010, recognitionScore: 90 },
  { artist: 'Mike Posner', query: 'Mike Posner Bow Chicka Wow Wow', genre: 'Pop', expectedYear: 2010, recognitionScore: 85 },

  // --- Robin Thicke ---
  { artist: 'Robin Thicke', query: 'Robin Thicke T.I. Pharrell Blurred Lines', genre: 'Pop', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Robin Thicke', query: 'Robin Thicke Lost Without U', genre: 'R&B/Soul', expectedYear: 2006, recognitionScore: 90 },
  { artist: 'Robin Thicke', query: 'Robin Thicke Magic', genre: 'Pop', expectedYear: 2008, recognitionScore: 85 },

  // --- Taio Cruz ---
  { artist: 'Taio Cruz', query: 'Taio Cruz Dynamite', genre: 'Pop', expectedYear: 2010, recognitionScore: 100 },
  { artist: 'Taio Cruz', query: 'Taio Cruz Ludacris Break Your Heart', genre: 'Pop', expectedYear: 2009, recognitionScore: 100 },
  { artist: 'Taio Cruz', query: 'Taio Cruz Kylie Minogue Higher', genre: 'Pop', expectedYear: 2010, recognitionScore: 95 },
  { artist: 'Taio Cruz', query: 'Taio Cruz Flo Rida Hangover', genre: 'Pop', expectedYear: 2011, recognitionScore: 95 },

  // --- DNCE ---
  { artist: 'DNCE', query: 'DNCE Cake by the Ocean', genre: 'Pop', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'DNCE', query: 'DNCE Toothbrush', genre: 'Pop', expectedYear: 2015, recognitionScore: 90 },
  { artist: 'DNCE', query: 'DNCE Body Moves', genre: 'Pop', expectedYear: 2016, recognitionScore: 85 },

  // --- Clean Bandit ---
  { artist: 'Clean Bandit', query: 'Clean Bandit Jess Glynne Rather Be', genre: 'Electronic/Dance', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'Clean Bandit', query: 'Clean Bandit Sean Paul Anne-Marie Rockabye', genre: 'Pop', expectedYear: 2016, recognitionScore: 100 },
  { artist: 'Clean Bandit', query: 'Clean Bandit Zara Larsson Symphony', genre: 'Pop', expectedYear: 2017, recognitionScore: 100 },
  { artist: 'Clean Bandit', query: 'Clean Bandit Demi Lovato Solo', genre: 'Pop', expectedYear: 2018, recognitionScore: 95 },
  { artist: 'Clean Bandit', query: 'Clean Bandit Marina Luis Fonsi Baby', genre: 'Pop', expectedYear: 2018, recognitionScore: 85 },

  // --- Lorde ---
  { artist: 'Lorde', query: 'Lorde Royals', genre: 'Pop', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Lorde', query: 'Lorde Team', genre: 'Pop', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'Lorde', query: 'Lorde Green Light', genre: 'Pop', expectedYear: 2017, recognitionScore: 90 },
  { artist: 'Lorde', query: 'Lorde Tennis Court', genre: 'Pop', expectedYear: 2013, recognitionScore: 90 },
  { artist: 'Lorde', query: 'Lorde Ribs', genre: 'Pop', expectedYear: 2013, recognitionScore: 90 },
  { artist: 'Lorde', query: 'Lorde Solar Power', genre: 'Pop', expectedYear: 2021, recognitionScore: 85 },

  // --- Lana Del Rey ---
  { artist: 'Lana Del Rey', query: 'Lana Del Rey Summertime Sadness', genre: 'Pop', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'Lana Del Rey', query: 'Lana Del Rey Cedric Gervais Summertime Sadness', genre: 'Electronic/Dance', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Lana Del Rey', query: 'Lana Del Rey Video Games', genre: 'Pop', expectedYear: 2011, recognitionScore: 95 },
  { artist: 'Lana Del Rey', query: 'Lana Del Rey Born to Die', genre: 'Pop', expectedYear: 2011, recognitionScore: 95 },
  { artist: 'Lana Del Rey', query: 'Lana Del Rey Young and Beautiful', genre: 'Pop', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'Lana Del Rey', query: 'Lana Del Rey Blue Jeans', genre: 'Pop', expectedYear: 2012, recognitionScore: 90 },
  { artist: 'Lana Del Rey', query: 'Lana Del Rey Say Yes to Heaven', genre: 'Pop', expectedYear: 2023, recognitionScore: 95 },

  // --- Bastille ---
  { artist: 'Bastille', query: 'Bastille Pompeii', genre: 'Alternative', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Marshmello', query: 'Marshmello Bastille Happier', genre: 'Electronic/Dance', expectedYear: 2018, recognitionScore: 100 },
  { artist: 'Bastille', query: 'Bastille Things We Lost in the Fire', genre: 'Alternative', expectedYear: 2013, recognitionScore: 90 },
  { artist: 'Bastille', query: 'Bastille Good Grief', genre: 'Alternative', expectedYear: 2016, recognitionScore: 85 },

  // --- James Arthur ---
  { artist: 'James Arthur', query: 'James Arthur Say You Won\'t Let Go', genre: 'Pop', expectedYear: 2016, recognitionScore: 100 },
  { artist: 'James Arthur', query: 'James Arthur Impossible', genre: 'Pop', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'James Arthur', query: 'James Arthur Naked', genre: 'Pop', expectedYear: 2017, recognitionScore: 90 },
  { artist: 'James Arthur', query: 'James Arthur Can I Be Him', genre: 'Pop', expectedYear: 2016, recognitionScore: 90 },
  { artist: 'James Arthur', query: 'James Arthur Train Wreck', genre: 'Pop', expectedYear: 2016, recognitionScore: 90 },

  // --- Lukas Graham ---
  { artist: 'Lukas Graham', query: 'Lukas Graham 7 Years', genre: 'Pop', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'Lukas Graham', query: 'Lukas Graham Mama Said', genre: 'Pop', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Lukas Graham', query: 'Lukas Graham Love Someone', genre: 'Pop', expectedYear: 2018, recognitionScore: 90 },
  { artist: 'Lukas Graham', query: 'Lukas Graham You\'re Not There', genre: 'Pop', expectedYear: 2015, recognitionScore: 85 },

  // --- Flo Rida ---
  { artist: 'Flo Rida', query: 'Flo Rida T-Pain Low', genre: 'Hip-Hop/Rap', expectedYear: 2007, recognitionScore: 100 },
  { artist: 'Flo Rida', query: 'Flo Rida Right Round', genre: 'Pop', expectedYear: 2009, recognitionScore: 100 },
  { artist: 'Flo Rida', query: 'Flo Rida David Guetta Club Can\'t Handle Me', genre: 'Pop', expectedYear: 2010, recognitionScore: 100 },
  { artist: 'Flo Rida', query: 'Flo Rida Good Feeling', genre: 'Pop', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Flo Rida', query: 'Flo Rida Whistle', genre: 'Pop', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'Flo Rida', query: 'Flo Rida Sia Wild Ones', genre: 'Pop', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Flo Rida', query: 'Flo Rida My House', genre: 'Pop', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'Flo Rida', query: 'Flo Rida Sage the Gemini GDFR', genre: 'Hip-Hop/Rap', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Flo Rida', query: 'Flo Rida I Cry', genre: 'Pop', expectedYear: 2012, recognitionScore: 90 },

  // --- Ellie Goulding ---
  { artist: 'Ellie Goulding', query: 'Ellie Goulding Lights', genre: 'Pop', expectedYear: 2010, recognitionScore: 100 },
  { artist: 'Ellie Goulding', query: 'Ellie Goulding Burn', genre: 'Pop', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Ellie Goulding', query: 'Ellie Goulding Love Me Like You Do', genre: 'Pop', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'Ellie Goulding', query: 'Ellie Goulding Calvin Harris I Need Your Love', genre: 'Electronic/Dance', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'Ellie Goulding', query: 'Ellie Goulding Calvin Harris Outside', genre: 'Electronic/Dance', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'Ellie Goulding', query: 'Ellie Goulding Calvin Harris Miracle', genre: 'Electronic/Dance', expectedYear: 2023, recognitionScore: 95 },
  { artist: 'Ellie Goulding', query: 'Ellie Goulding On My Mind', genre: 'Pop', expectedYear: 2015, recognitionScore: 90 },
  { artist: 'Ellie Goulding', query: 'Ellie Goulding Starry Eyed', genre: 'Pop', expectedYear: 2010, recognitionScore: 90 },

  // --- Meghan Trainor ---
  { artist: 'Meghan Trainor', query: 'Meghan Trainor All About That Bass', genre: 'Pop', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'Meghan Trainor', query: 'Meghan Trainor Lips Are Movin', genre: 'Pop', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Meghan Trainor', query: 'Meghan Trainor John Legend Like I\'m Gonna Lose You', genre: 'Pop', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'Meghan Trainor', query: 'Meghan Trainor Dear Future Husband', genre: 'Pop', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Meghan Trainor', query: 'Meghan Trainor NO', genre: 'Pop', expectedYear: 2016, recognitionScore: 90 },
  { artist: 'Meghan Trainor', query: 'Meghan Trainor Me Too', genre: 'Pop', expectedYear: 2016, recognitionScore: 90 },
  { artist: 'Meghan Trainor', query: 'Meghan Trainor Made You Look', genre: 'Pop', expectedYear: 2022, recognitionScore: 95 },

  // --- Pharrell Williams ---
  { artist: 'Pharrell Williams', query: 'Pharrell Williams Happy', genre: 'Pop', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Daft Punk', query: 'Daft Punk Pharrell Williams Get Lucky', genre: 'Electronic/Dance', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Pharrell Williams', query: 'Pharrell Williams Freedom', genre: 'Pop', expectedYear: 2015, recognitionScore: 85 },
  { artist: 'Calvin Harris', query: 'Calvin Harris Frank Ocean Migos Slide', genre: 'Electronic/Dance', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Calvin Harris', query: 'Calvin Harris Pharrell Katy Perry Big Sean Feels', genre: 'Pop', expectedYear: 2017, recognitionScore: 95 },

  // --- Kesha ---
  { artist: 'Kesha', query: 'Kesha TiK ToK', genre: 'Pop', expectedYear: 2009, recognitionScore: 100 },
  { artist: 'Kesha', query: 'Kesha Die Young', genre: 'Pop', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'Pitbull', query: 'Pitbull Kesha Timber', genre: 'Pop', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Kesha', query: 'Kesha Praying', genre: 'Pop', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Kesha', query: 'Kesha Blow', genre: 'Pop', expectedYear: 2010, recognitionScore: 95 },
  { artist: 'Kesha', query: 'Kesha We R Who We R', genre: 'Pop', expectedYear: 2010, recognitionScore: 95 },
  { artist: 'Kesha', query: 'Kesha Your Love Is My Drug', genre: 'Pop', expectedYear: 2010, recognitionScore: 95 },
  { artist: 'Kesha', query: 'Kesha Take It Off', genre: 'Pop', expectedYear: 2010, recognitionScore: 90 },

  // --- Carly Rae Jepsen ---
  { artist: 'Carly Rae Jepsen', query: 'Carly Rae Jepsen Call Me Maybe', genre: 'Pop', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Carly Rae Jepsen', query: 'Carly Rae Jepsen I Really Like You', genre: 'Pop', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'Carly Rae Jepsen', query: 'Carly Rae Jepsen Run Away with Me', genre: 'Pop', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'Carly Rae Jepsen', query: 'Carly Rae Jepsen Cut to the Feeling', genre: 'Pop', expectedYear: 2017, recognitionScore: 90 },

  // --- Foster the People ---
  { artist: 'Foster the People', query: 'Foster the People Pumped Up Kicks', genre: 'Alternative', expectedYear: 2010, recognitionScore: 100 },
  { artist: 'Foster the People', query: 'Foster the People Sit Next to Me', genre: 'Alternative', expectedYear: 2017, recognitionScore: 90 },
  { artist: 'Foster the People', query: 'Foster the People Houdini', genre: 'Alternative', expectedYear: 2011, recognitionScore: 85 },
  { artist: 'Foster the People', query: 'Foster the People Helena Beat', genre: 'Alternative', expectedYear: 2011, recognitionScore: 85 },

  // --- OMI ---
  { artist: 'OMI', query: 'OMI Felix Jaehn Cheerleader', genre: 'Pop', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'OMI', query: 'OMI Hula Hoop', genre: 'Pop', expectedYear: 2015, recognitionScore: 85 },

  // --- Iyaz ---
  { artist: 'Iyaz', query: 'Iyaz Replay', genre: 'Pop', expectedYear: 2009, recognitionScore: 100 },
  { artist: 'Iyaz', query: 'Iyaz Solo', genre: 'Pop', expectedYear: 2010, recognitionScore: 90 },
  { artist: 'Iyaz', query: 'Iyaz So Big', genre: 'Pop', expectedYear: 2010, recognitionScore: 85 },

  // --- Nick Jonas & Jonas Brothers ---
  { artist: 'Nick Jonas', query: 'Nick Jonas Jealous', genre: 'Pop', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Nick Jonas', query: 'Nick Jonas Tove Lo Close', genre: 'Pop', expectedYear: 2016, recognitionScore: 90 },
  { artist: 'Nick Jonas', query: 'Nick Jonas Chains', genre: 'Pop', expectedYear: 2014, recognitionScore: 90 },
  { artist: 'Jonas Brothers', query: 'Jonas Brothers Sucker', genre: 'Pop', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'Jonas Brothers', query: 'Jonas Brothers Only Human', genre: 'Pop', expectedYear: 2019, recognitionScore: 95 },
  { artist: 'Jonas Brothers', query: 'Jonas Brothers What a Man Gotta Do', genre: 'Pop', expectedYear: 2020, recognitionScore: 90 },
  { artist: 'Jonas Brothers', query: 'Jonas Brothers Burnin\' Up', genre: 'Pop', expectedYear: 2008, recognitionScore: 95 },
  { artist: 'Jonas Brothers', query: 'Jonas Brothers Year 3000', genre: 'Pop', expectedYear: 2006, recognitionScore: 90 },
  { artist: 'Jonas Brothers', query: 'Jonas Brothers SOS', genre: 'Pop', expectedYear: 2007, recognitionScore: 90 },

  // --- 5 Seconds of Summer ---
  { artist: '5 Seconds of Summer', query: '5 Seconds of Summer Youngblood', genre: 'Pop', expectedYear: 2018, recognitionScore: 100 },
  { artist: '5 Seconds of Summer', query: '5 Seconds of Summer She Looks So Perfect', genre: 'Pop', expectedYear: 2014, recognitionScore: 100 },
  { artist: '5 Seconds of Summer', query: '5 Seconds of Summer Teeth', genre: 'Pop', expectedYear: 2019, recognitionScore: 95 },
  { artist: '5 Seconds of Summer', query: '5 Seconds of Summer Amnesia', genre: 'Pop', expectedYear: 2014, recognitionScore: 95 },
  { artist: '5 Seconds of Summer', query: '5 Seconds of Summer Ghost of You', genre: 'Pop', expectedYear: 2018, recognitionScore: 90 },
  { artist: '5 Seconds of Summer', query: '5 Seconds of Summer Lie to Me', genre: 'Pop', expectedYear: 2018, recognitionScore: 85 },

  // --- One Direction ---
  { artist: 'One Direction', query: 'One Direction What Makes You Beautiful', genre: 'Pop', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'One Direction', query: 'One Direction Story of My Life', genre: 'Pop', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'One Direction', query: 'One Direction Night Changes', genre: 'Pop', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'One Direction', query: 'One Direction Drag Me Down', genre: 'Pop', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'One Direction', query: 'One Direction Steal My Girl', genre: 'Pop', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'One Direction', query: 'One Direction Best Song Ever', genre: 'Pop', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'One Direction', query: 'One Direction Kiss You', genre: 'Pop', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'One Direction', query: 'One Direction Live While We\'re Young', genre: 'Pop', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'One Direction', query: 'One Direction Perfect', genre: 'Pop', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'One Direction', query: 'One Direction History', genre: 'Pop', expectedYear: 2015, recognitionScore: 90 },
  { artist: 'One Direction', query: 'One Direction Little Things', genre: 'Pop', expectedYear: 2012, recognitionScore: 90 },
  { artist: 'One Direction', query: 'One Direction You & I', genre: 'Pop', expectedYear: 2013, recognitionScore: 90 },

  // ==========================================
  // 2020s POP EXPANSION (2020–present)
  // ==========================================

  // --- Sabrina Carpenter ---
  { artist: 'Sabrina Carpenter', query: 'Sabrina Carpenter Espresso', genre: 'Pop', expectedYear: 2024, recognitionScore: 100 },
  { artist: 'Sabrina Carpenter', query: 'Sabrina Carpenter Please Please Please', genre: 'Pop', expectedYear: 2024, recognitionScore: 100 },
  { artist: 'Sabrina Carpenter', query: 'Sabrina Carpenter Feather', genre: 'Pop', expectedYear: 2023, recognitionScore: 95 },
  { artist: 'Sabrina Carpenter', query: 'Sabrina Carpenter Taste', genre: 'Pop', expectedYear: 2024, recognitionScore: 100 },
  { artist: 'Sabrina Carpenter', query: 'Sabrina Carpenter Nonsense', genre: 'Pop', expectedYear: 2022, recognitionScore: 95 },
  { artist: 'Sabrina Carpenter', query: 'Sabrina Carpenter Bed Chem', genre: 'Pop', expectedYear: 2024, recognitionScore: 90 },
  { artist: 'Sabrina Carpenter', query: 'Sabrina Carpenter Juno', genre: 'Pop', expectedYear: 2024, recognitionScore: 90 },

  // --- Chappell Roan ---
  { artist: 'Chappell Roan', query: 'Chappell Roan Good Luck Babe', genre: 'Pop', expectedYear: 2024, recognitionScore: 100 },
  { artist: 'Chappell Roan', query: 'Chappell Roan HOT TO GO', genre: 'Pop', expectedYear: 2023, recognitionScore: 100 },
  { artist: 'Chappell Roan', query: 'Chappell Roan Pink Pony Club', genre: 'Pop', expectedYear: 2020, recognitionScore: 95 },
  { artist: 'Chappell Roan', query: 'Chappell Roan Red Wine Supernova', genre: 'Pop', expectedYear: 2023, recognitionScore: 95 },
  { artist: 'Chappell Roan', query: 'Chappell Roan Casual', genre: 'Pop', expectedYear: 2022, recognitionScore: 90 },
  { artist: 'Chappell Roan', query: 'Chappell Roan Femininomenon', genre: 'Pop', expectedYear: 2022, recognitionScore: 90 },

  // --- Teddy Swims ---
  { artist: 'Teddy Swims', query: 'Teddy Swims Lose Control', genre: 'R&B/Soul', expectedYear: 2023, recognitionScore: 100 },
  { artist: 'Teddy Swims', query: 'Teddy Swims The Door', genre: 'R&B/Soul', expectedYear: 2024, recognitionScore: 95 },
  { artist: 'Teddy Swims', query: 'Teddy Swims Bad Dreams', genre: 'R&B/Soul', expectedYear: 2024, recognitionScore: 90 },
  { artist: 'Teddy Swims', query: 'Teddy Swims Amazing', genre: 'R&B/Soul', expectedYear: 2022, recognitionScore: 85 },
  { artist: 'Teddy Swims', query: 'Teddy Swims Some Things I\'ll Never Know', genre: 'R&B/Soul', expectedYear: 2023, recognitionScore: 85 },

  // --- Benson Boone ---
  { artist: 'Benson Boone', query: 'Benson Boone Beautiful Things', genre: 'Pop', expectedYear: 2024, recognitionScore: 100 },
  { artist: 'Benson Boone', query: 'Benson Boone Slow It Down', genre: 'Pop', expectedYear: 2024, recognitionScore: 95 },
  { artist: 'Benson Boone', query: 'Benson Boone In the Stars', genre: 'Pop', expectedYear: 2022, recognitionScore: 95 },
  { artist: 'Benson Boone', query: 'Benson Boone Ghost Town', genre: 'Pop', expectedYear: 2021, recognitionScore: 90 },
  { artist: 'Benson Boone', query: 'Benson Boone Cry', genre: 'Pop', expectedYear: 2024, recognitionScore: 85 },
  { artist: 'Benson Boone', query: 'Benson Boone Pretty Slowly', genre: 'Pop', expectedYear: 2024, recognitionScore: 85 },

  // --- Tate McRae ---
  { artist: 'Tate McRae', query: 'Tate McRae greedy', genre: 'Pop', expectedYear: 2023, recognitionScore: 100 },
  { artist: 'Tate McRae', query: 'Tate McRae exes', genre: 'Pop', expectedYear: 2023, recognitionScore: 95 },
  { artist: 'Tate McRae', query: 'Tate McRae you broke me first', genre: 'Pop', expectedYear: 2020, recognitionScore: 100 },
  { artist: 'Tate McRae', query: 'Tate McRae she\'s all i wanna be', genre: 'Pop', expectedYear: 2022, recognitionScore: 95 },
  { artist: 'Tate McRae', query: 'Tate McRae run for the hills', genre: 'Pop', expectedYear: 2023, recognitionScore: 90 },
  { artist: 'Tate McRae', query: 'Tate McRae 2 hands', genre: 'Pop', expectedYear: 2024, recognitionScore: 90 },
  { artist: 'Tiësto', query: 'Tiesto Tate McRae 10:35', genre: 'Electronic/Dance', expectedYear: 2022, recognitionScore: 95 },

  // --- Charli XCX ---
  { artist: 'Charli XCX', query: 'Charli xcx 360', genre: 'Pop', expectedYear: 2024, recognitionScore: 100 },
  { artist: 'Charli XCX', query: 'Charli xcx Apple', genre: 'Pop', expectedYear: 2024, recognitionScore: 100 },
  { artist: 'Charli XCX', query: 'Charli xcx Billie Eilish Guess', genre: 'Pop', expectedYear: 2024, recognitionScore: 100 },
  { artist: 'Charli XCX', query: 'Charli xcx Troye Sivan Talk talk', genre: 'Pop', expectedYear: 2024, recognitionScore: 95 },
  { artist: 'Charli XCX', query: 'Charli xcx Von dutch', genre: 'Pop', expectedYear: 2024, recognitionScore: 95 },
  { artist: 'Charli XCX', query: 'Charli XCX Boom Clap', genre: 'Pop', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'Charli XCX', query: 'Charli XCX Speed Drive', genre: 'Pop', expectedYear: 2023, recognitionScore: 95 },
  { artist: 'Charli XCX', query: 'Charli XCX Troye Sivan 1999', genre: 'Pop', expectedYear: 2018, recognitionScore: 90 },
  { artist: 'Icona Pop', query: 'Icona Pop Charli XCX I Love It', genre: 'Pop', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'Iggy Azalea', query: 'Iggy Azalea Charli XCX Fancy', genre: 'Pop', expectedYear: 2014, recognitionScore: 100 },

  // --- RAYE ---
  { artist: 'RAYE', query: 'RAYE 070 Shake Escapism', genre: 'Pop', expectedYear: 2022, recognitionScore: 100 },
  { artist: 'casso', query: 'casso RAYE D-Block Europe PRADA', genre: 'Electronic/Dance', expectedYear: 2023, recognitionScore: 100 },
  { artist: 'RAYE', query: 'RAYE Genesis', genre: 'Pop', expectedYear: 2024, recognitionScore: 90 },
  { artist: 'RAYE', query: 'RAYE Flip A Switch', genre: 'R&B/Soul', expectedYear: 2023, recognitionScore: 85 },
  { artist: 'Disclosure', query: 'Disclosure RAYE Waterfall', genre: 'Electronic/Dance', expectedYear: 2022, recognitionScore: 85 },

  // --- Glass Animals ---
  { artist: 'Glass Animals', query: 'Glass Animals Heat Waves', genre: 'Alternative', expectedYear: 2020, recognitionScore: 100 },
  { artist: 'Glass Animals', query: 'Glass Animals Creatures in Heaven', genre: 'Alternative', expectedYear: 2024, recognitionScore: 90 },
  { artist: 'Glass Animals', query: 'Glass Animals A Tear in Space', genre: 'Alternative', expectedYear: 2024, recognitionScore: 85 },
  { artist: 'Glass Animals', query: 'Glass Animals Gooey', genre: 'Alternative', expectedYear: 2014, recognitionScore: 90 },
  { artist: 'Glass Animals', query: 'Glass Animals The Other Side of Paradise', genre: 'Alternative', expectedYear: 2016, recognitionScore: 85 },

  // --- Lil Nas X ---
  { artist: 'Lil Nas X', query: 'Lil Nas X Billy Ray Cyrus Old Town Road', genre: 'Pop', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'Lil Nas X', query: 'Lil Nas X MONTERO Call Me By Your Name', genre: 'Pop', expectedYear: 2021, recognitionScore: 100 },
  { artist: 'Lil Nas X', query: 'Lil Nas X Jack Harlow INDUSTRY BABY', genre: 'Hip-Hop/Rap', expectedYear: 2021, recognitionScore: 100 },
  { artist: 'Lil Nas X', query: 'Lil Nas X THATS WHAT I WANT', genre: 'Pop', expectedYear: 2021, recognitionScore: 95 },
  { artist: 'Lil Nas X', query: 'Lil Nas X STAR WALKIN', genre: 'Pop', expectedYear: 2022, recognitionScore: 90 },
  { artist: 'Lil Nas X', query: 'Lil Nas X Holiday', genre: 'Pop', expectedYear: 2020, recognitionScore: 90 },
  { artist: 'Lil Nas X', query: 'Lil Nas X Panini', genre: 'Pop', expectedYear: 2019, recognitionScore: 95 },

  // --- Lady Gaga & Bruno Mars (Major 2024 Global Hit) ---
  { artist: 'Lady Gaga', query: 'Lady Gaga Bruno Mars Die With a Smile', genre: 'Pop', expectedYear: 2024, recognitionScore: 100 },

  // --- Olivia Rodrigo ---
  { artist: 'Olivia Rodrigo', query: 'Olivia Rodrigo drivers license', genre: 'Pop', expectedYear: 2021, recognitionScore: 100 },
  { artist: 'Olivia Rodrigo', query: 'Olivia Rodrigo good 4 u', genre: 'Pop', expectedYear: 2021, recognitionScore: 100 },
  { artist: 'Olivia Rodrigo', query: 'Olivia Rodrigo vampire', genre: 'Pop', expectedYear: 2023, recognitionScore: 100 },
  { artist: 'Olivia Rodrigo', query: 'Olivia Rodrigo deja vu', genre: 'Pop', expectedYear: 2021, recognitionScore: 95 },
  { artist: 'Olivia Rodrigo', query: 'Olivia Rodrigo bad idea right', genre: 'Pop', expectedYear: 2023, recognitionScore: 95 },
  { artist: 'Olivia Rodrigo', query: 'Olivia Rodrigo traitor', genre: 'Pop', expectedYear: 2021, recognitionScore: 95 },
  { artist: 'Olivia Rodrigo', query: 'Olivia Rodrigo get him back', genre: 'Pop', expectedYear: 2023, recognitionScore: 95 },
  { artist: 'Olivia Rodrigo', query: 'Olivia Rodrigo brutal', genre: 'Alternative', expectedYear: 2021, recognitionScore: 90 },
  { artist: 'Olivia Rodrigo', query: 'Olivia Rodrigo happier', genre: 'Pop', expectedYear: 2021, recognitionScore: 90 },
  { artist: 'Olivia Rodrigo', query: 'Olivia Rodrigo obsessed', genre: 'Pop', expectedYear: 2024, recognitionScore: 90 },

  // --- Billie Eilish ---
  { artist: 'Billie Eilish', query: 'Billie Eilish bad guy', genre: 'Pop', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'Billie Eilish', query: 'Billie Eilish BIRDS OF A FEATHER', genre: 'Pop', expectedYear: 2024, recognitionScore: 100 },
  { artist: 'Billie Eilish', query: 'Billie Eilish LUNCH', genre: 'Pop', expectedYear: 2024, recognitionScore: 95 },
  { artist: 'Billie Eilish', query: 'Billie Eilish What Was I Made For', genre: 'Pop', expectedYear: 2023, recognitionScore: 100 },
  { artist: 'Billie Eilish', query: 'Billie Eilish everything i wanted', genre: 'Pop', expectedYear: 2019, recognitionScore: 95 },
  { artist: 'Billie Eilish', query: 'Billie Eilish Khalid lovely', genre: 'Pop', expectedYear: 2018, recognitionScore: 100 },
  { artist: 'Billie Eilish', query: 'Billie Eilish Happier Than Ever', genre: 'Pop', expectedYear: 2021, recognitionScore: 100 },
  { artist: 'Billie Eilish', query: 'Billie Eilish ocean eyes', genre: 'Pop', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Billie Eilish', query: 'Billie Eilish CHIHIRO', genre: 'Pop', expectedYear: 2024, recognitionScore: 95 },
  { artist: 'Billie Eilish', query: 'Billie Eilish WILDFLOWER', genre: 'Pop', expectedYear: 2024, recognitionScore: 95 },
  { artist: 'Billie Eilish', query: 'Billie Eilish Therefore I Am', genre: 'Pop', expectedYear: 2020, recognitionScore: 95 },
  { artist: 'Billie Eilish', query: 'Billie Eilish bury a friend', genre: 'Pop', expectedYear: 2019, recognitionScore: 95 },
  { artist: 'Billie Eilish', query: 'Billie Eilish when the partys over', genre: 'Pop', expectedYear: 2018, recognitionScore: 95 },

  // --- Harry Styles ---
  { artist: 'Harry Styles', query: 'Harry Styles As It Was', genre: 'Pop', expectedYear: 2022, recognitionScore: 100 },
  { artist: 'Harry Styles', query: 'Harry Styles Watermelon Sugar', genre: 'Pop', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'Harry Styles', query: 'Harry Styles Sign of the Times', genre: 'Pop', expectedYear: 2017, recognitionScore: 100 },
  { artist: 'Harry Styles', query: 'Harry Styles Adore You', genre: 'Pop', expectedYear: 2019, recognitionScore: 95 },
  { artist: 'Harry Styles', query: 'Harry Styles Late Night Talking', genre: 'Pop', expectedYear: 2022, recognitionScore: 95 },
  { artist: 'Harry Styles', query: 'Harry Styles Golden', genre: 'Pop', expectedYear: 2019, recognitionScore: 90 },
  { artist: 'Harry Styles', query: 'Harry Styles Falling', genre: 'Pop', expectedYear: 2019, recognitionScore: 90 },
  { artist: 'Harry Styles', query: 'Harry Styles Music for a Sushi Restaurant', genre: 'Pop', expectedYear: 2022, recognitionScore: 90 },

  // --- Doja Cat ---
  { artist: 'Doja Cat', query: 'Doja Cat Say So', genre: 'Pop', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'Doja Cat', query: 'Doja Cat SZA Kiss Me More', genre: 'Pop', expectedYear: 2021, recognitionScore: 100 },
  { artist: 'Doja Cat', query: 'Doja Cat Paint the Town Red', genre: 'Hip-Hop/Rap', expectedYear: 2023, recognitionScore: 100 },
  { artist: 'Doja Cat', query: 'Doja Cat Woman', genre: 'Pop', expectedYear: 2021, recognitionScore: 100 },
  { artist: 'Doja Cat', query: 'Doja Cat Need to Know', genre: 'R&B/Soul', expectedYear: 2021, recognitionScore: 95 },
  { artist: 'Doja Cat', query: 'Doja Cat Agora Hills', genre: 'R&B/Soul', expectedYear: 2023, recognitionScore: 95 },
  { artist: 'Doja Cat', query: 'Doja Cat Streets', genre: 'R&B/Soul', expectedYear: 2019, recognitionScore: 95 },
  { artist: 'Doja Cat', query: 'Doja Cat Get Into It Yuh', genre: 'Pop', expectedYear: 2021, recognitionScore: 90 },
  { artist: 'Doja Cat', query: 'Doja Cat Vegas', genre: 'Hip-Hop/Rap', expectedYear: 2022, recognitionScore: 90 },

  // --- Post Malone (2020s & country crossover) ---
  { artist: 'Post Malone', query: 'Post Malone Morgan Wallen I Had Some Help', genre: 'Country', expectedYear: 2024, recognitionScore: 100 },
  { artist: 'Post Malone', query: 'Post Malone Chemical', genre: 'Pop', expectedYear: 2023, recognitionScore: 95 },
  { artist: 'Post Malone', query: 'Post Malone Blake Shelton Pour Me a Drink', genre: 'Country', expectedYear: 2024, recognitionScore: 95 },
  { artist: 'Post Malone', query: 'Post Malone Luke Combs Guy For That', genre: 'Country', expectedYear: 2024, recognitionScore: 90 },
  { artist: 'Post Malone', query: 'Post Malone Doja Cat I Like You A Happier Song', genre: 'Pop', expectedYear: 2022, recognitionScore: 95 },
  { artist: 'Post Malone', query: 'Post Malone The Weeknd One Right Now', genre: 'Pop', expectedYear: 2021, recognitionScore: 90 },
  { artist: 'Post Malone', query: 'Post Malone Mourning', genre: 'Pop', expectedYear: 2023, recognitionScore: 90 },
  { artist: 'Post Malone', query: 'Post Malone Overdrive', genre: 'Pop', expectedYear: 2023, recognitionScore: 85 },

  // --- Tiësto ---
  { artist: 'Tiësto', query: 'Tiesto The Business', genre: 'Electronic/Dance', expectedYear: 2020, recognitionScore: 100 },
  { artist: 'Tiësto', query: 'Tiesto Karol G Don\'t Be Shy', genre: 'Electronic/Dance', expectedYear: 2021, recognitionScore: 95 },
  { artist: 'Tiësto', query: 'Tiesto Ava Max The Motto', genre: 'Electronic/Dance', expectedYear: 2021, recognitionScore: 95 },
  { artist: 'Tiësto', query: 'Tiesto Redlight', genre: 'Electronic/Dance', expectedYear: 2022, recognitionScore: 85 },
  { artist: 'Tiësto', query: 'Tiesto Lay Low', genre: 'Electronic/Dance', expectedYear: 2023, recognitionScore: 85 },

  // --- David Guetta ---
  { artist: 'David Guetta', query: 'David Guetta Bebe Rexha I\'m Good Blue', genre: 'Electronic/Dance', expectedYear: 2022, recognitionScore: 100 },
  { artist: 'David Guetta', query: 'David Guetta Anne-Marie Coi Leray Baby Don\'t Hurt Me', genre: 'Electronic/Dance', expectedYear: 2023, recognitionScore: 95 },
  { artist: 'David Guetta', query: 'David Guetta Sia Titanium', genre: 'Electronic/Dance', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'David Guetta', query: 'David Guetta Kid Cudi Memories', genre: 'Electronic/Dance', expectedYear: 2009, recognitionScore: 95 },
  { artist: 'David Guetta', query: 'David Guetta Usher Without You', genre: 'Electronic/Dance', expectedYear: 2011, recognitionScore: 95 },
  { artist: 'David Guetta', query: 'David Guetta Akon Sexy Bitch', genre: 'Electronic/Dance', expectedYear: 2009, recognitionScore: 100 },
  { artist: 'David Guetta', query: 'David Guetta Nicki Minaj Bebe Rexha Afrojack Hey Mama', genre: 'Electronic/Dance', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'David Guetta', query: 'David Guetta Showtek Lovers on the Sun', genre: 'Electronic/Dance', expectedYear: 2014, recognitionScore: 90 },

  // --- Dua Lipa ---
  { artist: 'Dua Lipa', query: 'Dua Lipa Don\'t Start Now', genre: 'Pop', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'Dua Lipa', query: 'Dua Lipa Levitating', genre: 'Pop', expectedYear: 2020, recognitionScore: 100 },
  { artist: 'Dua Lipa', query: 'Dua Lipa Dance the Night', genre: 'Pop', expectedYear: 2023, recognitionScore: 100 },
  { artist: 'Dua Lipa', query: 'Dua Lipa Houdini', genre: 'Pop', expectedYear: 2023, recognitionScore: 100 },
  { artist: 'Dua Lipa', query: 'Dua Lipa Training Season', genre: 'Pop', expectedYear: 2024, recognitionScore: 95 },
  { artist: 'Dua Lipa', query: 'Dua Lipa Physical', genre: 'Pop', expectedYear: 2020, recognitionScore: 95 },
  { artist: 'Dua Lipa', query: 'Dua Lipa Break My Heart', genre: 'Pop', expectedYear: 2020, recognitionScore: 95 },
  { artist: 'Dua Lipa', query: 'Dua Lipa New Rules', genre: 'Pop', expectedYear: 2017, recognitionScore: 100 },
  { artist: 'Dua Lipa', query: 'Dua Lipa IDGAF', genre: 'Pop', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Calvin Harris', query: 'Calvin Harris Dua Lipa One Kiss', genre: 'Electronic/Dance', expectedYear: 2018, recognitionScore: 100 },
  { artist: 'Elton John', query: 'Elton John Dua Lipa Cold Heart PNAU', genre: 'Pop', expectedYear: 2021, recognitionScore: 100 },

  // --- Taylor Swift ---
  { artist: 'Taylor Swift', query: 'Taylor Swift Cruel Summer', genre: 'Pop', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'Taylor Swift', query: 'Taylor Swift Anti-Hero', genre: 'Pop', expectedYear: 2022, recognitionScore: 100 },
  { artist: 'Taylor Swift', query: 'Taylor Swift Post Malone Fortnight', genre: 'Pop', expectedYear: 2024, recognitionScore: 100 },
  { artist: 'Taylor Swift', query: 'Taylor Swift I Can Do It With a Broken Heart', genre: 'Pop', expectedYear: 2024, recognitionScore: 95 },
  { artist: 'Taylor Swift', query: 'Taylor Swift Cardigan', genre: 'Alternative', expectedYear: 2020, recognitionScore: 95 },
  { artist: 'Taylor Swift', query: 'Taylor Swift exile Bon Iver', genre: 'Alternative', expectedYear: 2020, recognitionScore: 95 },
  { artist: 'Taylor Swift', query: 'Taylor Swift willow', genre: 'Alternative', expectedYear: 2020, recognitionScore: 90 },
  { artist: 'Taylor Swift', query: 'Taylor Swift Lover', genre: 'Pop', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'Taylor Swift', query: 'Taylor Swift Lavender Haze', genre: 'Pop', expectedYear: 2022, recognitionScore: 95 },
  { artist: 'Taylor Swift', query: 'Taylor Swift Karma', genre: 'Pop', expectedYear: 2022, recognitionScore: 95 },

  // --- The Weeknd ---
  { artist: 'The Weeknd', query: 'The Weeknd Blinding Lights', genre: 'Pop', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'The Weeknd', query: 'The Weeknd Save Your Tears', genre: 'Pop', expectedYear: 2020, recognitionScore: 100 },
  { artist: 'The Weeknd', query: 'The Weeknd Starboy', genre: 'R&B/Soul', expectedYear: 2016, recognitionScore: 100 },
  { artist: 'The Weeknd', query: 'The Weeknd Can\'t Feel My Face', genre: 'Pop', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'The Weeknd', query: 'The Weeknd The Hills', genre: 'R&B/Soul', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'The Weeknd', query: 'The Weeknd Die for You', genre: 'R&B/Soul', expectedYear: 2016, recognitionScore: 100 },
  { artist: 'The Weeknd', query: 'The Weeknd I Feel It Coming', genre: 'Pop', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'The Weeknd', query: 'The Weeknd In Your Eyes', genre: 'Pop', expectedYear: 2020, recognitionScore: 95 },
  { artist: 'The Weeknd', query: 'The Weeknd Out of Time', genre: 'R&B/Soul', expectedYear: 2022, recognitionScore: 90 },
  { artist: 'The Weeknd', query: 'The Weeknd Playboi Carti Timeless', genre: 'R&B/Soul', expectedYear: 2024, recognitionScore: 95 },
  { artist: 'The Weeknd', query: 'The Weeknd Dancing in the Flames', genre: 'Pop', expectedYear: 2024, recognitionScore: 95 },
];
