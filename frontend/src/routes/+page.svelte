<script lang="ts">
	import { authStore, counterStore } from '$lib/store.svelte';
	import AuthCard from '$lib/components/AuthCard.svelte';
	import CounterCard from '$lib/components/CounterCard.svelte';
	import CreateCounterModal from '$lib/components/CreateCounterModal.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import HistoryDrawer from '$lib/components/HistoryDrawer.svelte';
	import { isFirebaseConfigured } from '$lib/firebase';
	import {
		Plus,
		Settings,
		History,
		Undo2,
		Redo2,
		LogOut,
		Sparkles,
		RotateCcw,
		Zap,
		LayoutGrid,
		CheckCircle2,
		Loader2
	} from 'lucide-svelte';

	// Modal trigger states
	let showCreateModal = $state(false);
	let showSettingsModal = $state(false);
	let showHistoryDrawer = $state(false);

	// Inline toast logic for undo
	let lastActionToast = $derived(() => {
		const logs = counterStore.history;
		if (logs.length === 0) return null;
		// Return the most recent log if it's an update operation
		const lastLog = logs[0];
		if (lastLog.type === 'create' || lastLog.type === 'delete') return null;
		return lastLog;
	});

	let showToast = $state(false);
	let toastTimeout: ReturnType<typeof setTimeout>;

	// Show toast whenever last action changes
	$effect(() => {
		const action = lastActionToast();
		if (action && !action.description.startsWith('Undo') && !action.description.startsWith('Redo')) {
			showToast = true;
			clearTimeout(toastTimeout);
			toastTimeout = setTimeout(() => {
				showToast = false;
			}, 5000);
		}
	});

	function handleUndo() {
		counterStore.undo();
		showToast = false;
	}
</script>

<svelte:head>
	<title>Contador • High-Tech Counters</title>
	<meta name="description" content="Vibrant glassmorphic counter app with real-time Firebase sync, history logs, and undo/redo operations." />
</svelte:head>

