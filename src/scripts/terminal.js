import { soundEngine } from './audio.js';

export function initTerminal() {
  const terminalModal = document.getElementById('terminal-modal');
  const fabBtn = document.getElementById('terminal-fab-btn');
  const navBtn = document.getElementById('terminal-nav-btn');
  const closeBtn = document.getElementById('terminal-close-btn');
  const input = document.getElementById('terminal-input');
  const output = document.getElementById('terminal-output');

  if (!terminalModal || !input || !output) return;

  function toggleTerminal() {
    soundEngine.playClick();
    terminalModal.classList.toggle('open');
    if (terminalModal.classList.contains('open')) {
      input.focus();
    }
  }

  if (fabBtn) fabBtn.addEventListener('click', toggleTerminal);
  if (navBtn) navBtn.addEventListener('click', toggleTerminal);
  if (closeBtn) closeBtn.addEventListener('click', toggleTerminal);

  // Keyboard shortcut: `~` or `Ctrl+\``
  window.addEventListener('keydown', (e) => {
    if (e.key === '`' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      toggleTerminal();
    }
  });

  const commandHistory = [];
  let historyIndex = -1;

  function printLine(text, isCommand = false) {
    const div = document.createElement('div');
    div.className = 'terminal-line';
    if (isCommand) {
      div.innerHTML = `<span class="terminal-prompt-prefix">buildit-os:~$</span> ${text}`;
    } else {
      div.innerHTML = text;
    }
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
  }

  function executeCommand(cmd) {
    const raw = cmd.trim();
    if (!raw) return;

    printLine(raw, true);
    commandHistory.push(raw);
    historyIndex = commandHistory.length;

    const [action, ...args] = raw.toLowerCase().split(' ');

    switch (action) {
      case 'help':
        printLine(`
Available commands:
  <strong style="color: #ffe082;">about</strong>     - Mission brief & hackathon overview
  <strong style="color: #ffe082;">tracks</strong>    - List the 4 innovation tracks & bounty pools
  <strong style="color: #ffe082;">prizes</strong>    - View the $50,000+ prize & VC grant pool
  <strong style="color: #ffe082;">schedule</strong>  - Display key milestones (Day 1 - 3)
  <strong style="color: #ffe082;">register</strong>  - Launch the interactive registration wizard
  <strong style="color: #ffe082;">matrix</strong>    - Toggle phosphor matrix digital rain
  <strong style="color: #ffe082;">whoami</strong>    - Display current hacker session metrics
  <strong style="color: #ffe082;">easteregg</strong> - Reveal transmission from the year 2049
  <strong style="color: #ffe082;">clear</strong>     - Clear the terminal screen
        `);
        break;

      case 'about':
        printLine(`
[BUILDIT 2026 TRANSMISSION]
Organizer: Mozilla Firefox Club (MFC), VIT Bhopal University, India
Venue: VIT Bhopal Central Campus (Kotri Kalan, Ashta, MP, India) + Global Stream
Dates: November 14 - 16, 2026
Format: Hybrid (36-Hour Flagship Hackathon)
Prize Pool: ₹40 Lakh+ ($50,000+) in bounties & compute grants
Mission: Empower 1,500+ student innovators and open-source pioneers to construct cutting-edge AI, decentralized systems, and high-impact technology.
        `);
        break;

      case 'tracks':
        printLine(`
Track 01: <strong style="color: #fff;">Autonomous AI & Multi-Agent Systems</strong> (Winner Trophy & Merits)
Track 02: <strong style="color: #fff;">Decentralized Protocols & Web3 Infra</strong> (Winner Trophy & Merits)
Track 03: <strong style="color: #fff;">Spatial Computing, XR & Cyber-Physical</strong> (Winner Trophy & Merits)
Track 04: <strong style="color: #fff;">Tech for Humanity, Bio & Climate Intelligence</strong> (Winner Trophy & Merits)
        `);
        break;

      case 'prizes':
        printLine(`
[ALL-INDIA PRIZE POOL: ₹50,000 CASH]
🏆 Grand Champion: ₹25,000 Cash + BuildIt Apex Trophy + Direct Mentorship
🥈 2nd Place: ₹15,000 Cash + Silver Trophy + Cloud Compute Vouchers
🥉 3rd Place: ₹10,000 Cash + Bronze Trophy + Hardware Dev Kits
🎯 Special Category Awards: Best Solo Hacker, Best UI/UX Polish, Best All-Girls Team
        `);
        break;

      case 'schedule':
        printLine(`
Day 1 (Nov 14): Check-In (08:00) -> Keynote (10:00) -> HACKING BEGINS (12:00)
Day 2 (Nov 15): VC Office Hours (10:30) -> Midpoint Checkpoint (18:00) -> Synth DJ (21:00)
Day 3 (Nov 16): CODE FREEZE (10:00) -> Live Demo Expo (11:00) -> Grand Finale (16:00)
        `);
        break;

      case 'register':
        printLine('Launching registration wizard...');
        const regModal = document.getElementById('reg-modal');
        if (regModal) {
          regModal.classList.add('active');
          toggleTerminal();
        }
        break;

      case 'whoami':
        printLine(`
USER: Guest Pioneer (IP: ${Math.floor(Math.random() * 200 + 50)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1)
STATUS: Unverified Builder (Apply via 'register' to mint Pass)
SECURITY CLEARANCE: Level 2 (Public Access)
        `);
        break;

      case 'matrix':
        triggerMatrixMode();
        break;

      case 'easteregg':
        printLine(`
"The future is already here — it's just not evenly distributed."
— William Gibson

Remember: Great architectures aren't inherited; they are built at 3 AM with cold brew and relentless grit. See you on the leaderboard.
        `);
        break;

      case 'clear':
        output.innerHTML = '';
        break;

      default:
        printLine(`Command not recognized: "${raw}". Type <strong style="color: #ffe082;">help</strong> for available commands.`);
    }
  }

  function triggerMatrixMode() {
    printLine('<span style="color: #22c55e;">Initializing digital rain protocol...</span>');
    const chars = '01BUILDITλ⚡ΩΔΞΠΣΨΩ010101';
    let count = 0;
    const interval = setInterval(() => {
      let str = '';
      for (let i = 0; i < 40; i++) {
        str += chars[Math.floor(Math.random() * chars.length)] + ' ';
      }
      printLine(`<span style="color: #22c55e; font-size: 0.75rem;">${str}</span>`);
      count++;
      if (count > 12) {
        clearInterval(interval);
        printLine('<span style="color: var(--accent-gold);">Matrix stream terminated.</span>');
      }
    }, 90);
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      soundEngine.playClick();
      executeCommand(input.value);
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      if (historyIndex > 0) {
        historyIndex--;
        input.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        input.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        input.value = '';
      }
    }
  });

  // Initial welcome message
  printLine(`BuildIt OS [Version 26.4.0-release]`);
  printLine(`Type <strong style="color: #ffe082;">help</strong> to inspect available commands or <strong style="color: #ffe082;">register</strong> to join.`);
}
