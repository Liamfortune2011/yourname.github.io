/* ============ WORDLE ============ */
  (function(){
    var words = ['APPLE','BRAVE','CRANE','DITCH','EAGLE','FAITH','GRAPE','HOUSE','IRONY','JOLLY',
      'KNIFE','LEMON','MONEY','NOBLE','OCEAN','PLANT','QUILT','RIVER','STONE','TABLE',
      'UNITY','VOICE','WATER','YOUTH','ZEBRA','AMBER','BLUSH','CHESS','DRIFT','EMBER',
      'FLAME','GHOST','HONEY','IMAGE','JUDGE','KARMA','LIGHT','MIRTH','NORTH','OTTER',
      'PEARL','QUEST','ROBIN','SUGAR','TIGER','URBAN','VIVID','WHALE','YIELD','ZESTY',
      'BEACH','CANDY','DREAM','EARTH','FROST','GRAIN','HEART','JELLY','JUMPY','JOKER'];
    var kbRows = [
      ['Q','W','E','R','T','Y','U','I','O','P'],
      ['A','S','D','F','G','H','J','K','L'],
      ['ENTER','Z','X','C','V','B','N','M','BACK']
    ];
    var boardEl, kbEl, msgEl, bestEl;
    var target, guesses, current, row, over, keyStatus;

    window.newWordleGame = function(){
      boardEl = document.getElementById('wordle-board');
      kbEl = document.getElementById('wordle-keyboard');
      msgEl = document.getElementById('wordle-msg');
      bestEl = document.getElementById('wordle-best-val');
      var best = getHigh('wordle');
      bestEl.textContent = best===null ? '–' : (best + '/6');
      target = words[Math.floor(Math.random()*words.length)];
      guesses = []; current = ''; row = 0; over = false;
      keyStatus = {};
      msgEl.textContent = '';
      renderBoard();
      renderKeyboard();
    };

    function renderBoard(){
      boardEl.innerHTML = '';
      for(var r=0;r<6;r++){
        var rowEl = document.createElement('div');
        rowEl.className = 'wordle-row';
        for(var c=0;c<5;c++){
          var tile = document.createElement('div');
          tile.className = 'wordle-tile';
          if(r<guesses.length){
            tile.textContent = guesses[r].letters[c];
            tile.classList.add(guesses[r].result[c]);
          } else if(r===row){
            tile.textContent = current[c] || '';
          }
          rowEl.appendChild(tile);
        }
        boardEl.appendChild(rowEl);
      }
    }

    function renderKeyboard(){
      kbEl.innerHTML = '';
      kbRows.forEach(function(krow){
        var rowEl = document.createElement('div');
        rowEl.className = 'wordle-krow';
        krow.forEach(function(k){
          var key = document.createElement('div');
          key.className = 'wordle-key' + (k==='ENTER' || k==='BACK' ? ' wide' : '');
          key.textContent = k==='BACK' ? '⌫' : k;
          if(keyStatus[k]) key.classList.add(keyStatus[k]);
          key.addEventListener('click', function(){ onKey(k); });
          rowEl.appendChild(key);
        });
        kbEl.appendChild(rowEl);
      });
    }

    function evaluateGuess(guess, targetWord){
      var result = new Array(5).fill('absent');
      var t = targetWord.split(''), g = guess.split('');
      var used = new Array(5).fill(false);
      for(var i=0;i<5;i++){
        if(g[i]===t[i]){ result[i]='correct'; used[i]=true; }
      }
      for(var i=0;i<5;i++){
        if(result[i]==='correct') continue;
        var idx = -1;
        for(var j=0;j<5;j++){ if(!used[j] && t[j]===g[i]){ idx=j; break; } }
        if(idx>-1){ result[i]='present'; used[idx]=true; }
      }
      return result;
    }

    function onKey(k){
      if(over) return;
      if(k==='BACK'){
        current = current.slice(0,-1);
        renderBoard();
        return;
      }
      if(k==='ENTER'){
        if(current.length!==5){ msgEl.textContent = 'Not enough letters'; return; }
        var result = evaluateGuess(current, target);
        guesses.push({ letters: current, result: result });
        current.split('').forEach(function(ltr, i){
          var st = result[i];
          var rank = { absent:0, present:1, correct:2 };
          if(!keyStatus[ltr] || rank[st] > rank[keyStatus[ltr]]) keyStatus[ltr] = st;
        });
        var won = current===target;
        row++;
        var guessNum = row;
        current = '';
        renderBoard();
        renderKeyboard();
        if(won){
          over = true;
          var best = updateHigh('wordle', guessNum, false);
          bestEl.textContent = best + '/6';
          msgEl.textContent = 'You got it in ' + guessNum + '/6!';
        } else if(row>=6){
          over = true;
          msgEl.textContent = 'Out of guesses — it was ' + target;
        } else {
          msgEl.textContent = '';
        }
        return;
      }
      if(/^[A-Z]$/.test(k) && current.length<5){
        current += k;
        renderBoard();
      }
    }

    document.addEventListener('keydown', function(e){
      if(!document.getElementById('view-wordle').classList.contains('active')) return;
      var k = e.key.toUpperCase();
      if(k==='ENTER') onKey('ENTER');
      else if(k==='BACKSPACE') onKey('BACK');
      else if(/^[A-Z]$/.test(k)) onKey(k);
    });

    document.addEventListener('DOMContentLoaded', function(){
      document.getElementById('wordle-new-btn').addEventListener('click', function(){ confirmReset(newWordleGame); });
    });
  })();
