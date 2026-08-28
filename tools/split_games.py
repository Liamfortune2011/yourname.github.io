from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'index.html'
GAMES = ROOT / 'games'
GAME_NAMES = ['SUDOKU','MEMORY MATCH','TIC TAC TOE','SNAKE','2048','CONNECT FOUR','BREAKOUT','SIMON SAYS','BLOCK BLAST','WORDLE','MINESWEEPER','TAG','COOKIE CLICKER','TETRIS','AIR HOCKEY','COIN RUSH','DETECTIVE','TARGET PRACTICE','CLIMB','DODGE','GRAVITY SWITCH','15 PUZZLE','NINJA RUN','BASKET RANDOM','CROSSY ROAD','BITLIFE','PAPER.IO','SNAKE.IO','SUBAWAY RUNNERS','SUPER MARIO']

text = INDEX.read_text(encoding='utf-8')

# Work only inside the main inline script. Existing external modules are left alone.
sm = re.search(r'<script>\s*', text, re.I)
if not sm:
    raise SystemExit('Main inline script not found')
ss = sm.end()
se = text.find('</script>', ss)
if se < 0:
    raise SystemExit('Main inline script end not found')
js = text[ss:se]

# The current file uses both simple comments (/* TETRIS */) and banner comments
# (/* ===================== BASKET RANDOM ===================== */). Match both.
comment_re = re.compile(r'/\*([\s\S]*?)\*/')
name_re = [(name, re.compile(r'\b' + re.escape(name).replace(r'\ ', r'\s+') + r'\b', re.I)) for name in GAME_NAMES]

# Restrict candidates to the game implementation area so CSS/HTML comments are untouched.
extra_pos = js.find('extraGames')
if extra_pos < 0:
    raise SystemExit('extraGames implementation area not found')

markers = []
for m in comment_re.finditer(js, extra_pos):
    label = ' '.join(m.group(1).split())
    for name, pattern in name_re:
        if pattern.search(label):
            markers.append((m.start(), name, m.end()))
            break

# Remove duplicate marker hits while preserving source order.
seen = set()
unique = []
for item in sorted(markers):
    key = item[1]
    if key not in seen:
        unique.append(item)
        seen.add(key)
markers = unique

if not markers:
    raise SystemExit('No configured game markers found in the current index.html')

GAMES.mkdir(exist_ok=True)
sections = []
for i, (start, name, marker_end) in enumerate(markers):
    end = markers[i + 1][0] if i + 1 < len(markers) else len(js)
    # Keep only the requested game's implementation in its module.
    code = js[marker_end:end].strip()
    if not code:
        continue
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    (GAMES / f'{slug}.js').write_text(code + '\n', encoding='utf-8')
    sections.append((start, end))

# Remove only the extracted safe-game sections from the inline script.
newjs = js
for start, end in reversed(sections):
    newjs = newjs[:start] + newjs[end:]
newtext = text[:ss] + newjs + text[se:]

# Add external module tags immediately after the main inline script.
tags = '\n'.join(
    f'<script src="games/{re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")}.js"></script>'
    for _, name, _ in markers
)
insert = newtext.find('</script>', ss) + len('</script>')
INDEX.write_text(newtext[:insert] + '\n' + tags + newtext[insert:], encoding='utf-8')
print(f'Created {len(markers)} game modules and rebuilt index.html.')
