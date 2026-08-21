/* simon says */
  #simon-stats { font-size: 14px; color: var(--muted); margin-bottom: 1.25rem; }
  #simon-board {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    width: min(85vw, 260px);
    aspect-ratio: 1;
    margin-bottom: 1.25rem;
  }
  .simon-pad {
    border-radius: 12px;
    cursor: pointer;
    opacity: 0.55;
    transition: opacity 0.1s;
  }
  .simon-pad.lit { opacity: 1; }
  .simon-pad.green { background: #6fae4a; }
  .simon-pad.red { background: #db5a3c; }
  .simon-pad.yellow { background: #e8c86e; }
  .simon-pad.blue { background: #4a6fa5; }
  #simon-msg { font-size: 14px; color: var(--muted); margin-bottom: 0.5rem; min-height: 20px; }
