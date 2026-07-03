<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	interface Props {
		show?: boolean;
		onclose: () => void;
		children?: import('svelte').Snippet;
	}

	let { show = false, onclose, children }: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && show) {
			onclose();
		}
	}

	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				if (node.parentNode) {
					node.parentNode.removeChild(node);
				}
			}
		};
	}
</script>

{#if show}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		use:portal
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
			class="relative w-full max-w-md transform rounded-t-2xl sm:rounded-2xl border-t sm:border border-zinc-200 dark:border-purple-500/20 bg-white dark:bg-zinc-950/80 p-6 pb-8 sm:pb-6 text-zinc-900 dark:text-zinc-100 shadow-xl dark:shadow-2xl backdrop-blur-xl max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-zinc-200/50 dark:ring-purple-500/20"
		>
			{@render children?.()}
		</div>
	</div>
{/if}

