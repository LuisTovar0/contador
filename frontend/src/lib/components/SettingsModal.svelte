<script lang="ts">
	import Modal from './Modal.svelte';
	import { isFirebaseConfigured } from '$lib/firebase';
	import { X, RefreshCw, HelpCircle, Key, CheckCircle2, AlertTriangle } from 'lucide-svelte';

	interface Props {
		show?: boolean;
		onclose: () => void;
	}

	let { show = false, onclose }: Props = $props();

	let apiKey = $state('');
	let authDomain = $state('');
	let projectId = $state('');
	let storageBucket = $state('');
	let messagingSenderId = $state('');
	let appId = $state('');

	let infoMessage = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);

	// Load existing local config if any
	$effect(() => {
		if (show) {
			try {
				const stored = localStorage.getItem('contador_firebase_config');
				if (stored) {
					const config = JSON.parse(stored);
					apiKey = config.apiKey || '';
					authDomain = config.authDomain || '';
					projectId = config.projectId || '';
					storageBucket = config.storageBucket || '';
					messagingSenderId = config.messagingSenderId || '';
					appId = config.appId || '';
				}
			} catch (e) {
				console.error('Failed to load local firebase config from storage:', e);
			}
		}
	});

	function saveConfig() {
		infoMessage = null;
		errorMessage = null;

		if (!apiKey || !projectId || !appId) {
			errorMessage = 'API Key, Project ID, and App ID are required for configuration.';
			return;
		}

		try {
			const config = {
				apiKey: apiKey.trim(),
				authDomain: authDomain.trim(),
				projectId: projectId.trim(),
				storageBucket: storageBucket.trim(),
				messagingSenderId: messagingSenderId.trim(),
				appId: appId.trim()
			};
			localStorage.setItem('contador_firebase_config', JSON.stringify(config));
			infoMessage = 'Configuration saved! Reloading the application to connect to Firebase...';

			setTimeout(() => {
				window.location.reload();
			}, 1500);
		} catch (e: any) {
			errorMessage = 'Error saving config: ' + e.message;
		}
	}

	function resetConfig() {
		try {
			localStorage.removeItem('contador_firebase_config');
			apiKey = '';
			authDomain = '';
			projectId = '';
			storageBucket = '';
			messagingSenderId = '';
			appId = '';
			infoMessage = 'Configuration cleared! Reloading to revert to Local Storage (Demo Mode)...';

			setTimeout(() => {
				window.location.reload();
			}, 1500);
		} catch (e: any) {
			errorMessage = 'Error resetting config: ' + e.message;
		}
	}
</script>

<Modal {show} {onclose}>
	<div class="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
		<h2 class="text-xl font-bold flex items-center gap-2 text-purple-400">
			<Key size={20} />
			<span>Firebase Settings</span>
		</h2>
		<button
			onclick={onclose}
			class="text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-white/5"
			aria-label="Close"
		>
			<X size={20} />
		</button>
	</div>

	<div class="flex-1 overflow-y-auto space-y-4 pr-1 text-sm">
		<!-- Status card -->
		<div
			class="p-3.5 rounded-xl border flex items-start gap-3 backdrop-blur-md
			{isFirebaseConfigured
				? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
				: 'bg-zinc-800/20 border-zinc-700/30 text-zinc-300'}"
		>
			{#if isFirebaseConfigured}
				<CheckCircle2 size={18} class="shrink-0 mt-0.5" />
				<div>
					<p class="font-semibold text-emerald-400">Connected to Firebase</p>
					<p class="text-xs text-emerald-400/80 mt-0.5">
						The application is syncing data with Firebase in real time.
					</p>
				</div>
			{:else}
				<AlertTriangle size={18} class="shrink-0 mt-0.5 text-purple-400" />
				<div>
					<p class="font-semibold text-purple-400">Running in Local Demo Mode</p>
					<p class="text-xs text-zinc-400 mt-0.5 leading-relaxed">
						Data is stored locally in your browser. Configure your Firebase credentials below to sync
						across devices.
					</p>
				</div>
			{/if}
		</div>

		<!-- Config form -->
		<div class="space-y-3.5">
			<div class="grid grid-cols-1 gap-3.5">
				<div>
					<label for="apiKey" class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
						>API Key *</label
					>
					<input
						type="text"
						id="apiKey"
						bind:value={apiKey}
						placeholder="AIzaSyA..."
						class="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="projectId" class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
							>Project ID *</label
						>
						<input
							type="text"
							id="projectId"
							bind:value={projectId}
							placeholder="my-counter-app"
							class="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50"
						/>
					</div>

					<div>
						<label for="appId" class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
							>App ID *</label
						>
						<input
							type="text"
							id="appId"
							bind:value={appId}
							placeholder="1:12345:web:abcd"
							class="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50"
						/>
					</div>
				</div>

				<div>
					<label for="authDomain" class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
						>Auth Domain (Optional)</label
					>
					<input
						type="text"
						id="authDomain"
						bind:value={authDomain}
						placeholder="my-counter-app.firebaseapp.com"
						class="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="storageBucket" class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
							>Storage Bucket</label
						>
						<input
							type="text"
							id="storageBucket"
							bind:value={storageBucket}
							placeholder="my-counter-app.appspot.com"
							class="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50"
						/>
					</div>

					<div>
						<label for="messagingSenderId" class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
							>Sender ID</label
						>
						<input
							type="text"
							id="messagingSenderId"
							bind:value={messagingSenderId}
							placeholder="87654321098"
							class="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50"
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- Feedback Messages -->
		{#if infoMessage}
			<div class="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-xl text-xs flex items-center gap-2">
				<RefreshCw size={14} class="animate-spin text-purple-400 shrink-0" />
				<span>{infoMessage}</span>
			</div>
		{/if}

		{#if errorMessage}
			<div class="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
				{errorMessage}
			</div>
		{/if}

		<!-- Help info -->
		<div class="p-3.5 bg-zinc-950/40 border border-white/5 rounded-xl text-xs space-y-1.5 text-zinc-400">
			<span class="font-semibold text-zinc-300 flex items-center gap-1.5">
				<HelpCircle size={14} /> Alternative Setup
			</span>
			<p class="leading-relaxed">
				You can also define these values in a local <code class="text-purple-400 font-mono">.env</code> file at the root of the frontend folder:
			</p>
			<pre class="bg-black/40 p-2 rounded border border-white/5 text-[10px] text-zinc-500 overflow-x-auto leading-relaxed">
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender
VITE_FIREBASE_APP_ID=your_app_id</pre>
		</div>
	</div>

	<div class="border-t border-white/10 pt-4 mt-4 flex items-center justify-between gap-3 shrink-0">
		<button
			onclick={resetConfig}
			class="px-4 py-2 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-xl font-semibold transition-all hover:bg-red-500/5 active:scale-[0.98] text-xs"
		>
			Reset to Demo
		</button>
		<button
			onclick={saveConfig}
			class="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-zinc-100 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] active:scale-[0.98] text-xs flex items-center gap-1.5"
		>
			Save & Connect
		</button>
	</div>
</Modal>
