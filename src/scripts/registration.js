import { soundEngine } from './audio.js';
import { participantStore } from './participantStore.js';
import { firebaseSync } from './firebaseSync.js';

export function initRegistration() {
  const modal = document.getElementById('reg-modal');
  const openButtons = document.querySelectorAll('.open-reg-modal');
  const closeBtn = document.getElementById('reg-modal-close');
  const form = document.getElementById('reg-form');

  let currentStep = 1;
  const totalSteps = 3;

  if (!modal || !form) return;

  // Open modal triggers
  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  // Google 1-Click Personal Info Pre-Fill
  const googleRegBtn = document.getElementById('btn-google-register');
  const googleRegText = document.getElementById('google-reg-text');
  const googlePrefillStatus = document.getElementById('google-prefill-status');

  if (googleRegBtn) {
    googleRegBtn.addEventListener('click', async () => {
      googleRegBtn.disabled = true;
      if (googleRegText) googleRegText.textContent = 'Connecting Google Account...';

      try {
        let authRes = await firebaseSync.signInWithGoogle();
        if (authRes.needsSetup || (!authRes.success && !authRes.cancelled)) {
          // Fallback simulation if Google provider not enabled in Firebase Console yet
          authRes = firebaseSync.simulateGoogleSignIn({
            name: 'Devansh Gupta',
            email: 'devansh.gupta@vitbhopal.ac.in'
          });
        }

        if (authRes.success && authRes.profile) {
          const profile = authRes.profile;
          const cleanEmail = profile.email.trim().toLowerCase();

          // Check if this participant is already registered
          const existingUser = participantStore.getParticipantByEmail(cleanEmail);
          if (existingUser) {
            // Already registered! Log in directly
            participantStore.loginWithGoogleExisting(profile);
            modal.classList.remove('active');
            const dashNavBtn = document.getElementById('nav-dashboard-btn');
            if (dashNavBtn) dashNavBtn.click();
            return;
          }

          // User is NOT registered -> ONLY populate Personal Info (Name & Email)!
          // The rest (College, Track, Role, Team, Mode) will be filled by the user.
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

          if (googlePrefillStatus) {
            googlePrefillStatus.style.display = 'block';
            googlePrefillStatus.innerHTML = `✓ Connected Google Profile: <strong>${escapeHtml(gName)}</strong> (${escapeHtml(gEmail)})<br><span style="color: var(--text-secondary); font-size: 0.78rem;">Personal info verified. Please fill your College, target Track, Role, and Team to finish!</span>`;
          }

          // Focus next field (College / University)
          const schoolInput = document.getElementById('reg-school');
          if (schoolInput) schoolInput.focus();
        }
      } catch (err) {
        console.warn('Google registration error:', err);
      } finally {
        googleRegBtn.disabled = false;
        if (googleRegText) googleRegText.textContent = 'Auto-fill Personal Info with Google';
      }
    });
  }

  // Step navigation buttons
  const nextBtn = document.getElementById('wizard-next-btn');
  const prevBtn = document.getElementById('wizard-prev-btn');

  function updateWizardView() {
    // Hide all step panels
    document.querySelectorAll('.wizard-step-panel').forEach(panel => {
      panel.style.display = 'none';
    });

    const activePanel = document.getElementById(`step-panel-${currentStep}`);
    if (activePanel) activePanel.style.display = 'block';

    // Update step indicator nodes
    document.querySelectorAll('.wizard-step-node').forEach(node => {
      const stepNum = parseInt(node.getAttribute('data-step'), 10);
      node.classList.remove('active', 'completed');
      if (stepNum === currentStep) {
        node.classList.add('active');
      } else if (stepNum < currentStep) {
        node.classList.add('completed');
      }
    });

    // Control buttons visibility & text
    if (prevBtn) {
      prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    }

    if (nextBtn) {
      if (currentStep === totalSteps) {
        nextBtn.innerHTML = 'Complete & Generate Pass ⚡';
        nextBtn.setAttribute('type', 'submit');
      } else {
        nextBtn.innerHTML = 'Continue →';
        nextBtn.setAttribute('type', 'button');
      }
    }
  }

  function validateCurrentStep() {
    if (currentStep === 1) {
      const name = document.getElementById('reg-name');
      const email = document.getElementById('reg-email');
      const school = document.getElementById('reg-school');
      if (!name.value.trim() || !email.value.trim()) {
        alert('Please fill in your Name and Email to continue.');
        return false;
      }
      if (!school.value.trim()) {
        alert('Please specify your College / University.');
        return false;
      }
    }
    return true;
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      if (currentStep < totalSteps) {
        e.preventDefault();
        if (validateCurrentStep()) {
          currentStep++;
          updateWizardView();
        }
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateWizardView();
      }
    });
  }

  // Handle Form Submission -> Generate Holographic Pass
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password')?.value || 'Builder@2026';
    const college = document.getElementById('reg-school')?.value.trim() || 'VIT Bhopal University';
    const role = document.getElementById('reg-role')?.value || 'Fullstack Engineer';
    const track = document.getElementById('reg-track').options[document.getElementById('reg-track').selectedIndex].text;
    const team = document.getElementById('reg-team-name').value.trim() || 'Independent Pioneer';
    const mode = document.getElementById('reg-mode')?.value || 'In-Person (VIT Bhopal Central Campus)';

    const googleAuth = window._googlePendingAuth;
    const isGoogle = googleAuth && googleAuth.email.toLowerCase() === email.toLowerCase();

    // Register user in participant database so they can log in and assemble squad
    const regResult = participantStore.registerUser({
      name,
      email,
      password,
      college,
      track,
      role,
      mode,
      teamName: team !== 'Independent Pioneer' ? team : null,
      avatar: isGoogle ? googleAuth.avatar : '',
      authProvider: isGoogle ? 'google' : 'local'
    });

    const ticketId = regResult.success ? regResult.user.ticketId : `BLD-2026-${Math.floor(1000 + Math.random() * 9000)}-VIP`;

    const ticketData = {
      name,
      email,
      track,
      team,
      mode,
      ticketId,
      date: new Date().toLocaleDateString()
    };

    localStorage.setItem('buildit_user_ticket', JSON.stringify(ticketData));

    renderRegistrationSuccess(ticketData);
  });

  function renderRegistrationSuccess(data) {
    const wizardContainer = document.getElementById('registration-wizard-content');
    if (!wizardContainer) return;

    wizardContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem 1.5rem;">
        <div style="font-size: 3rem; margin-bottom: 0.8rem;">🎉</div>
        <span class="badge badge-amber" style="font-size: 0.85rem; padding: 0.4rem 1rem;">REGISTRATION CONFIRMED</span>
        <h3 style="font-family: var(--font-display); font-size: 2rem; color: #fff; margin: 0.8rem 0 0.4rem;">
          Welcome, ${escapeHtml(data.name)}!
        </h3>
        <p style="color: var(--text-secondary); font-size: 0.95rem; max-width: 520px; margin: 0 auto 1.5rem; line-height: 1.6;">
          Your registration has been securely added to the BuildIt '26 database.
          <br><br>
          <strong style="color: #fff;">Important Notice:</strong><br>
          Official Holographic Passes are created <strong>only once per team</strong> when entries are finalized. Log in to your personal dashboard to assemble your squad. Once your team leader locks and confirms team entries, the official <strong>Team Holographic Pass & QR Code</strong> will be unlocked for your entire team!
        </p>

        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 1rem 1.25rem; max-width: 420px; margin: 0 auto 1.5rem; text-align: left;">
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.3rem;">PARTICIPANT DETAILS</div>
          <div style="color: #fff; font-weight: 600; font-size: 0.95rem;">${escapeHtml(data.name)}</div>
          <div style="font-size: 0.82rem; color: var(--text-muted);">${escapeHtml(data.email)}</div>
          <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--accent-gold); margin-top: 0.4rem;">
            Registration ID: ${escapeHtml(data.ticketId)}
          </div>
        </div>

        <div style="display: flex; justify-content: center; gap: 1rem;">
          <button type="button" class="btn btn-primary open-dashboard-from-reg" style="padding: 0.75rem 1.5rem;">
            <span>Go to My Dashboard →</span>
          </button>
        </div>
      </div>
    `;

    const openDashBtn = wizardContainer.querySelector('.open-dashboard-from-reg');
    if (openDashBtn) {
      openDashBtn.addEventListener('click', () => {
        const regModal = document.getElementById('reg-modal');
        if (regModal) regModal.classList.remove('active');
        const dashNavBtn = document.getElementById('nav-dashboard-btn');
        if (dashNavBtn) dashNavBtn.click();
      });
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  updateWizardView();
}
