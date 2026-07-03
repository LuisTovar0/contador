import { auth, db, isFirebaseConfigured } from './firebase';
import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signInAnonymously,
	signOut,
	onAuthStateChanged,
	type User as FirebaseUser
} from 'firebase/auth';
import {
	collection,
	doc,
	setDoc,
	addDoc,
	deleteDoc,
	onSnapshot,
	query,
	orderBy,
	limit,
	updateDoc,
	writeBatch
} from 'firebase/firestore';

export interface Counter {
	id: string;
	name: string;
	value: number;
	decimals: number;
	unit: string;
	increments: number[]; // size 1 to 3
	createdAt: number;
	updatedAt: number;
}

export interface HistoryEntry {
	id: string;
	counterId: string;
	counterName: string;
	timestamp: number;
	type: 'create' | 'increment' | 'decrement' | 'set' | 'delete';
	prevValue: number | null;
	newValue: number;
	delta: number | null;
	description: string;
	method?: string;
}

export interface UserSession {
	uid: string;
	username: string | null;
	isAnonymous: boolean;
}

interface UndoAction {
	type: 'update_value';
	counterId: string;
	prevValue: number;
	newValue: number;
	description: string;
}

// Global Auth State Manager using Svelte 5 Runes
class AuthStore {
	user = $state<UserSession | null>(null);
	loading = $state(true);
	error = $state<string | null>(null);

	constructor() {
		if (typeof window !== 'undefined') {
			if (isFirebaseConfigured && auth) {
				onAuthStateChanged(auth, (firebaseUser) => {
					if (firebaseUser) {
						this.user = {
							uid: firebaseUser.uid,
							username: firebaseUser.email ? firebaseUser.email.split('@')[0] : null,
							isAnonymous: firebaseUser.isAnonymous
						};
					} else {
						// Fallback to local session if one exists (e.g. for local demo mode)
						const stored = localStorage.getItem('contador_user');
						if (stored) {
							try {
								const parsed = JSON.parse(stored);
								if (parsed && (parsed.isAnonymous || parsed.uid?.startsWith('local-'))) {
									this.user = parsed;
									this.loading = false;
									return;
								}
							} catch (e) {
								console.error('Failed to parse local session:', e);
							}
						}
						this.user = null;
					}
					this.loading = false;
				});
			} else {
				// Local Storage fallback mode
				this.loadLocalSession();
			}
		} else {
			this.loading = false;
		}
	}

	private loadLocalSession() {
		try {
			const stored = localStorage.getItem('contador_user');
			if (stored) {
				this.user = JSON.parse(stored);
			} else {
				this.user = null;
			}
		} catch (e) {
			console.error('Failed to load local session:', e);
		} finally {
			this.loading = false;
		}
	}

	private saveLocalSession(session: UserSession | null) {
		this.user = session;
		if (session) {
			localStorage.setItem('contador_user', JSON.stringify(session));
		} else {
			localStorage.removeItem('contador_user');
		}
	}

	async login(username: string, password: string) {
		this.error = null;
		this.loading = true;
		try {
			if (isFirebaseConfigured && auth) {
				const email = `${username}@contador.local`;
				await signInWithEmailAndPassword(auth, email, password);
			} else {
				// Local storage mock login
				const localUsers = JSON.parse(localStorage.getItem('contador_mock_users') || '{}');
				if (localUsers[username] && localUsers[username] === password) {
					this.saveLocalSession({
						uid: `local-${btoa(username)}`,
						username: username,
						isAnonymous: false
					});
				} else {
					throw new Error('Invalid username or password in local session.');
				}
			}
		} catch (err: any) {
			this.error = err.message || 'Login failed.';
			throw err;
		} finally {
			this.loading = false;
		}
	}

