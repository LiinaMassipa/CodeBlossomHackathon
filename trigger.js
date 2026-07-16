/**
 * Trigger Module
 * Handles double-tap detection on the '+' button to reveal emergency screen
 */
const Trigger = (() => {
  const DOUBLE_TAP_DELAY = 350; // milliseconds
  let lastTapTime = 0;
  let tapCount = 0;
  let tapTimer = null;
  let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  let lastTriggerTime = 0;
  const TRIGGER_COOLDOWN = 1000; // Prevent rapid triggering

  /**
   * Show visual feedback for double-tap
   */
  function showVisualFeedback() {
    const plusBtn = document.getElementById('btn-plus');
    if (!plusBtn) return;
    
    plusBtn.classList.add('double-tap-hint');
    setTimeout(() => {
      plusBtn.classList.remove('double-tap-hint');
    }, 300);
  }

  /**
   * Called when double-tap is detected
   */
  function onDoubleTap() {
    const now = Date.now();
    if (now - lastTriggerTime < TRIGGER_COOLDOWN) return;
    lastTriggerTime = now;
    
    showVisualFeedback();
    showSafeScreen();
  }

  /**
   * Handle tap/click event
   */
  function handleTap(e) {
    // Don't trigger if event is from keyboard or other source
    if (e && e.type === 'click' && isTouchDevice) {
      // On touch devices, click fires after touchend, so we ignore it
      return;
    }
    
    const now = Date.now();
    const timeSinceLast = now - lastTapTime;
    lastTapTime = now;

    if (timeSinceLast <= DOUBLE_TAP_DELAY) {
      tapCount++;
    } else {
      tapCount = 1;
    }

    // Clear existing timer
    if (tapTimer) {
      clearTimeout(tapTimer);
    }

    // Double tap detected -> open the safe screen, do NOT add '+' to the sum
    if (tapCount >= 2) {
      tapCount = 0;
      onDoubleTap();
      return;
    }

    // Not a double tap (yet). We intercept the click/touchend on this button,
    // so calculator.js never sees it. Once the double-tap window closes
    // without a second tap, treat it as a normal '+' press.
    tapTimer = setTimeout(() => {
      tapCount = 0;
      if (typeof Calculator !== 'undefined') {
        Calculator.setOperator('+');
      }
    }, DOUBLE_TAP_DELAY);
  }

  /**
   * Show emergency safe screen
   */
  function showSafeScreen() {
    const calcView = document.getElementById('calculator-view');
    const safeView = document.getElementById('safe-screen-view');
    
    if (calcView) {
      calcView.style.opacity = '0';
      setTimeout(() => {
        calcView.style.display = 'none';
      }, 200);
    }
    
    if (safeView) {
      safeView.style.display = 'flex';
      safeView.style.opacity = '0';
      setTimeout(() => {
        safeView.style.opacity = '1';
      }, 50);
    }
    
    // Update browser history for back button support
    if (history.pushState) {
      history.pushState({ screen: 'safe' }, '', '#emergency');
    }
  }

  /**
   * Show calculator screen
   */
  function showCalculator() {
    const calcView = document.getElementById('calculator-view');
    const safeView = document.getElementById('safe-screen-view');
    
    if (safeView) {
      safeView.style.opacity = '0';
      setTimeout(() => {
        safeView.style.display = 'none';
        safeView.style.opacity = '1';
      }, 200);
    }
    
    if (calcView) {
      calcView.style.display = 'flex';
      setTimeout(() => {
        calcView.style.opacity = '1';
      }, 50);
    }
    
    // Update browser history
    if (history.pushState) {
      history.pushState({ screen: 'calculator' }, '', '/');
    }
    
    // Clear any storage for privacy
    clearStorage();
  }

  /**
   * Instantly snap back to the calculator with NO fade/animation.
   * Used when the app loses focus (tab switch, app-switcher, screen lock)
   * so the OS can't capture a screenshot mid-fade with the safe screen
   * still partially visible.
   */
  function hideSafeScreenInstantly() {
    const calcView = document.getElementById('calculator-view');
    const safeView = document.getElementById('safe-screen-view');

    if (safeView) {
      safeView.style.transition = 'none';
      safeView.style.display = 'none';
      safeView.style.opacity = '1'; // reset so the next open looks normal
    }

    if (calcView) {
      calcView.style.transition = 'none';
      calcView.style.display = 'flex';
      calcView.style.opacity = '1';
    }

    // Re-enable transitions on the next frame so future user-initiated
    // opens/closes still animate normally.
    requestAnimationFrame(() => {
      if (safeView) safeView.style.transition = '';
      if (calcView) calcView.style.transition = '';
    });

    clearStorage();
  }

  /**
   * Clear browser storage for privacy
   */
  function clearStorage() {
    try {
      // Preserve the user's custom emergency contacts across privacy wipes.
      const preserved = localStorage.getItem('safecalc_custom_contacts');
      if (localStorage.length > 0) localStorage.clear();
      if (preserved) localStorage.setItem('safecalc_custom_contacts', preserved);
    } catch (e) {}
    
    try {
      if (sessionStorage.length > 0) sessionStorage.clear();
    } catch (e) {}
    
    // Clear cookies
    try {
      document.cookie.split(";").forEach(c => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } catch (e) {}
  }

  /**
   * Handle browser back button
   */
  function handleBackButton() {
    window.addEventListener('popstate', (event) => {
      const safeView = document.getElementById('safe-screen-view');
      if (safeView && safeView.style.display !== 'none') {
        showCalculator();
      }
    });
  }

  /**
   * Initialize trigger module
   */
  function init() {
    const plusBtn = document.getElementById('btn-plus');
    if (!plusBtn) {
      console.warn('Trigger: #btn-plus not found');
      return;
    }

    // Handle both touch and mouse events appropriately
    if (isTouchDevice) {
      plusBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleTap(e);
      });
      // Also listen for click but ignore it on touch devices
      plusBtn.addEventListener('click', (e) => {
        if (isTouchDevice) return;
        handleTap(e);
      });
    } else {
      plusBtn.addEventListener('click', handleTap);
    }

    // Handle back button
    handleBackButton();
  }

  // Public API
  return {
    init,
    showCalculator,
    showSafeScreen,
    hideSafeScreenInstantly
  };
})();