<main class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-0 md:p-6 overflow-x-hidden relative font-sans">
	<!-- Neon glowing background ambient blurs -->
	<div class="fixed top-[-10%] left-[-20%] w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none select-none z-0"></div>
	<div class="fixed bottom-[-15%] right-[-15%] w-[80vw] h-[80vw] md:w-[45vw] md:h-[45vw] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none select-none z-0"></div>

	<!-- Mobile viewport simulator shell on desktop, full-screen on mobile -->
	<div class="w-full max-w-md md:h-[90vh] md:rounded-3xl border-0 md:border border-white/10 bg-zinc-950/45 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden relative z-10 md:ring-1 md:ring-white/[0.03]">
		
		<!-- AUTHENTICATION STATE CHECK -->
		{#if authStore.loading}
			<!-- Loading state screen -->
			<div class="flex-1 flex flex-col items-center justify-center space-y-4">
				<div class="relative flex items-center justify-center">
					<div class="w-12 h-12 rounded-full border border-purple-500/10 border-t-purple-500 animate-spin shrink-0"></div>
					<Loader2 class="absolute animate-pulse text-purple-400" size={20} />
				</div>
				<p class="text-xs font-semibold text-zinc-500 uppercase tracking-widest animate-pulse">Initializing Interface...</p>
			</div>
		{:else if !authStore.user}
			<!-- Signed-out state screen (Login/Signup/Demo) -->
			<div class="flex-1 flex items-center justify-center p-5">
				<AuthCard onsettings={() => (showSettingsModal = true)} />
			</div>
		{:else}
			<!-- MAIN APPLICATION WORKFLOW -->
			<!-- Header -->
			<header class="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-zinc-950/20 backdrop-blur-md relative z-20">
				<div class="flex items-center gap-2 select-none">
					<div class="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 font-black text-sm flex items-center justify-center">
						C
					</div>
					<div>
						<h1 class="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
							<span>Contador</span>
							{#if !isFirebaseConfigured}
								<span class="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded-full">Demo</span>
							{/if}
						</h1>
					</div>
				</div>

				<div class="flex items-center gap-1.5">
					<!-- Undo Action -->
					<button
						onclick={() => counterStore.undo()}
						disabled={!counterStore.canUndo}
						class="p-2 rounded-xl border border-white/5 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200 hover:border-white/10 disabled:opacity-20 disabled:hover:text-zinc-400 disabled:hover:border-white/5 transition-all shrink-0 active:scale-95"
						title="Undo (Ctrl+Z)"
					>
						<Undo2 size={15} />
					</button>

					<!-- Redo Action -->
					<button
						onclick={() => counterStore.redo()}
						disabled={!counterStore.canRedo}
						class="p-2 rounded-xl border border-white/5 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200 hover:border-white/10 disabled:opacity-20 disabled:hover:text-zinc-400 disabled:hover:border-white/5 transition-all shrink-0 active:scale-95"
						title="Redo (Ctrl+Y)"
					>
						<Redo2 size={15} />
					</button>

					<div class="w-px h-5 bg-white/10 mx-0.5"></div>

					<!-- Settings Modal Button -->
					<button
						onclick={() => (showSettingsModal = true)}
						class="p-2 rounded-xl border border-white/5 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200 hover:border-white/10 transition-all shrink-0"
						title="Firebase Settings"
					>
						<Settings size={15} />
					</button>

					<!-- Global History Drawer Button -->
					<button
						onclick={() => (showHistoryDrawer = true)}
						class="p-2 rounded-xl border border-white/5 bg-zinc-900/30 text-zinc-400 hover:text-zinc-200 hover:border-white/10 transition-all shrink-0"
						title="Activity logs"
					>
						<History size={15} />
					</button>

					<!-- Logout Button -->
					<button
						onclick={() => authStore.logout()}
						class="p-2 rounded-xl border border-white/5 bg-zinc-900/30 text-zinc-400 hover:text-red-400 hover:border-red-500/20 transition-all shrink-0"
						title="Sign Out"
					>
						<LogOut size={15} />
					</button>
				</div>
			</header>

			<!-- Counters view list container -->
			<div class="flex-1 overflow-y-auto p-5 space-y-4 pb-24 relative z-10">
				{#if counterStore.loading}
					<!-- Skeleton loading states -->
					<div class="space-y-4">
						{#each [1, 2] as _}
							<div class="w-full h-36 rounded-2xl border border-white/5 bg-zinc-900/10 animate-pulse flex flex-col justify-between p-5">
								<div class="h-4 bg-zinc-800 rounded w-1/3"></div>
								<div class="h-10 bg-zinc-800 rounded w-1/2 mx-auto"></div>
								<div class="h-8 bg-zinc-800 rounded w-full"></div>
							</div>
						{/each}
					</div>
				{:else if counterStore.counters.length === 0}
					<!-- Empty State Dashboard -->
					<div class="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01] space-y-4">
						<div class="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-lg">
							<Zap size={20} />
						</div>
						<div>
							<h3 class="font-bold text-sm text-zinc-100">No counters active</h3>
							<p class="text-xs text-zinc-500 mt-1 max-w-[240px] mx-auto leading-normal">
								Track weight sets, daily water, or workout steps. Create your first customized counter to start logging.
							</p>
						</div>
						<button
							onclick={() => (showCreateModal = true)}
							class="py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-zinc-100 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] text-xs active:scale-95"
						>
							Create Counter
						</button>
					</div>
				{:else}
					<!-- Responsive Grid counters list -->
					<div class="grid grid-cols-1 gap-4">
						{#each counterStore.counters as counter (counter.id)}
							<CounterCard {counter} />
						{/each}
					</div>
				{/if}
			</div>

			<!-- Floating action button to Add Counter -->
			<div class="absolute bottom-5 right-5 z-20">
				<button
					onclick={() => (showCreateModal = true)}
					class="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-zinc-100 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:shadow-[0_0_25px_rgba(168,85,247,0.65)] hover:scale-105 active:scale-95 transition-all"
					aria-label="Create new counter"
				>
					<Plus size={24} />
				</button>
			</div>
		{/if}

		<!-- BOTTOM TOAST NOTIFICATION (Undo HUD) -->
		{#if showToast && lastActionToast()}
			<div class="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2.5rem)] max-w-sm px-4 py-3 bg-zinc-950/90 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-xs leading-normal ring-1 ring-purple-500/10">
				<div class="flex items-center gap-2 text-zinc-300 min-w-0">
					<CheckCircle2 size={16} class="text-emerald-400 shrink-0" />
					<p class="truncate">{lastActionToast()?.description}</p>
				</div>
				<button
					onclick={handleUndo}
					class="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 hover:underline cursor-pointer shrink-0 uppercase tracking-wider text-[10px]"
				>
					<RotateCcw size={10} />
					<span>Undo</span>
				</button>
			</div>
		{/if}
	</div>

	<!-- GLOBAL MODALS MOUNTED -->
	<CreateCounterModal show={showCreateModal} onclose={() => (showCreateModal = false)} />
	<SettingsModal show={showSettingsModal} onclose={() => (showSettingsModal = false)} />
	<HistoryDrawer show={showHistoryDrawer} onclose={() => (showHistoryDrawer = false)} />
</main>
