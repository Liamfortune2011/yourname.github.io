(function(){
  if(window.__GAMEHUB_UI_FIXES__)return;
  window.__GAMEHUB_UI_FIXES__=true;

  var style=document.createElement('style');
  style.textContent='\n/* Game Hub UI fixes */\n#view-cookie #cookie-reset-btn{display:block!important;width:max-content!important;min-width:0!important;max-width:none!important;flex:0 0 auto!important;align-self:center!important;padding:8px 14px!important;white-space:nowrap!important;box-sizing:border-box!important}\n#view-cookie .cookie-left>button#cookie-reset-btn{width:max-content!important}\n#view-cookie .cookie-item{width:100%;max-width:100%;box-sizing:border-box}\n#view-cookie .cookie-upg{width:42px!important;height:42px!important;min-width:42px}\n.extra-pack .extra-game-card{width:auto;min-width:0}\n#bug-report-btn{position:fixed;top:14px;right:62px;z-index:500;border-radius:50%;width:40px;height:40px;padding:0;font-size:18px;display:inline-flex;align-items:center;justify-content:center}\n';
  document.head.appendChild(style);

  function addBugButton(){
    if(document.getElementById('bug-report-btn'))return;
    var settings=document.getElementById('settings-btn');
    if(!settings)return;
    var btn=document.createElement('button');
    btn.id='bug-report-btn';
    btn.type='button';
    btn.title='Report a bug';
    btn.setAttribute('aria-label','Report a bug');
    btn.textContent='🐛';
    btn.addEventListener('click',function(){window.location.href='bug-report.html'});
    settings.parentNode.insertBefore(btn,settings);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addBugButton);
  else addBugButton();
  setTimeout(addBugButton,500);
  setTimeout(addBugButton,1500);
})();
