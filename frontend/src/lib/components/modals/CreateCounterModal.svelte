<script lang="ts">
  import { APP_LIMITS, t } from '$lib';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import { type Counter, counterStore } from '$lib/store.svelte';
  import { Hash, Plus, Settings, Trash2, X } from 'lucide-svelte';
  import Modal from './Modal.svelte';

  interface Props {
    show?: boolean;
    counter?: Counter;
    onclose: (result?: any) => void;
  }

  let { show = false, counter, onclose }: Props = $props();

  let name = $state('');
  let unit = $state('');
  let decimals = $state(0);
  let increments = $state<number[]>([ 1 ]); // Default to single [1]
  let errorMessage = $state<string | null>(null);

  $effect(() => {
    if (show) {
      if (counter) {
        name = counter.name;
        unit = counter.unit;
        decimals = counter.decimals;
        increments = [ ...counter.increments ];
      } else {
        // Reset form when shown for creation
        name = '';
        unit = '';
        decimals = 0;
        increments = [ 1 ];
      }
      errorMessage = null;
    }
  });

  function addIncrement() {
    if (increments.length >= APP_LIMITS.MAX_INCREMENT_BUTTONS) return;
    increments = [ ...increments, 1 ];
  }

  function removeIncrement(index: number) {
    if (increments.length <= APP_LIMITS.MIN_INCREMENT_BUTTONS) return;
    increments = increments.filter((_, i) => i !== index);
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = null;

    if (!name.trim()) {
      errorMessage = t('settings.error.nameRequired');
      return;
    }

    const finalIncrements = increments.map(v => (v !== null && typeof v === 'number' && !isNaN(v)) ? v : 1);

    if (finalIncrements.length < APP_LIMITS.MIN_INCREMENT_BUTTONS || finalIncrements.length > APP_LIMITS.MAX_INCREMENT_BUTTONS) {
      errorMessage = t('settings.error.incrementsCount');
      return;
    }

    try {
      if (counter) {
        await counterStore.updateCounterSettings(
            counter.id,
            name.trim(),
            decimals,
            unit,
            finalIncrements,
        );
      } else {
        await counterStore.createCounter(
            name.trim(),
            decimals,
            unit,
            finalIncrements,
        );
      }
      onclose(true);
    } catch (err: any) {
      errorMessage = err.message || (counter ? t('settings.error.failedUpdate') : t('create.error.failedCreate'));
    }
  }
</script>

