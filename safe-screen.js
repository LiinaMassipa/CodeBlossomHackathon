/**
 * Safe Screen Module
 * Manages emergency contacts display and alert system
 */
const SafeScreen = (() => {
  // Emergency contacts data
  const CONTACTS = [
    { 
      name: "Emergency Services", 
      number: "10111", 
      description: "Police (Namibia)",
      icon: "🚔"
    },
    { 
      name: "Ambulance / Medical", 
      number: "10177", 
      description: "24/7 Free helpline",
      icon: "🚑"
    },
    { 
      name: "Lifeline Namibia", 
      number: "106", 
      description: "Crisis counselling",
      icon: "💙"
    },
    { 
      name: "Childline", 
      number: "116", 
      description: "Children in danger",
      icon: "👶"
    },
    { 
      name: "SMS Help Line", 
      number: "31531", 
      description: "If you cannot speak safely",
      icon: "📱"
    }
  ];

  // Rate limiting for alerts
  let lastAlertTime = 0;
  const ALERT_COOLDOWN = 5000; // 5 seconds between alerts
  let alertQueue = [];
  let isProcessingAlert = false;

  /**
   * Send alert via email (with rate limiting)
   */
  async function sendAlert(contactName, number, method = 'call') {
    const now = Date.now();
    
    // Rate limiting check
    if (now - lastAlertTime < ALERT_COOLDOWN) {
      // Queue the alert if within cooldown
      alertQueue.push({ contactName, number, method, timestamp: now });
      console.log('Alert rate limited, queued');
      return;
    }

    lastAlertTime = now;
    
    // Create alert data
    const alertData = {
      type: 'emergency_contact',
      contactName: contactName,
      number: number,
      method: method,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      _subject: `🚨 EMERGENCY ALERT: ${contactName} contact initiated`,
      _captcha: 'false'
    };

    // Try to send alert (don't block on failure)
    try {
      // Using FormSubmit.co (consider moving to your own backend in production)
      const response = await fetch('https://formsubmit.co/ajax/josephinaiyambo05@gmail.com', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(alertData)
      });
      
      if (response.ok) {
        console.log('Alert sent successfully');
      } else {
        console.warn('Alert failed with status:', response.status);
      }
    } catch (error) {
      console.error('Failed to send alert:', error);
    }

    // Process queue
    processAlertQueue();
  }

  /**
   * Process queued alerts
   */
  async function processAlertQueue() {
    if (isProcessingAlert || alertQueue.length === 0) return;
    
    isProcessingAlert = true;
    
    while (alertQueue.length > 0) {
      const now = Date.now();
      if (now - lastAlertTime >= ALERT_COOLDOWN) {
        const nextAlert = alertQueue.shift();
        await sendAlert(nextAlert.contactName, nextAlert.number, nextAlert.method);
      } else {
        // Wait for cooldown
        await new Promise(resolve => setTimeout(resolve, ALERT_COOLDOWN));
      }
    }
    
    isProcessingAlert = false;
  }

  /**
   * Make a phone call with loading state
   */
  async function makeCall(number, contactName, buttonElement) {
    // Add loading state
    if (buttonElement) {
      buttonElement.classList.add('loading');
      buttonElement.disabled = true;
    }

    // Send alert
    await sendAlert(contactName, number, 'call');

    // Check if tel: protocol is supported
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Small delay to ensure alert is sent
      setTimeout(() => {
        window.location.href = `tel:${number.replace(/\s/g, '')}`;
      }, 100);
    } else {
      // Fallback for desktop
      setTimeout(() => {
        alert(`Please call ${contactName} at ${number}`);
        if (buttonElement) {
          buttonElement.classList.remove('loading');
          buttonElement.disabled = false;
        }
      }, 100);
    }

    // Remove loading state after 2 seconds if still there (in case call doesn't trigger navigation)
    setTimeout(() => {
      if (buttonElement && buttonElement.classList.contains('loading')) {
        buttonElement.classList.remove('loading');
        buttonElement.disabled = false;
      }
    }, 2000);
  }

  /**
   * Build individual contact card
   */
  function buildContactCard(contact) {
    const card = document.createElement('div');
    card.className = 'contact-card';
    
    const button = document.createElement('button');
    button.className = 'contact-call-btn';
    button.textContent = contact.number;
    button.setAttribute('aria-label', `Call ${contact.name} at ${contact.number}`);
    
    // Handle click without inline event handlers
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      makeCall(contact.number, contact.name, button);
    });
    
    card.innerHTML = `
      <div class="contact-icon">${contact.icon}</div>
      <div class="contact-info">
        <div class="contact-name">${escapeHtml(contact.name)}</div>
        <div class="contact-desc">${escapeHtml(contact.description)}</div>
      </div>
    `;
    card.appendChild(button);
    
    return card;
  }

  /**
   * Build SOS button
   */
  function buildSOSButton() {
    const wrapper = document.createElement('div');
    wrapper.className = 'sos-wrapper';
    
    const button = document.createElement('button');
    button.id = 'sos-btn';
    button.setAttribute('aria-label', 'SOS Emergency Call - Triggers emergency services');
    button.innerHTML = '<span>SOS</span>';
    
    let isCalling = false;
    
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      
      if (isCalling) return;
      isCalling = true;
      
      button.disabled = true;
      button.classList.add('sos-loading');
      
      // Send alert first
      await sendAlert('SOS - Emergency Services', CONTACTS[0].number, 'sos');
      
      // Make the call
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        setTimeout(() => {
          window.location.href = `tel:${CONTACTS[0].number}`;
        }, 100);
      } else {
        setTimeout(() => {
          alert(`EMERGENCY SOS\nPlease call ${CONTACTS[0].name} at ${CONTACTS[0].number} immediately!`);
          button.disabled = false;
          button.classList.remove('sos-loading');
          isCalling = false;
        }, 100);
      }
      
      // Reset after 3 seconds if still loading
      setTimeout(() => {
        if (button.disabled) {
          button.disabled = false;
          button.classList.remove('sos-loading');
          isCalling = false;
        }
      }, 3000);
    });
    
    wrapper.appendChild(button);
    return wrapper;
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Render the entire safe screen
   */
  function render() {
    const container = document.getElementById('safe-screen-content');
    if (!container) {
      console.warn('SafeScreen: #safe-screen-content not found');
      return;
    }

    // Clear container
    container.innerHTML = '';

    // Add SOS button
    container.appendChild(buildSOSButton());

    // Add hint text
    const hint = document.createElement('p');
    hint.className = 'safe-hint';
    hint.textContent = '⚠️ Tap a number to call. Emergency services will be notified.';
    container.appendChild(hint);

    // Add contacts list
    const list = document.createElement('div');
    list.className = 'contacts-list';
    CONTACTS.forEach(contact => {
      list.appendChild(buildContactCard(contact));
    });
    container.appendChild(list);
  }

  /**
   * Initialize safe screen
   */
  function init() {
    render();
  }

  // Public API
  return {
    init,
    sendAlert,
    makeCall
  };
})();