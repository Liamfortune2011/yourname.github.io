(function(){
  function fix(){
    var grid=document.querySelector('#view-hub .grid');
    if(!grid)return false;
    var cards=Array.from(grid.querySelectorAll('.extra-game-card'));
    if(!cards.length)return false;
    cards.forEach(function(card){
      var id=card.dataset.extraGame;
      if(id)card.setAttribute('onclick',"showView('"+id+"')");
    });
    if(grid.dataset.grouped==='1'&&typeof window.organizeGameHub==='function'){
      grid.dataset.grouped='';
      window.organizeGameHub();
    }
    return cards.length>=17;
  }
  var tries=0;
  function poll(){tries++;if(!fix()&&tries<80)setTimeout(poll,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',poll,{once:true});else poll();
})();
