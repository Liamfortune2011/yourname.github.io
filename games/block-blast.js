/* ============ BLOCK BLAST ============ */
  (function(){
    var boardEl, slotsEl, scoreEl, msgEl, bestEl;
    var size = 8, grid, score, selectedSlot, slots;
    var colors = ['#db5a3c','#e8c86e','#6fae4a','#4a6fa5','#9b6fae','#e07a5f'];
    var shapes = [
      [[0,0]],
      [[0,0],[0,1]],
      [[0,0],[1,0]],
      [[0,0],[0,1],[0,2]],
      [[0,0],[1,0],[2,0]],
      [[0,0],[1,0],[1,1]],
      [[0,0],[0,1],[1,0]],
      [[0,0],[0,1],[1,1]],
      [[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[0,2],[0,3]],
      [[0,0],[1,0],[2,0],[3,0]],
      [[0,0],[0,1],[1,0],[1,1]],
      [[0,0],[0,1],[0,2],[1,1]],
      [[0,1],[0,2],[1,0],[1,1]],
      [[0,0],[0,1],[1,1],[1,2]],
      [[0,0],[1,0],[2,0],[2,1]],
      [[0,1],[1,1],[2,1],[2,0]],
      [[0,1],[1,0],[1,1],[1,2],[2,1]]
    ];

    window.newBlastGame = function(){
      boardEl = document.getElementById('blast-board');
      slotsEl = document.getElementById('blast-slots');
      scoreEl = document.getElementById('blast-score-val');
      msgEl = document.getElementById('blast-msg');
      bestEl = document.getElementById('blast-best-val');
      grid = [];
      for(var r=0;r<size;r++) grid.push(new Array(size).fill(null));
      score = 0;
      selectedSlot = null;
      scoreEl.textContent = 0;
      bestEl.textContent = getHigh('blast') || 0;
      msgEl.textContent = '';
      fillSlots();
      renderBoard();
      renderSlots();
    };

    function randomPiece(){
      var shape = shapes[Math.floor(Math.random()*shapes.length)];
      var color = colors[Math.floor(Math.random()*colors.length)];
      return { shape: shape, color: color };
    }

    function fillSlots(){
      slots = [randomPiece(), randomPiece(), randomPiece()];
    }

    function renderBoard(){
      boardEl.innerHTML = '';
      ghostCells = [];
      for(var r=0;r<size;r++){
        for(var c=0;c<size;c++){
          var cell = document.createElement('div');
          cell.className = 'blast-cell' + (grid[r][c] ? ' filled' : '');
          if(grid[r][c]) cell.style.setProperty('--fill-color', grid[r][c]);
          cell.dataset.r = r; cell.dataset.c = c;
          cell.addEventListener('click', function(e){
            onCellClick(+e.currentTarget.dataset.r, +e.currentTarget.dataset.c);
          });
          cell.addEventListener('mouseenter', function(e){
            onCellHover(+e.currentTarget.dataset.r, +e.currentTarget.dataset.c);
          });
          cell.addEventListener('mouseleave', clearGhost);
          boardEl.appendChild(cell);
        }
      }
    }

    var ghostCells = [];
    function clearGhost(){
      ghostCells.forEach(function(idx){
        var el = boardEl.children[idx];
        if(!el) return;
        el.classList.remove('ghost', 'ghost-invalid');
        el.style.removeProperty('--fill-color');
        if(grid[Math.floor(idx/size)][idx%size]) el.style.setProperty('--fill-color', grid[Math.floor(idx/size)][idx%size]);
      });
      ghostCells = [];
    }

    function onCellHover(r0, c0){
      clearGhost();
      if(selectedSlot===null) return;
      var piece = slots[selectedSlot];
      if(!piece) return;
      var valid = canPlace(piece.shape, r0, c0);
      piece.shape.forEach(function(p){
        var r = r0+p[0], c = c0+p[1];
        if(r>=0 && r<size && c>=0 && c<size){
          var idx = r*size+c;
          var el = boardEl.children[idx];
          if(!el) return;
          if(valid){
            el.classList.add('ghost');
            el.style.setProperty('--fill-color', piece.color);
          } else if(!grid[r][c]){
            el.classList.add('ghost-invalid');
          }
          ghostCells.push(idx);
        }
      });
    }

    function renderSlots(){
      slotsEl.innerHTML = '';
      slots.forEach(function(piece, idx){
        var wrap = document.createElement('div');
        if(!piece){ wrap.className = 'blast-slot empty'; slotsEl.appendChild(wrap); return; }
        var maxR = Math.max.apply(null, piece.shape.map(function(p){ return p[0]; })) + 1;
        var maxC = Math.max.apply(null, piece.shape.map(function(p){ return p[1]; })) + 1;
        wrap.className = 'blast-slot' + (selectedSlot===idx ? ' selected' : '');
        wrap.style.gridTemplateColumns = 'repeat(' + maxC + ', 14px)';
        wrap.style.gridTemplateRows = 'repeat(' + maxR + ', 14px)';
        for(var r=0;r<maxR;r++){
          for(var c=0;c<maxC;c++){
            var on = piece.shape.some(function(p){ return p[0]===r && p[1]===c; });
            var pc = document.createElement('div');
            pc.className = 'blast-piece-cell' + (on ? ' on' : '');
            if(on) pc.style.setProperty('--fill-color', piece.color);
            wrap.appendChild(pc);
          }
        }
        wrap.addEventListener('click', function(){
          selectedSlot = (selectedSlot===idx) ? null : idx;
          msgEl.textContent = '';
          renderSlots();
        });
        slotsEl.appendChild(wrap);
      });
    }

    function canPlace(shape, r0, c0){
      return shape.every(function(p){
        var r = r0+p[0], c = c0+p[1];
        return r>=0 && r<size && c>=0 && c<size && !grid[r][c];
      });
    }

    function onCellClick(r0, c0){
      if(selectedSlot===null) { msgEl.textContent = 'Pick a piece below first'; return; }
      var piece = slots[selectedSlot];
      if(!canPlace(piece.shape, r0, c0)){ msgEl.textContent = "Doesn't fit there"; return; }
      piece.shape.forEach(function(p){ grid[r0+p[0]][c0+p[1]] = piece.color; });
      score += piece.shape.length;
      slots[selectedSlot] = null;
      selectedSlot = null;
      msgEl.textContent = '';
      var cleared = clearLines();
      score += cleared * 10;
      scoreEl.textContent = score;
      bestEl.textContent = updateHigh('blast', score, true);
      if(slots.every(function(s){ return !s; })) fillSlots();
      renderBoard();
      renderSlots();
      checkGameOver();
    }

    function clearLines(){
      var fullRows = [], fullCols = [];
      for(var r=0;r<size;r++) if(grid[r].every(function(v){ return v; })) fullRows.push(r);
      for(var c=0;c<size;c++){
        var full = true;
        for(var r=0;r<size;r++) if(!grid[r][c]) { full=false; break; }
        if(full) fullCols.push(c);
      }
      fullRows.forEach(function(r){ for(var c=0;c<size;c++) grid[r][c]=null; });
      fullCols.forEach(function(c){ for(var r=0;r<size;r++) grid[r][c]=null; });
      return fullRows.length + fullCols.length;
    }

    function checkGameOver(){
      var anyFit = slots.some(function(piece){
        if(!piece) return false;
        for(var r=0;r<size;r++) for(var c=0;c<size;c++) if(canPlace(piece.shape, r, c)) return true;
        return false;
      });
      if(!anyFit){
        msgEl.textContent = 'No moves left — final score: ' + score;
      }
    }

    document.addEventListener('DOMContentLoaded', function(){
      document.getElementById('blast-new-btn').addEventListener('click', function(){ confirmReset(newBlastGame); });
    });
  })();
