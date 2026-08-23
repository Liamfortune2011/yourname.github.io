(function(){
  const SUPABASE_URL='https://gywrmkluncycfxeffypc.supabase.co';
  const SUPABASE_KEY='sb_publishable_LI8-YNwApCJSVL2EkB7dzA_ZIBLxe3s';

  const css=`
    #lb-btn{position:fixed;top:14px;left:14px;z-index:9999;padding:9px 11px;border-radius:999px;font-size:18px}
    #lb-modal{display:none;position:fixed;inset:0;z-index:9998;background:#0007;align-items:center;justify-content:center;padding:16px}
    #lb-modal.open{display:flex}
    .lb-box{background:var(--card-bg,#fff);color:var(--app-text,#222);border-radius:14px;padding:20px;width:min(94vw,760px);max-height:88vh;overflow:auto}
    .lb-head{display:flex;justify-content:space-between;align-items:center;gap:12px}
    .lb-games{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-top:14px}
    .lb-game-btn{width:100%;text-align:left}
    .lb-game-btn.selected{background:var(--app-text);color:var(--app-bg);border-color:var(--app-text)}
    .lb-types{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}
    .lb-type-btn.selected{background:var(--app-text);color:var(--app-bg);border-color:var(--app-text)}
    .lb-results{border:1px solid var(--card-border,#ccc);border-radius:10px;padding:12px}
    .lb-row{display:grid;grid-template-columns:36px 1fr auto;gap:8px;padding:8px 0;border-top:1px solid var(--card-border,#ddd);font-size:13px}
    .lb-row:first-child{border-top:0}
    .lb-score{font-weight:700}
    .lb-empty{color:var(--muted);font-size:13px}
  `;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

  const btn=document.createElement('button');
  btn.id='lb-btn';
  btn.textContent='🏆';
  btn.title='Leaderboards';
  btn.setAttribute('aria-label','Leaderboards');
  document.body.appendChild(btn);

  const modal=document.createElement('div');
  modal.id='lb-modal';
  modal.innerHTML=`<div class="lb-box">
    <div class="lb-head"><h2>🏆 Leaderboards</h2><button id="lb-close">Close</button></div>
    <p>Choose a game, then choose its mode or difficulty when it has more than one.</p>
    <div class="lb-games" id="lb-games"></div>
    <div class="lb-types" id="lb-types"></div>
    <div class="lb-results" id="lb-results">Choose a game.</div>
  </div>`;
  document.body.appendChild(modal);

  // One leaderboard button per actual game. Modes/difficulties stay separate
  // so scores such as Sudoku Easy/Medium/Hard are never mixed together.
  const games=[
    {name:'Sudoku', types:['Easy','Medium','Hard'], ids:['sudoku_easy','sudoku_medium','sudoku_hard']},
    {name:'Memory', types:['Standard'], ids:['memory']},
    {name:'Tic Tac Toe', types:['Standard'], ids:['tic_tac_toe']},
    {name:'Snake', types:['Standard'], ids:['snake']},
    {name:'2048', types:['Standard'], ids:['2048']},
    {name:'Connect Four', types:['Standard'], ids:['connect_four']},
    {name:'Breakout', types:['Standard'], ids:['breakout']},
    {name:'Simon Says', types:['Standard'], ids:['simon_says']},
    {name:'Block Blast', types:['Standard'], ids:['block_blast']},
    {name:'Wordle', types:['Standard'], ids:['wordle']},
    {name:'Minesweeper', types:['Easy','Medium','Hard'], ids:['mines_easy','mines_medium','mines_hard']},
    {name:'Tag', types:['Standard'], ids:['tag']},
    {name:'Cookie Clicker', types:['Standard'], ids:['cookie_clicker']}
  ];

  let rows=[];
  let selectedGame=0;
  let selectedType=0;

  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const gamesEl=()=>document.getElementById('lb-games');
  const typesEl=()=>document.getElementById('lb-types');
  const resultsEl=()=>document.getElementById('lb-results');

  function homeView(){
    return Array.from(document.querySelectorAll('.view')).find(v=>v.querySelector('.grid')) || null;
  }

  function isHomeVisible(){
    const lock=document.getElementById('lock-overlay');
    if(lock && getComputedStyle(lock).display!=='none') return false;
    const home=homeView();
    return !!home && home.classList.contains('active');
  }

  function visible(){
    btn.style.display=isHomeVisible()?'block':'none';
    if(!isHomeVisible()) modal.classList.remove('open');
  }

  function renderGames(){
    gamesEl().innerHTML=games.map((g,i)=>
      `<button class="lb-game-btn${i===selectedGame?' selected':''}" data-game="${i}">${esc(g.name)}</button>`
    ).join('');
    gamesEl().querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>{
      selectedGame=Number(b.dataset.game);
      selectedType=0;
      renderGames();
      renderTypes();
      renderResults();
    });
  }

  function renderTypes(){
    const g=games[selectedGame];
    typesEl().innerHTML=g.types.length>1
      ? g.types.map((type,i)=>`<button class="lb-type-btn${i===selectedType?' selected':''}" data-type="${i}">${esc(type)}</button>`).join('')
      : '';
    typesEl().querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{
      selectedType=Number(b.dataset.type);
      renderTypes();
      renderResults();
    });
  }

  function renderResults(){
    const g=games[selectedGame];
    const gameId=g.ids[selectedType];
    const a=rows.filter(x=>x.game_id===gameId).slice(0,10);
    resultsEl().innerHTML=`<strong>${esc(g.name)}${g.types.length>1?' — '+esc(g.types[selectedType]):''}</strong>`+
      (a.length
        ? a.map((x,i)=>`<div class="lb-row"><span>#${i+1}</span><span>${esc(x.account_code)}</span><span class="lb-score">${esc(x.score)}</span></div>`).join('')
        : '<p class="lb-empty">No scores yet.</p>');
  }

  async function load(){
    resultsEl().textContent='Loading…';
    const r=await fetch(SUPABASE_URL+'/rest/v1/game_scores?select=account_code,game_id,score&order=score.desc',{headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY}});
    if(!r.ok) throw Error(r.status);
    rows=await r.json();
    renderGames();
    renderTypes();
    renderResults();
  }

  btn.onclick=()=>{
    if(!isHomeVisible()) return;
    modal.classList.add('open');
    load().catch(()=>resultsEl().textContent='Could not load leaderboard.');
  };
  document.getElementById('lb-close').onclick=()=>modal.classList.remove('open');
  modal.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open');});

  document.addEventListener('DOMContentLoaded',visible);
  const observer=new MutationObserver(visible);
  observer.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['style','class']});
  visible();
})();
