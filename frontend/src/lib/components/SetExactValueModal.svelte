<script lang="ts">
  import { type Counter, counterStore } from '$lib/store.svelte';
  import { Keyboard, X } from 'lucide-svelte';
  import Modal from './Modal.svelte';

  interface Props {
    show?: boolean;
    counter: Counter;
    onclose: (result?: boolean) => void;
  }

  let { show = false, counter, onclose }: Props = $props();

  let newValueInput = $state('');

  $effect(() => {
    if (show) {
      newValueInput = counter.value.toString();
    }
  });

  async function handleSetExactValue() {
    const parsed = parseFloat(newValueInput);
    if (isNaN(parsed)) return;

    await counterStore.updateCounterValue(
      counter.id,
      parsed,
      `Set value directly to ${parsed} ${counter.unit}`.trim(),
      false,
      'Direct Set',
    );
    onclose(true);
  }
</script>

<Modal {show} {onclose}>
    <div class="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-4">
        <h2 class="text-lg font-bold text-purple-650 dark:text-purple-400 flex items-center gap-2">
            <Keyboard size={18} />
            <span>Set Exact Value</span>
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
            Update the counter <strong class="text-zinc-800 dark:text-zinc-300">"{counter.name}"</strong> directly.
        </p>
        <div>
            <label for="newValue-{counter.id}"
                   class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
            >New Value ({counter.unit || 'no unit'})</label
            >
            <input
                    type="number"
                    id="newValue-{counter.id}"
                    step={counter.decimals === 0 ? '1' : (1 / Math.pow(10, counter.decimals)).toString()}
                    bind:value={newValueInput}
                    class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50 font-mono text-base"
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
                onclick={handleSetExactValue}
                class="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-zinc-100 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-[0_4px_12px_rgba(168,85,247,0.2)] dark:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
        >
            Save Value
        </button>
    </div>
</Modal>
