from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'index.html'
GAMES = ROOT / 'games'
GAME_NAMES = ['SUDOKU','MEMORY MATCH','TIC TAC TOE','SNAKE','2048','CONNECT FOUR','BREAKOUT','SIMON SAYS','BLOCK BLAST','WORDLE','MINESWEEPER','TAG','COOKIE CLICKER','TETRIS','AIR HOCKEY','COIN RUSH','DETECTIVE','CLIMB','DODGE','GRAVITY SWITCH','15 PUZZLE','NINJA RUN','BASKET RANDOM','CROSSY ROAD','BITLIFE','PAPER.IO','SNAKE.IO','SUPER MARIO','SUBAWAY RUNNERS']

text = INDEX.read_text(encoding='utf-8')
if all(f'games/{re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")}.js' in text for name in GAME_NAMES):
    print('All configured game modules already referenced; nothing to split.')
    raise SystemExit(0)

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
    if m:
        markers.append((m.start(), name))

if not markers:
    raise SystemExit('No configured game markers found in the current index.html')

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
print(f'Created {len(markers)} game modules and rebuilt index.html from the current refactor branch.')
