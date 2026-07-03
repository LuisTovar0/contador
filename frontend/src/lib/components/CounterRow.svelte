<script lang="ts">
  import { type Counter, counterStore } from '$lib/store.svelte';
  import {
    Clock, EllipsisVertical, Redo2, Settings, Trash2, Undo2, Keyboard, PenLine
  } from 'lucide-svelte';
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
        ? `Quick incremented by +${ inc } ${ counter.unit }`.trim()
        : `Quick decremented by ${ inc } ${ counter.unit }`.trim();
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
            <span class="text-[10px] text-zinc-405 text-zinc-400 dark:text-zinc-500 md:hidden uppercase tracking-wider font-bold">Value:</span>
            <span
                    class="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-50 tabular-nums transition-all duration-100
				{valPopAnimation ? 'scale-110 text-purple-650 dark:text-purple-400' : 'scale-100'}"
            >
				{formatVal(counter.value)}
			</span>
        </div>

        <!-- Quick Adjustments -->
        <div class="flex items-center gap-1.5 w-auto flex-wrap">
            <span class="text-[10px] text-zinc-405 text-zinc-400 dark:text-zinc-500 md:hidden uppercase tracking-wider font-bold mr-1">Adjust:</span>
            {#each counter.increments as inc}
                <div class="flex items-center gap-1 shrink-0">
                    <button
                            onclick={() => handleQuickIncrement(-Math.abs(inc))}
                            class="px-2.5 py-1 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg font-semibold transition-all active:translate-y-[0.5px] cursor-pointer
						bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/10 hover:border-purple-200 dark:hover:border-purple-900/30 hover:text-purple-650 dark:hover:text-purple-400 hover:shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                    >
                        -{inc}
                    </button>
                    <button
                            onclick={() => handleQuickIncrement(Math.abs(inc))}
                            class="px-2.5 py-1 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg font-semibold transition-all active:translate-y-[0.5px] cursor-pointer
						bg-zinc-50 dark:bg-zinc-955 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 hover:border-emerald-200 dark:hover:border-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-[0_0_12px_rgba(34,197,94,0.15)]"
                    >
                        +{inc}
                    </button>
                </div>
            {/each}
        </div>

        <!-- Actions & System Controls -->
        <div class="flex items-center gap-1.5 justify-end w-auto shrink-0">
            <!-- Undo -->
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

            <!-- Redo -->
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

            <!-- Actions Menu Dropdown -->
            <div class="relative" bind:this={menuContainer}>
                <IconButton
                        onclick={() => (showActionMenu = !showActionMenu)}
                        tooltip="More Actions"
                        variant="outline"
                        size="sm"
                        shape="square"
                >
                    <EllipsisVertical size={13} />
                </IconButton>

                {#if showActionMenu}
                    <div class="absolute right-0 mt-1.5 w-48 rounded-xl border border-zinc-200/80 dark:border-purple-500/20 bg-white/95 dark:bg-zinc-955/95 backdrop-blur-md shadow-lg dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] z-50 overflow-hidden flex flex-col py-1">
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
                            <span>Custom Adjust</span>
                        </button>

                        <!-- Set Value -->
                        <button
                                type="button"
                                onclick={() => {
								openSetExactValue();
								showActionMenu = false;
							}}
                                class="w-full text-left px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-100 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Keyboard size={13} class="text-zinc-400 dark:text-zinc-555" />
                            <span>Set Exact Value</span>
                        </button>

                        <!-- Toggle History -->
                        <button
                                type="button"
                                onclick={() => {
								openHistory();
								showActionMenu = false;
							}}
                                class="w-full text-left px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-955 dark:hover:text-zinc-100 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Clock size={13} class="text-zinc-400 dark:text-zinc-500" />
                            <span>View Activity Log</span>
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
                            <span>Settings</span>
                        </button>

                        <div class="h-px bg-zinc-100 dark:bg-zinc-800/80 my-1"></div>

                        <!-- Delete -->
                        <button
                                type="button"
                                onclick={() => {
								openDeleteConfirm();
								showActionMenu = false;
							}}
                                class="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Trash2 size={13} />
                            <span>Delete Counter</span>
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
