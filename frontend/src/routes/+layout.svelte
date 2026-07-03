<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { authStore } from '$lib/store.svelte';
	import { Loader2 } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { children } = $props();

	// Client-side authentication redirects
	$effect(() => {
		if (!authStore.loading) {
			const isAuthPage = $page.route.id === '/auth';
			if (!authStore.user && !isAuthPage) {
				goto('/auth');
			} else if (authStore.user && (isAuthPage || $page.route.id === '/')) {
				goto('/counters');
			}
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
	<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
</svelte:head>

<main class="min-h-screen grid-bg bg-zinc-50/20 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center p-4 md:p-8 overflow-x-hidden relative font-sans transition-colors duration-300">
	<!-- Ambient glowing backgrounds for Cyberpunk aesthetic -->
	<div class="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-purple-500/10 dark:bg-purple-650/12 rounded-full blur-[120px] pointer-events-none -z-10"></div>
	<div class="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-emerald-500/8 dark:bg-emerald-600/8 rounded-full blur-[120px] pointer-events-none -z-10"></div>

	{#if authStore.loading}
		<!-- Loading state screen -->
		<div class="flex-1 flex flex-col items-center justify-center space-y-4 py-20 w-full max-w-md mx-auto relative z-10 animate-pulse">
			<div class="relative flex items-center justify-center">
				<div class="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-zinc-100 animate-spin shrink-0"></div>
				<Loader2 class="absolute animate-pulse text-zinc-650 dark:text-zinc-405" size={20} />
			</div>
			<p class="text-xs font-semibold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest animate-pulse">Initializing Interface...</p>
		</div>
	{:else if (!authStore.user && $page.route.id !== '/auth') || (authStore.user && ($page.route.id === '/auth' || $page.route.id === '/'))}
		<!-- Redirection in progress to avoid layout flash -->
		<div class="flex-1 flex flex-col items-center justify-center space-y-4 py-20 w-full max-w-md mx-auto relative z-10 animate-pulse">
			<div class="relative flex items-center justify-center">
				<div class="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-zinc-100 animate-spin shrink-0"></div>
				<Loader2 class="absolute animate-pulse text-zinc-650 dark:text-zinc-405" size={20} />
			</div>
			<p class="text-xs font-semibold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest animate-pulse">Redirecting...</p>
		</div>
	{:else}
		<!-- Main route children -->
		{@render children()}
	{/if}
</main>


