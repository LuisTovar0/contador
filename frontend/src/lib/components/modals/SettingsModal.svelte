<script lang="ts">
  import { type Counter, counterStore } from '$lib/store.svelte';
  import { Hash, Plus, Settings, Trash2, X } from 'lucide-svelte';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import Modal from './Modal.svelte';

  interface Props {
    show?: boolean;
    counter: Counter;
    onclose: (result?: boolean) => void;
  }

  let { show = false, counter, onclose }: Props = $props();

  let editName = $state('');
  let editUnit = $state('');
  let editDecimals = $state(0);
  let editIncrements = $state<number[]>([]);
  let settingsError = $state<string | null>(null);

  $effect(() => {
    if (show) {
      editName = counter.name;
      editUnit = counter.unit;
      editDecimals = counter.decimals;
      editIncrements = [ ...counter.increments ];
      settingsError = null;
    }
  });

  function addEditIncrement() {
    if (editIncrements.length >= 3) return;
    editIncrements = [ ...editIncrements, 1 ];
  }

  function removeEditIncrement(index: number) {
    if (editIncrements.length <= 1) return;
    editIncrements = editIncrements.filter((_, i) => i !== index);
  }

  async function handleSaveSettings(e: SubmitEvent) {
    e.preventDefault();
    settingsError = null;

    if (!editName.trim()) {
      settingsError = 'Counter name is required.';
      return;
    }

    const finalIncrements = editIncrements.map(v => (v !== null && typeof v === 'number' && !isNaN(v)) ? v : 1);

    if (finalIncrements.length < 1 || finalIncrements.length > 3) {
      settingsError = 'You must have between 1 and 3 default increments.';
      return;
    }

    try {
      await counterStore.updateCounterSettings(
        counter.id,
        editName.trim(),
        editDecimals,
        editUnit,
        finalIncrements,
      );
      onclose(true);
    } catch (err: any) {
      settingsError = err.message || 'Failed to update settings.';
    }
  }
</script>

<Modal {show} {onclose}>
    <div class="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-4">
        <h2 class="text-lg font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <Settings size={18} />
            <span>Counter Settings</span>
        </h2>
        <button
                onclick={() => onclose(false)}
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
                <label for="editCounterName-{counter.id}"
                       class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
                >Counter Name *</label
                >
                <input
                        type="text"
                        id="editCounterName-{counter.id}"
                        bind:value={editName}
                        placeholder="e.g. Water Intake, Daily Steps"
                        required
                        class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-primary-500 transition-colors focus:ring-1 focus:ring-primary-500/40 text-base md:text-sm"
                />
            </div>

            <!-- Unit -->
            <div>
                <label for="editCounterUnit-{counter.id}"
                       class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
                >Unit (free text)</label
                >
                <input
                        type="text"
                        id="editCounterUnit-{counter.id}"
                        bind:value={editUnit}
                        placeholder="e.g. Liters, reps, cups, km"
                        class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-primary-500 transition-colors focus:ring-1 focus:ring-primary-500/40 text-base md:text-sm"
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
								? 'bg-primary-50 dark:bg-primary-500/20 border-primary-300 dark:border-primary-500 text-primary-700 dark:text-primary-300 shadow-[0_2px_8px_rgba(16,185,129,0.1)] dark:shadow-primary-glow'
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
                    {#each editIncrements as _, index}
                        <div class="flex items-center gap-2">
                            <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-white/10 text-primary-650 dark:text-primary-400 font-bold shrink-0 text-xs">
                                #{index + 1}
                            </div>
                            <div class="relative flex-1">
								<span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
									<Hash size={14} />
								</span>
                                <input
                                        type="number"
                                        step={editDecimals === 0 ? '1' : (1 / Math.pow(10, editDecimals)).toString()}
                                        bind:value={editIncrements[index]}
                                        placeholder="Increment value"
                                        class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-primary-500 transition-colors focus:ring-1 focus:ring-primary-500/40 text-base"
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
                                class="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-zinc-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-primary-500/40 text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-200 rounded-xl transition-all bg-zinc-50/50 dark:bg-white/1 cursor-pointer text-xs"
                        >
                            <Plus size={14} />
                            <span>Add Increment Button</span>
                        </button>
                    {/if}
                </div>
            </div>
        </div>

        <div class="border-t border-zinc-200 dark:border-white/10 pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
            <button
                    type="button"
                    onclick={() => onclose(false)}
                    class="px-4 py-2 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold transition-all text-xs cursor-pointer"
            >
                Cancel
            </button>
            <button
                    type="submit"
                    class="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-zinc-100 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-primary-glow hover:shadow-primary-glow active:scale-[0.98]"
            >
                Save Settings
            </button>
        </div>
    </form>
</Modal>
