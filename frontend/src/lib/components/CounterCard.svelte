<script lang="ts">
  import { type Counter, counterStore } from '$lib/store.svelte';
  import { Clock, Redo2, Settings, Trash2, Undo2 } from 'lucide-svelte';
  import { dialog } from '$lib/dialog.svelte';
  import HistoryModal from './HistoryModal.svelte';
  import IconButton from './IconButton.svelte';
  import SetExactValueModal from './SetExactValueModal.svelte';
  import CustomAdjustModal from './CustomAdjustModal.svelte';
  import DeleteConfirmModal from './DeleteConfirmModal.svelte';
  import SettingsModal from './SettingsModal.svelte';

  interface Props {
    counter: Counter;
  }

  let { counter }: Props = $props();

  // Animations
  let valPopAnimation = $state(false);

  // Filter history specifically for this counter
  let localHistory = $derived(() => {
    return counterStore.history.filter((h) => h.counterId === counter.id).slice(0, 5);
  });

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
        ? `Quick incremented by +${ inc } ${ counter.unit }`.trim()
        : `Quick decremented by ${ inc } ${ counter.unit }`.trim();
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
        class="relative overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-purple-500/20 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-5 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500/40 dark:hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] transition-all duration-300 flex flex-col gap-4"
>
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
                    tooltip="Undo last action"
                    onclick={() => counterStore.undoCounter(counter.id)}
                    disabled={!counterStore.canUndoCounter(counter.id)}
                    variant="outline"
                    size="sm"
                    shape="square"
            >
                <Undo2 size={13} />
            </IconButton>

            <!-- Redo button -->
            <IconButton
                    tooltip="Redo last action"
                    onclick={() => counterStore.redoCounter(counter.id)}
                    disabled={!counterStore.canRedoCounter(counter.id)}
                    variant="outline"
                    size="sm"
                    shape="square"
            >
                <Redo2 size={13} />
            </IconButton>

            <!-- Settings button -->
            <IconButton
                    tooltip="Counter Settings"
                    onclick={openSettings}
                    variant="outline"
                    size="sm"
                    shape="square"
            >
                <Settings size={13} />
            </IconButton>

            <!-- Delete button -->
            <IconButton
                    tooltip="Delete counter"
                    onclick={openDeleteConfirm}
                    variant="danger-outline"
                    size="sm"
                    shape="square"
            >
                <Trash2 size={13} />
            </IconButton>
        </div>
    </div>

    <!-- Value display -->
    <div class="flex flex-col items-center justify-center py-3 select-none">
        <div
                class="flex justify-center gap-3 text-5xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-550 tabular-nums transition-all duration-100 drop-shadow-[0_0_8px_rgba(168,85,247,0.05)] dark:drop-shadow-[0_0_15px_rgba(168,85,247,0.15)]
			{valPopAnimation ? 'scale-105 text-purple-650 dark:text-purple-400' : 'scale-100'}"
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
                        class="py-2 px-3 border border-zinc-200 dark:border-zinc-800 rounded-xl font-semibold transition-all text-xs flex items-center justify-center gap-1 active:translate-y-px active:shadow-none shadow-sm cursor-pointer
					bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/10 hover:border-purple-200 dark:hover:border-purple-900/30 hover:text-purple-655 dark:hover:text-purple-400 hover:shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                >
                    <span>-{Math.abs(inc)}</span>
                </button>
                <!-- Increment -->
                <button
                        onclick={() => handleQuickIncrement(Math.abs(inc))}
                        class="py-2 px-3 border border-zinc-200 dark:border-zinc-800 rounded-xl font-semibold transition-all text-xs flex items-center justify-center gap-1 active:translate-y-px active:shadow-none shadow-sm cursor-pointer
					bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 hover:border-emerald-200 dark:hover:border-emerald-900/30 hover:text-emerald-655 dark:hover:text-emerald-400 hover:shadow-[0_0_12px_rgba(34,197,94,0.15)]"
                >
                    <span>+{Math.abs(inc)}</span>
                </button>
            {/each}

            <!-- Custom adjustments button -->
            <button
                    onclick={openCustomAdjust}
                    class="w-full py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-955 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 rounded-xl font-medium transition-all text-xs flex items-center justify-center gap-1.5 active:translate-y-px cursor-pointer"
            >
                <span>Custom Adjust</span>
            </button>

            <!-- Set value -->
            <button
                    onclick={openSetExactValue}
                    class="w-full py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-955 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 rounded-xl font-medium transition-all text-xs flex items-center justify-center gap-1.5 active:translate-y-px cursor-pointer"
            >
                <span>Set Value</span>
            </button>
        </div>
    </div>

    <!-- Card History Button -->
    <div class="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 pt-2.5 mt-1">
        <button
                onclick={openHistory}
                class="text-[10px] font-semibold text-zinc-450 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350 transition-colors flex items-center gap-1 cursor-pointer"
        >
            <Clock size={10} />
            <span>View Activity Log</span>
        </button>
        {#if localHistory().length > 0}
			<span class="text-[8px] font-mono text-zinc-400 dark:text-zinc-650">
				Last: {formatTime(localHistory()[0].timestamp)}
			</span>
        {/if}
    </div>
</div>
