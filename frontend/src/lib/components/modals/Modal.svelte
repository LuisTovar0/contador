<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  interface Props {
    show?: boolean;
    onclose: () => void;
    children?: import('svelte').Snippet;
  }

  let { show = false, onclose, children }: Props = $props();

  let active = $state(false);

  $effect(() => {
    if (!show) {
      active = false;
    }
  });

  onMount(() => {
    active = true;
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && show) {
      onclose();
    }
  }
</script>

{#if active}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
            class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 outline-none"
            role="dialog"
            aria-modal="true"
            tabindex="-1"
            onkeydown={handleKeydown}
    >
        <!-- Backdrop -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
                transition:fade={{ duration: 200 }}
                class="fixed inset-0 bg-black/75 backdrop-blur-md"
                onclick={onclose}
        ></div>

        <!-- Modal Container -->
        <div
                transition:fly={{ y: 60, duration: 250 }}
                class="relative w-full max-w-md transform rounded-t-2xl sm:rounded-2xl border border-zinc-200/55 dark:border-primary-500/20 border-t-white/80 border-l-white/80 dark:border-t-white/20 dark:border-l-white/20 bg-white/55 dark:bg-zinc-950/75 p-6 pb-8 sm:pb-6 text-zinc-900 dark:text-zinc-100 shadow-[0_20px_50px_rgba(9,9,11,0.12),_inset_0_1px_0_rgba(255,255,255,0.65)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.55),_inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-xl max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-black/5 dark:ring-white/5"
        >
            <!-- Specular reflection glass highlight -->
            <div class="absolute inset-0 bg-gradient-to-br from-white/35 dark:from-white/12 via-transparent to-transparent pointer-events-none"></div>
            {@render children?.()}
        </div>
    </div>
{/if}

