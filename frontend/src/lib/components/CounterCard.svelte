<script lang="ts">
  import { type Counter, counterStore } from '$lib/store.svelte';
  import { Clock, Edit3, Gauge, Hash, Keyboard, Minus, Plus, Redo2, Settings, Trash2, Undo2, X } from 'lucide-svelte';
  import IconButton from './IconButton.svelte';
  import Modal from './Modal.svelte';

  interface Props {
    counter: Counter;
  }

  let { counter }: Props = $props();

  // Modal states
  let showSetValModal = $state(false);
  let showCustomAdjustModal = $state(false);
  let showDeleteConfirm = $state(false);
  let showCardHistory = $state(false);
  let showSettingsModal = $state(false);
  let showStatsModal = $state(false);

  // Form states
  let newValueInput = $state('');
  let customAdjustInput = $state('1');
  let isCustomPositive = $state(true); // true = add, false = subtract

  // Settings edit states
  let editName = $state('');
  let editUnit = $state('');
  let editDecimals = $state(0);
  let editIncrements = $state<number[]>([]);
  let settingsError = $state<string | null>(null);

  // Animations
  let valPopAnimation = $state(false);

  // Sync local inputs when counter changes from other syncs
  $effect(() => {
    if (showSetValModal) {
      newValueInput = counter.value.toString();
    }
  });

  $effect(() => {
    if (showSettingsModal) {
      editName = counter.name;
      editUnit = counter.unit;
      editDecimals = counter.decimals;
      editIncrements = [ ...counter.increments ];
      settingsError = null;
    }
  });

  // Filter history specifically for this counter
  let localHistory = $derived(() => {
    return counterStore.history.filter((h) => h.counterId === counter.id).slice(0, 5);
  });

  let fullHistory = $derived(() => {
    return counterStore.history.filter((h) => h.counterId === counter.id);
  });

  // Compute stats
  let stats = $derived.by(() => {
    const historyList = counterStore.history.filter((h) => h.counterId === counter.id);
    const currentVal = counter.value;
    const decimals = counter.decimals;

    const values = [currentVal, ...historyList.map((h) => h.newValue)];
    const minVal = values.length > 0 ? Math.min(...values) : 0;
    const maxVal = values.length > 0 ? Math.max(...values) : 0;

    const increments = historyList.filter((h) => h.type === 'increment' && h.delta !== null);
    const avgInc = increments.length > 0
      ? parseFloat((increments.reduce((acc, h) => acc + (h.delta ?? 0), 0) / increments.length).toFixed(decimals))
      : 0;

    return {
      totalUpdates: historyList.length,
      minVal,
      maxVal,
      avgInc
    };
  });

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }

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

  async function handleSetExactValue() {
    const parsed = parseFloat(newValueInput);
    if (isNaN(parsed)) return;

    await counterStore.updateCounterValue(
        counter.id,
        parsed,
        `Set value directly to ${ parsed } ${ counter.unit }`.trim(),
        false,
        'Direct Set',
    );
    showSetValModal = false;
  }

  async function handleCustomAdjust() {
    const parsed = parseFloat(customAdjustInput);
    if (isNaN(parsed)) return;

    const delta = isCustomPositive ? parsed : -parsed;
    const finalVal = counter.value + delta;
    const desc = delta >= 0
        ? `Adjusted custom by +${ parsed } ${ counter.unit }`.trim()
        : `Adjusted custom by -${ parsed } ${ counter.unit }`.trim();

    triggerValuePop();
    await counterStore.updateCounterValue(counter.id, finalVal, desc, false, 'Custom Adjust');
    showCustomAdjustModal = false;
  }

  async function handleDelete() {
    await counterStore.deleteCounter(counter.id);
    showDeleteConfirm = false;
  }

  function addEditIncrement() {
    if (editIncrements.length >= 3) return;
    editIncrements = [ ...editIncrements, 1 ];
  }

  function removeEditIncrement(index: number) {
    if (editIncrements.length <= 1) return;
    editIncrements = editIncrements.filter((_, i) => i !== index);
  }

  function updateEditIncrementValue(index: number, val: string) {
    const parsed = parseFloat(val);
    editIncrements[index] = isNaN(parsed) ? 0 : parsed;
  }

  async function handleSaveSettings(e: SubmitEvent) {
    e.preventDefault();
    settingsError = null;

    if (!editName.trim()) {
      settingsError = 'Counter name is required.';
      return;
    }

    if (editIncrements.length < 1 || editIncrements.length > 3) {
      settingsError = 'You must have between 1 and 3 default increments.';
      return;
    }

    try {
      await counterStore.updateCounterSettings(
          counter.id,
          editName.trim(),
          editDecimals,
          editUnit.trim(),
          editIncrements,
      );
      showSettingsModal = false;
    } catch (err: any) {
      settingsError = err.message || 'Failed to update settings.';
    }
  }

  function formatTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div
        class="relative overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-purple-500/20 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md p-5 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] dark:hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] transition-all duration-300 flex flex-col gap-4"
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
                    onclick={() => (showSettingsModal = true)}
                    variant="outline"
                    size="sm"
                    shape="square"
            >
                <Settings size={13} />
            </IconButton>

            <!-- Delete button -->
            <IconButton
                    tooltip="Delete counter"
                    onclick={() => (showDeleteConfirm = true)}
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
                class="text-5xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums transition-all duration-100 drop-shadow-[0_0_8px_rgba(168,85,247,0.05)] dark:drop-shadow-[0_0_15px_rgba(168,85,247,0.15)]
			{valPopAnimation ? 'scale-105 text-purple-650 dark:text-purple-400' : 'scale-100'}"
        >
            {formatVal(counter.value)}{counter.unit}
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
                        class="py-2 px-3 border border-zinc-200 dark:border-zinc-800 rounded-xl font-semibold transition-all text-xs flex items-center justify-center gap-1 active:translate-y-[1px] active:shadow-none shadow-sm cursor-pointer
					bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/10 hover:border-purple-200 dark:hover:border-purple-900/30 hover:text-purple-650 dark:hover:text-purple-400 hover:shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                >
                    <span>-{Math.abs(inc)}</span>
                </button>
                <!-- Increment -->
                <button
                        onclick={() => handleQuickIncrement(Math.abs(inc))}
                        class="py-2 px-3 border border-zinc-200 dark:border-zinc-800 rounded-xl font-semibold transition-all text-xs flex items-center justify-center gap-1 active:translate-y-[1px] active:shadow-none shadow-sm cursor-pointer
					bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 hover:border-emerald-200 dark:hover:border-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-[0_0_12px_rgba(34,197,94,0.15)]"
                >
                    <span>+{Math.abs(inc)}</span>
                </button>
            {/each}

            <!-- Custom adjustments button -->
            <button
                    onclick={() => {
				customAdjustInput = '1';
				showCustomAdjustModal = true;
			}}
                    class="w-full py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 rounded-xl font-medium transition-all text-xs flex items-center justify-center gap-1.5 active:translate-y-[1px] cursor-pointer"
            >
                <span>Custom Adjust</span>
            </button>

            <!-- Set value -->
            <button
                    onclick={() => {
					newValueInput = counter.value.toString();
					showSetValModal = true;
				}}
                    class="w-full py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 rounded-xl font-medium transition-all text-xs flex items-center justify-center gap-1.5 active:translate-y-[1px] cursor-pointer"
            >
                <span>Set Value</span>
            </button>
        </div>
    </div>

    <!-- Inline Card History Toggle -->
    <div class="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 pt-2.5 mt-1">
        <button
                onclick={() => (showCardHistory = !showCardHistory)}
                class="text-[10px] font-semibold text-zinc-450 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350 transition-colors flex items-center gap-1 cursor-pointer"
        >
            <Clock size={10} />
            <span>{showCardHistory ? 'Hide Recent Activity' : 'Show Recent Activity'}</span>
        </button>
        {#if localHistory().length > 0}
			<span class="text-[8px] font-mono text-zinc-400 dark:text-zinc-600">
				Last: {formatTime(localHistory()[0].timestamp)}
			</span>
        {/if}
    </div>

    {#if showCardHistory}
        <div class="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
            {#if localHistory().length === 0}
                <p class="text-[10px] text-zinc-400 dark:text-zinc-600">No changes logged yet.</p>
            {:else}
                {#each localHistory() as entry (entry.id)}
                    <div class="text-[10px] leading-relaxed border-b border-zinc-100 dark:border-zinc-800/40 pb-1.5 last:border-0 last:pb-0 flex items-start justify-between gap-2">
                        <div class="flex flex-col min-w-0">
							<span class="text-zinc-600 dark:text-zinc-400 truncate pr-1">
								{entry.description}
							</span>
                            {#if entry.method}
								<span class="text-[8px] text-zinc-500 dark:text-zinc-550 font-bold uppercase tracking-wider mt-0.5">
									via {entry.method}
								</span>
                            {/if}
                        </div>
                        <span class="text-zinc-400 dark:text-zinc-600 font-mono shrink-0">
							{formatTime(entry.timestamp)}
						</span>
                    </div>
                {/each}
            {/if}
        </div>
    {/if}
</div>

<!-- SET EXACT VALUE MODAL -->
<Modal show={showSetValModal} onclose={() => (showSetValModal = false)}>
    <div class="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-4">
        <h2 class="text-lg font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
            <Keyboard size={18} />
            <span>Set Exact Value</span>
        </h2>
        <button
                onclick={() => (showSetValModal = false)}
                class="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer"
        >
            <X size={18} />
        </button>
    </div>

    <div class="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
            Update the counter <strong class="text-zinc-800 dark:text-zinc-300">"{counter.name}"</strong> directly.
        </p>
        <div>
            <label for="newValue"
                   class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
            >New Value ({counter.unit || 'no unit'})</label
            >
            <input
                    type="number"
                    id="newValue"
                    step={counter.decimals === 0 ? '1' : (1 / Math.pow(10, counter.decimals)).toString()}
                    bind:value={newValueInput}
                    class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50 font-mono text-base"
            />
        </div>
    </div>

    <div class="border-t border-zinc-200 dark:border-white/10 pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
        <button
                type="button"
                onclick={() => (showSetValModal = false)}
                class="px-4 py-2 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold transition-all text-xs cursor-pointer"
        >
            Cancel
        </button>
        <button
                type="button"
                onclick={handleSetExactValue}
                class="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-zinc-100 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-[0_4px_12px_rgba(168,85,247,0.2)] dark:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
        >
            Save Value
        </button>
    </div>
</Modal>

<!-- CUSTOM ADJUSTMENT MODAL -->
<Modal show={showCustomAdjustModal} onclose={() => (showCustomAdjustModal = false)}>
    <div class="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-4">
        <h2 class="text-lg font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
            <Edit3 size={18} />
            <span>Custom Adjustment</span>
        </h2>
        <button
                onclick={() => (showCustomAdjustModal = false)}
                class="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer"
        >
            <X size={18} />
        </button>
    </div>

    <div class="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
            Choose how much to adjust the counter <strong class="text-zinc-800 dark:text-zinc-300">"{counter.name}
            "</strong> by.
        </p>

        <!-- Direction selection -->
        <div class="grid grid-cols-2 gap-2">
            <button
                    type="button"
                    onclick={() => (isCustomPositive = true)}
                    class="py-2.5 border rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer
				{isCustomPositive
					? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-[0_2px_8px_rgba(16,185,129,0.1)] dark:shadow-[0_0_10px_rgba(34,197,94,0.15)]'
					: 'bg-zinc-50 dark:bg-zinc-950/30 border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/10'}"
            >
                <Plus size={14} />
                <span>Increment (+)</span>
            </button>
            <button
                    type="button"
                    onclick={() => (isCustomPositive = false)}
                    class="py-2.5 border rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer
				{!isCustomPositive
					? 'bg-purple-50 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500 text-purple-700 dark:text-purple-300 shadow-[0_2px_8px_rgba(168,85,247,0.1)] dark:shadow-[0_0_10px_rgba(168,85,247,0.15)]'
					: 'bg-zinc-50 dark:bg-zinc-950/30 border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/10'}"
            >
                <Minus size={14} />
                <span>Decrement (-)</span>
            </button>
        </div>

        <div>
            <label for="customAmount"
                   class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
            >Adjustment Amount ({counter.unit || 'no unit'})</label
            >
            <input
                    type="number"
                    id="customAmount"
                    min="0"
                    step={counter.decimals === 0 ? '1' : (1 / Math.pow(10, counter.decimals)).toString()}
                    bind:value={customAdjustInput}
                    class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50 font-mono text-base"
            />
        </div>
    </div>

    <div class="border-t border-zinc-200 dark:border-white/10 pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
        <button
                type="button"
                onclick={() => (showCustomAdjustModal = false)}
                class="px-4 py-2 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold transition-all text-xs cursor-pointer"
        >
            Cancel
        </button>
        <button
                type="button"
                onclick={handleCustomAdjust}
                class="px-5 py-2.5 text-zinc-100 rounded-xl font-bold transition-all text-xs cursor-pointer
			{isCustomPositive ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_12px_rgba(16,185,129,0.2)] dark:shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-purple-600 hover:bg-purple-500 shadow-[0_4px_12px_rgba(168,85,247,0.2)] dark:shadow-[0_0_15px_rgba(168,85,247,0.3)]'}"
        >
            Apply {isCustomPositive ? 'Addition' : 'Subtraction'}
        </button>
    </div>
</Modal>

<!-- DELETE CONFIRMATION MODAL -->
<Modal show={showDeleteConfirm} onclose={() => (showDeleteConfirm = false)}>
    <div class="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-4">
        <h2 class="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <Trash2 size={18} />
            <span>Delete Counter</span>
        </h2>
        <button
                onclick={() => (showDeleteConfirm = false)}
                class="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer"
        >
            <X size={18} />
        </button>
    </div>

    <div class="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        <p class="text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed">
            Are you sure you want to delete <strong class="text-zinc-950 dark:text-zinc-100">"{counter.name}"</strong>?
        </p>
        <p class="text-xs text-zinc-400 dark:text-zinc-500 leading-normal">
            This action cannot be undone. Its counter configuration and value will be permanently deleted, though the
            activity history log will retain the deletion record.
        </p>
    </div>

    <div class="border-t border-zinc-200 dark:border-white/10 pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
        <button
                type="button"
                onclick={() => (showDeleteConfirm = false)}
                class="px-4 py-2 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold transition-all text-xs cursor-pointer"
        >
            Cancel
        </button>
        <button
                type="button"
                onclick={handleDelete}
                class="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-zinc-100 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-[0_4px_12px_rgba(239,68,68,0.2)] dark:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
        >
            Delete Permanently
        </button>
    </div>
</Modal>

<!-- COUNTER SETTINGS MODAL -->
<Modal show={showSettingsModal} onclose={() => (showSettingsModal = false)}>
    <div class="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-4">
        <h2 class="text-lg font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
            <Settings size={18} />
            <span>Counter Settings</span>
        </h2>
        <button
                onclick={() => (showSettingsModal = false)}
                class="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer"
        >
            <X size={18} />
        </button>
    </div>

    <form onsubmit={handleSaveSettings} class="flex-1 flex flex-col min-h-0 text-sm">
        <div class="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
            {#if settingsError}
                <div class="p-3 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 rounded-xl text-xs">
                    {settingsError}
                </div>
            {/if}

            <!-- Counter Name -->
            <div>
                <label for="editCounterName"
                       class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
                >Counter Name *</label
                >
                <input
                        type="text"
                        id="editCounterName"
                        bind:value={editName}
                        placeholder="e.g. Water Intake, Daily Steps"
                        required
                        class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50 text-base md:text-sm"
                />
            </div>

            <!-- Unit -->
            <div>
                <label for="editCounterUnit"
                       class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
                >Unit (free text)</label
                >
                <input
                        type="text"
                        id="editCounterUnit"
                        bind:value={editUnit}
                        placeholder="e.g. Liters, reps, cups, km"
                        class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50 text-base md:text-sm"
                />
            </div>

            <!-- Decimals selection -->
            <div>
				<span class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
                >Decimal Precision</span>
                <div class="grid grid-cols-4 gap-2">
                    {#each [ 0, 1, 2, 3 ] as d}
                        <button
                                type="button"
                                onclick={() => (editDecimals = d)}
                                class="py-2 px-1 rounded-xl border font-semibold transition-all text-center cursor-pointer text-xs
							{editDecimals === d
								? 'bg-purple-50 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500 text-purple-700 dark:text-purple-300 shadow-[0_2px_8px_rgba(168,85,247,0.1)] dark:shadow-[0_0_10px_rgba(168,85,247,0.2)]'
								: 'bg-zinc-50 dark:bg-zinc-950/30 border-zinc-200 dark:border-white/5 text-zinc-400 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/10'}"
                        >
                            {d === 0 ? 'Int' : `.${ '0'.repeat(d) }`}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Default increments -->
            <div>
                <div class="flex items-center justify-between mb-1.5">
					<span class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                    >Default Increments</span>
                    <span class="text-xs text-zinc-400 dark:text-zinc-500">({editIncrements.length}/3 buttons)</span>
                </div>

                <div class="space-y-2.5">
                    {#each editIncrements as value, index}
                        <div class="flex items-center gap-2">
                            <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-white/10 text-purple-600 dark:text-purple-400 font-bold shrink-0 text-xs">
                                #{index + 1}
                            </div>
                            <div class="relative flex-1">
								<span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
									<Hash size={14} />
								</span>
                                <input
                                        type="number"
                                        step={editDecimals === 0 ? '1' : (1 / Math.pow(10, editDecimals)).toString()}
                                        value={value}
                                        oninput={(e) => updateEditIncrementValue(index, e.currentTarget.value)}
                                        placeholder="Increment value"
                                        class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50 text-base"
                                />
                            </div>
                            {#if editIncrements.length > 1}
                                <IconButton
                                        tooltip="Remove increment"
                                        type="button"
                                        onclick={() => removeEditIncrement(index)}
                                        variant="danger-outline"
                                        size="md"
                                        shape="square"
                                >
                                    <Trash2 size={16} />
                                </IconButton>
                            {/if}
                        </div>
                    {/each}

                    {#if editIncrements.length < 3}
                        <button
                                type="button"
                                onclick={addEditIncrement}
                                class="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-zinc-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/40 text-purple-650 dark:text-purple-400 hover:text-purple-700 hover:dark:text-purple-300 rounded-xl transition-all bg-zinc-50/50 dark:bg-white/[0.01] cursor-pointer"
                        >
                            <Plus size={16} />
                            <span>Add Increment Button</span>
                        </button>
                    {/if}
                </div>
            </div>
        </div>

        <div class="border-t border-zinc-200 dark:border-white/10 pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
            <button
                    type="button"
                    onclick={() => (showSettingsModal = false)}
                    class="px-4 py-2 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold transition-all text-xs cursor-pointer"
            >
                Cancel
            </button>
            <button
                    type="submit"
                    class="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-zinc-100 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-[0_4px_12px_rgba(168,85,247,0.2)] dark:shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_4px_16px_rgba(168,85,247,0.3)] dark:hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] active:scale-[0.98]"
            >
                Save Settings
            </button>
        </div>
    </form>
</Modal>
