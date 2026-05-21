/**
 * Safe Screen Module
 * Manages emergency contacts display and alert system
 */
const SafeScreen = (() => {

  // Emergency contacts organised by country
  const CONTACTS_BY_COUNTRY = {
    namibia: [
      {
        name: "Police",
        number: "10111",
        description: "Namibian Police Force",
        icon: "🚔"
      },
      {
        name: "Ambulance",
        number: "10177",
        description: "24/7 Emergency Ambulance",
        icon: "🚑"
      },
      {
        name: "Lifeline Namibia",
        number: "106",
        description: "Crisis counselling helpline",
        icon: "💙"
      },
      {
        name: "Childline",
        number: "116",
        description: "Children in danger",
        icon: "👶"
      },
      {
        name: "SMS Line",
        number: "31531",
        description: "If you cannot speak safely",
        icon: "📱"
      }
    ],
    kenya: [
      {
        name: "Police",
        number: "999",
        description: "Kenya Police Service",
        icon: "🚔"
      },
      {
        name: "Ambulance",
        number: "1199",
        description: "Kenya Ambulance",
        icon: "🚑"
      },
      {
        name: "Befrienders Kenya",
        number: "0800 723 253",
        description: "Crisis line",
        icon: "💙"
      },
      {
        name: "Childline Kenya",
        number: "116",
        description: "danger",
        icon: "👶"
      },
      {
        name: "Gender Violence Helpline",
        number: "1195",
        description: "GBV 24/7",
        icon: "🤝"
      }
    ],
    netherlands: [
      {
        name: "Emergency Services",
        number: "112",
        description: "Police, Fire & Ambulance",
        icon: "🚨"
      },
      {
        name: "Police (non-urgent)",
        number: "0900-8844",
        description: "Non-emergency police line",
        icon: "🚔"
      },
      {
        name: "Crisis Helpline",
        number: "0800-0113",
        description: "Suicide & crisis prevention",
        icon: "💙"
      },
      {
        name: "Veilig Thuis",
        number: "0800-2000",
        description: "Domestic violence support",
        icon: "🏠"
      },
      {
        name: "Kindertelefoon",
        number: "0800-0432",
        description: "Helpline for children",
        icon: "👶"
      }
    ]
  };

  // The SOS number to dial depends on the selected country
  const SOS_NUMBER_BY_COUNTRY = {
    namibia: "10111",
    kenya: "999",
    netherlands: "112"
  };

  // Current country – defaults to empty (prompts user to choose)
  let currentCountry = '';

  // Rate limiting for alerts
  let lastAlertTime = 0;
  const ALERT_COOLDOWN = 5000;
  let alertQueue = [];
  let isProcessingAlert = false;

  /**
   * Send alert via email (with rate limiting)
   */
  async function sendAlert(contactName, number, method = 'call') {
    const now = Date.now();

    if (now - lastAlertTime < ALERT_COOLDOWN) {
      alertQueue.push({ contactName, number, method, timestamp: now });
      console.log('Alert rate limited, queued');
      return;
    }

    lastAlertTime = now;

    const alertData = {
      type: 'emergency_contact',
      contactName: contactName,
      number: number,
      method: method,
      country: currentCountry,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      _subject: `🚨 EMERGENCY ALERT: ${contactName} contact initiated`,
      _captcha: 'false'
    };

    try {
      const response = await fetch('https://formsubmit.co/ajax/liinamassipa@outlook.com', {
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
        await new Promise(resolve => setTimeout(resolve, ALERT_COOLDOWN));
      }
    }

    isProcessingAlert = false;
  }

  /**
   * Make a phone call with loading state
   */
  async function makeCall(number, contactName, buttonElement) {
    if (buttonElement) {
      buttonElement.classList.add('loading');
      buttonElement.disabled = true;
    }

    await sendAlert(contactName, number, 'call');

    const isMobile = /Android|webOS|iPhone|iPad/i.test(navigator.userAgent);

    if (isMobile) {
      setTimeout(() => {
        window.location.href = `tel:${number.replace(/\s/g, '')}`;
      }, 100);
    } else {
      setTimeout(() => {
        alert(`Please call ${contactName} at ${number}`);
        if (buttonElement) {
          buttonElement.classList.remove('loading');
          buttonElement.disabled = false;
        }
      }, 100);
    }

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
   * Build SOS button – number is country-aware
   */
  function buildSOSButton() {
    const wrapper = document.createElement('div');
    wrapper.className = 'sos-wrapper';

    const button = document.createElement('button');
    button.id = 'sos-btn';
    button.setAttribute('aria-label', 'SOS Emergency Call');
    button.innerHTML = '<span>SOS</span>';

    let isCalling = false;

    button.addEventListener('click', async (e) => {
      e.preventDefault();

      if (isCalling) return;
      isCalling = true;

      button.disabled = true;
      button.classList.add('sos-loading');

      const sosNumber = SOS_NUMBER_BY_COUNTRY[currentCountry] || '112';
      await sendAlert('SOS - Emergency Services', sosNumber, 'sos');

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        setTimeout(() => {
          window.location.href = `tel:${sosNumber}`;
        }, 100);
      } else {
        setTimeout(() => {
          alert(`EMERGENCY SOS\nPlease call emergency services at ${sosNumber} immediately!`);
          button.disabled = false;
          button.classList.remove('sos-loading');
          isCalling = false;
        }, 100);
      }

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
   * Render contacts for the currently selected country.
   * If no country is selected, show a prompt instead.
   */
  function render() {
    const container = document.getElementById('safe-screen-content');
    if (!container) {
      console.warn('SafeScreen: #safe-screen-content not found');
      return;
    }

    container.innerHTML = '';

    if (!currentCountry) {
      // Show a friendly prompt to pick a country
      const prompt = document.createElement('div');
      prompt.className = 'country-prompt';
      prompt.innerHTML = `
        <div class="country-prompt-icon">🌍</div>
        <p class="country-prompt-text">Please select your country above to see local emergency contacts.</p>
      `;
      container.appendChild(prompt);
      return;
    }

    const contacts = CONTACTS_BY_COUNTRY[currentCountry] || [];

    // SOS button
    container.appendChild(buildSOSButton());

    // Hint
    const hint = document.createElement('p');
    hint.className = 'safe-hint';
    hint.textContent = '⚠️ Tap a number to call. Emergency services will be notified.';
    container.appendChild(hint);

    // Contact cards
    const list = document.createElement('div');
    list.className = 'contacts-list';
    contacts.forEach(contact => {
      list.appendChild(buildContactCard(contact));
    });
    container.appendChild(list);
  }

  /**
   * Wire up the country dropdown
   */
  function initCountrySelector() {
    const select = document.getElementById('country-select');
    if (!select) return;

    select.addEventListener('change', () => {
      currentCountry = select.value;
      render();
    });
  }

  /**
   * Initialize safe screen
   */
  function init() {
    initCountrySelector();
    render(); // Show the "please select a country" prompt initially
  }

  // Public API
  return {
    init,
    sendAlert,
    makeCall
  };
})();