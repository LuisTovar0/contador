import type { Component } from 'svelte';

export interface DialogInstance {
  id: string;
  component: Component<any, any>;
  props: any;
  show: boolean;
  resolve: (value: any) => void;
  close: (value?: any) => void;
}

class DialogService {
  #dialogs = $state<DialogInstance[]>([]);

  /**
   * Retrieves the currently open dialog instances.
   */
  get dialogs() {
    return this.#dialogs;
  }

  /**
   * Opens a dialog component dynamically, passing props to it.
   * Returns a Promise that resolves with the value passed to the dialog's close/onclose function.
   */
  open<TProps extends Record<string, any>, TResult = any>(
    component: Component<TProps, any>,
    props?: Omit<TProps, 'show' | 'onclose'>
  ): Promise<TResult | undefined> {
    return new Promise<TResult | undefined>((resolve) => {
      const id = crypto.randomUUID();

      const close = (result?: any) => {
        const dlg = this.#dialogs.find((d) => d.id === id);
        if (dlg) {
          dlg.show = false;
          // Wait for CSS/Svelte transitions to complete before destroying the DOM node
          setTimeout(() => {
            this.#dialogs = this.#dialogs.filter((d) => d.id !== id);
          }, 300);
        }
        resolve(result);
      };

      const dialogInstance: DialogInstance = {
        id,
        component: component as any,
        props: props || {},
        show: true,
        resolve,
        close,
      };

      this.#dialogs.push(dialogInstance);
    });
  }
}

export const dialog = new DialogService();
