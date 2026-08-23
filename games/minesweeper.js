/* ============ MINESWEEPER ============ */
  (function(){
    var boardEl, countEl, timeEl, msgEl, bestEl;
    var diffs = {
      easy: { size:9, mines:10 },
      medium: { size:12, mines:20 },
      hard: { size:16, mines:40 }
    };
    var currentDiff = 'easy';
    var size, mineCount, grid, revealedCount, flagCount, over, firstClick, flagMode;
    var elapsed = 0, timerInterval = null, ticking = false;

    function formatTime(s){
      var m = Math.floor(s/60), sec = s%60;
      return m + ':' + (sec<10 ? '0' : '') + sec;
    }

    window.initMines = function(){
      boardEl = document.getElementById('mine-board');
      countEl = document.getElementById('mine-count-val');
      timeEl = document.getElementById('mine-time-val');
      msgEl = document.getElementById('mine-msg');
      bestEl = document.getElementById('mine-best-val');
      newMinesGame();
    };

    window.newMinesGame = function(){
      var cfg = diffs[currentDiff];
      size = cfg.size; mineCount = cfg.mines;
      grid = [];
      for(var r=0;r<size;r++){
        var row = [];
        for(var c=0;c<size;c++) row.push({ mine:false, count:0, revealed:false, flagged:false });
        grid.push(row);
      }
      revealedCount = 0; flagCount = 0; over = false; firstClick = true; ticking = false;
      flagMode = false;
      document.getElementById('mine-flag-btn').textContent = '🚩 Flag mode: Off';
      elapsed = 0;
      timeEl.textContent = '0:00';
      if(timerInterval) clearInterval(timerInterval);
      countEl.textContent = mineCount;
      msgEl.textContent = '';
      var best = getHigh('mines_' + currentDiff);
      bestEl.textContent = best===null ? '–' : formatTime(best);
      boardEl.style.gridTemplateColumns = 'repeat(' + size + ', 1fr)';
      renderMines();
    };

    function setMineDiff(d){
      currentDiff = d;
      document.querySelectorAll('.mine-diff-btn').forEach(function(b){
        b.classList.toggle('active', b.dataset.diff===d);
      });
      newMinesGame();
    }

    function placeMines(excludeR, excludeC){
      var placed = 0;
      while(placed < mineCount){
        var r = Math.floor(Math.random()*size), c = Math.floor(Math.random()*size);
        if(Math.abs(r-excludeR)<=1 && Math.abs(c-excludeC)<=1) continue;
        if(grid[r][c].mine) continue;
        grid[r][c].mine = true;
        placed++;
      }
      for(var r=0;r<size;r++){
        for(var c=0;c<size;c++){
          if(grid[r][c].mine) continue;
          var n = 0;
          for(var dr=-1;dr<=1;dr++) for(var dc=-1;dc<=1;dc++){
            var rr=r+dr, cc=c+dc;
            if(rr>=0&&rr<size&&cc>=0&&cc<size&&grid[rr][cc].mine) n++;
          }
          grid[r][c].count = n;
        }
      }
    }

    function renderMines(){
      boardEl.innerHTML = '';
      for(var r=0;r<size;r++){
        for(var c=0;c<size;c++){
          var cell = grid[r][c];
          var el = document.createElement('div');
          el.className = 'mine-cell';
          el.dataset.r = r; el.dataset.c = c;
          if(cell.revealed){
            el.classList.add('revealed');
            if(cell.mine){
              el.classList.add('mine');
              el.textContent = '💣';
            } else if(cell.count>0){
              el.textContent = cell.count;
              el.classList.add('n' + cell.count);
            }
          } else if(cell.flagged){
            el.classList.add('flag');
            el.textContent = '🚩';
          }
          el.addEventListener('click', function(e){ onCellClick(+e.currentTarget.dataset.r, +e.currentTarget.dataset.c); });
          el.addEventListener('contextmenu', function(e){
            e.preventDefault();
            toggleFlag(+e.currentTarget.dataset.r, +e.currentTarget.dataset.c);
          });
          boardEl.appendChild(el);
        }
      }
    }

    function startTimer(){
      if(ticking) return;
      ticking = true;
      timerInterval = setInterval(function(){
        if(over) return;
        elapsed++;
        timeEl.textContent = formatTime(elapsed);
      }, 1000);
    }

    function toggleFlag(r, c){
      if(over) return;
      var cell = grid[r][c];
      if(cell.revealed) return;
      cell.flagged = !cell.flagged;
      flagCount += cell.flagged ? 1 : -1;
      countEl.textContent = mineCount - flagCount;
      renderMines();
    }

    function onCellClick(r, c){
      if(over) return;
      var cell = grid[r][c];
      if(flagMode){ toggleFlag(r, c); return; }
      if(cell.flagged || cell.revealed) return;
      if(firstClick){
        placeMines(r, c);
        firstClick = false;
        startTimer();
      }
      if(cell.mine){
        cell.revealed = true;
        over = true;
        clearInterval(timerInterval);
        for(var rr=0;rr<size;rr++) for(var cc=0;cc<size;cc++) if(grid[rr][cc].mine) grid[rr][cc].revealed = true;
        renderMines();
        msgEl.textContent = 'Boom! Game over.';
        return;
      }
      reveal(r, c);
      renderMines();
      checkWin();
    }

    function reveal(r, c){
      var cell = grid[r][c];
      if(cell.revealed || cell.flagged) return;
      cell.revealed = true;
      revealedCount++;
      if(cell.count===0){
        for(var dr=-1;dr<=1;dr++) for(var dc=-1;dc<=1;dc++){
          var rr=r+dr, cc=c+dc;
          if(rr>=0&&rr<size&&cc>=0&&cc<size) reveal(rr, cc);
        }
      }
    }

    function checkWin(){
      if(revealedCount === size*size - mineCount){
        over = true;
        clearInterval(timerInterval);
        var best = updateHigh('mines_' + currentDiff, elapsed, false);
        bestEl.textContent = formatTime(best);
        msgEl.textContent = 'Cleared the board!';
      }
    }

    document.addEventListener('DOMContentLoaded', function(){
      document.getElementById('mine-new-btn').addEventListener('click', function(){ confirmReset(newMinesGame); });
      document.querySelectorAll('.mine-diff-btn').forEach(function(b){
        b.addEventListener('click', function(){ setMineDiff(b.dataset.diff); });
      });
      document.querySelector('.mine-diff-btn[data-diff="easy"]').classList.add('active');
      document.getElementById('mine-flag-btn').addEventListener('click', function(e){
        flagMode = !flagMode;
        e.target.textContent = flagMode ? '🚩 Flag mode: On' : '🚩 Flag mode: Off';
        e.target.classList.toggle('active', flagMode);
      });
    });
  })();