	async register(username: string, password: string) {
		this.error = null;
		this.loading = true;
		try {
			if (isFirebaseConfigured && auth) {
				const email = `${username}@contador.local`;
				await createUserWithEmailAndPassword(auth, email, password);
			} else {
				// Local storage mock signup
				const localUsers = JSON.parse(localStorage.getItem('contador_mock_users') || '{}');
				if (localUsers[username]) {
					throw new Error('User already exists in local session.');
				}
				localUsers[username] = password;
				localStorage.setItem('contador_mock_users', JSON.stringify(localUsers));
				this.saveLocalSession({
					uid: `local-${btoa(username)}`,
					username: username,
					isAnonymous: false
				});
			}
		} catch (err: any) {
			this.error = err.message || 'Registration failed.';
			throw err;
		} finally {
			this.loading = false;
		}
	}

	async loginAnonymously() {
		this.error = null;
		this.loading = true;
		try {
			this.saveLocalSession({
				uid: `local-anon-${Math.random().toString(36).substring(2, 11)}`,
				username: null,
				isAnonymous: true
			});
		} catch (err: any) {
			this.error = err.message || 'Anonymous login failed.';
			throw err;
		} finally {
			this.loading = false;
		}
	}

	async logout() {
		this.error = null;
		this.loading = true;
		try {
			if (isFirebaseConfigured && auth) {
				await signOut(auth);
			}
			const currentUser = this.user;
			if (currentUser && currentUser.isAnonymous) {
				if (typeof window !== 'undefined') {
					localStorage.removeItem(`contador_counters_${currentUser.uid}`);
					localStorage.removeItem(`contador_history_${currentUser.uid}`);
				}
			}
			this.saveLocalSession(null);
		} catch (err: any) {
			this.error = err.message || 'Logout failed.';
			throw err;
		} finally {
			this.loading = false;
		}
	}
}

export const authStore = new AuthStore();

// Global Counters Store Manager using Svelte 5 Runes
class CounterStore {
	counters = $state<Counter[]>([]);
	history = $state<HistoryEntry[]>([]);
	loading = $state(true);

	private unsubscribeCounters: (() => void) | null = null;
	private unsubscribeHistory: (() => void) | null = null;

	// Undo/Redo stacks (local runtime-only stacks that reset on page reload, standard for UX undo/redo)
	private undoStack = $state<UndoAction[]>([]);
	private redoStack = $state<UndoAction[]>([]);

	canUndo = $derived(this.undoStack.length > 0);
	canRedo = $derived(this.redoStack.length > 0);

	constructor() {
		if (typeof window !== 'undefined') {
			// Watch auth changes to fetch counters & history
			$effect.root(() => {
				$effect(() => {
					const currentUser = authStore.user;
					this.cleanup();

					if (currentUser) {
						this.loading = true;
						const useFirebase = !!(isFirebaseConfigured && db && !currentUser.isAnonymous && !currentUser.uid.startsWith('local-'));
						if (useFirebase) {
							// Setup Firebase listeners
							const countersRef = collection(db!, 'users', currentUser.uid, 'counters');
							const qCounters = query(countersRef, orderBy('createdAt', 'desc'));
							this.unsubscribeCounters = onSnapshot(qCounters, (snapshot) => {
								this.counters = snapshot.docs.map((doc) => ({
									id: doc.id,
									...doc.data()
								})) as Counter[];
								this.loading = false;
							});

							const historyRef = collection(db!, 'users', currentUser.uid, 'history');
							const qHistory = query(historyRef, orderBy('timestamp', 'desc'), limit(50));
							this.unsubscribeHistory = onSnapshot(qHistory, (snapshot) => {
								this.history = snapshot.docs.map((doc) => ({
									id: doc.id,
									...doc.data()
								})) as HistoryEntry[];
							});
						} else {
							// Local storage synchronization
							this.loadLocalData(currentUser.uid);
							this.loading = false;
						}
					} else {
						this.counters = [];
						this.history = [];
						this.undoStack = [];
						this.redoStack = [];
						this.loading = false;
					}
				});
			});
		} else {
			this.loading = false;
		}
	}

	private cleanup() {
		if (this.unsubscribeCounters) {
			this.unsubscribeCounters();
			this.unsubscribeCounters = null;
		}
		if (this.unsubscribeHistory) {
			this.unsubscribeHistory();
			this.unsubscribeHistory = null;
		}
		this.undoStack = [];
		this.redoStack = [];
	}

