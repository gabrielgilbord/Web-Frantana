from pathlib import Path

path = Path(r"c:\Users\Gabriel\Desktop\Frantana\src\app\globals.css")
text = path.read_text(encoding="utf-8")
start = text.index("\n.tienda {")
end = text.index("\n.store-product {")

new_block = r'''
.tienda {
  --shop-max: min(100% - (var(--space-gutter) * 2), 92rem);
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
  padding: clamp(1.75rem, 4.5vh, 2.75rem) 0 clamp(1.5rem, 3.5vh, 2.25rem);
  display: grid;
  gap: 1.25rem 3rem;
  align-items: end;
}

@media (min-width: 900px) {
  .tienda__intro {
    grid-template-columns: minmax(0, 1.4fr) auto;
  }
}

.tienda__index {
  margin: 0 0 0.55rem;
  font-family: var(--font-body);
  font-size: 0.68rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--fr-ember);
}

.tienda__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(2.75rem, 7vw, 5.25rem);
  line-height: 0.92;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.tienda__lede {
  margin: 0.85rem 0 0;
  max-width: 28rem;
  font-size: clamp(0.95rem, 1.3vw, 1.08rem);
  line-height: 1.55;
  color: color-mix(in srgb, var(--fr-ink) 68%, var(--fr-fog));
}

.tienda__intro-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.55rem;
}

@media (min-width: 900px) {
  .tienda__intro-meta {
    align-items: flex-end;
    text-align: right;
    padding-bottom: 0.35rem;
  }
}

.tienda__bag-link {
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--fr-ink);
  text-decoration: none;
  border-bottom: 1px solid color-mix(in srgb, var(--fr-ember) 50%, transparent);
  padding-bottom: 0.2rem;
}

.tienda__bag-link:hover {
  color: var(--fr-ember);
}

.tienda__note {
  margin: 0;
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--fr-fog) 85%, transparent);
  max-width: 16rem;
  line-height: 1.45;
}

.tienda__stage {
  width: var(--shop-max);
  margin-inline: auto;
  padding: clamp(0.5rem, 2vh, 1rem) 0 clamp(2.5rem, 6vh, 4rem);
}

.tienda__stage-grid {
  display: grid;
  gap: clamp(1.25rem, 3vw, 2.25rem);
  align-items: end;
}

@media (min-width: 960px) {
  .tienda__stage-grid {
    grid-template-columns: minmax(0, 1.7fr) minmax(0, 0.95fr);
    gap: clamp(1.75rem, 4vw, 3.25rem);
    align-items: end;
  }

  .tienda__stage-grid--solo {
    grid-template-columns: minmax(0, 0.78fr);
  }

  .tienda__stage-grid .store-piece--secondary {
    padding-bottom: clamp(2rem, 8vh, 6rem);
  }
}

.tienda__catalog {
  width: var(--shop-max);
  margin-inline: auto;
  padding: clamp(2rem, 5vh, of 3.5rem) 0 clamp(4rem, 10vh, 7rem);
  border-top: 1px solid color-mix(in srgb, var(--fr-ink) 10%, transparent);
}

.tienda__catalog-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.65rem 1.5rem;
  margin-bottom: clamp(1.75rem, 4vh, 2.75rem);
}

.tienda__catalog-kicker {
  margin: 0;
  font-size: 0.65rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--fr-ember);
}

.tienda__section-title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.85rem, 3.5vw, 2.85rem);
  letter-spacing: -0.025em;
  line-height: 1;
}

.tienda__catalog-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1.75rem, 3.5vw, 2.5rem) clamp(1.25rem, 2.5vw, 2rem);
}

@media (min-width: 700px) {
  .tienda__catalog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .tienda__catalog-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .tienda__catalog-grid--sparse {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 58rem;
  }
}

.tienda__empty,
.tienda__catalog-empty {
  color: var(--fr-fog);
  font-size: 0.92rem;
}

.store-piece__link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.store-piece__media {
  position: relative;
  overflow: hidden;
  background: var(--fr-sand);
}

.store-piece--hero .store-piece__media {
  aspect-ratio: 4 / 5;
  min-height: clamp(28rem, 62vh, 46rem);
}

.store-piece--secondary .store-piece__media {
  aspect-ratio: 3 / 4;
  min-height: clamp(18rem, 42vh, 30rem);
}

.store-piece--catalog .store-piece__media {
  aspect-ratio: 4 / 5;
}

@media (max-width: 959px) {
  .store-piece--hero .store-piece__media,
  .store-piece--secondary .store-piece__media {
    min-height: 0;
  }

  .store-piece--secondary {
    max-width: 28rem;
  }
}

.store-piece__img {
  object-fit: cover;
  object-position: center 18%;
  transition:
    opacity 0.55s var(--ease-soft),
    transform 0.85s var(--ease-soft);
}

.store-piece--hero .store-piece__img {
  object-position: center 18%;
}

.store-piece--catalog .store-piece__img {
  object-position: center 15%;
}

.store-piece__link:hover .store-piece__img:not(.store-piece__img--alt) {
  transform: scale(1.035);
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
  left: 0.85rem;
  top: 0.85rem;
  z-index: 2;
  font-size: 0.58rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--fr-mist);
  border: 1px solid color-mix(in srgb, var(--fr-mist) 25%, transparent);
  padding: 0.35rem 0.55rem;
  background: color-mix(in srgb, var(--fr-night) 55%, transparent);
}

.store-piece__meta {
  padding: 1.15rem 0 0;
  display: grid;
  gap: 0.35rem;
}

.store-piece--hero .store-piece__meta {
  padding-top: 1.35rem;
  max-width: 28rem;
}

.store-piece__cat {
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--fr-fog);
}

.store-piece__name {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.45rem, 2.6vw, 2.15rem);
  letter-spacing: -0.02em;
  line-height: 1.05;
  transition: transform 0.45s var(--ease-soft);
}

.store-piece--hero .store-piece__name {
  font-size: clamp(1.85rem, 3.4vw, 2.85rem);
}

.store-piece__link:hover .store-piece__name {
  transform: translateX(3px);
}

.store-piece__price {
  margin: 0.15rem 0 0;
  font-size: 0.92rem;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--fr-ink) 78%, var(--fr-ember));
}

.store-piece--hero .store-piece__price {
  font-size: 1.05rem;
}

.store-piece__cue {
  display: inline-block;
  margin-top: 0.45rem;
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: transparent;
  transition: color 0.4s var(--ease-soft);
}

.store-piece__link:hover .store-piece__cue,
.store-piece__link:focus-visible .store-piece__cue {
  color: var(--fr-ember-soft);
}
'''

# Fix typo I accidentally introduced
new_block = new_block.replace("clamp(2rem, 5vh, of 3.5rem)", "clamp(2rem, 5vh, 3.5rem)")

path.write_text(text[: start + 1] + new_block.strip() + "\n" + text[end + 1 :], encoding="utf-8", newline="\n")
print("done", path.stat().st_size)
# verify
t2 = path.read_text(encoding="utf-8")
assert "--shop-max" in t2
assert "store-piece--hero" in t2
assert ".store-product {" in t2
assert "store-rhythm--featured" not in t2
print("verified OK")
