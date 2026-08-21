/* ============ 2048 ============ */
  (function(){
    var boardEl, scoreEl, msgEl, bestEl;
    var grid, score, over;

    window.new2048Game = function(){
      boardEl = document.getElementById('g2048-board');
      scoreEl = document.getElementById('g2048-score-val');
      msgEl = document.getElementById('g2048-msg');
      bestEl = document.getElementById('g2048-best-val');
      grid = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
      score = 0; over = false;
      scoreEl.textContent = 0;
      bestEl.textContent = getHigh('g2048') || 0;
      msgEl.textContent = '';
      spawnTile(); spawnTile();
      render();
    };

    function spawnTile(){
      var empties = [];
      for(var r=0;r<4;r++) for(var c=0;c<4;c++) if(grid[r][c]===0) empties.push([r,c]);
      if(empties.length===0) return;
      var pick = empties[Math.floor(Math.random()*empties.length)];
      grid[pick[0]][pick[1]] = Math.random()<0.9 ? 2 : 4;
    }

    function render(){
      boardEl.innerHTML = '';
      for(var r=0;r<4;r++){
        for(var c=0;c<4;c++){
          var t = document.createElement('div');
          t.className = 'tile';
          var v = grid[r][c];
          if(v){ t.textContent = v; t.dataset.v = v; }
          boardEl.appendChild(t);
        }
      }
    }

    function slideRow(row){
      var vals = row.filter(function(v){ return v!==0; });
      for(var i=0;i<vals.length-1;i++){
        if(vals[i]===vals[i+1]){
          vals[i]*=2;
          score += vals[i];
          vals.splice(i+1,1);
        }
      }
      while(vals.length<4) vals.push(0);
      return vals;
    }

    function move(dir){
      if(over) return;
      var before = JSON.stringify(grid);
      var r,c;
      if(dir==='left'){
        for(r=0;r<4;r++) grid[r] = slideRow(grid[r]);
      } else if(dir==='right'){
        for(r=0;r<4;r++) grid[r] = slideRow(grid[r].slice().reverse()).reverse();
      } else if(dir==='up'){
        for(c=0;c<4;c++){
          var col=[grid[0][c],grid[1][c],grid[2][c],grid[3][c]];
          col = slideRow(col);
          for(r=0;r<4;r++) grid[r][c]=col[r];
        }
      } else if(dir==='down'){
        for(c=0;c<4;c++){
          var col=[grid[3][c],grid[2][c],grid[1][c],grid[0][c]];
          col = slideRow(col);
          for(r=0;r<4;r++) grid[3-r][c]=col[r];
        }
      }
      if(JSON.stringify(grid)!==before){
        spawnTile();
        scoreEl.textContent = score;
        bestEl.textContent = updateHigh('g2048', score, true);
      }
      render();
      checkOver();
    }

    function checkOver(){
      for(var r=0;r<4;r++) for(var c=0;c<4;c++){
        if(grid[r][c]===0) return;
        if(grid[r][c]===2048){ msgEl.textContent='You reached 2048!'; over=true; return; }
        if(c<3 && grid[r][c]===grid[r][c+1]) return;
        if(r<3 && grid[r][c]===grid[r+1][c]) return;
      }
      over = true;
      msgEl.textContent = 'No more moves — game over';
    }

    document.addEventListener('keydown', function(e){
      if(!document.getElementById('view-2048').classList.contains('active')) return;
      if(e.key==='ArrowUp') move('up');
      else if(e.key==='ArrowDown') move('down');
      else if(e.key==='ArrowLeft') move('left');
      else if(e.key==='ArrowRight') move('right');
      else return;
      e.preventDefault();
    });

    document.addEventListener('DOMContentLoaded', function(){
      document.getElementById('g2048-new-btn').addEventListener('click', function(){ confirmReset(new2048Game); });
      document.getElementById('g2048-up').addEventListener('click', function(){ move('up'); });
      document.getElementById('g2048-down').addEventListener('click', function(){ move('down'); });
      document.getElementById('g2048-left').addEventListener('click', function(){ move('left'); });
      document.getElementById('g2048-right').addEventListener('click', function(){ move('right'); });
    });
  })();
