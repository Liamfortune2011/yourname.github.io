(function(){
  const SUPABASE_URL='https://gywrmkluncycfxeffypc.supabase.co';
  const SUPABASE_KEY='sb_publishable_LI8-YNwApCJSVL2EkB7dzA_ZIBLxe3s';
  const ACCOUNT_NAMES={'021911':'Force Fortune','072211':'kaley','020911':'Lukw'};

  function captureAccount(){
    const input=document.getElementById('lock-input');
    const code=(input&&input.value||'').trim();
    if(ACCOUNT_NAMES[code]){
      window.gameHubAccountCode=code;
      window.gameHubAccountUsername=ACCOUNT_NAMES[code];
      localStorage.setItem('gamehub_account_code',code);
      localStorage.setItem('gamehub_account_username',ACCOUNT_NAMES[code]);
    }
  }
  function restoreAccount(){
    if(window.gameHubAccountCode&&window.gameHubAccountUsername)return;
    const code=localStorage.getItem('gamehub_account_code');
    const name=localStorage.getItem('gamehub_account_username');
    if(code&&name){window.gameHubAccountCode=code;window.gameHubAccountUsername=name;return;}
    captureAccount();
  }
  document.addEventListener('click',e=>{if(e.target&&e.target.id==='lock-submit')captureAccount();},true);
  document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='lock-input')captureAccount();},true);

  const scoreIds={
    sudoku_easy:'sudoku_easy',sudoku_medium:'sudoku_medium',sudoku_hard:'sudoku_hard',sudoku_xtra:'sudoku_extra',
    mines_easy:'mines_easy',mines_medium:'mines_medium',mines_hard:'mines_hard',
    ttt:'tic_tac_toe',c4:'connect_four',simon:'simon_says',blast:'block_blast',cookie:'cookie_clicker',
    memory:'memory',mem:'memory',snake:'snake',g2048:'2048','2048':'2048',breakout:'breakout',wordle:'wordle',tag:'tag',
    whack:'whack_a_mole',pong:'pong',reaction:'reaction_test',racing:'top_down_racing',archer:'archer_duel',
    zombie:'zombie_survival',arena:'arena_battle',tetris:'tetris',asteroids:'asteroids',airhockey:'air_hockey',
    coinrush:'coin_rush',detective:'detective',target:'target_practice',climb:'climb',dodge:'dodge',gravity:'gravity_switch',
    puzzle15:'15_puzzle',bomb:'bomb_defusal',ninja:'ninja_run',basket:'basket_random',crossy:'crossy_road',bitlife:'bitlife',
    bowmasters:'bowmasters',paperio:'paper_io',snakeio:'snake_io',skyline:'subaway_runners',mario:'super_mario',fps:'fps_arena'
  };

  function queueScore(key,value){
    restoreAccount();
    if(!window.gameHubAccountUsername||!window.gameHubAccountCode)return;
    const score=Number(value);
    if(!Number.isFinite(score))return;
    const payload={account_code:window.gameHubAccountUsername,game_id:scoreIds[key]||key,score:score};
    let pending=[];
    try{pending=JSON.parse(localStorage.getItem('gamehub_pending_scores')||'[]');}catch(e){}
    pending.push(payload);
    localStorage.setItem('gamehub_pending_scores',JSON.stringify(pending.slice(-100)));
    flushScores();
  }
  async function flushScores(){
    if(window.gameHubScoreSyncing)return;
    restoreAccount();
    window.gameHubScoreSyncing=true;
    try{
      let pending=[];
      try{pending=JSON.parse(localStorage.getItem('gamehub_pending_scores')||'[]');}catch(e){pending=[];}
      while(pending.length){
        const r=await fetch(SUPABASE_URL+'/rest/v1/game_scores',{
          method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},
          body:JSON.stringify(pending[0])
        });
        if(!r.ok)throw Error('score save '+r.status);
        pending.shift();
        localStorage.setItem('gamehub_pending_scores',JSON.stringify(pending));
      }
    }catch(e){}finally{window.gameHubScoreSyncing=false;}
  }
  window.saveGameHubScore=queueScore;
  window.addEventListener('online',flushScores);

  function installScoreHook(){
    if(typeof window.updateHigh!=='function')return false;
    if(window.updateHigh.__gameHubScoreHook)return true;
    const original=window.updateHigh;
    function hooked(key,value,higherIsBetter){
      const result=original.apply(this,arguments);
      queueScore(key,value);
      return result;
    }
    hooked.__gameHubScoreHook=true;
    hooked.__gameHubOriginal=original;
    window.updateHigh=hooked;
    return true;
  }
  const hookTimer=setInterval(()=>{if(installScoreHook())clearInterval(hookTimer);},50);
  document.addEventListener('DOMContentLoaded',()=>{restoreAccount();installScoreHook();flushScores();});

  const css=`#lb-btn{position:fixed;top:14px;left:14px;z-index:9999;padding:9px 11px;border-radius:999px;font-size:18px}#lb-modal{display:none;position:fixed;inset:0;z-index:9998;background:#0007;align-items:center;justify-content:center;padding:16px}#lb-modal.open{display:flex}.lb-box{background:var(--card-bg,#fff);color:var(--app-text,#222);border-radius:14px;padding:20px;width:min(94vw,760px);max-height:88vh;overflow:auto}.lb-head{display:flex;justify-content:space-between;align-items:center;gap:12px}.lb-games{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:14px}.lb-game-btn{width:100%;text-align:left}.lb-game-btn.selected{background:var(--app-text);color:var(--app-bg);border-color:var(--app-text)}.lb-types{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.lb-type-btn.selected{background:var(--app-text);color:var(--app-bg);border-color:var(--app-text)}.lb-results{border:1px solid var(--card-border,#ccc);border-radius:10px;padding:12px}.lb-row{display:grid;grid-template-columns:36px 1fr auto;gap:8px;padding:8px 0;border-top:1px solid var(--card-border,#ddd);font-size:13px}.lb-row:first-child{border-top:0}.lb-score{font-weight:700}.lb-empty{color:var(--muted);font-size:13px}`;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
  const btn=document.createElement('button');btn.id='lb-btn';btn.textContent='🏆';btn.title='Leaderboards';btn.setAttribute('aria-label','Leaderboards');document.body.appendChild(btn);
  const modal=document.createElement('div');modal.id='lb-modal';modal.innerHTML=`<div class="lb-box"><div class="lb-head"><h2>🏆 Leaderboards</h2><button id="lb-close">Close</button></div><p>Choose a game, then choose its mode or difficulty when it has more than one.</p><div class="lb-games" id="lb-games"></div><div class="lb-types" id="lb-types"></div><div class="lb-results" id="lb-results">Choose a game.</div></div>`;document.body.appendChild(modal);
  const games=[
    {name:'Sudoku',types:['Easy','Medium','Hard','Xtra hard'],ids:['sudoku_easy','sudoku_medium','sudoku_hard','sudoku_xtra']},
    {name:'Memory Match',types:['Standard'],ids:['memory']},{name:'Tic Tac Toe',types:['Standard'],ids:['tic_tac_toe']},
    {name:'Snake',types:['Standard'],ids:['snake']},{name:'2048',types:['Standard'],ids:['2048']},{name:'Connect Four',types:['Standard'],ids:['connect_four']},
    {name:'Whack-a-Mole',types:['Standard'],ids:['whack_a_mole']},{name:'Simon Says',types:['Standard'],ids:['simon_says']},
    {name:'Tag',types:['Standard'],ids:['tag']},{name:'Cookie Clicker',types:['Standard'],ids:['cookie_clicker']},
    {name:'FPS Arena',types:['Standard'],ids:['fps_arena']},{name:'Minesweeper',types:['Easy','Medium','Hard'],ids:['mines_easy','mines_medium','mines_hard']},
    {name:'Pong',types:['Standard'],ids:['pong']},{name:'Breakout',types:['Standard'],ids:['breakout']},{name:'Reaction Test',types:['Standard'],ids:['reaction_test']},
    {name:'Top-Down Racing',types:['Standard'],ids:['top_down_racing']},{name:'Archer Duel',types:['Standard'],ids:['archer_duel']},
    {name:'Zombie Survival',types:['Standard'],ids:['zombie_survival']},{name:'Arena Battle',types:['Standard'],ids:['arena_battle']},
    {name:'Tetris',types:['Standard'],ids:['tetris']},{name:'Asteroids',types:['Standard'],ids:['asteroids']},{name:'Air Hockey',types:['Standard'],ids:['air_hockey']},
    {name:'Coin Rush',types:['Standard'],ids:['coin_rush']},{name:'Detective',types:['Standard'],ids:['detective']},{name:'Target Practice',types:['Standard'],ids:['target_practice']},
    {name:'Climb',types:['Standard'],ids:['climb']},{name:'Dodge',types:['Standard'],ids:['dodge']},{name:'Gravity Switch',types:['Standard'],ids:['gravity_switch']},
    {name:'15 Puzzle',types:['Standard'],ids:['15_puzzle']},{name:'Bomb Defusal',types:['Standard'],ids:['bomb_defusal']},{name:'Ninja Run',types:['Standard'],ids:['ninja_run']},
    {name:'Basket Random',types:['Standard'],ids:['basket_random']},{name:'Crossy Road',types:['Standard'],ids:['crossy_road']},{name:'BitLife',types:['Standard'],ids:['bitlife']},
    {name:'Bowmasters',types:['Standard'],ids:['bowmasters']},{name:'Paper.io',types:['Standard'],ids:['paper_io']},{name:'Snake.io',types:['Standard'],ids:['snake_io']},
    {name:'Subaway Runners',types:['Standard'],ids:['subaway_runners']},{name:'Super Mario',types:['Standard'],ids:['super_mario']},{name:'Block Blast',types:['Standard'],ids:['block_blast']},{name:'Wordle',types:['Standard'],ids:['wordle']}
  ];
  let rows=[],selectedGame=0,selectedType=0;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const gamesEl=()=>document.getElementById('lb-games'),typesEl=()=>document.getElementById('lb-types'),resultsEl=()=>document.getElementById('lb-results');
  function homeView(){return Array.from(document.querySelectorAll('.view')).find(v=>v.querySelector('.grid'))||null}
  function isHomeVisible(){const lock=document.getElementById('lock-overlay');if(lock&&getComputedStyle(lock).display!=='none')return false;const home=homeView();return !!home&&home.classList.contains('active')}
  function visible(){btn.style.display=isHomeVisible()?'block':'none';if(!isHomeVisible())modal.classList.remove('open')}
  function renderGames(){gamesEl().innerHTML=games.map((g,i)=>`<button class="lb-game-btn${i===selectedGame?' selected':''}" data-game="${i}">${esc(g.name)}</button>`).join('');gamesEl().querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>{selectedGame=Number(b.dataset.game);selectedType=0;renderGames();renderTypes();renderResults()})}
  function renderTypes(){const g=games[selectedGame];typesEl().innerHTML=g.types.length>1?g.types.map((type,i)=>`<button class="lb-type-btn${i===selectedType?' selected':''}" data-type="${i}">${esc(type)}</button>`).join(''):'';typesEl().querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{selectedType=Number(b.dataset.type);renderTypes();renderResults()})}
  function renderResults(){const g=games[selectedGame],gameId=g.ids[selectedType],a=rows.filter(x=>x.game_id===gameId).sort((x,y)=>Number(y.score)-Number(x.score)).slice(0,10);resultsEl().innerHTML=`<strong>${esc(g.name)}${g.types.length>1?' — '+esc(g.types[selectedType]):''}</strong>`+(a.length?a.map((x,i)=>`<div class="lb-row"><span>#${i+1}</span><span>${esc(x.account_code)}</span><span class="lb-score">${esc(x.score)}</span></div>`).join(''):'<p class="lb-empty">No scores yet.</p>')}
  async function load(){resultsEl().textContent='Loading…';const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);try{const r=await fetch(SUPABASE_URL+'/rest/v1/game_scores?select=account_code,game_id,score',{headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY},signal:controller.signal});if(!r.ok)throw Error(r.status);rows=await r.json();renderGames();renderTypes();renderResults()}finally{clearTimeout(timer)}}
  btn.onclick=()=>{if(!isHomeVisible())return;modal.classList.add('open');load().catch(()=>resultsEl().textContent='Could not load leaderboard.')};document.getElementById('lb-close').onclick=()=>modal.classList.remove('open');modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')});document.addEventListener('DOMContentLoaded',visible);new MutationObserver(visible).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['style','class']});visible();
})();
