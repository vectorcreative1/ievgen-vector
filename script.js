(function () {
  const navLogo = document.querySelector('.nav-logo');
  const navLogoHero = document.getElementById('hero-scroll');
  if (navLogo) {
    const toggleNavLogo = () => {
      // stay visible for the entire hero-scroll animation (the sticky
      // CREATIVE/DIRECTOR pin), only hide once we've scrolled past it
      const stillInHero = navLogoHero ? navLogoHero.getBoundingClientRect().bottom > 0 : window.scrollY <= 80;
      navLogo.classList.toggle('is-hidden', !stillInHero);
    };
    toggleNavLogo();
    window.addEventListener('scroll', toggleNavLogo, { passive: true });
    window.addEventListener('resize', toggleNavLogo);
  }

  const menuToggle = document.getElementById('menu-toggle');
  const menuOverlay = document.getElementById('menu-overlay');

  if (menuToggle && menuOverlay) {
    const openMenu = () => {
      menuOverlay.classList.add('is-open');
      menuToggle.classList.add('menu-open');
      document.body.classList.add('menu-open-state');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuOverlay.setAttribute('aria-hidden', 'false');
    };
    const closeMenu = () => {
      menuOverlay.classList.remove('is-open');
      menuToggle.classList.remove('menu-open');
      document.body.classList.remove('menu-open-state');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuOverlay.setAttribute('aria-hidden', 'true');
    };
    menuToggle.addEventListener('click', () => {
      menuOverlay.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', (e) => {
      if (
        menuOverlay.classList.contains('is-open') &&
        !e.target.closest('.menu-shell') &&
        !e.target.closest('#menu-toggle')
      ) closeMenu();
    });
    document.querySelectorAll('.menu-links a').forEach((a) => {
      const closeOnNav = () => closeMenu();
      a.addEventListener('click', closeOnNav);
    });
  }

  const currentFile = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu-links a').forEach((a) => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === currentFile) a.classList.add('current');
  });

  const heroScroll = document.getElementById('hero-scroll');
  if (heroScroll) {
    const creativeEl = document.getElementById('hw-creative');
    const directorEl = document.getElementById('hw-director');
    const faceEl = document.getElementById('hero-face-wrap');
    const bgEl = document.getElementById('hero-bg').querySelector('img');
    let ticking = false;

    const update = () => {
      const total = heroScroll.offsetHeight - window.innerHeight;
      const rect = heroScroll.getBoundingClientRect();
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      const progress = total > 0 ? scrolled / total : 0;

      // words: ease-out so they feel quick at first but keep drifting
      // for the whole scroll range — never freeze mid-scroll
      const wordProgress = 1 - Math.pow(1 - progress, 3);
      creativeEl.style.transform = `translateX(${(1 - wordProgress) * -48}vw)`;
      directorEl.style.transform = `translateX(${(1 - wordProgress) * 48}vw)`;

      // face: starts lower, rises slowly, ends flush with the bottom
      // edge so the white section below starts with no black gap
      const faceY = 160 - progress * 160;
      faceEl.style.transform = `translateY(${faceY}px)`;

      // background: subtle parallax, slower than the face
      bgEl.style.transform = `translateY(${progress * -50}px)`;

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  const blinkEl = document.getElementById('hero-face-blink');
  if (blinkEl) {
    const doBlink = () => {
      blinkEl.classList.add('is-blinking');
      setTimeout(() => blinkEl.classList.remove('is-blinking'), 130);
      setTimeout(doBlink, 2400 + Math.random() * 4200);
    };
    setTimeout(doBlink, 1800 + Math.random() * 1800);
  }


  const factsSection = document.querySelector('.facts-section');
  const factsHeading = document.getElementById('facts-heading');
  if (factsSection && factsHeading) {
    const speed = 0.55; // px of translateX per px scrolled — keeps drifting, never settles
    let factsTicking = false;

    const updateFacts = () => {
      const rect = factsSection.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 right when the section's top edge is still at the bottom of the
      // viewport (i.e. it's just barely visible/entering) — so the heading
      // is already in frame at that point, not shifted miles off-screen.
      // From there it keeps drifting with every scroll pixel, never
      // clamped, so it never "arrives" and stops.
      const shift = (vh - rect.top) * speed;
      factsHeading.style.transform = `translateX(${shift}px)`;
      factsTicking = false;
    };

    const onFactsScroll = () => {
      if (!factsTicking) {
        requestAnimationFrame(updateFacts);
        factsTicking = true;
      }
    };

    updateFacts();
    window.addEventListener('scroll', onFactsScroll, { passive: true });
    window.addEventListener('resize', onFactsScroll);
  }

  const dodgeBtn = document.getElementById('dodge-btn');
  if (dodgeBtn) {
    const dodgeContainer = dodgeBtn.parentElement;
    const fleeRadius = 130;
    const margin = 16;

    const randomPos = () => {
      const cw = dodgeContainer.clientWidth;
      const ch = dodgeContainer.clientHeight;
      const bw = dodgeBtn.offsetWidth;
      const bh = dodgeBtn.offsetHeight;
      const maxX = Math.max(cw - bw - margin * 2, margin);
      const maxY = Math.max(ch - bh - margin * 2, margin);
      return {
        x: margin + Math.random() * maxX,
        y: margin + Math.random() * maxY,
      };
    };

    const setPos = (pos) => {
      dodgeBtn.style.left = pos.x + 'px';
      dodgeBtn.style.top = pos.y + 'px';
    };

    setPos(randomPos());

    const dodge = (clientX, clientY) => {
      const rect = dodgeBtn.getBoundingClientRect();
      const btnCx = rect.left + rect.width / 2;
      const btnCy = rect.top + rect.height / 2;
      if (Math.hypot(clientX - btnCx, clientY - btnCy) < fleeRadius) {
        const containerRect = dodgeContainer.getBoundingClientRect();
        let pos = randomPos();
        let tries = 0;
        while (
          tries < 8 &&
          Math.hypot(
            containerRect.left + pos.x + rect.width / 2 - clientX,
            containerRect.top + pos.y + rect.height / 2 - clientY
          ) < fleeRadius
        ) {
          pos = randomPos();
          tries++;
        }
        setPos(pos);
      }
    };

    window.addEventListener('mousemove', (e) => dodge(e.clientX, e.clientY), { passive: true });
    dodgeBtn.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      if (t) dodge(t.clientX, t.clientY);
    }, { passive: true });
    window.addEventListener('resize', () => setPos(randomPos()));
  }

  // Fact media boxes: if an item has 2+ images inside, cycle them fast on
  // hover, show a dot per image, and let clicking a dot jump straight to it.
  document.querySelectorAll('.fact-media').forEach((media) => {
    const imgs = media.querySelectorAll('img');
    if (imgs.length === 0) return;
    imgs[0].classList.add('active');
    if (imgs.length < 2) return;

    let idx = 0;
    let cycleId = null;

    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'fact-media-dots';
    const dots = Array.from(imgs).map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'fact-media-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Image ${i + 1}`);
      dotsWrap.appendChild(dot);
      return dot;
    });
    media.appendChild(dotsWrap);

    const setActive = (newIdx) => {
      imgs[idx].classList.remove('active');
      dots[idx].classList.remove('active');
      idx = newIdx;
      imgs[idx].classList.add('active');
      dots[idx].classList.add('active');
    };

    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        setActive(i);
      });
    });

    media.addEventListener('mouseenter', () => {
      cycleId = setInterval(() => {
        setActive((idx + 1) % imgs.length);
      }, 750);
    });
    media.addEventListener('mouseleave', () => {
      clearInterval(cycleId);
      setActive(0);
    });
  });

  // Facts ride upward as they travel through the viewport. Each item's
  // lift is clamped to its own max (bounded, not ever-growing), and later
  // items get a bigger max than earlier ones — so the gaps between rows
  // visibly close up while an item is in view, without the offset
  // ballooning once it has scrolled past (which was pulling the last
  // item way up and leaving a huge gap before the next section).
  const factItems = document.querySelectorAll('.fact-item');
  if (factItems.length) {
    const baseMax = 40; // px
    const maxStep = 32; // px added per item index
    let factsLiftTicking = false;

    const updateFactsLift = () => {
      const vh = window.innerHeight;
      factItems.forEach((item, i) => {
        const rect = item.getBoundingClientRect();
        // 0 when the item is entering at the bottom of the screen, 1 once
        // it has reached the top — clamped, so it never overshoots
        const progress = Math.max(0, Math.min(1, (vh - rect.top) / vh));
        const maxLift = baseMax + i * maxStep;
        const offset = -progress * maxLift;
        item.style.transform = `translateY(${offset}px)`;
      });
      factsLiftTicking = false;
    };

    const onFactsLiftScroll = () => {
      if (!factsLiftTicking) {
        requestAnimationFrame(updateFactsLift);
        factsLiftTicking = true;
      }
    };

    updateFactsLift();
    window.addEventListener('scroll', onFactsLiftScroll, { passive: true });
    window.addEventListener('resize', onFactsLiftScroll);
  }

  const projectHeroImg = document.querySelector('.project-hero img');
  const projectParallaxSections = document.querySelectorAll(
    '.project-big-heading, .project-text-section, .project-center-video-section, .project-team-quote'
  );
  const projectPhoneGrid = document.querySelector('.project-phone-grid');
  const projectPhoneItems = Array.from(projectPhoneGrid ? projectPhoneGrid.querySelectorAll('.project-phone-item') : []);
  const projectSquareGrid = document.querySelector('.project-square-grid');
  const projectSquareItems = Array.from(projectSquareGrid ? projectSquareGrid.querySelectorAll('.project-square-item') : []);
  const projectParallaxImgs = Array.from(document.querySelectorAll('.project-parallax'));

  if (projectHeroImg || projectParallaxSections.length || projectPhoneItems.length || projectSquareItems.length || projectParallaxImgs.length) {
    const isMobileWidth = () => window.innerWidth <= 640;
    const staggerSteps = [0, 180, 360];
    projectPhoneItems.forEach((el) => { el.style.transition = 'none'; });
    projectSquareItems.forEach((el) => { el.style.transition = 'none'; });

    const staggerGrid = (items) => {
      if (!items.length) return;
      const rect = items[0].parentElement.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, 1 - rect.top / vh));
      const fadeIn = Math.max(0, Math.min(1, progress / 0.2));
      if (isMobileWidth()) {
        const offset = (1 - progress) * 60;
        items.forEach((item) => {
          item.style.transform = `translateY(${offset}px)`;
          item.style.opacity = fadeIn;
        });
      } else {
        const alignProgress = Math.max(0, Math.min(1, (progress + 0.1) / 1.1));
        items.forEach((item, i) => {
          const stagger = staggerSteps[i] * (1 - alignProgress);
          item.style.transform = `translateY(${stagger}px)`;
          item.style.opacity = fadeIn;
        });
      }
    };

    let projectTicking = false;
    const updateProjectParallax = () => {
      if (projectHeroImg) {
        // the image never moves — translating it would pan which part of
        // the photo sits at the very top, which reads as "the top got
        // cropped". instead the top stays pixel-for-pixel fixed and a
        // clip-path eats into the bottom only, as if the image were
        // sinking away behind the mask while you scroll past it.
        const containerHeight = projectHeroImg.parentElement.offsetHeight;
        const progress = Math.max(0, Math.min(1, window.scrollY / containerHeight));
        const hideBottom = progress * containerHeight * 0.5;
        projectHeroImg.style.clipPath = `inset(0 0 ${hideBottom}px 0)`;
      }
      projectParallaxSections.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));
        el.style.transform = `translateY(${(1 - progress) * 90}px)`;
      });
      staggerGrid(projectPhoneItems);
      staggerGrid(projectSquareItems);
      projectParallaxImgs.forEach((wrap) => {
        const media = wrap.querySelector('img, video');
        if (!media) return;
        const rect = wrap.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
        // pan within the crop margin object-fit:cover already reserves,
        // instead of resizing the element — resizing it risked flipping
        // the crop from vertical to horizontal depending on how close the
        // asset's own ratio was to the container's.
        media.style.objectPosition = `50% ${20 + progress * 60}%`;
      });
      projectTicking = false;
    };
    const onProjectScroll = () => {
      if (!projectTicking) {
        requestAnimationFrame(updateProjectParallax);
        projectTicking = true;
      }
    };

    updateProjectParallax();
    window.addEventListener('scroll', onProjectScroll, { passive: true });
    window.addEventListener('resize', onProjectScroll);
  }

  document.querySelectorAll('.project-video-wrap').forEach((wrap) => {
    const video = wrap.querySelector('video');
    if (!video) return;
    wrap.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        wrap.classList.add('playing');
      } else {
        video.pause();
        wrap.classList.remove('playing');
      }
    });
    video.addEventListener('ended', () => wrap.classList.remove('playing'));
  });

  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal, .stagger').forEach((el) => revealIO.observe(el));
})();
