/* ============ SNAKE ============ */
  (function(){
    var canvas, ctx, scoreEl, msgEl, bestEl;
    var size = 320, cell = 16, cols = size/cell;
    var snake, dir, dirQueue, foods, score, loopId, over, running, speed = 110;
    var snakeColor = '#2c2c2a', bgColor = '#ffffff', foodStyle = 'dot', foodCount = 3, wrapWalls = false;

    window.newSnakeGame = function(){
      canvas = document.getElementById('snake-canvas');
      ctx = canvas.getContext('2d');
      scoreEl = document.getElementById('snake-score-val');
      msgEl = document.getElementById('snake-msg');
      bestEl = document.getElementById('snake-best-val');
      snake = [{x:8,y:8},{x:7,y:8},{x:6,y:8}];
      dir = {x:1,y:0}; dirQueue = [];
      score = 0; over = false; running = false;
      foods = [];
      scoreEl.textContent = 0;
      bestEl.textContent = getHigh('snake') || 0;
      msgEl.textContent = 'Press a direction to start';
      for(var i=0;i<foodCount;i++) placeFood();
      draw();
      if(loopId) clearInterval(loopId);
    };

    function setSpeed(ms){
      speed = ms;
      document.querySelectorAll('.snake-speed-btn').forEach(function(b){
        b.classList.toggle('active', +b.dataset.speed===ms);
      });
      newSnakeGame();
    }

    function setFoodCount(n){
      foodCount = n;
      document.querySelectorAll('.snake-count-btn').forEach(function(b){
        b.classList.toggle('active', +b.dataset.count===n);
      });
      newSnakeGame();
    }

    function placeFood(){
      var ok = false, f;
      while(!ok){
        f = {x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*cols)};
        ok = !snake.some(function(s){ return s.x===f.x && s.y===f.y; })
          && !foods.some(function(o){ return o.x===f.x && o.y===f.y; });
      }
      foods.push(f);
    }

    function tick(){
      if(over) return;
      if(dirQueue.length) dir = dirQueue.shift();
      var head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
      if(wrapWalls){
        if(head.x<0) head.x = cols-1;
        if(head.x>=cols) head.x = 0;
        if(head.y<0) head.y = cols-1;
        if(head.y>=cols) head.y = 0;
      }
      var hitWall = !wrapWalls && (head.x<0 || head.y<0 || head.x>=cols || head.y>=cols);
      if(hitWall || snake.some(function(s){ return s.x===head.x && s.y===head.y; })){
        over = true;
        clearInterval(loopId);
        bestEl.textContent = updateHigh('snake', score, true);
        msgEl.textContent = 'Game over — score ' + score;
        return;
      }
      snake.unshift(head);
      var eatenIdx = foods.findIndex(function(f){ return f.x===head.x && f.y===head.y; });
      if(eatenIdx>-1){
        score++;
        scoreEl.textContent = score;
        foods.splice(eatenIdx, 1);
        placeFood();
      } else {
        snake.pop();
      }
      draw();
    }

    function draw(){
      ctx.fillStyle = bgColor;
      ctx.fillRect(0,0,size,size);
      ctx.strokeStyle = 'rgba(128,128,128,0.5)';
      ctx.lineWidth = 1;
      for(var i=1;i<cols;i++){
        ctx.beginPath();
        ctx.moveTo(i*cell+0.5, 0); ctx.lineTo(i*cell+0.5, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i*cell+0.5); ctx.lineTo(size, i*cell+0.5);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(128,128,128,0.9)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0.5, 0.5, size-1, size-1);
      foods.forEach(drawFood);
      snake.forEach(function(s, i){
        ctx.globalAlpha = i===0 ? 1 : 0.75;
        ctx.fillStyle = snakeColor;
        ctx.fillRect(s.x*cell+1, s.y*cell+1, cell-2, cell-2);
        ctx.globalAlpha = 1;
      });
    }

    function drawFood(food){
      var cx = food.x*cell + cell/2, cy = food.y*cell + cell/2;
      if(foodStyle==='apple' || foodStyle==='star'){
        ctx.font = (cell) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(foodStyle==='apple' ? '🍎' : '⭐', cx, cy+1);
      } else if(foodStyle==='square'){
        ctx.fillStyle = '#db5a3c';
        ctx.fillRect(food.x*cell+2, food.y*cell+2, cell-4, cell-4);
      } else {
        ctx.fillStyle = '#db5a3c';
        ctx.beginPath();
        ctx.arc(cx, cy, (cell-4)/2, 0, Math.PI*2);
        ctx.fill();
      }
    }

    function setDir(x,y){
      var last = dirQueue.length ? dirQueue[dirQueue.length-1] : dir;
      if(last.x===-x && last.y===-y) return;
      if(last.x===x && last.y===y) return;
      if(dirQueue.length>=2) return;
      dirQueue.push({x:x,y:y});
      if(!running && !over){
        running = true;
        msgEl.textContent = '';
        loopId = setInterval(tick, speed);
      }
    }

    window.snakeFocus = function(){ document.getElementById('view-snake').setAttribute('tabindex','-1'); };

    document.addEventListener('keydown', function(e){
      if(!document.getElementById('view-snake').classList.contains('active')) return;
      if(e.key==='ArrowUp') setDir(0,-1);
      else if(e.key==='ArrowDown') setDir(0,1);
      else if(e.key==='ArrowLeft') setDir(-1,0);
      else if(e.key==='ArrowRight') setDir(1,0);
      else return;
      e.preventDefault();
    });

    document.addEventListener('DOMContentLoaded', function(){
      document.getElementById('snake-new-btn').addEventListener('click', function(){ confirmReset(newSnakeGame); });
      document.getElementById('snake-up').addEventListener('click', function(){ setDir(0,-1); });
      document.getElementById('snake-down').addEventListener('click', function(){ setDir(0,1); });
      document.getElementById('snake-left').addEventListener('click', function(){ setDir(-1,0); });
      document.getElementById('snake-right').addEventListener('click', function(){ setDir(1,0); });
      document.querySelectorAll('.snake-speed-btn').forEach(function(b){
        b.addEventListener('click', function(){ setSpeed(+b.dataset.speed); });
      });
      document.querySelector('.snake-speed-btn[data-speed="110"]').classList.add('active');
      document.getElementById('snake-color').addEventListener('input', function(e){
        snakeColor = e.target.value;
        if(ctx) draw();
      });
      document.getElementById('snake-bg-color').addEventListener('input', function(e){
        bgColor = e.target.value;
        if(ctx) draw();
      });
      document.querySelectorAll('.snake-food-btn').forEach(function(b){
        b.addEventListener('click', function(){
          foodStyle = b.dataset.food;
          document.querySelectorAll('.snake-food-btn').forEach(function(x){ x.classList.toggle('active', x===b); });
          if(ctx) draw();
        });
      });
      document.querySelector('.snake-food-btn[data-food="dot"]').classList.add('active');
      document.querySelectorAll('.snake-count-btn').forEach(function(b){
        b.addEventListener('click', function(){ setFoodCount(+b.dataset.count); });
      });
      document.querySelector('.snake-count-btn[data-count="3"]').classList.add('active');
      document.getElementById('snake-wrap-btn').addEventListener('click', function(e){
        wrapWalls = !wrapWalls;
        e.target.dataset.wrap = wrapWalls ? 'on' : 'off';
        e.target.textContent = wrapWalls ? 'Walls: Wrap-around' : 'Walls: Solid';
        e.target.classList.toggle('active', wrapWalls);
      });
    });
  })();