	private loadLocalData(uid: string) {
		try {
			const storedCounters = localStorage.getItem(`contador_counters_${uid}`);
			this.counters = storedCounters ? JSON.parse(storedCounters) : [];

			const storedHistory = localStorage.getItem(`contador_history_${uid}`);
			this.history = storedHistory ? JSON.parse(storedHistory) : [];
		} catch (e) {
			console.error('Failed to load local data:', e);
		}
	}

	private saveLocalData() {
		const currentUser = authStore.user;
		if (!currentUser) return;

		try {
			localStorage.setItem(`contador_counters_${currentUser.uid}`, JSON.stringify(this.counters));
			localStorage.setItem(`contador_history_${currentUser.uid}`, JSON.stringify(this.history));
		} catch (e) {
			console.error('Failed to save local data:', e);
		}
	}

	async createCounter(name: string, decimals: number, unit: string, increments: number[]) {
		const currentUser = authStore.user;
		if (!currentUser) throw new Error('Not authenticated.');

		// Validation
		if (increments.length < 1 || increments.length > 3) {
			throw new Error('Default increments must be between 1 and 3 items.');
		}

		const now = Date.now();
		const counterId = Math.random().toString(36).substring(2, 15);
		const newCounter: Counter = {
			id: counterId,
			name,
			value: 0,
			decimals,
			unit: unit.trim(),
			increments,
			createdAt: now,
			updatedAt: now
		};

		const historyId = Math.random().toString(36).substring(2, 15);
		const newHistory: HistoryEntry = {
			id: historyId,
			counterId,
			counterName: name,
			timestamp: now,
			type: 'create',
			prevValue: null,
			newValue: 0,
			delta: null,
			description: `Created counter "${name}" with unit "${unit}"`,
			method: 'Creation'
		};

		const useFirebase = !!(isFirebaseConfigured && db && !currentUser.isAnonymous && !currentUser.uid.startsWith('local-'));
		if (useFirebase) {
			const batch = writeBatch(db!);
			const counterDocRef = doc(db!, 'users', currentUser.uid, 'counters', counterId);
			const historyDocRef = doc(db!, 'users', currentUser.uid, 'history', historyId);

			batch.set(counterDocRef, newCounter);
			batch.set(historyDocRef, newHistory);
			await batch.commit();
		} else {
			this.counters = [newCounter, ...this.counters];
			this.history = [newHistory, ...this.history];
			this.saveLocalData();
		}

		// Clear redo stack on new actions
		this.redoStack = [];
	}

	async updateCounterValue(counterId: string, newValue: number, description: string, isUndoRedo = false, method?: string) {
		const currentUser = authStore.user;
		if (!currentUser) throw new Error('Not authenticated.');

		const counter = this.counters.find((c) => c.id === counterId);
		if (!counter) throw new Error('Counter not found.');

		const prevValue = counter.value;
		const delta = parseFloat((newValue - prevValue).toFixed(counter.decimals));
		if (delta === 0) return; // No change

		const now = Date.now();
		const updatedCounter = {
			...counter,
			value: parseFloat(newValue.toFixed(counter.decimals)),
			updatedAt: now
		};

		const historyId = Math.random().toString(36).substring(2, 15);
		const historyType = delta > 0 ? 'increment' : delta < 0 ? 'decrement' : 'set';
		const newHistory: HistoryEntry = {
			id: historyId,
			counterId,
			counterName: counter.name,
			timestamp: now,
			type: description.toLowerCase().includes('set') ? 'set' : (historyType as any),
			prevValue,
			newValue: updatedCounter.value,
			delta,
			description,
			method: method || (description.toLowerCase().includes('set') ? 'Direct Set' : (delta > 0 ? 'Increment' : 'Decrement'))
		};

		const useFirebase = !!(isFirebaseConfigured && db && !currentUser.isAnonymous && !currentUser.uid.startsWith('local-'));
		if (useFirebase) {
			const batch = writeBatch(db!);
			const counterDocRef = doc(db!, 'users', currentUser.uid, 'counters', counterId);
			const historyDocRef = doc(db!, 'users', currentUser.uid, 'history', historyId);

			batch.update(counterDocRef, { value: updatedCounter.value, updatedAt: now });
			batch.set(historyDocRef, newHistory);
			await batch.commit();
		} else {
			this.counters = this.counters.map((c) => (c.id === counterId ? updatedCounter : c));
			this.history = [newHistory, ...this.history];
			this.saveLocalData();
		}

		if (!isUndoRedo) {
			// Record for undo
			this.undoStack.push({
				type: 'update_value',
				counterId,
				prevValue,
				newValue: updatedCounter.value,
				description
			});
			// Clear redo stack for this counter on normal action
			this.redoStack = this.redoStack.filter((action) => action.counterId !== counterId);
		}
	}

