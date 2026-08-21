/* ============ SIMON SAYS ============ */
  (function(){
    var boardEl, roundEl, msgEl, bestEl;
    var sequence = [], userStep = 0, round = 0, busy = false, over = true;
    var colors = ['green','red','yellow','blue'];

    window.newSimonGame = function(){
      boardEl = document.getElementById('simon-board');

      roundEl = document.getElementById('simon-round-val');
      msgEl = document.getElementById('simon-msg');
      bestEl = document.getElementById('simon-best-val');
      bestEl.textContent = getHigh('simon') || 0;
      sequence = []; userStep = 0; round = 0; over = false;
      roundEl.textContent = 0;
      msgEl.textContent = 'Watch the pattern...';
      nextRound();
    };

    function nextRound(){
      round++;
      roundEl.textContent = round;
      sequence.push(Math.floor(Math.random()*4));
      userStep = 0;
      playSequence();
    }

    function playSequence(){
      busy = true;
      msgEl.textContent = 'Watch the pattern...';
      var i = 0;
      var iv = setInterval(function(){
        if(i>0) unlight(sequence[i-1]);
        if(i>=sequence.length){
          clearInterval(iv);
          busy = false;
          msgEl.textContent = 'Your turn';
          return;
        }
        light(sequence[i]);
        i++;
      }, 500);
    }

    function light(idx){
      boardEl.querySelector('[data-pad="'+idx+'"]').classList.add('lit');
    }
    function unlight(idx){
      boardEl.querySelector('[data-pad="'+idx+'"]').classList.remove('lit');
    }

    function onPad(idx){
      if(busy || over) return;
      light(idx);
      setTimeout(function(){ unlight(idx); }, 200);
      if(idx===sequence[userStep]){
        userStep++;
        if(userStep===sequence.length){
          setTimeout(nextRound, 700);
        }
      } else {
        over = true;
        bestEl.textContent = updateHigh('simon', round - 1, true);
        msgEl.textContent = 'Game over — reached round ' + round;
      }
    }

    document.addEventListener('DOMContentLoaded', function(){
      document.querySelectorAll('.simon-pad').forEach(function(p){
        p.addEventListener('click', function(){ onPad(+p.dataset.pad); });
      });
      document.getElementById('simon-new-btn').addEventListener('click', function(){ confirmReset(newSimonGame); });
    });
  })();
