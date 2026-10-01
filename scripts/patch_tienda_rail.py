from pathlib import Path

path = Path(r"c:\Users\Gabriel\Desktop\Frantana\src\app\globals.css")
raw = path.read_bytes()
if raw.startswith(b"\xef\xbb\xbf"):
    raw = raw[3:]
text = raw.decode("utf-8")

start = text.index("\n.tienda {")
end = text.index("\n.store-product {")

new_block = r'''
.tienda {
  --shop-max: min(100% - (var(--space-gutter) * 2), 108rem);
  background: var(--fr-paper);
  color: var(--fr-ink);
  min-height: 100svh;
}

.shop-experience {
  width: 100%;
}

.tienda__intro {
  width: var(--shop-max);
  margin-inline: auto;
  padding: clamp(1.25rem, 3vh, 1.85rem) 0 clamp(1rem, 2.5vh, 1.5rem);
  display: grid;
  gap: 1rem 2.5rem;
  align-items: end;
}

@media (min-width: 900px) {
  .tienda__intro {
    grid-template-columns: minmax(0, 1.4fr) auto;
  }
}

.tienda__index {
  margin: 0 0 0.45rem;
  font-family: var(--font-body);
  font-size: 0.65rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--fr-ember);
}

.tienda__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(2.25rem, 5vw, 3.75rem);
  line-height: 0.92;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.tienda__lede {
  margin: 0.65rem 0 0;
  max-width: 28rem;
  font-size: clamp(0.92rem, 1.2vw, 1.02rem);
  line-height: 1.5;
  color: color-mix(in srgb, var(--fr-ink) 68%, var(--fr-fog));
}

.tienda__intro-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.45rem;
}

@media (min-width: 900px) {
  .tienda__intro-meta {
    align-items: flex-end;
    text-align: right;
    padding-bottom: 0.2rem;
  }
}

.tienda__bag-link {
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--fr-ink);
  text-decoration: none;
  border-bottom: 1px solid color-mix(in srgb, var(--fr-ember) 50%, transparent);
  padding-bottom: 0.15rem;
}

.tienda__bag-link:hover {
  color: var(--fr-ember);
}

.tienda__note {
  margin: 0;
  font-size: 0.55rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--fr-fog) 85%, transparent);
  max-width: 16rem;
  line-height: 1.45;
}

.tienda__catalog {
  width: var(--shop-max);
  margin-inline: auto;
  padding: 0 0 clamp(3.5rem, 9vh, 6rem);
}

.tienda__catalog--rail {
  padding-top: 0.35rem;
}

.tienda__catalog-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.65rem 1.5rem;
  margin-bottom: clamp(1.25rem, 3vh, 2rem);
}

.tienda__catalog-kicker {
  margin: 0;
  font-size: 0.62rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--fr-ember);
}

.tienda__section-title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.65rem, 3vw, 2.4rem);
  letter-spacing: -0.025em;
  line-height: 1;
}

.tienda__catalog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1.25rem, 2.5vw, 1.75rem) clamp(0.75rem, 1.5vw, 1.15rem);
}

@media (min-width: 900px) {
  .tienda__catalog-grid--rail {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .tienda__catalog-grid--rail.tienda__catalog-grid--n4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .tienda__catalog-grid--rail.tienda__catalog-grid--n2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 42rem;
  }

  .tienda__catalog-grid--rail.tienda__catalog-grid--n3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.tienda__empty,
.tienda__catalog-empty {
  color: var(--fr-fog);
  font-size: 0.92rem;
}

.store-piece__media-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.store-piece__media {
  position: relative;
  overflow: hidden;
  background: var(--fr-sand);
  aspect-ratio: 3 / 4;
}

.store-piece--catalog .store-piece__media,
.store-piece--hero .store-piece__media,
.store-piece--secondary .store-piece__media {
  aspect-ratio: 3 / 4;
  min-height: 0;
}

.store-piece__img {
  object-fit: cover;
  object-position: center 18%;
  transition:
    opacity 0.45s var(--ease-soft),
    transform 0.7s var(--ease-soft);
}

.store-piece__media-link:hover .store-piece__img:not(.store-piece__img--alt) {
  transform: scale(1.03);
}

.store-piece__img--alt {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: scale(1.02);
}

.store-piece__img--hide {
  opacity: 0;
}

.store-piece__img--show {
  opacity: 1;
  transform: scale(1);
}

.store-piece__badge {
  position: absolute;
  left: 0.55rem;
  top: 0.55rem;
  z-index: 2;
  font-size: 0.55rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--fr-mist);
  border: 1px solid color-mix(in srgb, var(--fr-mist) 25%, transparent);
  padding: 0.28rem 0.45rem;
  background: color-mix(in srgb, var(--fr-night) 55%, transparent);
}

.store-piece__meta {
  padding: 0.75rem 0 0;
  display: grid;
  gap: 0.28rem;
}

.store-piece__cat {
  font-size: 0.58rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--fr-fog);
}

.store-piece__name-link {
  text-decoration: none;
  color: inherit;
}

.store-piece__name {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.05rem, 1.6vw, 1.35rem);
  letter-spacing: -0.015em;
  line-height: 1.1;
}

.store-piece__price {
  margin: 0.1rem 0 0;
  font-size: 0.82rem;
  letter-spacing: 0.03em;
  color: color-mix(in srgb, var(--fr-ink) 78%, var(--fr-ember));
}

.store-piece__sizes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.45rem;
}

.store-piece__size {
  min-width: 2rem;
  height: 1.85rem;
  padding: 0 0.45rem;
  border: 1px solid color-mix(in srgb, var(--fr-ink) 16%, transparent);
  background: transparent;
  color: var(--fr-ink);
  font-family: var(--font-body);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    border-color 0.25s var(--ease-soft),
    background 0.25s var(--ease-soft),
    color 0.25s var(--ease-soft);
}

.store-piece__size:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--fr-ink) 45%, transparent);
}

.store-piece__size.is-selected {
  border-color: var(--fr-ink);
  background: var(--fr-ink);
  color: var(--fr-mist);
}

.store-piece__size.is-out,
.store-piece__size:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  text-decoration: line-through;
}

.store-piece__add {
  margin-top: 0.55rem;
  justify-self: start;
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--fr-ember) 55%, transparent);
  background: none;
  padding: 0.15rem 0;
  font-family: var(--font-body);
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--fr-ink);
  cursor: pointer;
  transition: color 0.3s var(--ease-soft);
}

.store-piece__add:hover:not(:disabled) {
  color: var(--fr-ember);
}

.store-piece__add:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
'''

path.write_bytes((text[: start + 1] + new_block.strip() + "\n" + text[end + 1 :]).encode("utf-8"))
print("css patched", path.stat().st_size, "BOM", list(path.read_bytes()[:3]))
