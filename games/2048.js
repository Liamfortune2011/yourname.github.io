/* 2048 */
  #g2048-score { font-size: 14px; color: var(--muted); margin-bottom: 1.25rem; }
  #g2048-board {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    width: min(85vw, 320px);
    aspect-ratio: 1;
    background: #d3d1c7;
    border-radius: 10px;
    padding: 8px;
    margin-bottom: 1.25rem;
  }
  .tile {
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 20px;
    background: #eeede8;
    color: #2c2c2a;
  }
  .tile[data-v="2"] { background: #f2f0e6; }
  .tile[data-v="4"] { background: #ece3cc; }
  .tile[data-v="8"] { background: #e8b878; color: #fff; }
  .tile[data-v="16"] { background: #e59563; color: #fff; }
  .tile[data-v="32"] { background: #e07a5f; color: #fff; }
  .tile[data-v="64"] { background: #db5a3c; color: #fff; }
  .tile[data-v="128"] { background: #e8c86e; color: #fff; font-size: 17px; }
  .tile[data-v="256"] { background: #e5c25c; color: #fff; font-size: 17px; }
  .tile[data-v="512"] { background: #e2bd4a; color: #fff; font-size: 17px; }
  .tile[data-v="1024"] { background: #dfb838; color: #fff; font-size: 15px; }
  .tile[data-v="2048"] { background: #2c2c2a; color: #fff; font-size: 15px; }
  #g2048-msg { font-size: 13px; color: var(--muted); margin-top: -0.75rem; margin-bottom: 1rem; min-height: 18px; }
