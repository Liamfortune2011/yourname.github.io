from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'index.html'
GAMES = ROOT / 'games'

GAME_NAMES = [
    'SUDOKU', 'MEMORY MATCH', 'TIC TAC TOE', 'SNAKE', '2048',
    'CONNECT FOUR', 'BREAKOUT', 'SIMON SAYS', 'BLOCK BLAST', 'WORDLE',
    'MINESWEEPER', 'TAG', 'COOKIE CLICKER'
]

def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

text = INDEX.read_text(encoding='utf-8')

# The existing project keeps all game JavaScript in one inline <script>.
# Extract only the clearly delimited game IIFEs. Shared hub/login/settings code stays in index.html.
markers = []
for name in GAME_NAMES:
    marker = f'/* ============ {name} ============ */'
    pos = text.find(marker)
    if pos < 0:
        raise SystemExit(f'Missing JS marker: {marker}')
    markers.append((pos, name, marker))
markers.sort()

script_end = text.find('</script>', markers[0][0])
if script_end < 0:
    raise SystemExit('Could not find end of main script')

# Verify all game markers are inside the same main script.
for pos, name, marker in markers:
    if pos >= script_end:
        raise SystemExit(f'Game marker is outside main script: {name}')

GAMES.mkdir(exist_ok=True)

# Extract each game section through the next game marker (or </script> for the last game).
sections = []
for i, (pos, name, marker) in enumerate(markers):
    end = markers[i + 1][0] if i + 1 < len(markers) else script_end
    code = text[pos:end].strip() + '\n'
    sections.append((pos, end, name, code))
    (GAMES / f'{slug(name)}.js').write_text(code, encoding='utf-8')

# Remove extracted sections from index, preserving all shared code.
new_text = text
for pos, end, name, code in reversed(sections):
    new_text = new_text[:pos] + new_text[end:]

# Load the modules after the shared inline code and before the leaderboard module.
script_tags = '\n'.join(f'<script src="games/{slug(name)}.js"></script>' for _, _, name, _ in sections)
needle = '<script src="leaderboard.js"></script>'
if needle not in new_text:
    raise SystemExit('leaderboard.js script tag not found')
new_text = new_text.replace(needle, script_tags + '\n' + needle, 1)

INDEX.write_text(new_text, encoding='utf-8')
print(f'Created {len(sections)} game modules and updated index.html')
