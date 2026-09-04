(function(){
  if(window.__GAMEHUB_CORE_SCORE_BRIDGE__)return;
  window.__GAMEHUB_CORE_SCORE_BRIDGE__=true;

  var seen={};
  var started=false;

  function canonical(id){
    var aliases={
      racing:'top_down_racing',
      airhockey:'air_hockey',
      coinrush:'coin_rush',
      gravity:'gravity_switch',
      puzzle15:'15_puzzle',
      ninja:'ninja_run',
      basket:'basket_random',
      crossy:'crossy_road',
      paperio:'paper_io',
      snakeio:'snake_io',
      mario:'super_mario',
      subaway:'subaway_runners'
    };
    return aliases[String(id)]||String(id);
  }

  function higher(id){
    return ['sudoku_easy','sudoku_medium','sudoku_hard','sudoku_extra','mines_easy','mines_medium','mines_hard','memory','reaction_test','wordle'].indexOf(canonical(id))===-1;
  }

  function accountReady(){
    try{return !!localStorage.getItem('gamehub_account_code')}catch(e){return false}
  }

  function scan(){
    if(!accountReady()||typeof window.saveGameHubScore!=='function')return;
    if(!started){
      for(var i=0;i<localStorage.length;i++){
        var first=localStorage.key(i);
        if(first&&first.indexOf('gamehub_hs_')===0)seen[first]=localStorage.getItem(first);
      }
      started=true;
      return;
    }
    for(var j=0;j<localStorage.length;j++){
      var key=localStorage.key(j);
      if(!key||key.indexOf('gamehub_hs_')!==0)continue;
      var raw=localStorage.getItem(key);
      if(seen[key]===undefined){seen[key]=raw;continue}
      if(seen[key]!==raw){
        seen[key]=raw;
        var score=Number(raw),gameId=canonical(key.slice('gamehub_hs_'.length));
        if(Number.isFinite(score)&&score>=0)window.saveGameHubScore(gameId,score,higher(gameId));
      }
    }
  }

  setInterval(scan,500);
  window.addEventListener('online',scan);
})();
