/* minesweeper */
  #mine-stats { display:flex; gap:20px; font-size:14px; color:var(--muted); margin-bottom:1rem; }
  .mine-board {
    display: grid;
    gap: 2px;
    background: var(--card-border);
    border: 2px solid var(--app-text);
    padding: 2px;
    width: min(92vw, 320px);
    aspect-ratio: 1;
    margin-bottom: 1.25rem;
  }
  .mine-cell {
    background: var(--card-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    user-select: none;
  }
  .mine-cell.revealed { background: var(--hover-bg); cursor: default; }
  .mine-cell.mine { background: #db5a3c; }
  .mine-cell.flag { background: var(--card-bg); }
  .mine-cell.n1 { color: #4a6fa5; }
  .mine-cell.n2 { color: #6fae4a; }
  .mine-cell.n3 { color: #db5a3c; }
  .mine-cell.n4 { color: #9b6fae; }
  .mine-cell.n5 { color: #791f1f; }
  .mine-cell.n6 { color: #2d9d9d; }
  .mine-cell.n7 { color: var(--app-text); }
  .mine-cell.n8 { color: var(--muted); }
  #mine-msg { font-size: 13px; color: var(--danger); margin-bottom: 0.5rem; min-height: 18px; }
