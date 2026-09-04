import { soundEngine } from './audio.js';
import { participantStore } from './participantStore.js';

const INITIAL_HACKERS = [
  {
    id: 'h-1',
    participantId: 'p-aarav',
    name: 'Aarav Sharma',
    email: 'aarav@vitbhopal.ac.in',
    role: 'AI/ML Researcher',
    roleCategory: 'aiml',
    pitch: 'Building a multi-agent consensus framework with quantized SLMs for edge devices. Looking for a frontend developer proficient in Three.js.',
    skills: ['PyTorch', 'LangChain', 'vLLM', 'Python', 'FastAPI'],
    tz: 'IST (Bhopal)',
    contact: 'aarav_sharma#4021'
  },
  {
    id: 'h-2',
    participantId: 'p-ananya',
    name: 'Ananya Verma',
    email: 'ananya@vitbhopal.ac.in',
    role: 'Fullstack & Systems',
    roleCategory: 'frontend',
    pitch: 'Frontend engineer with WebGL & Next.js experience. Looking for AI/ML and systems builders to create high-velocity developer tools.',
    skills: ['TypeScript', 'Next.js', 'WebGPU', 'Tailwind', 'Rust'],
    tz: 'IST (Mumbai)',
    contact: 'ananya_verma_in'
  },
  {
    id: 'h-3',
    participantId: 'p-siddharth',
    name: 'Siddharth Rao',
    email: 'siddharth@iitb.ac.in',
    role: 'Web3 & Cryptography',
    roleCategory: 'web3',
    pitch: 'Working on zero-knowledge identity rails for decentralized AI agents. Seeking a backend engineer with Rust/Go experience.',
    skills: ['Solana', 'Rust', 'Circom', 'Viem', 'ZK-SNARKs'],
    tz: 'IST (Bengaluru)',
    contact: 'sid_rao#8812'
  },
  {
    id: 'h-4',
    participantId: 'p-priya',
    name: 'Priya Patel',
    email: 'priya@iiitd.ac.in',
    role: 'Lead UI/UX Designer',
    roleCategory: 'design',
    pitch: 'Product designer focusing on cyberpunk & glassmorphic design systems. Ready to elevate an ambitious Indian student hack project.',
    skills: ['Figma', 'Spline 3D', 'Design Systems', 'Prototyping', 'CSS'],
    tz: 'IST (Ahmedabad)',
    contact: 'priya_patel_ux'
  },
  {
    id: 'h-5',
    participantId: 'p-rohan',
    name: 'Rohan Iyer',
    email: 'rohan@nitt.edu',
    role: 'Distributed Backend',
    roleCategory: 'backend',
    pitch: 'High-throughput microservices architect. Building ultra-low latency WebSocket state sync for collaborative developer canvas.',
    skills: ['Go', 'Docker', 'Kubernetes', 'Redis', 'WebSockets', 'gRPC'],
    tz: 'IST (Chennai)',
    contact: 'rohan_iyer#1099'
  },
  {
    id: 'h-6',
    participantId: 'p-devansh',
    name: 'Devansh Mehta',
    email: 'devansh.gupta@vitbhopal.ac.in',
    role: 'Spatial Computing / XR',
    roleCategory: 'aiml',
    pitch: 'WebXR & Three.js developer prototyping gesture-controlled 3D molecular biology and spatial health simulation.',
    skills: ['WebXR', 'Three.js', 'Computer Vision', 'PyTorch', 'C++'],
    tz: 'IST (Delhi NCR)',
    contact: 'devansh_xr#3301'
  }
];