	async updateCounterSettings(counterId: string, name: string, decimals: number, unit: string, increments: number[]) {
		const currentUser = authStore.user;
		if (!currentUser) throw new Error('Not authenticated.');

		const counter = this.counters.find((c) => c.id === counterId);
		if (!counter) throw new Error('Counter not found.');

		if (increments.length < 1 || increments.length > 3) {
			throw new Error('Default increments must be between 1 and 3 items.');
		}

		const now = Date.now();
		const updatedCounter = {
			...counter,
			name,
			decimals,
			unit: unit.trim(),
			increments,
			updatedAt: now
		};

		const historyId = Math.random().toString(36).substring(2, 15);
		const newHistory: HistoryEntry = {
			id: historyId,
			counterId,
			counterName: name,
			timestamp: now,
			type: 'set',
			prevValue: counter.value,
			newValue: counter.value,
			delta: null,
			description: `Updated settings of counter "${name}"`,
			method: 'Settings Update'
		};

		const useFirebase = !!(isFirebaseConfigured && db && !currentUser.isAnonymous && !currentUser.uid.startsWith('local-'));
		if (useFirebase) {
			const batch = writeBatch(db!);
			const counterDocRef = doc(db!, 'users', currentUser.uid, 'counters', counterId);
			const historyDocRef = doc(db!, 'users', currentUser.uid, 'history', historyId);

			batch.set(counterDocRef, updatedCounter);
			batch.set(historyDocRef, newHistory);
			await batch.commit();
		} else {
			this.counters = this.counters.map((c) => (c.id === counterId ? updatedCounter : c));
			this.history = [newHistory, ...this.history];
			this.saveLocalData();
		}
	}

	async deleteCounter(counterId: string) {
		const currentUser = authStore.user;
		if (!currentUser) throw new Error('Not authenticated.');

		const counter = this.counters.find((c) => c.id === counterId);
		if (!counter) throw new Error('Counter not found.');

		const now = Date.now();
		const historyId = Math.random().toString(36).substring(2, 15);
		const newHistory: HistoryEntry = {
			id: historyId,
			counterId,
			counterName: counter.name,
			timestamp: now,
			type: 'delete',
			prevValue: counter.value,
			newValue: 0,
			delta: null,
			description: `Deleted counter "${counter.name}"`,
			method: 'Deletion'
		};

		const useFirebase = !!(isFirebaseConfigured && db && !currentUser.isAnonymous && !currentUser.uid.startsWith('local-'));
		if (useFirebase) {
			const batch = writeBatch(db!);
			const counterDocRef = doc(db!, 'users', currentUser.uid, 'counters', counterId);
			const historyDocRef = doc(db!, 'users', currentUser.uid, 'history', historyId);

			batch.delete(counterDocRef);
			batch.set(historyDocRef, newHistory);
			await batch.commit();
		} else {
			this.counters = this.counters.filter((c) => c.id !== counterId);
			this.history = [newHistory, ...this.history];
			this.saveLocalData();
		}

		// Remove undo/redo actions for the deleted counter to prevent orphan actions
		this.undoStack = this.undoStack.filter((action) => action.counterId !== counterId);
		this.redoStack = this.redoStack.filter((action) => action.counterId !== counterId);
	}

	canUndoCounter(counterId: string) {
		return this.undoStack.some((action) => action.counterId === counterId);
	}

