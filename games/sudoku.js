/* sudoku */
  .diff-row { display: flex; gap: 8px; margin-bottom: 1.25rem; flex-wrap: wrap; justify-content: center; }
  #board {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    width: min(90vw, 396px);
    aspect-ratio: 1;
    border: 2px solid var(--app-text);
    background: var(--card-bg);
    margin-bottom: 1.25rem;
  }
  .sudoku-cell { display: flex; align-items: center; justify-content: center; }
  .given { font-weight: 600; font-size: 16px; background: var(--hover-bg); color: var(--app-text); }
  .sudoku-cell input {
    width: 100%; height: 100%; border: none; text-align: center;
    font-size: 16px; font-family: inherit; background: transparent; outline: none; padding: 0;
  }
  .controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: center; }
  #status-msg { font-size: 13px; color: var(--muted); }
  .correct { background: #eaf3de !important; color: #27500a !important; }
  .wrong { background: #fcebeb !important; color: #791f1f !important; }

  /* memory */
  .stats { display:flex; gap:20px; font-size:14px; color:var(--muted); margin-bottom:1.25rem; }
  #mem-board {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    width: min(90vw, 360px);
    margin-bottom: 1.25rem;
  }
  .mem-card {
    aspect-ratio: 1; border-radius: 10px; background: #2c2c2a;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; cursor: pointer; user-select: none;
  }
  .mem-card.flipped, .mem-card.matched { background: #fff; border: 1px solid #d3d1c7; }
  .mem-card.matched { opacity: 0.5; cursor: default; }
  #win-msg { font-size: 14px; color: #27500a; margin-top: 10px; min-height: 20px; }
