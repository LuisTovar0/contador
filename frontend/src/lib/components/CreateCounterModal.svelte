<script lang="ts">
  import { counterStore } from '$lib/store.svelte';
  import { Hash, Plus, Sparkles, Trash2, X } from 'lucide-svelte';
  import IconButton from './IconButton.svelte';
  import Modal from './Modal.svelte';

  interface Props {
    show?: boolean;
    onclose: () => void;
  }

  let { show = false, onclose }: Props = $props();

  let name = $state('');
  let unit = $state('');
  let decimals = $state(0);
  let increments = $state<number[]>([ 1 ]); // Default to single [1]
  let errorMessage = $state<string | null>(null);

  $effect(() => {
    if (show) {
      // Reset form when shown
      name = '';
      unit = '';
      decimals = 0;
      increments = [ 1 ];
      errorMessage = null;
    }
  });

  function addIncrement() {
    if (increments.length >= 3) return;
    increments = [ ...increments, 1 ];
  }

  function removeIncrement(index: number) {
    if (increments.length <= 1) return;
    increments = increments.filter((_, i) => i !== index);
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = null;

    if (!name.trim()) {
      errorMessage = 'Counter name is required.';
      return;
    }

    const finalIncrements = increments.map(v => (v !== null && typeof v === 'number' && !isNaN(v)) ? v : 1);

    if (finalIncrements.length < 1 || finalIncrements.length > 3) {
      errorMessage = 'You must have between 1 and 3 default increments.';
      return;
    }

    try {
      await counterStore.createCounter(
          name.trim(),
          decimals,
          unit.trim(),
          finalIncrements,
      );
      onclose();
    } catch (err: any) {
      errorMessage = err.message || 'Failed to create counter.';
    }
  }
</script>

<Modal {show} {onclose}>
    <div class="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-4">
        <h2 class="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-150">
            <Sparkles size={20} class="text-purple-650 dark:text-purple-400" />
            <span>New Counter</span>
        </h2>
        <IconButton
                onclick={onclose}
                variant="ghost"
                size="md"
                shape="square"
                aria-label="Close"
        >
            <X size={20} />
        </IconButton>
    </div>

    <form onsubmit={handleSubmit} class="flex-1 overflow-y-auto space-y-4 pr-1 text-sm">
        {#if errorMessage}
            <div class="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs">
                {errorMessage}
            </div>
        {/if}

        <!-- Counter Name -->
        <div>
            <label for="counterName"
                   class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
            >Counter Name *</label
            >
            <input
                    type="text"
                    id="counterName"
                    bind:value={name}
                    placeholder="e.g. Water Intake, Daily Steps"
                    required
                    class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/40 text-base md:text-sm"
            />
        </div>

        <!-- Unit -->
        <div>
            <label for="counterUnit"
                   class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
            >Unit (free text)</label
            >
            <input
                    type="text"
                    id="counterUnit"
                    bind:value={unit}
                    placeholder="e.g. Liters, reps, cups, km"
                    class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/40 text-base md:text-sm"
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
                            onclick={() => (decimals = d)}
                            class="py-2 px-1 rounded-xl border font-semibold transition-all text-center cursor-pointer text-xs
						{decimals === d
							? 'bg-purple-50 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500 text-purple-700 dark:text-purple-300 shadow-[0_2px_8px_rgba(168,85,247,0.1)] dark:shadow-[0_0_10px_rgba(168,85,247,0.2)]'
							: 'bg-zinc-50 dark:bg-zinc-950/30 border-zinc-200 dark:border-white/5 text-zinc-450 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/10'}"
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
                <span class="text-xs text-zinc-400 dark:text-zinc-500">({increments.length}/3 buttons)</span>
            </div>

            <div class="space-y-2.5">
                {#each increments as value, index}
                    <div class="flex items-center gap-2">
                        <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-white/10 text-zinc-650 dark:text-zinc-400 font-bold shrink-0 text-xs">
                            #{index + 1}
                        </div>
                        <div class="relative flex-1">
							<span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
								<Hash size={14} />
							</span>
                            <input
                                    type="number"
                                    step={decimals === 0 ? '1' : (1 / Math.pow(10, decimals)).toString()}
                                    bind:value={increments[index]}
                                    placeholder="Increment value"
                                    class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/40 text-base"
                            />
                        </div>
                        {#if increments.length > 1}
                            <IconButton
                                    tooltip="Remove increment"
                                    type="button"
                                    onclick={() => removeIncrement(index)}
                                    variant="danger-outline"
                                    size="md"
                                    shape="square"
                            >
                                <Trash2 size={16} />
                            </IconButton>
                        {/if}
                    </div>
                {/each}

                {#if increments.length < 3}
                    <button
                            type="button"
                            onclick={addIncrement}
                            class="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-zinc-200/60 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-500/40 text-purple-650 dark:text-purple-400 hover:text-purple-755 dark:hover:text-purple-300 rounded-xl transition-all bg-zinc-50/50 dark:bg-purple-950/10 cursor-pointer text-xs"
                    >
                        <Plus size={14} />
                        <span>Add Increment Button</span>
                    </button>
                {/if}
            </div>
        </div>

        <div class="border-t border-zinc-200 dark:border-white/10 pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
            <button
                    type="button"
                    onclick={onclose}
                    class="px-4 py-2 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold transition-all active:scale-[0.98] text-xs cursor-pointer"
            >
                Cancel
            </button>
            <button
                    type="submit"
                    class="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all text-xs cursor-pointer shadow-[0_4px_12px_rgba(168,85,247,0.2)] dark:shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_4px_16px_rgba(168,85,247,0.3)] dark:hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] active:translate-y-[0.5px]"
            >
                Create Counter
            </button>
        </div>
    </form>
</Modal>
