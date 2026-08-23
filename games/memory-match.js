/* ============ MEMORY MATCH ============ */
  (function(){
    var emojis = ['🐶','🐱','🦊','🐼','🐸','🦁','🐵','🐨'];
    var boardEl, movesEl, pairsEl, winEl, bestEl;
    var cards = [], flipped = [], matched = 0, moves = 0, busy = false;

    function shuffled(arr){ arr=arr.slice(); for(var i=arr.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=arr[i]; arr[i]=arr[j]; arr[j]=t;} return arr; }

    window.newMemoryGame = function(){
      boardEl=document.getElementById('mem-board');
      movesEl=document.getElementById('moves');
      pairsEl=document.getElementById('pairs');
      winEl=document.getElementById('win-msg');
      bestEl=document.getElementById('mem-best-val');
      var bestSoFar = getHigh('memory');
      bestEl.textContent = bestSoFar===null ? '–' : (bestSoFar + ' moves');
      cards = shuffled(emojis.concat(emojis));
      flipped = []; matched = 0; moves = 0; busy = false;
      movesEl.textContent = 0;
      pairsEl.textContent = 0;
      winEl.textContent = '';
      render();
    };

    function render(){
      boardEl.innerHTML = '';
      cards.forEach(function(emoji, i){
        var card = document.createElement('div');
        card.className = 'mem-card';
        card.dataset.i = i;
        card.addEventListener('click', function(){ onFlip(i, card); });
        boardEl.appendChild(card);
      });
    }

    function onFlip(i, el){
      if(busy || el.classList.contains('flipped') || el.classList.contains('matched')) return;
      el.classList.add('flipped');
      el.textContent = cards[i];
      flipped.push({i:i, el:el});
      if(flipped.length === 2){
        moves++;
        movesEl.textContent = moves;
        busy = true;
        var a = flipped[0], b = flipped[1];
        if(cards[a.i] === cards[b.i]){
          a.el.classList.add('matched');
          b.el.classList.add('matched');
          matched++;
          pairsEl.textContent = matched;
          flipped = [];
          busy = false;
          if(matched === emojis.length){
            var best = updateHigh('memory', moves, false);
            bestEl.textContent = best + ' moves';
            winEl.textContent = 'Solved in ' + moves + ' moves!';
          }
        } else {
          setTimeout(function(){
            a.el.classList.remove('flipped');
            b.el.classList.remove('flipped');
            a.el.textContent = '';
            b.el.textContent = '';
            flipped = [];
            busy = false;
          }, 700);
        }
      }
    }

    document.addEventListener('DOMContentLoaded', function(){
      document.getElementById('mem-new-btn').addEventListener('click', function(){ confirmReset(newMemoryGame); });
    });
  })();
