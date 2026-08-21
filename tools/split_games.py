from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'index.html'
GAMES = ROOT / 'games'

# Split by real game section comments when present. The previous script assumed
# an exact comment format that the uploaded site does not use.
GAME_NAMES = [
    '2048', 'BLOCK BLAST', 'BREAKOUT', 'CONNECT FOUR', 'COOKIE CLICKER',
    'MEMORY MATCH', 'MINESWEEPER', 'SIMON SAYS', 'SNAKE', 'SUDOKU',
    'TAG', 'TIC TAC TOE', 'WORDLE'
]

text = INDEX.read_text(encoding='utf-8')

# Accept common heading/comment variants rather than one exact marker.
patterns = []
for name in GAME_NAMES:
    words = re.escape(name).replace(r'\ ', r'[ _-]+')
    patterns.append((name, re.compile(rf'(?im)^\s*(?:/\*+|<!--|//)\s*=*\s*{words}\s*=*\s*(?:\*/|-->|)?\s*$')))

matches = []
for name, pattern in patterns:
    m = pattern.search(text)
    if m:
        matches.append((m.start(), name, m.end()))

matches.sort()
if len(matches) < 2:
    raise SystemExit('Could not find enough real game section boundaries in index.html; no files changed.')

# Only split sections that are actually found. Keep shared hub/auth code intact.
GAMES.mkdir(exist_ok=True)
sections = []
for i, (start, name, marker_end) in enumerate(matches):
    end = matches[i + 1][0] if i + 1 < len(matches) else len(text)
    code = text[start:end].strip() + '\n'
    (GAMES / (re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-') + '.js')).write_text(code, encoding='utf-8')
    sections.append((start, end))

# Do not rewrite index.html automatically unless the sections are script-only.
# This first pass creates verified per-game files without deleting working code.
print(f'Created {len(sections)} game module candidates; original index.html preserved.')
