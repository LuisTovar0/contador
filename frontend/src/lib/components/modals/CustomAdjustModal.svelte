<script lang="ts">
  import { type Counter, counterStore } from '$lib/store.svelte';
  import { Minus, PenLine, Plus, X } from 'lucide-svelte';
  import Modal from './Modal.svelte';

  interface Props {
    show?: boolean;
    counter: Counter;
    onclose: (result?: any) => void;
    onapplied?: () => void;
  }

  let { show = false, counter, onclose, onapplied }: Props = $props();

  let customAdjustInput = $state('1');
  let isCustomPositive = $state(true);

  $effect(() => {
    if (show) {
      customAdjustInput = '1';
      isCustomPositive = true;
    }
  });

  async function handleCustomAdjust() {
    const parsed = parseFloat(customAdjustInput);
    if (isNaN(parsed)) return;

    const delta = isCustomPositive ? parsed : -parsed;
    const finalVal = counter.value + delta;
    const desc = delta >= 0
      ? `Adjusted custom by +${parsed} ${counter.unit}`.trim()
      : `Adjusted custom by -${parsed} ${counter.unit}`.trim();

    if (onapplied) {
      onapplied();
    }
    await counterStore.updateCounterValue(counter.id, finalVal, desc, false, 'Custom Adjust');
    onclose(true);
  }
</script>

<Modal {show} {onclose}>
    <div class="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-4">
        <h2 class="text-lg font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <PenLine size={18} />
            <span>Custom Adjustment</span>
        </h2>
        <button
                onclick={() => onclose(false)}
                class="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer"
        >
            <X size={18} />
        </button>
    </div>

    <div class="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
            Choose how much to adjust the counter <strong class="text-zinc-800 dark:text-zinc-300">"{counter.name}"</strong> by.
        </p>

        <!-- Direction selection -->
        <div class="grid grid-cols-2 gap-2">
            <button
                    type="button"
                    onclick={() => (isCustomPositive = true)}
                    class="py-2.5 border rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer
				{isCustomPositive
					? 'bg-primary-50 dark:bg-primary-500/20 border-primary-300 dark:border-primary-500 text-primary-700 dark:text-primary-300 shadow-[0_2px_8px_rgba(16,185,129,0.1)] dark:shadow-primary-glow'
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
					? 'bg-secondary-50 dark:bg-secondary-500/20 border-secondary-300 dark:border-secondary-500 text-secondary-700 dark:text-secondary-300 shadow-[0_2px_8px_rgba(124,58,237,0.1)] dark:shadow-secondary-glow'
					: 'bg-zinc-50 dark:bg-zinc-950/30 border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/10'}"
            >
                <Minus size={14} />
                <span>Decrement (-)</span>
            </button>
        </div>

        <div>
            <label for="customAmount-{counter.id}"
                   class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
            >Adjustment Amount ({counter.unit || 'no unit'})</label
            >
            <input
                    type="number"
                    id="customAmount-{counter.id}"
                    min="0"
                    step={counter.decimals === 0 ? '1' : (1 / Math.pow(10, counter.decimals)).toString()}
                    bind:value={customAdjustInput}
                    class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-primary-500 transition-colors focus:ring-1 focus:ring-primary-500/40 font-mono text-base"
            />
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
                type="button"
                onclick={handleCustomAdjust}
                class="px-5 py-2.5 text-zinc-100 rounded-xl font-bold transition-all text-xs cursor-pointer
			{isCustomPositive ? 'bg-primary-600 hover:bg-primary-500 shadow-primary-glow' : 'bg-secondary-600 hover:bg-secondary-500 shadow-secondary-glow'}"
        >
            Apply {isCustomPositive ? 'Addition' : 'Subtraction'}
        </button>
    </div>
</Modal>
