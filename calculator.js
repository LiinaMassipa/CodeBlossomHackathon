/**
 * Calculator Module
 * Handles all calculator logic, display updates, and keyboard input
 */
const Calculator = (() => {
  // Private state
  let currentInput = '';
  let previousInput = '';
  let operator = null;
  let justEvaluated = false;
  let lastButtonPress = 0;
  const DEBOUNCE_DELAY = 100;

  // DOM elements
  const mainDisplay = () => document.getElementById('display-main');
  const exprDisplay = () => document.getElementById('display-expr');

  // Helper: Update main display
  function updateMainDisplay(value) {
    const el = mainDisplay();
    if (!el) return;
    el.textContent = value || '0';
  }

  // Helper: Update expression display
  function updateExprDisplay(value) {
    const el = exprDisplay();
    if (!el) return;
    el.textContent = value || '';
  }

  // Helper: Get operator symbol for display
  function getOperatorSymbol(op) {
    const symbols = {
      '+': '+',
      '-': '−',
      '*': '×',
      '/': '÷'
    };
    return symbols[op] || op;
  }

  // Debounce utility
  function debounce(func, delay) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Append digit or decimal
  function appendDigit(digit) {
    // Prevent rapid multiple presses
    const now = Date.now();
    if (now - lastButtonPress < DEBOUNCE_DELAY) return;
    lastButtonPress = now;

    if (justEvaluated) {
      currentInput = '';
      justEvaluated = false;
      updateExprDisplay('');
    }

    // Prevent multiple decimals
    if (digit === '.' && currentInput.includes('.')) return;

    // Limit length
    if (currentInput.length >= 12) return;

    currentInput += digit;
    updateMainDisplay(currentInput);
  }

  // Set operator
  function setOperator(op) {
    const now = Date.now();
    if (now - lastButtonPress < DEBOUNCE_DELAY) return;
    lastButtonPress = now;

    if (currentInput === '' && previousInput === '') return;
    justEvaluated = false;

    // If we have both numbers, evaluate first
    if (currentInput !== '' && previousInput !== '') {
      evaluate();
    }

    operator = op;
    previousInput = currentInput || previousInput;
    currentInput = '';

    // Show expression
    if (previousInput) {
      updateExprDisplay(`${previousInput} ${getOperatorSymbol(operator)}`);
    }
  }

  // Evaluate the expression
  function evaluate() {
    const now = Date.now();
    if (now - lastButtonPress < DEBOUNCE_DELAY) return;
    lastButtonPress = now;

    if (operator === null || previousInput === '') return;

    const prev = parseFloat(previousInput);
    const curr = parseFloat(currentInput);

    if (isNaN(prev) || isNaN(curr)) return;

    let result;
    switch (operator) {
      case '+':
        result = prev + curr;
        break;
      case '-':
        result = prev - curr;
        break;
      case '*':
        result = prev * curr;
        break;
      case '/':
        if (curr === 0) {
          clear();
          updateMainDisplay('Error');
          updateExprDisplay('Division by zero');
          return;
        }
        result = prev / curr;
        break;
      default:
        return;
    }

    // Round to 12 significant digits
    result = parseFloat(result.toPrecision(12));

    // Show full expression in history
    updateExprDisplay(`${previousInput} ${getOperatorSymbol(operator)} ${currentInput} =`);

    // Update state
    currentInput = String(result);
    previousInput = '';
    operator = null;
    justEvaluated = true;
    updateMainDisplay(currentInput);
  }

  // Clear everything
  function clear() {
    currentInput = '';
    previousInput = '';
    operator = null;
    justEvaluated = false;
    updateMainDisplay('0');
    updateExprDisplay('');
  }

  // Toggle positive/negative
  function toggleSign() {
    if (!currentInput || currentInput === '0') return;
    currentInput = currentInput.startsWith('-') 
      ? currentInput.slice(1) 
      : '-' + currentInput;
    updateMainDisplay(currentInput);
  }

  // Convert to percentage
  function percentage() {
    if (!currentInput || currentInput === '0') return;
    currentInput = String(parseFloat(currentInput) / 100);
    updateMainDisplay(currentInput);
  }

  // Backspace / delete last digit
  function backspace() {
    if (justEvaluated) {
      clear();
      return;
    }
    if (currentInput.length > 0) {
      currentInput = currentInput.slice(0, -1);
      updateMainDisplay(currentInput || '0');
    }
  }

  // Keyboard handler
  function handleKeyboard(e) {
    // Prevent default for calculator keys
    const calculatorKeys = ['+', '-', '*', '/', 'Enter', '=', 'Backspace', 'Escape', '.'];
    if (calculatorKeys.includes(e.key)) {
      e.preventDefault();
    }

    if (e.key >= '0' && e.key <= '9') {
      appendDigit(e.key);
    } else if (e.key === '.') {
      appendDigit('.');
    } else if (e.key === '+') {
      setOperator('+');
    } else if (e.key === '-') {
      setOperator('-');
    } else if (e.key === '*') {
      setOperator('*');
    } else if (e.key === '/') {
      setOperator('/');
    } else if (e.key === 'Enter' || e.key === '=') {
      evaluate();
    } else if (e.key === 'Backspace') {
      backspace();
    } else if (e.key === 'Escape') {
      clear();
    }
  }

  // Initialize event listeners
  function init() {
    document.addEventListener('keydown', handleKeyboard);

    // Attach click handlers to all calculator buttons
    const buttons = document.querySelectorAll('.button-grid button');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Handle based on data attributes
        if (button.hasAttribute('data-digit')) {
          appendDigit(button.getAttribute('data-digit'));
        } else if (button.hasAttribute('data-operator')) {
          setOperator(button.getAttribute('data-operator'));
        } else if (button.hasAttribute('data-action')) {
          const action = button.getAttribute('data-action');
          switch (action) {
            case 'clear':
              clear();
              break;
            case 'toggleSign':
              toggleSign();
              break;
            case 'percentage':
              percentage();
              break;
            case 'backspace':
              backspace();
              break;
            case 'evaluate':
              evaluate();
              break;
          }
        }
      });
    });

    updateMainDisplay('0');
  }

  // Public API
  return {
    init,
    appendDigit,
    setOperator,
    evaluate,
    clear,
    toggleSign,
    percentage,
    backspace
  };
})();