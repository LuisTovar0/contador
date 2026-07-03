<script lang="ts">
  import { AlertTriangle } from 'lucide-svelte';
  import WarningModal from './WarningModal.svelte';
  import { t } from '$lib';

  interface Props {
    show?: boolean;
    onclose: (result?: boolean) => void;
  }

  let { show = false, onclose }: Props = $props();
</script>

<WarningModal
        {show}
        {onclose}
        title={t('logout.title')}
        icon={AlertTriangle}
        confirmText={t('logout.confirmText')}
        confirmClass="px-5 py-2.5 bg-red-650 hover:bg-red-600 text-zinc-100 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-[0_4px_12px_rgba(239,68,68,0.2)] dark:shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_16px_rgba(239,68,68,0.3)] dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] active:translate-y-[0.5px]"
>
    <div class="space-y-3.5 text-xs md:text-sm leading-relaxed text-zinc-650 dark:text-zinc-300">
        <p>
            {@html t('logout.body1')}
        </p>
        <p>
            {@html t('logout.body2')}
        </p>
    </div>
</WarningModal>

