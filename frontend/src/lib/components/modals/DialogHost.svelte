<script lang="ts">
  import { dialog } from '$lib/components/modals/dialog.svelte.js';
</script>

{#each dialog.dialogs as item (item.id)}
  <item.component
    show={item.show}
    onclose={item.close}
    {...item.props}
  />
{/each}
