import type { SiteContent } from "@/types";

/**
 * Central social / platform links — always read from site content.
 * Do not hardcode alternate URLs in UI components.
 */
export function getSocialLinks(content: SiteContent) {
  return {
    instagram: content.social.instagram,
    facebook: content.social.facebook,
    spotify: content.social.spotify ?? content.spotifyArtistUrl,
    youtube: content.social.youtube,
    tiktok: content.social.tiktok,
    appleMusic: content.social.appleMusic,
    spotifyEmbed: content.spotifyEmbedUrl,
  } as const;
}

export const SPOTIFY_ARTIST_ID = "6RcC4X6S7nvTvj0d31VVCw";
