(function(){
  window.extraGames=window.extraGames||{};
  function by(id){return document.getElementById(id)}
  function setupCanvas(id,w,h){var c=by(id);if(!c)return [null,null];c.width=w;c.height=h;return[c,c.getContext('2d')]}
  function keysFor(view){var k={};document.addEventListener('keydown',function(e){var v=by('view-'+view);if(!v||!v.classList.contains('active'))return;k[e.code]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyW','KeyA','KeyS','KeyD'].indexOf(e.code)>=0)e.preventDefault()});document.addEventListener('keyup',function(e){k[e.code]=false});return k}
  window.extraGames.climb=function(){
    var a=setupCanvas('climb-canvas',640,440),c=a[0],x=a[1],k=keysFor('climb'),p,plats,cam,best=0,raf=0;
    function makePlatforms(){
      plats=[];
      for(var i=0;i<24;i++){
        var prev=plats[i-1];
        var px=i===0?257:Math.max(35,Math.min(480,prev.x+(Math.random()*160-80)));
        plats.push({x:px,y:400-i*54,w:145,h:12});
      }
    }
    function reset(){
      if(raf){cancelAnimationFrame(raf);raf=0}
      loop.last=performance.now();cam=0;makePlatforms();
      p={x:320,y:382,vx:0,vy:0,on:true};best=0;
      by('climb-height').textContent=0;by('climb-best').textContent=0;
      by('climb-msg').textContent='A/D or arrows to move · Space/W to jump';
      raf=requestAnimationFrame(loop);
    }
    function respawn(){
      makePlatforms();cam=0;p={x:320,y:382,vx:0,vy:0,on:true};
      by('climb-msg').textContent='Respawned on the starting platform. Keep climbing!';
    }
    function loop(t){
      var dt=Math.min(.035,(t-(loop.last||t))/1000);loop.last=t;
      var dx=(k.KeyD||k.ArrowRight?1:0)-(k.KeyA||k.ArrowLeft?1:0);
      p.vx+=dx*950*dt;p.vx*=.84;p.vx=Math.max(-280,Math.min(280,p.vx));
      p.vy+=1050*dt;
      if((k.Space||k.KeyW||k.ArrowUp)&&p.on){p.vy=-720;p.on=false;k.Space=false;k.KeyW=false;k.ArrowUp=false}
      p.x=Math.max(8,Math.min(632,p.x+p.vx*dt));
      var oldBottom=p.y+18;p.y+=p.vy*dt;p.on=false;
      plats.forEach(function(q){if(p.vy>=0&&p.x+10>q.x&&p.x-10<q.x+q.w&&oldBottom<=q.y+3&&p.y+18>=q.y){p.y=q.y-18;p.vy=0;p.on=true}});
      if(p.y<165){var d=165-p.y;p.y=165;cam+=d;plats.forEach(function(q){q.y+=d})}
      var h=Math.max(0,Math.round(cam/8));best=Math.max(best,h);
      by('climb-height').textContent=h;by('climb-best').textContent=best;
      if(p.y>445){if(window.saveGameHubScore)window.saveGameHubScore('climb',best);respawn()}
      draw();raf=requestAnimationFrame(loop);
    }
    function draw(){
      x.fillStyle='#0e1726';x.fillRect(0,0,640,440);
      x.fillStyle='#5b8def';plats.forEach(function(q){if(q.y>-20&&q.y<440)x.fillRect(q.x,q.y,q.w,q.h)});
      x.fillStyle='#f2c94c';x.fillRect(p.x-9,p.y,18,18);
    }
    by('climb-new').onclick=function(){reset()};reset();
  };
})();
