import { mount, unmount } from 'svelte';
import TooltipContent from './TooltipContent.svelte';

export interface TooltipOptions {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
}

export function tooltip(node: HTMLElement, options: string | TooltipOptions) {
  let tooltipComponent: any = null;

  // Create a reactive state proxy
  let state = $state<{ text: string; position: 'top' | 'bottom' | 'left' | 'right'; trigger: 'hover' | 'click' }>({
    text: '',
    position: 'top',
    trigger: 'hover',
  });

  function updateState(newOptions: string | TooltipOptions) {
    if (typeof newOptions === 'string') {
      state.text = newOptions;
      state.position = 'top';
      state.trigger = 'hover';
    } else {
      state.text = newOptions.text;
      state.position = newOptions.position || 'top';
      state.trigger = newOptions.trigger || 'hover';
    }
    attachListeners();
  }

  function show() {
    if (state.trigger !== 'click') {
      if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) return;
    }
    if (tooltipComponent || !state.text) return;

    tooltipComponent = mount(TooltipContent, {
      target: document.body,
      props: {
        get text() { return state.text; },
        get position() { return state.position; },
        triggerEl: node,
      },
    });
  }

  function hide() {
    if (tooltipComponent) {
      unmount(tooltipComponent);
      tooltipComponent = null;
    }
  }

  function toggle() {
    if (tooltipComponent) {
      hide();
    } else {
      show();
    }
  }

  function handleDocumentClick(e: MouseEvent) {
    if (!tooltipComponent) return;
    const target = e.target as HTMLElement;
    if (!node.contains(target)) {
      hide();
    }
  }

  let listenersAttached = false;
  let currentAttachedTrigger: 'hover' | 'click' | null = null;

  function attachListeners() {
    if (listenersAttached && currentAttachedTrigger === state.trigger) return;
    detachListeners();

    if (state.trigger === 'click') {
      node.addEventListener('click', toggle);
      window.addEventListener('click', handleDocumentClick);
    } else {
      node.addEventListener('mouseenter', show);
      node.addEventListener('mouseleave', hide);
      node.addEventListener('focusin', show);
      node.addEventListener('focusout', hide);
    }

    listenersAttached = true;
    currentAttachedTrigger = state.trigger;
  }

  function detachListeners() {
    if (!listenersAttached) return;

    if (currentAttachedTrigger === 'click') {
      node.removeEventListener('click', toggle);
      window.removeEventListener('click', handleDocumentClick);
    } else {
      node.removeEventListener('mouseenter', show);
      node.removeEventListener('mouseleave', hide);
      node.removeEventListener('focusin', show);
      node.removeEventListener('focusout', hide);
    }

    listenersAttached = false;
    currentAttachedTrigger = null;
  }

  updateState(options);

  return {
    update(newOptions: string | TooltipOptions) {
      updateState(newOptions);
    },
    // noinspection JSUnusedGlobalSymbols
    destroy() {
      hide();
      detachListeners();
    },
  };
}
