/* ============ CONNECT FOUR ============ */
  (function(){
    var boardEl, turnEl, bestEl;
    var rows=6, cols=7, grid, current, over, mode='2p';
    var streak = 0;

    window.newC4Game = function(){
      boardEl = document.getElementById('c4-board');
      turnEl = document.getElementById('c4-turn');
      bestEl = document.getElementById('c4-best-val');
      bestEl.textContent = getHigh('c4') || 0;
      grid = [];
      for(var r=0;r<rows;r++) grid.push(new Array(cols).fill(null));
      current = 'red';
      over = false;
      turnEl.textContent = mode==='1p' ? "Your turn (red)" : "Red's turn";
      render();
    };

    function setMode(m){
      mode = m;
      document.querySelectorAll('.c4-mode-btn').forEach(function(b){
        b.classList.toggle('active', b.dataset.mode===m);
      });
      newC4Game();
    }

    function render(){
      boardEl.innerHTML = '';
      for(var r=0;r<rows;r++){
        for(var c=0;c<cols;c++){
          var cell = document.createElement('div');
          cell.className = 'c4-cell c4-col-hover' + (grid[r][c] ? ' '+grid[r][c] : '');
          cell.dataset.c = c;
          cell.addEventListener('click', function(e){ onColClick(+e.currentTarget.dataset.c); });
          cell.addEventListener('mouseenter', function(e){ onColHover(+e.currentTarget.dataset.c); });
          cell.addEventListener('mouseleave', clearHover);
          boardEl.appendChild(cell);
        }
      }
    }

    function canHint(){
      return !over && (mode==='2p' || current==='red');
    }

    function onColHover(c){
      clearHover();
      if(!canHint()) return;
      var r = lowestEmptyRow(grid, c);
      if(r===-1) return;
      boardEl.children[r*cols+c].classList.add('preview-' + current);
    }

    function clearHover(){
      var lit = boardEl.querySelectorAll('.preview-red, .preview-yellow');
      lit.forEach(function(el){ el.classList.remove('preview-red', 'preview-yellow'); });
    }

    function onColClick(c){
      if(over) return;
      if(mode==='1p' && current!=='red') return;
      var landed = dropInCol(c, current);
      if(landed===-1) return;
      if(!over && mode==='1p' && current==='yellow'){
        setTimeout(computerMove, 400);
      }
    }

    function lowestEmptyRow(g, c){
      for(var r=rows-1;r>=0;r--) if(!g[r][c]) return r;
      return -1;
    }

    function dropInCol(c, player){
      var r = lowestEmptyRow(grid, c);
      if(r===-1) return -1;
      grid[r][c] = player;
      render();
      if(checkWin(grid, r, c, player)){
        over = true;
        if(player==='red'){
          streak++;
          bestEl.textContent = updateHigh('c4', streak, true);
        } else {
          streak = 0;
        }
        turnEl.textContent = mode==='1p'
          ? (player==='red' ? 'You win!' : 'Computer wins!')
          : ((player==='red'?'Red':'Yellow') + ' wins!');
        return r;
      }
      if(grid[0].every(function(v){ return v; })){
        over = true;
        streak = 0;
        turnEl.textContent = "It's a draw!";
        return r;
      }
      current = current==='red' ? 'yellow' : 'red';
      turnEl.textContent = mode==='1p'
        ? (current==='red' ? "Your turn (red)" : "Computer's turn...")
        : ((current==='red'?"Red":"Yellow") + "'s turn");
      return r;
    }

    function checkWin(g, r, c, player){
      var dirs = [[0,1],[1,0],[1,1],[1,-1]];
      for(var d=0; d<dirs.length; d++){
        var dr=dirs[d][0], dc=dirs[d][1];
        var count=1;
        for(var s=1;s<4;s++){
          var rr=r+dr*s, cc=c+dc*s;
          if(rr<0||rr>=rows||cc<0||cc>=cols||g[rr][cc]!==player) break;
          count++;
        }
        for(var s=1;s<4;s++){
          var rr=r-dr*s, cc=c-dc*s;
          if(rr<0||rr>=rows||cc<0||cc>=cols||g[rr][cc]!==player) break;
          count++;
        }
        if(count>=4) return true;
      }
      return false;
    }

    function validCols(g){
      var out = [];
      for(var c=0;c<cols;c++) if(!g[0][c]) out.push(c);
      return out;
    }

    function computerMove(){
      if(over) return;
      var cols_ = validCols(grid);

      // 1. Win if possible
      for(var i=0;i<cols_.length;i++){
        var c = cols_[i];
        var r = lowestEmptyRow(grid, c);
        grid[r][c] = 'yellow';
        var win = checkWin(grid, r, c, 'yellow');
        grid[r][c] = null;
        if(win){ dropInCol(c, 'yellow'); return; }
      }
      // 2. Block opponent's win
      for(var i=0;i<cols_.length;i++){
        var c = cols_[i];
        var r = lowestEmptyRow(grid, c);
        grid[r][c] = 'red';
        var win = checkWin(grid, r, c, 'red');
        grid[r][c] = null;
        if(win){ dropInCol(c, 'yellow'); return; }
      }
      // 3. Prefer center columns, weighted random
      var weights = cols_.map(function(c){ return 4 - Math.abs(c - 3); });
      var total = weights.reduce(function(a,b){ return a+b; }, 0);
      var pick = Math.random() * total;
      var chosen = cols_[0];
      for(var i=0;i<cols_.length;i++){
        pick -= weights[i];
        if(pick <= 0){ chosen = cols_[i]; break; }
      }
      dropInCol(chosen, 'yellow');
    }

    document.addEventListener('DOMContentLoaded', function(){
      document.getElementById('c4-new-btn').addEventListener('click', function(){ confirmReset(newC4Game); });
      document.querySelectorAll('.c4-mode-btn').forEach(function(b){
        b.addEventListener('click', function(){ setMode(b.dataset.mode); });
      });
      document.querySelector('.c4-mode-btn[data-mode="2p"]').classList.add('active');
    });
  })();
