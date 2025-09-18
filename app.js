document.addEventListener('DOMContentLoaded', () => {
    const contentSection = document.querySelector('.content-section');
    const membersSection = document.querySelector('.members-section');
  
    // Entrance for top cards
    const cards = Array.from(document.querySelectorAll('.card'));
    const baseDelay = 800;
    cards.forEach((card, i) => setTimeout(() => card.classList.add('show'), i * baseDelay));
  
    // Background fade for content-section
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const triggerTop = membersSection ? (membersSection.offsetTop - window.innerHeight) : Infinity;
      const prog = Math.min(Math.max((scrollY - triggerTop) / window.innerHeight, 0), 1);
      const op = 0.4 * (1 - prog);
      contentSection.style.setProperty('--bg-opacity', op.toString());
    });
  
    // Move/enlarge helpers for top cards
    function setShiftTowardViewportCenter(el, factor) {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      const r = el.getBoundingClientRect();
      const ex = r.left + r.width / 2, ey = r.top + r.height / 2;
      el.style.setProperty('--tx', `${(cx - ex) * factor}px`);
      el.style.setProperty('--ty', `${(cy - ey) * factor}px`);
    }
    const FOCUS_FACTOR = 0.45;
  
    // After-text from data-after
    cards.forEach(card => {
      const afterNode = card.querySelector('.label.after');
      if (afterNode) afterNode.textContent = card.getAttribute('data-after') || '';
    });
  
    const pending = new WeakMap(); // { toGray, toAfter }
    function clearTimers(card) {
      const t = pending.get(card);
      if (!t) return;
      if (t.toGray) clearTimeout(t.toGray);
      if (t.toAfter) clearTimeout(t.toAfter);
      pending.delete(card);
    }
    function resetCard(card) {
      clearTimers(card);
      card.classList.remove('after-shown', 'gray', 'transitioning', 'focus');
      card.style.removeProperty('--tx');
      card.style.removeProperty('--ty');
    }
    function resetOthers(except) {
      cards.forEach(c => { if (c !== except) resetCard(c); });
    }
    function runSwapSequence(card) {
      resetOthers(card);
      clearTimers(card);
      if (card.classList.contains('after-shown')) return;
      setShiftTowardViewportCenter(card, FOCUS_FACTOR);
      card.classList.add('focus');
      card.classList.add('transitioning');
      const toGray = setTimeout(() => {
        card.classList.add('gray');
        const toAfter = setTimeout(() => {
          card.classList.add('after-shown');
        }, 80);
        pending.set(card, { ...(pending.get(card) || {}), toAfter });
      }, 220);
      pending.set(card, { toGray, toAfter: null });
    }
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => runSwapSequence(card));
      card.addEventListener('mouseleave', () => resetCard(card));
      card.addEventListener('click', () => {
        const isActive = card.classList.contains('after-shown') ||
                         card.classList.contains('transitioning') ||
                         card.classList.contains('focus');
        if (isActive) resetCard(card);
        else runSwapSequence(card);
      });
    });
    window.addEventListener('resize', () => {
      document.querySelectorAll('.card.focus').forEach(card => {
        setShiftTowardViewportCenter(card, FOCUS_FACTOR);
      });
    }, { passive: true });
  
    // Members: reveal 6 cards sequentially on scroll
    const memberCards = Array.from(document.querySelectorAll('.member-card'));
    const memberBaseDelay = 150;
    const grid = document.querySelector('.members-grid');
    if (grid && memberCards.length) {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          memberCards.forEach((card, i) => {
            setTimeout(() => card.classList.add('show'), i * memberBaseDelay);
          });
          io.disconnect();
        }
      }, { root: null, threshold: 0.3 });
      io.observe(grid);
    }
  
    // Floating updates widget
    const updatesWidget = document.querySelector('.updates-widget');
    function toggleUpdatesVisibility() {
      if (!updatesWidget) return;
      // Only visible while still in content-section area
      const limit = membersSection ? membersSection.offsetTop : Number.MAX_SAFE_INTEGER;
      if (window.scrollY + 60 < limit) {
        updatesWidget.classList.add('visible');
      } else {
        updatesWidget.classList.remove('visible', 'expanded');
        updatesWidget.setAttribute('aria-expanded', 'false');
      }
    }
    toggleUpdatesVisibility();
    window.addEventListener('scroll', toggleUpdatesVisibility, { passive: true });
  
    if (updatesWidget) {
      updatesWidget.addEventListener('click', () => {
        const isExpanded = updatesWidget.classList.toggle('expanded');
        updatesWidget.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      });
    }
  });
  