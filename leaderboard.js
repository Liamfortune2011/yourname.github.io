(function(){
  const SUPABASE_URL='https://gywrmkluncycfxeffypc.supabase.co';
  const SUPABASE_KEY='sb_publishable_LI8-YNwApCJSVL2EkB7dzA_ZIBLxe3s';
  const css=`#lb-btn{position:fixed;top:14px;left:14px;z-index:9999;padding:9px 13px;border-radius:999px}#lb-modal{display:none;position:fixed;inset:0;z-index:9998;background:#0007;align-items:center;justify-content:center;padding:16px}#lb-modal.open{display:flex}.lb-box{background:var(--card-bg,#fff);color:var(--app-text,#222);border-radius:14px;padding:20px;width:min(94vw,760px);max-height:88vh;overflow:auto}.lb-head{display:flex;justify-content:space-between;align-items:center}.lb-games{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}.lb-game{border:1px solid var(--card-border,#ccc);border-radius:10px;padding:12px}.lb-row{display:grid;grid-template-columns:32px 1fr auto;gap:8px;padding:7px 0;border-top:1px solid var(--card-border,#ddd);font-size:13px}.lb-row:first-child{border-top:0}.lb-score{font-weight:700}`;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
  const btn=document.createElement('button');btn.id='lb-btn';btn.textContent='🏆 Leaderboard';document.body.appendChild(btn);
  const modal=document.createElement('div');modal.id='lb-modal';modal.innerHTML='<div class="lb-box"><div class="lb-head"><h2>🏆 Leaderboards</h2><button id="lb-close">Close</button></div><p>Top scores for each game.</p><div class="lb-games" id="lb-games">Loading…</div></div>';document.body.appendChild(modal);
  const games=['Sudoku Easy','Sudoku Medium','Sudoku Hard','Memory','Tic Tac Toe','Snake','2048','Connect Four','Breakout','Simon Says','Block Blast','Wordle','Mines Easy','Mines Medium','Mines Hard','Tag','Cookie Clicker'];
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function load(){
    const r=await fetch(SUPABASE_URL+'/rest/v1/game_scores?select=account_code,game_id,score&order=score.desc',{headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY}});
    if(!r.ok)throw Error(r.status); const rows=await r.json();
    const groups={};rows.forEach(x=>(groups[x.game_id]??=[]).push(x));
    document.getElementById('lb-games').innerHTML=games.map(name=>{const id=name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');const a=(groups[id]||[]).slice(0,5);return '<div class="lb-game"><b>'+esc(name)+'</b>'+(a.length?a.map((x,i)=>'<div class="lb-row"><span>#'+(i+1)+'</span><span>'+esc(x.account_code)+'</span><span class="lb-score">'+esc(x.score)+'</span></div>').join(''):'<p>No scores yet.</p>')+'</div>'}).join('');
  }
  btn.onclick=()=>{modal.classList.add('open');load().catch(()=>document.getElementById('lb-games').textContent='Could not load leaderboard.');};
  document.getElementById('lb-close').onclick=()=>modal.classList.remove('open');
})();
