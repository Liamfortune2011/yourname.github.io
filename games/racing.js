(function(){
window.extraGames=window.extraGames||{};
function by(id){return document.getElementById(id)}
function setup(id,w,h){var c=by(id);if(!c)return[null,null];c.width=w;c.height=h;return[c,c.getContext('2d')]}
function keys(){var k={};document.addEventListener('keydown',function(e){var v=by('view-racing');if(!v||!v.classList.contains('active'))return;k[e.code]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyW','KeyA','KeyS','KeyD'].indexOf(e.code)>=0)e.preventDefault()});document.addEventListener('keyup',function(e){k[e.code]=false});return k}
window.extraGames.racing=function(){
var a=setup('racing-canvas',640,440),c=a[0],x=a[1],k=keys(),trackA,lane,lap,speed,time,done,raf,last,boost;
function stop(){if(raf){cancelAnimationFrame(raf);raf=0}}
function reset(){stop();trackA=-Math.PI/2;lane=0;lap=1;speed=0;time=0;done=false;boost=0;last=0;by('race-lap').textContent='1';by('race-time').textContent='0.0';by('racing-msg').textContent='WASD / arrows to drive · Left/right changes lane · Space boosts. You cannot reverse or leave the track.';raf=requestAnimationFrame(loop)}
function loop(now){if(!last)last=now;var dt=Math.min(.035,(now-last)/1000);last=now;if(done){draw();return}
var gas=k.ArrowUp||k.KeyW?1:0,brake=k.ArrowDown||k.KeyS?1:0,steer=(k.ArrowLeft||k.KeyA?-1:0)+(k.ArrowRight||k.KeyD?1:0);
if(gas)speed=Math.min(1.45,speed+1.7*dt);else speed=Math.max(.35,speed-0.35*dt);if(brake)speed=Math.max(.35,speed-1.3*dt);
if(k.Space&&boost<=0){boost=.8;k.Space=false}if(boost>0){boost-=dt;speed=Math.min(1.65,speed+.8*dt)}
lane+=steer*1.7*dt;lane=Math.max(-.72,Math.min(.72,lane));
var oldA=trackA;trackA+=speed*dt*0.95;time+=dt;if(trackA>=Math.PI*2*(lap-1)+Math.PI*1.5){lap++;if(lap<=3)by('race-lap').textContent=lap;else{done=true;by('race-lap').textContent='3';by('racing-msg').textContent='🏁 Finished 3 laps in '+time.toFixed(1)+' seconds!';if(window.saveGameHubScore)window.saveGameHubScore('racing',Math.max(0,Math.round(10000-time*100)));stop();draw();return}}
by('race-time').textContent=time.toFixed(1);draw();raf=requestAnimationFrame(loop)}
function draw(){var A=((trackA%(Math.PI*2))+Math.PI*2)%(Math.PI*2),cx=320,cy=220,rx=205+lane*34,ry=140+lane*22,px=cx+Math.cos(A)*rx,py=cy+Math.sin(A)*ry; x.fillStyle='#15221a';x.fillRect(0,0,640,440);x.fillStyle='#5b5145';x.fillRect(45,35,550,370);x.fillStyle='#20252a';x.beginPath();x.ellipse(cx,cy,250,180,0,0,Math.PI*2);x.fill();x.fillStyle='#15221a';x.beginPath();x.ellipse(cx,cy,155,95,0,0,Math.PI*2);x.fill();x.strokeStyle='#f4d35e';x.setLineDash([14,12]);x.lineWidth=3;x.beginPath();x.ellipse(cx,cy,205,140,0,0,Math.PI*2);x.stroke();x.setLineDash([]);x.fillStyle='#fff';x.fillRect(285,340,70,8);x.save();x.translate(px,py);x.rotate(A+Math.PI/2);x.fillStyle=boost>0?'#f7c948':'#4f8cff';x.fillRect(-16,-9,32,18);x.fillStyle='#111';x.fillRect(4,-6,8,12);x.restore()}
by('racing-new').onclick=function(){reset()};reset();
};})();
