from pathlib import Path
import re

path = Path(r"c:\Users\Gabriel\Desktop\Frantana\src\app\globals.css")
raw = path.read_bytes()
if raw.startswith(b"\xef\xbb\xbf"):
    raw = raw[3:]
    print("removed BOM")
text = raw.decode("utf-8")

# Find dangling combinators: selector fragments ending with > + ~ before {
# Strip comments first
nocomment = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
# Find rules
for m in re.finditer(r"([^{}]+)\{", nocomment):
    sel = m.group(1).strip()
    if not sel:
        continue
    # dangling if ends with combinator
    if re.search(r"[>+~]\s*$", sel):
        pos = m.start()
        line = text[:pos].count("\n") + 1
        print("DANGLING", line, repr(sel[:120]))
    # empty selector parts like ", ," or starting with combinator
    for part in sel.split(","):
        p = part.strip()
        if re.match(r"^[>+~]", p):
            pos = m.start()
            line = text[:pos].count("\n") + 1
            print("LEAD COMB", line, repr(p[:120]))

path.write_bytes(text.encode("utf-8"))
print("written no BOM", path.stat().st_size)
print("first bytes", list(path.read_bytes()[:3]))
