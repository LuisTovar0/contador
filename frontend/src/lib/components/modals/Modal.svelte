<script lang="ts">
  import { onMount } from 'svelte';
  import type { TransitionConfig } from 'svelte/transition';

  interface Props {
    show?: boolean;
    onclose: () => void;
    children?: import('svelte').Snippet;
  }

  let { show = false, onclose, children }: Props = $props();

  let active = $state(false);

  type TransitionOptions = {
    direction?: 'in' | 'out' | 'both';
  };

  const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function glassBackdrop(
    _node: Element,
    _params: unknown,
    { direction = 'in' }: TransitionOptions = {}
  ): TransitionConfig {
    const reduce = reducedMotion();

    return {
      duration: reduce ? 100 : direction === 'out' ? 160 : 220,
      easing: reduce ? easeOutQuint : easeOutExpo,
      css: (t) => `opacity: ${t};`,
    };
  }

  function liquidGlassModal(
    _node: Element,
    _params: unknown,
    { direction = 'in' }: TransitionOptions = {}
  ): TransitionConfig {
    const reduce = reducedMotion();

    return {
      duration: reduce ? 120 : direction === 'out' ? 210 : 280,
      easing: reduce ? easeOutQuint : easeOutExpo,
      css: (t, u) => {
        if (reduce) {
          return `
            opacity: ${t};
            transform: scale(${0.992 + t * 0.008});
          `;
        }

        const blur = u * 14;
        const y = u * 18;
        const scale = 0.965 + t * 0.035;
        const rotate = u * 2.25;
        const insetY = u * 7;
        const insetX = u * 3;
        const radius = 16 + u * 18;

        return `
          --modal-glass-progress: ${t};
          --modal-caustic-opacity: ${0.12 + t * 0.5};
          --modal-caustic-shift: ${u * -18}px;
          --modal-rim-opacity: ${0.08 + t * 0.34};
          --modal-secondary-rim-opacity: ${(0.08 + t * 0.34) * 0.8};
          --modal-caustic-scale: ${0.78 + t * 0.22};
          opacity: ${Math.min(1, t * 1.08)};
          transform: translate3d(0, ${y}px, 0) scale(${scale}) perspective(900px) rotateX(${rotate}deg);
          filter: blur(${blur}px) saturate(${92 + t * 34}%) brightness(${94 + t * 8}%);
          clip-path: inset(${insetY}% ${insetX}% ${u * 1.2}% ${insetX}% round ${radius}px);
        `;
      },
    };
  }

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
                transition:glassBackdrop
                class="modal-glass-backdrop fixed inset-0"
                onclick={onclose}
        ></div>

        <!-- Modal Container -->
        <div
                transition:liquidGlassModal
                class="modal-liquid-panel relative w-full max-w-md transform rounded-t-2xl sm:rounded-2xl border border-modal-border border-t-modal-border-t border-l-modal-border-l bg-modal-bg p-6 pb-8 sm:pb-6 text-primary shadow-modal backdrop-blur-xl max-h-[85vh] max-h-[85dvh] sm:max-h-[90vh] sm:max-h-[90dvh] flex flex-col overflow-hidden ring-1 ring-card-ring"
        >
            <!-- Specular reflection glass highlight -->
            <div class="modal-liquid-rim absolute inset-0 z-0 pointer-events-none"></div>
            <div class="modal-liquid-caustic absolute inset-x-6 -top-12 z-0 h-28 pointer-events-none"></div>
            <div class="absolute inset-0 z-0 bg-linear-to-br from-glass-specular via-transparent to-transparent pointer-events-none"></div>
            <div class="relative z-10">
                {@render children?.()}
            </div>
        </div>
    </div>
{/if}

<style>
  .fixed[role='dialog'] {
    isolation: isolate;
  }

  .modal-glass-backdrop {
    background:
      radial-gradient(circle at 48% 42%, oklch(0.62 0.15 145 / 0.16), transparent 30%),
      radial-gradient(circle at 58% 58%, oklch(0.58 0.16 300 / 0.16), transparent 34%),
      rgba(0, 0, 0, 0.22);
    backdrop-filter: blur(18px) saturate(136%) brightness(86%);
    -webkit-backdrop-filter: blur(18px) saturate(136%) brightness(86%);
    will-change: opacity;
  }

  .modal-liquid-panel {
    --modal-glass-progress: 1;
    --modal-caustic-opacity: 0.62;
    --modal-caustic-shift: 0px;
    --modal-rim-opacity: 0.42;
    --modal-secondary-rim-opacity: 0.34;
    --modal-caustic-scale: 1;
    transform-origin: center bottom;
    contain: layout paint;
    will-change: transform, opacity, filter, clip-path;
    box-shadow:
      var(--modal-shadow),
      0 0 32px oklch(0.62 0.15 145 / 0.18),
      0 0 60px oklch(0.58 0.16 300 / 0.12);
  }

  .modal-liquid-rim {
    border-radius: inherit;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.32), transparent 38%),
      radial-gradient(circle at 22% 0%, oklch(0.62 0.15 145 / var(--modal-rim-opacity)), transparent 36%),
      radial-gradient(circle at 86% 12%, oklch(0.58 0.16 300 / var(--modal-secondary-rim-opacity)), transparent 34%);
    mix-blend-mode: screen;
    opacity: var(--modal-glass-progress);
  }

  .modal-liquid-caustic {
    border-radius: 9999px;
    background:
      radial-gradient(closest-side, rgba(255, 255, 255, 0.55), transparent 70%),
      linear-gradient(90deg, transparent, oklch(0.62 0.15 145 / 0.32), oklch(0.58 0.16 300 / 0.26), transparent);
    filter: blur(18px);
    opacity: var(--modal-caustic-opacity);
    transform: translate3d(var(--modal-caustic-shift), 0, 0) scaleX(var(--modal-caustic-scale));
  }

  @media (min-width: 640px) {
    .modal-liquid-panel {
      transform-origin: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .modal-glass-backdrop,
    .modal-liquid-panel {
      will-change: opacity;
    }

    .modal-liquid-caustic,
    .modal-liquid-rim {
      opacity: 0;
    }
  }
</style>
