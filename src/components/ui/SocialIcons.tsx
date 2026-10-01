import type { ReactNode } from "react";
import { FaInstagram, FaFacebookF, FaSpotify } from "react-icons/fa6";
import clsx from "clsx";
import type { SiteContent } from "@/types";
import { getSocialLinks } from "@/lib/social";

type Props = {
  content: SiteContent;
  className?: string;
  includeSpotify?: boolean;
};

const iconClass = "site-social__glyph";

export function SocialIcons({
  content,
  className,
  includeSpotify = true,
}: Props) {
  const links = getSocialLinks(content);
  const items: { href: string; label: string; icon: ReactNode }[] = [];

  if (links.instagram) {
    items.push({
      href: links.instagram,
      label: "Instagram",
      icon: <FaInstagram className={iconClass} aria-hidden />,
    });
  }
  if (links.facebook) {
    items.push({
      href: links.facebook,
      label: "Facebook",
      icon: <FaFacebookF className={iconClass} aria-hidden />,
    });
  }
  if (includeSpotify && links.spotify) {
    items.push({
      href: links.spotify,
      label: "Spotify",
      icon: <FaSpotify className={iconClass} aria-hidden />,
    });
  }

  if (!items.length) return null;

  return (
    <ul className={clsx("site-social", className)}>
      {items.map((item) => (
        <li key={item.label}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="site-social__link"
            aria-label={item.label}
          >
            {item.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}
