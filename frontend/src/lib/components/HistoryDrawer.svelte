<script lang="ts">
	import { counterStore } from '$lib/store.svelte';
	import IconButton from './IconButton.svelte';
	import { X, Search, RefreshCw, PlusCircle, ArrowUpRight, ArrowDownRight, Edit3, Trash2, Calendar } from 'lucide-svelte';

	interface Props {
		show?: boolean;
		onclose: () => void;
	}

	let { show = false, onclose }: Props = $props();

	let searchQuery = $state('');

	let filteredHistory = $derived(() => {
		const items = counterStore.history;
		if (!searchQuery.trim()) return items;
		const query = searchQuery.toLowerCase();
		return items.filter(
			(entry) =>
				entry.counterName.toLowerCase().includes(query) ||
				entry.description.toLowerCase().includes(query) ||
				(entry.method && entry.method.toLowerCase().includes(query))
		);
	});

	function formatTime(timestamp: number) {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	}

	function formatDate(timestamp: number) {
		const date = new Date(timestamp);
		return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && show) {
			onclose();
		}
	}

	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				if (node.parentNode) {
					node.parentNode.removeChild(node);
				}
			}
		};
	}
</script>

{#if show}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		use:portal
		class="fixed inset-0 z-40 flex justify-end outline-none"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onkeydown={handleKeydown}
	>
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out"
			onclick={onclose}
		></div>

		<!-- Drawer Panel -->
		<div
			class="relative w-full max-w-md bg-white/95 dark:bg-zinc-950/70 border-l border-zinc-200/60 dark:border-purple-500/20 text-zinc-900 dark:text-zinc-100 shadow-2xl backdrop-blur-xl h-full flex flex-col overflow-hidden transition-all duration-300"
		>
			<!-- Header -->
			<div class="p-4 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-zinc-55 dark:bg-transparent">
				<div>
					<h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">Activity History</h2>
					<p class="text-xs text-zinc-500 dark:text-zinc-400">Log of value adjustments and events</p>
				</div>
				<IconButton
					onclick={onclose}
					variant="ghost"
					size="md"
					shape="square"
					aria-label="Close Drawer"
				>
					<X size={20} />
				</IconButton>
			</div>

			<!-- Search -->
			<div class="p-4 border-b border-zinc-200 dark:border-white/5 shrink-0 bg-zinc-50/50 dark:bg-transparent">
				<div class="relative">
					<span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
						<Search size={16} />
					</span>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search by counter name..."
						class="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50 text-base md:text-sm"
					/>
				</div>
			</div>

			<!-- History Items -->
			<div class="flex-1 overflow-y-auto p-4 space-y-4">
				{#if filteredHistory().length === 0}
					<div class="flex flex-col items-center justify-center h-48 text-center text-zinc-400 dark:text-zinc-500">
						<Calendar size={32} class="text-zinc-300 dark:text-zinc-600 mb-2" />
						<p class="text-sm">No activity history recorded.</p>
						{#if searchQuery}
							<p class="text-xs text-zinc-500 dark:text-zinc-600 mt-1">Try clearing your search query.</p>
						{/if}
					</div>
				{:else}
					<div class="relative border-l border-zinc-200 dark:border-white/5 pl-4 ml-2.5 space-y-5">
						{#each filteredHistory() as entry (entry.id)}
							<div class="relative">
								<!-- Icon marker -->
								<div class="absolute -left-[27px] top-0.5 flex items-center justify-center w-5 h-5 rounded-full border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 text-xs shadow-sm dark:shadow-md">
									{#if entry.type === 'create'}
										<PlusCircle size={12} class="text-purple-600 dark:text-purple-400" />
									{:else if entry.type === 'increment'}
										<ArrowUpRight size={12} class="text-emerald-600 dark:text-emerald-400" />
									{:else if entry.type === 'decrement'}
										<ArrowDownRight size={12} class="text-purple-600 dark:text-purple-400" />
									{:else if entry.type === 'set'}
										<Edit3 size={11} class="text-blue-600 dark:text-blue-400" />
									{:else if entry.type === 'delete'}
										<Trash2 size={11} class="text-zinc-500 dark:text-zinc-400" />
									{/if}
								</div>

								<!-- Details -->
								<div class="space-y-1">
									<div class="flex items-center justify-between gap-2">
										<div class="flex items-center gap-2">
											<span class="font-semibold text-xs text-zinc-800 dark:text-zinc-200">
												{entry.counterName}
											</span>
											{#if entry.method}
												<span class="text-[9px] bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 font-semibold px-1.5 py-0.5 rounded-full select-none">
													{entry.method}
												</span>
											{/if}
										</div>
										<span class="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1">
											<span>{formatDate(entry.timestamp)}</span>
											<span>•</span>
											<span>{formatTime(entry.timestamp)}</span>
										</span>
									</div>
									<p class="text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
										{entry.description}
									</p>
									{#if entry.prevValue !== null && entry.type !== 'delete'}
										<div class="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
											<span>{entry.prevValue}</span>
											<span>→</span>
											<span class="text-zinc-800 dark:text-zinc-300 font-bold">{entry.newValue}</span>
											{#if entry.delta !== null}
												<span class={entry.delta > 0 ? 'text-emerald-650 dark:text-emerald-450 font-semibold' : 'text-purple-650 dark:text-purple-400 font-semibold'}>
													({entry.delta > 0 ? '+' : ''}{entry.delta})
												</span>
											{/if}
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
