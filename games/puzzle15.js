(function(){
window.extraGames=window.extraGames||{};
window.extraGames.puzzle15=function(){var board=by('p15-board'),tiles,empty,moves,start,timer;
function by(id){return document.getElementById(id)}
function reset(){tiles=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];empty=15;moves=0;start=Date.now();by('p15-msg').textContent='';for(var n=0;n<200;n++){var ns=neighbors(empty),q=ns[Math.floor(Math.random()*ns.length)];[tiles[empty],tiles[q]]=[tiles[q],tiles[empty]];empty=q}render()}
function neighbors(i){var r=Math.floor(i/4),c=i%4,a=[];if(r)a.push(i-4);if(r<3)a.push(i+4);if(c)a.push(i-1);if(c<3)a.push(i+1);return a}
function solved(){for(var i=0;i<15;i++)if(tiles[i]!==i+1)return false;return true}
function render(){board.innerHTML='';tiles.forEach(function(v,i){var b=document.createElement('button');b.textContent=v||'';b.className='p15-tile';b.disabled=!v;b.onclick=function(){if(neighbors(empty).indexOf(i)<0)return;[tiles[empty],tiles[i]]=[tiles[i],tiles[empty]];empty=i;moves++;by('p15-moves').textContent=moves;render();if(solved()){var seconds=Math.floor((Date.now()-start)/1000);by('p15-msg').textContent='Solved in '+moves+' moves!';if(window.saveGameHubScore)window.saveGameHubScore('puzzle15',Math.max(0,100000-moves*1000-seconds*100))}};board.appendChild(b)});by('p15-moves').textContent=moves;by('p15-time').textContent=Math.floor((Date.now()-start)/1000)}
if(timer)clearInterval(timer);timer=setInterval(function(){var v=by('view-puzzle15');if(v&&v.classList.contains('active')&&start)by('p15-time').textContent=Math.floor((Date.now()-start)/1000)},500);by('p15-new').onclick=reset;reset()};
})();
