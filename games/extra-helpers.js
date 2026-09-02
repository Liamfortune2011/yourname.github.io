(function(){
  window.extraGames=window.extraGames||{};
  window.by=window.by||function(id){return document.getElementById(id)};
  window.setupCanvas=window.setupCanvas||function(id,w,h){var c=window.by(id);if(!c)return [null,null];if(w)c.width=w;if(h)c.height=h;return [c,c.getContext('2d')]};
  window.keysFor=window.keysFor||function(view){var k={};document.addEventListener('keydown',function(e){var v=window.by('view-'+view);if(!v||!v.classList.contains('active'))return;k[e.code]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyW','KeyA','KeyS','KeyD','Enter','ShiftLeft','ShiftRight'].indexOf(e.code)>=0)e.preventDefault()});document.addEventListener('keyup',function(e){k[e.code]=false});return k};
  window.rafGame=window.rafGame||function(loop){var id=0,last=performance.now(),stopped=false;function f(t){if(stopped)return;var dt=Math.min(.035,(t-last)/1000);last=t;var result=loop(dt,t);if(result===false){stopped=true;return}id=requestAnimationFrame(f)}id=requestAnimationFrame(f);return function(){stopped=true;cancelAnimationFrame(id)}};
  window.confirmReset=window.confirmReset||function(fn){if(typeof fn==='function')fn()};
})();
