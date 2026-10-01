from pathlib import Path

p = Path(r"c:\Users\Gabriel\Desktop\Frantana\src\components\shop\CartView.tsx")
t = p.read_text(encoding="utf-8")
repls = [
    ("Cargando bolsa…", "Cargando carrito…"),
    ('store-cart__empty-kicker">Bolsa', 'store-cart__empty-kicker">Carrito'),
    ("Tu bolsa sigue aquí.", "Tu carrito sigue aquí."),
    ("Piezas en la bolsa", "Piezas en el carrito"),
    ("La bolsa está lista.", "El carrito está listo."),
    ("Vaciar bolsa", "Vaciar carrito"),
]
for a, b in repls:
    if a not in t:
        print("MISSING", a)
    else:
        t = t.replace(a, b)
        print("ok", b)
p.write_text(t, encoding="utf-8", newline="\n")

# restore compact .tienda__hero for cart page header
css = Path(r"c:\Users\Gabriel\Desktop\Frantana\src\app\globals.css")
raw = css.read_bytes()
if raw.startswith(b"\xef\xbb\xbf"):
    raw = raw[3:]
ct = raw.decode("utf-8")
if ".tienda__hero {" not in ct:
    needle = ".tienda__intro {"
    insert = """.tienda__hero {
  width: var(--shop-max);
  margin-inline: auto;
  padding: clamp(1.5rem, 4vh, 2.5rem) 0 clamp(1rem, 2.5vh, 1.75rem);
}

"""
    ct = ct.replace(needle, insert + needle, 1)
    css.write_bytes(ct.encode("utf-8"))
    print("added tienda__hero")
else:
    print("tienda__hero already present")
