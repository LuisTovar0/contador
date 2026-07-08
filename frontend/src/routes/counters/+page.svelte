<script lang="ts">
  import { i18n, t, STORAGE_KEYS } from '$lib';
  import CounterCard from '$lib/components/counter/CounterCard.svelte';
  import CounterRow from '$lib/components/counter/CounterRow.svelte';
  import CreateCounterModal from '$lib/components/modals/CreateCounterModal.svelte';
  import { dialog } from '$lib/components/modals/dialog.svelte.js';
  import HistoryModal from '$lib/components/modals/HistoryModal.svelte';
  import LogoutWarningModal from '$lib/components/modals/LogoutWarningModal.svelte';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import { tooltip } from '$lib/components/ui/tooltip/tooltip.svelte.js';
  import { isFirebaseConfigured } from '$lib/firebase';
  import { authStore, counterStore, themeStore } from '$lib/store.svelte';
  import {
    History, LayoutGrid, List, LogOut, Moon, PersonStandingIcon, Plus, Search, Sun, User,
  } from 'lucide-svelte';

  // Search state
  let searchQuery = $state('');
  let viewMode = $state<'grid' | 'list'>('grid');

  // Load view mode preference from localStorage on mount
  $effect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
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
    <title>{t('counters.title')}</title>
</svelte:head>

