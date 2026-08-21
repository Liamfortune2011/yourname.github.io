/* ============ TIC TAC TOE ============ */
  (function(){
    var boardEl, turnEl, bestEl;
    var lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    var cells, current, over, mode='2p';
    var streak = 0;

    window.newTttGame = function(){
      boardEl=document.getElementById('ttt-board');
      turnEl=document.getElementById('turn');
      bestEl=document.getElementById('ttt-best-val');
      bestEl.textContent = getHigh('ttt') || 0;
      cells = new Array(9).fill(null);
      current = 'X';
      over = false;
      turnEl.textContent = mode==='1p' ? "Your turn (X)" : "Player X's turn";
      render();
    };

    function setMode(m){
      mode = m;
      document.querySelectorAll('.ttt-mode-btn').forEach(function(b){
        b.classList.toggle('active', b.dataset.mode===m);
      });
      newTttGame();
    }

    function checkWin(bd){
      for(var i=0;i<lines.length;i++){
        var l = lines[i];
        if(bd[l[0]] && bd[l[0]]===bd[l[1]] && bd[l[1]]===bd[l[2]]) return l;
      }
      return null;
    }

    function render(){
      boardEl.innerHTML = '';
      cells.forEach(function(val, i){
        var c = document.createElement('div');
        c.className = 'ttt-cell' + (val ? ' taken' : '');
        c.textContent = val || '';
        c.addEventListener('click', function(){ onClick(i); });
        boardEl.appendChild(c);
      });
    }

    function onClick(i){
      if(over || cells[i]) return;
      if(mode==='1p' && current!=='X') return;
      place(i, current);
      if(over) return;
      if(mode==='1p' && current==='O'){
        setTimeout(computerMove, 350);
      }
    }

    function place(i, player){
      cells[i] = player;
      var win = checkWin(cells);
      if(win){
        over = true;
        render();
        win.forEach(function(idx){ boardEl.children[idx].classList.add('win'); });
        if(player==='X'){
          streak++;
          bestEl.textContent = updateHigh('ttt', streak, true);
        } else {
          streak = 0;
        }
        turnEl.textContent = mode==='1p'
          ? (player==='X' ? 'You win!' : 'Computer wins!')
          : ('Player ' + player + ' wins!');
        return;
      }
      if(cells.every(function(v){ return v; })){
        over = true;
        streak = 0;
        render();
        turnEl.textContent = "It's a draw!";
        return;
      }
      current = current === 'X' ? 'O' : 'X';
      turnEl.textContent = mode==='1p'
        ? (current==='X' ? "Your turn (X)" : "Computer's turn...")
        : ("Player " + current + "'s turn");
      render();
    }

    function computerMove(){
      if(over) return;
      var best = minimax(cells, 'O').index;
      place(best, 'O');
    }

    function minimax(bd, player){
      var avail = [];
      for(var i=0;i<9;i++) if(!bd[i]) avail.push(i);
      var win = checkWin(bd);
      if(win) return { score: bd[win[0]]==='O' ? 10 : -10 };
      if(avail.length===0) return { score: 0 };

      var moves = [];
      for(var a=0;a<avail.length;a++){
        var idx = avail[a];
        var nb = bd.slice();
        nb[idx] = player;
        var result = minimax(nb, player==='O' ? 'X' : 'O');
        moves.push({ index: idx, score: result.score });
      }
      var best;
      if(player==='O'){
        best = moves[0];
        for(var m=1;m<moves.length;m++) if(moves[m].score > best.score) best = moves[m];
      } else {
        best = moves[0];
        for(var m=1;m<moves.length;m++) if(moves[m].score < best.score) best = moves[m];
      }
      return best;
    }

    document.addEventListener('DOMContentLoaded', function(){
      document.getElementById('ttt-new-btn').addEventListener('click', function(){ confirmReset(newTttGame); });
      document.querySelectorAll('.ttt-mode-btn').forEach(function(b){
        b.addEventListener('click', function(){ setMode(b.dataset.mode); });
      });
      document.querySelector('.ttt-mode-btn[data-mode="2p"]').classList.add('active');
    });
  })();
