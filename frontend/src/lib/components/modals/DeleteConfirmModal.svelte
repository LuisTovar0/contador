<script lang="ts">
  import { type Counter, counterStore } from '$lib/store.svelte';
  import { Trash2 } from 'lucide-svelte';
  import WarningModal from './WarningModal.svelte';
  import { t } from '$lib';

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
        title={t('delete.title')}
        icon={Trash2}
        confirmText={t('delete.confirmText')}
>
    <div class="space-y-3">
        <p class="text-sm text-secondary leading-relaxed">
            {@html t('delete.body', { name: `<strong class="text-primary">"${counter.name}"</strong>` })}
        </p>
        <p class="text-xs text-muted leading-normal">
            {t('delete.disclaimer')}
        </p>
    </div>
</WarningModal>

