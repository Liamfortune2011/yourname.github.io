from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'index.html'
GAMES = ROOT / 'games'
GAME_NAMES = ['SUDOKU','MEMORY MATCH','TIC TAC TOE','SNAKE','2048','CONNECT FOUR','BREAKOUT','SIMON SAYS','BLOCK BLAST','WORDLE','MINESWEEPER','TAG','COOKIE CLICKER','TETRIS','AIR HOCKEY','COIN RUSH','DETECTIVE','TARGET PRACTICE','CLIMB','DODGE','GRAVITY SWITCH','15 PUZZLE','NINJA RUN','BASKET RANDOM','CROSSY ROAD','BITLIFE','PAPER.IO','SNAKE.IO','SUBAWAY RUNNERS','SUPER MARIO']

text = INDEX.read_text(encoding='utf-8')
sm = re.search(r'<script>\s*', text, re.I)
if not sm:
    raise SystemExit('Main inline script not found')
ss = sm.end()
se = text.find('</script>', ss)
if se < 0:
    raise SystemExit('Main inline script end not found')
js = text[ss:se]

comment_re = re.compile(r'/\*([\s\S]*?)\*/')
name_re = [(name, re.compile(r'\b' + re.escape(name).replace(r'\ ', r'\s+') + r'\b', re.I)) for name in GAME_NAMES]
markers = []
for m in comment_re.finditer(js):
    label = ' '.join(m.group(1).split())
    for name, pattern in name_re:
        if pattern.search(label):
            markers.append((m.start(), name, m.end()))
            break

seen = set()
unique = []
for item in sorted(markers):
    if item[1] not in seen:
        unique.append(item)
        seen.add(item[1])
markers = unique
if not markers:
    raise SystemExit('No configured game markers found in the current index.html')

GAMES.mkdir(exist_ok=True)
sections = []
for i, (start, name, marker_end) in enumerate(markers):
    end = markers[i + 1][0] if i + 1 < len(markers) else len(js)
    code = js[marker_end:end].strip()
    if not code:
        continue
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    (GAMES / f'{slug}.js').write_text(code + '\n', encoding='utf-8')
    sections.append((start, end))

newjs = js
for start, end in reversed(sections):
    newjs = newjs[:start] + newjs[end:]
newtext = text[:ss] + newjs + text[se:]
tags = '\n'.join(f'<script src="games/{re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")}.js"></script>' for _, name, _ in markers)
insert = newtext.find('</script>', ss) + len('</script>')
INDEX.write_text(newtext[:insert] + '\n' + tags + newtext[insert:], encoding='utf-8')
print(f'Created {len(markers)} game modules and rebuilt index.html.')
