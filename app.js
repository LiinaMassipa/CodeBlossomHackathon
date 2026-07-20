const App = (() => {
  let isInitialized = false;

  function runPrivacyAudit() {

    try {
      if (localStorage.length > 0) {
        console.log('[Privacy] Clearing localStorage');
        const preservedContacts = localStorage.getItem('safecalc_custom_contacts');
        localStorage.clear();
        if (preservedContacts) {
          localStorage.setItem('safecalc_custom_contacts', preservedContacts);
        }
      }
    } catch (e) {
      console.warn('[Privacy] Could not clear localStorage:', e);
    }

    try {
      if (sessionStorage.length > 0) {
        console.log('[Privacy] Clearing sessionStorage');
        sessionStorage.clear();
      }
    } catch (e) {
      console.warn('[Privacy] Could not clear sessionStorage:', e);
    }

    try {
      if (document.cookie.length > 0) {
        console.log('[Privacy] Clearing cookies');
        document.cookie.split(";").forEach(c => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }
    } catch (e) {
      console.warn('[Privacy] Could not clear cookies:', e);
    }

    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('spellcheck', 'false');
    });
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      lockForPrivacy();
    }
  }

  function lockForPrivacy() {
    const safeView = document.getElementById('safe-screen-view');
    if (safeView && safeView.style.display !== 'none' && typeof Trigger !== 'undefined') {
      console.log('[Privacy] App losing focus, snapping back to calculator');
      Trigger.hideSafeScreenInstantly();
    }

    runPrivacyAudit();
  }

  function handleBeforeUnload() {
    runPrivacyAudit();
  }

  function handleOrientationChange() {

    setTimeout(() => {
      const calcView = document.getElementById('calculator-view');
      const safeView = document.getElementById('safe-screen-view');

      if (calcView && calcView.style.display !== 'none') {
        window.scrollTo(0, 0);
      }
      if (safeView && safeView.style.display !== 'none') {
        window.scrollTo(0, 0);
      }
    }, 100);
  }

  function initCloseButton() {
    const closeBtn = document.getElementById('close-safe-btn');
    if (!closeBtn) {
      console.warn('Close button not found');
      return;
    }

    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      Trigger.showCalculator();
    });

    closeBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      Trigger.showCalculator();
    });
  }

  function addHapticFeedback() {
    const buttons = document.querySelectorAll('button');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile && 'vibrate' in navigator) {
      buttons.forEach(button => {
        button.addEventListener('click', () => {
          navigator.vibrate(10);
        });
      });
    }
  }

  function preventZoom() {
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  function logInitialization() {
    console.log('[App] Initialized with components:', {
      calculator: typeof Calculator !== 'undefined',
      safeScreen: typeof SafeScreen !== 'undefined',
      trigger: typeof Trigger !== 'undefined',
      timestamp: new Date().toISOString()
    });
  }

  function init() {
    if (isInitialized) {
      console.warn('[App] Already initialized');
      return;
    }

    console.log('[App] Starting application...');

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initializeComponents();
      });
    } else {
      initializeComponents();
    }
  }

  function initializeComponents() {

    if (typeof Calculator !== 'undefined') {
      Calculator.init();
      console.log('[App] Calculator initialized');
    } else {
      console.error('[App] Calculator module not found');
    }

    if (typeof SafeScreen !== 'undefined') {
      SafeScreen.init();
      console.log('[App] SafeScreen initialized');
    } else {
      console.error('[App] SafeScreen module not found');
    }

    if (typeof Trigger !== 'undefined') {
      Trigger.init();
      console.log('[App] Trigger initialized');
    } else {
      console.error('[App] Trigger module not found');
    }

    initCloseButton();
    addHapticFeedback();
    preventZoom();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', lockForPrivacy);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('orientationchange', handleOrientationChange);

    runPrivacyAudit();

    isInitialized = true;
    logInitialization();

    setTimeout(() => {
      document.body.classList.add('app-ready');
    }, 100);
  }

  return {
    init,
    runPrivacyAudit
  };
})();

App.init();

const installBanner = document.getElementById('install-banner');
const installBannerBtn = document.getElementById('install-banner-btn');
const installBannerDismiss = document.getElementById('install-banner-dismiss');

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBanner) installBanner.classList.add('visible');
});

if (installBannerBtn) {
  installBannerBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[Install] User choice:', outcome);
    deferredPrompt = null;
    if (installBanner) installBanner.classList.remove('visible');
  });
}

if (installBannerDismiss) {
  installBannerDismiss.addEventListener('click', () => {
    if (installBanner) installBanner.classList.remove('visible');
  });
}

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  if (installBanner) installBanner.classList.remove('visible');
});