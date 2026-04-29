const Calculator = (() => {
  let currentInput = '';
  let previousInput = '';
  let operator = null;
  let justEvaluated = false;

  const display = () => document.getElementById('calc-display');

  function updateDisplay(value) {
    const el = display();
    if (!el) return;
    el.textContent = value || '0';
  }

  function appendDigit(digit) {
    if (justEvaluated) {
      currentInput = '';
      justEvaluated = false;
    }
    if (digit === '.' && currentInput.includes('.')) return;
    if (currentInput.length >= 12) return;
    currentInput += digit;
    updateDisplay(currentInput);
  }

  function setOperator(op) {
    if (currentInput === '' && previousInput === '') return;
    justEvaluated = false;

    if (currentInput !== '' && previousInput !== '') {
      evaluate();
    }

    operator = op;
    previousInput = currentInput || previousInput;
    currentInput = '';
  }

  function evaluate() {
    if (operator === null || previousInput === '') return;
    const prev = parseFloat(previousInput);
    const curr = parseFloat(currentInput);

    if (isNaN(prev) || isNaN(curr)) return;

    let result;
    switch (operator) {
      case '+': result = prev + curr; break;
      case '-': result = prev - curr; break;
      case '*': result = prev * curr; break;
      case '/':
        if (curr === 0) { clear(); updateDisplay('Error'); return; }
        result = prev / curr;
        break;
      default: return;
    }

    result = parseFloat(result.toPrecision(12));
    currentInput = String(result);
    previousInput = '';
    operator = null;
    justEvaluated = true;
    updateDisplay(currentInput);
  }

  function clear() {
    currentInput = '';
    previousInput = '';
    operator = null;
    justEvaluated = false;
    updateDisplay('0');
  }

  function toggleSign() {
    if (!currentInput) return;
    currentInput = currentInput.startsWith('-')
      ? currentInput.slice(1)
      : '-' + currentInput;
    updateDisplay(currentInput);
  }

  function percentage() {
    if (!currentInput) return;
    currentInput = String(parseFloat(currentInput) / 100);
    updateDisplay(currentInput);
  }

  function backspace() {
    if (justEvaluated) { clear(); return; }
    currentInput = currentInput.slice(0, -1);
    updateDisplay(currentInput || '0');
  }

  function handleKeyboard(e) {
    if (e.key >= '0' && e.key <= '9') appendDigit(e.key);
    else if (e.key === '.') appendDigit('.');
    else if (e.key === '+') setOperator('+');
    else if (e.key === '-') setOperator('-');
    else if (e.key === '*') setOperator('*');
    else if (e.key === '/') { e.preventDefault(); setOperator('/'); }
    else if (e.key === 'Enter' || e.key === '=') evaluate();
    else if (e.key === 'Backspace') backspace();
    else if (e.key === 'Escape') clear();
  }

  function init() {
    document.addEventListener('keydown', handleKeyboard);
    updateDisplay('0');
  }

  return { appendDigit, setOperator, evaluate, clear, toggleSign, percentage, backspace, init };
})();

const Trigger = (() => {
  const DOUBLE_TAP_DELAY = 350;
  let lastTapTime = 0;
  let tapCount = 0;
  let tapTimer = null;

  function onDoubleTap() {
    showSafeScreen();
  }

  function handleTap() {
    const now = Date.now();
    const timeSinceLast = now - lastTapTime;
    lastTapTime = now;

    if (timeSinceLast <= DOUBLE_TAP_DELAY) {
      tapCount++;
    } else {
      tapCount = 1;
    }

    clearTimeout(tapTimer);

    if (tapCount >= 2) {
      tapCount = 0;
      onDoubleTap();
      return;
    }

    tapTimer = setTimeout(() => {
      tapCount = 0;
    }, DOUBLE_TAP_DELAY);
  }

  function showSafeScreen() {
    const calcView = document.getElementById('calculator-view');
    const safeView = document.getElementById('safe-screen-view');
    if (calcView) calcView.style.display = 'none';
    if (safeView) safeView.style.display = 'flex';
  }

  function showCalculator() {
    const calcView = document.getElementById('calculator-view');
    const safeView = document.getElementById('safe-screen-view');
    if (safeView) safeView.style.display = 'none';
    if (calcView) calcView.style.display = 'flex';
  }

  function init() {
    const plusBtn = document.getElementById('btn-plus');
    if (!plusBtn) { console.warn('Trigger: #btn-plus not found'); return; }

    plusBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleTap();
    });

    plusBtn.addEventListener('click', handleTap);
  }

  return { init, showCalculator, showSafeScreen };
})();

