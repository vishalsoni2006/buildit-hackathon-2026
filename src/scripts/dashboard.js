// ==========================================
// PARTICIPANT DASHBOARD & SECURE PORTAL
// Authentication, Team Invites with Verification Code, and Private Requests Tab
// ==========================================

import { participantStore } from './participantStore.js';
import { soundEngine } from './audio.js';
import { firebaseSync } from './firebaseSync.js';

export function initDashboard() {
  // Elements
  const loginModal = document.getElementById('login-modal');
  const loginBtn = document.getElementById('nav-login-btn');
  const closeLoginBtn = document.getElementById('close-login-modal');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');

  const dashboardModal = document.getElementById('participant-dashboard-modal');
  const dashboardNavBtn = document.getElementById('nav-dashboard-btn');
  const closeDashboardBtn = document.getElementById('close-dashboard-modal');
  const logoutBtn = document.getElementById('nav-logout-btn');


  // Open Login Modal
  if (loginBtn && loginModal) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      soundEngine.playClick();
      loginError.style.display = 'none';
      const loginNotice = document.getElementById('login-modal-notice');
      if (loginNotice) loginNotice.style.display = 'none';
      loginModal.classList.add('active');
    });

    if (closeLoginBtn) {
      closeLoginBtn.addEventListener('click', () => {
        const loginNotice = document.getElementById('login-modal-notice');
        if (loginNotice) loginNotice.style.display = 'none';
        loginModal.classList.remove('active');
      });
    }

    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        const loginNotice = document.getElementById('login-modal-notice');
        if (loginNotice) loginNotice.style.display = 'none';
        loginModal.classList.remove('active');
      }
    });
  }

  // Handle Login Submit
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pass = document.getElementById('login-password').value.trim();

      const result = participantStore.login(email, pass);
      if (!result.success) {
        soundEngine.playError();
        loginError.textContent = result.error;
        loginError.style.display = 'block';
        return;
      }

      soundEngine.playSuccess();
      loginModal.classList.remove('active');
      loginForm.reset();
      updateNavbarAuth();
      openDashboard();
      showToast(`Welcome back, ${result.user.name}!`);
    });
  }

  // Handle Google Sign-In & Firebase Storage
  const googleLoginBtn = document.getElementById('btn-google-login');
  const googleLoginText = document.getElementById('google-login-text');
  const googleFallbackNotice = document.getElementById('google-fallback-notice');
  const googleDemoLoginBtn = document.getElementById('btn-google-demo-login');

  async function executeGoogleLogin(profile) {
    if (!profile || !profile.email) {
      showToast('Google login error: Invalid email received');
      return;
    }

    const cleanEmail = profile.email.trim().toLowerCase();
    const existingUser = participantStore.getParticipantByEmail(cleanEmail);

    if (existingUser) {
      // User is already registered! Log them directly into their personal account
      const res = participantStore.loginWithGoogleExisting(profile);
      if (res.success) {
        loginModal.classList.remove('active');
        if (loginForm) loginForm.reset();
        updateNavbarAuth();
        openDashboard();
        showToast(`✓ Welcome back, ${res.user.name}! Authenticated with Google.`);
      } else {
        showToast('Google login error: ' + (res.error || 'Unknown error'));
      }
    } else {
      // User is NOT registered yet!
      // Only populate personal info (Name & Email) and let the user fill the rest!
      loginModal.classList.remove('active');
      if (loginForm) loginForm.reset();

      const regModal = document.getElementById('reg-modal');
      if (regModal) {
        regModal.classList.add('active');

        const nameInput = document.getElementById('reg-name');
        const emailInput = document.getElementById('reg-email');
        const gName = profile.displayName || profile.name || '';
        const gEmail = profile.email || '';

        if (nameInput) nameInput.value = gName;
        if (emailInput) {
          emailInput.value = gEmail;
          emailInput.readOnly = true;
        }

        // Store pending Google profile metadata for final submission
        window._googlePendingAuth = {
          name: gName,
          email: gEmail,
          avatar: profile.photoURL || '',
          uid: profile.uid || '',
          authProvider: 'google'
        };

        const googlePrefillStatus = document.getElementById('google-prefill-status');
        if (googlePrefillStatus) {
          googlePrefillStatus.style.display = 'block';
          googlePrefillStatus.innerHTML = `✓ Connected Google Account: <strong>${escapeHtml(gName)}</strong> (${escapeHtml(gEmail)})<br><span style="color: var(--text-secondary); font-size: 0.78rem;">Personal info pre-filled. Please fill your College, target Track, Role, and Team to finish!</span>`;
        }

        const schoolInput = document.getElementById('reg-school');
        if (schoolInput) schoolInput.focus();

        showToast(`Personal info loaded from Google for ${gName}. Please complete your registration details!`);
      }
    }
  }

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      googleLoginBtn.disabled = true;
      if (googleLoginText) googleLoginText.textContent = 'Authenticating with Google...';
      if (loginError) loginError.style.display = 'none';

      try {
        const authRes = await firebaseSync.signInWithGoogle();

        if (authRes.success) {
          await executeGoogleLogin(authRes.profile);
        } else if (authRes.cancelled) {
          showToast('Google sign-in was cancelled.');
        } else {
          // Google provider requires enabling in Firebase console
          if (googleFallbackNotice) googleFallbackNotice.style.display = 'block';
          showToast('Live Google Auth requires enabling Google provider in Firebase Console. You can test with 1-click Google verified below!');
        }
      } catch (err) {
        console.warn('Google sign-in exception:', err);
        if (googleFallbackNotice) googleFallbackNotice.style.display = 'block';
        showToast('Google Auth note: ' + err.message);
      } finally {
        googleLoginBtn.disabled = false;
        if (googleLoginText) googleLoginText.textContent = 'Sign in with Google';
      }
    });
  }

  if (googleDemoLoginBtn) {
    googleDemoLoginBtn.addEventListener('click', async () => {
      const sim = firebaseSync.simulateGoogleSignIn({
        name: 'Vikram Malhotra',
        email: 'vikram.malhotra@vitbhopal.ac.in',
        college: 'VIT Bhopal University',
        track: 'Autonomous AI & Multi-Agent Systems',
        role: 'Fullstack & AI Engineer'
      });
      await executeGoogleLogin(sim.profile);
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      soundEngine.playClick();
      participantStore.logout();
      if (dashboardModal) dashboardModal.classList.remove('active');
      updateNavbarAuth();
      showToast('Logged out successfully.');
    });
  }

  // Open Dashboard
  if (dashboardNavBtn && dashboardModal) {
    dashboardNavBtn.addEventListener('click', (e) => {
      e.preventDefault();
      soundEngine.playClick();
      openDashboard();
    });

    if (closeDashboardBtn) {
      closeDashboardBtn.addEventListener('click', () => dashboardModal.classList.remove('active'));
    }

    dashboardModal.addEventListener('click', (e) => {
      if (e.target === dashboardModal) dashboardModal.classList.remove('active');
    });
  }

  // Dashboard Tabs Switching
  const tabButtons = document.querySelectorAll('.dashboard-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      soundEngine.playClick();
      const targetTab = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.dashboard-tab-panel').forEach(p => p.classList.remove('active'));
      const activePanel = document.getElementById(`dash-tab-${targetTab}`);
      if (activePanel) activePanel.classList.add('active');

      // If switching to requests tab, refresh requests
      if (targetTab === 'requests') {
        renderIncomingRequests();
      } else if (targetTab === 'team') {
        renderTeamTab();
      } else if (targetTab === 'pass') {
        renderPassTab();
      }
    });
  });

  // (Database Access JSON has been removed from participant dashboard)

  // Team Search for registered participants strictly in database
  const teamSearchInput = document.getElementById('team-search-registered');
  const searchResultsContainer = document.getElementById('registered-search-results');

  if (teamSearchInput && searchResultsContainer) {
    teamSearchInput.addEventListener('input', () => {
      const query = teamSearchInput.value.trim();
      if (query.length < 1) {
        searchResultsContainer.innerHTML = '';
        searchResultsContainer.style.display = 'none';
        return;
      }

      const results = participantStore.searchRegisteredParticipants(query);
      if (results.length === 0) {
        searchResultsContainer.innerHTML = `
          <div style="padding: 1rem; color: var(--text-muted); font-size: 0.85rem; text-align: center;">
            No registered participant found matching "${escapeHtml(query)}". Only participants who have completed BuildIt registration are present in the database.
          </div>
        `;
        searchResultsContainer.style.display = 'block';
        return;
      }

      searchResultsContainer.innerHTML = results.map(p => `
        <div class="search-participant-card">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="participant-avatar">${getInitials(p.name)}</div>
            <div>
              <div style="font-weight: 600; color: #fff; font-size: 0.9rem;">${escapeHtml(p.name)}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(p.email)} • ${escapeHtml(p.college)}</div>
              <div style="font-size: 0.72rem; color: var(--accent-gold);">${escapeHtml(p.track)}</div>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm send-invite-btn" data-id="${p.id}" data-name="${escapeHtml(p.name)}">
            <span>Invite Teammate +</span>
          </button>
        </div>
      `).join('');

      searchResultsContainer.style.display = 'block';

      // Attach invite button listeners
      searchResultsContainer.querySelectorAll('.send-invite-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const recipientId = btn.getAttribute('data-id');
          handleSendInvite(recipientId);
        });
      });
    });
  }

  function handleSendInvite(recipientId) {
    soundEngine.playClick();
    const res = participantStore.sendTeamInvite(recipientId);
    if (!res.success) {
      soundEngine.playError();
      showToast(res.error, 'error');
      return;
    }

    soundEngine.playSuccess();
    // Show feedback alert without any code
    const codeDisplay = document.getElementById('invite-code-display');
    if (codeDisplay) {
      codeDisplay.innerHTML = `
        <div class="code-generated-banner">
          <div style="font-size: 0.85rem; color: #4ade80; font-weight: 600;">
            ✓ Team Invitation Sent to ${escapeHtml(res.recipientName)}!
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.35rem;">
            When ${escapeHtml(res.recipientName)} signs in to their personal account, they can approve or decline this request in their <strong>Requests Tab</strong>.
          </div>
        </div>
      `;
    }

    teamSearchInput.value = '';
    searchResultsContainer.style.display = 'none';
    renderTeamTab();
    showToast(`Invite sent to ${res.recipientName}!`);
  }

  // Render Dashboard
  function openDashboard() {
    const user = participantStore.getCurrentUser();
    if (!user) {
      // If not logged in, prompt login modal
      loginModal.classList.add('active');
      return;
    }

    // Populate Header Info
    const avatarEl = document.getElementById('dash-header-avatar');
    const nameEl = document.getElementById('dash-header-name');
    const emailEl = document.getElementById('dash-header-email');
    const collegeEl = document.getElementById('dash-header-college');
    const ticketIdEl = document.getElementById('dash-header-ticket');

    if (avatarEl) {
      if (user.avatar) {
        avatarEl.innerHTML = `<img src="${user.avatar}" alt="${user.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
      } else {
        avatarEl.textContent = getInitials(user.name);
      }
    }
    if (nameEl) {
      if (user.authProvider === 'google') {
        nameEl.innerHTML = `${user.name} <span class="google-verified-badge"><svg width="12" height="12" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg> Google Account</span>`;
      } else {
        nameEl.textContent = user.name;
      }
    }
    if (emailEl) emailEl.textContent = user.email;
    if (collegeEl) collegeEl.textContent = user.college;
    if (ticketIdEl) ticketIdEl.textContent = user.ticketId;

    // Render active tabs
    renderProfileTab(user);
    renderTeamTab();
    renderIncomingRequests();
    renderPassTab();

    dashboardModal.classList.add('active');
  }

  function renderProfileTab(user) {
    const trackEl = document.getElementById('dash-profile-track');
    const roleEl = document.getElementById('dash-profile-role');
    const modeEl = document.getElementById('dash-profile-mode');
    const collegeEl = document.getElementById('dash-profile-inst');

    if (trackEl) trackEl.textContent = user.track;
    if (roleEl) roleEl.textContent = user.role || 'Fullstack Engineer';
    if (modeEl) modeEl.textContent = user.mode;
    if (collegeEl) collegeEl.textContent = user.college;
  }

  function renderTeamTab() {
    const user = participantStore.getCurrentUser();
    if (!user) return;

    const team = participantStore.getCurrentUserTeam();
    const teamNameEl = document.getElementById('dash-team-name');
    const teamTrackEl = document.getElementById('dash-team-track');
    const teamCountEl = document.getElementById('dash-team-count');
    const teamRosterEl = document.getElementById('dash-team-roster');
    const statusBanner = document.getElementById('dash-team-status-banner');
    const lockContainer = document.getElementById('dash-team-lock-container');
    const addTeammateSection = document.getElementById('dash-add-teammate-section');

    if (team) {
      if (teamNameEl) teamNameEl.textContent = team.name;
      if (teamTrackEl) teamTrackEl.textContent = team.track;
      if (teamCountEl) teamCountEl.textContent = `${team.members.length}/4 Members`;

      // Handle Confirmed vs Unconfirmed Status
      if (team.isConfirmed) {
        if (statusBanner) {
          statusBanner.innerHTML = `
            <div class="team-confirmed-banner">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="badge" style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4);">
                      ✓ TEAM ENTRIES LOCKED & CONFIRMED
                    </span>
                    <span style="font-size: 0.78rem; color: var(--text-muted);">Confirmed on ${team.confirmedAt || 'Nov 2026'}</span>
                  </div>
                  <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.4rem;">
                    Official Team Pass Generated! Pass ID: <strong style="color: var(--accent-gold); font-family: var(--font-mono);">${team.teamPassId}</strong>
                  </div>
                </div>
                <button type="button" class="btn btn-outline-amber btn-sm switch-to-pass-tab" style="padding: 0.45rem 1rem;">
                  <span>🎟️ View Team Holographic Pass →</span>
                </button>
              </div>
            </div>
          `;
          const switchBtn = statusBanner.querySelector('.switch-to-pass-tab');
          if (switchBtn) {
            switchBtn.addEventListener('click', () => {
              const passTabBtn = document.querySelector('.dashboard-tab-btn[data-tab="pass"]');
              if (passTabBtn) passTabBtn.click();
            });
          }
        }
        if (addTeammateSection) addTeammateSection.style.display = 'none';
        if (lockContainer) lockContainer.innerHTML = '';
      } else {
        if (statusBanner) statusBanner.innerHTML = '';
        if (addTeammateSection) addTeammateSection.style.display = 'block';

        if (lockContainer) {
          if (user.id === team.leaderId) {
            lockContainer.innerHTML = `
              <div class="team-lock-card">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                  <div>
                    <h5 style="color: #fff; margin: 0 0 0.25rem; font-size: 1rem;">Lock & Finalize Team Entries</h5>
                    <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0; max-width: 480px;">
                      Review your roster above. When your entries are complete, confirm them to generate the <strong>Official Holographic Team Pass & QR Code</strong> for your whole squad.
                    </p>
                  </div>
                  <button type="button" class="btn btn-primary btn-sm" id="btn-lock-team-entries" style="background: linear-gradient(135deg, #10b981, #059669); border: none; white-space: nowrap; padding: 0.6rem 1.25rem;">
                    <span>🔒 Lock & Confirm Team Entries</span>
                  </button>
                </div>
              </div>
            `;
            const lockBtn = document.getElementById('btn-lock-team-entries');
            if (lockBtn) {
              lockBtn.addEventListener('click', () => {
                if (!confirm(`Are you sure you want to lock and confirm team entries for "${team.name}"?\n\nOnce locked, your team entries will be finalized and the official Holographic Team Pass with your team QR code will be generated for all team members.`)) {
                  return;
                }
                soundEngine.playSuccess();
                const res = participantStore.confirmTeamEntries(team.id);
                if (res.success) {
                  showToast('Team entries locked! Official Holographic Pass generated.');
                  renderTeamTab();
                  renderPassTab();
                  const passTabBtn = document.querySelector('.dashboard-tab-btn[data-tab="pass"]');
                  if (passTabBtn) passTabBtn.click();
                } else {
                  showToast(res.error, 'error');
                }
              });
            }
          } else {
            lockContainer.innerHTML = `
              <div class="team-lock-card" style="border-color: rgba(56, 189, 248, 0.25);">
                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                  ℹ️ <strong>Roster Pending Confirmation:</strong> Your Team Leader must click "Lock & Confirm Team Entries" to finalize your squad and generate your official Team Holographic Pass.
                </div>
              </div>
            `;
          }
        }
      }

      // Render Roster Members
      if (teamRosterEl) {
        const members = team.members.map(id => participantStore.getParticipantById(id)).filter(Boolean);
        teamRosterEl.innerHTML = members.map(m => `
          <div class="team-roster-card">
            <div class="participant-avatar">${getInitials(m.name)}</div>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-weight: 700; color: #fff; font-size: 0.95rem;">${escapeHtml(m.name)}</span>
                ${m.id === team.leaderId ? '<span class="badge badge-amber" style="font-size: 0.65rem; padding: 0.15rem 0.4rem;">👑 TEAM LEADER</span>' : '<span class="badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 0.65rem;">MEMBER</span>'}
                ${m.id === user.id ? '<span style="font-size: 0.7rem; color: #4ade80;">(You)</span>' : ''}
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem;">
                ${escapeHtml(m.email)} • ${escapeHtml(m.college)}
              </div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem;">
                Role: <span style="color: #fff;">${escapeHtml(m.role || 'Hacker')}</span>
              </div>
            </div>
            <div style="text-align: right;">
              <span class="badge" style="background: rgba(34, 197, 94, 0.15); color: #4ade80; font-size: 0.72rem;">CONFIRMED</span>
            </div>
          </div>
        `).join('');
      }
    } else {
      if (teamNameEl) teamNameEl.textContent = 'No Team Joined Yet';
      if (teamTrackEl) teamTrackEl.textContent = user.track;
      if (teamCountEl) teamCountEl.textContent = '1/4 Members';
      if (statusBanner) statusBanner.innerHTML = '';
      if (lockContainer) lockContainer.innerHTML = '';
      if (teamRosterEl) {
        teamRosterEl.innerHTML = `
          <div class="team-roster-card">
            <div class="participant-avatar">${getInitials(user.name)}</div>
            <div style="flex: 1;">
              <span style="font-weight: 700; color: #fff;">${escapeHtml(user.name)}</span>
              <span class="badge badge-amber" style="font-size: 0.65rem; margin-left: 0.5rem;">👑 CREATOR</span>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(user.email)}</div>
            </div>
          </div>
        `;
      }
    }
  }

  function renderPassTab() {
    const user = participantStore.getCurrentUser();
    const container = document.getElementById('dash-team-pass-content');
    if (!user || !container) return;

    const team = participantStore.getCurrentUserTeam();

    if (!team || !team.isConfirmed) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1.5rem; background: rgba(255, 255, 255, 0.02); border: 1px dashed rgba(255, 184, 51, 0.3); border-radius: var(--radius-lg); max-width: 580px; margin: 1.5rem auto;">
          <div style="font-size: 3rem; margin-bottom: 0.75rem;">🔒</div>
          <h3 style="font-family: var(--font-display); font-size: 1.5rem; color: #fff; margin-bottom: 0.5rem;">
            Official Team Pass Not Generated Yet
          </h3>
          <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">
            In BuildIt '26, the official Holographic Entry Pass is generated <strong>once for the entire team</strong> based on your team name, confirmed members, and unified team QR code.
            <br><br>
            ${team && team.leaderId === user.id 
              ? 'As the Team Leader of <strong>' + escapeHtml(team.name) + '</strong>, assemble your squad in the <strong>My Team</strong> tab and click <strong>"Lock & Confirm Team Entries"</strong> to generate the pass.' 
              : 'Please ask your Team Leader to lock and confirm team entries in the <strong>My Team</strong> tab to generate your official pass.'}
          </p>
          ${team && team.leaderId === user.id ? `
            <button type="button" class="btn btn-primary btn-sm switch-to-team-tab" style="padding: 0.6rem 1.25rem;">
              <span>Go to My Team & Confirm Entries →</span>
            </button>
          ` : ''}
        </div>
      `;

      const toTeamBtn = container.querySelector('.switch-to-team-tab');
      if (toTeamBtn) {
        toTeamBtn.addEventListener('click', () => {
          const teamTabBtn = document.querySelector('.dashboard-tab-btn[data-tab="team"]');
          if (teamTabBtn) teamTabBtn.click();
        });
      }
      return;
    }

    // Team IS confirmed: Render Unified Team Holographic Pass!
    const members = team.members.map(id => participantStore.getParticipantById(id)).filter(Boolean);

    container.innerHTML = `
      <div class="team-pass-container">
        <div class="team-holographic-card" id="team-holographic-card">
          <div class="ticket-foil-sheen" id="team-ticket-foil"></div>
          
          <div class="team-pass-header">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <img src="/mfc-logo.png" alt="Mozilla Firefox Club" style="width: 34px; height: 34px; border-radius: 50%; object-fit: contain;">
              <div>
                <div style="font-family: var(--font-display); font-weight: 800; font-size: 1.15rem; color: #fff;">BUILDIT 2026</div>
                <div style="font-size: 0.625rem; color: var(--accent-gold); font-family: var(--font-mono); letter-spacing: 0.08em;">MOZILLA FIREFOX CLUB • VIT BHOPAL</div>
              </div>
            </div>
            <span class="badge" style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4); font-size: 0.72rem;">
              ✓ OFFICIAL TEAM PASS
            </span>
            <div class="ticket-notch-left"></div>
            <div class="ticket-notch-right"></div>
          </div>

          <div class="team-pass-body">
            <div>
              <div class="ticket-meta-label" style="margin-top: 0;">OFFICIAL SQUAD NAME</div>
              <div class="team-pass-title">${escapeHtml(team.name)}</div>
              <div class="team-pass-track">${escapeHtml(team.track)}</div>

              <div class="ticket-meta-label">CONFIRMED TEAM MEMBERS (${team.members.length}/4)</div>
              <div class="team-pass-members-list">
                ${members.map(m => `
                  <div class="team-pass-member-row">
                    <span class="team-pass-member-name">
                      ${escapeHtml(m.name)} 
                      ${m.id === team.leaderId ? '<span class="badge badge-amber" style="font-size: 0.6rem; padding: 0.1rem 0.35rem;">👑 LEADER</span>' : '<span style="color: #38bdf8; font-size: 0.7rem;">(Member)</span>'}
                    </span>
                    <span class="team-pass-member-meta">${escapeHtml(m.role || 'Hacker')}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="team-pass-qr-col" style="text-align: center;">
              <div class="team-pass-qr-box">
                <canvas id="team-qr-canvas" width="100" height="100"></canvas>
              </div>
              <div style="font-family: var(--font-mono); font-size: 0.62rem; color: var(--text-muted); margin-top: 0.35rem; letter-spacing: 0.05em;">
                TEAM SECURITY QR
              </div>
            </div>
          </div>

          <div class="team-pass-footer">
            <div>
              PASS ID: <strong style="color: var(--accent-gold);">${team.teamPassId}</strong>
            </div>
            <div>
              STATUS: <strong style="color: #4ade80;">CONFIRMED ENTRANT</strong>
            </div>
            <div>
              VENUE: VIT BHOPAL, INDIA
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 1.25rem; flex-wrap: wrap; justify-content: center;">
          <button type="button" class="btn btn-outline-amber btn-sm" id="btn-copy-team-pass">
            <span>📋 Copy Team Pass ID</span>
          </button>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-download-team-pass">
            <span>📥 Download Pass (Receipt)</span>
          </button>
        </div>
      </div>
    `;

    // Draw Dynamic Team QR
    drawTeamQR(team.teamPassId + ':' + team.name);

    // Setup 3D Holographic Tilt Reaction
    setupTeamHolographicTilt();

    // Copy Pass ID
    const copyBtn = document.getElementById('btn-copy-team-pass');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        soundEngine.playClick();
        navigator.clipboard.writeText(team.teamPassId).then(() => {
          showToast(`Team Pass ID ${team.teamPassId} copied!`);
        });
      });
    }

    // Download Pass
    const dlBtn = document.getElementById('btn-download-team-pass');
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        soundEngine.playClick();
        alert(`Official Team Pass for ${team.name} verified!\nPass ID: ${team.teamPassId}\nKeep this Pass ID ready for registration check-in at VIT Bhopal.`);
      });
    }
  }

  function drawTeamQR(text) {
    const canvas = document.getElementById('team-qr-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#0a0a0f';
    const grid = 17;
    const cellSize = size / grid;

    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        const isCorner = (r < 5 && c < 5) || (r < 5 && c >= grid - 5) || (r >= grid - 5 && c < 5);
        if (isCorner) {
          if (
            r === 0 || r === 4 || c === 0 || c === 4 ||
            (r >= 0 && r < 5 && (c === grid - 5 || c === grid - 1)) ||
            (r >= grid - 5 && (c === 0 || c === 4 || r === grid - 5 || r === grid - 1)) ||
            (r === 0 && c >= grid - 5) || (r === 4 && c >= grid - 5)
          ) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          } else if (
            (r === 2 && c === 2) ||
            (r === 2 && c === grid - 3) ||
            (r === grid - 3 && c === 2)
          ) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          }
        } else {
          const charCode = text.charCodeAt((r * grid + c) % text.length) || 42;
          if ((charCode * (r + 3) + c * 11) % 3 === 0) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          }
        }
      }
    }
  }

  function setupTeamHolographicTilt() {
    const card = document.getElementById('team-holographic-card');
    const foil = document.getElementById('team-ticket-foil');
    if (!card || !foil) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

      const sheenX = (x / rect.width) * 100;
      const sheenY = (y / rect.height) * 100;
      foil.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255,215,0,0.45) 0%, rgba(255,140,0,0.3) 28%, rgba(56,189,248,0.25) 55%, transparent 75%)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      foil.style.background = '';
    });
  }

  function renderIncomingRequests() {
    const user = participantStore.getCurrentUser();
    const container = document.getElementById('dash-requests-list');
    const badgeEl = document.getElementById('dash-requests-badge');
    const navDot = document.getElementById('nav-requests-dot');

    if (!user || !container) return;

    const requests = participantStore.getIncomingRequests();

    // Update notification badges
    if (requests.length > 0) {
      if (badgeEl) {
        badgeEl.textContent = requests.length;
        badgeEl.style.display = 'inline-flex';
      }
      if (navDot) navDot.style.display = 'inline-block';
    } else {
      if (badgeEl) badgeEl.style.display = 'none';
      if (navDot) navDot.style.display = 'none';
    }

    if (requests.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📬</div>
          <h4 style="color: #fff; font-size: 1.1rem; margin-bottom: 0.4rem;">No Pending Invitations or Requests</h4>
          <p style="font-size: 0.85rem; max-width: 440px; margin: 0 auto;">
            When another hacker sends you a connection request from the Team Finder board or a team leader invites your registered account (<code>${escapeHtml(user.email)}</code>), it will appear here for your review.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = requests.map(req => {
      const isConnection = req.type === 'team_finder_connect';

      if (isConnection) {
        return `
          <div class="incoming-request-card" id="req-card-${req.id}" style="border-left: 3px solid var(--accent-amber); background: linear-gradient(135deg, rgba(255, 140, 0, 0.05) 0%, rgba(18, 19, 29, 0.8) 100%);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                  <span class="badge badge-amber" style="font-size: 0.7rem; letter-spacing: 0.04em;">⚡ TEAM FINDER CONNECTION</span>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">${req.createdAt}</span>
                </div>
                <h4 style="font-family: var(--font-display); font-size: 1.25rem; color: #fff; margin: 0.4rem 0 0.2rem;">
                  ${escapeHtml(req.fromParticipantName)} wants to connect!
                </h4>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                  Sender Role: <strong style="color: #fff;">${escapeHtml(req.fromRole || 'Builder')}</strong> • 
                  <span style="color: var(--accent-gold);">${escapeHtml(req.fromParticipantEmail)}</span> • 
                  <span>${escapeHtml(req.fromCollege || 'VIT Bhopal')}</span>
                </div>
                <div style="margin-top: 0.75rem; padding: 0.75rem 1rem; background: rgba(255, 255, 255, 0.04); border-radius: var(--radius-sm); border: 1px solid rgba(255, 255, 255, 0.06); font-size: 0.85rem; color: #f1f5f9;">
                  <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--accent-gold); font-weight: 700; margin-bottom: 0.25rem;">PITCH / MESSAGE</div>
                  "${escapeHtml(req.pitch || 'Looking forward to building together for BuildIt 2026!')}"
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem; border-top: 1px solid var(--border-glass); padding-top: 1rem;">
              <button class="btn btn-secondary btn-sm decline-req-btn" data-id="${req.id}">
                <span>Dismiss</span>
              </button>
              <button class="btn btn-primary btn-sm approve-req-btn" data-id="${req.id}" style="background: linear-gradient(135deg, #10b981, #059669); border: none;">
                <span>✓ Accept & Connect</span>
              </button>
            </div>
          </div>
        `;
      }

      // Standard Team Invitation
      return `
        <div class="incoming-request-card" id="req-card-${req.id}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="badge badge-amber" style="font-size: 0.7rem;">OFFICIAL TEAM INVITATION</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${req.createdAt}</span>
              </div>
              <h4 style="font-family: var(--font-display); font-size: 1.25rem; color: #fff; margin: 0.4rem 0 0.2rem;">
                Team: ${escapeHtml(req.teamName)}
              </h4>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">
                Invited by Team Leader: <strong style="color: #fff;">${escapeHtml(req.fromParticipantName)}</strong> 
                (<span style="color: var(--accent-gold);">${escapeHtml(req.fromParticipantEmail)}</span>)
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.25rem;">
                Track Arena: <span style="color: #38bdf8;">${escapeHtml(req.track)}</span>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem; border-top: 1px solid var(--border-glass); padding-top: 1rem;">
            <button class="btn btn-secondary btn-sm decline-req-btn" data-id="${req.id}">
              <span>Decline</span>
            </button>
            <button class="btn btn-primary btn-sm approve-req-btn" data-id="${req.id}">
              <span>✓ Approve & Join Team</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Approve / Decline Listeners
    container.querySelectorAll('.approve-req-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.getAttribute('data-id');
        soundEngine.playSuccess();
        const res = participantStore.approveRequest(reqId);
        if (res.success) {
          if (res.isConnection) {
            showToast(`✓ Connection accepted with ${res.senderName}!`);
          } else {
            showToast(`Successfully joined Team ${res.teamName}!`);
          }
          renderIncomingRequests();
          renderTeamTab();
          updateNavbarAuth();
        } else {
          showToast(res.error, 'error');
        }
      });
    });

    container.querySelectorAll('.decline-req-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.getAttribute('data-id');
        soundEngine.playClick();
        participantStore.declineRequest(reqId);
        showToast('Request dismissed.');
        renderIncomingRequests();
      });
    });
  }

  // Update Navbar UI based on active session
  function updateNavbarAuth() {
    const user = participantStore.getCurrentUser();
    const guestNav = document.getElementById('nav-guest-group');
    const authNav = document.getElementById('nav-auth-group');
    const userBadgeName = document.getElementById('nav-user-name');
    const navDot = document.getElementById('nav-requests-dot');

    if (user) {
      if (guestNav) guestNav.style.display = 'none';
      if (authNav) authNav.style.display = 'flex';
      if (userBadgeName) userBadgeName.textContent = user.name.split(' ')[0];

      // Check for pending requests
      const reqs = participantStore.getIncomingRequests();
      if (navDot) navDot.style.display = reqs.length > 0 ? 'inline-block' : 'none';
    } else {
      if (guestNav) guestNav.style.display = 'flex';
      if (authNav) authNav.style.display = 'none';
      if (navDot) navDot.style.display = 'none';
    }
  }

  // Global event listeners for real-time reactivity
  window.addEventListener('buildit_auth_changed', () => {
    updateNavbarAuth();
  });

  window.addEventListener('buildit_team_updated', () => {
    renderTeamTab();
    renderIncomingRequests();
    renderPassTab();
    updateNavbarAuth();
  });

  window.addEventListener('buildit_requests_updated', () => {
    updateNavbarAuth();
    renderIncomingRequests();
  });

  // Initial Navbar check
  updateNavbarAuth();
}

function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `buildit-toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : '⚠️'}</span>
    <span>${escapeHtml(message)}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('visible');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
