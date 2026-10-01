/**
 * Verified public Frantana catalog from open.spotify.com/artist/6RcC4X6S7nvTvj0d31VVCw
 * Do not invent IDs. Update only from real Spotify URLs.
 */
export const FRANTANA_SPOTIFY_ARTIST_ID = "6RcC4X6S7nvTvj0d31VVCw";

export const FRANTANA_SPOTIFY_ARTIST_URI =
  `spotify:artist:${FRANTANA_SPOTIFY_ARTIST_ID}` as const;

export const FRANTANA_SPOTIFY_ARTIST_URL =
  `https://open.spotify.com/artist/${FRANTANA_SPOTIFY_ARTIST_ID}` as const;

export const FRANTANA_SPOTIFY_ARTIST_EMBED =
  `https://open.spotify.com/embed/artist/${FRANTANA_SPOTIFY_ARTIST_ID}?utm_source=generator&theme=0` as const;

export type FrantanaTrack = {
  id: string;
  title: string;
  uri: `spotify:track:${string}`;
  url: string;
};

export const FRANTANA_TRACKS: FrantanaTrack[] = [
  {
    id: "70aKJgUltkoLn91TURbt6C",
    title: "Como te quiero yo",
    uri: "spotify:track:70aKJgUltkoLn91TURbt6C",
    url: "https://open.spotify.com/track/70aKJgUltkoLn91TURbt6C",
  },
  {
    id: "2ii0Jwhn3NseTH2R0KKmS5",
    title: "Estamos bien",
    uri: "spotify:track:2ii0Jwhn3NseTH2R0KKmS5",
    url: "https://open.spotify.com/track/2ii0Jwhn3NseTH2R0KKmS5",
  },
  {
    id: "5A5tLHTcedoFqQSbzwuTWL",
    title: "El amor no se mendiga",
    uri: "spotify:track:5A5tLHTcedoFqQSbzwuTWL",
    url: "https://open.spotify.com/track/5A5tLHTcedoFqQSbzwuTWL",
  },
  {
    id: "4EasrGW6LYq3hD347mouzR",
    title: "Gracias a la vida",
    uri: "spotify:track:4EasrGW6LYq3hD347mouzR",
    url: "https://open.spotify.com/track/4EasrGW6LYq3hD347mouzR",
  },
];