<Modal {show} {onclose}>
    <div class="flex items-center justify-between border-b border-modal-border pb-4 mb-4">
        <h2 class="text-xl font-bold flex items-center gap-2 text-primary">
            {#if counter}
                <Settings size={20} class="text-primary-brand" />
                <span>{t('settings.title')}</span>
            {:else}
                <span>{t('create.title')}</span>
            {/if}
        </h2>
        <IconButton
                onclick={() => onclose(false)}
                variant="ghost"
                size="md"
                aria-label={t('modals.close')}
        >
            <X size={20} />
        </IconButton>
    </div>

    <form onsubmit={handleSubmit} class="flex-1 flex flex-col min-h-0 text-sm">
        <div class="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
            {#if errorMessage}
                <div class="p-3 bg-red-500/10 border border-red-500/20 text-error rounded-xl text-xs">
                    {errorMessage}
                </div>
            {/if}

            <!-- Counter Name -->
            <div>
                <label for={counter ? `editCounterName-${counter.id}` : 'counterName'}
                       class="block text-xs font-semibold text-label-text uppercase tracking-wider mb-1.5"
                >{t('settings.nameLabel')}</label>
                <input
                        type="text"
                        id={counter ? `editCounterName-${counter.id}` : 'counterName'}
                        bind:value={name}
                        placeholder={t('settings.namePlaceholder')}
                        required
                        class="w-full glass-surface border border-input-border rounded-xl px-3 py-2 text-primary placeholder:text-placeholder focus:outline-none focus:border-primary-500 transition-colors focus:ring-1 focus:ring-primary-500/40 text-base md:text-sm"
                />
            </div>

            <!-- Unit -->
            <div>
                <label for={counter ? `editCounterUnit-${counter.id}` : 'counterUnit'}
                       class="block text-xs font-semibold text-label-text uppercase tracking-wider mb-1.5"
                >{t('settings.unitLabel')}</label>
                <input
                        type="text"
                        id={counter ? `editCounterUnit-${counter.id}` : 'counterUnit'}
                        bind:value={unit}
                        placeholder={t('settings.unitPlaceholder')}
                        class="w-full glass-surface border border-input-border rounded-xl px-3 py-2 text-primary placeholder:text-placeholder focus:outline-none focus:border-primary-500 transition-colors focus:ring-1 focus:ring-primary-500/40 text-base md:text-sm"
                />
            </div>

            <!-- Decimals selection -->
            <div>
                <span class="block text-xs font-semibold text-label-text uppercase tracking-wider mb-1.5"
                >{t('settings.decimalPrecision')}</span>
                <div class="grid grid-cols-4 gap-2">
                    {#each Array.from({ length: APP_LIMITS.MAX_DECIMAL_PRECISION + 1 }, (_, i) => i) as d}
                        <button
                                type="button"
                                onclick={() => (decimals = d)}
                                class="py-2 px-1 rounded-xl border font-semibold transition-all text-center cursor-pointer text-xs
                            {decimals === d
                                ? 'bg-primary-active border-primary-active text-primary-brand-active shadow-primary-active'
                                : 'bg-surface-muted border-muted text-muted hover:border-option-hover'}"
                        >
                            {#if d === 0}
                                {t('settings.integer')} (0)
                            {:else}
                                {d} (.{ '0'.repeat(d) })
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Default increments -->
            <div>
                <div class="mb-1.5 text-xs font-semibold text-label-text uppercase tracking-wider">
                    {counter ? t('settings.defaultIncrements') : t('settings.quickIncrements')}
                </div>

                <div class="space-y-2.5">
                    {#each increments as _, index}
                        <div class="flex items-center gap-2">
                            <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-muted border border-modal-border text-alt font-bold shrink-0 text-xs">
                                #{index + 1}
                            </div>
                            <div class="relative flex-1">
                                <span class="absolute left-2 top-1/2 -translate-y-1/2 text-muted">
                                    +/-
                                </span>
                                <input
                                        type="number"
                                        step={decimals === 0 ? '1' : (1 / Math.pow(10, decimals)).toString()}
                                        bind:value={increments[index]}
                                        placeholder="Increment value"
                                        class="w-full glass-surface border border-input-border rounded-xl pl-8 pr-3 py-2 text-primary placeholder:text-placeholder focus:outline-none focus:border-primary-500 transition-colors focus:ring-1 focus:ring-primary-500/40 text-base"
                                />
                            </div>
                            {#if increments.length > 1}
                                <IconButton
                                        tooltip={t('modals.remove')}
                                        type="button"
                                        onclick={() => removeIncrement(index)}
                                        variant="danger-outline"
                                        size="md"
                                >
                                    <Trash2 size={16} />
                                </IconButton>
                            {/if}
                        </div>
                    {/each}

                    {#if increments.length < APP_LIMITS.MAX_INCREMENT_BUTTONS}
                        <button
                                type="button"
                                onclick={addIncrement}
                                class="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-add-increment hover:border-add-increment-hover text-primary-brand hover:text-primary-brand-active rounded-xl transition-all bg-add-increment cursor-pointer text-xs"
                        >
                            <Plus size={14} />
                            <span>{t('settings.addIncrement')}</span>
                        </button>
                    {/if}
                </div>
            </div>
        </div>

        <div class="border-t border-modal-border pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
            <button
                    type="button"
                    onclick={() => onclose(false)}
                    class="px-4 py-2 border border-btn-cancel-border hover:bg-btn-cancel-hover-bg text-btn-cancel-text rounded-xl font-semibold transition-all active:scale-[0.98] text-xs cursor-pointer"
            >
                {t('modals.cancel')}
            </button>
            <button
                    type="submit"
                    class="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all text-xs cursor-pointer shadow-primary-glow hover:shadow-primary-glow active:translate-y-[0.5px]"
            >
                {counter ? t('settings.saveSettings') : t('create.createCounter')}
            </button>
        </div>
    </form>
</Modal>