const SafeScreen = (() => {
  const CONTACTS = [
    { name: "Emergency Services",              number: "10111", description: "Police (Namibia)" },
    { name: "Ambulance / Medical Emergencies", number: "10177", description: "24/7 Free helpline" },
    { name: "Lifeline Namibia",                number: "106",   description: "Crisis counselling" },
    { name: "Childline",                       number: "116",   description: "Children in danger" },
    { name: "SMS Help Line",                   number: "31531", description: "If you can't speak safely" }
  ];

  function sendAlert(contactName, number) {
    fetch('https://formsubmit.co/ajax/josephinaiyambo05@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: contactName,
        number: number,
        message: `ALERT: Someone accessed the safe screen and contacted ${contactName} (${number})`,
        _subject: '🚨 Safe Screen Alert',
        _captcha: 'false',
      })
    }).catch(() => {}); 
  }

  function buildContactCard(contact) {
    const card = document.createElement('div');
    card.className = 'contact-card';
    card.innerHTML = `
      <div class="contact-info">
        <div class="contact-name">${contact.name}</div>
        <div class="contact-desc">${contact.description}</div>
      </div>
      <button class="contact-call-btn" aria-label="Call ${contact.name}"
        onclick="(function(){
          SafeScreen.sendAlert('${contact.name.replace(/'/g, "\\'")}', '${contact.number}');
          window.location.href='tel:${contact.number.replace(/\s/g, '')}';
        })()">
        ${contact.number}
      </button>
    `;
    return card;
  }

  function buildSOSButton() {
    const btn = document.createElement('button');
    btn.id = 'sos-btn';
    btn.setAttribute('aria-label', 'SOS Emergency Call');
    btn.innerHTML = '<span>SOS</span>';
    btn.addEventListener('click', () => {
      sendAlert('SOS - Emergency Services', CONTACTS[0].number);
      window.location.href = `tel:${CONTACTS[0].number.replace(/\s/g, '')}`;
    });
    return btn;
  }

  function render() {
    const container = document.getElementById('safe-screen-content');
    if (!container) { console.warn('SafeScreen: #safe-screen-content not found'); return; }

    container.innerHTML = '';

    const sosWrapper = document.createElement('div');
    sosWrapper.className = 'sos-wrapper';
    sosWrapper.appendChild(buildSOSButton());
    container.appendChild(sosWrapper);

    const hint = document.createElement('p');
    hint.className = 'safe-hint';
    hint.textContent = 'Tap a number to call. No information is saved.';
    container.appendChild(hint);

    const list = document.createElement('div');
    list.className = 'contacts-list';
    CONTACTS.forEach(c => list.appendChild(buildContactCard(c)));
    container.appendChild(list);
  }

  function init() {
    render();
  }

  return { init, sendAlert };
})();


// ── CloseButton ──
const CloseButton = (() => {

  function attachCloseButton() {
    const btn = document.getElementById('close-safe-btn');
    if (!btn) { console.warn('CloseButton: #close-safe-btn not found'); return; }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      Trigger.showCalculator();
    });

    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      Trigger.showCalculator();
    });
  }

  function runPrivacyAudit() {
    try { if (localStorage.length > 0)   { localStorage.clear(); } }  catch (e) {}
    try { if (sessionStorage.length > 0) { sessionStorage.clear(); } } catch (e) {}

    if (document.cookie.length > 0) {
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    }

    if (window.indexedDB) {
      indexedDB.databases?.().then(dbs => {
        if (dbs.length > 0) console.warn('[Privacy Audit] IndexedDB found:', dbs.map(d => d.name));
      }).catch(() => {});
    }

    document.querySelectorAll('input').forEach(input => {
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('spellcheck', 'false');
    });
  }

  function init() {
    attachCloseButton();
    runPrivacyAudit();
  }

  return { init };
})();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    const safeView = document.getElementById('safe-screen-view');
    if (safeView && safeView.style.display !== 'none') {
      Trigger.showCalculator();
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  Calculator.init();
  Trigger.init();
  SafeScreen.init();
  CloseButton.init();
});
