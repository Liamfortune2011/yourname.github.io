/* ============ TAG ============ */
  (function(){
    var canvas, ctx, msgEl, timeEl, itEl, scoreEl, bestEl;
    var W = 960, H = 640;
    var mapIdx = 0, roundTime = 60, powersOn = true;
    var walls = [], bouncePads = [], players = [], itIdx = 0, tags = 0;
    var timeLeft = 60, running = false, loopId = null, spawnTimer = 0;
    var powerups = [];
    var keys = {};
    var lastTs = 0;
    var theme = null;

    // Themed maps: bigger, parkour-friendly, with bounce pads and phase-through shortcuts.
    // Side borders are omitted on purpose — players wrap around the left/right edges.
    // Walls flagged pass:true are visual only (dashed) and don't block movement — secret shortcuts.
    // Pads may carry boostX (side launch) and/or `super:true` (extra-high launch).
    var MAP_DATA = [
      // 0 Neon Arena — open cyber stadium with towers & neon platforms
      {
        theme: {
          name: 'Neon Arena',
          bg: '#0d0b1a', grid: 'rgba(120,80,255,0.08)',
          wall: '#2a1f4a', wallTop: '#7c5cff', wallAccent: '#a78bfa',
          floor: '#1a1430', pad: '#22d3ee', padGlow: 'rgba(34,211,238,0.45)'
        },
        walls: [
          // top/bottom border only — sides wrap
          {x:0,y:0,w:960,h:24},{x:0,y:616,w:960,h:24},
          // side towers
          {x:60,y:420,w:90,h:196},{x:810,y:420,w:90,h:196},
          // mid towers / pillars for wall-jump
          {x:200,y:180,w:22,h:160},{x:738,y:180,w:22,h:160},
          {x:340,y:320,w:22,h:140},{x:598,y:320,w:22,h:140},
          // platforms
          {x:100,y:360,w:140,h:18},{x:720,y:360,w:140,h:18},
          {x:280,y:280,w:160,h:18},{x:520,y:280,w:160,h:18},
          {x:380,y:180,w:200,h:18},
          {x:140,y:140,w:110,h:16},{x:710,y:140,w:110,h:16},
          {x:400,y:80,w:160,h:16},
          {x:60,y:500,w:80,h:16},{x:820,y:500,w:80,h:16},
          {x:420,y:460,w:120,h:16},
          // phase-through shortcuts (dashed, walk right through)
          {x:440,y:280,w:80,h:18,pass:true},
          {x:0,y:460,w:60,h:16,pass:true},{x:900,y:460,w:60,h:16,pass:true}
        ],
        pads: [
          {x:180,y:340,w:40,h:12},{x:740,y:340,w:40,h:12},
          {x:460,y:160,w:40,h:12,super:true},
          {x:460,y:440,w:40,h:12},
          {x:100,y:490,w:36,h:12,boostX:420},
          {x:824,y:490,w:36,h:12,boostX:-420}
        ]
      },
      // 1 Jungle Maze — dense vertical shafts, vine platforms, green theme
      {
        theme: {
          name: 'Jungle Maze',
          bg: '#0f1f12', grid: 'rgba(60,140,70,0.07)',
          wall: '#1a3a22', wallTop: '#4ade80', wallAccent: '#86efac',
          floor: '#142818', pad: '#a3e635', padGlow: 'rgba(163,230,53,0.4)'
        },
        walls: [
          {x:0,y:0,w:960,h:24},{x:0,y:616,w:960,h:24},
          // vertical shafts (wall-jump corridors)
          {x:140,y:24,w:28,h:240},{x:140,y:320,w:28,h:296},
          {x:280,y:80,w:28,h:360},
          {x:420,y:24,w:28,h:200},{x:420,y:280,w:28,h:336},
          {x:560,y:100,w:28,h:340},
          {x:700,y:24,w:28,h:240},{x:700,y:320,w:28,h:296},
          {x:820,y:80,w:28,h:300},
          // horizontal ledges
          {x:40,y:280,w:90,h:16},{x:170,y:240,w:100,h:16},
          {x:310,y:180,w:100,h:16},{x:450,y:340,w:100,h:16},
          {x:590,y:220,w:100,h:16},{x:730,y:280,w:90,h:16},
          {x:40,y:420,w:90,h:16},{x:170,y:480,w:100,h:16},
          {x:310,y:400,w:100,h:16},{x:450,y:500,w:100,h:16},
          {x:590,y:420,w:100,h:16},{x:730,y:500,w:90,h:16},
          {x:40,y:140,w:90,h:16},{x:730,y:140,w:90,h:16},
          {x:310,y:80,w:100,h:16},{x:590,y:80,w:100,h:16},
          // phase-through shortcuts through the shaft walls
          {x:140,y:264,w:28,h:56,pass:true},
          {x:560,y:250,w:28,h:70,pass:true}
        ],
        pads: [
          {x:100,y:260,w:36,h:12},{x:360,y:160,w:36,h:12,super:true},
          {x:640,y:200,w:36,h:12},{x:480,y:480,w:36,h:12},
          {x:200,y:460,w:36,h:12,boostX:380}
        ]
      },
      // 2 Sky Islands — floating platforms, open air, blue sky feel
      {
        theme: {
          name: 'Sky Islands',
          bg: '#0c1929', grid: 'rgba(100,160,255,0.06)',
          wall: '#1e3a5f', wallTop: '#38bdf8', wallAccent: '#7dd3fc',
          floor: '#0f2744', pad: '#fbbf24', padGlow: 'rgba(251,191,36,0.45)'
        },
        walls: [
          {x:0,y:0,w:960,h:24},{x:0,y:616,w:960,h:24},
          // ground islands
          {x:40,y:520,w:180,h:20},{x:280,y:520,w:160,h:20},{x:520,y:520,w:160,h:20},{x:740,y:520,w:180,h:20},
          // mid islands
          {x:80,y:400,w:140,h:18},{x:300,y:380,w:150,h:18},{x:520,y:400,w:140,h:18},{x:740,y:380,w:140,h:18},
          // higher
          {x:120,y:280,w:130,h:18},{x:360,y:260,w:160,h:18},{x:600,y:280,w:130,h:18},
          {x:200,y:160,w:140,h:16},{x:480,y:140,w:160,h:16},{x:720,y:160,w:140,h:16},
          {x:380,y:60,w:200,h:16},
          // pillars / wall-jump helpers
          {x:250,y:300,w:20,h:90},{x:690,y:300,w:20,h:90},
          {x:450,y:180,w:20,h:70},
          // phase-through shortcut through the central platform
          {x:400,y:260,w:120,h:18,pass:true}
        ],
        pads: [
          {x:160,y:500,w:40,h:12},{x:360,y:500,w:40,h:12},{x:600,y:500,w:40,h:12},
          {x:200,y:260,w:36,h:12,super:true},{x:560,y:120,w:36,h:12},
          {x:440,y:380,w:36,h:12,boostX:-360}
        ]
      },
      // 3 Lava Forge — industrial / lava pits (safe platforms), warm reds
      {
        theme: {
          name: 'Lava Forge',
          bg: '#1a0a08', grid: 'rgba(220,80,40,0.07)',
          wall: '#3b1c14', wallTop: '#f97316', wallAccent: '#fb923c',
          floor: '#2a120e', pad: '#ef4444', padGlow: 'rgba(239,68,68,0.4)'
        },
        walls: [
          {x:0,y:0,w:960,h:24},{x:0,y:616,w:960,h:24},
          // multi-level floors
          {x:24,y:160,w:320,h:18},{x:400,y:160,w:536,h:18},
          {x:24,y:300,w:380,h:18},{x:460,y:300,w:476,h:18},
          {x:24,y:440,w:260,h:18},{x:340,y:440,w:300,h:18},{x:700,y:440,w:236,h:18},
          // columns / wall-jump
          {x:180,y:178,w:22,h:110},{x:560,y:178,w:22,h:110},
          {x:300,y:318,w:22,h:110},{x:700,y:318,w:22,h:110},
          {x:120,y:458,w:22,h:90},{x:500,y:458,w:22,h:90},{x:800,y:458,w:22,h:90},
          // high platforms
          {x:60,y:90,w:120,h:16},{x:400,y:70,w:160,h:16},{x:780,y:90,w:120,h:16},
          {x:260,y:230,w:100,h:16},{x:600,y:230,w:100,h:16},
          {x:40,y:540,w:100,h:16},{x:420,y:540,w:120,h:16},{x:820,y:540,w:100,h:16},
          // phase-through shortcuts across the multi-level floors
          {x:344,y:160,w:56,h:18,pass:true},
          {x:380,y:300,w:80,h:18,pass:true}
        ],
        pads: [
          {x:100,y:140,w:40,h:12},{x:500,y:140,w:40,h:12,super:true},{x:820,y:140,w:40,h:12},
          {x:220,y:420,w:36,h:12,boostX:360},{x:620,y:420,w:36,h:12,boostX:-360},
          {x:460,y:280,w:40,h:12}
        ]
      }
    ];

    var COLORS = [
      { body: '#2563eb', accent: '#93c5fd', shirt: '#3b82f6' }, // P1 blue
      { body: '#dc2626', accent: '#fca5a5', shirt: '#ef4444' }  // P2 red
    ];
    var POWER_COLORS = { shield: '#54b9ff', speed: '#e8c86e', jump: '#6fae4a' };
    var POWER_ICONS = { shield: '🛡️', speed: '⚡', jump: '⬆️' };

    function rectsOverlap(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }
    function solidAt(px, py, pw, ph) {
      var box = { x: px, y: py, w: pw, h: ph };
      for (var i = 0; i < walls.length; i++) {
        if (walls[i].pass) continue;
        if (rectsOverlap(box, walls[i])) return true;
      }
      return false;
    }
    function padAt(px, py, pw, ph) {
      var box = { x: px, y: py, w: pw, h: ph };
      for (var i = 0; i < bouncePads.length; i++) {
        if (rectsOverlap(box, bouncePads[i])) return bouncePads[i];
      }
      return null;
    }

    function spawnPlayers() {
      var starts = [
        {x: 50, y: 50}, {x: W - 80, y: H - 100},
        {x: 50, y: H - 100}, {x: W - 80, y: 50}
      ];
      players = [
        makePlayer(starts[0].x, starts[0].y, 0, 'P1'),
        makePlayer(starts[1].x, starts[1].y, 1, 'P2')
      ];
      players.forEach(function(p) {
        var tries = 0;
        while (solidAt(p.x, p.y, p.w, p.h) && tries++ < 60) {
          p.x = 40 + Math.random() * (W - 100);
          p.y = 40 + Math.random() * (H - 120);
        }
      });
    }
    function makePlayer(x, y, colorIdx, label) {
      return {
        x: x, y: y, w: 18, h: 34,
        vx: 0, vy: 0,
        grounded: false, wall: 0,
        face: colorIdx === 0 ? 1 : -1,
        shield: 0, speed: 0, jumpBoost: 0,
        colorIdx: colorIdx, label: label,
        anim: 0, _jumpHeld: false, _padCooldown: 0
      };
    }

    function spawnPower() {
      if (!powersOn || powerups.length >= 5) return;
      var types = ['shield', 'speed', 'jump'];
      var type = types[Math.floor(Math.random() * types.length)];
      var x, y, ok = false, tries = 0;
      while (!ok && tries++ < 50) {
        x = 50 + Math.random() * (W - 100);
        y = 50 + Math.random() * (H - 100);
        ok = !solidAt(x, y, 20, 20) && !padAt(x, y, 20, 20);
      }
      if (ok) powerups.push({ x: x, y: y, w: 20, h: 20, type: type, life: 16 });
    }

    window.newTagGame = function() {
      canvas = document.getElementById('tag-canvas');
      ctx = canvas.getContext('2d');
      msgEl = document.getElementById('tag-msg');
      timeEl = document.getElementById('tag-time-val');
      itEl = document.getElementById('tag-it-val');
      scoreEl = document.getElementById('tag-score-val');
      bestEl = document.getElementById('tag-best-val');
      bestEl.textContent = getHigh('tag') || 0;
      var data = MAP_DATA[mapIdx];
      theme = data.theme;
      walls = data.walls.map(function(r){ return { x:r.x, y:r.y, w:r.w, h:r.h, pass: !!r.pass }; });
      bouncePads = data.pads.map(function(r){ return { x:r.x, y:r.y, w:r.w, h:r.h, boostX:r.boostX, super: !!r.super }; });
      powerups = [];
      tags = 0;
      itIdx = Math.random() < 0.5 ? 0 : 1;
      timeLeft = roundTime;
      running = true;
      spawnTimer = 2;
      spawnPlayers();
      timeEl.textContent = Math.ceil(timeLeft);
      itEl.textContent = players[itIdx].label;
      scoreEl.textContent = tags;
      msgEl.textContent = players[itIdx].label + ' is It! · ' + theme.name + ' · Wall-jump · Bounce pads launch you';
      if (loopId) cancelAnimationFrame(loopId);
      lastTs = performance.now();
      loopId = requestAnimationFrame(tick);
    };
    window.initTag = window.newTagGame;

    function tick(ts) {
      if (!running) return;
      var dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      update(dt);
      draw();
      loopId = requestAnimationFrame(tick);
    }

    function update(dt) {
      timeLeft -= dt;
      timeEl.textContent = Math.max(0, Math.ceil(timeLeft));
      if (timeLeft <= 0) {
        running = false;
        var runner = players[1 - itIdx];
        msgEl.textContent = 'Time! ' + runner.label + ' survived. Tags: ' + tags;
        bestEl.textContent = updateHigh('tag', tags, true);
        return;
      }

      var p1 = players[0], p2 = players[1];
      var ax1 = (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0);
      var ax2 = (keys['ArrowRight'] ? 1 : 0) - (keys['ArrowLeft'] ? 1 : 0);
      var jump1 = keys['KeyW'] || keys['Space'];
      var jump2 = keys['ArrowUp'] || keys['ShiftRight'] || keys['ShiftLeft'];
      movePlayer(p1, ax1, jump1, dt);
      movePlayer(p2, ax2, jump2, dt);

      // tag
      var a = players[itIdx], b = players[1 - itIdx];
      if (rectsOverlap(a, b)) {
        if (b.shield > 0) {
          var dx = a.x - b.x, dy = a.y - b.y, len = Math.hypot(dx, dy) || 1;
          a.vx = (dx / len) * 280;
          a.vy = (dy / len) * 220;
          b.shield = Math.max(0, b.shield - 0.5);
        } else {
          itIdx = 1 - itIdx;
          tags++;
          scoreEl.textContent = tags;
          itEl.textContent = players[itIdx].label;
          msgEl.textContent = 'Tagged! ' + players[itIdx].label + ' is now It!';
          var dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
          b.x += (dx / len) * 40;
          b.y += (dy / len) * 30;
          a.vx = -(dx / len) * 90;
          a.vy = -50;
        }
      }

      if (powersOn) {
        spawnTimer += dt;
        if (spawnTimer > 3.8) {
          spawnTimer = 0;
          spawnPower();
        }
        powerups.forEach(function(pu){ pu.life -= dt; });
        powerups = powerups.filter(function(pu){ return pu.life > 0; });
        players.forEach(function(p) {
          for (var i = powerups.length - 1; i >= 0; i--) {
            if (rectsOverlap(p, powerups[i])) {
              var t = powerups[i].type;
              if (t === 'shield') p.shield = 7;
              if (t === 'speed') p.speed = 6.5;
              if (t === 'jump') p.jumpBoost = 7;
              powerups.splice(i, 1);
            }
          }
          if (p.shield > 0) p.shield -= dt;
          if (p.speed > 0) p.speed -= dt;
          if (p.jumpBoost > 0) p.jumpBoost -= dt;
          if (p._padCooldown > 0) p._padCooldown -= dt;
          p.anim += dt * (Math.abs(p.vx) > 20 ? 12 : 4);
        });
      } else {
        players.forEach(function(p){
          if (p._padCooldown > 0) p._padCooldown -= dt;
          p.anim += dt * 4;
        });
      }
    }

    function movePlayer(p, ax, jumpPressed, dt) {
      var base = 200;
      var spd = base * (p.speed > 0 ? 1.85 : 1);
      var grav = 980;
      var jumpV = p.jumpBoost > 0 ? -440 : -355;
      var wallJumpV = p.jumpBoost > 0 ? -410 : -340;
      var wallJumpX = 300;

      if (ax) {
        p.vx += ax * 1900 * dt;
        p.face = ax;
      } else {
        p.vx *= p.grounded ? 0.72 : 0.93;
      }
      var maxH = spd;
      if (p.vx > maxH) p.vx = maxH;
      if (p.vx < -maxH) p.vx = -maxH;

      if (p.wall && !p.grounded && p.vy > 40) p.vy = Math.min(p.vy, 95);

      p.vy += grav * dt;
      if (p.vy > 560) p.vy = 560;

      if (jumpPressed && !p._jumpHeld) {
        if (p.grounded) {
          p.vy = jumpV;
          p.grounded = false;
        } else if (p.wall) {
          p.vy = wallJumpV;
          p.vx = -p.wall * wallJumpX;
          p.face = -p.wall;
          p.wall = 0;
        }
      }
      p._jumpHeld = jumpPressed;

      // X — wrap around the side edges instead of colliding with them
      p.wall = 0;
      var nx = p.x + p.vx * dt;
      if (nx + p.w < 0) nx = W;
      else if (nx > W) nx = -p.w;
      if (!solidAt(nx, p.y, p.w, p.h)) {
        p.x = nx;
      } else {
        if (p.vx > 0) p.wall = 1;
        else if (p.vx < 0) p.wall = -1;
        p.vx = 0;
        if (p.wall === 1) {
          while (solidAt(p.x, p.y, p.w, p.h) && p.x > 0) p.x -= 1;
        } else if (p.wall === -1) {
          while (solidAt(p.x, p.y, p.w, p.h) && p.x < W) p.x += 1;
        }
      }

      // Y + bounce pads
      var ny = p.y + p.vy * dt;
      var hitPad = null;
      if (p.vy > 0 && p._padCooldown <= 0) {
        hitPad = padAt(p.x, ny + p.h - 4, p.w, 8);
      }
      if (hitPad) {
        p.y = hitPad.y - p.h;
        var launchV = hitPad.super ? -680 : -520;
        p.vy = p.jumpBoost > 0 ? launchV - 100 : launchV;
        if (hitPad.boostX) p.vx = hitPad.boostX;
        p.grounded = false;
        p._padCooldown = 0.35;
      } else if (!solidAt(p.x, ny, p.w, p.h)) {
        p.y = ny;
        p.grounded = false;
      } else {
        if (p.vy > 0) {
          p.grounded = true;
          while (solidAt(p.x, p.y, p.w, p.h) && p.y > 0) p.y -= 1;
        } else {
          while (solidAt(p.x, p.y, p.w, p.h) && p.y < H) p.y += 1;
        }
        p.vy = 0;
      }

      // vertical bounds only — sides wrap, handled above
      if (p.y < 6) { p.y = 6; p.vy = 0; }
      if (p.y + p.h > H - 6) { p.y = H - 6 - p.h; p.vy = 0; p.grounded = true; }

      if (!p.grounded) {
        if (solidAt(p.x - 3, p.y + 4, 3, p.h - 8)) p.wall = -1;
        if (solidAt(p.x + p.w, p.y + 4, 3, p.h - 8)) p.wall = 1;
      }
    }

    function drawStickman(p, isIt) {
      var c = COLORS[p.colorIdx];
      var ox = p.x + p.w / 2;
      var oy = p.y + 8;
      var swing = Math.sin(p.anim) * (p.grounded && Math.abs(p.vx) > 30 ? 7 : 2);

      ctx.save();
      if (isIt) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(ox, oy + 8, 24, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (p.shield > 0) {
        ctx.strokeStyle = 'rgba(84,185,255,0.9)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ox, oy + 8, 21, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (p.speed > 0) {
        ctx.strokeStyle = 'rgba(232,200,110,0.55)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(ox, oy + 10);
        ctx.lineTo(ox - p.face * 22, oy + 10);
        ctx.stroke();
      }

      ctx.fillStyle = c.body;
      ctx.beginPath();
      ctx.arc(ox, oy, 7.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = c.body;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ox, oy + 7);
      ctx.lineTo(ox, oy + 21);
      ctx.stroke();

      ctx.strokeStyle = c.shirt;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ox, oy + 9);
      ctx.lineTo(ox, oy + 18);
      ctx.stroke();

      ctx.strokeStyle = c.body;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ox, oy + 11);
      ctx.lineTo(ox - 10, oy + 17 + swing);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ox, oy + 11);
      ctx.lineTo(ox + 10, oy + 17 - swing);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ox, oy + 21);
      ctx.lineTo(ox - 8, oy + 32 - swing * 0.35);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ox, oy + 21);
      ctx.lineTo(ox + 8, oy + 32 + swing * 0.35);
      ctx.stroke();

      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.arc(ox + p.face * 3.5, oy - 1, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isIt ? '#fbbf24' : '#e2e8f0';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.label + (isIt ? ' (IT)' : ''), ox, p.y - 8);

      if (p.jumpBoost > 0) {
        ctx.fillStyle = '#6fae4a';
        ctx.font = '11px sans-serif';
        ctx.fillText('⬆️', ox, p.y - 20);
      }
      ctx.restore();
    }

    function draw() {
      if (!theme) return;
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = theme.grid;
      ctx.lineWidth = 1;
      for (var gx = 0; gx < W; gx += 48) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (var gy = 0; gy < H; gy += 48) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      var grad = ctx.createLinearGradient(0, H - 80, 0, H);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, theme.floor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, H - 80, W, 80);

      // solid walls
      walls.forEach(function(w) {
        if (w.pass) return;
        ctx.fillStyle = theme.wall;
        ctx.fillRect(w.x, w.y, w.w, w.h);
        if (w.h <= 28) {
          ctx.fillStyle = theme.wallTop;
          ctx.fillRect(w.x, w.y, w.w, 5);
          ctx.fillStyle = theme.wallAccent;
          ctx.fillRect(w.x, w.y + 5, w.w, 2);
        } else {
          ctx.fillStyle = theme.wallAccent;
          ctx.fillRect(w.x, w.y, 3, w.h);
          ctx.fillRect(w.x + w.w - 3, w.y, 3, w.h);
        }
      });

      // phase-through shortcuts — dashed outline, translucent fill, walk right through
      walls.forEach(function(w) {
        if (!w.pass) return;
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = theme.wallAccent;
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = theme.wallTop;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 5]);
        ctx.strokeRect(w.x + 1, w.y + 1, w.w - 2, w.h - 2);
        ctx.setLineDash([]);
        ctx.restore();
      });

      // bounce pads (glowing trampolines; boost pads show an arrow, super pads glow brighter)
      bouncePads.forEach(function(pad) {
        var pulse = 0.6 + 0.4 * Math.sin(performance.now() / 180 + pad.x * 0.05);
        ctx.fillStyle = pad.padGlow || theme.padGlow;
        ctx.beginPath();
        ctx.ellipse(pad.x + pad.w / 2, pad.y + pad.h / 2, pad.w * (pad.super ? 1.15 : 0.9), pad.h * 1.8 * pulse, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = theme.pad;
        ctx.fillRect(pad.x, pad.y, pad.w, pad.h);
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(pad.x + 4, pad.y + 2, pad.w - 8, 3);
        ctx.globalAlpha = 1;
        if (pad.boostX) {
          ctx.fillStyle = '#fff';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(pad.boostX > 0 ? '➡️' : '⬅️', pad.x + pad.w/2, pad.y - 6);
        }
        if (pad.super) {
          ctx.fillStyle = '#fff';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('★', pad.x + pad.w/2, pad.y - (pad.boostX ? 18 : 6));
        }
      });

      // powerups
      powerups.forEach(function(pu) {
        var bob = Math.sin(performance.now() / 200 + pu.x) * 3;
        ctx.fillStyle = POWER_COLORS[pu.type] || '#fff';
        ctx.beginPath();
        ctx.arc(pu.x + 10, pu.y + 10 + bob, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(POWER_ICONS[pu.type] || '?', pu.x + 10, pu.y + 11 + bob);
        ctx.textBaseline = 'alphabetic';
      });

      players.forEach(function(p, i) {
        drawStickman(p, i === itIdx);
      });
    }

    document.addEventListener('keydown', function(e) {
      if (!document.getElementById('view-tag').classList.contains('active')) return;
      keys[e.code] = true;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].indexOf(e.code) >= 0) e.preventDefault();
    });
    document.addEventListener('keyup', function(e) {
      keys[e.code] = false;
    });

    document.addEventListener('DOMContentLoaded', function() {
      document.getElementById('tag-new-btn').addEventListener('click', function(){ confirmReset(newTagGame); });
      document.querySelectorAll('.tag-map-btn').forEach(function(b) {
        b.addEventListener('click', function() {
          mapIdx = +b.dataset.map;
          document.querySelectorAll('.tag-map-btn').forEach(function(x){ x.classList.toggle('active', x === b); });
          newTagGame();
        });
      });
      document.querySelector('.tag-map-btn[data-map="0"]').classList.add('active');
      document.querySelectorAll('.tag-time-btn').forEach(function(b) {
        b.addEventListener('click', function() {
          roundTime = +b.dataset.time;
          document.querySelectorAll('.tag-time-btn').forEach(function(x){ x.classList.toggle('active', x === b); });
          newTagGame();
        });
      });
      document.querySelector('.tag-time-btn[data-time="60"]').classList.add('active');
      document.getElementById('tag-powers-btn').addEventListener('click', function() {
        powersOn = !powersOn;
        this.textContent = 'Power-ups: ' + (powersOn ? 'ON' : 'OFF');
        this.classList.toggle('active', powersOn);
        if (!powersOn) powerups = [];
      });
    });
  })();
