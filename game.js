(function () {
  const playBtn = document.getElementById('invaders-play');
  const resultEl = document.getElementById('invaders-result');
  const arena = document.getElementById('invaders-arena');
  const logosEl = document.getElementById('client-logos');
  const ship = document.getElementById('invaders-ship');
  if (!playBtn || !arena || !logosEl || !ship) return;

  const RESULT_MESSAGE = 'Which brand will my ideas fly into next?';

  const SHIP_W = 132;
  const SHIP_H = 195;
  const SHIP_BOTTOM = -160;
  const BULLET_W = 38;
  const BULLET_H = 72;
  const FEEDBACK_W = 14;
  const FEEDBACK_H = 95;
  const FEEDBACK_SPEED = 2.4;
  const SHOT_INTERVAL = 1100;
  const BULLET_SPEED = 2.6;
  const PAIN_DURATION = 380;
  const IDEA_DURATION = 150;
  const BURST_COLORS = ['#000', '#e3151a', '#f3e600'];
  const FEEDBACK_BURST_COLORS = ['#e3151a'];

  let logos = [];
  let bullets = [];
  let enemyBullets = [];
  let active = false;
  let formationX = 0;
  let dir = 1;
  let wobbleY = 0;
  let shipX = 0;
  let shipSpeed = 6;
  let wasMoving = false;
  let lastShot = 0;
  let lastEnemyShot = 0;
  let painTimer = null;
  let ideaTimer = null;
  let animId = null;
  const keys = {};

  function currentLogoScale() {
    const w = window.innerWidth;
    if (w <= 520) return 0.6;
    if (w <= 900) return 0.85;
    return 1;
  }

  function centerShip() {
    shipX = arena.clientWidth / 2 - SHIP_W / 2;
    ship.style.left = shipX + 'px';
  }
  centerShip();

  function collectLogos() {
    logos = Array.from(logosEl.querySelectorAll('.client-logo')).map((el) => ({
      el,
      alive: true,
    }));
  }

  function resetLogos() {
    logos.forEach((l) => {
      l.alive = true;
      l.el.classList.remove('is-hit');
      l.el.style.transform = '';
    });
  }

  function clearBullets() {
    bullets.forEach((b) => { if (b.el.parentNode) b.el.parentNode.removeChild(b.el); });
    bullets = [];
    enemyBullets.forEach((b) => { if (b.el.parentNode) b.el.parentNode.removeChild(b.el); });
    enemyBullets = [];
  }

  function shipTop() {
    return arena.clientHeight - SHIP_H - SHIP_BOTTOM;
  }

  function spawnBullet() {
    const el = document.createElement('div');
    el.className = 'invaders-bullet';
    const x = shipX + SHIP_W / 2 - BULLET_W / 2;
    const y = shipTop() - BULLET_H + 10;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    arena.appendChild(el);
    bullets.push({ el, x, y });
    triggerIdea();
  }

  function spawnFeedback(logo) {
    const r = baseRect(logo.el);
    const x = r.left + formationX + (r.right - r.left) / 2 - FEEDBACK_W / 2;
    const y = r.bottom + wobbleY;
    const el = document.createElement('div');
    el.className = 'invaders-feedback';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    arena.appendChild(el);
    enemyBullets.push({ el, x, y });
  }

  function baseRect(el) {
    return {
      left: el.offsetLeft,
      top: el.offsetTop,
      right: el.offsetLeft + el.offsetWidth,
      bottom: el.offsetTop + el.offsetHeight,
    };
  }

  function spawnBurst(x, y, colors) {
    const palette = colors || BURST_COLORS;
    const count = 10;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'pixel-burst';
      el.style.background = palette[Math.floor(Math.random() * palette.length)];
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.6 - 0.3);
      const dist = 26 + Math.random() * 36;
      el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      el.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      arena.appendChild(el);
      requestAnimationFrame(() => el.classList.add('is-burst'));
      setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 520);
    }
  }

  function triggerShake() {
    ship.classList.remove('is-hit');
    void ship.offsetWidth;
    ship.classList.add('is-hit');
  }

  function triggerLean(angleDeg) {
    ship.style.setProperty('--lean', angleDeg + 'deg');
    ship.classList.remove('is-leaning');
    void ship.offsetWidth;
    ship.classList.add('is-leaning');
  }

  function triggerPain() {
    ship.classList.add('is-pain');
    clearTimeout(painTimer);
    painTimer = setTimeout(() => ship.classList.remove('is-pain'), PAIN_DURATION);
  }

  function triggerIdea() {
    ship.classList.add('is-idea');
    clearTimeout(ideaTimer);
    ideaTimer = setTimeout(() => ship.classList.remove('is-idea'), IDEA_DURATION);
  }

  function update(ts) {
    if (!active) return;

    if (keys.left) shipX -= shipSpeed;
    if (keys.right) shipX += shipSpeed;
    shipX = Math.max(0, Math.min(arena.clientWidth - SHIP_W, shipX));
    ship.style.left = shipX + 'px';

    const isMoving = !!(keys.left || keys.right);
    if (isMoving !== wasMoving) {
      triggerLean(keys.right ? -7 : 7);
      wasMoving = isMoving;
    }

    const range = 16;
    formationX += dir * 0.5;
    if (formationX > range || formationX < -range) dir *= -1;
    wobbleY = Math.sin((formationX / range) * (Math.PI / 2)) * 4;

    const logoScale = currentLogoScale();
    logos.forEach((l) => {
      if (!l.alive) return;
      l.el.style.transform = `translate(${formationX}px, ${wobbleY}px) scale(${logoScale})`;
    });

    if (ts - lastShot > SHOT_INTERVAL) {
      spawnBullet();
      lastShot = ts;
    }

    const aliveLogos = logos.filter((l) => l.alive);
    if (ts - lastEnemyShot > 900 && aliveLogos.length) {
      spawnFeedback(aliveLogos[Math.floor(Math.random() * aliveLogos.length)]);
      lastEnemyShot = ts;
    }

    bullets.forEach((b) => {
      b.y -= BULLET_SPEED;
      b.el.style.top = b.y + 'px';
    });
    enemyBullets.forEach((b) => {
      b.y += FEEDBACK_SPEED;
      b.el.style.top = b.y + 'px';
    });

    bullets.forEach((b) => {
      if (b.hit) return;
      logos.forEach((l) => {
        if (!l.alive) return;
        const r = baseRect(l.el);
        const left = r.left + formationX;
        const right = r.right + formationX;
        const top = r.top + wobbleY;
        const bottom = r.bottom + wobbleY;
        if (
          b.x + BULLET_W > left && b.x < right &&
          b.y < bottom && b.y + BULLET_H > top
        ) {
          l.alive = false;
          l.el.classList.add('is-hit');
          b.hit = true;
          spawnBurst((left + right) / 2, (top + bottom) / 2);
        }
      });
    });

    enemyBullets.forEach((b) => {
      if (b.hit) return;
      const sTop = shipTop();
      if (
        b.x + FEEDBACK_W > shipX && b.x < shipX + SHIP_W &&
        b.y < sTop + SHIP_H && b.y + FEEDBACK_H > sTop
      ) {
        b.hit = true;
        triggerShake();
        triggerPain();
        spawnBurst(shipX + SHIP_W / 2, sTop + SHIP_H / 2, FEEDBACK_BURST_COLORS);
      }
    });

    bullets = bullets.filter((b) => {
      if (b.hit || b.y < -40) {
        if (b.el.parentNode) b.el.parentNode.removeChild(b.el);
        return false;
      }
      return true;
    });

    enemyBullets = enemyBullets.filter((b) => {
      if (b.hit || b.y > arena.clientHeight + 10) {
        if (b.el.parentNode) b.el.parentNode.removeChild(b.el);
        return false;
      }
      return true;
    });

    if (logos.every((l) => !l.alive)) {
      finishGame();
      return;
    }

    animId = requestAnimationFrame(update);
  }

  function finishGame() {
    active = false;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    clearBullets();
    arena.classList.remove('is-playing');
    playBtn.classList.remove('is-gone');
    playBtn.textContent = 'Play Again';
    if (resultEl) {
      resultEl.style.left = logosEl.offsetLeft + 'px';
      resultEl.style.top = logosEl.offsetTop + 'px';
      resultEl.style.width = logosEl.offsetWidth + 'px';
      resultEl.style.height = logosEl.offsetHeight + 'px';
      resultEl.textContent = RESULT_MESSAGE;
      resultEl.classList.add('is-visible');
    }
  }

  function startGame() {
    collectLogos();
    resetLogos();
    clearBullets();
    formationX = 0;
    dir = 1;
    wobbleY = 0;
    wasMoving = false;
    lastShot = 0;
    lastEnemyShot = 0;
    centerShip();
    active = true;
    arena.classList.add('is-playing');
    playBtn.classList.add('is-gone');
    if (resultEl) resultEl.classList.remove('is-visible');
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(update);
    arena.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  window.addEventListener('keydown', (e) => {
    if (!active) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
  });

  function pointerToShip(clientX) {
    const rect = arena.getBoundingClientRect();
    shipX = Math.max(0, Math.min(arena.clientWidth - SHIP_W, clientX - rect.left - SHIP_W / 2));
  }

  arena.addEventListener('mousemove', (e) => {
    if (active) pointerToShip(e.clientX);
  });
  arena.addEventListener('touchmove', (e) => {
    if (!active) return;
    const t = e.touches[0];
    if (t) pointerToShip(t.clientX);
    e.preventDefault();
  }, { passive: false });

  playBtn.addEventListener('click', () => {
    if (!active) startGame();
  });
})();
