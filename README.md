# SOS Calculator
 
A disguised emergency resource tool that looks and works like a normal calculator. Built for safety in situations where someone may need to discreetly access emergency contacts without raising suspicion.
 
---
 
## Overview
 
On the surface, this is a fully functional calculator. Hidden inside is an emergency safe screen with direct-dial contacts for Namibian crisis services. The switch between the two is triggered by a secret gesture — a double-tap on the `+` button.
 
---
 
## How to Use
 
### As a Calculator
 
Open the file in any browser. It works like a standard calculator:
 
- Tap or click digits and operators to build an expression
- Press `=` to evaluate
- Press `AC` to clear
- Use `+/-` to toggle positive/negative
- Use `%` to convert to a percentage
**Keyboard shortcuts also work:**
 
| Key | Action |
|-----|--------|
| `0–9` | Enter digit |
| `.` | Decimal point |
| `+` `-` `*` `/` | Set operator |
| `Enter` or `=` | Evaluate |
| `Backspace` | Delete last digit |
| `Escape` | Clear all |
 
---
 
### Opening the Safe Screen
 
**Double-tap the `+` button** within 350 milliseconds to open the emergency safe screen.
 
- Works on both mobile (touch) and desktop (click)
- A small animated pulse on the `+` button briefly confirms the trigger fired
- No other visual hint is shown to bystanders
---
 
### The Safe Screen
 
Once triggered, the calculator disappears and the safe screen opens with:
 
#### SOS Button
A large red pulsing button at the top. Tapping it immediately dials **10111** (Namibian Police / Emergency Services).
 
#### Emergency Contacts
 
| Icon | Name | Number | Description |
|------|------|--------|-------------|
| 🚔 | Emergency Services | 10111 | Police (Namibia) |
| 🚑 | Ambulance / Medical | 10177 | 24/7 free helpline |
| 💬 | Lifeline Namibia | 106 | Crisis counselling |
| 🧒 | Childline | 116 | Children in danger |
| 💬 | SMS Help Line | 31531 | If you cannot speak safely |
 
Each contact card has a call button that opens a `tel:` link to dial directly.
 
#### Returning to the Calculator
Tap the **Back** button in the top-right corner. The safe screen closes, the calculator reappears, and all storage is cleared automatically.
 
---
 
## Safety Features
 
### Auto-Hide on Tab Switch
If the user switches tabs or minimises the browser while the safe screen is open, the app immediately returns to the calculator. This prevents the safe screen from being visible if someone else picks up the device.
 
### Privacy & No Trace
The app is designed to leave no record of use:
 
- No data is written to `localStorage` or `sessionStorage`
- Both storage APIs are cleared every time the user returns to the calculator
- Any cookies are expired immediately on exit
- All inputs have `autocomplete`, `autocorrect`, `autocapitalize`, and `spellcheck` disabled
- No network requests are made — the app works fully offline
- No analytics, no logging, no external dependencies
 
---
 
## File Structure
 
```
emergency-calculator/
│
├── index.html
├── styles.css
├── calculator.js
├── safe-screen.js
├── trigger.js
└── app.js
```
 
Everything is in a single HTML file — no frameworks, no build tools, no dependencies. Open it directly in a browser or host it anywhere.
 
---
 
## Customising Contacts
 
Find the `CONTACTS` array inside the `SafeScreen` module in the `<script>` block:
 
```js
const CONTACTS = [
  { name: 'Emergency Services', number: '10111', description: 'Police (Namibia)', icon: '🚔' },
  // add or edit entries here
];
```
 
Each entry needs `name`, `number`, `description`, and `icon`. The UI renders them automatically. The first entry in the list is also the number dialled by the SOS button.
 
---
 
## Changing the Trigger
 
The double-tap delay defaults to **350ms**. To adjust it, find this line in the `Trigger` module:
 
```js
const DOUBLE_TAP_DELAY = 350;
```
 
The trigger is bound to the `+` button (`#btn-plus`). To change the trigger button, update the selector in `Trigger.init()`.
 
---
 
## Deployment
 
Since the app is a single HTML file with no dependencies, it can be hosted anywhere:
 
- **GitHub Pages** — push to a repo and enable Pages under Settings
- **Netlify / Vercel** — drag and drop the file into the dashboard
- **Local use** — open directly in any browser (`file://`)
- **Any static host** — upload and share the URL
For discretion, host it at a neutral URL that gives no indication of its purpose (e.g. avoid names like `sos-tool` or `emergency-calculator`).
 
---