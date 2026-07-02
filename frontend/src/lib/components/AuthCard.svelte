<script lang="ts">
	import { authStore } from '$lib/store.svelte';
	import { isFirebaseConfigured } from '$lib/firebase';
	import { Mail, Lock, LogIn, UserPlus, Play, Key, AlertCircle } from 'lucide-svelte';

	interface Props {
		onsettings: () => void;
	}

	let { onsettings }: Props = $props();

	let activeTab = $state<'login' | 'register'>('login');
	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		loading = true;

		if (!email.trim() || !password) {
			error = 'Please fill out all fields.';
			loading = false;
			return;
		}

		try {
			if (activeTab === 'login') {
				await authStore.login(email.trim(), password);
			} else {
				await authStore.register(email.trim(), password);
			}
		} catch (err: any) {
			error = err.message || 'Authentication failed.';
		} finally {
			loading = false;
		}
	}

	async function handleAnonymous() {
		error = null;
		loading = true;
		try {
			await authStore.loginAnonymously();
		} catch (err: any) {
			error = err.message || 'Demo mode entrance failed.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="w-full max-w-md bg-zinc-950/45 border border-white/10 p-6 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden group">
	<!-- Glow decorations -->
	<div class="absolute -right-24 -top-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/15 transition-all"></div>
	<div class="absolute -left-24 -bottom-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>

	<!-- Logo & Tagline -->
	<div class="text-center mb-6 relative z-10 select-none">
		<div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-black text-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)] mb-3">
			C
		</div>
		<h1 class="text-2xl font-black tracking-tight text-zinc-50">Contador</h1>
		<p class="text-xs text-zinc-400 mt-1">Sleek, high-precision habit & fitness counter</p>
	</div>

	<!-- Firebase status alert -->
	{#if !isFirebaseConfigured}
		<div class="mb-5 p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 text-[11px] text-zinc-400 flex items-start gap-2 relative z-10">
			<AlertCircle size={14} class="text-purple-400 shrink-0 mt-0.5" />
			<div class="leading-relaxed">
				<span>Firebase is not connected yet. You will be logged into a <strong>local session</strong>.</span>
				<button
					onclick={onsettings}
					type="button"
					class="text-purple-400 hover:text-purple-300 font-bold underline ml-1 cursor-pointer"
				>
					Configure Firebase Settings
				</button>
			</div>
		</div>
	{/if}

	<!-- Tabs -->
	<div class="grid grid-cols-2 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 mb-5 relative z-10 shrink-0">
		<button
			type="button"
			onclick={() => {
				activeTab = 'login';
				error = null;
			}}
			class="py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5
			{activeTab === 'login'
				? 'bg-purple-500/20 border border-purple-500/30 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
				: 'text-zinc-500 hover:text-zinc-300'}"
		>
			<LogIn size={14} />
			<span>Sign In</span>
		</button>
		<button
			type="button"
			onclick={() => {
				activeTab = 'register';
				error = null;
			}}
			class="py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5
			{activeTab === 'register'
				? 'bg-purple-500/20 border border-purple-500/30 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
				: 'text-zinc-500 hover:text-zinc-300'}"
		>
			<UserPlus size={14} />
			<span>Register</span>
		</button>
	</div>

	<!-- Error Message -->
	{#if error}
		<div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2 relative z-10">
			<AlertCircle size={14} class="shrink-0 text-red-400" />
			<span>{error}</span>
		</div>
	{/if}

	<!-- Form -->
	<form onsubmit={handleSubmit} class="space-y-4 relative z-10">
		<!-- Email Input -->
		<div>
			<label for="email" class="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Email Address</label>
			<div class="relative">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
					<Mail size={14} />
				</span>
				<input
					type="email"
					id="email"
					bind:value={email}
					placeholder="name@example.com"
					required
					class="w-full bg-zinc-950/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50 text-xs"
				/>
			</div>
		</div>

		<!-- Password Input -->
		<div>
			<label for="password" class="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Password</label>
			<div class="relative">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
					<Lock size={14} />
				</span>
				<input
					type="password"
					id="password"
					bind:value={password}
					placeholder="••••••••"
					required
					class="w-full bg-zinc-950/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50 text-xs"
				/>
			</div>
		</div>

		<!-- Submit Button -->
		<button
			type="submit"
			disabled={loading}
			class="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:text-zinc-400 text-zinc-100 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] active:scale-[0.98] text-xs flex items-center justify-center gap-1.5"
		>
			{#if loading}
				<span>Connecting...</span>
			{:else if activeTab === 'login'}
				<LogIn size={14} />
				<span>Sign In</span>
			{:else}
				<UserPlus size={14} />
				<span>Create Account</span>
			{/if}
		</button>
	</form>

	<!-- Divider -->
	<div class="relative my-6 relative z-10 shrink-0">
		<div class="absolute inset-0 flex items-center" aria-hidden="true">
			<div class="w-full border-t border-white/5"></div>
		</div>
		<div class="relative flex justify-center text-xs">
			<span class="bg-zinc-950 px-3 py-0.5 rounded-full border border-white/5 text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Or Quick Play</span>
		</div>
	</div>

	<!-- Anonymous Play -->
	<button
		type="button"
		onclick={handleAnonymous}
		disabled={loading}
		class="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/30 rounded-xl font-bold transition-all active:scale-[0.98] text-xs flex items-center justify-center gap-1.5 relative z-10"
	>
		<Play size={14} />
		<span>Play in Demo Mode (No Log In)</span>
	</button>
</div>
