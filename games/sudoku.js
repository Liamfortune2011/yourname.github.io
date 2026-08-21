/* ============ SUDOKU ============ */
  (function(){
    function emptyGrid(){ var g=[]; for(var i=0;i<9;i++) g.push(new Array(9).fill(0)); return g; }
    function shuffled(arr){ arr=arr.slice(); for(var i=arr.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=arr[i]; arr[i]=arr[j]; arr[j]=t;} return arr; }
    function valid(g,r,c,v){
      for(var i=0;i<9;i++){ if(g[r][i]===v || g[i][c]===v) return false; }
      var br=Math.floor(r/3)*3, bc=Math.floor(c/3)*3;
      for(var i=0;i<3;i++) for(var j=0;j<3;j++) if(g[br+i][bc+j]===v) return false;
      return true;
    }
    function fillGrid(g,pos){
      if(pos===81) return true;
      var r=Math.floor(pos/9), c=pos%9;
      var nums=shuffled([1,2,3,4,5,6,7,8,9]);
      for(var i=0;i<9;i++){
        var v=nums[i];
        if(valid(g,r,c,v)){
          g[r][c]=v;
          if(fillGrid(g,pos+1)) return true;
          g[r][c]=0;
        }
      }
      return false;
    }
    function makeSolved(){ var g=emptyGrid(); fillGrid(g,0); return g; }
    var diffRemove={ easy:36, medium:46, hard:52, xtra:58 };
    function makePuzzle(solution, removeCount){
      var puzzle=solution.map(function(row){ return row.slice(); });
      var cells=[]; for(var r=0;r<9;r++) for(var c=0;c<9;c++) cells.push([r,c]);
      cells=shuffled(cells);
      for(var i=0;i<removeCount;i++){ var rc=cells[i]; puzzle[rc[0]][rc[1]]=0; }
      return puzzle;
    }
    var solution=null, puzzle=null, currentDiff='easy';
    var boardEl, statusEl, timeEl, bestEl;
    var elapsed = 0, timerInterval = null, solved = false;
    function formatTime(s){
      var m = Math.floor(s/60), sec = s%60;
      return m + ':' + (sec<10 ? '0' : '') + sec;
    }
    function renderBoard(){
      boardEl.innerHTML='';
      for(var r=0;r<9;r++){
        for(var c=0;c<9;c++){
          var cell=document.createElement('div');
          cell.className='sudoku-cell';
          var givenVal=puzzle[r][c];
          var thin='0.5px solid var(--card-border)';
          var thick='2px solid var(--app-text)';
          cell.style.borderTop = (r%3===0)?thick:thin;
          cell.style.borderLeft = (c%3===0)?thick:thin;
          cell.style.borderBottom = (r===8)?thick:thin;
          cell.style.borderRight = (c===8)?thick:thin;
          if(givenVal!==0){
            cell.textContent=givenVal;
            cell.classList.add('given');
          } else {
            var input=document.createElement('input');
            input.type='text'; input.maxLength=1; input.inputMode='numeric';
            input.dataset.r=r; input.dataset.c=c;
            input.addEventListener('input', function(e){
              var v=e.target.value.replace(/[^1-9]/g,'');
              e.target.value=v.slice(-1);
              e.target.classList.remove('correct','wrong');
              e.target.style.background='transparent';
              statusEl.textContent='';
            });
            cell.appendChild(input);
          }
          boardEl.appendChild(cell);
        }
      }
    }
    window.newPuzzle = function(diff){
      currentDiff=diff;
      document.querySelectorAll('.diff-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.diff===diff); });
      solution=makeSolved(); puzzle=makePuzzle(solution, diffRemove[diff]);
      statusEl.textContent=''; solved=false; elapsed=0; timeEl.textContent='0:00';
      var best=getHigh('sudoku_'+diff); bestEl.textContent=best===null?'–':formatTime(best);
      if(timerInterval) clearInterval(timerInterval);
      timerInterval=setInterval(function(){ if(solved) return; elapsed++; timeEl.textContent=formatTime(elapsed); },1000);
      renderBoard();
    };
    function checkBoard(){
      var inputs=boardEl.querySelectorAll('input'); var correct=0, wrong=0, empty=0;
      inputs.forEach(function(input){
        var r=+input.dataset.r,c=+input.dataset.c,val=input.value;
        input.classList.remove('correct','wrong');
        if(!val){ empty++; return; }
        if(+val===solution[r][c]){ correct++; input.classList.add('correct'); }
        else { wrong++; input.classList.add('wrong'); }
      });
      if(wrong===0&&empty===0){
        statusEl.textContent='Solved! Nice work.'; statusEl.style.color='#27500a';
        if(!solved){ solved=true; clearInterval(timerInterval); var best=updateHigh('sudoku_'+currentDiff,elapsed,false); bestEl.textContent=formatTime(best); }
      } else { statusEl.textContent=correct+' correct, '+wrong+' wrong, '+empty+' empty'; statusEl.style.color='var(--muted)'; }
    }
    document.addEventListener('DOMContentLoaded',function(){
      boardEl=document.getElementById('board'); statusEl=document.getElementById('status-msg'); timeEl=document.getElementById('sudoku-time-val'); bestEl=document.getElementById('sudoku-best-val');
      document.querySelectorAll('.diff-btn').forEach(function(b){ b.addEventListener('click',function(){newPuzzle(b.dataset.diff);}); });
      document.getElementById('check-btn').addEventListener('click',checkBoard);
      document.getElementById('new-btn').addEventListener('click',function(){confirmReset(function(){newPuzzle(currentDiff);});});
    });
  })();
