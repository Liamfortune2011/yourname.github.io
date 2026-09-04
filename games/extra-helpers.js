(function(){
  window.extraGames=window.extraGames||{};
  window.by=window.by||function(id){return document.getElementById(id)};
  window.setupCanvas=window.setupCanvas||function(id,w,h){var c=window.by(id);if(!c)return [null,null];if(w)c.width=w;if(h)c.height=h;return [c,c.getContext('2d')]};
  window.keysFor=window.keysFor||function(view){var k={};document.addEventListener('keydown',function(e){var v=window.by('view-'+view);if(!v||!v.classList.contains('active'))return;k[e.code]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyW','KeyA','KeyS','KeyD','Enter','ShiftLeft','ShiftRight'].indexOf(e.code)>=0)e.preventDefault()});document.addEventListener('keyup',function(e){k[e.code]=false});return k};
  window.rafGame=window.rafGame||function(loop){var id=0,last=performance.now(),stopped=false;function f(t){if(stopped)return;var dt=Math.min(.035,(t-last)/1000);last=t;var result=loop(dt,t);if(result===false){stopped=true;return}id=requestAnimationFrame(f)}id=requestAnimationFrame(f);return function(){stopped=true;cancelAnimationFrame(id)}};
  window.confirmReset=window.confirmReset||function(fn){if(typeof fn==='function')fn()};

  var SB='https://gywrmkluncycfxeffypc.supabase.co';
  var KEY='sb_publishable_LI8-YNwApCJSVL2EkB7dzA_ZIBLxe3s';
  var aliases={racing:'top_down_racing',airhockey:'air_hockey',coinrush:'coin_rush',gravity:'gravity_switch',puzzle15:'15_puzzle',ninja:'ninja_run',basket:'basket_random',crossy:'crossy_road',paperio:'paper_io',snakeio:'snake_io',mario:'super_mario',subaway:'subaway_runners'};
  var lower={sudoku_easy:1,sudoku_medium:1,sudoku_hard:1,sudoku_extra:1,mines_easy:1,mines_medium:1,mines_hard:1,memory:1,reaction_test:1,wordle:1};
  var busy=false;
  function canon(id){return aliases[String(id)]||String(id)}
  function better(a,b,h){return h?a>b:a<b}
  function acct(){return !!(window.gameHubAccountCode||localStorage.getItem('gamehub_account_code'))}
  function code(){return window.gameHubAccountCode||localStorage.getItem('gamehub_account_code')}
  function pending(){try{return JSON.parse(localStorage.getItem('gamehub_pending_scores')||'[]')}catch(e){return[]}}
  function put(a){localStorage.setItem('gamehub_pending_scores',JSON.stringify(a.slice(-100)))}

  async function send(item){
    var id=canon(item.game_id),h=item.higherIsBetter!==false;
    var headers={apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json',Prefer:'return=minimal'};
    var q=SB+'/rest/v1/game_scores?account_code=eq.'+encodeURIComponent(item.account_code)+'&game_id=eq.'+encodeURIComponent(id)+'&select=account_code,game_id,score';
    var r=await fetch(q,{headers:{apikey:KEY,Authorization:'Bearer '+KEY}});
    if(!r.ok)throw Error('lookup '+r.status);
    var old=await r.json(),incoming=Number(item.score)||0,best=incoming;
    old.forEach(function(x){var n=Number(x.score)||0;if(!better(best,n,h))best=n});
    if(old.length){
      var u=await fetch(SB+'/rest/v1/game_scores?account_code=eq.'+encodeURIComponent(item.account_code)+'&game_id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:headers,body:JSON.stringify({score:best})});
      if(!u.ok)throw Error('update '+u.status);
    }else{
      var ins=await fetch(SB+'/rest/v1/game_scores',{method:'POST',headers:headers,body:JSON.stringify({account_code:item.account_code,game_id:id,score:best})});
      if(!ins.ok)throw Error('insert '+ins.status);
    }
  }
  async function flush(){
    if(busy||!acct())return;busy=true;
    try{while(true){var a=pending();if(!a.length)break;try{await send(a[0])}catch(e){localStorage.setItem('gamehub_score_sync_error',String(e.message||e));break}a.shift();put(a)}}finally{busy=false}
  }
  window.saveGameHubScore=function(id,score,higher){
    if(!acct())return;
    id=canon(id);score=Number(score);if(!Number.isFinite(score))return;
    var a=pending(),h=higher===undefined?!lower[id]:higher!==false,i=a.findIndex(function(x){return x.account_code===code()&&x.game_id===id});
    if(i>=0){if(better(score,Number(a[i].score)||0,h))a[i].score=score;a[i].higherIsBetter=h}else a.push({account_code:code(),game_id:id,score:score,higherIsBetter:h});
    put(a);flush();
  };

  var highsKey='gamehub_highs';
  window.getHigh=function(id){try{var a=JSON.parse(localStorage.getItem(highsKey)||'{}');return Number(a[canon(id)]||0)}catch(e){return 0}};
  window.updateHigh=function(id,value,higher){var n=Number(value)||0,k=canon(id),h=higher===undefined?!lower[k]:higher!==false,a;try{a=JSON.parse(localStorage.getItem(highsKey)||'{}')}catch(e){a={}}var old=Number(a[k]||0);if(!old||better(n,old,h)){a[k]=n;localStorage.setItem(highsKey,JSON.stringify(a));window.saveGameHubScore(k,n,h);return n}window.saveGameHubScore(k,old,h);return old};

  var done={};
  function once(k,s,h){if(!Number.isFinite(s)||s<0)return;var key=k+':'+s;if(done[key])return;done[key]=1;window.saveGameHubScore(k,s,h)}
  function text(id){var e=window.by(id);return e?(e.textContent||''):''}
  function snakeKey(){var b=document.querySelector('.snake-speed-btn.active');var s=b?Number(b.dataset.speed):110;return ({170:'snake_slow',110:'snake_medium',70:'snake_fast',40:'snake_extreme'})[s]||'snake_medium'}
  function check(){
    if(!acct())return;
    var m=text('racing-msg');if(text('race-lap')==='3'&&m.indexOf('Finished')>=0){var t=parseFloat(text('race-time'));if(Number.isFinite(t))once('racing',Math.max(0,Math.round(10000-t*100)),true)}
    if(/game over|you win/i.test(text('tet-msg')))once('tetris',parseFloat(text('tet-score'))||0,true);
    if(/wins/i.test(text('air-msg')))once('airhockey',parseFloat(text('air-p1'))||0,true);
    if(Number(text('coin-time'))<=0||/time/i.test(text('coin-msg')))once('coinrush',parseFloat(text('coin-score'))||0,true);
    if(/correct/i.test(text('det-msg')))once('detective',1,true);
    if(/respawned/i.test(text('climb-msg')))once('climb',parseFloat(text('climb-best'))||0,true);
    if(/hit/i.test(text('dodge-msg')))once('dodge',parseFloat(text('dodge-best'))||0,true);
    if(/crash/i.test(text('grav-msg')))once('gravity',parseFloat(text('grav-best'))||0,true);
    if(/run ended/i.test(text('ninja-msg')))once('ninja',parseFloat(text('ninja-best'))||0,true);
    if(/wins/i.test(text('br-msg')))once('basket',parseFloat(text('br-p1'))||0,true);
    if(/score/i.test(text('cr-msg')))once('crossy',parseFloat(text('cr-score'))||0,true);
    if(/cut off/i.test(text('pi-msg')))once('paperio',parseFloat(text('pi-best'))||0,true);
    if(/crashed/i.test(text('si-msg')))once('snakeio',parseFloat(text('si-len'))||0,true);
    if(/beat all|game over|time up/i.test(text('sm-msg')))once('mario',parseFloat(text('sm-coins'))||0,true);
    if(/run over|game over/i.test(text('sr-msg')))once('subaway',parseFloat(text('sr-score'))||0,true);
    if(/game over/i.test(text('snake-msg'))){var s=parseFloat(text('snake-score-val'));if(Number.isFinite(s))once(snakeKey(),s,true)}
    flush();
  }
  setInterval(check,1000);
  window.addEventListener('online',flush);
})();
