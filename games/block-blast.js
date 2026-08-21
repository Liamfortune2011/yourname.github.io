/* block blast */
  #blast-score { font-size: 14px; color: var(--muted); margin-bottom: 1.25rem; }
  #blast-board {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 3px;
    width: min(90vw, 320px);
    aspect-ratio: 1;
    background: #d3d1c7;
    border-radius: 8px;
    padding: 6px;
    margin-bottom: 1.25rem;
  }
  .blast-cell { border-radius: 3px; background: #eeede8; }
  .blast-cell.filled { background: var(--fill-color, #4a6fa5); }
  .blast-cell.ghost { background: var(--fill-color, #4a6fa5); opacity: 0.5; }
  .blast-cell.ghost-invalid { background: #db5a3c; opacity: 0.35; }
  #blast-slots {
    display: flex;
    gap: 14px;
    margin-bottom: 1rem;
    min-height: 64px;
    align-items: center;
    justify-content: center;
  }
  .blast-slot {
    display: grid;
    gap: 2px;
    padding: 8px;
    border-radius: 8px;
    border: 2px solid transparent;
    cursor: pointer;
    background: #fff;
  }
  .blast-slot.selected { border-color: #2c2c2a; }
  .blast-slot.empty { visibility: hidden; }
  .blast-piece-cell { width: 14px; height: 14px; border-radius: 2px; background: #eeede8; }
  .blast-piece-cell.on { background: var(--fill-color, #4a6fa5); }
  #blast-msg { font-size: 13px; color: var(--danger); margin-bottom: 0.5rem; min-height: 18px; }
