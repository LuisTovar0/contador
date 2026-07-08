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
        confirmClass="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-zinc-100 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-destructive hover:shadow-destructive-hover active:translate-y-[0.5px]"
>
    <div class="space-y-3.5 text-xs md:text-sm leading-relaxed text-secondary">
        <p>
            {@html t('logout.body1')}
        </p>
        <p>
            {@html t('logout.body2')}
        </p>
    </div>
</WarningModal>

