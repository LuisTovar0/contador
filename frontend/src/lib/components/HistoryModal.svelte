<script lang="ts">
  import { counterStore } from '$lib/store.svelte';
  import { ArrowDownRight, ArrowUpRight, Calendar, Clock, Edit3, PlusCircle, Search, Trash2, X } from 'lucide-svelte';
  import IconButton from './IconButton.svelte';
  import Modal from './Modal.svelte';

  interface Props {
    show?: boolean;
    onclose: () => void;
    counterId?: string | null;
  }

  let { show = false, onclose, counterId = null }: Props = $props();

  let searchQuery = $state('');
  let visibleCount = $state(10); // Initially show 10 items

  // Reset pagination and query when shown or when target changes
  $effect(() => {
    if (show) {
      visibleCount = 10;
      searchQuery = '';
    }
  });

  let counterName = $derived(() => {
    if (!counterId) return 'Counter';
    return counterStore.counters.find((c) => c.id === counterId)?.name || 'Counter';
  });

  let filteredHistory = $derived(() => {
    let items = counterStore.history;

    if (counterId) {
      items = items.filter((entry) => entry.counterId === counterId);
    }

    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
        (entry) =>
            entry.counterName.toLowerCase().includes(query) ||
            entry.description.toLowerCase().includes(query) ||
            (entry.method && entry.method.toLowerCase().includes(query)),
    );
  });

  let visibleHistory = $derived(() => {
    return filteredHistory().slice(0, visibleCount);
  });

  let hasMore = $derived(() => {
    return filteredHistory().length > visibleCount;
  });

  function loadMore() {
    visibleCount += 10;
  }

  function formatTime(timestamp: number) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
</script>

<Modal {show} {onclose}>
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-4 shrink-0">
        <div>
            <h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Clock size={18} class="text-purple-650 dark:text-purple-400" />
                <span>{counterId ? `${ counterName() } Activity` : 'Activity History'}</span>
            </h2>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {counterId ? 'Log of events for this counter' : 'Log of value adjustments and events'}
            </p>
        </div>
        <IconButton
                onclick={onclose}
                variant="ghost"
                size="md"
                shape="square"
                aria-label="Close"
        >
            <X size={20} />
        </IconButton>
    </div>

    <!-- Search -->
    <div class="pb-4 border-b border-zinc-200 dark:border-white/5 shrink-0">
        <div class="relative">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
				<Search size={16} />
			</span>
            <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder={counterId ? "Search changes..." : "Search by counter name..."}
                    class="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50 text-base md:text-sm"
            />
        </div>
    </div>

    <!-- History Items -->
    <div class="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
        {#if visibleHistory().length === 0}
            <div class="flex flex-col items-center justify-center h-48 text-center text-zinc-400 dark:text-zinc-500">
                <Calendar size={32} class="text-zinc-300 dark:text-zinc-600 mb-2" />
                <p class="text-sm">No activity history recorded.</p>
                {#if searchQuery}
                    <p class="text-xs text-zinc-500 dark:text-zinc-600 mt-1">Try clearing your search query.</p>
                {/if}
            </div>
        {:else}
            <div class="relative border-l border-zinc-200 dark:border-white/5 pl-4 ml-2.5 space-y-5">
                {#each visibleHistory() as entry (entry.id)}
                    <div class="relative">
                        <!-- Icon marker -->
                        <div class="absolute -left-[27px] top-0.5 flex items-center justify-center w-5 h-5 rounded-full border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 text-xs shadow-sm dark:shadow-md">
                            {#if entry.type === 'create'}
                                <PlusCircle size={12} class="text-purple-600 dark:text-purple-400" />
                            {:else if entry.type === 'increment'}
                                <ArrowUpRight size={12} class="text-emerald-600 dark:text-emerald-400" />
                            {:else if entry.type === 'decrement'}
                                <ArrowDownRight size={12} class="text-purple-650 dark:text-purple-400" />
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
                                    {#if !counterId}
                                        <span class="font-semibold text-xs text-zinc-800 dark:text-zinc-200">
                                            {entry.counterName}
                                        </span>
                                    {/if}
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
                            <p class="text-xs text-zinc-650 dark:text-zinc-400 leading-normal">
                                {entry.description}
                            </p>
                            {#if entry.prevValue !== null && entry.type !== 'delete'}
                                <div class="flex items-center gap-1.5 text-[10px] font-mono text-zinc-450 dark:text-zinc-500">
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

            <!-- Load More Button -->
            {#if hasMore()}
                <div class="pt-4 pb-2 flex justify-center">
                    <button
                            type="button"
                            onclick={loadMore}
                            class="px-5 py-2 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-purple-650 dark:text-purple-400 hover:text-purple-750 dark:hover:text-purple-300 rounded-xl font-bold transition-all text-xs cursor-pointer active:scale-[0.98] shadow-sm"
                    >
                        Load More
                    </button>
                </div>
            {/if}
        {/if}
    </div>
</Modal>
