<script lang="ts">
  import { type Counter, counterStore } from '$lib/store.svelte';
  import { Trash2 } from 'lucide-svelte';
  import WarningModal from './WarningModal.svelte';

  interface Props {
    show?: boolean;
    counter: Counter;
    onclose: (result?: boolean) => void;
  }

  let { show = false, counter, onclose }: Props = $props();

  async function handleClose(result: boolean) {
    if (result) {
      await counterStore.deleteCounter(counter.id);
      onclose(true);
    } else {
      onclose(false);
    }
  }
</script>

<WarningModal
        {show}
        onclose={handleClose}
        title="Delete Counter"
        icon={Trash2}
        confirmText="Delete Permanently"
>
    <div class="space-y-3">
        <p class="text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed">
            Are you sure you want to delete <strong class="text-zinc-950 dark:text-zinc-100">"{counter.name}"</strong>?
        </p>
        <p class="text-xs text-zinc-400 dark:text-zinc-500 leading-normal">
            This action cannot be undone. Its counter configuration and value will be permanently deleted, though the
            activity history log will retain the deletion record.
        </p>
    </div>
</WarningModal>
