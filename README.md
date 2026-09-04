# ⚡ BuildIt '26 — 12-Hour National Hackathon Portal

> **National Hackathon Portal organized by Mozilla Firefox Club (MFC) • VIT Bhopal University, India.**  
> Built with modern cyberpunk glassmorphic aesthetics, real-time Firebase Firestore synchronization, Google Authentication, dynamic Team Finder, and holographic team passes.

---

## 🌟 Overview

**BuildIt '26** is a 12-hour high-velocity national hackathon challenging student developers, designers, and systems architects across India to prototype state-of-the-art solutions across four innovation tracks.

- **Organizers:** Mozilla Firefox Club (MFC)
- **Institution:** VIT Bhopal University, India
- **Duration:** 12 Hours Sprint (8:00 AM – 8:00 PM IST)
- **Mode:** Hybrid — In-Person (VIT Bhopal Central Campus) & Virtual (Pan-India)

---

## 🚀 Key Features

### 1. 🛡️ Participant Portal & Dashboard
- **Personalized Access:** Secure sign-in with credentials or 1-Click Google Authentication.
- **Squad Formation:** Team Leaders can manage roster (up to 4 members), issue secure invite codes (`BLD-XXXX`), and confirm team entries.
- **Incoming Requests & Invites:** Centralized requests tab to accept/decline team invitations and team finder connection requests.
- **Official Holographic Team Pass:** Generates a verifiable digital pass with dynamic QR code verification upon team finalization.

### 2. ⚡ Dynamic Team Finder
- **Builder Directory:** Searchable by technical stack, role category (AI/ML, Frontend, Backend, Web3, Design), and campus timezone.
- **Interactive Requests:** Send direct connection requests to registered builders with customized pitch notes.
- **Smart Protection & Auto-Removal:**
  - Unauthenticated visitors clicking connect receive `"Login first to connect"` prompts.
  - Users with confirmed/locked squads receive `"Already made team"` notices.
  - Automatically hides builders once they form or join an active squad.

### 3. 🔥 Firebase Firestore & Google Auth
- Direct integration with Firebase SDK v10 (Firestore Database & Firebase Authentication).
- Automatically synchronizes registered participants, team rosters, and invite requests to cloud collections (`participants`, `teams`, `requests`).
- Live fallback and local resilience for seamless offline/online transitions.

### 4. 💻 Interactive Hacker CLI Terminal
- Built-in retro cyberpunk terminal accessible via `~` hotkey or floating action button.
- Supports interactive commands: `help`, `tracks`, `schedule`, `prizes`, `team`, `status`, `matrix`, `clear`, `exit`.

### 5. 🎨 Cyberpunk Glassmorphic Design
- Pure Vanilla CSS design tokens with custom HSL palettes (Amber, Gold, Cyan, Dark Surface).
- Ambient backdrop glow effects, interactive micro-animations, particle canvas, and holographic foil reflections.
- Integrated sound effects engine (`SoundEngine`) for clicks, confirmations, and alerts.

---

## 🛠️ Technology Stack

- **Core:** HTML5, Modern ECMAScript (Vanilla JavaScript)
- **Styling:** Vanilla CSS (Glassmorphism, CSS Custom Properties, Responsive Grid & Flexbox)
- **Bundler / Dev Server:** [Vite](https://vitejs.dev/)
- **Backend / Database:** [Google Firebase](https://firebase.google.com/) (Firestore & Firebase Auth)
- **Fonts:** Syne, Instrument Serif, Plus Jakarta Sans, JetBrains Mono

---

## 📦 Project Structure

```
hackathon_website/
├── index.html                   # Core single-page application & modals
├── package.json                 # Project dependencies and build scripts
├── vite.config.js               # Vite configuration
├── .gitignore                   # Ignored files (node_modules, dist, etc.)
├── public/                      # Static assets & favicon
└── src/
    ├── scripts/
    │   ├── main.js              # Application bootstrapper
    │   ├── dashboard.js         # Participant portal & request handling
    │   ├── participantStore.js  # Local database store & cloud sync bridge
    │   ├── teamMatcher.js       # Team Finder directory & connection logic
    │   ├── registration.js      # 3-Step registration wizard
    │   ├── firebaseConfig.js    # Firebase initialization & credentials
    │   ├── firebaseSync.js      # Firestore synchronization engine
    │   ├── terminal.js          # Interactive CLI terminal emulator
    │   └── audio.js             # Web Audio sound engine
    └── styles/
        ├── main.css             # Design tokens, variables & typography
        ├── components.css       # Modals, tickets, buttons, cards & panels
        └── utilities.css        # Responsive layouts & animations
```

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/vishalsoni2006/buildit-hackathon-2026.git
cd buildit-hackathon-2026
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173/`.

### 4. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

---

## 🔑 Demo & Test Accounts

The portal comes pre-seeded with registered student participants for demonstration and testing:

| Name | Registered Email | Default Password | Role | Track |
| :--- | :--- | :--- | :--- | :--- |
| **Aarav Sharma** | `aarav@vitbhopal.ac.in` | `Aarav@2026` | AI / ML Researcher | Autonomous AI & Multi-Agent Systems |
| **Ananya Verma** | `ananya@vitbhopal.ac.in` | `Ananya@2026` | Fullstack & Systems | Autonomous AI & Multi-Agent Systems |
| **Devansh Mehta** | `devansh.gupta@vitbhopal.ac.in` | `Devansh@2026` | Spatial Computing / XR | Spatial Computing & XR |
| **Siddharth Rao** | `siddharth@iitb.ac.in` | `Sid@2026` | Web3 & Cryptography | Decentralized Protocols & Web3 |

---

## 📜 Innovation Tracks

1. **Track 01: Autonomous AI & Multi-Agent Systems** — Agentic workflows, quantized SLMs, self-healing codebases.
2. **Track 02: Decentralized Protocols & Web3 Infrastructure** — Zero-knowledge identity, decentralized compute, cross-chain verification.
3. **Track 03: Spatial Computing, XR & Cyber-Physical Tech** — WebXR interfaces, gesture-driven spatial computing, digital twins.
4. **Track 04: Tech for Humanity & Climate Intelligence** — Sustainable grids, catastrophe early-warning systems, ethical open-source tech.

---

## 🤝 Contributing

Contributions, feedback, and issues are always welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

Organized with ❤️ by **Mozilla Firefox Club (MFC) • VIT Bhopal University**.
