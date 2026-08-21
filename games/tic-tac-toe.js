/* tic tac toe */
  #turn { font-size: 14px; color: var(--muted); margin-bottom: 1.25rem; min-height: 20px; }
  #ttt-board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    width: min(80vw, 300px);
    margin-bottom: 1.25rem;
  }
  .ttt-cell {
    aspect-ratio: 1; background: #fff; border: 1px solid #d3d1c7; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 40px; font-weight: 600; cursor: pointer; color: #2c2c2a;
  }
  .ttt-cell.taken { cursor: default; }
  .ttt-cell.win { background: #eaf3de; border-color: #97c459; }
