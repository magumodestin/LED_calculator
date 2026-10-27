(function() {
      // ----- CORE ELEMENTS -----
      const resultField = document.getElementById('result');
      const ledDots = [
        document.getElementById('led1'),
        document.getElementById('led2'),
        document.getElementById('led3'),
        document.getElementById('led4'),
        document.getElementById('led5')
      ];

      // ----- STATE -----
      let currentInput = '0';         // what's displayed
      let previousOperand = null;
      let operator = null;
      let shouldResetScreen = false;
      let lastResult = null;          // store for LED effects

      // ----- HELPER: UPDATE DISPLAY & LED LIVE COLORS -----
      function updateDisplay(value) {
        // format: avoid too many decimals, but keep raw
        let str = value.toString();
        // limit length for display (respecting calculator sanity)
        if (str.length > 12) {
          str = parseFloat(value).toExponential(6);  // scientific for huge
        }
        resultField.value = str;

        // --- LED live colors based on current value (numeric or error) ---
        const num = parseFloat(str);
        let r, g, b; // base rgb for text-shadow

        if (str === 'Error' || str === 'NaN' || str === 'Infinity') {
          // error LED -> red pulsation via class
          resultField.classList.add('led-error');
          // also set fallback intense red shadow
          resultField.style.textShadow = '0 0 12px #ff4444, 0 0 35px #ff0000';
        } else {
          resultField.classList.remove('led-error');

          // map numeric value to hue (0=red, 0.33=green, 0.66=blue, wraps)
          let hue;
          if (!isNaN(num)) {
            // use absolute value, fractional part to vary hue continously
            let absVal = Math.abs(num) || 0;
            // get a pseudo-random but deterministic hue based on digits & magnitude
            // mix integer part and fractional to get stable but colorful mapping
            let intPart = Math.floor(absVal) % 100;  // 0..99
            let fracPart = absVal - Math.floor(absVal); // 0..0.999...
            // combine: (intPart + frac) / 100 -> 0..1.0, but to cycle hue we multiply
            let t = (intPart + fracPart) / 100; // 0 .. 1.0
            // use sine to make it cyclic and smooth
            hue = (t * 360 * 2) % 360;  // cycles twice across 0-100 range
            // special: if num is 0 -> deep blue
            if (num === 0) hue = 200;   // cold cyan
            else if (num > 999) hue = 40; // warm orange for big numbers
          } else {
            hue = 0; // fallback red
          }

          // saturation 90% , lightness 70% for strong led glow
          const color = `hsl(${hue}, 90%, 65%)`;
          const colorIntense = `hsl(${hue}, 100%, 70%)`;
          resultField.style.textShadow = `0 0 12px ${color}, 0 0 28px ${colorIntense}, 0 0 48px ${color}`;

          // also background hint (very subtle)
          resultField.style.backgroundColor = `hsla(${hue}, 70%, 15%, 0.3)`;
        }

        // ----- LED DOTS live update based on current value / error -----
        // 5 dots: show intensity of number or error
        let activeCount = 0;
        if (str === 'Error' || str === 'NaN' || str === 'Infinity') {
          activeCount = 5; // all flashy red (will be set active but also we add red filter)
        } else if (!isNaN(num)) {
          // map magnitude: 0->1 dot, small->2, medium->3, large->4, huge->5
          const absNum = Math.abs(num);
          if (absNum === 0) activeCount = 2;        // zero lit 2
          else if (absNum < 1) activeCount = 3;      // fraction 3
          else if (absNum < 100) activeCount = 4;     // <100 -> 4
          else activeCount = 5;                       // 100+ or negative all
          // also if very long number -> 5
          if (str.length > 8) activeCount = 5;
        } else {
          activeCount = 0; // shouldn't happen
        }

        // apply active dots + color per dot based on current hue
        for (let i = 0; i < ledDots.length; i++) {
          const dot = ledDots[i];
          if (i < activeCount) {
            dot.classList.add('active');
            // make each dot slightly vary color using same base hue but shift
            if (!resultField.classList.contains('led-error')) {
              let hueShift = (i * 15) % 360; // small offset
              // extract base hue from computed style? we'll compute from num again
              let baseHue = 200; // fallback
              const numLoc = parseFloat(resultField.value);
              if (!isNaN(numLoc)) {
                let intP = Math.floor(Math.abs(numLoc)) % 100;
                let fracP = Math.abs(numLoc) - Math.floor(Math.abs(numLoc));
                let t = (intP + fracP) / 100;
                baseHue = (t * 360 * 2) % 360;
                if (numLoc === 0) baseHue = 200;
              } else {
                baseHue = 0;
              }
              const dotHue = (baseHue + hueShift) % 360;
              dot.style.background = `hsl(${dotHue}, 95%, 60%)`;
              dot.style.boxShadow = `0 0 14px hsl(${dotHue}, 100%, 65%), 0 0 28px hsl(${dotHue}, 90%, 55%)`;
            } else {
              // error case: all dots red
              dot.style.background = '#ff4444';
              dot.style.boxShadow = '0 0 18px #ff2222, 0 0 35px #ff0000';
            }
          } else {
            dot.classList.remove('active');
            dot.style.background = '#3b425b';
            dot.style.boxShadow = 'inset 0 0 4px black';
          }
        }
      }

      // ----- helper evaluate -----
      function evaluateExpression() {
        if (previousOperand === null || operator === null) return currentInput;

        const prev = parseFloat(previousOperand);
        const curr = parseFloat(currentInput);
        if (isNaN(prev) || isNaN(curr)) return 'Error';

        let computed;
        switch (operator) {
          case '+': computed = prev + curr; break;
          case '−': computed = prev - curr; break;
          case '×': computed = prev * curr; break;
          case '÷': 
            if (curr === 0) return 'Error';
            computed = prev / curr; 
            break;
          case '%': computed = prev % curr; break;
          default: return currentInput;
        }

        // limit decimals to avoid huge strings
        if (Number.isFinite(computed)) {
          // round to 10 decimals max to avoid artifacts
          computed = Math.round(computed * 1e10) / 1e10;
        }
        return computed.toString();
      }

      // ----- handle button input -----
      function handleButton(value, type) {
        if (type === 'clear') {
          currentInput = '0';
          previousOperand = null;
          operator = null;
          shouldResetScreen = false;
          updateDisplay(currentInput);
          return;
        }

        if (type === 'backspace') {
          if (currentInput === 'Error') {
            currentInput = '0';
          } else {
            currentInput = currentInput.toString().slice(0, -1);
            if (currentInput === '' || currentInput === '-') currentInput = '0';
          }
          updateDisplay(currentInput);
          return;
        }

        // if error state, most ops reset error (except clear already handled)
        if (resultField.value === 'Error' || resultField.value === 'NaN' || resultField.value === 'Infinity') {
          if (type === 'number' || type === 'dot') {
            currentInput = '0';
            previousOperand = null;
            operator = null;
            shouldResetScreen = false;
          } else if (type === 'operator') {
            // keep error? we reset to 0 to allow fresh start
            currentInput = '0';
            previousOperand = null;
            operator = null;
            shouldResetScreen = false;
          }
        }

        if (type === 'number') {
          if (shouldResetScreen || currentInput === '0' || currentInput === 'Error') {
            currentInput = value;
            shouldResetScreen = false;
          } else {
            currentInput = currentInput + value;
          }
          updateDisplay(currentInput);
        }
        else if (type === 'dot') {
          if (shouldResetScreen || currentInput === 'Error') {
            currentInput = '0.';
            shouldResetScreen = false;
          } else if (!currentInput.includes('.')) {
            currentInput = currentInput + '.';
          }
          updateDisplay(currentInput);
        }
        else if (type === 'operator') {
          if (operator !== null && !shouldResetScreen) {
            // evaluate pending operation
            const result = evaluateExpression();
            if (result === 'Error') {
              currentInput = 'Error';
              previousOperand = null;
              operator = null;
              updateDisplay(currentInput);
              return;
            }
            currentInput = result;
            previousOperand = currentInput;
          } else {
            previousOperand = currentInput;
          }
          operator = value;
          shouldResetScreen = true;
          updateDisplay(currentInput);  // keep display same, but show pending
        }
        else if (type === 'equals') {
          if (previousOperand !== null && operator !== null) {
            const result = evaluateExpression();
            if (result === 'Error') {
              currentInput = 'Error';
              previousOperand = null;
              operator = null;
            } else {
              currentInput = result;
              previousOperand = null;
              operator = null;
            }
            shouldResetScreen = true;
            updateDisplay(currentInput);
          } else {
            // just refresh
            updateDisplay(currentInput);
          }
        }
      }

      // ----- attach listeners to buttons -----
      document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const id = btn.id;

          // map id to value & type
          if (id === 'clear') {
            handleButton(null, 'clear');
          } else if (id === 'backspace') {
            handleButton(null, 'backspace');
          } else if (id === 'percent') {
            handleButton('%', 'operator');
          } else if (id === 'divide') {
            handleButton('÷', 'operator');
          } else if (id === 'multiply') {
            handleButton('×', 'operator');
          } else if (id === 'subtract') {
            handleButton('−', 'operator');
          } else if (id === 'add') {
            handleButton('+', 'operator');
          } else if (id === 'equals') {
            handleButton(null, 'equals');
          } else if (id === 'dot') {
            handleButton('.', 'dot');
          } else if (id === '0' || id === '1' || id === '2' || id === '3' || id === '4' ||
                     id === '5' || id === '6' || id === '7' || id === '8' || id === '9') {
            handleButton(btn.innerText.trim(), 'number');
          } else if (id === '0') {
            handleButton('0', 'number');
          }
        });
      });

      // initial update (LEDs will light up based on 0)
      updateDisplay('0');

      // extra: keyboard support (optional)
      window.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key >= '0' && key <= '9') handleButton(key, 'number');
        else if (key === '.') handleButton('.', 'dot');
        else if (key === '+' || key === '−' || key === '-' ) {
          if (key === '-') handleButton('−', 'operator');
          else if (key === '+') handleButton('+', 'operator');
        } else if (key === '*' || key === '×') handleButton('×', 'operator');
        else if (key === '/') handleButton('÷', 'operator');
        else if (key === '%') handleButton('%', 'operator');
        else if (key === '=' || key === 'Enter') handleButton(null, 'equals');
        else if (key === 'Escape') handleButton(null, 'clear');
        else if (key === 'Backspace') {
          e.preventDefault();
          handleButton(null, 'backspace');
        }
      });
    })();