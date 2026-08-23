/* ============ BREAKOUT ============ */
  (function(){
    var canvas, ctx, scoreEl, livesEl, levelEl, msgEl, bestEl;
    var width = 320, height = 380;
    var basePaddleW = 70, paddleH = 10, paddleX, paddleW;
    var balls, ballR = 6;
    var cols = 8, brickW = 36, brickH = 14, brickGap = 4, brickTop = 34, brickLeft = 4;
    var bricks, score, lives, level, over, loopId;
    var powerups, widenUntil = 0, slowUntil = 0;
    var rowColors = ['#db5a3c','#e8c86e','#6fae4a','#4a6fa5','#9b6fae','#e07a5f','#2d9d9d'];
    var powerLabels = { W:'🟦', S:'🟨', M:'🟩', L:'❤️' };
    var keys = { left:false, right:false };

    window.initBreakout = function(){
      canvas = document.getElementById('breakout-canvas');
      ctx = canvas.getContext('2d');
      scoreEl = document.getElementById('breakout-score-val');
      livesEl = document.getElementById('breakout-lives-val');
      levelEl = document.getElementById('breakout-level-val');
      msgEl = document.getElementById('breakout-msg');
      bestEl = document.getElementById('breakout-best-val');
      newBreakoutGame();
    };

    function rowsForLevel(lv){
      return Math.min(5 + Math.floor((lv-1)/2), 7);
    }

    function buildBricks(){
      bricks = [];
      var rows = rowsForLevel(level);
      for(var r=0;r<rows;r++){
        for(var c=0;c<cols;c++){
          bricks.push({ r:r, c:c, alive:true,
            x: brickLeft + c*(brickW+brickGap),
            y: brickTop + r*(brickH+brickGap) });
        }
      }
    }

    function restingBall(){
      return { x: paddleX + paddleW/2, y: height-20-ballR, dx:0, dy:0, resting:true };
    }

    function resetBall(){
      paddleX = (width - basePaddleW)/2;
      widenUntil = 0; slowUntil = 0;
      paddleW = basePaddleW;
      powerups = [];
      balls = [ restingBall() ];
    }

    window.newBreakoutGame = function(){
      score = 0; lives = 3; level = 1; over = false;
      scoreEl.textContent = 0;
      livesEl.textContent = 3;
      levelEl.textContent = 1;
      bestEl.textContent = getHigh('breakout') || 0;
      msgEl.textContent = 'Click or tap the board to launch';
      resetBall();
      buildBricks();
      draw();
      if(loopId) cancelAnimationFrame(loopId);
      loopId = requestAnimationFrame(loop);
    };

    function nextLevel(){
      level++;
      levelEl.textContent = level;
      msgEl.textContent = 'Level ' + level + '! Click or tap to launch';
      resetBall();
      buildBricks();
    }

    function launch(){
      var resting = balls.filter(function(b){ return b.resting; });
      if(!resting.length || over) return;
      resting.forEach(function(b){
        var angle = (Math.random()*0.6 - 0.3);
        var spd = 3.2 * (slowUntil>Date.now() ? 0.6 : 1);
        b.dx = spd * Math.sin(angle);
        b.dy = -spd * Math.cos(angle);
        b.resting = false;
      });
      msgEl.textContent = '';
    }

    function loop(){
      if(!over){
        update();
        draw();
        loopId = requestAnimationFrame(loop);
      }
    }

    function update(){
      var now = Date.now();
      if(keys.left) paddleX -= 5;
      if(keys.right) paddleX += 5;
      paddleW = now < widenUntil ? basePaddleW + 30 : basePaddleW;
      paddleX = Math.max(0, Math.min(width - paddleW, paddleX));

      var speedMult = now < slowUntil ? 0.6 : 1;
      var paddleY = height - 20;

      balls.forEach(function(ball){
        if(ball.resting){
          ball.x = paddleX + paddleW/2;
          ball.y = paddleY - ballR;
          return;
        }
        ball.x += ball.dx * speedMult;
        ball.y += ball.dy * speedMult;

        if(ball.x - ballR < 0){ ball.x = ballR; ball.dx *= -1; }
        if(ball.x + ballR > width){ ball.x = width - ballR; ball.dx *= -1; }
        if(ball.y - ballR < 0){ ball.y = ballR; ball.dy *= -1; }

        if(ball.y + ballR >= paddleY && ball.y + ballR <= paddleY + paddleH + 6 && ball.x >= paddleX && ball.x <= paddleX + paddleW && ball.dy > 0){
          var hitPos = (ball.x - (paddleX + paddleW/2)) / (paddleW/2);
          var mag = Math.sqrt(ball.dx*ball.dx + ball.dy*ball.dy) || 3.2;
          ball.dx = hitPos * mag;
          ball.dy = -Math.abs(mag * 0.94);
          ball.y = paddleY - ballR;
        }

        for(var i=0;i<bricks.length;i++){
          var b = bricks[i];
          if(!b.alive) continue;
          if(ball.x + ballR > b.x && ball.x - ballR < b.x + brickW && ball.y + ballR > b.y && ball.y - ballR < b.y + brickH){
            b.alive = false;
            score += 10;
            scoreEl.textContent = score;
            bestEl.textContent = updateHigh('breakout', score, true);
            maybeDropPower(b);
            var overlapLeft = (ball.x + ballR) - b.x;
            var overlapRight = (b.x + brickW) - (ball.x - ballR);
            var overlapTop = (ball.y + ballR) - b.y;
            var overlapBottom = (b.y + brickH) - (ball.y - ballR);
            var minH = Math.min(overlapLeft, overlapRight);
            var minV = Math.min(overlapTop, overlapBottom);
            if(minH < minV) ball.dx *= -1; else ball.dy *= -1;
            break;
          }
        }
      });

      balls = balls.filter(function(ball){ return ball.resting || ball.y - ballR <= height; });
      if(balls.length===0){
        lives--;
        livesEl.textContent = lives;
        if(lives<=0){
          endGame(false);
          return;
        }
        resetBall();
        msgEl.textContent = 'Click or tap the board to launch';
        return;
      }

      powerups.forEach(function(p){ p.y += 1.6; });
      powerups = powerups.filter(function(p){
        if(p.y > height) return false;
        if(p.y+6 >= paddleY && p.x >= paddleX-6 && p.x <= paddleX+paddleW+6){
          applyPower(p.type);
          return false;
        }
        return true;
      });

      if(bricks.every(function(b){ return !b.alive; })){
        nextLevel();
      }
    }

    function maybeDropPower(brick){
      if(Math.random() > 0.22) return;
      var types = ['W','S','M','M','L'];
      var type = types[Math.floor(Math.random()*types.length)];
      powerups.push({ x: brick.x + brickW/2, y: brick.y + brickH/2, type: type });
    }

    function applyPower(type){
      var now = Date.now();
      if(type==='W'){
        widenUntil = now + 9000;
      } else if(type==='S'){
        slowUntil = now + 7000;
      } else if(type==='L'){
        lives++;
        livesEl.textContent = lives;
      } else if(type==='M'){
        var moving = balls.filter(function(b){ return !b.resting; });
        if(moving.length){
          var extras = [];
          moving.forEach(function(b){
            if(balls.length + extras.length >= 6) return;
            extras.push({ x:b.x, y:b.y, dx:-b.dx || 2, dy:b.dy, resting:false });
          });
          balls = balls.concat(extras);
        }
      }
      msgEl.textContent = '';
    }

    function endGame(won){
      over = true;
      if(loopId) cancelAnimationFrame(loopId);
      msgEl.textContent = won ? ('Board cleared! Score ' + score) : ('Game over — score ' + score + ' (level ' + level + ')');
    }

    function draw(){
      ctx.fillStyle = '#fff';
      ctx.fillRect(0,0,width,height);

      bricks.forEach(function(b){
        if(!b.alive) return;
        ctx.fillStyle = rowColors[b.r % rowColors.length];
        ctx.fillRect(b.x, b.y, brickW, brickH);
      });

      powerups.forEach(function(p){
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(powerLabels[p.type], p.x, p.y);
      });

      var now = Date.now();
      ctx.fillStyle = now < widenUntil ? '#4a6fa5' : '#2c2c2a';
      ctx.fillRect(paddleX, height-20, paddleW, paddleH);

      ctx.fillStyle = now < slowUntil ? '#e8c86e' : '#db5a3c';
      balls.forEach(function(ball){
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballR, 0, Math.PI*2);
        ctx.fill();
      });
    }

    function moveTo(clientX){
      var rect = canvas.getBoundingClientRect();
      var x = (clientX - rect.left) * (width / rect.width);
      paddleX = Math.max(0, Math.min(width - paddleW, x - paddleW/2));
    }

    document.addEventListener('DOMContentLoaded', function(){
      document.getElementById('breakout-new-btn').addEventListener('click', function(){ confirmReset(newBreakoutGame); });

      canvas = document.getElementById('breakout-canvas');
      canvas.addEventListener('mousemove', function(e){ moveTo(e.clientX); });
      canvas.addEventListener('click', function(e){ moveTo(e.clientX); launch(); });
      canvas.addEventListener('touchmove', function(e){ moveTo(e.touches[0].clientX); e.preventDefault(); }, { passive:false });
      canvas.addEventListener('touchstart', function(e){ moveTo(e.touches[0].clientX); launch(); }, { passive:false });

      document.getElementById('breakout-left').addEventListener('mousedown', function(){ keys.left=true; });
      document.getElementById('breakout-left').addEventListener('mouseup', function(){ keys.left=false; });
      document.getElementById('breakout-left').addEventListener('mouseleave', function(){ keys.left=false; });
      document.getElementById('breakout-right').addEventListener('mousedown', function(){ keys.right=true; });
      document.getElementById('breakout-right').addEventListener('mouseup', function(){ keys.right=false; });
      document.getElementById('breakout-right').addEventListener('mouseleave', function(){ keys.right=false; });

      document.addEventListener('keydown', function(e){
        if(!document.getElementById('view-breakout').classList.contains('active')) return;
        if(e.key==='ArrowLeft'){ keys.left=true; e.preventDefault(); }
        else if(e.key==='ArrowRight'){ keys.right=true; e.preventDefault(); }
        else if(e.key===' '){ launch(); e.preventDefault(); }
      });
      document.addEventListener('keyup', function(e){
        if(e.key==='ArrowLeft') keys.left=false;
        else if(e.key==='ArrowRight') keys.right=false;
      });
    });
  })();
