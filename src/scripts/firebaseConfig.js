// ==========================================
// GOOGLE FIREBASE CONFIGURATION & INITIALIZATION
// Lightweight, official Google CDN ESM module
// Configured with User Project: hackathon-project-6070d
// ==========================================

let firebaseApp = null;
let firestoreDb = null;
let firestoreModule = null;
let firebaseAnalytics = null;

// User's provided Firebase configuration credentials
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAnoDdGB_4JHBhKtDiFwUFSaLSBi9351zs",
  authDomain: "hackathon-project-6070d.firebaseapp.com",
  projectId: "hackathon-project-6070d",
  storageBucket: "hackathon-project-6070d.firebasestorage.app",
  messagingSenderId: "553884177744",
  appId: "1:553884177744:web:87d17ffb2a47ae526c0855",
  measurementId: "G-4LWVJCJGPY"
};

// Default / Environment Configuration with fallback to user credentials
const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId
};

// Check for user-provided configuration in localStorage
export function getSavedConfig() {
  try {
    const raw = localStorage.getItem('buildit_firebase_config');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading saved Firebase config:', e);
  }
  return null;
}

export function getActiveFirebaseConfig() {
  const saved = getSavedConfig();
  if (saved && saved.apiKey && saved.projectId) {
    return saved;
  }
  return envConfig;
}

export function saveFirebaseConfig(config) {
  if (!config || !config.apiKey || !config.projectId) {
    return { success: false, error: 'Configuration must include apiKey and projectId.' };
  }
  localStorage.setItem('buildit_firebase_config', JSON.stringify(config));
  return { success: true };
}

export function clearFirebaseConfig() {
  localStorage.removeItem('buildit_firebase_config');
  firebaseApp = null;
  firestoreDb = null;
  firebaseAnalytics = null;
}

export async function initFirebase() {
  const config = getActiveFirebaseConfig();
  if (!config) {
    return { connected: false, reason: 'No Firebase configuration found.' };
  }

  try {
    const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
    firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

    firebaseApp = getApps().length === 0 ? initializeApp(config) : getApp();
    firestoreDb = firestoreModule.getFirestore(firebaseApp);

    // Try initializing analytics if available in browser
    try {
      const analyticsModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js');
      if (typeof window !== 'undefined' && analyticsModule.isSupported) {
        const supported = await analyticsModule.isSupported();
        if (supported) {
          firebaseAnalytics = analyticsModule.getAnalytics(firebaseApp);
        }
      }
    } catch (anErr) {
      console.log('Firebase Analytics optional init notice:', anErr.message);
    }

    return { 
      connected: true, 
      app: firebaseApp, 
      db: firestoreDb, 
      analytics: firebaseAnalytics,
      projectId: config.projectId,
      firestoreModule 
    };
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return { connected: false, reason: err.message };
  }
}

export function isFirebaseConnected() {
  return Boolean(firestoreDb);
}

export function getDb() {
  return firestoreDb;
}

export function getFirestoreModule() {
  return firestoreModule;
}

export function getAppInstance() {
  return firebaseApp;
}

export function getAnalyticsInstance() {
  return firebaseAnalytics;
}

let firebaseAuth = null;
let authModule = null;

export async function getFirebaseAuth() {
  if (firebaseAuth && authModule) {
    return { auth: firebaseAuth, authModule };
  }

  const res = await initFirebase();
  if (!res || !res.app) {
    throw new Error(res?.reason || 'Firebase initialization failed');
  }

  authModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
  firebaseAuth = authModule.getAuth(res.app);
  return { auth: firebaseAuth, authModule };
}

export function getAuthInstance() {
  return firebaseAuth;
}
