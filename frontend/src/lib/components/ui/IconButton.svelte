<script lang="ts">
  import type { Snippet } from 'svelte';
  import { tooltip as tooltipAction, type TooltipOptions } from './tooltip/tooltip.svelte.ts';

  interface Props {
    tooltip?: string | TooltipOptions;
    variant?: 'outline' | 'ghost' | 'danger' | 'danger-outline' | 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    shape?: 'square' | 'circle';
    class?: string;
    children?: Snippet;

    // Allow any other standard HTML button properties
    [key: string]: any;
  }

  let {
    tooltip,
    variant = 'outline',
    size = 'md',
    shape = 'square',
    class: className = '',
    children,
    ...restProps
  }: Props = $props();

  let sizeClass = $derived(
      size === 'sm'
          ? (shape === 'circle' ? 'w-7 h-7 rounded-full text-xs' : 'w-7 h-7 rounded-md text-xs')
          : size === 'md'
              ? (shape === 'circle' ? 'w-9 h-9 rounded-full text-sm' : 'w-9 h-9 rounded-lg text-sm')
              : size === 'lg'
                  ? (shape === 'circle' ? 'w-10 h-10 rounded-full text-base' : 'w-10 h-10 rounded-xl text-base')
                  : (shape === 'circle' ? 'w-12 h-12 rounded-full text-lg' : 'w-12 h-12 rounded-2xl text-lg'),
  );

  const variantClasses = {
    outline: 'border border-zinc-200/55 dark:border-white/5 border-t-white/80 border-l-white/80 dark:border-t-white/10 dark:border-l-white/10 bg-white/20 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 hover:dark:text-zinc-200 hover:bg-white/40 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/15 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]',
    ghost: 'bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 hover:dark:text-zinc-200 hover:bg-white/10 dark:hover:bg-white/5',
    danger: 'bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/15 backdrop-blur-sm',
    'danger-outline': 'border border-red-200/50 dark:border-red-950/20 border-t-white/30 border-l-white/30 dark:border-t-white/5 dark:border-l-white/5 bg-red-500/5 dark:bg-red-950/5 text-zinc-500 dark:text-red-400 hover:text-red-600 hover:dark:text-red-400 hover:border-red-300 dark:hover:border-red-900/40 hover:bg-red-500/10 dark:hover:bg-red-950/15 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
    primary: 'border border-primary-400/30 dark:border-primary-500/20 border-t-primary-300/50 border-l-primary-300/50 dark:border-t-primary-400/30 dark:border-l-primary-400/30 bg-primary-500/30 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 hover:bg-primary-500/40 dark:hover:bg-primary-500/30 hover:border-primary-400/45 dark:hover:border-primary-500/35 hover:shadow-primary-glow dark:hover:shadow-primary-glow backdrop-blur-md',
    secondary: 'border border-secondary-400/30 dark:border-secondary-500/20 border-t-secondary-300/50 border-l-secondary-300/50 dark:border-t-secondary-400/30 dark:border-l-secondary-400/30 bg-secondary-500/30 dark:bg-secondary-500/20 text-secondary-700 dark:text-secondary-400 hover:bg-secondary-500/40 dark:hover:bg-secondary-500/30 hover:border-secondary-400/45 dark:hover:border-secondary-500/35 hover:shadow-secondary-glow dark:hover:shadow-secondary-glow backdrop-blur-md',
  };

  let activeClass = $derived(variant === 'primary' || variant === 'secondary' ? 'active:scale-95' : 'active:translate-y-[1px]');
  let variantClass = $derived(variantClasses[variant]);

  // Combine computed classes
  let buttonClass = $derived(
      `group relative overflow-hidden flex items-center justify-center shrink-0 transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 dark:focus-visible:ring-primary-500/30 disabled:opacity-30 disabled:pointer-events-none ${ sizeClass } ${ variantClass } ${ activeClass } ${ className }`,
  );
</script>

{#if tooltip}
    <button
            use:tooltipAction={tooltip}
            class={buttonClass}
            {...restProps}
    >
        {#if variant !== 'ghost'}
            <span class="absolute inset-0 bg-gradient-to-br from-white/35 dark:from-white/12 via-transparent to-transparent opacity-80 group-hover:opacity-100 group-hover:from-white/50 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300 pointer-events-none rounded-[inherit]"></span>
        {/if}
        <span class="relative z-10 flex items-center justify-center">
            {@render children?.()}
        </span>
    </button>
{:else}
    <button
            class={buttonClass}
            {...restProps}
    >
        {#if variant !== 'ghost'}
            <span class="absolute inset-0 bg-gradient-to-br from-white/35 dark:from-white/12 via-transparent to-transparent opacity-80 group-hover:opacity-100 group-hover:from-white/50 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300 pointer-events-none rounded-[inherit]"></span>
        {/if}
        <span class="relative z-10 flex items-center justify-center">
            {@render children?.()}
        </span>
    </button>
{/if}
