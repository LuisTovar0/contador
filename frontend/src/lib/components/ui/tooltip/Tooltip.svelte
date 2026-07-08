<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fade } from 'svelte/transition';

  interface Props {
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    class?: string;
    children: Snippet;
  }

  let { text, position = 'top', class: className = '', children }: Props = $props();

  let show = $state(false);
  let triggerEl = $state<HTMLElement | null>(null);
  let tooltipEl = $state<HTMLElement | null>(null);

  function portal(node: HTMLElement) {
    document.body.appendChild(node);
  }

  function updatePosition() {
    if (!triggerEl || !tooltipEl) return;
    const triggerRect = triggerEl.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();

    let top = 0;
    let left = 0;
    const offset = 8;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - offset;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + offset;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - offset;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + offset;
        break;
    }

    // Keep tooltip within viewport bounds
    const padding = 8;

    // X-axis boundary check
    if (left < padding) {
      left = padding;
    } else if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }

    // Y-axis boundary check
    if (top < padding) {
      if (position === 'top') {
        top = triggerRect.bottom + offset; // Flip to bottom
      } else {
        top = padding;
      }
    } else if (top + tooltipRect.height > window.innerHeight - padding) {
      if (position === 'bottom') {
        top = triggerRect.top - tooltipRect.height - offset; // Flip to top
      } else {
        top = window.innerHeight - tooltipRect.height - padding;
      }
    }

    tooltipEl.style.top = `${ top + window.scrollY }px`;
    tooltipEl.style.left = `${ left + window.scrollX }px`;
  }

  $effect(() => {
    if (show) {
      updatePosition();

      // Handle position updates during window changes
      window.addEventListener('resize', updatePosition, { passive: true });
      window.addEventListener('scroll', updatePosition, { passive: true });

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  });

  function handleMouseEnter() {
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) return;
    show = true;
  }

  function handleMouseLeave() {
    show = false;
  }

  function handleFocusIn() {
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) return;
    show = true;
  }

  function handleFocusOut() {
    show = false;
  }
</script>

<div
        bind:this={triggerEl}
        onmouseenter={handleMouseEnter}
        onmouseleave={handleMouseLeave}
        onfocusin={handleFocusIn}
        onfocusout={handleFocusOut}
        class="inline-flex {className}"
        role="presentation"
>
    {@render children()}
</div>

{#if show && text}
    <div
            use:portal
            bind:this={tooltipEl}
            transition:fade={{ duration: 120 }}
            role="tooltip"
            class="absolute z-[9999] pointer-events-none px-2.5 py-1.5 rounded-lg border border-tooltip-border bg-tooltip-bg text-[11px] font-medium text-tooltip-text shadow-tooltip backdrop-blur-md whitespace-nowrap tracking-wide select-none"
    >
        {text}
    </div>
{/if}
