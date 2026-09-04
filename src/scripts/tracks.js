import { soundEngine } from './audio.js';

export const TRACKS_DATA = [
  {
    id: 'ai-agents',
    number: 'Track 01',
    title: 'Autonomous AI & Multi-Agent Systems',
    bounty: 'Track Winner Award & Trophy',
    icon: '⚡',
    description: 'Design self-reasoning AI agent swarms, multimodal reasoning tools, local LLM architectures, and agentic workflows that automate high-complexity real-world tasks.',
    stack: ['LangChain', 'LlamaIndex', 'MCP Protocol', 'PyTorch', 'vLLM', 'OpenAI / Anthropic APIs'],
    sampleIdeas: [
      'Autonomous software QA & self-healing bug detection swarms',
      'Multi-agent financial auditor with verifiable cryptographic proofs',
      'Local-first voice assistant running quantized on-device SLMs',
      'Autonomous scientific research assistant synthesizing arXiv papers'
    ],
    sponsorPerk: 'Google Cloud & OpenAI providing direct model compute credits and mentorship per team.'
  },
  {
    id: 'web3-infra',
    number: 'Track 02',
    title: 'Decentralized Protocols & Web3 Infrastructure',
    bounty: 'Track Winner Award & Trophy',
    icon: '🔗',
    description: 'Build censorship-resistant decentralized networks, zero-knowledge proofs, decentralized AI compute coordination, and seamless consumer crypto UX.',
    stack: ['Solana', 'Rust', 'Circom / ZK-SNARKs', 'Viem', 'Supabase', 'IPFS / Arweave'],
    sampleIdeas: [
      'ZK-enabled identity verification preserving zero biometric disclosure',
      'High-throughput micro-payment rails for machine-to-machine AI agent billing',
      'Decentralized model training weight checkpoint verification',
      'Social graph portability protocol with peer-to-peer end-to-end encryption'
    ],
    sponsorPerk: 'Solana Foundation & Supabase awarding developer grants and incubation fast-track.'
  },
  {
    id: 'spatial-xr',
    number: 'Track 03',
    title: 'Spatial Computing, XR & Cyber-Physical Tech',
    bounty: 'Track Winner Award & Trophy',
    icon: '🥽',
    description: 'Bridge digital software with physical reality. Develop WebGPU shaders, Apple Vision Pro / WebXR spatial experiences, robotics telemetry, or neural interface interfaces.',
    stack: ['WebXR', 'Three.js / WebGPU', 'ROS 2', 'OpenCV', 'WebSockets', 'ShaderToy'],
    sampleIdeas: [
      'Collaborative 3D CAD sculpting room in real-time WebXR',
      'Spatial computer vision assistant for surgical precision training',
      'Edge AI drone swarm obstacle avoidance and path planning',
      'Haptic feedback controller driver for tactile virtual reality'
    ],
    sponsorPerk: 'Hardware loaner lab with Apple Vision Pro headsets, Meta Quest 3, and Raspberry Pi 5s.'
  },
  {
    id: 'tech-humanity',
    number: 'Track 04',
    title: 'Tech for Humanity, Bio & Climate Intelligence',
    bounty: 'Track Winner Award & Trophy',
    icon: '🌱',
    description: 'Create technologies that address existential planetary challenges: wildfire forecasting, clean energy grid balancing, accessible assistive tech, or bio-computation.',
    stack: ['TensorFlow', 'GeoSpatial APIs', 'FastAPI', 'Next.js', 'Pandas', 'IoT Sensors'],
    sampleIdeas: [
      'Satellite image computer vision for real-time forest fire perimeter tracking',
      'Neural audio transcription translating non-verbal motor speech disorders',
      'Hyperlocal renewable energy micro-grid trading network',
      'Bio-marker spectral analysis using smartphone cameras'
    ],
    sponsorPerk: 'Dedicated venture mentoring from Climate Capital & Earthshot accelerator partners.'
  }
];

export function initTracks() {
  const modal = document.getElementById('track-modal');
  const modalBody = document.getElementById('track-modal-content');
  const closeBtn = document.getElementById('track-modal-close');

  if (!modal || !modalBody) return;

  function openTrackModal(track) {
    soundEngine.playClick();
    modalBody.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem;">
        <div class="track-icon-badge" style="width: 60px; height: 60px; font-size: 1.8rem;">${track.icon}</div>
        <div>
          <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-gold);">${track.number}</span>
          <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: #fff; margin-top: 0.2rem;">${track.title}</h3>
        </div>
      </div>
      
      <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: var(--radius-md); padding: 0.75rem 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #4ade80; font-family: var(--font-mono); font-weight: 700; font-size: 0.95rem;">🏆 ${track.bounty}</span>
        <span style="color: var(--text-muted); font-size: 0.8rem;">Judged by Domain Experts</span>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 0.5rem;">Track Brief</h4>
        <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.65;">${track.description}</p>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 0.6rem;">Recommended Tooling & Stack</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${track.stack.map(s => `<span class="tech-chip">${s}</span>`).join('')}
        </div>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 0.6rem;">Idea Sparks & Challenge Prompts</h4>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;">
          ${track.sampleIdeas.map(idea => `
            <li style="display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.9rem; color: var(--text-secondary);">
              <span style="color: var(--accent-amber); margin-top: 2px;">▸</span>
              <span>${idea}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div style="background: rgba(255, 140, 0, 0.08); border: 1px solid rgba(255, 140, 0, 0.25); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem;">
        <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--accent-gold); font-weight: 700; letter-spacing: 0.05em;">Sponsor Grant & Hardware Labs</span>
        <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.35rem;">${track.sponsorPerk}</p>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 1rem;">
        <button class="btn btn-secondary modal-close-action" style="padding: 0.65rem 1.4rem;">Close</button>
        <button class="btn btn-primary track-apply-btn" style="padding: 0.65rem 1.4rem;">Build In This Track →</button>
      </div>
    `;

    modal.classList.add('active');

    // Attach listeners inside modal
    modalBody.querySelector('.modal-close-action').addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modalBody.querySelector('.track-apply-btn').addEventListener('click', () => {
      modal.classList.remove('active');
      const regModal = document.getElementById('reg-modal');
      if (regModal) {
        regModal.classList.add('active');
        const trackSelect = document.getElementById('reg-track');
        if (trackSelect) trackSelect.value = track.id;
      }
    });
  }

  // Bind explore buttons on track cards
  document.querySelectorAll('.track-explore-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const trackCard = e.currentTarget.closest('.track-card');
      const trackId = trackCard.getAttribute('data-track-id');
      const track = TRACKS_DATA.find(t => t.id === trackId);
      if (track) openTrackModal(track);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}
