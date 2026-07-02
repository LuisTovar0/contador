import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let localConfig = null;
if (typeof window !== 'undefined') {
	try {
		const stored = localStorage.getItem('contador_firebase_config');
		if (stored) {
			localConfig = JSON.parse(stored);
		}
	} catch (e) {
		console.error('Failed to parse local firebase config', e);
	}
}

const firebaseConfig = localConfig || {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = !!(
	firebaseConfig &&
	firebaseConfig.apiKey &&
	firebaseConfig.projectId &&
	firebaseConfig.appId
);

let app;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (isFirebaseConfigured) {
	try {
		app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
		auth = getAuth(app);
		db = getFirestore(app);
	} catch (error) {
		console.error('Firebase initialization failed:', error);
	}
}

export { auth, db, isFirebaseConfigured };
