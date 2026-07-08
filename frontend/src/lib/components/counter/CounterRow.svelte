<script lang="ts">
  import { t, TIMING } from '$lib';
  import CreateCounterModal from '$lib/components/modals/CreateCounterModal.svelte';
  import CustomAdjustModal from '$lib/components/modals/CustomAdjustModal.svelte';
  import DeleteConfirmModal from '$lib/components/modals/DeleteConfirmModal.svelte';
  import { dialog } from '$lib/components/modals/dialog.svelte.js';

  import HistoryModal from '$lib/components/modals/HistoryModal.svelte';
  import SetExactValueModal from '$lib/components/modals/SetExactValueModal.svelte';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import { type Counter, counterStore } from '$lib/store.svelte';
  import { Clock, EllipsisVertical, Keyboard, PenLine, Redo2, Settings, Trash2, Undo2 } from 'lucide-svelte';

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
    }, TIMING.VALUE_POP_ANIMATION_MS);
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
    dialog.open(CreateCounterModal, { counter });
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

<div class="border-b border-default/80 last:border-b-0">
    <!-- Main Row -->
    <div class="grid grid-cols-[1fr_auto] md:grid-cols-[minmax(0,1.25fr)_minmax(7.5rem,1fr)_minmax(15rem,1.25fr)_minmax(8rem,1fr)] items-center gap-x-4 gap-y-2.5 md:gap-x-6 md:gap-y-4 py-3 px-4 md:py-3.5 hover:bg-row-hover transition-colors">
        <!-- Name & Unit -->
        <div class="min-w-0 flex flex-row items-center gap-1.5 w-auto">
			<span class="font-semibold text-sm text-primary truncate">
				{counter.name}
			</span>
        </div>

        <!-- Current Value -->
        <div class="flex items-center gap-2 select-none justify-end md:justify-start w-auto">
            <span class="text-[10px] text-muted md:hidden uppercase tracking-wider font-bold">{t('counters.valueLabel')}</span>
            <span
                    class="flex justify-center md:justify-start gap-3 font-mono text-lg font-bold text-primary tabular-nums transition-all duration-100
				{valPopAnimation ? 'scale-110 text-primary-brand' : 'scale-100'}"
            >
                <span>{formatVal(counter.value)}</span>
                <span class="">
                    {counter.unit}
                </span>
			</span>
        </div>

        <!-- Quick Adjustments -->
        <div class="flex items-center gap-1.5 w-auto flex-wrap">
            <span class="text-[10px] text-muted md:hidden uppercase tracking-wider font-bold mr-1">{t('counters.adjust')}</span>
            {#each counter.increments as inc}
                <div class="flex items-center gap-1 shrink-0">
                    <button
                            onclick={() => handleQuickIncrement(-Math.abs(inc))}
                            class="relative overflow-hidden px-2.5 py-1 text-xs border border-secondary-subtle border-t-secondary-subtle border-l-secondary-subtle rounded-lg font-semibold transition-all active:translate-y-[0.5px] cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.02),var(--btn-outline-inset-shadow)]
						bg-secondary-soft text-secondary-brand hover:bg-secondary-soft-hover hover:border-secondary-hover hover:shadow-secondary-glow"
                    >
                        <span class="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent pointer-events-none"></span>
                        <span class="relative z-10">-{inc}</span>
                    </button>
                    <button
                            onclick={() => handleQuickIncrement(Math.abs(inc))}
                            class="relative overflow-hidden px-2.5 py-1 text-xs border border-primary-subtle border-t-primary-subtle border-l-primary-subtle rounded-lg font-semibold transition-all active:translate-y-[0.5px] cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.02),var(--btn-outline-inset-shadow)]
						bg-primary-soft text-primary-brand-subtle hover:bg-primary-soft-hover hover:border-primary-hover hover:shadow-primary-glow"
                    >
                        <span class="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent pointer-events-none"></span>
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
                    size="sm"
            >
                <Undo2 size={13} />
            </IconButton>

            <!-- Redo -->
            <IconButton
                    tooltip={t('counters.redoTooltip')}
                    onclick={() => counterStore.redoCounter(counter.id)}
                    disabled={!counterStore.canRedoCounter(counter.id)}
                    size="sm"
            >
                <Redo2 size={13} />
            </IconButton>

            <!-- Actions Menu Dropdown -->
            <div class="relative" bind:this={menuContainer}>
                <IconButton
                        onclick={() => (showActionMenu = !showActionMenu)}
                        tooltip={t('counters.moreActions')}
                        size="sm"
                >
                    <EllipsisVertical size={13} />
                </IconButton>

                {#if showActionMenu}
                    <div class="absolute right-0 mt-1.5 w-48 rounded-xl border border-card-border border-t-card-border-t border-l-card-border-l glass-surface shadow-card z-50 overflow-hidden flex flex-col py-1 ring-1 ring-card-ring">
                        <!-- Specular reflection glass highlight -->
                        <div class="absolute inset-0 bg-gradient-to-br from-glass-specular via-transparent to-transparent pointer-events-none"></div>
                        <!-- Adjust Custom -->
                        <button
                                type="button"
                                onclick={() => {
								openCustomAdjust();
								showActionMenu = false;
							}}
                                class="w-full text-left px-3.5 py-2 text-xs font-semibold text-secondary hover:bg-surface-hover hover:text-primary transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <PenLine size={13} class="text-muted" />
                            <span>{t('counters.customAdjust')}</span>
                        </button>

                        <!-- Set Value -->
                        <button
                                type="button"
                                onclick={() => {
								openSetExactValue();
								showActionMenu = false;
							}}
                                class="w-full text-left px-3.5 py-2 text-xs font-semibold text-secondary hover:bg-surface-hover hover:text-primary transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Keyboard size={13} class="text-muted" />
                            <span>{t('counters.setExactValue')}</span>
                        </button>

                        <!-- Toggle History -->
                        <button
                                type="button"
                                onclick={() => {
								openHistory();
								showActionMenu = false;
							}}
                                class="w-full text-left px-3.5 py-2 text-xs font-semibold text-secondary hover:bg-surface-hover hover:text-primary transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Clock size={13} class="text-muted" />
                            <span>{t('counters.viewActivityLog')}</span>
                        </button>

                        <!-- Settings -->
                        <button
                                type="button"
                                onclick={() => {
								openSettings();
								showActionMenu = false;
							}}
                                class="w-full text-left px-3.5 py-2 text-xs font-semibold text-secondary hover:bg-surface-hover hover:text-primary transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Settings size={13} class="text-muted" />
                            <span>{t('counters.settingsTooltip')}</span>
                        </button>

                        <div class="h-px bg-menu-divider my-1"></div>

                        <!-- Delete -->
                        <button
                                type="button"
                                onclick={() => {
								openDeleteConfirm();
								showActionMenu = false;
							}}
                                class="w-full text-left px-3.5 py-2 text-xs font-bold text-error hover:bg-danger-hover transition-all flex items-center gap-2 cursor-pointer"
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
