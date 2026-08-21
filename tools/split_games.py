from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'index.html'
GAMES = ROOT / 'games'

GAME_NAMES = [
    'SUDOKU', 'MEMORY MATCH', 'TIC TAC TOE', 'SNAKE', '2048',
    'CONNECT FOUR', 'BREAKOUT', 'SIMON SAYS', 'BLOCK BLAST', 'WORDLE',
    'MINESWEEPER', 'TAG', 'COOKIE CLICKER'
]

# Always start from the known-good live index on main. The refactor branch
# previously contained generated intermediate files, so using main here makes
# the split reproducible and prevents accidental loss of game code.
text = subprocess.check_output(
    ['git', 'show', 'origin/main:index.html'], text=True
)

script_match = re.search(r'<script>\s*', text, re.I)
if not script_match:
    raise SystemExit('Could not find the main inline JavaScript block.')
script_start = script_match.end()
script_end = text.find('</script>', script_start)
if script_end < 0:
    raise SystemExit('Could not find the end of the main inline JavaScript block.')
js = text[script_start:script_end]

markers = []
for name in GAME_NAMES:
    marker = re.compile(
        rf'/\*\s*=+\s*{re.escape(name)}\s*=+\s*\*/', re.I
    )
    m = marker.search(js)
    if not m:
        raise SystemExit(f'Missing game JavaScript marker: {name}')
    markers.append((m.start(), name))
markers.sort()

GAMES.mkdir(exist_ok=True)
sections = []
for i, (start, name) in enumerate(markers):
    end = markers[i + 1][0] if i + 1 < len(markers) else len(js)
    # The final game section ends before shared trailing script content only if
    # such content exists. In this project COOKIE CLICKER is the final game.
    code = js[start:end].strip() + '\n'
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    (GAMES / f'{slug}.js').write_text(code, encoding='utf-8')
    sections.append((start, end))

# Remove only the game IIFEs from the main inline script. Shared hub, login,
# settings, navigation, and leaderboard integration remain in index.html.
new_js = js
for start, end in reversed(sections):
    new_js = new_js[:start] + new_js[end:]

new_text = text[:script_start] + new_js + text[script_end:]

# Load the extracted game files after the shared inline script so their
# DOMContentLoaded handlers and window exports continue to work normally.
script_tags = '\n'.join(
    f'<script src="games/{re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")}.js"></script>'
    for _, name in markers
)
insert_at = new_text.find('</script>', script_start + len(new_js)) + len('</script>')
new_text = new_text[:insert_at] + '\n' + script_tags + new_text[insert_at:]
INDEX.write_text(new_text, encoding='utf-8')

print(f'Created {len(sections)} exact game JavaScript modules.')
print(f'Updated index.html from origin/main and removed {len(sections)} game IIFEs.')
