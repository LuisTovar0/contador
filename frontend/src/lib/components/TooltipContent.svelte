<script lang="ts">
	import { fade } from 'svelte/transition';

	interface Props {
		text: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		triggerEl: HTMLElement;
	}

	let { text, position = 'top', triggerEl }: Props = $props();

	let tooltipEl = $state<HTMLElement | null>(null);

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

		tooltipEl.style.top = `${top + window.scrollY}px`;
		tooltipEl.style.left = `${left + window.scrollX}px`;
		tooltipEl.style.visibility = 'visible';
	}

	// Recalculate when trigger or text changes
	$effect(() => {
		// Read text to subscribe to updates
		const _ = text;
		// Wait a tick for text reflow to finish before measurement
		setTimeout(updatePosition, 0);
	});

	$effect(() => {
		// Handle position updates during window changes
		window.addEventListener('resize', updatePosition, { passive: true });
		window.addEventListener('scroll', updatePosition, { passive: true });
		
		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition);
		};
	});
</script>

<div
	bind:this={tooltipEl}
	transition:fade={{ duration: 120 }}
	role="tooltip"
	style="top: 0px; left: 0px; visibility: hidden;"
	class="absolute z-[9999] pointer-events-none px-2.5 py-1.5 rounded-lg border border-zinc-250 dark:border-purple-500/20 bg-white/95 dark:bg-zinc-950/80 text-[11px] font-medium text-zinc-700 dark:text-zinc-200 shadow-md dark:shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-md whitespace-nowrap tracking-wide select-none"
>
	{text}
</div>
