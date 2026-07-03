<script lang="ts">
	import { counterStore, type Counter } from '$lib/store.svelte';
	import Modal from './Modal.svelte';
	import IconButton from './IconButton.svelte';
	import { tooltip } from './tooltip.svelte.ts';
	import {
		Edit3,
		Trash2,
		Clock,
		Keyboard,
		Plus,
		Minus,
		X,
		Settings,
		Hash,
		Undo2,
		Redo2,
		CornerDownRight,
		MoreVertical
	} from 'lucide-svelte';

	interface Props {
		counter: Counter;
	}

	let { counter }: Props = $props();

	// Dropdown state
	let showActionMenu = $state(false);
	let menuContainer = $state<HTMLDivElement | null>(null);

	// Modal states
	let showSetValModal = $state(false);
	let showCustomAdjustModal = $state(false);
	let showDeleteConfirm = $state(false);
	let showCardHistory = $state(false);
	let showSettingsModal = $state(false);

	// Form states
	let newValueInput = $state('');
	let customAdjustInput = $state('1');
	let isCustomPositive = $state(true);

	// Settings edit states
	let editName = $state('');
	let editUnit = $state('');
	let editDecimals = $state(0);
	let editIncrements = $state<number[]>([]);
	let settingsError = $state<string | null>(null);

	// Animations
	let valPopAnimation = $state(false);

	// Sync local inputs
	$effect(() => {
		if (showSetValModal) {
			newValueInput = counter.value.toString();
		}
	});

	$effect(() => {
		if (showSettingsModal) {
			editName = counter.name;
			editUnit = counter.unit;
			editDecimals = counter.decimals;
			editIncrements = [...counter.increments];
			settingsError = null;
		}
	});

	let localHistory = $derived(() => {
		return counterStore.history.filter((h) => h.counterId === counter.id).slice(0, 3);
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
		await counterStore.updateCounterValue(counter.id, finalVal, desc, false, 'Quick Adjust');
	}

	async function handleSetExactValue() {
		const parsed = parseFloat(newValueInput);
		if (isNaN(parsed)) return;

		await counterStore.updateCounterValue(
			counter.id,
			parsed,
			`Set value directly to ${parsed} ${counter.unit}`.trim(),
			false,
			'Direct Set'
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
		await counterStore.updateCounterValue(counter.id, finalVal, desc, false, 'Custom Adjust');
		showCustomAdjustModal = false;
	}

	async function handleDelete() {
		await counterStore.deleteCounter(counter.id);
		showDeleteConfirm = false;
	}

	function addEditIncrement() {
		if (editIncrements.length >= 3) return;
		editIncrements = [...editIncrements, 1];
	}

	function removeEditIncrement(index: number) {
		if (editIncrements.length <= 1) return;
		editIncrements = editIncrements.filter((_, i) => i !== index);
	}

	function updateEditIncrementValue(index: number, val: string) {
		const parsed = parseFloat(val);
		editIncrements[index] = isNaN(parsed) ? 0 : parsed;
	}

	async function handleSaveSettings(e: SubmitEvent) {
		e.preventDefault();
		settingsError = null;

		if (!editName.trim()) {
			settingsError = 'Counter name is required.';
			return;
		}

		if (editIncrements.length < 1 || editIncrements.length > 3) {
			settingsError = 'You must have between 1 and 3 default increments.';
			return;
		}

		try {
			await counterStore.updateCounterSettings(
				counter.id,
				editName.trim(),
				editDecimals,
				editUnit.trim(),
				editIncrements
			);
			showSettingsModal = false;
		} catch (err: any) {
			settingsError = err.message || 'Failed to update settings.';
		}
	}

	function formatTime(timestamp: number) {
		return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<svelte:window onclick={(e) => {
	if (showActionMenu && menuContainer && !menuContainer.contains(e.target as Node)) {
		showActionMenu = false;
	}
}} />

<div class="border-b border-zinc-200 dark:border-zinc-800/80 last:border-b-0">
	<!-- Main Row -->
	<div class="grid grid-cols-[1fr_auto] md:grid-cols-[2.5fr_1fr_1.8fr_1.5fr] items-center gap-x-4 gap-y-2.5 md:gap-4 py-3 px-4 md:py-3.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
		<!-- Name & Unit -->
		<div class="min-w-0 flex flex-row items-center gap-1.5 w-auto">
			<span class="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
				{counter.name}
			</span>
			{#if counter.unit}
				<span class="inline-block w-fit text-[8px] font-bold text-zinc-500 dark:text-zinc-450 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 px-1.5 py-0.5 rounded-md uppercase tracking-wider select-none shrink-0">
					{counter.unit}
				</span>
			{/if}
		</div>

		<!-- Current Value -->
		<div class="flex items-center gap-2 select-none justify-end w-auto">
			<span class="text-[10px] text-zinc-400 dark:text-zinc-500 md:hidden uppercase tracking-wider font-bold">Value:</span>
			<span
				class="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-50 tabular-nums transition-all duration-100
				{valPopAnimation ? 'scale-110 text-purple-650 dark:text-purple-400' : 'scale-100'}"
			>
				{formatVal(counter.value)}
			</span>
		</div>

		<!-- Quick Adjustments -->
		<div class="flex items-center gap-1.5 w-auto flex-wrap">
			<span class="text-[10px] text-zinc-400 dark:text-zinc-500 md:hidden uppercase tracking-wider font-bold mr-1">Adjust:</span>
			{#each counter.increments as inc}
				<div class="flex items-center gap-1 shrink-0">
					<button
						onclick={() => handleQuickIncrement(-Math.abs(inc))}
						class="px-2.5 py-1 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg font-semibold transition-all active:translate-y-[0.5px] cursor-pointer
						bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/10 hover:border-purple-200 dark:hover:border-purple-900/30 hover:text-purple-650 dark:hover:text-purple-400 hover:shadow-[0_0_12px_rgba(168,85,247,0.15)]"
					>
						-{inc}
					</button>
					<button
						onclick={() => handleQuickIncrement(Math.abs(inc))}
						class="px-2.5 py-1 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg font-semibold transition-all active:translate-y-[0.5px] cursor-pointer
						bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 hover:border-emerald-200 dark:hover:border-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-[0_0_12px_rgba(34,197,94,0.15)]"
					>
						+{inc}
					</button>
				</div>
			{/each}
		</div>

		<!-- Actions & System Controls -->
		<div class="flex items-center gap-1.5 justify-end w-auto shrink-0">
			<!-- Undo -->
			<IconButton
				tooltip="Undo last action"
				onclick={() => counterStore.undoCounter(counter.id)}
				disabled={!counterStore.canUndoCounter(counter.id)}
				variant="outline"
				size="sm"
				shape="square"
			>
				<Undo2 size={13} />
			</IconButton>

			<!-- Redo -->
			<IconButton
				tooltip="Redo last action"
				onclick={() => counterStore.redoCounter(counter.id)}
				disabled={!counterStore.canRedoCounter(counter.id)}
				variant="outline"
				size="sm"
				shape="square"
			>
				<Redo2 size={13} />
			</IconButton>

			<!-- Actions Menu Dropdown -->
			<div class="relative" bind:this={menuContainer}>
				<IconButton
					onclick={() => (showActionMenu = !showActionMenu)}
					tooltip="More Actions"
					variant="outline"
					size="sm"
					shape="square"
				>
					<MoreVertical size={13} />
				</IconButton>

				{#if showActionMenu}
					<div class="absolute right-0 mt-1.5 w-48 rounded-xl border border-zinc-200/80 dark:border-purple-500/20 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-lg dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] z-50 overflow-hidden flex flex-col py-1">
						<!-- Adjust Custom -->
						<button
							type="button"
							onclick={() => {
								customAdjustInput = '1';
								showCustomAdjustModal = true;
								showActionMenu = false;
							}}
							class="w-full text-left px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-100 transition-all flex items-center gap-2 cursor-pointer"
						>
							<Edit3 size={13} class="text-zinc-400 dark:text-zinc-500" />
							<span>Custom Adjust</span>
						</button>

						<!-- Set Value -->
						<button
							type="button"
							onclick={() => {
								newValueInput = counter.value.toString();
								showSetValModal = true;
								showActionMenu = false;
							}}
							class="w-full text-left px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-100 transition-all flex items-center gap-2 cursor-pointer"
						>
							<Keyboard size={13} class="text-zinc-400 dark:text-zinc-500" />
							<span>Set Exact Value</span>
						</button>

						<!-- Toggle History -->
						<button
							type="button"
							onclick={() => {
								showCardHistory = !showCardHistory;
								showActionMenu = false;
							}}
							class="w-full text-left px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-100 transition-all flex items-center gap-2 cursor-pointer"
						>
							<Clock size={13} class="text-zinc-400 dark:text-zinc-500" />
							<span>{showCardHistory ? 'Hide Recent Activity' : 'Show Recent Activity'}</span>
						</button>

						<!-- Settings -->
						<button
							type="button"
							onclick={() => {
								showSettingsModal = true;
								showActionMenu = false;
							}}
							class="w-full text-left px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-100 transition-all flex items-center gap-2 cursor-pointer"
						>
							<Settings size={13} class="text-zinc-400 dark:text-zinc-500" />
							<span>Settings</span>
						</button>

						<div class="h-[1px] bg-zinc-100 dark:bg-zinc-800/80 my-1"></div>

						<!-- Delete -->
						<button
							type="button"
							onclick={() => {
								showDeleteConfirm = true;
								showActionMenu = false;
							}}
							class="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center gap-2 cursor-pointer"
						>
							<Trash2 size={13} />
							<span>Delete Counter</span>
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Collapsible History Row -->
	{#if showCardHistory}
		<div class="px-4 pb-3 pt-1 bg-zinc-50/30 dark:bg-zinc-950/20 border-t border-zinc-100 dark:border-zinc-900/40">
			<div class="flex items-center gap-1 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
				<Clock size={10} />
				<span>Recent Changes</span>
			</div>
			<div class="space-y-1.5">
				{#if localHistory().length === 0}
					<p class="text-[10px] text-zinc-400 dark:text-zinc-500 pl-4">No changes logged yet.</p>
				{:else}
					{#each localHistory() as entry (entry.id)}
						<div class="text-[10px] leading-relaxed flex items-center gap-2 pl-4 text-zinc-650 dark:text-zinc-400">
							<CornerDownRight size={10} class="text-zinc-350 dark:text-zinc-600 shrink-0" />
							<span class="truncate flex-1">
								{entry.description}
								{#if entry.method}
									<span class="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold uppercase ml-1.5">via {entry.method}</span>
								{/if}
							</span>
							<span class="text-zinc-400 dark:text-zinc-600 font-mono text-[9px] shrink-0">
								{formatTime(entry.timestamp)}
							</span>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- INLINE MODALS REUSED FOR ROW INTERFACES -->
<!-- SET EXACT VALUE MODAL -->
<Modal show={showSetValModal} onclose={() => (showSetValModal = false)}>
	<div class="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-4">
		<h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
			<Keyboard size={18} class="text-zinc-600 dark:text-zinc-400" />
			<span>Set Exact Value</span>
		</h2>
		<button
			onclick={() => (showSetValModal = false)}
			class="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer"
		>
			<X size={18} />
		</button>
	</div>

	<div class="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
		<p class="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
			Update the counter <strong class="text-zinc-800 dark:text-zinc-300">"{counter.name}"</strong> directly.
		</p>
		<div>
			<label for="newValue-{counter.id}" class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
				>New Value ({counter.unit || 'no unit'})</label
			>
			<input
				type="number"
				id="newValue-{counter.id}"
				step={counter.decimals === 0 ? '1' : (1 / Math.pow(10, counter.decimals)).toString()}
				bind:value={newValueInput}
				class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors focus:ring-1 focus:ring-zinc-500/50 font-mono text-base"
			/>
		</div>
	</div>

	<div class="border-t border-zinc-200 dark:border-white/10 pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
		<button
			type="button"
			onclick={() => (showSetValModal = false)}
			class="px-4 py-2 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold transition-all text-xs cursor-pointer"
		>
			Cancel
		</button>
		<button
			type="button"
			onclick={handleSetExactValue}
			class="px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-sm"
		>
			Save Value
		</button>
	</div>
</Modal>

<!-- CUSTOM ADJUSTMENT MODAL -->
<Modal show={showCustomAdjustModal} onclose={() => (showCustomAdjustModal = false)}>
	<div class="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-4">
		<h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
			<Edit3 size={18} class="text-zinc-600 dark:text-zinc-400" />
			<span>Custom Adjustment</span>
		</h2>
		<button
			onclick={() => (showCustomAdjustModal = false)}
			class="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer"
		>
			<X size={18} />
		</button>
	</div>

	<div class="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
		<p class="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
			Choose how much to adjust the counter <strong class="text-zinc-800 dark:text-zinc-300">"{counter.name}"</strong> by.
		</p>

		<!-- Direction selection -->
		<div class="grid grid-cols-2 gap-2">
			<button
				type="button"
				onclick={() => (isCustomPositive = true)}
				class="py-2.5 border rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer
				{isCustomPositive
					? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
					: 'bg-zinc-50 dark:bg-zinc-950/30 border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/10'}"
			>
				<Plus size={14} />
				<span>Increment (+)</span>
			</button>
			<button
				type="button"
				onclick={() => (isCustomPositive = false)}
				class="py-2.5 border rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer
				{!isCustomPositive
					? 'bg-rose-50 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500 text-rose-700 dark:text-rose-300 shadow-sm'
					: 'bg-zinc-50 dark:bg-zinc-950/30 border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/10'}"
			>
				<Minus size={14} />
				<span>Decrement (-)</span>
			</button>
		</div>

		<div>
			<label for="customAmount-{counter.id}" class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
				>Adjustment Amount ({counter.unit || 'no unit'})</label
			>
			<input
				type="number"
				id="customAmount-{counter.id}"
				min="0"
				step={counter.decimals === 0 ? '1' : (1 / Math.pow(10, counter.decimals)).toString()}
				bind:value={customAdjustInput}
				class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors focus:ring-1 focus:ring-zinc-500/50 font-mono text-base"
			/>
		</div>
	</div>

	<div class="border-t border-zinc-200 dark:border-white/10 pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
		<button
			type="button"
			onclick={() => (showCustomAdjustModal = false)}
			class="px-4 py-2 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold transition-all text-xs cursor-pointer"
		>
			Cancel
		</button>
		<button
			type="button"
			onclick={handleCustomAdjust}
			class="px-5 py-2.5 text-zinc-100 rounded-xl font-bold transition-all text-xs cursor-pointer
			{isCustomPositive ? 'bg-emerald-600 hover:bg-emerald-500 shadow-sm' : 'bg-rose-600 hover:bg-rose-500 shadow-sm'}"
		>
			Apply {isCustomPositive ? 'Addition' : 'Subtraction'}
		</button>
	</div>
</Modal>

<!-- DELETE CONFIRMATION MODAL -->
<Modal show={showDeleteConfirm} onclose={() => (showDeleteConfirm = false)}>
	<div class="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-4">
		<h2 class="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
			<Trash2 size={18} />
			<span>Delete Counter</span>
		</h2>
		<button
			onclick={() => (showDeleteConfirm = false)}
			class="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer"
		>
			<X size={18} />
		</button>
	</div>

	<div class="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
		<p class="text-sm text-zinc-855 dark:text-zinc-300 leading-relaxed">
			Are you sure you want to delete <strong class="text-zinc-950 dark:text-zinc-100">"{counter.name}"</strong>?
		</p>
		<p class="text-xs text-zinc-400 dark:text-zinc-500 leading-normal">
			This action cannot be undone. Its configuration and value will be permanently deleted, though the activity history log will retain the deletion record.
		</p>
	</div>

	<div class="border-t border-zinc-200 dark:border-white/10 pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
		<button
			type="button"
			onclick={() => (showDeleteConfirm = false)}
			class="px-4 py-2 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold transition-all text-xs cursor-pointer"
		>
			Cancel
		</button>
		<button
			type="button"
			onclick={handleDelete}
			class="px-5 py-2.5 bg-red-650 hover:bg-red-500 text-zinc-100 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-sm"
		>
			Delete Permanently
		</button>
	</div>
</Modal>

<!-- COUNTER SETTINGS MODAL -->
<Modal show={showSettingsModal} onclose={() => (showSettingsModal = false)}>
	<div class="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-4">
		<h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
			<Settings size={18} class="text-zinc-600 dark:text-zinc-400" />
			<span>Counter Settings</span>
		</h2>
		<button
			onclick={() => (showSettingsModal = false)}
			class="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer"
		>
			<X size={18} />
		</button>
	</div>

	<form onsubmit={handleSaveSettings} class="flex-1 flex flex-col min-h-0 text-sm">
		<div class="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
			{#if settingsError}
				<div class="p-3 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-455 rounded-xl text-xs">
					{settingsError}
				</div>
			{/if}

			<!-- Counter Name -->
			<div>
				<label for="editCounterName-{counter.id}" class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
					>Counter Name *</label
				>
				<input
					type="text"
					id="editCounterName-{counter.id}"
					bind:value={editName}
					placeholder="e.g. Water Intake, Daily Steps"
					required
					class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors focus:ring-1 focus:ring-zinc-500/50 text-base md:text-sm"
				/>
			</div>

			<!-- Unit -->
			<div>
				<label for="editCounterUnit-{counter.id}" class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
					>Unit (free text)</label
				>
				<input
					type="text"
					id="editCounterUnit-{counter.id}"
					bind:value={editUnit}
					placeholder="e.g. Liters, reps, cups, km"
					class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors focus:ring-1 focus:ring-zinc-500/50 text-base md:text-sm"
				/>
			</div>

			<!-- Decimals selection -->
			<div>
				<span class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"
					>Decimal Precision</span>
				<div class="grid grid-cols-4 gap-2">
					{#each [0, 1, 2, 3] as d}
						<button
							type="button"
							onclick={() => (editDecimals = d)}
							class="py-2 px-1 rounded-xl border font-semibold transition-all text-center cursor-pointer text-xs
							{editDecimals === d
								? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-950 dark:border-white text-zinc-50 dark:text-zinc-950 shadow-sm'
								: 'bg-zinc-50 dark:bg-zinc-950/30 border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/10'}"
						>
							{d === 0 ? 'Int' : `.${'0'.repeat(d)}`}
						</button>
					{/each}
				</div>
			</div>

			<!-- Default increments -->
			<div>
				<div class="flex items-center justify-between mb-1.5">
					<span class="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
						>Default Increments</span>
					<span class="text-xs text-zinc-400 dark:text-zinc-500">({editIncrements.length}/3 buttons)</span>
				</div>

				<div class="space-y-2.5">
					{#each editIncrements as value, index}
						<div class="flex items-center gap-2">
							<div class="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-white/10 text-zinc-700 dark:text-zinc-300 font-bold shrink-0 text-xs">
								#{index + 1}
							</div>
							<div class="relative flex-1">
								<span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
									<Hash size={14} />
								</span>
								<input
									type="number"
									step={editDecimals === 0 ? '1' : (1 / Math.pow(10, editDecimals)).toString()}
									value={value}
									oninput={(e) => updateEditIncrementValue(index, e.currentTarget.value)}
									placeholder="Increment value"
									class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 focus:outline-none focus:border-zinc-500 transition-colors focus:ring-1 focus:ring-zinc-500/50 text-base"
								/>
							</div>
							{#if editIncrements.length > 1}
								<IconButton
									tooltip="Remove increment"
									type="button"
									onclick={() => removeEditIncrement(index)}
									variant="danger-outline"
									size="md"
									shape="square"
								>
									<Trash2 size={16} />
								</IconButton>
							{/if}
						</div>
					{/each}

					{#if editIncrements.length < 3}
						<button
							type="button"
							onclick={addEditIncrement}
							class="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 rounded-xl transition-all bg-zinc-50/50 dark:bg-white/[0.01] cursor-pointer text-xs"
						>
							<Plus size={14} />
							<span>Add Increment Button</span>
						</button>
					{/if}
				</div>
			</div>
		</div>

		<div class="border-t border-zinc-200 dark:border-white/10 pt-4 mt-6 flex items-center justify-end gap-3 shrink-0">
			<button
				type="button"
				onclick={() => (showSettingsModal = false)}
				class="px-4 py-2 border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold transition-all text-xs cursor-pointer"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl font-bold transition-all text-xs cursor-pointer shadow-sm"
			>
				Save Settings
			</button>
		</div>
	</form>
</Modal>
