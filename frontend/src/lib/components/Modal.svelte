<script lang="ts">
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
</script>

{#if show}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none"
		role="dialog"
		aria-modal="true"
		onkeydown={handleKeydown}
	>
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 ease-out"
			onclick={onclose}
		></div>

		<!-- Modal Container -->
		<div
			class="relative w-full max-w-md transform rounded-2xl border border-white/10 bg-zinc-950/70 p-6 text-zinc-100 shadow-2xl backdrop-blur-xl transition-all duration-300 scale-100 max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-purple-500/20"
		>
			{@render children?.()}
		</div>
	</div>
{/if}
