<script lang="ts">
  import { type Counter, counterStore } from '$lib/store.svelte';
  import {
    Clock, EllipsisVertical, Redo2, Settings, Trash2, Undo2, Keyboard, PenLine
  } from 'lucide-svelte';
  import { dialog } from '$lib/components/modals/dialog.svelte.js';
  import { t } from '$lib';

  import HistoryModal from '$lib/components/modals/HistoryModal.svelte';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import SetExactValueModal from '$lib/components/modals/SetExactValueModal.svelte';
  import CustomAdjustModal from '$lib/components/modals/CustomAdjustModal.svelte';
  import DeleteConfirmModal from '$lib/components/modals/DeleteConfirmModal.svelte';
  import SettingsModal from '$lib/components/modals/SettingsModal.svelte';

  interface Props {
    counter: Counter;
  }

  let { counter }: Props = $props();

  // Dropdown state
  let showActionMenu = $state(false);
  let menuContainer = $state<HTMLDivElement | null>(null);

  // Animations
  let valPopAnimation = $state(false);

  function formatVal(val: number) {
    return val.toFixed(counter.decimals);
  }

  function triggerValuePop() {
    valPopAnimation = true;
    setTimeout(() => {
      valPopAnimation = false;
    }, 180);
  }

  async function handleQuickIncrement(inc: number) {
    triggerValuePop();
    const finalVal = counter.value + inc;
    const desc = inc >= 0
        ? t('log.quickInc', { val: inc, unit: counter.unit })
        : t('log.quickDec', { val: Math.abs(inc), unit: counter.unit });
    await counterStore.updateCounterValue(counter.id, finalVal, desc, false, 'Quick Adjust');
  }

  function openSettings() {
    dialog.open(SettingsModal, { counter });
  }

  function openDeleteConfirm() {
    dialog.open(DeleteConfirmModal, { counter });
  }

  async function openCustomAdjust() {
    const applied = await dialog.open(CustomAdjustModal, { counter });
    if (applied) {
      triggerValuePop();
    }
  }

  function openSetExactValue() {
    dialog.open(SetExactValueModal, { counter });
  }

  function openHistory() {
    dialog.open(HistoryModal, { counterId: counter.id });
  }
</script>

<svelte:window onclick={(e) => {
	if (showActionMenu && menuContainer && !menuContainer.contains(e.target as Node)) {
		showActionMenu = false;
	}
}} />

