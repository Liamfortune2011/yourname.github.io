(function(){
window.extraGames=window.extraGames||{};
window.extraGames.puzzle15=function(){
var board=by('p15-board'),tiles,empty,moves,start,timer,finished=false;
function by(id){return document.getElementById(id)}
function reset(){tiles=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];empty=15;moves=0;finished=false;start=Date.now();by('p15-msg').textContent='Click a tile next to the empty space, or a tile in the same row/column.';for(var n=0;n<300;n++){var ns=neighbors(empty),q=ns[Math.floor(Math.random()*ns.length)];[tiles[empty],tiles[q]]=[tiles[q],tiles[empty]];empty=q}render()}
function neighbors(i){var r=Math.floor(i/4),c=i%4,a=[];if(r)a.push(i-4);if(r<3)a.push(i+4);if(c)a.push(i-1);if(c<3)a.push(i+1);return a}
function canSlide(i){var er=Math.floor(empty/4),ec=empty%4,r=Math.floor(i/4),c=i%4;return r===er||c===ec}
function slide(i){if(finished||tiles[i]===0||!canSlide(i))return false;var from=i,to=empty,moving=tiles[from],step;if(Math.floor(from/4)===Math.floor(to/4)){step=from<to?1:-1;for(var p=from;p!==to;p+=step)tiles[p]=tiles[p+step]}else{step=from<to?4:-4;for(var q=from;q!==to;q+=step)tiles[q]=tiles[q+step]}tiles[to]=moving;empty=from;moves++;return true}
function solved(){for(var i=0;i<15;i++)if(tiles[i]!==i+1)return false;return true}
function render(){board.innerHTML='';tiles.forEach(function(v,i){var b=document.createElement('button');b.textContent=v||'';b.className='p15-tile';b.disabled=!v;b.onclick=function(){if(!slide(i))return;render();if(solved()){finished=true;var seconds=Math.floor((Date.now()-start)/1000);by('p15-msg').textContent='Solved in '+moves+' moves! Time: '+seconds+'s';if(window.saveGameHubScore)window.saveGameHubScore('puzzle15',Math.max(0,100000-moves*1000-seconds*100))}};board.appendChild(b)});by('p15-moves').textContent=moves;by('p15-time').textContent=Math.floor((Date.now()-start)/1000)}
if(timer)clearInterval(timer);timer=setInterval(function(){var v=by('view-puzzle15');if(v&&v.classList.contains('active')&&start&&!finished)by('p15-time').textContent=Math.floor((Date.now()-start)/1000)},500);by('p15-new').onclick=reset;reset()};
})();
