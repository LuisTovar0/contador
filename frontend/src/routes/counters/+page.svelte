<script lang="ts">
  import CounterCard from '$lib/components/CounterCard.svelte';
  import CounterRow from '$lib/components/CounterRow.svelte';
  import CreateCounterModal from '$lib/components/CreateCounterModal.svelte';
  import LogoutWarningModal from '$lib/components/LogoutWarningModal.svelte';
  import HistoryModal from '$lib/components/HistoryModal.svelte';
  import IconButton from '$lib/components/IconButton.svelte';
  import { tooltip } from '$lib/components/tooltip.svelte.js';
  import { isFirebaseConfigured } from '$lib/firebase';
  import { authStore, counterStore, themeStore } from '$lib/store.svelte';
  import { dialog } from '$lib/dialog.svelte';
  import {
    CheckCircle2, History, LayoutGrid, List, LogOut, Moon, Plus, RotateCcw, Search, Sun,
  } from 'lucide-svelte';

  // Search state
  let searchQuery = $state('');
  let viewMode = $state<'grid' | 'list'>('grid');

  // Load view mode preference from localStorage on mount
  $effect(() => {
    const saved = localStorage.getItem('contador_view_mode');
    if (saved === 'grid' || saved === 'list') {
      viewMode = saved;
    }
  });


  // Filtered list
  let displayedCounters = $derived.by(() => {
    let list = [ ...counterStore.counters ];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
          (c) =>
              c.name.toLowerCase().includes(q) ||
              (c.unit && c.unit.toLowerCase().includes(q)),
      );
    }

    return list;
  });

  // Inline toast logic for undo
  let lastActionToast = $derived.by(() => {
    const logs = counterStore.history;
    if (logs.length === 0) return null;
    const lastLog = logs[0];
    if (lastLog.type === 'create' || lastLog.type === 'delete') return null;
    return lastLog;
  });

  let showToast = $state(false);
  let toastTimeout: ReturnType<typeof setTimeout>;

  // Show toast whenever last action changes
  $effect(() => {
    const action = lastActionToast;
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

  async function handleLogout() {
    if (authStore.user?.isAnonymous) {
      const confirmed = await dialog.open(LogoutWarningModal);
      if (confirmed) {
        authStore.logout();
      }
    } else {
      authStore.logout();
    }
  }

  function openCreateModal() {
    dialog.open(CreateCounterModal);
  }

  function openHistoryModal() {
    dialog.open(HistoryModal);
  }
</script>

<svelte:head>
    <title>Contadores</title>
</svelte:head>

<!-- MAIN APPLICATION WORKFLOW -->
<div class="w-full flex flex-col gap-6">
    <!-- Header -->
    <header class="px-5 py-3.5 rounded-2xl border border-zinc-200/60 dark:border-purple-500/20 flex items-center justify-between shrink-0 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-sm dark:shadow-[0_0_20px_rgba(168,85,247,0.05)] relative z-20 transition-colors duration-300">
        <div class="flex items-center gap-2 select-none">
            <div>
                <h1 class="text-sm font-black text-purple-650 dark:text-purple-400 flex items-center gap-1.5">
                    <span>Contador</span>
                    {#if !isFirebaseConfigured}
                        <span class="text-[9px] bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 font-bold px-2 py-0.5 rounded-md">Demo</span>
                    {/if}
                </h1>
            </div>
        </div>

        <div class="flex items-center gap-1.5">
            <!-- Theme Switcher Button -->
            <IconButton
                    tooltip={{ text: themeStore.current === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode', position: 'bottom' }}
                    onclick={() => themeStore.toggle()}
                    variant="outline"
                    size="lg"
                    shape="square"
            >
                {#if themeStore.current === 'dark'}
                    <Sun size={15} />
                {:else}
                    <Moon size={15} />
                {/if}
            </IconButton>


            <!-- Global History Modal Button -->
            <IconButton
                    tooltip={{ text: 'Activity logs', position: 'bottom' }}
                    onclick={openHistoryModal}
                    variant="outline"
                    size="lg"
                    shape="square"
            >
                <History size={15} />
            </IconButton>

            <!-- Logout Button -->
            <IconButton
                    tooltip={{ text: 'Sign Out', position: 'bottom' }}
                    onclick={handleLogout}
                    variant="danger-outline"
                    size="lg"
                    shape="square"
            >
                <LogOut size={15} />
            </IconButton>
        </div>
    </header>

    <!-- Toolbar Row (Search and View Switcher) -->
    {#if !counterStore.loading && counterStore.counters.length > 0}
        <div class="flex flex-col sm:flex-row gap-3 items-center justify-between w-full">
            <!-- Search Input -->
            <div class="relative w-full sm:max-w-xs">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-405 dark:text-zinc-500">
					<Search size={14} />
				</span>
                <input
                        type="text"
                        bind:value={searchQuery}
                        placeholder="Search counters..."
                        class="w-full bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/60 dark:border-purple-500/20 rounded-xl pl-9 pr-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-405 dark:placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/40 text-xs shadow-sm"
                />
            </div>

            <!-- View Controls -->
            <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <!-- View Mode Toggler (segment control) -->
                <div class="bg-zinc-200/40 dark:bg-zinc-950/40 p-1 border border-zinc-250 dark:border-purple-500/10 rounded-xl flex items-center shadow-sm">
                    <button
                            onclick={() => {
							viewMode = 'grid';
							localStorage.setItem('contador_view_mode', 'grid');
						}}
                            class="p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center
						{viewMode === 'grid'
							? 'bg-white dark:bg-zinc-900 text-purple-655 dark:text-purple-400 shadow-sm border border-zinc-200/65 dark:border-purple-500/30'
							: 'text-zinc-450 hover:text-zinc-750 dark:hover:text-zinc-300'}"
                            use:tooltip={"Grid view"}
                    >
                        <LayoutGrid size={14} />
                    </button>
                    <button
                            onclick={() => {
							viewMode = 'list';
							localStorage.setItem('contador_view_mode', 'list');
						}}
                            class="p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center
						{viewMode === 'list'
							? 'bg-white dark:bg-zinc-900 text-purple-655 dark:text-purple-400 shadow-sm border border-zinc-200/65 dark:border-purple-500/30'
							: 'text-zinc-450 hover:text-zinc-755 dark:hover:text-zinc-300'}"
                            use:tooltip={"List view"}
                    >
                        <List size={14} />
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <!-- Counters view list container -->
    <div class="flex-1 space-y-6">
        {#if counterStore.loading}
            <!-- Skeleton loading states -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each [ 1, 2, 3 ] as _}
                    <div class="w-full h-44 rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900/50 animate-pulse flex flex-col justify-between p-5">
                        <div class="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
                        <div class="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 mx-auto"></div>
                        <div class="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                    </div>
                {/each}
            </div>
        {:else}
            <!-- Counter Grid or List Switch -->
            {#if viewMode === 'list'}
                <div class="bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-purple-500/20 rounded-2xl shadow-sm overflow-hidden flex flex-col backdrop-blur-md">
                    <!-- List Header (Desktop-only header row) -->
                    <div class="hidden md:grid md:grid-cols-[2.5fr_1fr_1.8fr_1.5fr] items-center gap-4 py-2.5 px-4 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        <span>Counter Name</span>
                        <span class="md:text-right pr-2">Value</span>
                        <span>Quick Increments</span>
                        <span class="md:text-right pr-2">Actions & Controls</span>
                    </div>

                    <div class="divide-y divide-zinc-100 dark:divide-zinc-850">
                        {#each displayedCounters as counter (counter.id)}
                            <CounterRow {counter} />
                        {/each}
                    </div>
                </div>
            {:else}
                <!-- Responsive Grid counters list -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {#each displayedCounters as counter (counter.id)}
                        <CounterCard {counter} />
                    {/each}
                </div>
            {/if}
        {/if}
    </div>
</div>

<!-- Floating action button to Add Counter -->
<div class="fixed bottom-6 right-6 z-20">
    <IconButton
            onclick={openCreateModal}
            variant="primary"
            size="xl"
            shape="circle"
            class="shadow-md hover:scale-105"
            aria-label="Create new counter"
    >
        <Plus size={24} />
    </IconButton>
</div>

<!-- BOTTOM TOAST NOTIFICATION (Undo HUD) -->
{#if showToast && lastActionToast}
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2.5rem)] max-w-sm px-4 py-3 bg-white/80 dark:bg-zinc-900/70 border border-zinc-200/60 dark:border-purple-500/20 rounded-xl shadow-xl backdrop-blur-md flex items-center justify-between gap-3 text-xs leading-normal">
        <div class="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 min-w-0">
            <CheckCircle2 size={16} class="text-emerald-500 shrink-0" />
            <p class="truncate font-medium">{lastActionToast?.description}</p>
        </div>
        <button
                onclick={handleUndo}
                class="text-purple-650 dark:text-purple-400 hover:underline font-bold flex items-center gap-1 cursor-pointer shrink-0 uppercase tracking-wider text-[10px]"
        >
            <RotateCcw size={10} />
            <span>Undo</span>
        </button>
    </div>
{/if}
