/* ============ COOKIE CLICKER ============ */
  (function(){
    var countEl, cpsEl, totalEl, clickPowerEl, buffMsgEl, upgradesEl, storeEl, bigCookie, golden, bestEl;

    var cookies = 0, totalBaked = 0, clickPower = 1;
    var frenzyMult = 1, frenzyTimeLeft = 0;
    var clickFrenzyMult = 1;
    var goldenTimer = null, goldenHideTimer = null;
    var tickIv = null, running = false;

    var BUILDINGS = [
      { id:'cursor',  name:'Cursor',       icon:'👆', baseCost:15,        baseCps:0.1,   owned:0, mult:1 },
      { id:'grandma', name:'Grandma',      icon:'👵', baseCost:100,       baseCps:1,     owned:0, mult:1 },
      { id:'farm',    name:'Farm',         icon:'🌾', baseCost:1100,      baseCps:8,     owned:0, mult:1 },
      { id:'mine',    name:'Mine',         icon:'⛏️', baseCost:12000,     baseCps:47,    owned:0, mult:1 },
      { id:'factory', name:'Factory',      icon:'🏭', baseCost:130000,    baseCps:260,   owned:0, mult:1 },
      { id:'bank',    name:'Bank',         icon:'🏦', baseCost:1400000,   baseCps:1400,  owned:0, mult:1 },
      { id:'temple',  name:'Temple',       icon:'🛕', baseCost:20000000,  baseCps:7800,  owned:0, mult:1 },
      { id:'wizard',  name:'Wizard Tower', icon:'🧙', baseCost:330000000, baseCps:44000, owned:0, mult:1 },
      { id:'ship',    name:'Shipment',     icon:'🚀', baseCost:5100000000, baseCps:260000, owned:0, mult:1 },
      { id:'alchemy', name:'Alchemy Lab',  icon:'⚗️', baseCost:75000000000, baseCps:1600000, owned:0, mult:1 }
    ];
    var COST_SCALE = 1.15;

    var UPGRADES = [];
    BUILDINGS.forEach(function(b){
      UPGRADES.push({ id:b.id+'-u1', target:b.id, needOwned:1,  cost:b.baseCost*10,  bought:false, icon:b.icon, name:b.name+' upgrade I',  desc:'Doubles '+b.name+' production.' });
      UPGRADES.push({ id:b.id+'-u2', target:b.id, needOwned:10, cost:b.baseCost*100, bought:false, icon:b.icon, name:b.name+' upgrade II', desc:'Doubles '+b.name+' production again.' });
    });

    function fmt(n){
      if(n < 1000) return (Math.floor(n*10)/10).toString();
      var suf = ['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc'];
      var mag = Math.floor(Math.log10(n) / 3);
      if(mag >= suf.length) mag = suf.length - 1;
      var scaled = n / Math.pow(1000, mag);
      return scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0) + suf[mag];
    }
    function fmtInt(n){
      if(n < 1000) return Math.ceil(n).toString();
      return fmt(n);
    }

    function cost(b){ return b.baseCost * Math.pow(COST_SCALE, b.owned); }

    function totalCps(){
      var sum = 0;
      BUILDINGS.forEach(function(b){ sum += b.owned * b.baseCps * b.mult; });
      return sum * frenzyMult;
    }

    function buyBuilding(b){
      var c = cost(b);
      if(cookies < c) return;
      cookies -= c;
      b.owned++;
      render();
    }

    function buyUpgrade(u){
      if(u.bought || cookies < u.cost) return;
      cookies -= u.cost;
      u.bought = true;
      var b = BUILDINGS.filter(function(x){ return x.id === u.target; })[0];
      if(b) b.mult *= 2;
      render();
    }

    function spawnFloat(text, x, y){
      var el = document.createElement('div');
      el.className = 'cookie-float';
      el.textContent = text;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      document.getElementById('big-cookie-wrap').appendChild(el);
      setTimeout(function(){ el.remove(); }, 850);
    }

    function clickCookie(e){
      var gain = clickPower * clickFrenzyMult;
      cookies += gain;
      totalBaked += gain;
      var wrapRect = document.getElementById('big-cookie-wrap').getBoundingClientRect();
      var cx, cy;
      if(e && e.touches && e.touches[0]){
        cx = e.touches[0].clientX - wrapRect.left;
        cy = e.touches[0].clientY - wrapRect.top;
      } else if(e && typeof e.clientX === 'number'){
        cx = e.clientX - wrapRect.left;
        cy = e.clientY - wrapRect.top;
      } else {
        cx = wrapRect.width/2; cy = wrapRect.height/2;
      }
      spawnFloat('+' + fmtInt(gain), cx + (Math.random()*20-10), cy);
      renderTopStats();
    }

    function maybeSpawnGolden(){
      if(!running) return;
      var el = golden;
      var wrap = document.getElementById('big-cookie-wrap');
      var w = wrap.clientWidth, h = wrap.clientHeight;
      el.style.left = (20 + Math.random() * Math.max(1, w - 72)) + 'px';
      el.style.top = (20 + Math.random() * Math.max(1, h - 72)) + 'px';
      el.style.display = 'block';
      clearTimeout(goldenHideTimer);
      goldenHideTimer = setTimeout(function(){ el.style.display = 'none'; scheduleGolden(); }, 12000);
    }
    function scheduleGolden(){
      clearTimeout(goldenTimer);
      var delay = 15000 + Math.random() * 25000;
      goldenTimer = setTimeout(maybeSpawnGolden, delay);
    }
    function clickGolden(){
      golden.style.display = 'none';
      clearTimeout(goldenHideTimer);
      var roll = Math.random();
      if(roll < 0.5){
        frenzyMult = 7;
        frenzyTimeLeft = 13;
        buffMsgEl.textContent = 'Frenzy! Production x7 for 13s';
      } else {
        var bonus = Math.max(50, Math.round(cookies * 0.15), Math.round(totalCps() * 60 * 0.15));
        cookies += bonus;
        totalBaked += bonus;
        buffMsgEl.textContent = 'Lucky! +' + fmtInt(bonus) + ' cookies';
        setTimeout(function(){ if(buffMsgEl.textContent.indexOf('Lucky') === 0) buffMsgEl.textContent = ''; }, 3000);
      }
      scheduleGolden();
      render();
    }

    function renderTopStats(){
      countEl.textContent = fmtInt(cookies) + ' cookie' + (Math.floor(cookies) === 1 ? '' : 's');
      var cps = totalCps();
      cpsEl.textContent = 'per second: ' + fmt(cps);
      totalEl.textContent = fmtInt(totalBaked);
      clickPowerEl.textContent = fmtInt(clickPower * clickFrenzyMult);
      var best = updateHigh('cookie', totalBaked, true);
      if(bestEl) bestEl.textContent = fmtInt(best);
      if(frenzyTimeLeft > 0){
        buffMsgEl.textContent = 'Frenzy! Production x7 (' + Math.ceil(frenzyTimeLeft) + 's)';
      } else if(buffMsgEl.textContent.indexOf('Frenzy') === 0){
        buffMsgEl.textContent = '';
      }
    }

    function render(){
      renderTopStats();
      storeEl.innerHTML = '';
      BUILDINGS.forEach(function(b){
        var c = cost(b);
        var row = document.createElement('div');
        row.className = 'cookie-item' + (cookies < c ? ' disabled' : '');
        row.innerHTML =
          '<div><div class="ci-name">' + b.icon + ' ' + b.name + '</div>' +
          '<div class="ci-sub">' + fmt(b.baseCps * b.mult) + ' cps each</div></div>' +
          '<div class="ci-right"><div class="ci-cost">' + fmtInt(c) + '</div>' +
          '<div class="ci-owned">owned ' + b.owned + '</div></div>';
        row.addEventListener('click', function(){ buyBuilding(b); });
        storeEl.appendChild(row);
      });
      upgradesEl.innerHTML = '';
      var anyAvailable = false;
      UPGRADES.forEach(function(u){
        if(u.bought) return;
        var b = BUILDINGS.filter(function(x){ return x.id === u.target; })[0];
        if(!b || b.owned < u.needOwned) return;
        anyAvailable = true;
        var btn = document.createElement('div');
        btn.className = 'cookie-upg' + (cookies < u.cost ? ' disabled' : '');
        btn.textContent = u.icon;
        btn.title = u.name + ' — ' + u.desc + ' (' + fmtInt(u.cost) + ' cookies)';
        btn.addEventListener('click', function(){ buyUpgrade(u); });
        upgradesEl.appendChild(btn);
      });
      if(!anyAvailable){
        upgradesEl.innerHTML = '<div style="font-size:12px;color:var(--muted);">Buy buildings to unlock upgrades.</div>';
      }
    }

    function tick(){
      var cps = totalCps();
      cookies += cps / 10;
      totalBaked += cps / 10;
      if(frenzyTimeLeft > 0){
        frenzyTimeLeft -= 0.1;
        if(frenzyTimeLeft <= 0){ frenzyTimeLeft = 0; frenzyMult = 1; }
      }
      renderTopStats();
      var rows = storeEl.children;
      for(var i=0;i<rows.length;i++){
        var b = BUILDINGS[i];
        if(!b) continue;
        rows[i].classList.toggle('disabled', cookies < cost(b));
      }
    }

    function resetCookie(){
      cookies = 0; totalBaked = 0; clickPower = 1; frenzyMult = 1; frenzyTimeLeft = 0;
      BUILDINGS.forEach(function(b){ b.owned = 0; b.mult = 1; });
      UPGRADES.forEach(function(u){ u.bought = false; });
      buffMsgEl.textContent = '';
      render();
    }

    function initCookie(){
      countEl = document.getElementById('cookie-count');
      cpsEl = document.getElementById('cookie-cps');
      totalEl = document.getElementById('cookie-total');
      bestEl = document.getElementById('cookie-best-val');
      bestEl.textContent = fmtInt(getHigh('cookie') || 0);
      clickPowerEl = document.getElementById('cookie-click-power');
      buffMsgEl = document.getElementById('cookie-buff-msg');
      upgradesEl = document.getElementById('cookie-upgrades');
      storeEl = document.getElementById('cookie-store');
      bigCookie = document.getElementById('big-cookie');
      golden = document.getElementById('golden-cookie');

      bigCookie.addEventListener('click', clickCookie);
      bigCookie.addEventListener('touchstart', function(e){ e.preventDefault(); clickCookie(e); }, { passive:false });
      golden.addEventListener('click', clickGolden);
      document.getElementById('cookie-reset-btn').addEventListener('click', function(){ confirmReset(resetCookie); });

      render();
      running = true;
      tickIv = setInterval(tick, 100);
      scheduleGolden();
    }

    window.cookieLeave = function(){
      running = false;
    };
    window.cookieEnter = function(){
      running = true;
    };

    window.initCookie = initCookie;
  })();
