import { mount, unmount } from 'svelte';
import TooltipContent from './TooltipContent.svelte';

export interface TooltipOptions {
	text: string;
	position?: 'top' | 'bottom' | 'left' | 'right';
}

export function tooltip(node: HTMLElement, options: string | TooltipOptions) {
	let tooltipComponent: any = null;
	
	// Create a reactive state proxy
	let state = $state<{ text: string; position: 'top' | 'bottom' | 'left' | 'right' }>({
		text: '',
		position: 'top'
	});

	function updateState(newOptions: string | TooltipOptions) {
		if (typeof newOptions === 'string') {
			state.text = newOptions;
			state.position = 'top';
		} else {
			state.text = newOptions.text;
			state.position = newOptions.position || 'top';
		}
	}

	updateState(options);

	function show() {
		if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) return;
		if (tooltipComponent || !state.text) return;
		
		tooltipComponent = mount(TooltipContent, {
			target: document.body,
			props: {
				get text() { return state.text; },
				get position() { return state.position; },
				triggerEl: node
			}
		});
	}

	function hide() {
		if (tooltipComponent) {
			unmount(tooltipComponent);
			tooltipComponent = null;
		}
	}

	// Attach event listeners
	node.addEventListener('mouseenter', show);
	node.addEventListener('mouseleave', hide);
	node.addEventListener('focusin', show);
	node.addEventListener('focusout', hide);

	return {
		update(newOptions: string | TooltipOptions) {
			updateState(newOptions);
		},
		destroy() {
			hide();
			node.removeEventListener('mouseenter', show);
			node.removeEventListener('mouseleave', hide);
			node.removeEventListener('focusin', show);
			node.removeEventListener('focusout', hide);
		}
	};
}
