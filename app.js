/**
 * Main Application Module
 * Initializes all components and handles global events
 */
const App = (() => {
  let isInitialized = false;

  /**
   * Privacy audit - clear all stored data
   */
  function runPrivacyAudit() {
    // Clear localStorage
    try {
      if (localStorage.length > 0) {
        console.log('[Privacy] Clearing localStorage');
        localStorage.clear();
      }
    } catch (e) {
      console.warn('[Privacy] Could not clear localStorage:', e);
    }

    // Clear sessionStorage
    try {
      if (sessionStorage.length > 0) {
        console.log('[Privacy] Clearing sessionStorage');
        sessionStorage.clear();
      }
    } catch (e) {
      console.warn('[Privacy] Could not clear sessionStorage:', e);
    }

    // Clear cookies
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

    // Disable autocomplete on all inputs
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('spellcheck', 'false');
    });
  }

  /**
   * Handle visibility change (user switched tabs/apps)
   */
  function handleVisibilityChange() {
    if (document.hidden) {
      const safeView = document.getElementById('safe-screen-view');
      // If safe screen is visible when app loses focus, hide it for privacy
      if (safeView && safeView.style.display !== 'none') {
        console.log('[Privacy] App hidden, hiding safe screen');
        Trigger.showCalculator();
      }
      
      // Always clear storage when app loses focus
      runPrivacyAudit();
    }
  }

  /**
   * Handle page unload - final privacy cleanup
   */
  function handleBeforeUnload() {
    runPrivacyAudit();
  }

  /**
   * Handle orientation change (mobile)
   */
  function handleOrientationChange() {
    // Small delay to allow orientation to complete
    setTimeout(() => {
      const calcView = document.getElementById('calculator-view');
      const safeView = document.getElementById('safe-screen-view');
      
      // Re-center views if needed
      if (calcView && calcView.style.display !== 'none') {
        window.scrollTo(0, 0);
      }
      if (safeView && safeView.style.display !== 'none') {
        window.scrollTo(0, 0);
      }
    }, 100);
  }

  /**
   * Close button handler
   */
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

    // Also handle touch events
    closeBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      Trigger.showCalculator();
    });
  }

  /**
   * Add haptic feedback for mobile devices
   */
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

  /**
   * Prevent zoom on double-tap (iOS)
   */
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

  /**
   * Debug helper (remove in production)
   */
  function logInitialization() {
    console.log('[App] Initialized with components:', {
      calculator: typeof Calculator !== 'undefined',
      safeScreen: typeof SafeScreen !== 'undefined',
      trigger: typeof Trigger !== 'undefined',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Initialize the entire application
   */
  function init() {
    if (isInitialized) {
      console.warn('[App] Already initialized');
      return;
    }

    console.log('[App] Starting application...');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initializeComponents();
      });
    } else {
      initializeComponents();
    }
  }

  function initializeComponents() {
    // Initialize all modules
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

    // Initialize UI components
    initCloseButton();
    addHapticFeedback();
    preventZoom();
    
    // Set up global event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Run initial privacy audit
    runPrivacyAudit();
    
    isInitialized = true;
    logInitialization();
    
    // Add a small delay to ensure everything is rendered
    setTimeout(() => {
      document.body.classList.add('app-ready');
    }, 100);
  }

  // Public API
  return {
    init,
    runPrivacyAudit
  };
})();

// Start the application
App.init();
