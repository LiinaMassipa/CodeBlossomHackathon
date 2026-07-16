
const Trigger = (() => {
  const DOUBLE_TAP_DELAY = 350; // milliseconds
  let lastTapTime = 0;
  let tapCount = 0;
  let tapTimer = null;
  let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  let lastTriggerTime = 0;
  const TRIGGER_COOLDOWN = 1000; // Prevent rapid triggering

  function showVisualFeedback() {
    const plusBtn = document.getElementById('btn-plus');
    if (!plusBtn) return;
    
    plusBtn.classList.add('double-tap-hint');
    setTimeout(() => {
      plusBtn.classList.remove('double-tap-hint');
    }, 300);
  }

  function onDoubleTap() {
    const now = Date.now();
    if (now - lastTriggerTime < TRIGGER_COOLDOWN) return;
    lastTriggerTime = now;
    
    showVisualFeedback();
    showSafeScreen();
  }

  function handleTap(e) {
    if (e && e.type === 'click' && isTouchDevice) {
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

    if (tapTimer) {
      clearTimeout(tapTimer);
    }

    if (tapCount >= 2) {
      tapCount = 0;
      onDoubleTap();
      return;
    }

    tapTimer = setTimeout(() => {
      tapCount = 0;
      if (typeof Calculator !== 'undefined') {
        Calculator.setOperator('+');
      }
    }, DOUBLE_TAP_DELAY);
  }

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

    if (history.pushState) {
      history.pushState({ screen: 'safe' }, '', '#emergency');
    }
  }

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

    if (history.pushState) {
      history.pushState({ screen: 'calculator' }, '', '/');
    }

    clearStorage();
  }

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

    requestAnimationFrame(() => {
      if (safeView) safeView.style.transition = '';
      if (calcView) calcView.style.transition = '';
    });

    clearStorage();
  }

  function clearStorage() {
    try {
    
      const preserved = localStorage.getItem('safecalc_custom_contacts');
      if (localStorage.length > 0) localStorage.clear();
      if (preserved) localStorage.setItem('safecalc_custom_contacts', preserved);
    } catch (e) {}
    
    try {
      if (sessionStorage.length > 0) sessionStorage.clear();
    } catch (e) {}
    

    try {
      document.cookie.split(";").forEach(c => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } catch (e) {}
  }

  function handleBackButton() {
    window.addEventListener('popstate', (event) => {
      const safeView = document.getElementById('safe-screen-view');
      if (safeView && safeView.style.display !== 'none') {
        showCalculator();
      }
    });
  }

  function init() {
    const plusBtn = document.getElementById('btn-plus');
    if (!plusBtn) {
      console.warn('Trigger: #btn-plus not found');
      return;
    }

    if (isTouchDevice) {
      plusBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleTap(e);
      });
      plusBtn.addEventListener('click', (e) => {
        if (isTouchDevice) return;
        handleTap(e);
      });
    } else {
      plusBtn.addEventListener('click', handleTap);
    }

    handleBackButton();
  }

  return {
    init,
    showCalculator,
    showSafeScreen,
    hideSafeScreenInstantly
  };
})();