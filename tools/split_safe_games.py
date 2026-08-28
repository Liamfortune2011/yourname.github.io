from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'index.html'
GAMES = ROOT / 'games'

# Non-weapon games from the supplied Game Hub file.
GAME_NAMES = [
    'RACING','TETRIS','AIR HOCKEY','COIN RUSH','DETECTIVE','CLIMB','DODGE',
    'GRAVITY SWITCH','15 PUZZLE','NINJA RUN','BASKET RANDOM','CROSSY ROAD',
    'BITLIFE','PAPER.IO','SNAKE.IO','SUBAWAY RUNNERS','SUPER MARIO'
]

text = INDEX.read_text(encoding='utf-8')
sm = re.search(r'<script>\s*', text, re.I)
if not sm:
    raise SystemExit('Main inline script not found')
ss = sm.end()
se = text.find('</script>', ss)
if se < 0:
    raise SystemExit('Main inline script end not found')
js = text[ss:se]

markers = []
for name in GAME_NAMES:
    m = re.search(r'/\*\s*=+\s*' + re.escape(name) + r'\s*=+\s*\*/', js, re.I)
    if not m:
        raise SystemExit(f'Missing game marker: {name}')
    markers.append((m.start(), name))
markers.sort()

GAMES.mkdir(exist_ok=True)
sections = []
for i, (start, name) in enumerate(markers):
    end = markers[i + 1][0] if i + 1 < len(markers) else len(js)
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    (GAMES / f'{slug}.js').write_text(js[start:end].strip() + '\n', encoding='utf-8')
    sections.append((start, end))

newjs = js
for start, end in reversed(sections):
    newjs = newjs[:start] + newjs[end:]
newtext = text[:ss] + newjs + text[se:]
insert = newtext.find('</script>', ss + len(newjs)) + len('</script>')
tags = '\n'.join(
    f'<script src="games/{re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")}.js"></script>'
    for _, name in markers
)
INDEX.write_text(newtext[:insert] + '\n' + tags + newtext[insert:], encoding='utf-8')
print(f'Created {len(markers)} safe game modules.')
