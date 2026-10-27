# LED Live Calculator

A calculator with a glowing LED-style interface, built with HTML, CSS, and vanilla JavaScript. The display color and the row of LED indicator dots change dynamically based on the number shown, so every result has its own glow.

## Features

- Basic operations: addition, subtraction, multiplication, and division
- Percent (modulo), clear, and backspace buttons
- Live LED glow on the display that changes color with the current value
- Five LED indicator dots that light up according to the size of the number
- Pulsing red error state for invalid operations such as division by zero
- Full keyboard support (numbers, operators, Enter, Backspace, Escape)
- Results rounded to avoid floating-point artifacts, with scientific notation for very large numbers
- Responsive layout with a dark, glowing button design

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6)

## Project Structure

```
LED-Calculator/
├── index.html    # Calculator layout
├── LED.css       # LED-themed styling and animations
├── LED.js        # Calculator logic and live LED colors
└── README.md
```

## How to Run

1. Clone or download this repository:
   ```
   git clone https://github.com/your-username/led-calculator.git
   ```
2. Open `index.html` in any modern browser.

No installation or dependencies required.

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| 0-9 | Enter digits |
| . | Decimal point |
| + - * / % | Operators |
| Enter or = | Calculate result |
| Backspace | Delete last digit |
| Escape | Clear |

## How the LED Effect Works

The display color is calculated from the value on screen. The number is mapped to a hue, which is applied to the text glow and a subtle background tint. The five indicator dots light up based on the magnitude of the number and shift slightly in hue from one another. Errors turn everything red and trigger a pulsing animation.

## Author

Created by Destin.

## License

This project is open source and available for personal and educational use.
