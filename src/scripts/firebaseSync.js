// ==========================================
// GOOGLE FIREBASE REAL-TIME DATA LAYER
// Automatically stores user accounts, teams, invites & holographic passes in Firebase Firestore
// Project: hackathon-project-6070d
// ==========================================

import { initFirebase, getDb, getFirestoreModule, isFirebaseConnected, DEFAULT_FIREBASE_CONFIG, getFirebaseAuth } from './firebaseConfig.js';

function timeoutPromise(promise, ms = 4500, errorMsg = 'Firestore connection timed out.') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
  ]);
}

// Convert standard JavaScript object to Firestore REST API fields structure (for REST fallback)
function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string') {
      fields[k] = { stringValue: v };
    } else if (typeof v === 'number') {
      fields[k] = { doubleValue: v };
    } else if (typeof v === 'boolean') {
      fields[k] = { booleanValue: v };
    } else if (Array.isArray(v)) {
      fields[k] = {
        arrayValue: {
          values: v.map(item => {
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'number') return { doubleValue: item };
            if (typeof item === 'boolean') return { booleanValue: item };
            return { stringValue: JSON.stringify(item) };
          })
        }
      };
    } else if (typeof v === 'object') {
      fields[k] = { stringValue: JSON.stringify(v) };
    }
  }
  return fields;
}

