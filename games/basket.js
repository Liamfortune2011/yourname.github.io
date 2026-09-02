window.extraGames=window.extraGames||{};window.extraGames.basket=function(){
  var a=setupCanvas('br-canvas',720,420),c=a[0],x=a[1],k=keysFor('basket');
  var W=720,H=420,FLOOR=H-40,mode='cpu',p1=0,p2=0,raf,over=false;
  var ball,pL,pR,grav,rest,jumpPow,hue;
  function reset(full){
    if(full){p1=0;p2=0;}
    over=false;
    grav=1500+Math.random()*600;rest=0.62+Math.random()*0.3;jumpPow=560+Math.random()*220;hue=Math.floor(Math.random()*360);
    ball={x:W/2,y:120,vx:(Math.random()<.5?-1:1)*(140+Math.random()*120),vy:0,r:13,prevY:120};
    pL={x:185,y:FLOOR-30,vy:0,r:24};pR={x:535,y:FLOOR-30,vy:0,r:24};
    by('br-p1').textContent=p1;by('br-p2').textContent=p2;
    by('br-msg').textContent='P1: W or tap left · '+(mode==='cpu'?'CPU':'P2: ↑ or tap right')+'. Physics shift each round.';
    if(raf)raf();raf=rafGame(loop);
  }
  function jump(p){if(p.y>=FLOOR-31){p.vy=-jumpPow;}}
  function checkHoop(hx){
    if(over)return;
    if(ball.prevY<150&&ball.y>=150&&Math.abs(ball.x-hx)<20&&ball.vy>0){
      if(hx<360)p2++;else p1++;
      by('br-p1').textContent=p1;by('br-p2').textContent=p2;
      var win=p1>=5||p2>=5;
      over=true;
      by('br-msg').textContent=win?(p1>p2?'🏆 P1 wins!':'🏆 P2 wins!'):((hx<360?'P2 scores!':'P1 scores!')+' Next round…');
      if(!win){setTimeout(function(){if(by('view-basket').classList.contains('active'))reset(false);},900);}
    }
  }
  function loop(dt){
    if(over){draw();return;}
    if(k.KeyW)jump(pL);
    if(mode==='2p'){if(k.ArrowUp)jump(pR);}
    else if(ball.x>430&&ball.y>180&&Math.random()<0.05)jump(pR);
    [pL,pR].forEach(function(p){p.vy+=grav*dt;p.y+=p.vy*dt;if(p.y>FLOOR-30){p.y=FLOOR-30;p.vy=0;}});
    ball.vy+=grav*dt;ball.prevY=ball.y;ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
    if(ball.x<ball.r){ball.x=ball.r;ball.vx=Math.abs(ball.vx)*rest;}
    if(ball.x>W-ball.r){ball.x=W-ball.r;ball.vx=-Math.abs(ball.vx)*rest;}
    if(ball.y>FLOOR-ball.r){ball.y=FLOOR-ball.r;ball.vy=-Math.abs(ball.vy)*rest;ball.vx*=0.97;}
    if(ball.y<ball.r){ball.y=ball.r;ball.vy=Math.abs(ball.vy)*rest;}
    [72,648].forEach(function(hx){
      var bx=hx<360?hx-26:hx+26;
      if(ball.x>bx-4&&ball.x<bx+4&&ball.y>118&&ball.y<172){ball.vx=(hx<360?Math.abs(ball.vx):-Math.abs(ball.vx))*rest;ball.x=bx+(hx<360?5:-5);}
    });
    [pL,pR].forEach(function(p){
      var dx=ball.x-p.x,dy=ball.y-(p.y-6),d=Math.hypot(dx,dy)||1;
      if(d<ball.r+p.r){var nx=dx/d,ny=dy/d,sp=Math.max(Math.hypot(ball.vx,ball.vy),300);ball.vx=nx*sp+ball.vx*0.1;ball.vy=ny*sp-60;ball.x=p.x+nx*(ball.r+p.r+1);ball.y=(p.y-6)+ny*(ball.r+p.r+1);}
    });
    checkHoop(72);checkHoop(648);
    if(Math.abs(ball.vx)<8&&Math.abs(ball.vy)<8&&ball.y>FLOOR-ball.r-2)ball.vx=(Math.random()<.5?-1:1)*200;
    draw();
  }
  function draw(){
    x.fillStyle='hsl('+hue+',45%,12%)';x.fillRect(0,0,W,H);
    x.fillStyle='hsl('+hue+',30%,22%)';x.fillRect(0,FLOOR,W,40);
    [72,648].forEach(function(hx){x.fillStyle='#e8e8e8';x.fillRect(hx<360?hx-30:hx+18,90,12,70);x.strokeStyle='#e8533a';x.lineWidth=4;x.beginPath();x.moveTo(hx-20,150);x.lineTo(hx+20,150);x.stroke();x.fillStyle='#c0392a';x.fillRect(hx-2,150,4,8);});
    function player(p,col){x.fillStyle=col;x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill();x.fillRect(p.x-10,p.y,20,30);}
    player(pL,'#4f9cf0');player(pR,'#f07050');
    x.fillStyle='#e8913a';x.beginPath();x.arc(ball.x,ball.y,ball.r,0,7);x.fill();x.strokeStyle='#9a5a1a';x.lineWidth=2;x.beginPath();x.arc(ball.x,ball.y,ball.r,0,7);x.stroke();x.beginPath();x.moveTo(ball.x-ball.r,ball.y);x.lineTo(ball.x+ball.r,ball.y);x.stroke();
  }
  c.addEventListener('click',function(e){var r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*W/r.width;if(mx<W/2)jump(pL);else jump(pR);});
  document.querySelectorAll('[data-br]').forEach(function(b){b.onclick=function(){mode=b.dataset.br;document.querySelectorAll('[data-br]').forEach(function(z){z.classList.toggle('active',z===b);});reset(true);};});
  by('br-new').onclick=function(){confirmReset(function(){reset(true);});};reset(true);
};
