
const SafeScreen = (() => {

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
        icon: "📱",
        type: "sms"
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

  const SOS_NUMBER_BY_COUNTRY = {
    namibia: "10111",
    kenya: "999",
    netherlands: "112"
  };

  let currentCountry = '';

  const CUSTOM_CONTACTS_KEY = 'safecalc_custom_contacts';

  function loadCustomContacts() {
    try {
      const raw = localStorage.getItem(CUSTOM_CONTACTS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveCustomContacts(data) {
    try {
      localStorage.setItem(CUSTOM_CONTACTS_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save custom contacts:', e);
    }
  }

  function addCustomContact(country, contact) {
    const all = loadCustomContacts();
    if (!all[country]) all[country] = [];
    all[country].push(contact);
    saveCustomContacts(all);
  }

  function removeCustomContact(country, index) {
    const all = loadCustomContacts();
    if (all[country]) {
      all[country].splice(index, 1);
      saveCustomContacts(all);
    }
  }

  function getContactsForCountry(country) {
    const base = CONTACTS_BY_COUNTRY[country] || [];
    const custom = loadCustomContacts()[country] || [];
    return { base, custom };
  }
  let lastAlertTime = 0;
  const ALERT_COOLDOWN = 5000;
  let alertQueue = [];
  let isProcessingAlert = false;

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


  async function contactAction(contact, buttonElement) {
    if (buttonElement) {
      buttonElement.classList.add('loading');
      buttonElement.disabled = true;
    }

    const isSMS = contact.type === 'sms';
    const scheme = isSMS ? 'sms' : 'tel';
    const target = `${scheme}:${contact.number.replace(/\s/g, '')}`;
    const isMobile = /Android|webOS|iPhone|iPad/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = target;
    } else {
      alert(`Please ${isSMS ? 'message' : 'call'} ${contact.name} at ${contact.number}`);
    }
    sendAlert(contact.name, contact.number, isSMS ? 'sms' : 'call');

    setTimeout(() => {
      if (buttonElement) {
        buttonElement.classList.remove('loading');
        buttonElement.disabled = false;
      }
    }, 600);
  }

  function makeCall(number, contactName, buttonElement) {
    return contactAction({ name: contactName, number, type: 'call' }, buttonElement);
  }


  function buildContactCard(contact, onDelete) {
    const card = document.createElement('div');
    card.className = 'contact-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label',
      `${contact.type === 'sms' ? 'Message' : 'Call'} ${contact.name} at ${contact.number}`);

    const button = document.createElement('button');
    button.className = 'contact-call-btn';
    button.textContent = contact.number;
    button.tabIndex = -1; // card itself is the primary click target

    card.innerHTML = `
      <div class="contact-icon">${contact.icon}</div>
      <div class="contact-info">
        <div class="contact-name">${escapeHtml(contact.name)}</div>
        <div class="contact-desc">${escapeHtml(contact.description)}</div>
      </div>
    `;
    card.appendChild(button);

    if (onDelete) {
      const delBtn = document.createElement('button');
      delBtn.className = 'contact-delete-btn';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', `Remove ${contact.name}`);
      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete();
      });
      card.appendChild(delBtn);
    }

    card.addEventListener('click', (e) => {
      if (e.target.closest('.contact-delete-btn')) return;
      e.preventDefault();
      contactAction(contact, button);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        contactAction(contact, button);
      }
    });

    return card;
  }


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
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        window.location.href = `tel:${sosNumber}`;
      } else {
        alert(`EMERGENCY SOS\nPlease call emergency services at ${sosNumber} immediately!`);
        button.disabled = false;
        button.classList.remove('sos-loading');
        isCalling = false;
      }

      sendAlert('SOS - Emergency Services', sosNumber, 'sos');

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

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function render() {
    const container = document.getElementById('safe-screen-content');
    if (!container) {
      console.warn('SafeScreen: #safe-screen-content not found');
      return;
    }

    container.innerHTML = '';

    if (!currentCountry) {
      const prompt = document.createElement('div');
      prompt.className = 'country-prompt';
      prompt.innerHTML = `
        <div class="country-prompt-icon">🌍</div>
        <p class="country-prompt-text">Please select your country above to see local emergency contacts.</p>
      `;
      container.appendChild(prompt);
      return;
    }

    const { base, custom } = getContactsForCountry(currentCountry);

    container.appendChild(buildSOSButton());

    const hint = document.createElement('p');
    hint.className = 'safe-hint';
    hint.textContent = '⚠️ Tap a contact to call or message. Emergency services will be notified.';
    container.appendChild(hint);

    const list = document.createElement('div');
    list.className = 'contacts-list';
    base.forEach(contact => {
      list.appendChild(buildContactCard(contact));
    });
    custom.forEach((contact, i) => {
      list.appendChild(buildContactCard(contact, () => {
        removeCustomContact(currentCountry, i);
        render();
      }));
    });
    container.appendChild(list);

    container.appendChild(buildAddContactUI());
  }

  function buildAddContactUI() {
    const wrapper = document.createElement('div');
    wrapper.className = 'add-contact-wrapper';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'add-contact-toggle';
    toggleBtn.textContent = '+ Add a contact';

    const form = document.createElement('div');
    form.className = 'add-contact-form';
    form.style.display = 'none';
    form.innerHTML = `
      <input type="text" class="add-contact-name" placeholder="Name" maxlength="40" />
      <input type="tel" class="add-contact-number" placeholder="Phone number" maxlength="20" />
      <select class="add-contact-type">
        <option value="call">Call</option>
        <option value="sms">SMS</option>
      </select>
      <button type="button" class="add-contact-save">Save contact</button>
    `;

    toggleBtn.addEventListener('click', () => {
      form.style.display = form.style.display === 'none' ? 'flex' : 'none';
    });

    form.querySelector('.add-contact-save').addEventListener('click', () => {
      const nameInput = form.querySelector('.add-contact-name');
      const numberInput = form.querySelector('.add-contact-number');
      const typeSelect = form.querySelector('.add-contact-type');

      const name = nameInput.value.trim();
      const number = numberInput.value.trim();
      const type = typeSelect.value;

      if (!name || !number) {
        alert('Please enter both a name and a number.');
        return;
      }

      addCustomContact(currentCountry, {
        name,
        number,
        type,
        description: 'Custom contact',
        icon: type === 'sms' ? '📱' : '📞'
      });

      nameInput.value = '';
      numberInput.value = '';
      render();
    });

    wrapper.appendChild(toggleBtn);
    wrapper.appendChild(form);
    return wrapper;
  }

  function initCountrySelector() {
    const select = document.getElementById('country-select');
    if (!select) return;

    select.addEventListener('change', () => {
      currentCountry = select.value;
      render();
    });
  }

  function init() {
    initCountrySelector();
    render(); 
  }

  return {
    init,
    sendAlert,
    makeCall,
    contactAction,
    addCustomContact,
    removeCustomContact
  };
})();