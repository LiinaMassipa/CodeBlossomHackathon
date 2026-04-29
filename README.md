SafeCalc — Disguised Emergency Safety App

SafeCalc is a fully functional calculator that doubles as a discreet emergency safety tool for people in dangerous or abusive situations. It looks and works like a normal calculator, but a secret gesture reveals a hidden screen with emergency contacts and an SOS button.

 How It Works

Double-tap the `+` button to switch from the calculator to the safe screen. If the user switches tabs while the safe screen is open, the app automatically returns to the calculator to protect their privacy.

 Safe Screen Features

- SOS button that calls Emergency Services (10111) with one tap
- Direct-call contacts for Police, Ambulance, Lifeline Namibia, Childline, and SMS Help Line
- A silent background email alert is sent whenever SOS or any contact is tapped
- No data is stored — localStorage, sessionStorage, and cookies are cleared on every load

 File Structure


├── index.html      
├── style.css       
├── script.js       
└── README.md       


Notes

- Looks like a standard calculator to anyone watching
- Configured for Namibia — update the `CONTACTS` array in `script.js` to adapt for another country
- Free to use and adapt for non-commercial safety and humanitarian purposes