export const firebaseSync = {
  lastSyncStatus: null,
  isListening: false,

  getLastSyncInfo() {
    try {
      const raw = localStorage.getItem('buildit_firebase_last_sync');
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  },

  setLastSyncInfo(info) {
    this.lastSyncStatus = info;
    try {
      localStorage.setItem('buildit_firebase_last_sync', JSON.stringify(info));
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('buildit_firebase_sync_changed', { detail: info }));
  },

  async ensureConnected() {
    if (!isFirebaseConnected()) {
      try {
        const initRes = await timeoutPromise(initFirebase(), 4000, 'Firebase initialization timed out');
        if (!initRes.connected) {
          return { connected: false, error: initRes.reason };
        }
      } catch (err) {
        return { connected: false, error: err.message };
      }
    }
    return { connected: true };
  },

  /**
   * Authenticate user via official Google Sign-In popup with Firebase Auth
   */
  async signInWithGoogle() {
    try {
      const { auth, authModule } = await getFirebaseAuth();
      const provider = new authModule.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      console.log('[Firebase Auth] Triggering Google Sign-In popup...');
      const userCredential = await timeoutPromise(
        authModule.signInWithPopup(auth, provider),
        45000,
        'Google sign-in popup timed out.'
      );

      const gUser = userCredential.user;
      console.log('[Firebase Auth] ✓ Google sign-in successful for:', gUser.email);

      const profile = {
        uid: gUser.uid,
        displayName: gUser.displayName || 'Google Pioneer',
        email: gUser.email,
        photoURL: gUser.photoURL || '',
        authProvider: 'google'
      };

      return { success: true, profile };
    } catch (err) {
      console.warn('[Firebase Google Auth Warning]:', err.code, err.message);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return { success: false, cancelled: true, error: 'Sign-in window was closed by user.' };
      }

      const needsSetup = err.code === 'auth/configuration-not-found' || 
                         err.code === 'auth/operation-not-allowed' || 
                         err.code === 'auth/unauthorized-domain';

      return { 
        success: false, 
        code: err.code || 'unknown',
        error: err.message,
        needsSetup 
      };
    }
  },

  /**
   * One-click Google Sign-In testing fallback (used when Google provider is not yet activated in Firebase console)
   */
  simulateGoogleSignIn(customDetails = {}) {
    const defaultEmail = customDetails.email || `pioneer.${Math.floor(100 + Math.random() * 900)}@vitbhopal.ac.in`;
    const defaultName = customDetails.name || 'Vikram Malhotra';
    const profile = {
      uid: 'google-sim-' + Date.now(),
      displayName: defaultName,
      email: defaultEmail,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      college: customDetails.college || 'VIT Bhopal University',
      track: customDetails.track || 'Autonomous AI & Multi-Agent Systems',
      role: customDetails.role || 'Fullstack & AI Engineer',
      authProvider: 'google'
    };
    return { success: true, profile };
  },

  /**
   * Save / sync a single participant account to Firebase Firestore
   * Called immediately whenever any user creates an account or updates profile
   */
  async syncParticipant(participant) {
    if (!participant || !participant.id) return { success: false, error: 'Invalid participant data' };

    console.log(`[Firebase Sync] Storing user account in Firestore: ${participant.name} (${participant.email})`);

    const dataToSave = {
      ...participant,
      updatedAt: new Date().toISOString()
    };

    // 1. Try Firebase SDK if available
    try {
      const conn = await this.ensureConnected();
      if (conn.connected) {
        const db = getDb();
        const { doc, setDoc } = getFirestoreModule();
        await timeoutPromise(setDoc(doc(db, 'participants', participant.id), dataToSave, { merge: true }), 4000);
        console.log(`[Firebase Sync] ✓ Successfully stored user ${participant.name} in Firestore`);
        return { success: true };
      }
    } catch (sdkErr) {
      console.warn('[Firebase Sync SDK Notice]:', sdkErr.message);
    }

    // 2. Try Firestore REST API directly as fast fallback
    try {
      const projectId = DEFAULT_FIREBASE_CONFIG.projectId;
      const apiKey = DEFAULT_FIREBASE_CONFIG.apiKey;
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/participants/${participant.id}?key=${apiKey}`;
      
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: toFirestoreFields(dataToSave) })
      });

      if (res.ok) {
        console.log(`[Firebase Sync REST] ✓ Successfully stored user ${participant.name} in Firestore REST`);
        return { success: true };
      }
    } catch (restErr) {
      console.warn('[Firebase Sync REST Notice]:', restErr.message);
    }

    return { success: false, notice: 'Stored locally. Firestore cloud sync will retry when online.' };
  },

  /**
   * Save / sync a team (squad, members list, confirmed holographic pass & QR) to Firebase Firestore
   * Called whenever a team is created, invite approved, or entries locked
   */
  async syncTeam(team) {
    if (!team || !team.id) return { success: false, error: 'Invalid team data' };

    console.log(`[Firebase Sync] Storing team info in Firestore: ${team.name} (Members: ${team.members?.length || 1})`);

    const dataToSave = {
      ...team,
      updatedAt: new Date().toISOString()
    };

    // 1. Try Firebase SDK
    try {
      const conn = await this.ensureConnected();
      if (conn.connected) {
        const db = getDb();
        const { doc, setDoc } = getFirestoreModule();
        await timeoutPromise(setDoc(doc(db, 'teams', team.id), dataToSave, { merge: true }), 4000);
        console.log(`[Firebase Sync] ✓ Successfully stored team ${team.name} in Firestore`);
        return { success: true };
      }
    } catch (sdkErr) {
      console.warn('[Firebase Sync SDK Notice]:', sdkErr.message);
    }

    // 2. Try Firestore REST API
    try {
      const projectId = DEFAULT_FIREBASE_CONFIG.projectId;
      const apiKey = DEFAULT_FIREBASE_CONFIG.apiKey;
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/teams/${team.id}?key=${apiKey}`;

      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: toFirestoreFields(dataToSave) })
      });

      if (res.ok) {
        console.log(`[Firebase Sync REST] ✓ Successfully stored team ${team.name} in Firestore REST`);
        return { success: true };
      }
    } catch (restErr) {
      console.warn('[Firebase Sync REST Notice]:', restErr.message);
    }

    return { success: false, notice: 'Stored locally. Cloud sync pending.' };
  },

  /**
   * Save / sync an invite request to Firebase Firestore
   */
  async syncRequest(request) {
    if (!request || !request.id) return { success: false, error: 'Invalid request data' };

    console.log(`[Firebase Sync] Storing invite request in Firestore: ${request.id} (${request.status})`);

    const dataToSave = {
      ...request,
      updatedAt: new Date().toISOString()
    };

    try {
      const conn = await this.ensureConnected();
      if (conn.connected) {
        const db = getDb();
        const { doc, setDoc } = getFirestoreModule();
        await timeoutPromise(setDoc(doc(db, 'requests', request.id), dataToSave, { merge: true }), 4000);
        return { success: true };
      }
    } catch (sdkErr) {
      console.warn('[Firebase Sync SDK Notice]:', sdkErr.message);
    }

    try {
      const projectId = DEFAULT_FIREBASE_CONFIG.projectId;
      const apiKey = DEFAULT_FIREBASE_CONFIG.apiKey;
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/requests/${request.id}?key=${apiKey}`;

      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: toFirestoreFields(dataToSave) })
      });

      if (res.ok) return { success: true };
    } catch (restErr) {
      console.warn('[Firebase Sync REST Notice]:', restErr.message);
    }

    return { success: false };
  },

  /**
   * Complete batch synchronization of the entire dataset to Google Firebase Firestore
   */
  async syncAllToFirestore(dataset) {
    const conn = await this.ensureConnected();
    if (!conn.connected) {
      const info = {
        success: false,
        timestamp: new Date().toISOString(),
        error: conn.error,
        count: 0
      };
      this.setLastSyncInfo(info);
      return info;
    }

    try {
      const db = getDb();
      const { doc, setDoc } = getFirestoreModule();

      let syncedCount = 0;

      // 1. Sync System Metadata
      if (dataset.metadata) {
        await timeoutPromise(setDoc(doc(db, 'system', 'metadata'), {
          ...dataset.metadata,
          lastUpdated: new Date().toISOString()
        }, { merge: true }), 3000);
        syncedCount++;
      }

      // 2. Sync Participants
      for (const p of dataset.participants || []) {
        await timeoutPromise(setDoc(doc(db, 'participants', p.id), {
          ...p,
          syncedAt: new Date().toISOString()
        }, { merge: true }), 3000);
        syncedCount++;
      }

      // 3. Sync Teams
      for (const t of dataset.teams || []) {
        await timeoutPromise(setDoc(doc(db, 'teams', t.id), {
          ...t,
          syncedAt: new Date().toISOString()
        }, { merge: true }), 3000);
        syncedCount++;
      }

      // 4. Sync Requests
      for (const r of dataset.requests || []) {
        await timeoutPromise(setDoc(doc(db, 'requests', r.id), {
          ...r,
          syncedAt: new Date().toISOString()
        }, { merge: true }), 3000);
        syncedCount++;
      }

      const info = {
        success: true,
        timestamp: new Date().toISOString(),
        count: syncedCount,
        projectId: DEFAULT_FIREBASE_CONFIG.projectId
      };
      this.setLastSyncInfo(info);
      return info;
    } catch (err) {
      console.warn('Firestore sync note / error:', err.message);
      const info = {
        success: false,
        timestamp: new Date().toISOString(),
        error: err.message.includes('not found') 
          ? 'Firestore Database has not been created yet in your Firebase Console. Go to Build -> Firestore Database and click Create Database.'
          : err.message,
        code: err.code || 'sync_failed'
      };
      this.setLastSyncInfo(info);
      return info;
    }
  }
};
