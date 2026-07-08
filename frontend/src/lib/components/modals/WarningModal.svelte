<script lang="ts">
  import type { Snippet } from 'svelte';
  import { X } from 'lucide-svelte';
  import Modal from './Modal.svelte';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import { t } from '$lib';

  interface Props {
    show?: boolean;
    title: string;
    icon?: any;
    confirmText?: string;
    cancelText?: string;
    confirmClass?: string;
    onclose: (result: boolean) => void;
    children?: Snippet;
  }

  let {
    show = false,
    title,
    icon: Icon,
    confirmText = t('modals.save'),
    cancelText = t('modals.cancel'),
    confirmClass = 'px-5 py-2.5 bg-red-600 hover:bg-red-500 text-zinc-100 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-destructive hover:shadow-destructive-hover active:translate-y-[0.5px]',
    onclose,
    children
  }: Props = $props();
</script>

<Modal {show} onclose={() => onclose(false)}>
    <div class="flex items-center justify-between border-b border-modal-border pb-4 mb-4">
        <h2 class="text-lg font-bold flex items-center gap-2 text-error">
            {#if Icon}
                <Icon size={18} class="shrink-0" />
            {/if}
            <span>{title}</span>
        </h2>
        <IconButton
                onclick={() => onclose(false)}
                variant="ghost"
                size="md"
                aria-label={t('modals.close')}
        >
            <X size={18} />
        </IconButton>
    </div>

    <div class="flex-1 overflow-y-auto pr-1 pb-2">
        {@render children?.()}
    </div>

    <div class="border-t border-modal-border pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
        <button
                type="button"
                onclick={() => onclose(false)}
                class="px-4 py-2 border border-btn-cancel-border hover:bg-btn-cancel-hover-bg text-btn-cancel-text rounded-xl font-semibold transition-all active:scale-[0.98] text-xs cursor-pointer"
        >
            {cancelText}
        </button>
        <button
                type="button"
                onclick={() => onclose(true)}
                class={confirmClass}
        >
            {confirmText}
        </button>
    </div>
</Modal>
