<script lang="ts">
  import { type Counter, counterStore } from '$lib/store.svelte';
  import { Keyboard, X } from 'lucide-svelte';
  import Modal from './Modal.svelte';
  import { t } from '$lib';


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
      t('log.directSet', { val: parsed, unit: counter.unit }),
      false,
      'Direct Set',
    );
    onclose(true);
  }
</script>

<Modal {show} {onclose}>
    <div class="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-4">
        <h2 class="text-lg font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <Keyboard size={18} />
            <span>{t('exact.title')}</span>
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
            {@html t('exact.body', { name: `<strong class="text-zinc-800 dark:text-zinc-300">"${counter.name}"</strong>` })}
        </p>
        <div>
            <label for="newValue-{counter.id}"
                   class="block text-xs font-semibold text-zinc-555 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
            >{t('exact.valueLabel', { unit: counter.unit || 'no unit' })}</label
            >
            <input
                    type="number"
                    id="newValue-{counter.id}"
                    step={counter.decimals === 0 ? '1' : (1 / Math.pow(10, counter.decimals)).toString()}
                    bind:value={newValueInput}
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
            {t('modals.cancel')}
        </button>
        <button
                type="button"
                onclick={handleSetExactValue}
                class="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-zinc-100 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-primary-glow"
        >
            {t('exact.saveValue')}
        </button>
    </div>
</Modal>
