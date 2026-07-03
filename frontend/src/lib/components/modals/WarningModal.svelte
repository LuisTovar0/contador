<script lang="ts">
  import type { Snippet } from 'svelte';
  import { X } from 'lucide-svelte';
  import Modal from './Modal.svelte';
  import IconButton from '$lib/components/ui/IconButton.svelte';

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
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmClass = 'bg-red-600 hover:bg-red-500 text-zinc-100 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-[0_4px_12px_rgba(239,68,68,0.2)] dark:shadow-[0_0_15px_rgba(239,68,68,0.3)] active:translate-y-[0.5px]',
    onclose,
    children
  }: Props = $props();
</script>

<Modal {show} onclose={() => onclose(false)}>
    <div class="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-4">
        <h2 class="text-lg font-bold flex items-center gap-2 text-red-650 dark:text-red-400">
            {#if Icon}
                <Icon size={18} class="shrink-0" />
            {/if}
            <span>{title}</span>
        </h2>
        <IconButton
                onclick={() => onclose(false)}
                variant="ghost"
                size="md"
                shape="square"
                aria-label="Close"
        >
            <X size={18} />
        </IconButton>
    </div>

    <div class="flex-1 overflow-y-auto pr-1 pb-2">
        {@render children?.()}
    </div>

    <div class="border-t border-zinc-200 dark:border-white/10 pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
        <button
                type="button"
                onclick={() => onclose(false)}
                class="px-4 py-2 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-650 dark:text-zinc-300 rounded-xl font-semibold transition-all active:scale-[0.98] text-xs cursor-pointer"
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