<!-- MAIN APPLICATION WORKFLOW -->
<div class="w-full flex flex-col gap-6">
    <!-- Header -->
    <header class="px-5 py-3.5 rounded-2xl border border-card-border border-t-card-border-t border-l-card-border-l flex items-center justify-between shrink-0 glass-surface shadow-card relative z-20 transition-colors duration-300 ring-1 ring-card-ring overflow-hidden">
        <!-- Specular reflection glass highlight -->
        <div class="absolute inset-0 bg-linear-to-br from-glass-specular via-transparent to-transparent pointer-events-none"></div>
        <div class="flex items-center gap-2 select-none">
            <div>
                <h1 class="text-sm font-black text-primary-brand flex items-center gap-1.5">
                    <span>Contador</span>
                    {#if !isFirebaseConfigured}
                        <span class="text-[9px] bg-primary-badge border border-primary-badge text-primary-brand-subtle font-bold px-2 py-0.5 rounded-md">Demo</span>
                    {/if}
                </h1>
            </div>
        </div>

        <div class="flex items-center gap-1.5">
            <!-- Language Switcher Button -->
            <IconButton
                    tooltip={{ text: t('language.select'), position: 'bottom' }}
                    onclick={() => i18n.setLocale(i18n.locale === 'pt-PT' ? 'en-GB' : 'pt-PT')}
                    class="text-[10px] font-bold"
            >
                <span>{i18n.locale.split('-')[0].toUpperCase()}</span>
            </IconButton>

            <!-- Theme Switcher Button -->
            <IconButton
                    tooltip={{ text: themeStore.current === 'dark' ? t('theme.lightTooltip') : t('theme.darkTooltip'), position: 'bottom' }}
                    onclick={() => themeStore.toggle()}
            >
                {#if themeStore.current === 'dark'}
                    <Moon size={15} />
                {:else}
                    <Sun size={15} />
                {/if}
            </IconButton>

            <!-- Global History Modal Button -->
            <IconButton
                    tooltip={{ text: t('counters.activityLogs'), position: 'bottom' }}
                    onclick={openHistoryModal}
            >
                <History size={15} />
            </IconButton>

            <!-- Account -->
            <IconButton
                    tooltip={{
                        text: authStore.user?.username || (authStore.user?.isAnonymous ? t('auth.guest') : 'User'),
                        position: 'bottom',
                        trigger: 'click'
                    }}
            >
                <User size={15}/>
            </IconButton>

            <!-- Logout Button -->
            <IconButton
                    tooltip={{ text: t('counters.signOut'), position: 'bottom' }}
                    onclick={handleLogout}
                    variant="danger-outline"
            >
                <LogOut size={15} />
            </IconButton>
        </div>
    </header>

    <!-- Toolbar Row (Search and View Switcher) -->
    {#if !counterStore.loading && counterStore.counters.length > 0}
        <div class="flex gap-3 items-center justify-between w-full">
            <!-- Search Input -->
            <div class="relative grow max-w-sm">
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10">
					<Search size={14} />
				</span>
                <input
                        type="text"
                        bind:value={searchQuery}
                        placeholder={t('counters.searchPlaceholder')}
                        class="w-full glass-surface border border-card-border rounded-xl pl-9 pr-3 py-2 text-primary placeholder:text-placeholder focus:outline-none focus:border-primary-500 transition-all focus:ring-1 focus:ring-primary-500/40 text-xs shadow-sm"
                />
            </div>

            <!-- View Controls -->
                <!-- View Mode Toggler (segment control) -->
                <div class="glass-surface p-1 border border-card-border border-t-card-border-t border-l-card-border-l rounded-xl flex items-center shadow-card ring-1 ring-card-ring">
                    <button
                            onclick={() => {
							viewMode = 'grid';
							localStorage.setItem(STORAGE_KEYS.VIEW_MODE, 'grid');
						}}
                            class="p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center
						{viewMode === 'grid'
							? 'bg-surface-elevated text-primary-brand shadow-sm border border-control-selected'
							: 'text-zinc-500 hover:text-secondary'}"
                            use:tooltip={t('counters.gridView')}
                    >
                        <LayoutGrid size={14} />
                    </button>
                    <button
                            onclick={() => {
							viewMode = 'list';
							localStorage.setItem(STORAGE_KEYS.VIEW_MODE, 'list');
						}}
                            class="p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center
						{viewMode === 'list'
							? 'bg-surface-elevated text-primary-brand shadow-sm border border-control-selected'
							: 'text-zinc-500 hover:text-secondary'}"
                            use:tooltip={t('counters.listView')}
                    >
                        <List size={14} />
                    </button>
                </div>
        </div>
    {/if}

    <!-- Counters view list container -->
    <div class="flex-1 space-y-6">
        {#if counterStore.loading}
            <!-- Skeleton loading states -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each [ 1, 2, 3 ] as _}
                    <div class="w-full h-44 rounded-2xl border border-skeleton bg-surface-elevated/50 animate-pulse flex flex-col justify-between p-5">
                        <div class="h-4 bg-badge rounded w-1/3"></div>
                        <div class="h-10 bg-badge rounded w-1/2 mx-auto"></div>
                        <div class="h-8 bg-badge rounded w-full"></div>
                    </div>
                {/each}
            </div>
        {:else}
            <!-- Counter Grid or List Switch -->
            {#if viewMode === 'list'}
                <div class="glass-surface border border-card-border border-t-card-border-t border-l-card-border-l rounded-2xl shadow-card overflow-visible flex flex-col relative ring-1 ring-card-ring">
                    <!-- Specular reflection glass highlight -->
                    <div class="absolute inset-0 rounded-2xl bg-linear-to-br from-glass-specular via-transparent to-transparent pointer-events-none"></div>
                    <!-- List Header (Desktop-only header row) -->
                    <div class="hidden md:grid md:grid-cols-[minmax(0,1.25fr)_minmax(7.5rem,1fr)_minmax(15rem,1.25fr)_minmax(8rem,1fr)] items-center gap-x-6 gap-y-4 py-2.5 px-4 bg-surface-muted border-b border-default rounded-t-2xl text-[10px] font-bold text-muted uppercase tracking-wider">
                        <span>{t('counters.counterName')}</span>
                        <span>{t('counters.value')}</span>
                        <span>{t('counters.quickIncrements')}</span>
                        <span class="md:text-right pr-2">{t('counters.actionsControls')}</span>
                    </div>

                    <div class="divide-y divide-default">
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
<div class="fixed bottom-6 right-6 z-20" style="bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));">
    <IconButton
            onclick={openCreateModal}
            variant="primary"
            size="xl"
            shape="circle"
            class="glass-surface bg-primary-icon shadow-md hover:scale-105"
            aria-label={t('counters.createCounter')}
    >
        <Plus size={24} />
    </IconButton>
</div>