<div class="border-b border-zinc-200 dark:border-zinc-800/80 last:border-b-0">
    <!-- Main Row -->
    <div class="grid grid-cols-[1fr_auto] md:grid-cols-[2.5fr_1fr_1.8fr_1.5fr] items-center gap-x-4 gap-y-2.5 md:gap-4 py-3 px-4 md:py-3.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
        <!-- Name & Unit -->
        <div class="min-w-0 flex flex-row items-center gap-1.5 w-auto">
			<span class="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
				{counter.name}
			</span>
            {#if counter.unit}
				<span class="inline-block w-fit text-[8px] font-bold text-zinc-500 dark:text-zinc-450 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 px-1.5 py-0.5 rounded-md uppercase tracking-wider select-none shrink-0">
					{counter.unit}
				</span>
            {/if}
        </div>

        <!-- Current Value -->
        <div class="flex items-center gap-2 select-none justify-end w-auto">
            <span class="text-[10px] text-zinc-405 text-zinc-400 dark:text-zinc-550 md:hidden uppercase tracking-wider font-bold">{t('counters.valueLabel')}</span>
            <span
                    class="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-550 tabular-nums transition-all duration-100
				{valPopAnimation ? 'scale-110 text-primary-600 dark:text-primary-400' : 'scale-100'}"
            >
				{formatVal(counter.value)}
			</span>
        </div>

        <!-- Quick Adjustments -->
        <div class="flex items-center gap-1.5 w-auto flex-wrap">
            <span class="text-[10px] text-zinc-405 text-zinc-400 dark:text-zinc-550 md:hidden uppercase tracking-wider font-bold mr-1">{t('counters.adjust')}</span>
            {#each counter.increments as inc}
                <div class="flex items-center gap-1 shrink-0">
                    <button
                            onclick={() => handleQuickIncrement(-Math.abs(inc))}
                            class="relative overflow-hidden px-2.5 py-1 text-xs border border-secondary-200/50 dark:border-secondary-900/30 border-t-secondary-100/50 dark:border-t-secondary-400/25 border-l-secondary-100/50 dark:border-l-secondary-400/25 rounded-lg font-semibold transition-all active:translate-y-[0.5px] cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
						bg-secondary-500/5 dark:bg-secondary-500/10 text-secondary-700 dark:text-secondary-400 hover:bg-secondary-500/15 dark:hover:bg-secondary-500/20 hover:border-secondary-300 dark:hover:border-secondary-700/50 hover:shadow-secondary-glow"
                    >
                        <span class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></span>
                        <span class="relative z-10">-{inc}</span>
                    </button>
                    <button
                            onclick={() => handleQuickIncrement(Math.abs(inc))}
                            class="relative overflow-hidden px-2.5 py-1 text-xs border border-primary-200/50 dark:border-primary-900/30 border-t-primary-100/50 dark:border-t-primary-400/25 border-l-primary-100/50 dark:border-l-primary-400/25 rounded-lg font-semibold transition-all active:translate-y-[0.5px] cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
						bg-primary-500/5 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 hover:bg-primary-500/15 dark:hover:bg-primary-500/20 hover:border-primary-300 dark:hover:border-primary-700/50 hover:shadow-primary-glow"
                    >
                        <span class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></span>
                        <span class="relative z-10">+{inc}</span>
                    </button>
                </div>
            {/each}
        </div>

        <!-- Actions & System Controls -->
        <div class="flex items-center gap-1.5 justify-end w-auto shrink-0">
            <!-- Undo -->
            <IconButton
                    tooltip={t('counters.undoTooltip')}
                    onclick={() => counterStore.undoCounter(counter.id)}
                    disabled={!counterStore.canUndoCounter(counter.id)}
                    variant="outline"
                    size="sm"
                    shape="square"
            >
                <Undo2 size={13} />
            </IconButton>

            <!-- Redo -->
            <IconButton
                    tooltip={t('counters.redoTooltip')}
                    onclick={() => counterStore.redoCounter(counter.id)}
                    disabled={!counterStore.canRedoCounter(counter.id)}
                    variant="outline"
                    size="sm"
                    shape="square"
            >
                <Redo2 size={13} />
            </IconButton>

            <!-- Actions Menu Dropdown -->
            <div class="relative" bind:this={menuContainer}>
                <IconButton
                        onclick={() => (showActionMenu = !showActionMenu)}
                        tooltip={t('counters.moreActions')}
                        variant="outline"
                        size="sm"
                        shape="square"
                >
                    <EllipsisVertical size={13} />
                </IconButton>

                {#if showActionMenu}
                    <div class="absolute right-0 mt-1.5 w-48 rounded-xl border border-zinc-200/55 dark:border-primary-500/20 border-t-white/80 border-l-white/80 dark:border-t-white/18 dark:border-l-white/18 bg-white/55 dark:bg-black/75 backdrop-blur-xl shadow-[0_10px_30px_rgba(9,9,11,0.08),_inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35),_inset_0_1px_0_rgba(255,255,255,0.12)] z-50 overflow-hidden flex flex-col py-1 ring-1 ring-black/5 dark:ring-white/5">
                        <!-- Specular reflection glass highlight -->
                        <div class="absolute inset-0 bg-gradient-to-br from-white/35 dark:from-white/12 via-transparent to-transparent pointer-events-none"></div>
                        <!-- Adjust Custom -->
                        <button
                                type="button"
                                onclick={() => {
								openCustomAdjust();
								showActionMenu = false;
							}}
                                class="w-full text-left px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-100 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <PenLine size={13} class="text-zinc-400 dark:text-zinc-500" />
                            <span>{t('counters.customAdjust')}</span>
                        </button>

                        <!-- Set Value -->
                        <button
                                type="button"
                                onclick={() => {
								openSetExactValue();
								showActionMenu = false;
							}}
                                class="w-full text-left px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-355 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-100 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Keyboard size={13} class="text-zinc-400 dark:text-zinc-555" />
                            <span>{t('counters.setExactValue')}</span>
                        </button>

                        <!-- Toggle History -->
                        <button
                                type="button"
                                onclick={() => {
								openHistory();
								showActionMenu = false;
							}}
                                class="w-full text-left px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-355 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-955 dark:hover:text-zinc-100 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Clock size={13} class="text-zinc-400 dark:text-zinc-500" />
                            <span>{t('counters.viewActivityLog')}</span>
                        </button>

                        <!-- Settings -->
                        <button
                                type="button"
                                onclick={() => {
								openSettings();
								showActionMenu = false;
							}}
                                class="w-full text-left px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-355 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-955 dark:hover:text-zinc-100 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Settings size={13} class="text-zinc-400 dark:text-zinc-500" />
                            <span>{t('counters.settingsTooltip')}</span>
                        </button>

                        <div class="h-px bg-zinc-100 dark:bg-zinc-800/80 my-1"></div>

                        <!-- Delete -->
                        <button
                                type="button"
                                onclick={() => {
								openDeleteConfirm();
								showActionMenu = false;
							}}
                                class="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-955/20 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Trash2 size={13} />
                            <span>{t('counters.deleteCounter')}</span>
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
