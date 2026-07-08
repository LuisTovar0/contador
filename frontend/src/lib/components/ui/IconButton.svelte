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
    size = 'lg',
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
    outline: 'border border-btn-outline-border border-t-btn-outline-border-t border-l-btn-outline-border-l bg-btn-outline-bg text-btn-outline-text hover:text-btn-outline-hover-text hover:bg-btn-outline-hover-bg hover:border-btn-outline-hover-border backdrop-blur-md shadow-btn-outline-inset',
    ghost: 'bg-transparent text-text-alt hover:text-icon-ghost-hover hover:bg-icon-ghost-hover',
    danger: 'bg-transparent text-text-alt hover:text-icon-danger-hover hover:bg-icon-danger-hover backdrop-blur-sm',
    'danger-outline': 'border border-btn-danger-border border-t-btn-danger-border-t border-l-btn-danger-border-l bg-btn-danger-bg text-btn-danger-text hover:text-btn-danger-hover-text hover:border-btn-danger-hover-border hover:bg-btn-danger-hover-bg backdrop-blur-sm shadow-btn-danger-inset',
    primary: 'border border-primary-icon border-t-primary-icon border-l-primary-icon bg-primary-icon text-primary-brand-subtle hover:bg-primary-icon-hover hover:border-primary-icon-hover hover:shadow-primary-glow backdrop-blur-md',
    secondary: 'border border-secondary-icon border-t-secondary-icon border-l-secondary-icon bg-secondary-icon text-secondary-brand hover:bg-secondary-icon-hover hover:border-secondary-icon-hover hover:shadow-secondary-glow backdrop-blur-md',
  };

  let activeClass = $derived(variant === 'primary' || variant === 'secondary' ? 'active:scale-95' : 'active:translate-y-[1px]');
  let variantClass = $derived(variantClasses[variant]);

  // Combine computed classes
  let buttonClass = $derived(
      `group relative overflow-hidden flex items-center justify-center shrink-0 transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary disabled:pointer-events-none ${ sizeClass } ${ variantClass } ${ activeClass } ${ className }`,
  );
</script>

{#if tooltip}
    <button
            use:tooltipAction={tooltip}
            class={buttonClass}
            {...restProps}
    >
        {#if variant !== 'ghost'}
            <span class="absolute inset-0 bg-gradient-to-br from-glass-specular via-transparent to-transparent opacity-80 group-hover:opacity-100 group-hover:from-white/50 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300 pointer-events-none rounded-[inherit]"></span>
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
            <span class="absolute inset-0 bg-gradient-to-br from-glass-specular via-transparent to-transparent opacity-80 group-hover:opacity-100 group-hover:from-white/50 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-300 pointer-events-none rounded-[inherit]"></span>
        {/if}
        <span class="relative z-10 flex items-center justify-center">
            {@render children?.()}
        </span>
    </button>
{/if}

