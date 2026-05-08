/* =============================================
   ElevateIQ — Script
   ============================================= */

(function () {
  'use strict';

  /* ── Navbar scroll effect ── */
  const navbar = document.getElementById('navbar');

  function onScroll() {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    // Active nav link highlight
    const sections = document.querySelectorAll('section[id]');
    const scrollY  = window.scrollY + 90;
    sections.forEach(sec => {
      const top    = sec.offsetTop;
      const height = sec.offsetHeight;
      const id     = sec.getAttribute('id');
      const link   = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) {
        if (scrollY >= top && scrollY < top + height) link.classList.add('active');
        else link.classList.remove('active');
      }
    });

    // Back to top button
    const btt = document.getElementById('backToTop');
    if (window.scrollY > 400) btt.classList.add('visible');
    else btt.classList.remove('visible');

    triggerCounters();
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Hamburger menu ── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  /* ── Smooth scroll for all anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Scroll-reveal (IntersectionObserver) ── */
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── Animated number counters ── */
  let countersTriggered = false;

  function animateCounter(el, target, duration) {
    const start = performance.now();
    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.floor(eased * target);
      el.textContent = current >= 1000
        ? current.toLocaleString('en-IN')
        : current;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target >= 1000
        ? target.toLocaleString('en-IN')
        : target;
    }
    requestAnimationFrame(step);
  }

  function triggerCounters() {
    if (countersTriggered) return;
    const resultsSection = document.getElementById('results');
    if (!resultsSection) return;
    const rect = resultsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      countersTriggered = true;
      document.querySelectorAll('[data-target]').forEach(el => {
        animateCounter(el, +el.dataset.target, 2200);
      });
    }
  }

  // Hero stat counters animate on page load
  setTimeout(() => {
    document.querySelectorAll('.stat-number').forEach(el => {
      animateCounter(el, +el.dataset.target, 1800);
    });
  }, 500);

  /* ── Floating particle background (Hero) ── */
  const particleContainer = document.getElementById('particles');

  function createParticles() {
    const count  = 28;
    const colors = [
      'rgba(0,229,176,',
      'rgba(30,111,255,',
      'rgba(255,255,255,'
    ];
    for (let i = 0; i < count; i++) {
      const p         = document.createElement('div');
      p.className     = 'particle';
      const size      = Math.random() * 5 + 2;
      const colorBase = colors[Math.floor(Math.random() * colors.length)];
      const opacity   = (Math.random() * 0.4 + 0.1).toFixed(2);
      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${colorBase}${opacity});
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation-duration: ${4 + Math.random() * 6}s;
        animation-delay: ${Math.random() * 4}s;
      `;
      particleContainer.appendChild(p);
    }
  }

  createParticles();

  /* ── Testimonials Slider ── */
  const track    = document.getElementById('testimonialsTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('sliderDots');

  if (track) {
    const cards      = track.querySelectorAll('.testimonial-card');
    const totalCards = cards.length;
    let current      = 0;
    let autoTimer;

    function visibleCount() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 900) return 2;
      return 3;
    }

    function maxIndex() {
      return totalCards - visibleCount();
    }

    // Build navigation dots
    function buildDots() {
      dotsWrap.innerHTML = '';
      const total = maxIndex() + 1;
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === current ? ' active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }

    function updateDots() {
      dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, maxIndex()));
      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap       = 24;
      track.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;
      updateDots();
    }

    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    function startAuto() {
      autoTimer = setInterval(() => {
        current >= maxIndex() ? goTo(0) : goTo(current + 1);
      }, 4500);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    // Rebuild slider on window resize
    window.addEventListener('resize', () => {
      buildDots();
      goTo(Math.min(current, maxIndex()));
    });

    buildDots();
    goTo(0);
    startAuto();

    // Touch / swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? goTo(current + 1) : goTo(current - 1);
        resetAuto();
      }
    });
  }

  /* ── Contact Form ── */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn     = contactForm.querySelector('.submit-btn');
      btn.disabled  = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      // Simulate async submission (replace with real API call)
      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Enquiry';
        btn.disabled  = false;
        formSuccess.classList.add('show');
        contactForm.reset();
        setTimeout(() => formSuccess.classList.remove('show'), 6000);
      }, 1500);
    });
  }

  /* ── Back to Top button ── */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Card 3D tilt micro-interaction ── */
  const tiltCards = document.querySelectorAll(
    '.course-card, .achievement-card, .topper-card'
  );

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const x     = e.clientX - rect.left  - rect.width  / 2;
      const y     = e.clientY - rect.top   - rect.height / 2;
      const tiltX = -(y / rect.height) * 6;
      const tiltY =  (x / rect.width)  * 6;
      card.style.transform =
        `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ── Achievement counters via IntersectionObserver ── */
  const achievementSection = document.getElementById('results');
  if (achievementSection) {
    const achObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            document.querySelectorAll('.achievement-number[data-target]')
              .forEach(el => animateCounter(el, +el.dataset.target, 2400));
            achObserver.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    achObserver.observe(achievementSection);
  }

  /* ── Run once on load ── */
  onScroll();

})();