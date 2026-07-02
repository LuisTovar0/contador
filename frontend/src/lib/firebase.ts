import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { env } from '$env/dynamic/public';

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
	apiKey: env.PUBLIC_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: env.PUBLIC_FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: env.PUBLIC_FIREBASE_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID
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
