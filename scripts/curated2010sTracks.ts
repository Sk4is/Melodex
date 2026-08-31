export interface CuratedTrackRequest {
  artist: string;
  query: string;
  genre: string;
  expectedYear: number;
  recognitionScore: number;
}

export const CURATED_2010S_HITS: CuratedTrackRequest[] = [
  // === POP ===
  { artist: 'Adele', query: 'Adele Rolling in the Deep', genre: 'Pop', expectedYear: 2010, recognitionScore: 100 },
  { artist: 'Adele', query: 'Adele Someone Like You', genre: 'Pop', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Adele', query: 'Adele Set Fire to the Rain', genre: 'Pop', expectedYear: 2011, recognitionScore: 95 },
  { artist: 'Adele', query: 'Adele Hello', genre: 'Pop', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'Adele', query: 'Adele When We Were Young', genre: 'Pop', expectedYear: 2015, recognitionScore: 90 },

  { artist: 'Rihanna', query: 'Rihanna Only Girl In The World', genre: 'Pop', expectedYear: 2010, recognitionScore: 95 },
  { artist: 'Rihanna', query: 'Rihanna Diamonds', genre: 'Pop', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'Rihanna', query: 'Rihanna We Found Love', genre: 'Pop', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Rihanna', query: 'Rihanna Work', genre: 'Pop', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Rihanna', query: 'Rihanna Stay', genre: 'Pop', expectedYear: 2012, recognitionScore: 90 },
  { artist: 'Rihanna', query: 'Rihanna Love on the Brain', genre: 'R&B/Soul', expectedYear: 2016, recognitionScore: 95 },

  { artist: 'Lady Gaga', query: 'Lady Gaga Born This Way', genre: 'Pop', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Lady Gaga', query: 'Lady Gaga Judas', genre: 'Pop', expectedYear: 2011, recognitionScore: 90 },
  { artist: 'Lady Gaga', query: 'Lady Gaga The Edge of Glory', genre: 'Pop', expectedYear: 2011, recognitionScore: 90 },
  { artist: 'Lady Gaga', query: 'Lady Gaga Bradley Cooper Shallow', genre: 'Pop', expectedYear: 2018, recognitionScore: 100 },
  { artist: 'Lady Gaga', query: 'Lady Gaga Applause', genre: 'Pop', expectedYear: 2013, recognitionScore: 85 },
  { artist: 'Lady Gaga', query: 'Lady Gaga Million Reasons', genre: 'Pop', expectedYear: 2016, recognitionScore: 90 },

  { artist: 'Katy Perry', query: 'Katy Perry Firework', genre: 'Pop', expectedYear: 2010, recognitionScore: 100 },
  { artist: 'Katy Perry', query: 'Katy Perry California Gurls', genre: 'Pop', expectedYear: 2010, recognitionScore: 95 },
  { artist: 'Katy Perry', query: 'Katy Perry Teenage Dream', genre: 'Pop', expectedYear: 2010, recognitionScore: 95 },
  { artist: 'Katy Perry', query: 'Katy Perry Roar', genre: 'Pop', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Katy Perry', query: 'Katy Perry Dark Horse', genre: 'Pop', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Katy Perry', query: 'Katy Perry Last Friday Night', genre: 'Pop', expectedYear: 2010, recognitionScore: 95 },

  { artist: 'Bruno Mars', query: 'Bruno Mars Just the Way You Are', genre: 'Pop', expectedYear: 2010, recognitionScore: 100 },
  { artist: 'Bruno Mars', query: 'Bruno Mars Grenade', genre: 'Pop', expectedYear: 2010, recognitionScore: 95 },
  { artist: 'Bruno Mars', query: 'Bruno Mars Locked Out of Heaven', genre: 'Pop', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Bruno Mars', query: 'Bruno Mars When I Was Your Man', genre: 'Pop', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Bruno Mars', query: 'Bruno Mars 24K Magic', genre: 'Pop', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Bruno Mars', query: 'Bruno Mars That\'s What I Like', genre: 'R&B/Soul', expectedYear: 2016, recognitionScore: 100 },
  { artist: 'Mark Ronson', query: 'Mark Ronson Uptown Funk Bruno Mars', genre: 'Pop', expectedYear: 2014, recognitionScore: 100 },

  { artist: 'Taylor Swift', query: 'Taylor Swift Shake It Off', genre: 'Pop', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'Taylor Swift', query: 'Taylor Swift Blank Space', genre: 'Pop', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'Taylor Swift', query: 'Taylor Swift Bad Blood', genre: 'Pop', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Taylor Swift', query: 'Taylor Swift Style', genre: 'Pop', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Taylor Swift', query: 'Taylor Swift I Knew You Were Trouble', genre: 'Pop', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Taylor Swift', query: 'Taylor Swift We Are Never Ever Getting Back Together', genre: 'Pop', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Taylor Swift', query: 'Taylor Swift Look What You Made Me Do', genre: 'Pop', expectedYear: 2017, recognitionScore: 90 },

  { artist: 'Ariana Grande', query: 'Ariana Grande thank u next', genre: 'Pop', expectedYear: 2018, recognitionScore: 100 },
  { artist: 'Ariana Grande', query: 'Ariana Grande 7 rings', genre: 'Pop', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'Ariana Grande', query: 'Ariana Grande No Tears Left to Cry', genre: 'Pop', expectedYear: 2018, recognitionScore: 95 },
  { artist: 'Ariana Grande', query: 'Ariana Grande Problem Iggy Azalea', genre: 'Pop', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Ariana Grande', query: 'Ariana Grande Into You', genre: 'Pop', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Ariana Grande', query: 'Ariana Grande Side to Side Nicki Minaj', genre: 'Pop', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Ariana Grande', query: 'Ariana Grande One Last Time', genre: 'Pop', expectedYear: 2014, recognitionScore: 90 },

  { artist: 'Justin Bieber', query: 'Justin Bieber Sorry', genre: 'Pop', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'Justin Bieber', query: 'Justin Bieber Love Yourself', genre: 'Pop', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'Justin Bieber', query: 'Justin Bieber What Do You Mean', genre: 'Pop', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'Justin Bieber', query: 'Justin Bieber Baby Ludacris', genre: 'Pop', expectedYear: 2010, recognitionScore: 100 },
  { artist: 'Justin Bieber', query: 'Justin Bieber Boyfriend', genre: 'Pop', expectedYear: 2012, recognitionScore: 90 },

  { artist: 'Ed Sheeran', query: 'Ed Sheeran Shape of You', genre: 'Pop', expectedYear: 2017, recognitionScore: 100 },
  { artist: 'Ed Sheeran', query: 'Ed Sheeran Thinking Out Loud', genre: 'Pop', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'Ed Sheeran', query: 'Ed Sheeran Perfect', genre: 'Pop', expectedYear: 2017, recognitionScore: 100 },
  { artist: 'Ed Sheeran', query: 'Ed Sheeran Photograph', genre: 'Pop', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Ed Sheeran', query: 'Ed Sheeran The A Team', genre: 'Pop', expectedYear: 2011, recognitionScore: 90 },
  { artist: 'Ed Sheeran', query: 'Ed Sheeran Castle on the Hill', genre: 'Pop', expectedYear: 2017, recognitionScore: 90 },

  { artist: 'The Weeknd', query: 'The Weeknd Can\'t Feel My Face', genre: 'R&B/Soul', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'The Weeknd', query: 'The Weeknd The Hills', genre: 'R&B/Soul', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'The Weeknd', query: 'The Weeknd Starboy Daft Punk', genre: 'R&B/Soul', expectedYear: 2016, recognitionScore: 100 },
  { artist: 'The Weeknd', query: 'The Weeknd I Feel It Coming', genre: 'R&B/Soul', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'The Weeknd', query: 'The Weeknd Earned It', genre: 'R&B/Soul', expectedYear: 2014, recognitionScore: 90 },
  { artist: 'The Weeknd', query: 'The Weeknd Call Out My Name', genre: 'R&B/Soul', expectedYear: 2018, recognitionScore: 95 },
  { artist: 'The Weeknd', query: 'The Weeknd Wicked Games', genre: 'R&B/Soul', expectedYear: 2012, recognitionScore: 90 },

  { artist: 'Dua Lipa', query: 'Dua Lipa New Rules', genre: 'Pop', expectedYear: 2017, recognitionScore: 100 },
  { artist: 'Dua Lipa', query: 'Dua Lipa IDGAF', genre: 'Pop', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Dua Lipa', query: 'Dua Lipa Don\'t Start Now', genre: 'Pop', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'Dua Lipa', query: 'Dua Lipa One Kiss Calvin Harris', genre: 'Dance', expectedYear: 2018, recognitionScore: 100 },

  { artist: 'Sia', query: 'Sia Chandelier', genre: 'Pop', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'Sia', query: 'Sia Cheap Thrills', genre: 'Pop', expectedYear: 2016, recognitionScore: 100 },
  { artist: 'Sia', query: 'Sia Elastic Heart', genre: 'Pop', expectedYear: 2013, recognitionScore: 90 },

  { artist: 'Miley Cyrus', query: 'Miley Cyrus Wrecking Ball', genre: 'Pop', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Miley Cyrus', query: 'Miley Cyrus We Can\'t Stop', genre: 'Pop', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'Miley Cyrus', query: 'Miley Cyrus Malibu', genre: 'Pop', expectedYear: 2017, recognitionScore: 90 },

  { artist: 'Selena Gomez', query: 'Selena Gomez Lose You to Love Me', genre: 'Pop', expectedYear: 2019, recognitionScore: 95 },
  { artist: 'Selena Gomez', query: 'Selena Gomez Hands to Myself', genre: 'Pop', expectedYear: 2015, recognitionScore: 90 },
  { artist: 'Selena Gomez', query: 'Selena Gomez Come & Get It', genre: 'Pop', expectedYear: 2013, recognitionScore: 90 },

  { artist: 'Demi Lovato', query: 'Demi Lovato Heart Attack', genre: 'Pop', expectedYear: 2013, recognitionScore: 90 },
  { artist: 'Demi Lovato', query: 'Demi Lovato Sorry Not Sorry', genre: 'Pop', expectedYear: 2017, recognitionScore: 90 },
  { artist: 'Demi Lovato', query: 'Demi Lovato Cool for the Summer', genre: 'Pop', expectedYear: 2015, recognitionScore: 90 },

  { artist: 'One Direction', query: 'One Direction What Makes You Beautiful', genre: 'Pop', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'One Direction', query: 'One Direction Story of My Life', genre: 'Pop', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'One Direction', query: 'One Direction Drag Me Down', genre: 'Pop', expectedYear: 2015, recognitionScore: 90 },
  { artist: 'One Direction', query: 'One Direction Night Changes', genre: 'Pop', expectedYear: 2014, recognitionScore: 90 },

  { artist: 'Maroon 5', query: 'Maroon 5 Moves Like Jagger', genre: 'Pop', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Maroon 5', query: 'Maroon 5 Sugar', genre: 'Pop', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'Maroon 5', query: 'Maroon 5 Payphone', genre: 'Pop', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Maroon 5', query: 'Maroon 5 Girls Like You Cardi B', genre: 'Pop', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Maroon 5', query: 'Maroon 5 Animals', genre: 'Pop', expectedYear: 2014, recognitionScore: 90 },
  { artist: 'Maroon 5', query: 'Maroon 5 Memories', genre: 'Pop', expectedYear: 2019, recognitionScore: 95 },

  { artist: 'Shawn Mendes', query: 'Shawn Mendes Stitches', genre: 'Pop', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'Shawn Mendes', query: 'Shawn Mendes Treat You Better', genre: 'Pop', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Shawn Mendes', query: 'Shawn Mendes Camila Cabello Senorita', genre: 'Pop', expectedYear: 2019, recognitionScore: 100 },

  { artist: 'Camila Cabello', query: 'Camila Cabello Havana Young Thug', genre: 'Pop', expectedYear: 2017, recognitionScore: 100 },
  { artist: 'Camila Cabello', query: 'Camila Cabello Never Be the Same', genre: 'Pop', expectedYear: 2017, recognitionScore: 90 },

  { artist: 'Lorde', query: 'Lorde Royals', genre: 'Alternative', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Lorde', query: 'Lorde Team', genre: 'Alternative', expectedYear: 2013, recognitionScore: 90 },
  { artist: 'Lorde', query: 'Lorde Green Light', genre: 'Alternative', expectedYear: 2017, recognitionScore: 90 },

  { artist: 'P!nk', query: 'P!nk Just Give Me a Reason Nate Ruess', genre: 'Pop', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'P!nk', query: 'P!nk Raise Your Glass', genre: 'Pop', expectedYear: 2010, recognitionScore: 95 },
  { artist: 'P!nk', query: 'P!nk What About Us', genre: 'Pop', expectedYear: 2017, recognitionScore: 90 },

  { artist: 'Kesha', query: 'Kesha TiK ToK', genre: 'Pop', expectedYear: 2010, recognitionScore: 100 },
  { artist: 'Kesha', query: 'Kesha Die Young', genre: 'Pop', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Kesha', query: 'Kesha Praying', genre: 'Pop', expectedYear: 2017, recognitionScore: 90 },

  { artist: 'Carly Rae Jepsen', query: 'Carly Rae Jepsen Call Me Maybe', genre: 'Pop', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Carly Rae Jepsen', query: 'Carly Rae Jepsen I Really Like You', genre: 'Pop', expectedYear: 2015, recognitionScore: 90 },

  { artist: 'Meghan Trainor', query: 'Meghan Trainor All About That Bass', genre: 'Pop', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'Meghan Trainor', query: 'Meghan Trainor Lips Are Movin', genre: 'Pop', expectedYear: 2014, recognitionScore: 85 },

  { artist: 'Ellie Goulding', query: 'Ellie Goulding Lights', genre: 'Pop', expectedYear: 2010, recognitionScore: 95 },
  { artist: 'Ellie Goulding', query: 'Ellie Goulding Love Me Like You Do', genre: 'Pop', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'Ellie Goulding', query: 'Ellie Goulding Burn', genre: 'Pop', expectedYear: 2013, recognitionScore: 95 },

  { artist: 'Charlie Puth', query: 'Charlie Puth Attention', genre: 'Pop', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Charlie Puth', query: 'Charlie Puth We Don\'t Talk Anymore Selena Gomez', genre: 'Pop', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Wiz Khalifa', query: 'Wiz Khalifa See You Again Charlie Puth', genre: 'Hip-Hop/Rap', expectedYear: 2015, recognitionScore: 100 },

  { artist: 'Sam Smith', query: 'Sam Smith Stay With Me', genre: 'Pop', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'Sam Smith', query: 'Sam Smith I\'m Not The Only One', genre: 'Pop', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Sam Smith', query: 'Sam Smith Too Good At Goodbyes', genre: 'Pop', expectedYear: 2017, recognitionScore: 90 },

  { artist: 'Lana Del Rey', query: 'Lana Del Rey Summertime Sadness', genre: 'Alternative', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'Lana Del Rey', query: 'Lana Del Rey Video Games', genre: 'Alternative', expectedYear: 2011, recognitionScore: 95 },
  { artist: 'Lana Del Rey', query: 'Lana Del Rey Born to Die', genre: 'Alternative', expectedYear: 2011, recognitionScore: 90 },
  { artist: 'Lana Del Rey', query: 'Lana Del Rey Young and Beautiful', genre: 'Alternative', expectedYear: 2013, recognitionScore: 95 },

  { artist: 'Billie Eilish', query: 'Billie Eilish bad guy', genre: 'Alternative', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'Billie Eilish', query: 'Billie Eilish ocean eyes', genre: 'Alternative', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Billie Eilish', query: 'Billie Eilish when the party\'s over', genre: 'Alternative', expectedYear: 2018, recognitionScore: 95 },
  { artist: 'Billie Eilish', query: 'Billie Eilish bury a friend', genre: 'Alternative', expectedYear: 2019, recognitionScore: 90 },

  { artist: 'Harry Styles', query: 'Harry Styles Sign of the Times', genre: 'Pop', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Harry Styles', query: 'Harry Styles Watermelon Sugar', genre: 'Pop', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'Harry Styles', query: 'Harry Styles Lights Up', genre: 'Pop', expectedYear: 2019, recognitionScore: 90 },

  { artist: 'Halsey', query: 'Halsey Without Me', genre: 'Pop', expectedYear: 2018, recognitionScore: 95 },
  { artist: 'Halsey', query: 'Halsey Bad at Love', genre: 'Pop', expectedYear: 2017, recognitionScore: 90 },

  { artist: 'Gotye', query: 'Gotye Somebody That I Used to Know Kimbra', genre: 'Alternative', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'fun.', query: 'fun. We Are Young Janelle Monae', genre: 'Alternative', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'fun.', query: 'fun. Some Nights', genre: 'Alternative', expectedYear: 2012, recognitionScore: 95 },

  // === EDM / ELECTRONIC / DANCE ===
  { artist: 'Avicii', query: 'Avicii Levels', genre: 'Dance', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Avicii', query: 'Avicii Wake Me Up', genre: 'Dance', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Avicii', query: 'Avicii Hey Brother', genre: 'Dance', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'Avicii', query: 'Avicii The Nights', genre: 'Dance', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Avicii', query: 'Avicii Waiting for Love', genre: 'Dance', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'Avicii', query: 'Avicii Without You', genre: 'Dance', expectedYear: 2017, recognitionScore: 90 },
  { artist: 'Avicii', query: 'Avicii I Could Be the One Nicky Romero', genre: 'Dance', expectedYear: 2012, recognitionScore: 90 },

  { artist: 'David Guetta', query: 'David Guetta Titanium Sia', genre: 'Dance', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'David Guetta', query: 'David Guetta Without You Usher', genre: 'Dance', expectedYear: 2011, recognitionScore: 95 },
  { artist: 'David Guetta', query: 'David Guetta Turn Me On Nicki Minaj', genre: 'Dance', expectedYear: 2011, recognitionScore: 90 },
  { artist: 'David Guetta', query: 'David Guetta Play Hard Akon Ne-Yo', genre: 'Dance', expectedYear: 2012, recognitionScore: 90 },
  { artist: 'David Guetta', query: 'David Guetta Hey Mama Nicki Minaj', genre: 'Dance', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'David Guetta', query: 'David Guetta Bebe Rexha J Balvin Say My Name', genre: 'Dance', expectedYear: 2018, recognitionScore: 85 },

  { artist: 'Calvin Harris', query: 'Calvin Harris Summer', genre: 'Dance', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'Calvin Harris', query: 'Calvin Harris Feel So Close', genre: 'Dance', expectedYear: 2011, recognitionScore: 95 },
  { artist: 'Calvin Harris', query: 'Calvin Harris This Is What You Came For Rihanna', genre: 'Dance', expectedYear: 2016, recognitionScore: 100 },
  { artist: 'Calvin Harris', query: 'Calvin Harris How Deep Is Your Love Disciples', genre: 'Dance', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'Calvin Harris', query: 'Calvin Harris Sweet Nothing Florence Welch', genre: 'Dance', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Calvin Harris', query: 'Calvin Harris Blame John Newman', genre: 'Dance', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Calvin Harris', query: 'Calvin Harris Frank Ocean Migos Slide', genre: 'Dance', expectedYear: 2017, recognitionScore: 95 },

  { artist: 'Swedish House Mafia', query: 'Swedish House Mafia Don\'t You Worry Child', genre: 'Dance', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'Swedish House Mafia', query: 'Swedish House Mafia Save the World', genre: 'Dance', expectedYear: 2011, recognitionScore: 95 },
  { artist: 'Swedish House Mafia', query: 'Swedish House Mafia Miami 2 Ibiza', genre: 'Dance', expectedYear: 2010, recognitionScore: 90 },

  { artist: 'Martin Garrix', query: 'Martin Garrix Animals', genre: 'Dance', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Martin Garrix', query: 'Martin Garrix Bebe Rexha In the Name of Love', genre: 'Dance', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Martin Garrix', query: 'Martin Garrix Dua Lipa Scared to Be Lonely', genre: 'Dance', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Martin Garrix', query: 'Martin Garrix Khalid Ocean', genre: 'Dance', expectedYear: 2018, recognitionScore: 90 },

  { artist: 'Skrillex', query: 'Skrillex Scary Monsters and Nice Sprites', genre: 'Electronic', expectedYear: 2010, recognitionScore: 95 },
  { artist: 'Skrillex', query: 'Skrillex Bangarang', genre: 'Electronic', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Skrillex', query: 'Skrillex Diplo Justin Bieber Where Are U Now', genre: 'Dance', expectedYear: 2015, recognitionScore: 100 },

  { artist: 'Zedd', query: 'Zedd Clarity Foxes', genre: 'Dance', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'Zedd', query: 'Zedd Stay Alessia Cara', genre: 'Dance', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Zedd', query: 'Zedd Maren Morris The Middle Grey', genre: 'Dance', expectedYear: 2018, recognitionScore: 100 },
  { artist: 'Zedd', query: 'Zedd Beautiful Now Jon Bellion', genre: 'Dance', expectedYear: 2015, recognitionScore: 90 },

  { artist: 'Kygo', query: 'Kygo Firestone Conrad Sewell', genre: 'Dance', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Kygo', query: 'Kygo Selena Gomez It Ain\'t Me', genre: 'Dance', expectedYear: 2017, recognitionScore: 100 },
  { artist: 'Kygo', query: 'Kygo Stargazing', genre: 'Dance', expectedYear: 2017, recognitionScore: 90 },
  { artist: 'Kygo', query: 'Kygo Whitney Houston Higher Love', genre: 'Dance', expectedYear: 2019, recognitionScore: 95 },

  { artist: 'Marshmello', query: 'Marshmello Alone', genre: 'Dance', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Marshmello', query: 'Marshmello Bastille Happier', genre: 'Dance', expectedYear: 2018, recognitionScore: 100 },
  { artist: 'Marshmello', query: 'Marshmello Khalid Silence', genre: 'Dance', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Marshmello', query: 'Marshmello Anne-Marie FRIENDS', genre: 'Dance', expectedYear: 2018, recognitionScore: 95 },

  { artist: 'Major Lazer', query: 'Major Lazer DJ Snake Lean On MO', genre: 'Dance', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'Major Lazer', query: 'Major Lazer Justin Bieber Cold Water', genre: 'Dance', expectedYear: 2016, recognitionScore: 95 },

  { artist: 'DJ Snake', query: 'DJ Snake Turn Down for What Lil Jon', genre: 'Dance', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'DJ Snake', query: 'DJ Snake Let Me Love You Justin Bieber', genre: 'Dance', expectedYear: 2016, recognitionScore: 100 },
  { artist: 'DJ Snake', query: 'DJ Snake Selena Gomez Taki Taki Ozuna Cardi B', genre: 'Dance', expectedYear: 2018, recognitionScore: 100 },
  { artist: 'DJ Snake', query: 'DJ Snake Middle Bipolar Sunshine', genre: 'Dance', expectedYear: 2015, recognitionScore: 90 },

  { artist: 'The Chainsmokers', query: 'The Chainsmokers Closer Halsey', genre: 'Dance', expectedYear: 2016, recognitionScore: 100 },
  { artist: 'The Chainsmokers', query: 'The Chainsmokers Don\'t Let Me Down Daya', genre: 'Dance', expectedYear: 2016, recognitionScore: 100 },
  { artist: 'The Chainsmokers', query: 'The Chainsmokers Coldplay Something Just Like This', genre: 'Dance', expectedYear: 2017, recognitionScore: 100 },
  { artist: 'The Chainsmokers', query: 'The Chainsmokers Roses ROZES', genre: 'Dance', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'The Chainsmokers', query: 'The Chainsmokers Paris', genre: 'Dance', expectedYear: 2017, recognitionScore: 90 },

  { artist: 'Clean Bandit', query: 'Clean Bandit Rather Be Jess Glynne', genre: 'Dance', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'Clean Bandit', query: 'Clean Bandit Rockabye Sean Paul Anne-Marie', genre: 'Dance', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Clean Bandit', query: 'Clean Bandit Symphony Zara Larsson', genre: 'Dance', expectedYear: 2017, recognitionScore: 95 },

  { artist: 'Disclosure', query: 'Disclosure Latch Sam Smith', genre: 'Dance', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Disclosure', query: 'Disclosure Omen Sam Smith', genre: 'Dance', expectedYear: 2015, recognitionScore: 85 },

  { artist: 'Alan Walker', query: 'Alan Walker Faded', genre: 'Dance', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'Alan Walker', query: 'Alan Walker Alone', genre: 'Dance', expectedYear: 2016, recognitionScore: 90 },
  { artist: 'Alan Walker', query: 'Alan Walker The Spectre', genre: 'Dance', expectedYear: 2017, recognitionScore: 85 },

  { artist: 'Robin Schulz', query: 'Robin Schulz Sugar Francesco Yates', genre: 'Dance', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'Robin Schulz', query: 'Lilly Wood and The Prick Prayer In C Robin Schulz', genre: 'Dance', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Robin Schulz', query: 'Mr Probz Waves Robin Schulz Remix', genre: 'Dance', expectedYear: 2014, recognitionScore: 95 },

  { artist: 'Galantis', query: 'Galantis Runaway U and I', genre: 'Dance', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Galantis', query: 'Galantis Peanut Butter Jelly', genre: 'Dance', expectedYear: 2015, recognitionScore: 90 },
  { artist: 'Galantis', query: 'Galantis No Money', genre: 'Dance', expectedYear: 2016, recognitionScore: 95 },

  { artist: 'Alesso', query: 'Alesso Heroes We Could Be Tove Lo', genre: 'Dance', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Alesso', query: 'Alesso Under Control Calvin Harris Hurts', genre: 'Dance', expectedYear: 2013, recognitionScore: 90 },

  { artist: 'Tiësto', query: 'Tiesto Red Lights', genre: 'Dance', expectedYear: 2013, recognitionScore: 90 },
  { artist: 'Tiësto', query: 'Tiesto The Business', genre: 'Dance', expectedYear: 2020, recognitionScore: 95 },

  // === ROCK / ALTERNATIVE / INDIE ===
  { artist: 'Arctic Monkeys', query: 'Arctic Monkeys Do I Wanna Know', genre: 'Rock', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Arctic Monkeys', query: 'Arctic Monkeys R U Mine', genre: 'Rock', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'Arctic Monkeys', query: 'Arctic Monkeys Why\'d You Only Call Me When You\'re High', genre: 'Rock', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'Arctic Monkeys', query: 'Arctic Monkeys Arabella', genre: 'Rock', expectedYear: 2013, recognitionScore: 90 },
  { artist: 'Arctic Monkeys', query: 'Arctic Monkeys 505', genre: 'Rock', expectedYear: 2007, recognitionScore: 95 },

  { artist: 'Imagine Dragons', query: 'Imagine Dragons Radioactive', genre: 'Alternative', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'Imagine Dragons', query: 'Imagine Dragons Demons', genre: 'Alternative', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'Imagine Dragons', query: 'Imagine Dragons Believer', genre: 'Alternative', expectedYear: 2017, recognitionScore: 100 },
  { artist: 'Imagine Dragons', query: 'Imagine Dragons Thunder', genre: 'Alternative', expectedYear: 2017, recognitionScore: 100 },
  { artist: 'Imagine Dragons', query: 'Imagine Dragons It\'s Time', genre: 'Alternative', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Imagine Dragons', query: 'Imagine Dragons Natural', genre: 'Alternative', expectedYear: 2018, recognitionScore: 95 },

  { artist: 'Twenty One Pilots', query: 'Twenty One Pilots Stressed Out', genre: 'Alternative', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'Twenty One Pilots', query: 'Twenty One Pilots Heathens', genre: 'Alternative', expectedYear: 2016, recognitionScore: 100 },
  { artist: 'Twenty One Pilots', query: 'Twenty One Pilots Ride', genre: 'Alternative', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'Twenty One Pilots', query: 'Twenty One Pilots Tear in My Heart', genre: 'Alternative', expectedYear: 2015, recognitionScore: 85 },
  { artist: 'Twenty One Pilots', query: 'Twenty One Pilots Jumpsuit', genre: 'Alternative', expectedYear: 2018, recognitionScore: 85 },

  { artist: 'The 1975', query: 'The 1975 Somebody Else', genre: 'Alternative', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'The 1975', query: 'The 1975 Chocolate', genre: 'Alternative', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'The 1975', query: 'The 1975 The Sound', genre: 'Alternative', expectedYear: 2016, recognitionScore: 90 },
  { artist: 'The 1975', query: 'The 1975 It\'s Not Living', genre: 'Alternative', expectedYear: 2018, recognitionScore: 85 },

  { artist: 'Tame Impala', query: 'Tame Impala The Less I Know The Better', genre: 'Alternative', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'Tame Impala', query: 'Tame Impala Let It Happen', genre: 'Alternative', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'Tame Impala', query: 'Tame Impala Feels Like We Only Go Backwards', genre: 'Alternative', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Tame Impala', query: 'Tame Impala Elephant', genre: 'Alternative', expectedYear: 2012, recognitionScore: 90 },
  { artist: 'Tame Impala', query: 'Tame Impala Borderline', genre: 'Alternative', expectedYear: 2019, recognitionScore: 90 },

  { artist: 'The Neighbourhood', query: 'The Neighbourhood Sweater Weather', genre: 'Alternative', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'The Neighbourhood', query: 'The Neighbourhood Daddy Issues', genre: 'Alternative', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'The Neighbourhood', query: 'The Neighbourhood Afraid', genre: 'Alternative', expectedYear: 2013, recognitionScore: 85 },

  { artist: 'Foster the People', query: 'Foster the People Pumped Up Kicks', genre: 'Alternative', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Foster the People', query: 'Foster the People Sit Next to Me', genre: 'Alternative', expectedYear: 2017, recognitionScore: 90 },
  { artist: 'Foster the People', query: 'Foster the People Helena Beat', genre: 'Alternative', expectedYear: 2011, recognitionScore: 85 },

  { artist: 'Cage the Elephant', query: 'Cage the Elephant Cigarette Daydreams', genre: 'Alternative', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'Cage the Elephant', query: 'Cage the Elephant Come a Little Closer', genre: 'Alternative', expectedYear: 2013, recognitionScore: 90 },
  { artist: 'Cage the Elephant', query: 'Cage the Elephant Trouble', genre: 'Alternative', expectedYear: 2015, recognitionScore: 85 },

  { artist: 'The Black Keys', query: 'The Black Keys Lonely Boy', genre: 'Rock', expectedYear: 2011, recognitionScore: 95 },
  { artist: 'The Black Keys', query: 'The Black Keys Gold on the Ceiling', genre: 'Rock', expectedYear: 2011, recognitionScore: 95 },
  { artist: 'The Black Keys', query: 'The Black Keys Tighten Up', genre: 'Rock', expectedYear: 2010, recognitionScore: 90 },

  { artist: 'Paramore', query: 'Paramore Ain\'t It Fun', genre: 'Rock', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'Paramore', query: 'Paramore Still Into You', genre: 'Rock', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'Paramore', query: 'Paramore Hard Times', genre: 'Alternative', expectedYear: 2017, recognitionScore: 90 },

  { artist: 'Fall Out Boy', query: 'Fall Out Boy My Songs Know What You Did in the Dark', genre: 'Rock', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'Fall Out Boy', query: 'Fall Out Boy Centuries', genre: 'Rock', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Fall Out Boy', query: 'Fall Out Boy Uma Thurman', genre: 'Rock', expectedYear: 2015, recognitionScore: 90 },

  { artist: 'Coldplay', query: 'Coldplay Paradise', genre: 'Alternative', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Coldplay', query: 'Coldplay Adventure of a Lifetime', genre: 'Alternative', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'Coldplay', query: 'Coldplay Hymn for the Weekend', genre: 'Alternative', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'Coldplay', query: 'Coldplay A Sky Full of Stars', genre: 'Alternative', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'Coldplay', query: 'Coldplay Magic', genre: 'Alternative', expectedYear: 2014, recognitionScore: 90 },

  { artist: 'Muse', query: 'Muse Madness', genre: 'Rock', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Muse', query: 'Muse Uprising', genre: 'Rock', expectedYear: 2009, recognitionScore: 95 },
  { artist: 'Muse', query: 'Muse Psycho', genre: 'Rock', expectedYear: 2015, recognitionScore: 85 },

  { artist: 'Foo Fighters', query: 'Foo Fighters Walk', genre: 'Rock', expectedYear: 2011, recognitionScore: 90 },
  { artist: 'Foo Fighters', query: 'Foo Fighters Rope', genre: 'Rock', expectedYear: 2011, recognitionScore: 85 },
  { artist: 'Foo Fighters', query: 'Foo Fighters The Sky Is a Neighborhood', genre: 'Rock', expectedYear: 2017, recognitionScore: 85 },

  { artist: 'Linkin Park', query: 'Linkin Park Waiting for the End', genre: 'Rock', expectedYear: 2010, recognitionScore: 95 },
  { artist: 'Linkin Park', query: 'Linkin Park Burn It Down', genre: 'Rock', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Linkin Park', query: 'Linkin Park Castle of Glass', genre: 'Rock', expectedYear: 2012, recognitionScore: 90 },
  { artist: 'Linkin Park', query: 'Linkin Park Heavy Kiiara', genre: 'Rock', expectedYear: 2017, recognitionScore: 90 },

  { artist: 'Red Hot Chili Peppers', query: 'Red Hot Chili Peppers Dark Necessities', genre: 'Rock', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Red Hot Chili Peppers', query: 'Red Hot Chili Peppers The Adventures of Rain Dance Maggie', genre: 'Rock', expectedYear: 2011, recognitionScore: 90 },

  { artist: 'Kings of Leon', query: 'Kings of Leon Waste a Moment', genre: 'Rock', expectedYear: 2016, recognitionScore: 90 },
  { artist: 'Kings of Leon', query: 'Kings of Leon Radioactive', genre: 'Rock', expectedYear: 2010, recognitionScore: 85 },

  { artist: 'Florence + The Machine', query: 'Florence + The Machine Shake It Out', genre: 'Alternative', expectedYear: 2011, recognitionScore: 95 },
  { artist: 'Florence + The Machine', query: 'Florence + The Machine What Kind of Man', genre: 'Alternative', expectedYear: 2015, recognitionScore: 85 },

  { artist: 'Bastille', query: 'Bastille Pompeii', genre: 'Alternative', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Bastille', query: 'Bastille Good Grief', genre: 'Alternative', expectedYear: 2016, recognitionScore: 85 },

  { artist: 'Panic! at the Disco', query: 'Panic! at the Disco High Hopes', genre: 'Pop', expectedYear: 2018, recognitionScore: 100 },
  { artist: 'Panic! at the Disco', query: 'Panic! at the Disco I Write Sins Not Tragedies', genre: 'Rock', expectedYear: 2005, recognitionScore: 100 },
  { artist: 'Panic! at the Disco', query: 'Panic! at the Disco Death of a Bachelor', genre: 'Rock', expectedYear: 2015, recognitionScore: 90 },

  { artist: 'Walk the Moon', query: 'Walk the Moon Shut Up and Dance', genre: 'Alternative', expectedYear: 2014, recognitionScore: 100 },
  { artist: 'Portugal. The Man', query: 'Portugal. The Man Feel It Still', genre: 'Alternative', expectedYear: 2017, recognitionScore: 100 },
  { artist: 'Hozier', query: 'Hozier Take Me to Church', genre: 'Alternative', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Mumford & Sons', query: 'Mumford & Sons I Will Wait', genre: 'Alternative', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'The Lumineers', query: 'The Lumineers Ho Hey', genre: 'Alternative', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'The Lumineers', query: 'The Lumineers Ophelia', genre: 'Alternative', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Of Monsters and Men', query: 'Of Monsters and Men Little Talks', genre: 'Alternative', expectedYear: 2011, recognitionScore: 100 },
  { artist: 'Vance Joy', query: 'Vance Joy Riptide', genre: 'Alternative', expectedYear: 2013, recognitionScore: 100 },

  // === R&B ===
  { artist: 'Frank Ocean', query: 'Frank Ocean Thinkin Bout You', genre: 'R&B/Soul', expectedYear: 2012, recognitionScore: 100 },
  { artist: 'Frank Ocean', query: 'Frank Ocean Lost', genre: 'R&B/Soul', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Frank Ocean', query: 'Frank Ocean Pink + White', genre: 'R&B/Soul', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Frank Ocean', query: 'Frank Ocean Nights', genre: 'R&B/Soul', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Frank Ocean', query: 'Frank Ocean Chanel', genre: 'R&B/Soul', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Frank Ocean', query: 'Frank Ocean Pyramids', genre: 'R&B/Soul', expectedYear: 2012, recognitionScore: 90 },
  { artist: 'Frank Ocean', query: 'Frank Ocean Novacane', genre: 'R&B/Soul', expectedYear: 2011, recognitionScore: 90 },

  { artist: 'SZA', query: 'SZA The Weekend', genre: 'R&B/Soul', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'SZA', query: 'SZA Travis Scott Love Galore', genre: 'R&B/Soul', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'SZA', query: 'SZA Kendrick Lamar All the Stars', genre: 'R&B/Soul', expectedYear: 2018, recognitionScore: 100 },
  { artist: 'SZA', query: 'SZA Broken Clocks', genre: 'R&B/Soul', expectedYear: 2017, recognitionScore: 90 },
  { artist: 'SZA', query: 'SZA Drew Barrymore', genre: 'R&B/Soul', expectedYear: 2017, recognitionScore: 85 },

  { artist: 'Beyoncé', query: 'Beyonce Drunk in Love Jay Z', genre: 'R&B/Soul', expectedYear: 2013, recognitionScore: 100 },
  { artist: 'Beyoncé', query: 'Beyonce Formation', genre: 'R&B/Soul', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Beyoncé', query: 'Beyonce Partition', genre: 'R&B/Soul', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'Beyoncé', query: 'Beyonce Hold Up', genre: 'R&B/Soul', expectedYear: 2016, recognitionScore: 90 },
  { artist: 'Beyoncé', query: 'Beyonce Love On Top', genre: 'R&B/Soul', expectedYear: 2011, recognitionScore: 95 },
  { artist: 'Beyoncé', query: 'Beyonce Run the World Girls', genre: 'Pop', expectedYear: 2011, recognitionScore: 95 },

  { artist: 'Chris Brown', query: 'Chris Brown Loyal Lil Wayne Tyga', genre: 'R&B/Soul', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'Chris Brown', query: 'Chris Brown Look at Me Now Busta Rhymes Lil Wayne', genre: 'R&B/Soul', expectedYear: 2011, recognitionScore: 95 },
  { artist: 'Chris Brown', query: 'Chris Brown No Guidance Drake', genre: 'R&B/Soul', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'Chris Brown', query: 'Chris Brown Under the Influence', genre: 'R&B/Soul', expectedYear: 2019, recognitionScore: 95 },

  { artist: 'Miguel', query: 'Miguel Adorn', genre: 'R&B/Soul', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Miguel', query: 'Miguel Sky Walker Travis Scott', genre: 'R&B/Soul', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Miguel', query: 'Miguel Sure Thing', genre: 'R&B/Soul', expectedYear: 2010, recognitionScore: 95 },

  { artist: 'Bryson Tiller', query: 'Bryson Tiller Don\'t', genre: 'R&B/Soul', expectedYear: 2015, recognitionScore: 100 },
  { artist: 'Bryson Tiller', query: 'Bryson Tiller Exchange', genre: 'R&B/Soul', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'Bryson Tiller', query: 'Bryson Tiller Sorry Not Sorry', genre: 'R&B/Soul', expectedYear: 2015, recognitionScore: 85 },

  { artist: 'PARTYNEXTDOOR', query: 'PARTYNEXTDOOR Come and See Me Drake', genre: 'R&B/Soul', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'PARTYNEXTDOOR', query: 'PARTYNEXTDOOR Break from Toronto', genre: 'R&B/Soul', expectedYear: 2013, recognitionScore: 95 },
  { artist: 'PARTYNEXTDOOR', query: 'PARTYNEXTDOOR Not Nice', genre: 'R&B/Soul', expectedYear: 2016, recognitionScore: 90 },

  { artist: 'Jhené Aiko', query: 'Jhene Aiko Sativa Swae Lee', genre: 'R&B/Soul', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Jhené Aiko', query: 'Jhene Aiko The Worst', genre: 'R&B/Soul', expectedYear: 2013, recognitionScore: 90 },
  { artist: 'Jhené Aiko', query: 'Jhene Aiko While We\'re Young', genre: 'R&B/Soul', expectedYear: 2017, recognitionScore: 85 },

  { artist: 'Khalid', query: 'Khalid Location', genre: 'R&B/Soul', expectedYear: 2016, recognitionScore: 100 },
  { artist: 'Khalid', query: 'Khalid Young Dumb & Broke', genre: 'R&B/Soul', expectedYear: 2017, recognitionScore: 100 },
  { artist: 'Khalid', query: 'Khalid Talk Disclosure', genre: 'R&B/Soul', expectedYear: 2019, recognitionScore: 95 },
  { artist: 'Khalid', query: 'Khalid Better', genre: 'R&B/Soul', expectedYear: 2018, recognitionScore: 95 },

  { artist: 'H.E.R.', query: 'H.E.R. Daniel Caesar Best Part', genre: 'R&B/Soul', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'H.E.R.', query: 'H.E.R. Focus', genre: 'R&B/Soul', expectedYear: 2016, recognitionScore: 90 },
  { artist: 'H.E.R.', query: 'H.E.R. Could\'ve Been Bryson Tiller', genre: 'R&B/Soul', expectedYear: 2018, recognitionScore: 85 },

  { artist: 'Daniel Caesar', query: 'Daniel Caesar Get You Kali Uchis', genre: 'R&B/Soul', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Daniel Caesar', query: 'Daniel Caesar Japanese Denim', genre: 'R&B/Soul', expectedYear: 2016, recognitionScore: 90 },

  { artist: 'Ella Mai', query: 'Ella Mai Boo\'d Up', genre: 'R&B/Soul', expectedYear: 2018, recognitionScore: 95 },
  { artist: 'Ella Mai', query: 'Ella Mai Trip', genre: 'R&B/Soul', expectedYear: 2018, recognitionScore: 90 },

  // === LATIN / REGGAETON ===
  { artist: 'Luis Fonsi', query: 'Luis Fonsi Daddy Yankee Despacito', genre: 'Latin', expectedYear: 2017, recognitionScore: 100 },
  { artist: 'Luis Fonsi', query: 'Luis Fonsi Demi Lovato Echame La Culpa', genre: 'Latin', expectedYear: 2017, recognitionScore: 90 },

  { artist: 'Daddy Yankee', query: 'Daddy Yankee Limbo', genre: 'Latin', expectedYear: 2012, recognitionScore: 95 },
  { artist: 'Daddy Yankee', query: 'Daddy Yankee Dura', genre: 'Latin', expectedYear: 2018, recognitionScore: 95 },
  { artist: 'Daddy Yankee', query: 'Daddy Yankee Con Calma Snow', genre: 'Latin', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'Daddy Yankee', query: 'Daddy Yankee Shaky Shaky', genre: 'Latin', expectedYear: 2016, recognitionScore: 90 },

  { artist: 'J Balvin', query: 'J Balvin Willy William Mi Gente', genre: 'Latin', expectedYear: 2017, recognitionScore: 100 },
  { artist: 'J Balvin', query: 'J Balvin Bad Bunny Oasis LA CANCION', genre: 'Latin', expectedYear: 2019, recognitionScore: 95 },
  { artist: 'J Balvin', query: 'J Balvin Ay Vamos', genre: 'Latin', expectedYear: 2014, recognitionScore: 95 },
  { artist: 'J Balvin', query: 'J Balvin Ginza', genre: 'Latin', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'J Balvin', query: 'J Balvin Rosalia Con Altura', genre: 'Latin', expectedYear: 2019, recognitionScore: 95 },
  { artist: 'J Balvin', query: 'J Balvin Bad Bunny QUE PRETENDES', genre: 'Latin', expectedYear: 2019, recognitionScore: 90 },

  { artist: 'Bad Bunny', query: 'Bad Bunny MIA Drake', genre: 'Latin', expectedYear: 2018, recognitionScore: 100 },
  { artist: 'Bad Bunny', query: 'Bad Bunny Callaita Tainy', genre: 'Latin', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'Bad Bunny', query: 'Cardi B Bad Bunny J Balvin I Like It', genre: 'Latin', expectedYear: 2018, recognitionScore: 100 },
  { artist: 'Bad Bunny', query: 'Bad Bunny Soy Peor', genre: 'Latin', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Bad Bunny', query: 'Bad Bunny Amorfoda', genre: 'Latin', expectedYear: 2018, recognitionScore: 95 },
  { artist: 'Bad Bunny', query: 'Bad Bunny Solo de Mi', genre: 'Latin', expectedYear: 2018, recognitionScore: 90 },
  { artist: 'Bad Bunny', query: 'Bad Bunny Chambea', genre: 'Latin', expectedYear: 2017, recognitionScore: 90 },

  { artist: 'Ozuna', query: 'Ozuna Se Preparo', genre: 'Latin', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Ozuna', query: 'Ozuna Dile Que Tu Me Quieres', genre: 'Latin', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Ozuna', query: 'Ozuna Tu Foto', genre: 'Latin', expectedYear: 2017, recognitionScore: 90 },
  { artist: 'Ozuna', query: 'Ozuna Criminal Natti Natasha', genre: 'Latin', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Ozuna', query: 'Ozuna Baila Baila Baila', genre: 'Latin', expectedYear: 2019, recognitionScore: 90 },

  { artist: 'Maluma', query: 'Maluma Felices los 4', genre: 'Latin', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Maluma', query: 'Maluma Hawái', genre: 'Latin', expectedYear: 2020, recognitionScore: 95 },
  { artist: 'Maluma', query: 'Maluma Corazon Nego do Borel', genre: 'Latin', expectedYear: 2017, recognitionScore: 90 },
  { artist: 'Maluma', query: 'Maluma Shakira Chantaje', genre: 'Latin', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Maluma', query: 'Maluma Borro Cassette', genre: 'Latin', expectedYear: 2015, recognitionScore: 90 },

  { artist: 'Nicky Jam', query: 'Nicky Jam El Perdon Enrique Iglesias', genre: 'Latin', expectedYear: 2015, recognitionScore: 95 },
  { artist: 'Nicky Jam', query: 'Nicky Jam J Balvin X', genre: 'Latin', expectedYear: 2018, recognitionScore: 95 },
  { artist: 'Nicky Jam', query: 'Nicky Jam Hasta el Amanecer', genre: 'Latin', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Nicky Jam', query: 'Nicky Jam Travesuras', genre: 'Latin', expectedYear: 2014, recognitionScore: 90 },

  { artist: 'Don Omar', query: 'Don Omar Danza Kuduro Lucenzo', genre: 'Latin', expectedYear: 2010, recognitionScore: 100 },
  { artist: 'Don Omar', query: 'Don Omar Taboo', genre: 'Latin', expectedYear: 2011, recognitionScore: 95 },

  { artist: 'Anuel AA', query: 'Anuel AA Daddy Yankee Karol G Ozuna J Balvin China', genre: 'Latin', expectedYear: 2019, recognitionScore: 95 },
  { artist: 'Anuel AA', query: 'Anuel AA Karol G Culpables', genre: 'Latin', expectedYear: 2018, recognitionScore: 90 },
  { artist: 'Anuel AA', query: 'Anuel AA Karol G Secreto', genre: 'Latin', expectedYear: 2019, recognitionScore: 95 },
  { artist: 'Anuel AA', query: 'Anuel AA Ella Quiere Beber Romeo Santos', genre: 'Latin', expectedYear: 2018, recognitionScore: 90 },

  { artist: 'Karol G', query: 'Karol G Nicki Minaj Tusa', genre: 'Latin', expectedYear: 2019, recognitionScore: 100 },
  { artist: 'Karol G', query: 'Karol G Bad Bunny Ahora Me Llama', genre: 'Latin', expectedYear: 2017, recognitionScore: 90 },
  { artist: 'Karol G', query: 'Karol G Mi Cama', genre: 'Latin', expectedYear: 2018, recognitionScore: 90 },

  { artist: 'Becky G', query: 'Becky G Bad Bunny Mayores', genre: 'Latin', expectedYear: 2017, recognitionScore: 95 },
  { artist: 'Becky G', query: 'Becky G Natti Natasha Sin Pijama', genre: 'Latin', expectedYear: 2018, recognitionScore: 95 },
  { artist: 'Becky G', query: 'Becky G Shower', genre: 'Pop', expectedYear: 2014, recognitionScore: 90 },

  { artist: 'Farruko', query: 'Farruko Pepas', genre: 'Latin', expectedYear: 2021, recognitionScore: 100 },
  { artist: 'Farruko', query: 'Farruko Chillax Ky-Mani Marley', genre: 'Latin', expectedYear: 2016, recognitionScore: 90 },
  { artist: 'Farruko', query: 'Farruko Krippy Kush Bad Bunny Rvssian', genre: 'Latin', expectedYear: 2017, recognitionScore: 90 },

  { artist: 'CNCO', query: 'CNCO Reggaeton Lento', genre: 'Latin', expectedYear: 2016, recognitionScore: 95 },
  { artist: 'Rosalía', query: 'Rosalia Malamente', genre: 'Latin', expectedYear: 2018, recognitionScore: 95 },
  { artist: 'Rosalía', query: 'Rosalia Ozuna Yo x Ti Tu x Mi', genre: 'Latin', expectedYear: 2019, recognitionScore: 90 },
  { artist: 'Rosalía', query: 'Rosalia Di Mi Nombre', genre: 'Latin', expectedYear: 2018, recognitionScore: 85 },
];
