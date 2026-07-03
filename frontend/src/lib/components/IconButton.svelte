<script lang="ts">
	import { tooltip as tooltipAction, type TooltipOptions } from './tooltip.svelte.ts';
	import type { Snippet } from 'svelte';

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
					: (shape === 'circle' ? 'w-12 h-12 rounded-full text-lg' : 'w-12 h-12 rounded-2xl text-lg')
	);

	const variantClasses = {
		outline: 'border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 hover:dark:text-zinc-200 hover:border-zinc-300 hover:dark:border-white/10',
		ghost: 'bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 hover:dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5',
		danger: 'bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-red-650 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10',
		'danger-outline': 'border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-950/50 hover:bg-red-50 dark:hover:bg-red-950/10',
		primary: 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm border border-purple-500/20 dark:shadow-[0_0_15px_rgba(168,85,247,0.3)]',
		secondary: 'bg-emerald-600 hover:bg-emerald-505 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/35 text-white dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 dark:shadow-[0_0_15px_rgba(34,197,94,0.25)]'
	};

	let activeClass = $derived(variant === 'primary' ? 'active:scale-95' : 'active:translate-y-[1px]');
	let variantClass = $derived(variantClasses[variant]);

	// Combine computed classes
	let buttonClass = $derived(
		`flex items-center justify-center shrink-0 transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 dark:focus-visible:ring-purple-500/30 disabled:opacity-30 disabled:pointer-events-none ${sizeClass} ${variantClass} ${activeClass} ${className}`
	);
</script>

{#if tooltip}
	<button
		use:tooltipAction={tooltip}
		class={buttonClass}
		{...restProps}
	>
		{@render children?.()}
	</button>
{:else}
	<button
		class={buttonClass}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
