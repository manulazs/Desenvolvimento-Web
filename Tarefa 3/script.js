document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  let overlay = null;

  function createMobileNav() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    const nav = document.createElement('div');
    nav.className = 'mobile-nav';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'mobile-nav-close';
    closeBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    closeBtn.addEventListener('click', closeMobileNav);

    const links = ['Home', 'News', 'Matches', 'Results', 'Events', 'Stats', 'Rankings', 'Forums'];
    nav.appendChild(closeBtn);
    links.forEach((label, i) => {
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'nav-link' + (i === 0 ? ' active' : '');
      a.textContent = label;
      nav.appendChild(a);
    });

    overlay.appendChild(nav);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeMobileNav();
    });
  }

  function openMobileNav() {
    createMobileNav();
    requestAnimationFrame(() => overlay.classList.add('active'));
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (menuBtn) menuBtn.addEventListener('click', openMobileNav);
  const searchBtn = document.querySelector('.search-btn');
  let searchOverlay = null;

  function createSearch() {
    if (searchOverlay) return;
    searchOverlay = document.createElement('div');
    searchOverlay.className = 'search-overlay';
    searchOverlay.innerHTML = `
      <div class="search-box">
        <input class="search-input" type="text" placeholder="Search teams, players, events..." autofocus>
        <div class="search-hint">Press ESC to close</div>
      </div>
    `;
    document.body.appendChild(searchOverlay);
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) closeSearch();
    });
  }

  function openSearch() {
    createSearch();
    requestAnimationFrame(() => {
      searchOverlay.classList.add('active');
      searchOverlay.querySelector('.search-input').focus();
    });
    document.body.style.overflow = 'hidden';
  }

  function closeSearch() {
    if (searchOverlay) searchOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (searchBtn) searchBtn.addEventListener('click', openSearch);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearch();
      closeMobileNav();
    }
    
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.match-card, .news-card, .event-card, .result-row, .player-item').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
  const liveScores = document.querySelectorAll('.match-card.live .match-team-score');
  setInterval(() => {
    liveScores.forEach(score => {
      if (Math.random() > 0.85) {
        const current = parseInt(score.textContent);
        if (!isNaN(current) && current < 16) {
          score.textContent = current + 1;
          score.style.transition = 'transform .2s ease, color .2s ease';
          score.style.transform = 'scale(1.3)';
          score.style.color = '#6366f1';
          setTimeout(() => {
            score.style.transform = 'scale(1)';
            score.style.color = '';
          }, 300);
        }
      }
    });
  }, 5000);
  document.querySelectorAll('.main-nav .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.main-nav .nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
  document.querySelectorAll('.match-card, .news-card, .event-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'all .25s cubic-bezier(.4,0,.2,1)';
    });
  });

});