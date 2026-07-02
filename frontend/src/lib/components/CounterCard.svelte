<script lang="ts">
	import { counterStore, type Counter } from '$lib/store.svelte';
	import Modal from './Modal.svelte';
	import { Edit3, Trash2, HelpCircle, History, Clock, Keyboard, Percent, ChevronDown, ChevronUp, Plus, Minus, X } from 'lucide-svelte';

	interface Props {
		counter: Counter;
	}

	let { counter }: Props = $props();

	// Modal states
	let showSetValModal = $state(false);
	let showCustomAdjustModal = $state(false);
	let showDeleteConfirm = $state(false);
	let showCardHistory = $state(false);

	// Form states
	let newValueInput = $state(counter.value.toString());
	let customAdjustInput = $state('1');
	let isCustomPositive = $state(true); // true = add, false = subtract

	// Animations
	let valPopAnimation = $state(false);

	// Sync local inputs when counter changes from other syncs
	$effect(() => {
		if (showSetValModal) {
			newValueInput = counter.value.toString();
		}
	});

	// Filter history specifically for this counter
	let localHistory = $derived(() => {
		return counterStore.history.filter((h) => h.counterId === counter.id).slice(0, 5);
	});

	function formatVal(val: number) {
		return val.toFixed(counter.decimals);
	}

	function triggerValuePop() {
		valPopAnimation = true;
		setTimeout(() => {
			valPopAnimation = false;
		}, 180);
	}

	async function handleQuickIncrement(inc: number) {
		triggerValuePop();
		const finalVal = counter.value + inc;
		const desc = inc >= 0
			? `Quick incremented by +${inc} ${counter.unit}`.trim()
			: `Quick decremented by ${inc} ${counter.unit}`.trim();
		await counterStore.updateCounterValue(counter.id, finalVal, desc);
	}

	async function handleSetExactValue() {
		const parsed = parseFloat(newValueInput);
		if (isNaN(parsed)) return;

		await counterStore.updateCounterValue(
			counter.id,
			parsed,
			`Set value directly to ${parsed} ${counter.unit}`.trim()
		);
		showSetValModal = false;
	}

	async function handleCustomAdjust() {
		const parsed = parseFloat(customAdjustInput);
		if (isNaN(parsed)) return;

		const delta = isCustomPositive ? parsed : -parsed;
		const finalVal = counter.value + delta;
		const desc = delta >= 0
			? `Adjusted custom by +${parsed} ${counter.unit}`.trim()
			: `Adjusted custom by -${parsed} ${counter.unit}`.trim();

		triggerValuePop();
		await counterStore.updateCounterValue(counter.id, finalVal, desc);
		showCustomAdjustModal = false;
	}

	async function handleDelete() {
		await counterStore.deleteCounter(counter.id);
		showDeleteConfirm = false;
	}

	function formatTime(timestamp: number) {
		return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div
	class="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/45 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-purple-500/30 hover:shadow-purple-500/5 group flex flex-col gap-4"
>
	<!-- Card Glow backdrops -->
	<div class="absolute -right-16 -top-16 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/15 transition-all"></div>
	<div class="absolute -left-16 -bottom-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>

	<!-- Header -->
	<div class="flex items-start justify-between relative z-10">
		<div class="min-w-0 flex-1 pr-2">
			<h3 class="font-bold text-base text-zinc-100 truncate group-hover:text-purple-300 transition-colors">
				{counter.name}
			</h3>
			{#if counter.unit}
				<span class="text-[10px] font-semibold text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider select-none">
					{counter.unit}
				</span>
			{/if}
		</div>

		<div class="flex items-center gap-1">
			<!-- Edit button -->
			<button
				onclick={() => {
					newValueInput = counter.value.toString();
					showSetValModal = true;
				}}
				class="p-1.5 rounded-lg border border-white/5 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:border-white/10 transition-all"
				title="Set direct value"
			>
				<Keyboard size={14} />
			</button>
			<!-- Toggle history -->
			<button
				onclick={() => (showCardHistory = !showCardHistory)}
				class="p-1.5 rounded-lg border border-white/5 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:border-white/10 transition-all {showCardHistory ? 'text-purple-400 border-purple-500/20 bg-purple-500/5' : ''}"
				title="Card History"
			>
				<History size={14} />
			</button>
			<!-- Delete button -->
			<button
				onclick={() => (showDeleteConfirm = true)}
				class="p-1.5 rounded-lg border border-white/5 bg-zinc-900/50 text-zinc-400 hover:text-red-400 hover:border-red-500/20 transition-all"
				title="Delete counter"
			>
				<Trash2 size={14} />
			</button>
		</div>
	</div>

	<!-- Value display -->
	<div class="flex flex-col items-center justify-center py-4 relative z-10 shrink-0 select-none">
		<div
			class="text-5xl font-extrabold font-mono tracking-tight text-zinc-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-transform duration-150
			{valPopAnimation ? 'scale-110 text-purple-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'scale-100'}"
		>
			{formatVal(counter.value)}
		</div>
		<p class="text-[10px] text-zinc-500 font-mono mt-1">
			Precision: {counter.decimals} {counter.decimals === 1 ? 'decimal' : 'decimals'}
		</p>
	</div>

	<!-- Action Controls -->
	<div class="grid grid-cols-1 gap-2.5 relative z-10 shrink-0">
		<!-- Quick increments -->
		<div class="flex gap-2">
			{#each counter.increments as inc}
				<button
					onclick={() => handleQuickIncrement(inc)}
					class="flex-1 py-2 px-3 border rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-1 active:scale-95
					{inc >= 0
						? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_10px_rgba(34,197,94,0.15)]'
						: 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/40 hover:shadow-[0_0_10px_rgba(168,85,247,0.15)]'}"
				>
					<span>{inc >= 0 ? '+' : ''}{inc}</span>
				</button>
			{/each}
		</div>

		<!-- Custom adjustments button -->
		<button
			onclick={() => {
				customAdjustInput = '1';
				showCustomAdjustModal = true;
			}}
			class="w-full py-2 border border-white/10 hover:border-white/20 bg-zinc-900/30 text-zinc-300 hover:text-zinc-100 rounded-xl font-semibold transition-all text-xs flex items-center justify-center gap-1.5 active:scale-[0.98]"
		>
			<span>Custom Adjustment...</span>
		</button>
	</div>

	<!-- Inline Card History -->
	{#if showCardHistory}
		<div class="border-t border-white/5 pt-3 mt-1 space-y-2 relative z-10">
			<div class="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
				<Clock size={10} />
				<span>Recent Logs</span>
			</div>
			<div class="space-y-2 max-h-[140px] overflow-y-auto pr-1">
				{#if localHistory().length === 0}
					<p class="text-[10px] text-zinc-600">No changes logged yet.</p>
				{:else}
					{#each localHistory() as entry (entry.id)}
						<div class="text-[10px] leading-relaxed border-b border-white/[0.03] pb-1.5 last:border-0 last:pb-0 flex items-start justify-between gap-2">
							<span class="text-zinc-400 truncate pr-1">
								{entry.description}
							</span>
							<span class="text-zinc-600 font-mono shrink-0">
								{formatTime(entry.timestamp)}
							</span>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- SET EXACT VALUE MODAL -->
<Modal show={showSetValModal} onclose={() => (showSetValModal = false)}>
	<div class="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
		<h2 class="text-lg font-bold text-purple-400 flex items-center gap-2">
			<Keyboard size={18} />
			<span>Set Exact Value</span>
		</h2>
		<button
			onclick={() => (showSetValModal = false)}
			class="text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg"
		>
			<X size={18} />
		</button>
	</div>

	<div class="space-y-4">
		<p class="text-xs text-zinc-400 leading-normal">
			Update the counter <strong class="text-zinc-300">"{counter.name}"</strong> directly.
		</p>
		<div>
			<label for="newValue" class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
				>New Value ({counter.unit || 'no unit'})</label
			>
			<input
				type="number"
				id="newValue"
				step={counter.decimals === 0 ? '1' : (1 / Math.pow(10, counter.decimals)).toString()}
				bind:value={newValueInput}
				class="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50 font-mono text-base"
			/>
		</div>
	</div>

	<div class="border-t border-white/10 pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
		<button
			type="button"
			onclick={() => (showSetValModal = false)}
			class="px-4 py-2 border border-white/10 hover:bg-white/5 text-zinc-300 rounded-xl font-semibold transition-all text-xs"
		>
			Cancel
		</button>
		<button
			type="button"
			onclick={handleSetExactValue}
			class="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-zinc-100 rounded-xl font-bold transition-all text-xs"
		>
			Save Value
		</button>
	</div>
</Modal>

<!-- CUSTOM ADJUSTMENT MODAL -->
<Modal show={showCustomAdjustModal} onclose={() => (showCustomAdjustModal = false)}>
	<div class="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
		<h2 class="text-lg font-bold text-purple-400 flex items-center gap-2">
			<Edit3 size={18} />
			<span>Custom Adjustment</span>
		</h2>
		<button
			onclick={() => (showCustomAdjustModal = false)}
			class="text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg"
		>
			<X size={18} />
		</button>
	</div>

	<div class="space-y-4">
		<p class="text-xs text-zinc-400 leading-normal">
			Choose how much to adjust the counter <strong class="text-zinc-300">"{counter.name}"</strong> by.
		</p>

		<!-- Direction selection -->
		<div class="grid grid-cols-2 gap-2">
			<button
				type="button"
				onclick={() => (isCustomPositive = true)}
				class="py-2.5 border rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5
				{isCustomPositive
					? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(34,197,94,0.15)]'
					: 'bg-zinc-950/30 border-white/5 text-zinc-400 hover:border-white/10'}"
			>
				<Plus size={14} />
				<span>Increment (+)</span>
			</button>
			<button
				type="button"
				onclick={() => (isCustomPositive = false)}
				class="py-2.5 border rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5
				{!isCustomPositive
					? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
					: 'bg-zinc-950/30 border-white/5 text-zinc-400 hover:border-white/10'}"
			>
				<Minus size={14} />
				<span>Decrement (-)</span>
			</button>
		</div>

		<div>
			<label for="customAmount" class="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
				>Adjustment Amount ({counter.unit || 'no unit'})</label
			>
			<input
				type="number"
				id="customAmount"
				min="0"
				step={counter.decimals === 0 ? '1' : (1 / Math.pow(10, counter.decimals)).toString()}
				bind:value={customAdjustInput}
				class="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors focus:ring-1 focus:ring-purple-500/50 font-mono text-base"
			/>
		</div>
	</div>

	<div class="border-t border-white/10 pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
		<button
			type="button"
			onclick={() => (showCustomAdjustModal = false)}
			class="px-4 py-2 border border-white/10 hover:bg-white/5 text-zinc-300 rounded-xl font-semibold transition-all text-xs"
		>
			Cancel
		</button>
		<button
			type="button"
			onclick={handleCustomAdjust}
			class="px-5 py-2.5 text-zinc-100 rounded-xl font-bold transition-all text-xs
			{isCustomPositive ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'}"
		>
			Apply {isCustomPositive ? 'Addition' : 'Subtraction'}
		</button>
	</div>
</Modal>

<!-- DELETE CONFIRMATION MODAL -->
<Modal show={showDeleteConfirm} onclose={() => (showDeleteConfirm = false)}>
	<div class="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
		<h2 class="text-lg font-bold text-red-400 flex items-center gap-2">
			<Trash2 size={18} />
			<span>Delete Counter</span>
		</h2>
		<button
			onclick={() => (showDeleteConfirm = false)}
			class="text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg"
		>
			<X size={18} />
		</button>
	</div>

	<div class="space-y-3">
		<p class="text-sm text-zinc-300 leading-relaxed">
			Are you sure you want to delete <strong class="text-zinc-100">"{counter.name}"</strong>?
		</p>
		<p class="text-xs text-zinc-500 leading-normal">
			This action cannot be undone. Its counter configuration and value will be permanently deleted, though the activity history log will retain the deletion record.
		</p>
	</div>

	<div class="border-t border-white/10 pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
		<button
			type="button"
			onclick={() => (showDeleteConfirm = false)}
			class="px-4 py-2 border border-white/10 hover:bg-white/5 text-zinc-300 rounded-xl font-semibold transition-all text-xs"
		>
			Cancel
		</button>
		<button
			type="button"
			onclick={handleDelete}
			class="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-zinc-100 rounded-xl font-bold transition-all text-xs shadow-[0_0_15px_rgba(239,68,68,0.3)]"
		>
			Delete Permanently
		</button>
	</div>
</Modal>
