<script lang="ts">
	import Modal from './Modal.svelte';
	import { counterStore } from '$lib/store';
	import { X, Plus, Trash2, Hash, Sparkles } from 'lucide-svelte';

	interface Props {
		show?: boolean;
		onclose: () => void;
	}

	let { show = false, onclose }: Props = $props();

	let name = $state('');
	let unit = $state('');
	let decimals = $state(0);
	let increments = $state<number[]>([1]); // Default to single [1]
	let errorMessage = $state<string | null>(null);

	$effect(() => {
		if (show) {
			// Reset form when shown
			name = '';
			unit = '';
			decimals = 0;
			increments = [1];
			errorMessage = null;
		}
	});

	function addIncrement() {
		if (increments.length >= 3) return;
		increments = [...increments, 1];
	}

	function removeIncrement(index: number) {
		if (increments.length <= 1) return;
		increments = increments.filter((_, i) => i !== index);
	}

	function updateIncrementValue(index: number, val: string) {
		const parsed = parseFloat(val);
		increments[index] = isNaN(parsed) ? 0 : parsed;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = null;

		if (!name.trim()) {
			errorMessage = 'Counter name is required.';
			return;
		}

		if (increments.length < 1 || increments.length > 3) {
			errorMessage = 'You must have between 1 and 3 default increments.';
			return;
		}

		try {
			await counterStore.createCounter(
				name.trim(),
				decimals,
				unit.trim(),
				increments
			);
			onclose();
		} catch (err: any) {
			errorMessage = err.message || 'Failed to create counter.';
		}
	}
</script>

<Modal {show} {onclose}>
	<div class="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
		<h2 class="text-xl font-bold flex items-center gap-2 text-purple-400">
			<Sparkles size={20} class="text-purple-400" />
			<span>New Counter</span>
		</h2>
		<button
			onclick={onclose}
			class="text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-white/5"
			aria-label="Close"
		>
			<X size={20} />
		</button>
	</div>

	<form onsubmit={handleSubmit} class="flex-1 overflow-y-auto space-y-4 pr-1 text-sm">
		{#if errorMessage}
			<div class="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
				{errorMessage}
			</div>
		{/if}

		<!-- Counter Name -->
		<div>
			<label for="counterName" class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
				>Counter Name *</label
			>
			<input
				type="text"
				id="counterName"
				bind:value={name}
				placeholder="e.g. Water Intake, Daily Steps"
				required
				class="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50"
			/>
		</div>

		<!-- Unit -->
		<div>
			<label for="counterUnit" class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
				>Unit (free text)</label
			>
			<input
				type="text"
				id="counterUnit"
				bind:value={unit}
				placeholder="e.g. Liters, reps, cups, km"
				class="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50"
			/>
		</div>

		<!-- Decimals selection -->
		<div>
			<label class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
				>Decimal Precision</label
			>
			<div class="grid grid-cols-4 gap-2">
				{#each [0, 1, 2, 3] as d}
					<button
						type="button"
						onclick={() => (decimals = d)}
						class="py-2 px-3 rounded-xl border font-semibold transition-all text-center
						{decimals === d
							? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
							: 'bg-zinc-950/30 border-white/5 text-zinc-400 hover:border-white/10'}"
					>
						{d} {d === 0 ? '(Integer)' : `(0.${'0'.repeat(d)})`}
					</button>
				{/each}
			</div>
		</div>

		<!-- Default increments -->
		<div>
			<div class="flex items-center justify-between mb-1.5">
				<label class="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
					>Default Increments / Decrements</label
				>
				<span class="text-xs text-zinc-500">({increments.length}/3 buttons)</span>
			</div>

			<div class="space-y-2.5">
				{#each increments as value, index}
					<div class="flex items-center gap-2">
						<div class="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 text-purple-400 font-bold shrink-0">
							#{index + 1}
						</div>
						<div class="relative flex-1">
							<span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
								<Hash size={14} />
							</span>
							<input
								type="number"
								step={decimals === 0 ? '1' : (1 / Math.pow(10, decimals)).toString()}
								value={value}
								oninput={(e) => updateIncrementValue(index, e.currentTarget.value)}
								placeholder="Increment value"
								class="w-full bg-zinc-950/50 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50"
							/>
						</div>
						{#if increments.length > 1}
							<button
								type="button"
								onclick={() => removeIncrement(index)}
								class="p-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
								title="Delete button"
							>
								<Trash2 size={16} />
							</button>
						{/if}
					</div>
				{/each}

				{#if increments.length < 3}
					<button
						type="button"
						onclick={addIncrement}
						class="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-white/10 hover:border-purple-500/40 text-purple-400 hover:text-purple-300 rounded-xl transition-all bg-white/[0.01]"
					>
						<Plus size={16} />
						<span>Add Increment Button</span>
					</button>
				{/if}
			</div>
		</div>

		<div class="border-t border-white/10 pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
			<button
				type="button"
				onclick={onclose}
				class="px-4 py-2 border border-white/10 hover:bg-white/5 text-zinc-300 rounded-xl font-semibold transition-all active:scale-[0.98] text-xs"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-zinc-100 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] active:scale-[0.98] text-xs"
			>
				Create Counter
			</button>
		</div>
	</form>
</Modal>
