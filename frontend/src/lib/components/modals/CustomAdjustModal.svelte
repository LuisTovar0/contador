<script lang="ts">
  import { type Counter, counterStore } from '$lib/store.svelte';
  import { Minus, PenLine, Plus, X } from 'lucide-svelte';
  import Modal from './Modal.svelte';
  import { t } from '$lib';


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
      ? t('log.customInc', { val: parsed, unit: counter.unit })
      : t('log.customDec', { val: parsed, unit: counter.unit });

    if (onapplied) {
      onapplied();
    }
    await counterStore.updateCounterValue(counter.id, finalVal, desc, false, 'Custom Adjust');
    onclose(true);
  }
</script>

<Modal {show} {onclose}>
    <div class="flex items-center justify-between border-b border-modal-border pb-4 mb-4">
        <h2 class="text-lg font-bold text-primary-brand flex items-center gap-2">
            <PenLine size={18} />
            <span>{t('custom.title')}</span>
        </h2>
        <button
                onclick={() => onclose(false)}
                class="text-muted hover:text-secondary transition-colors p-1 rounded-lg hover:bg-subtle-hover cursor-pointer"
        >
            <X size={18} />
        </button>
    </div>

    <div class="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        <p class="text-xs text-muted leading-normal">
            {@html t('custom.body', { name: `<strong class="text-secondary">"${counter.name}"</strong>` })}
        </p>

        <!-- Direction selection -->
        <div class="grid grid-cols-2 gap-2">
            <button
                    type="button"
                    onclick={() => (isCustomPositive = true)}
                    class="py-2.5 border rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer
				{isCustomPositive
					? 'bg-primary-active border-primary-active text-primary-brand-active shadow-primary-active'
					: 'bg-surface-muted border-muted text-muted hover:border-option-hover'}"
            >
                <Plus size={14} />
                <span>{t('custom.increment')}</span>
            </button>
            <button
                    type="button"
                    onclick={() => (isCustomPositive = false)}
                    class="py-2.5 border rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer
				{!isCustomPositive
					? 'bg-secondary-active border-secondary-active text-secondary-brand-active shadow-secondary-active'
					: 'bg-surface-muted border-muted text-muted hover:border-option-hover'}"
            >
                <Minus size={14} />
                <span>{t('custom.decrement')}</span>
            </button>
        </div>

        <div>
            <label for="customAmount-{counter.id}"
                   class="block text-xs font-semibold text-text-alt uppercase tracking-wider mb-1.5"
            >{t('custom.amountLabel', { unit: counter.unit || 'no unit' })}</label
            >
            <input
                    type="number"
                    id="customAmount-{counter.id}"
                    min="0"
                    step={counter.decimals === 0 ? '1' : (1 / Math.pow(10, counter.decimals)).toString()}
                    bind:value={customAdjustInput}
                    class="w-full glass-surface border border-input-border rounded-xl px-3 py-2 text-primary placeholder:text-placeholder focus:outline-none focus:border-primary-500 transition-colors focus:ring-1 focus:ring-primary-500/40 font-mono text-base"
            />
        </div>
    </div>

    <div class="border-t border-modal-border pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
        <button
                type="button"
                onclick={() => onclose(false)}
                class="px-4 py-2 border border-btn-cancel-border hover:bg-btn-cancel-hover-bg text-btn-cancel-text rounded-xl font-semibold transition-all text-xs cursor-pointer"
        >
            {t('modals.cancel')}
        </button>
        <button
                type="button"
                onclick={handleCustomAdjust}
                class="px-5 py-2.5 text-zinc-100 rounded-xl font-bold transition-all text-xs cursor-pointer
			{isCustomPositive ? 'bg-primary-600 hover:bg-primary-500 shadow-primary-glow' : 'bg-secondary-600 hover:bg-secondary-500 shadow-secondary-glow'}"
        >
            {isCustomPositive ? t('custom.applyAddition') : t('custom.applySubtraction')}
        </button>
    </div>
</Modal>
