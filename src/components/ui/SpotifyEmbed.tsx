type Props = {
  embedUrl: string;
  className?: string;
  height?: number;
  title?: string;
};

/**
 * Official Spotify Embed iframe — do not recreate a fake player.
 */
export function SpotifyEmbed({
  embedUrl,
  className,
  height = 352,
  title = "Reproductor de Spotify de Frantana",
}: Props) {
  return (
    <div className={className}>
      <iframe
        title={title}
        src={embedUrl}
        width="100%"
        height={height}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="spotify-embed__frame"
        style={{ borderRadius: 0 }}
      />
    </div>
  );
}
