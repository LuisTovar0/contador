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
  import SettingsModal from '$lib/components/modals/SettingsModal.svelte';

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

<div
        class="group relative overflow-hidden rounded-2xl border border-zinc-200/55 dark:border-primary-500/20 border-t-white/80 border-l-white/80 dark:border-t-white/18 dark:border-l-white/18 bg-white/25 dark:bg-black/35 backdrop-blur-xl p-5 shadow-[0_8px_32px_0_rgba(9,9,11,0.06),_inset_0_1px_0_0_rgba(255,255,255,0.6)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37),_inset_0_1px_0_0_rgba(255,255,255,0.12)] hover:shadow-lg hover:-translate-y-1 hover:scale-[1.015] hover:border-primary-300/80 dark:hover:border-primary-500/50 hover:shadow-primary-glow dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),0_0_25px_rgba(16,185,129,0.2),_inset_0_1px_0_0_rgba(255,255,255,0.15)] transition-all duration-500 flex flex-col gap-4 ring-1 ring-black/5 dark:ring-white/5"
>
    <!-- Specular reflection glass highlight -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/35 dark:from-white/12 via-transparent to-transparent opacity-80 group-hover:opacity-100 group-hover:from-white/55 dark:group-hover:from-white/20 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-all duration-500 pointer-events-none"></div>

    <!-- Shimmer reflection sweep -->
    <div class="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/30 dark:via-white/12 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>
    <!-- Header -->
    <div class="flex items-start justify-between">
        <div class="min-w-0 flex-1 pr-2">
            <h3 class="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">
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
                class="flex justify-center gap-3 text-5xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums transition-all duration-100 drop-shadow-[0_0_8px_rgba(16,185,129,0.08)] dark:drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]
			{valPopAnimation ? 'scale-105 text-primary-600 dark:text-primary-400' : 'scale-100'}"
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
                        class="relative overflow-hidden py-2 px-3 border border-secondary-200/50 dark:border-secondary-900/30 border-t-secondary-100/50 dark:border-t-secondary-400/25 border-l-secondary-100/50 dark:border-l-secondary-400/25 rounded-xl font-semibold transition-all text-xs flex items-center justify-center gap-1 active:translate-y-px active:shadow-none shadow-[0_2px_4px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] cursor-pointer
					bg-secondary-500/5 dark:bg-secondary-500/10 text-secondary-700 dark:text-secondary-400 hover:bg-secondary-500/15 dark:hover:bg-secondary-500/20 hover:border-secondary-300 dark:hover:border-secondary-700/50 hover:shadow-secondary-glow"
                >
                    <span class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></span>
                    <span class="relative z-10">-{Math.abs(inc)}</span>
                </button>
                <!-- Increment -->
                <button
                        onclick={() => handleQuickIncrement(Math.abs(inc))}
                        class="relative overflow-hidden py-2 px-3 border border-primary-200/50 dark:border-primary-900/30 border-t-primary-100/50 dark:border-t-primary-400/25 border-l-primary-100/50 dark:border-l-primary-400/25 rounded-xl font-semibold transition-all text-xs flex items-center justify-center gap-1 active:translate-y-px active:shadow-none shadow-[0_2px_4px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] cursor-pointer
					bg-primary-500/5 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 hover:bg-primary-500/15 dark:hover:bg-primary-500/20 hover:border-primary-300 dark:hover:border-primary-700/50 hover:shadow-primary-glow"
                >
                    <span class="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></span>
                    <span class="relative z-10">+{Math.abs(inc)}</span>
                </button>
            {/each}

            <!-- Custom adjustments button -->
            <button
                    onclick={openCustomAdjust}
                    class="w-full py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 rounded-xl font-medium transition-all text-xs flex items-center justify-center gap-1.5 active:translate-y-px cursor-pointer"
            >
                <span>{t('counters.customAdjust')}</span>
            </button>

            <!-- Set value -->
            <button
                    onclick={openSetExactValue}
                    class="w-full py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 rounded-xl font-medium transition-all text-xs flex items-center justify-center gap-1.5 active:translate-y-px cursor-pointer"
            >
                <span>{t('counters.setValue')}</span>
            </button>
        </div>
    </div>

    <!-- Card History Button -->
    <div class="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 pt-2.5 mt-1">
        <button
                onclick={openHistory}
                class="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
            <Clock size={10} />
            <span>{t('counters.viewActivityLog')}</span>
        </button>
        {#if localHistory().length > 0}
			<span class="text-[8px] font-mono text-zinc-400 dark:text-zinc-500">
				{t('counters.last')} {formatTime(localHistory()[0].timestamp)}
			</span>
        {/if}
    </div>
</div>