	canRedoCounter(counterId: string) {
		return this.redoStack.some((action) => action.counterId === counterId);
	}

	async undoCounter(counterId: string) {
		let index = -1;
		for (let i = this.undoStack.length - 1; i >= 0; i--) {
			if (this.undoStack[i].counterId === counterId) {
				index = i;
				break;
			}
		}
		if (index === -1) return;

		const action = this.undoStack[index];
		this.undoStack = this.undoStack.filter((_, i) => i !== index);

		const counter = this.counters.find((c) => c.id === action.counterId);
		if (!counter) return; // Counter deleted

		// Push to redo stack
		this.redoStack = [
			...this.redoStack,
			{
				...action,
				prevValue: action.newValue,
				newValue: action.prevValue,
				description: `Redo: ${action.description}`
			}
		];

		// Apply undo (revert to prevValue)
		await this.updateCounterValue(
			action.counterId,
			action.prevValue,
			`Undo: Reverted "${action.description}"`,
			true,
			'Undo'
		);
	}

	async redoCounter(counterId: string) {
		let index = -1;
		for (let i = this.redoStack.length - 1; i >= 0; i--) {
			if (this.redoStack[i].counterId === counterId) {
				index = i;
				break;
			}
		}
		if (index === -1) return;

		const action = this.redoStack[index];
		this.redoStack = this.redoStack.filter((_, i) => i !== index);

		const counter = this.counters.find((c) => c.id === action.counterId);
		if (!counter) return; // Counter deleted

		// Push back to undo stack
		this.undoStack = [
			...this.undoStack,
			{
				...action,
				prevValue: action.newValue,
				newValue: action.prevValue,
				description: action.description.replace('Redo: ', '')
			}
		];

		// Apply redo (revert to newValue)
		await this.updateCounterValue(
			action.counterId,
			action.prevValue,
			`Redo: Reapplied "${action.description.replace('Redo: ', '')}"`,
			true,
			'Redo'
		);
	}

	async undo() {
		const action = this.undoStack.pop();
		if (!action) return;

		const counter = this.counters.find((c) => c.id === action.counterId);
		if (!counter) return; // Counter deleted

		// Push to redo stack
		this.redoStack.push({
			...action,
			prevValue: action.newValue,
			newValue: action.prevValue,
			description: `Redo: ${action.description}`
		});

		// Apply undo (revert to prevValue)
		await this.updateCounterValue(
			action.counterId,
			action.prevValue,
			`Undo: Reverted "${action.description}"`,
			true,
			'Undo'
		);
	}

	async redo() {
		const action = this.redoStack.pop();
		if (!action) return;

		const counter = this.counters.find((c) => c.id === action.counterId);
		if (!counter) return; // Counter deleted

		// Push back to undo stack
		this.undoStack.push({
			...action,
			prevValue: action.newValue,
			newValue: action.prevValue,
			description: action.description.replace('Redo: ', '')
		});

		// Apply redo (revert to newValue)
		await this.updateCounterValue(
			action.counterId,
			action.prevValue,
			`Redo: Reapplied "${action.description.replace('Redo: ', '')}"`,
			true,
			'Redo'
		);
	}
}

export const counterStore = new CounterStore();

class ThemeStore {
	current = $state<'light' | 'dark'>('dark');

	constructor() {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('contador_theme');
			if (saved === 'light' || saved === 'dark') {
				this.current = saved as 'light' | 'dark';
			} else {
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				this.current = prefersDark ? 'dark' : 'light';
			}
			this.applyTheme();
		}
	}

	toggle() {
		this.current = this.current === 'dark' ? 'light' : 'dark';
		if (typeof window !== 'undefined') {
			localStorage.setItem('contador_theme', this.current);
		}
		this.applyTheme();
	}

	private applyTheme() {
		if (typeof document !== 'undefined') {
			if (this.current === 'dark') {
				document.documentElement.classList.add('dark');
				document.documentElement.classList.remove('light');
			} else {
				document.documentElement.classList.add('light');
				document.documentElement.classList.remove('dark');
			}
		}
	}
}

export const themeStore = new ThemeStore();

