<script lang="ts">
  import { counterStore } from '$lib/store.svelte';
  import { ArrowDownRight, ArrowUpRight, Calendar, Clock, Edit3, PlusCircle, Search, Trash2, X } from 'lucide-svelte';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import Modal from './Modal.svelte';
  import { t, APP_LIMITS } from '$lib';


  interface Props {
    show?: boolean;
    onclose: (result?: any) => void;
    counterId?: string | null;
  }

  let { show = false, onclose, counterId = null }: Props = $props();

  let searchQuery = $state('');
  let visibleCount = $state(APP_LIMITS.HISTORY_MODAL_PAGE_SIZE); // Initially show pagination size items

  // Reset pagination and query when shown or when target changes
  $effect(() => {
    if (show) {
      visibleCount = APP_LIMITS.HISTORY_MODAL_PAGE_SIZE;
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
    visibleCount += APP_LIMITS.HISTORY_MODAL_PAGE_SIZE;
  }

  function formatTime(timestamp: number) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  const translatedMethod = (method: string) => {
    if (method === 'Creation') return t('history.method.creation');
    if (method === 'Settings Update') return t('history.method.settingsUpdate');
    if (method === 'Deletion') return t('history.method.deletion');
    if (method === 'Quick Adjust') return t('history.method.quickAdjust');
    if (method === 'Custom Adjust') return t('history.method.customAdjust');
    if (method === 'Direct Set') return t('history.method.directSet');
    if (method === 'Undo') return t('history.method.undo');
    if (method === 'Redo') return t('history.method.redo');
    return method;
  };
</script>

<Modal {show} {onclose}>
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-modal-border pb-4 mb-4 shrink-0">
        <div>
            <h2 class="text-lg font-bold text-primary flex items-center gap-2">
                <Clock size={18} class="text-primary-brand" />
                <span>{counterId ? t('history.titleCounter', { name: counterName() }) : t('history.title')}</span>
            </h2>
            <p class="text-xs text-muted mt-0.5">
                {counterId ? t('history.subtitleCounter') : t('history.subtitle')}
            </p>
        </div>
        <IconButton
                onclick={() => onclose()}
                variant="ghost"
                size="md"
                aria-label="Close"
        >
            <X size={20} />
        </IconButton>
    </div>

    <!-- Search -->
    <div class="pb-4 border-b border-muted shrink-0">
        <div class="relative">
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
				<Search size={16} />
			</span>
            <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder={counterId ? t('history.searchPlaceholderCounter') : t('history.searchPlaceholder')}
                    class="w-full glass-surface border border-input-border rounded-xl pl-9 pr-3 py-2 text-primary placeholder:text-placeholder focus:outline-none focus:border-primary-500 transition-colors focus:ring-1 focus:ring-primary-500/40 text-base md:text-sm"
            />
        </div>
    </div>

    <!-- History Items -->
    <div class="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
        {#if visibleHistory().length === 0}
            <div class="flex flex-col items-center justify-center h-48 text-center text-muted">
                <Calendar size={32} class="text-muted mb-2" />
                <p class="text-sm">{t('history.noHistory')}</p>
                {#if searchQuery}
                    <p class="text-xs text-muted mt-1">{t('history.clearSearch')}</p>
                {/if}
            </div>
        {:else}
            <div class="relative border-l border-muted pl-4 ml-2.5 space-y-5">
                {#each visibleHistory() as entry (entry.id)}
                    <div class="relative">
                        <!-- Icon marker -->
                        <div class="absolute -left-[27px] top-0.5 flex items-center justify-center w-5 h-5 rounded-full border border-history-marker bg-history-marker text-xs shadow-history-marker">
                            {#if entry.type === 'create'}
                                <PlusCircle size={12} class="text-primary-brand" />
                            {:else if entry.type === 'increment'}
                                <ArrowUpRight size={12} class="text-primary-brand" />
                            {:else if entry.type === 'decrement'}
                                <ArrowDownRight size={12} class="text-secondary-brand" />
                            {:else if entry.type === 'set'}
                                <Edit3 size={11} class="text-info" />
                            {:else if entry.type === 'delete'}
                                <Trash2 size={11} class="text-muted" />
                            {/if}
                        </div>

                        <!-- Details -->
                        <div class="space-y-1">
                            <div class="flex items-center justify-between gap-2">
                                <div class="flex items-center gap-2">
                                    {#if !counterId}
                                        <span class="font-semibold text-xs text-secondary">
                                            {entry.counterName}
                                        </span>
                                    {/if}
                                    {#if entry.method}
                                        <span class="text-[9px] bg-primary-badge border border-primary-badge text-primary-brand-subtle font-semibold px-1.5 py-0.5 rounded-full select-none">
                                            {translatedMethod(entry.method)}
                                        </span>
                                    {/if}
                                </div>
                                <span class="text-[10px] text-muted font-mono flex items-center gap-1">
									<span>{formatDate(entry.timestamp)}</span>
									<span>•</span>
									<span>{formatTime(entry.timestamp)}</span>
								</span>
                            </div>
                            <p class="text-xs text-alt leading-normal">
                                {entry.description}
                            </p>
                            {#if entry.prevValue !== null && entry.type !== 'delete'}
                                <div class="flex items-center gap-1.5 text-[10px] font-mono text-muted">
                                    <span>{entry.prevValue}</span>
                                    <span>→</span>
                                    <span class="text-secondary font-bold">{entry.newValue}</span>
                                    {#if entry.delta !== null}
                                        <span class={entry.delta > 0 ? 'text-primary-brand font-semibold' : 'text-secondary-brand font-semibold'}>
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
                            class="px-5 py-2 border border-modal-border hover:bg-subtle-hover text-primary-brand hover:text-primary-brand-active rounded-xl font-bold transition-all text-xs cursor-pointer active:scale-[0.98] shadow-sm"
                    >
                        {t('history.loadMore')}
                    </button>
                </div>
            {/if}
        {/if}
    </div>
</Modal>
