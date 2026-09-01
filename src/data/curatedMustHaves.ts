export interface CuratedArtistConfig {
  aliases?: string[];
  mustHaveAlbums?: string[];
  mustHaveTracks?: string[];
}

export const CURATED_MUST_HAVE: Record<string, CuratedArtistConfig> = {
  "Post Malone": {
    mustHaveAlbums: [
      "Stoney",
      "beerbongs & bentleys"
    ]
  },
  "Lil Skies": {
    mustHaveAlbums: [
      "Life of a Dark Rose"
    ]
  },
  "Lil Mosey": {
    mustHaveTracks: [
      "Noticed",
      "Blueberry Faygo"
    ]
  },
  "Lil Tecca": {
    mustHaveTracks: [
      "Ransom",
      "500lbs",
      "Do It Again"
    ]
  },
  "Lil Peep": {
    mustHaveTracks: [
      "Girls",
      "Your Favorite Dress",
      "white tee"
    ]
  },
  "Yung Pinch": {
    mustHaveTracks: [
      "20 Years Later",
      "Look Like",
      "When I Was Young",
      "Underdogs",
      "I Know U"
    ]
  },
  "Juice WRLD": {
    mustHaveTracks: [
      "Armed and Dangerous"
    ]
  },
  "Famous Dex": {
    mustHaveTracks: [
      "Japan",
      "Pick It Up"
    ]
  },
  "Fetty Wap": {
    mustHaveTracks: [
      "Trap Queen",
      "679"
    ]
  },
  "YoungBoy Never Broke Again": {
    aliases: [
      "NBA YoungBoy"
    ],
    mustHaveTracks: [
      "Outside Today"
    ]
  }
};
