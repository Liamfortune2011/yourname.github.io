/* 2048 */
(function(){
  var boardEl, scoreEl, bestEl, msgEl;
  var board = [], score = 0;
  window.new2048Game = function(){
    boardEl=document.getElementById('g2048-board'); scoreEl=document.getElementById('g2048-score-val'); bestEl=document.getElementById('g2048-best-val'); msgEl=document.getElementById('g2048-msg');
    board=Array.from({length:4},()=>Array(4).fill(0)); score=0; msgEl.textContent=''; spawnTile(); spawnTile(); render();
  };
  function spawnTile(){ var empty=[]; for(var r=0;r<4;r++)for(var c=0;c<4;c++)if(!board[r][c])empty.push([r,c]); if(!empty.length)return; var p=empty[Math.floor(Math.random()*empty.length)]; board[p[0]][p[1]]=Math.random()<.9?2:4; }
  function render(){ boardEl.innerHTML=''; for(var r=0;r<4;r++)for(var c=0;c<4;c++){var el=document.createElement('div'); el.className='tile'; el.dataset.v=board[r][c]; el.textContent=board[r][c]||''; boardEl.appendChild(el);} scoreEl.textContent=score; var best=updateHigh('2048',score,true); bestEl.textContent=best===null?'–':best; }
  function slideRow(row){ var a=row.filter(Boolean), out=[]; for(var i=0;i<a.length;i++){if(a[i]===a[i+1]){var v=a[i]*2;out.push(v);score+=v;i++;}else out.push(a[i]);} while(out.length<4)out.push(0); return out; }
  function move(dir){ var old=JSON.stringify(board); if(dir==='left')for(var r=0;r<4;r++)board[r]=slideRow(board[r]); if(dir==='right')for(var r=0;r<4;r++)board[r]=slideRow(board[r].reverse()).reverse(); if(dir==='up'||dir==='down'){for(var c=0;c<4;c++){var col=[];for(var r=0;r<4;r++)col.push(board[r][c]);if(dir==='down')col.reverse();col=slideRow(col);if(dir==='down')col.reverse();for(var r=0;r<4;r++)board[r][c]=col[r];}} if(JSON.stringify(board)!==old){spawnTile();render();} }
  document.addEventListener('keydown',function(e){if(!document.getElementById('view-2048')?.classList.contains('active'))return; var d={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[e.key];if(d){e.preventDefault();move(d);}});
  document.addEventListener('DOMContentLoaded',function(){var b=document.getElementById('g2048-new-btn');if(b)b.addEventListener('click',function(){confirmReset(function(){new2048Game();});});});
})();
