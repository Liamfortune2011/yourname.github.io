(function(){
window.extraGames=window.extraGames||{};
window.extraGames.ninja=function(){
function by(id){return document.getElementById(id)}
function setup(id,w,h){var c=by(id);if(!c)return null;c.width=w;c.height=h;return[c,c.getContext('2d')]}
function keys(){var k={};document.addEventListener('keydown',function(e){var v=by('view-ninja');if(!v||!v.classList.contains('active'))return;k[e.code]=true;if(['Space','ArrowUp','KeyW'].indexOf(e.code)>=0)e.preventDefault()});document.addEventListener('keyup',function(e){k[e.code]=false});return k}
var a=setup('ninja-canvas',640,300);if(!a)return;var c=a[0],x=a[1],k=keys(),p,obs,score,best=0,raf=0,vy=0,ground=true,last=0,spawnGap=2.1,dead=false,startShield=1.2;
function stop(){if(raf){cancelAnimationFrame(raf);raf=0}}
function reset(){stop();p={x:90,y:245};vy=0;ground=true;obs=[];score=0;spawnGap=2.1;startShield=1.2;dead=false;last=performance.now();by('ninja-score').textContent='0';by('ninja-best').textContent=best;by('ninja-msg').textContent='Space, W, ↑, or click to jump. New run starts at 0 score.';raf=requestAnimationFrame(loop)}
function jump(){if(!dead&&ground){vy=-460;ground=false}}
function spawn(){var lastX=obs.length?obs[obs.length-1].x:640;if(lastX<470)return;obs.push({x:660,w:18+Math.random()*22,h:22+Math.random()*30})}
function loop(t){var dt=Math.min(.035,(t-last)/1000);last=t;if(dead){draw();return}if(startShield>0)startShield-=dt;if(k.Space||k.KeyW||k.ArrowUp){k.Space=false;k.KeyW=false;k.ArrowUp=false;jump()}spawnGap-=dt;if(spawnGap<=0){spawn();spawnGap=Math.max(1.15,1.8-score/1100)+Math.random()*.55}var speed=205+score*.35;vy+=950*dt;p.y+=vy*dt;if(p.y>=245){p.y=245;vy=0;ground=true}obs.forEach(function(o){o.x-=speed*dt});obs=obs.filter(function(o){return o.x>-60});score+=dt*10;var hit=startShield<=0&&obs.some(function(o){return 90+16>o.x&&90-16<o.x+o.w&&p.y+20>265-o.h});if(hit){dead=true;best=Math.max(best,Math.floor(score));by('ninja-best').textContent=best;by('ninja-msg').textContent='Run ended at '+Math.floor(score)+'. Press New run to start at 0.';if(window.saveGameHubScore)window.saveGameHubScore('ninja',best);stop();draw();return}by('ninja-score').textContent=Math.floor(score);draw();raf=requestAnimationFrame(loop)}
function draw(){x.fillStyle='#dfe8f0';x.fillRect(0,0,640,300);x.fillStyle='#2e3a46';x.fillRect(0,265,640,35);x.fillStyle='#111';x.fillRect(80,p.y,20,20);x.fillStyle='#d9534f';obs.forEach(function(o){x.fillRect(o.x,265-o.h,o.w,o.h)});if(dead){x.fillStyle='rgba(0,0,0,.45)';x.fillRect(0,0,640,300);x.fillStyle='#fff';x.font='bold 24px sans-serif';x.textAlign='center';x.fillText('Game Over',320,145)}}
c.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();jump()});by('ninja-new').onclick=function(e){e.preventDefault();e.stopPropagation();reset()};reset();
};
})();
