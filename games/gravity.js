(function(){
window.extraGames=window.extraGames||{};
window.extraGames.gravity=function(){
function by(id){return document.getElementById(id)}
function setup(id,w,h){var c=by(id);if(!c)return null;c.width=w;c.height=h;return[c,c.getContext('2d')]}
function keys(){var k={};document.addEventListener('keydown',function(e){k[e.code]=true});document.addEventListener('keyup',function(e){k[e.code]=false});return k}
var a=setup('gravity-canvas',640,300);if(!a)return;var c=a[0],x=a[1],k=keys(),p,obs,score,best=0,grav,raf,last;
function stop(){if(raf){cancelAnimationFrame(raf);raf=0}}
function reset(){stop();p={x:90,y:140,vy:0};obs=[];score=0;grav=1;last=performance.now();by('grav-score').textContent=0;by('grav-msg').textContent='Space or click to flip gravity.';raf=requestAnimationFrame(loop)}
function flip(){grav*=-1;p.vy=grav*120}
function loop(t){var dt=Math.min(.035,(t-last)/1000);last=t;if(k.Space){k.Space=false;flip()}p.vy+=500*grav*dt;p.y+=p.vy*dt;score+=dt*10;if(Math.random()<dt*1.1)obs.push({x:650,y:grav>0?245:55,w:30,h:55});obs.forEach(function(o){o.x-=230*dt});obs=obs.filter(function(o){return o.x>-50});var crash=p.y<15||p.y>285||obs.some(function(o){return p.x+10>o.x&&p.x-10<o.x+o.w&&p.y+10>o.y&&p.y-10<o.y+o.h});if(crash){best=Math.max(best,Math.floor(score));by('grav-best').textContent=best;by('grav-msg').textContent='Crash! Score '+Math.floor(score);if(window.saveGameHubScore)window.saveGameHubScore('gravity',Math.floor(score));raf=0;return}by('grav-score').textContent=Math.floor(score);draw();raf=requestAnimationFrame(loop)}
function draw(){x.fillStyle='#172033';x.fillRect(0,0,640,300);x.fillStyle='#2f4d73';x.fillRect(0,0,640,12);x.fillRect(0,288,640,12);x.fillStyle='#d9534f';obs.forEach(function(o){x.fillRect(o.x,o.y,o.w,o.h)});x.fillStyle='#f2c94c';x.beginPath();x.arc(p.x,p.y,10,0,Math.PI*2);x.fill()}
c.onclick=flip;by('grav-new').onclick=reset;reset()};
})();
