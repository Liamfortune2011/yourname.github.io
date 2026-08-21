/* wordle */
  .wordle-board {
    display: grid;
    grid-template-rows: repeat(6, 1fr);
    gap: 6px;
    width: min(80vw, 280px);
    margin-bottom: 1.25rem;
  }
  .wordle-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .wordle-tile {
    aspect-ratio: 1;
    border: 2px solid var(--card-border);
    background: var(--card-bg);
    color: var(--app-text);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 20px;
    text-transform: uppercase;
  }
  .wordle-tile.correct { background: #6fae4a; border-color: #6fae4a; color: #fff; }
  .wordle-tile.present { background: #e8c86e; border-color: #e8c86e; color: #fff; }
  .wordle-tile.absent { background: var(--muted); border-color: var(--muted); color: #fff; }
  .wordle-keyboard { display: flex; flex-direction: column; gap: 6px; width: min(95vw, 340px); margin-bottom: 0.5rem; }
  .wordle-krow { display: flex; gap: 4px; justify-content: center; }
  .wordle-key {
    flex: 1;
    min-width: 0;
    padding: 12px 0;
    text-align: center;
    border-radius: 6px;
    border: 1px solid var(--card-border);
    background: var(--card-bg);
    color: var(--app-text);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    text-transform: uppercase;
  }
  .wordle-key.wide { flex: 1.6; font-size: 10px; }
  .wordle-key.correct { background: #6fae4a; color: #fff; border-color: #6fae4a; }
  .wordle-key.present { background: #e8c86e; color: #fff; border-color: #e8c86e; }
  .wordle-key.absent { background: var(--muted); color: #fff; border-color: var(--muted); }
  #wordle-msg { font-size: 13px; color: var(--muted); margin-bottom: 0.75rem; min-height: 18px; }