export function initTeamMatcher() {
  function getEligibleHackers() {
    const participants = participantStore.getParticipants();
    const teams = participantStore.getTeams();
    const customHackers = JSON.parse(localStorage.getItem('buildit_custom_hackers') || '[]');

    const candidateProfiles = [...customHackers, ...INITIAL_HACKERS];
    const eligible = [];
    const seenIds = new Set();

    for (const h of candidateProfiles) {
      // 1. Strictly MUST be a registered participant in participantStore
      const participant = participants.find(p => 
        p.id === h.participantId || 
        (p.email && h.email && p.email.toLowerCase() === h.email.toLowerCase())
      );

      if (!participant) continue; // Only registered users allowed!

      if (seenIds.has(participant.id)) continue;

      // 2. Automatically remove if they accepted a request and entered in a team or locked their pass
      const team = teams.find(t => t.members && t.members.includes(participant.id));
      if (team) {
        // If team has more than 1 member, they have entered into a team! Remove automatically!
        if (team.members.length > 1) {
          continue;
        }
        // If team entries are locked / pass generated, remove automatically!
        if (team.isConfirmed) {
          continue;
        }
      }

      // If user joined someone else's team as a member (non-leader), remove automatically!
      if (participant.isLeader === false) {
        continue;
      }

      seenIds.add(participant.id);

      eligible.push({
        ...h,
        id: h.id || ('h-' + participant.id),
        participantId: participant.id,
        name: participant.name || h.name,
        email: participant.email || h.email,
        role: h.role || participant.role,
        roleCategory: h.roleCategory || 'aiml',
        pitch: h.pitch || `Building for BuildIt 2026 in the ${participant.track} track. Seeking passionate teammates!`,
        skills: h.skills || ['Fullstack', 'JavaScript', 'Python'],
        tz: h.tz || (participant.college ? `IST (${participant.college})` : 'IST (India)'),
        contact: h.contact || participant.email
      });
    }

    // Also include any other registered solo users who don't have custom cards yet
    for (const participant of participants) {
      if (seenIds.has(participant.id)) continue;

      const team = teams.find(t => t.members && t.members.includes(participant.id));
      if (team && (team.members.length > 1 || team.isConfirmed)) continue;
      if (participant.isLeader === false) continue;

      seenIds.add(participant.id);

      eligible.push({
        id: 'h-' + participant.id,
        participantId: participant.id,
        name: participant.name,
        email: participant.email,
        role: participant.role || 'Pioneer Hacker',
        roleCategory: participant.role?.toLowerCase().includes('design') ? 'design' :
                      participant.role?.toLowerCase().includes('web3') ? 'web3' :
                      participant.role?.toLowerCase().includes('back') ? 'backend' :
                      participant.role?.toLowerCase().includes('front') ? 'frontend' : 'aiml',
        pitch: `Registered for ${participant.track}. Looking for passionate teammates for the 12-hour hackathon!`,
        skills: ['Fullstack', 'TypeScript', 'FastAPI'],
        tz: `IST (${participant.college || 'India'})`,
        contact: participant.email
      });
    }

    return eligible;
  }

  let activeRole = 'all';
  let searchTerm = '';

  const grid = document.getElementById('teammate-grid');
  const searchInput = document.getElementById('matcher-search-input');
  const filterChips = document.querySelectorAll('.role-chip');
  const postBtn = document.getElementById('open-post-hacker-modal');
  const postModal = document.getElementById('post-hacker-modal');
  const postForm = document.getElementById('post-hacker-form');
  const closePostBtn = document.getElementById('close-post-hacker-modal');

  // Connect with Builder Modal elements
  const connectModal = document.getElementById('connect-builder-modal');
  const closeConnectBtn = document.getElementById('close-connect-builder-modal');
  const cancelConnectBtn = document.getElementById('cancel-connect-btn');
  const connectForm = document.getElementById('connect-builder-form');

  if (closeConnectBtn && connectModal) {
    closeConnectBtn.addEventListener('click', () => connectModal.classList.remove('active'));
  }
  if (cancelConnectBtn && connectModal) {
    cancelConnectBtn.addEventListener('click', () => connectModal.classList.remove('active'));
  }
  if (connectModal) {
    connectModal.addEventListener('click', (e) => {
      if (e.target === connectModal) connectModal.classList.remove('active');
    });
  }

  // Handle Connect Builder Submission -> creates notification in Requests tab
  if (connectForm) {
    connectForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const currentUser = participantStore.getCurrentUser();
      if (!currentUser) {
        soundEngine.playError();
        if (connectModal) connectModal.classList.remove('active');
        showNotificationToast(
          'Login first to connect',
          'Please sign in to your BuildIt account to send connection requests.',
          'warning'
        );
        const loginNotice = document.getElementById('login-modal-notice');
        if (loginNotice) {
          loginNotice.textContent = 'Login first to connect';
          loginNotice.style.display = 'block';
        }
        const loginModal = document.getElementById('login-modal');
        if (loginModal) loginModal.classList.add('active');
        return;
      }

      const userTeam = participantStore.getCurrentUserTeam();
      if (userTeam && (userTeam.isConfirmed || (userTeam.members && userTeam.members.length > 1) || currentUser.isLeader === false)) {
        soundEngine.playError();
        if (connectModal) connectModal.classList.remove('active');
        showNotificationToast(
          'Already made team',
          'Your team entries are already locked and your Official Team Pass is generated.',
          'warning'
        );
        return;
      }

      const toParticipantId = document.getElementById('connect-target-id').value;
      const toEmail = document.getElementById('connect-target-email').value;
      const toName = document.getElementById('connect-target-name').value;
      const senderName = document.getElementById('connect-sender-name').value.trim();
      const senderEmail = document.getElementById('connect-sender-email').value.trim();
      const senderRole = document.getElementById('connect-sender-role').value.trim();
      const pitch = document.getElementById('connect-message').value.trim();

      const res = participantStore.sendConnectionRequest({
        toParticipantId,
        toEmail,
        toName,
        senderName,
        senderEmail,
        senderRole,
        pitch
      });

      if (res.success) {
        if (connectModal) connectModal.classList.remove('active');
        showNotificationToast(
          `✓ Connection request sent to ${toName}!`,
          `They have received a notification in the Requests tab of their personal dashboard.`,
          'success'
        );
      } else {
        if (connectModal) connectModal.classList.remove('active');
        if (res.notLoggedIn) {
          showNotificationToast('Login first to connect', res.error, 'warning');
          const loginNotice = document.getElementById('login-modal-notice');
          if (loginNotice) {
            loginNotice.textContent = 'Login first to connect';
            loginNotice.style.display = 'block';
          }
          const loginModal = document.getElementById('login-modal');
          if (loginModal) loginModal.classList.add('active');
        } else if (res.isTeamLocked) {
          showNotificationToast('Already made team', res.error, 'warning');
        } else {
          showNotificationToast('Request Not Sent ⚠️', res.error || 'Unable to send connection request.', 'warning');
        }
      }
    });
  }

  function renderHackers() {
    if (!grid) return;

    const hackers = getEligibleHackers();

    const filtered = hackers.filter(h => {
      const matchRole = activeRole === 'all' || h.roleCategory === activeRole;
      const matchSearch =
        searchTerm === '' ||
        h.name.toLowerCase().includes(searchTerm) ||
        h.role.toLowerCase().includes(searchTerm) ||
        h.pitch.toLowerCase().includes(searchTerm) ||
        h.skills.some(s => s.toLowerCase().includes(searchTerm));

      return matchRole && matchSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem; background: rgba(18, 19, 29, 0.4); border-radius: var(--radius-lg); border: 1px dashed var(--border-glass);">
          <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 0.5rem;">No solo registered hackers found matching "${escapeHtml(searchTerm)}".</p>
          <p style="font-size: 0.85rem; color: var(--text-dim);">Hackers who have already joined a team are automatically removed from this board.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(h => {
      const initials = h.name.split(' ').map(n => n[0]).join('').substring(0, 2);
      return `
        <div class="hacker-profile-card">
          <div>
            <div class="hacker-card-header">
              <div class="hacker-avatar">${initials}</div>
              <div>
                <h4 class="hacker-name">${escapeHtml(h.name)}</h4>
                <span class="hacker-role">${escapeHtml(h.role)}</span>
              </div>
            </div>
            <p class="hacker-pitch">"${escapeHtml(h.pitch)}"</p>
            <div class="hacker-skills">
              ${h.skills.map(skill => `<span class="tech-chip">${escapeHtml(skill)}</span>`).join('')}
            </div>
          </div>
          <div class="hacker-card-footer">
            <div class="hacker-tz">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${escapeHtml(h.tz)}</span>
            </div>
            <button class="btn btn-outline-amber connect-hacker-btn" 
              data-id="${h.participantId || h.id}" 
              data-name="${escapeHtml(h.name)}" 
              data-email="${h.email || ''}" 
              data-contact="${escapeHtml(h.contact || '')}" 
              style="padding: 0.4rem 0.95rem; font-size: 0.78rem;">
              Connect ⚡
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Open connection request modal when Connect button is clicked
    grid.querySelectorAll('.connect-hacker-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const currentUser = participantStore.getCurrentUser();

        // 1. If person has not logged in, show 'Login first to connect'
        if (!currentUser) {
          soundEngine.playError();
          showNotificationToast(
            'Login first to connect',
            'Please sign in to your BuildIt account to connect with other builders.',
            'warning'
          );
          const loginNotice = document.getElementById('login-modal-notice');
          if (loginNotice) {
            loginNotice.textContent = 'Login first to connect';
            loginNotice.style.display = 'block';
          }
          const loginModal = document.getElementById('login-modal');
          if (loginModal) loginModal.classList.add('active');
          return;
        }

        // 2. If person locked the team or already made team, show 'Already made team'
        const userTeam = participantStore.getCurrentUserTeam();
        if (userTeam && (userTeam.isConfirmed || (userTeam.members && userTeam.members.length > 1) || currentUser.isLeader === false)) {
          soundEngine.playError();
          showNotificationToast(
            'Already made team',
            'Your team entries are already locked and finalized.',
            'warning'
          );
          return;
        }

        const targetId = btn.getAttribute('data-id');
        const targetName = btn.getAttribute('data-name');
        const targetEmail = btn.getAttribute('data-email');
        const targetContact = btn.getAttribute('data-contact');

        // Prevent self connection
        if (currentUser.id === targetId || (currentUser.email && targetEmail && currentUser.email.toLowerCase() === targetEmail.toLowerCase())) {
          soundEngine.playError();
          showNotificationToast('Invalid Request ⚠️', 'You cannot send a connection request to your own account.', 'warning');
          return;
        }

        // Check if target builder's team is already locked
        const targetTeam = participantStore.getTeamByParticipantId(targetId);
        if (targetTeam && (targetTeam.isConfirmed || (targetTeam.members && targetTeam.members.length > 1))) {
          soundEngine.playError();
          showNotificationToast(
            'Already made team',
            `${targetName} has already formed or locked their team.`,
            'warning'
          );
          return;
        }

        if (connectModal) {
          document.getElementById('connect-target-id').value = targetId;
          document.getElementById('connect-target-email').value = targetEmail;
          document.getElementById('connect-target-name').value = targetName;
          
          const titleEl = document.getElementById('connect-modal-title');
          if (titleEl) titleEl.textContent = `Connect with ${targetName}`;

          document.getElementById('connect-sender-name').value = currentUser.name;
          document.getElementById('connect-sender-email').value = currentUser.email;
          document.getElementById('connect-sender-role').value = currentUser.role || '';
          document.getElementById('connect-message').value = `Hi ${targetName}, I saw your listing on Team Finder and would love to connect and team up for the 12-hour hackathon!`;

          connectModal.classList.add('active');
        }
      });
    });
  }

  function showNotificationToast(title, subtitle = '', type = 'success') {
    // Remove any existing notification toast
    const existing = document.getElementById('buildit-notification-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'buildit-notification-toast';
    const isWarning = type === 'warning' || type === 'error';
    const borderColor = isWarning ? '#f59e0b' : '#34d399';
    const glowColor = isWarning ? 'rgba(245, 158, 11, 0.45)' : 'rgba(52, 211, 153, 0.35)';

    toast.style.cssText = `
      position: fixed;
      bottom: 2.5rem;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #0e111ceb;
      border: 1.5px solid ${borderColor};
      color: #fff;
      padding: 0.95rem 1.65rem;
      border-radius: var(--radius-full);
      box-shadow: 0 20px 45px rgba(0,0,0,0.85), 0 0 25px ${glowColor};
      display: flex;
      align-items: center;
      gap: 0.8rem;
      z-index: 10005;
      font-size: 0.92rem;
      font-family: var(--font-sans);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      max-width: 90vw;
      pointer-events: none;
    `;

    toast.innerHTML = `
      <span style="font-size: 1.2rem; flex-shrink: 0;">${isWarning ? '⚠️' : '✓'}</span>
      <div style="display: flex; flex-direction: column; gap: 0.15rem; text-align: left;">
        <div style="font-weight: 800; color: ${borderColor}; font-size: 0.95rem; letter-spacing: 0.01em;">${escapeHtml(title)}</div>
        ${subtitle ? `<div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.3;">${escapeHtml(subtitle)}</div>` : ''}
      </div>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 350);
    }, 4500);
  }

  const showConnectSuccessToast = (title, subtitle = '') => showNotificationToast(title, subtitle, 'success');

  function showConnectToast(name, contact) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: #151824;
      border: 1px solid var(--accent-amber);
      color: #fff;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-full);
      box-shadow: 0 15px 35px rgba(0,0,0,0.8), 0 0 25px rgba(255,140,0,0.4);
      display: flex;
      align-items: center;
      gap: 1rem;
      z-index: 3000;
      font-size: 0.9rem;
      font-family: var(--font-sans);
      animation: slideUp 0.3s ease;
    `;

    toast.innerHTML = `
      <span>Reach <strong>${escapeHtml(name)}</strong> on Discord/Handle: <code style="color: var(--accent-gold); font-family: var(--font-mono);">${escapeHtml(contact)}</code></span>
      <button style="background: var(--accent-amber); color: #000; border: none; padding: 0.3rem 0.8rem; border-radius: var(--radius-full); font-weight: 700; cursor: pointer;">Copied!</button>
    `;

    document.body.appendChild(toast);
    navigator.clipboard.writeText(contact).catch(() => {});

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      renderHackers();
    });
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeRole = chip.getAttribute('data-role');
      renderHackers();
    });
  });

  if (postBtn && postModal) {
    postBtn.addEventListener('click', () => {
      const currentUser = participantStore.getCurrentUser();
      if (!currentUser) {
        soundEngine.playError();
        showNotificationToast(
          'Login first to connect',
          'Please sign in to your BuildIt account before posting your listing on the Team Finder board.',
          'warning'
        );
        const loginNotice = document.getElementById('login-modal-notice');
        if (loginNotice) {
          loginNotice.textContent = 'Login first to connect';
          loginNotice.style.display = 'block';
        }
        const loginModal = document.getElementById('login-modal');
        if (loginModal) loginModal.classList.add('active');
        return;
      }

      const userTeam = participantStore.getCurrentUserTeam();
      if (userTeam && (userTeam.isConfirmed || (userTeam.members && userTeam.members.length > 1) || currentUser.isLeader === false)) {
        soundEngine.playError();
        showNotificationToast(
          'Already made team',
          'Your team entries are already locked and finalized. You cannot post a listing to find teammates.',
          'warning'
        );
        return;
      }

      const nameInput = document.getElementById('post-name');
      const emailInput = document.getElementById('post-email');
      const roleInput = document.getElementById('post-role');
      if (nameInput) nameInput.value = currentUser.name;
      if (emailInput) {
        emailInput.value = currentUser.email;
        emailInput.readOnly = true;
      }
      if (roleInput && !roleInput.value) roleInput.value = currentUser.role || '';
      postModal.classList.add('active');
    });

    if (closePostBtn) {
      closePostBtn.addEventListener('click', () => postModal.classList.remove('active'));
    }

    postModal.addEventListener('click', (e) => {
      if (e.target === postModal) postModal.classList.remove('active');
    });
  }

  if (postForm) {
    postForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const currentUser = participantStore.getCurrentUser();
      if (!currentUser) {
        soundEngine.playError();
        postModal.classList.remove('active');
        showNotificationToast('Login first to connect', 'Please sign in to post your listing.', 'warning');
        const loginNotice = document.getElementById('login-modal-notice');
        if (loginNotice) {
          loginNotice.textContent = 'Login first to connect';
          loginNotice.style.display = 'block';
        }
        const loginModal = document.getElementById('login-modal');
        if (loginModal) loginModal.classList.add('active');
        return;
      }

      const userTeam = participantStore.getCurrentUserTeam();
      if (userTeam && (userTeam.isConfirmed || (userTeam.members && userTeam.members.length > 1) || currentUser.isLeader === false)) {
        soundEngine.playError();
        postModal.classList.remove('active');
        showNotificationToast(
          'Already made team',
          'Your team entries are already locked and finalized.',
          'warning'
        );
        return;
      }

      const name = document.getElementById('post-name').value.trim();
      const email = document.getElementById('post-email')?.value.trim() || currentUser.email;
      const role = document.getElementById('post-role').value.trim();
      const roleCategory = document.getElementById('post-category').value;
      const pitch = document.getElementById('post-pitch').value.trim();
      const skills = document.getElementById('post-skills').value.split(',').map(s => s.trim()).filter(Boolean);
      const tz = document.getElementById('post-tz').value.trim() || 'IST (India)';
      const contact = document.getElementById('post-contact').value.trim() || 'builder#0001';

      const newHacker = {
        id: 'h-custom-' + Date.now(),
        participantId: currentUser.id,
        name: name || currentUser.name,
        email: email || currentUser.email,
        role,
        roleCategory,
        pitch,
        skills,
        tz,
        contact
      };

      const customHackers = JSON.parse(localStorage.getItem('buildit_custom_hackers') || '[]');
      customHackers.unshift(newHacker);
      localStorage.setItem('buildit_custom_hackers', JSON.stringify(customHackers));

      postForm.reset();
      postModal.classList.remove('active');
      renderHackers();
      showNotificationToast('Listing Published Successfully! ⚡', 'Other builders can now view your pitch and send you connection requests directly to your dashboard.', 'success');
    });
  }

  // Automatically update Team Finder when any user joins/enters a team or auth changes
  window.addEventListener('buildit_team_updated', () => {
    renderHackers();
  });

  window.addEventListener('buildit_requests_updated', () => {
    renderHackers();
  });

  window.addEventListener('buildit_auth_changed', () => {
    renderHackers();
  });

  renderHackers();
}
