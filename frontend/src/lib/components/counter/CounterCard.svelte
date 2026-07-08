<script lang="ts">
  import { type Counter, counterStore } from '$lib/store.svelte';
  import { Clock, Redo2, Settings, Trash2, Undo2 } from 'lucide-svelte';
  import { dialog } from '$lib/components/modals/dialog.svelte.js';
  import { t, APP_LIMITS, TIMING } from '$lib';

  import HistoryModal from '$lib/components/modals/HistoryModal.svelte';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import SetExactValueModal from '$lib/components/modals/SetExactValueModal.svelte';
  import CustomAdjustModal from '$lib/components/modals/CustomAdjustModal.svelte';
  import DeleteConfirmModal from '$lib/components/modals/DeleteConfirmModal.svelte';
  import CreateCounterModal from '$lib/components/modals/CreateCounterModal.svelte';

  interface Props {
    counter: Counter;
  }

  let { counter }: Props = $props();

  // Animations
  let valPopAnimation = $state(false);

  // Filter history specifically for this counter
  let localHistory = $derived(() => {
    return counterStore.history.filter((h) => h.counterId === counter.id).slice(0, APP_LIMITS.CARD_HISTORY_LIMIT);
  });

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

  function formatTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

<div
        class="group relative overflow-hidden rounded-2xl border border-card-border border-t-card-border-t border-l-card-border-l glass-surface p-5 shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:scale-[1.015] hover:border-card-hover-border transition-all duration-500 flex flex-col gap-4 ring-1 ring-card-ring"
>
    <!-- Specular reflection glass highlight -->
    <div class="absolute inset-0 bg-gradient-to-br from-glass-specular via-transparent to-transparent opacity-80 group-hover:opacity-100 group-hover:from-glass-card-hover-specular group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-all duration-500 pointer-events-none"></div>

    <!-- Shimmer reflection sweep -->
    <div class="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-glass-shimmer to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>
    <!-- Header -->
    <div class="flex items-start justify-between">
        <div class="min-w-0 flex-1 pr-2">
            <h3 class="font-bold text-base text-primary truncate">
                {counter.name}
            </h3>
        </div>

        <div class="flex items-center gap-1 shrink-0">
            <!-- Undo button -->
            <IconButton
                    tooltip={t('counters.undoTooltip')}
                    onclick={() => counterStore.undoCounter(counter.id)}
                    disabled={!counterStore.canUndoCounter(counter.id)}
                    size="sm"
            >
                <Undo2 size={13} />
            </IconButton>

            <!-- Redo button -->
            <IconButton
                    tooltip={t('counters.redoTooltip')}
                    onclick={() => counterStore.redoCounter(counter.id)}
                    disabled={!counterStore.canRedoCounter(counter.id)}
                    size="sm"
            >
                <Redo2 size={13} />
            </IconButton>

            <!-- Settings button -->
            <IconButton
                    tooltip={t('counters.settingsTooltip')}
                    onclick={openSettings}
                    size="sm"
            >
                <Settings size={13} />
            </IconButton>

            <!-- Delete button -->
            <IconButton
                    tooltip={t('counters.deleteTooltip')}
                    onclick={openDeleteConfirm}
                    variant="danger-outline"
                    size="sm"
            >
                <Trash2 size={13} />
            </IconButton>
        </div>
    </div>

    <!-- Value display -->
    <div class="flex flex-col items-center justify-center py-3 select-none">
        <div
                class="flex justify-center gap-3 text-5xl font-mono font-bold tracking-tight text-primary tabular-nums transition-all duration-100 drop-shadow-[var(--value-drop-shadow)]
			{valPopAnimation ? 'scale-105 text-primary-brand' : 'scale-100'}"
        >
            <span>{formatVal(counter.value)}</span>
            <span class="w-min">{counter.unit}</span>
        </div>
    </div>

    <!-- Action Controls -->
    <div class="grid grid-cols-1 gap-2 shrink-0">
        <!-- Default increment/decrement buttons -->
        <div class="grid grid-cols-2 gap-2">
            {#each counter.increments as inc}
                <!-- Decrement -->
                <button
                        onclick={() => handleQuickIncrement(-Math.abs(inc))}
                        class="relative overflow-hidden py-2 px-3 border border-secondary-subtle border-t-secondary-subtle border-l-secondary-subtle rounded-xl font-semibold transition-all text-xs flex items-center justify-center gap-1 active:translate-y-px active:shadow-none shadow-[0_2px_4px_rgba(0,0,0,0.02),var(--btn-outline-inset-shadow)] cursor-pointer
					bg-secondary-soft text-secondary-brand hover:bg-secondary-soft-hover hover:border-secondary-hover hover:shadow-secondary-glow"
                >
                    <span class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></span>
                    <span class="relative z-10">-{Math.abs(inc)}</span>
                </button>
                <!-- Increment -->
                <button
                        onclick={() => handleQuickIncrement(Math.abs(inc))}
                        class="relative overflow-hidden py-2 px-3 border border-primary-subtle border-t-primary-subtle border-l-primary-subtle rounded-xl font-semibold transition-all text-xs flex items-center justify-center gap-1 active:translate-y-px active:shadow-none shadow-[0_2px_4px_rgba(0,0,0,0.02),var(--btn-outline-inset-shadow)] cursor-pointer
					bg-primary-soft text-primary-brand-subtle hover:bg-primary-soft-hover hover:border-primary-hover hover:shadow-primary-glow"
                >
                    <span class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></span>
                    <span class="relative z-10">+{Math.abs(inc)}</span>
                </button>
            {/each}

            <!-- Custom adjustments button -->
            <button
                    onclick={openCustomAdjust}
                    class="w-full py-1.5 border border-default hover:bg-surface-hover text-alt hover:text-primary rounded-xl font-medium transition-all text-xs flex items-center justify-center gap-1.5 active:translate-y-px cursor-pointer"
            >
                <span>{t('counters.customAdjust')}</span>
            </button>

            <!-- Set value -->
            <button
                    onclick={openSetExactValue}
                    class="w-full py-1.5 border border-default hover:bg-surface-hover text-alt hover:text-primary rounded-xl font-medium transition-all text-xs flex items-center justify-center gap-1.5 active:translate-y-px cursor-pointer"
            >
                <span>{t('counters.setValue')}</span>
            </button>
        </div>
    </div>

    <!-- Card History Button -->
    <div class="flex items-center justify-between border-t border-menu-divider pt-2.5 mt-1">
        <button
                onclick={openHistory}
                class="text-[10px] font-semibold text-muted hover:text-secondary transition-colors flex items-center gap-1 cursor-pointer"
        >
            <Clock size={10} />
            <span>{t('counters.viewActivityLog')}</span>
        </button>
        {#if localHistory().length > 0}
			<span class="text-[8px] font-mono text-muted">
				{t('counters.last')} {formatTime(localHistory()[0].timestamp)}
			</span>
        {/if}
    </div>
</div>
