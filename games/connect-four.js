/* connect four */
  #c4-turn { font-size: 14px; color: var(--muted); margin-bottom: 1.25rem; min-height: 20px; }
  #c4-board {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
    width: min(92vw, 420px);
    background: #4a6fa5;
    border-radius: 10px;
    padding: 8px;
    margin-bottom: 1.25rem;
  }
  .c4-cell {
    aspect-ratio: 1;
    border-radius: 50%;
    background: #f4f3ee;
    cursor: pointer;
  }
  .c4-cell.red { background: #db5a3c; }
  .c4-cell.yellow { background: #e8c86e; }
  .c4-col-hover:hover { background: #dfe6f0; }
  .c4-cell.preview-red { background: rgba(219,90,60,0.4); }
  .c4-cell.preview-yellow { background: rgba(232,200,110,0.5); }

  /* confirm modal */
  .modal-overlay {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.45);
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .modal-overlay.active { display: flex; }
  .modal-box {
    background: var(--card-bg);
    color: var(--app-text);
    border-radius: 12px;
    padding: 1.5rem;
    width: min(85vw, 320px);
    text-align: center;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    max-height: 85vh;
    overflow-y: auto;
  }
  .modal-box p { margin: 0 0 1.25rem; font-size: 15px; color: var(--app-text); }
  .modal-box .modal-btns { display: flex; gap: 10px; justify-content: center; }
  .modal-box .modal-btns button { flex: 1; }
  #modal-confirm-btn { background: var(--app-text); color: var(--app-bg); border-color: var(--app-text); }
  #modal-confirm-btn:hover { opacity: 0.85; }

  /* settings modal */
  .settings-row { margin-bottom: 1.1rem; text-align: left; }
  .settings-row label { display: block; font-size: 13px; color: var(--muted); margin-bottom: 6px; }
  .settings-row .diff-row { justify-content: flex-start; margin-bottom: 0; }
  .settings-row select {
    width: 100%;
    font-family: inherit;
    font-size: 14px;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid var(--card-border);
    background: var(--card-bg);
    color: var(--app-text);
  }
  .settings-row input[type="color"] {
    width: 44px; height: 32px; border: none; padding: 0; background: none; cursor: pointer;
  }
