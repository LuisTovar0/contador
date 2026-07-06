<script lang="ts">
  import './layout.css';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import DialogHost from '$lib/components/modals/DialogHost.svelte';
  import SplashScreen from '$lib/components/ui/SplashScreen.svelte';
  import { authStore } from '$lib/store.svelte';
  import { t } from '$lib';


  let { children } = $props();

  // Ensure splash screen displays for at least 400ms to prevent flickers
  let targetShowSplash = $derived(
    authStore.loading ||
    (!authStore.user && page.route.id !== '/auth') ||
    (authStore.user && (page.route.id === '/auth' || page.route.id === '/'))
  );

  let shouldShowSplash = $state(true);
  let splashShowStartedAt = $state(Date.now());
  let currentMessage = $state(t('counters.initializing'));

  $effect(() => {
    if (authStore.loading) {
      currentMessage = t('counters.initializing');
    } else if ((!authStore.user && page.route.id !== '/auth') || (authStore.user && (page.route.id === '/auth' || page.route.id === '/'))) {
      currentMessage = t('counters.redirecting');
    }
  });

  $effect(() => {
    if (targetShowSplash) {
      if (!shouldShowSplash) {
        shouldShowSplash = true;
        splashShowStartedAt = Date.now();
      }
    } else {
      if (shouldShowSplash) {
        const elapsed = Date.now() - splashShowStartedAt;
        const remaining = 3000 - elapsed;
        if (remaining > 0) {
          const timer = setTimeout(() => {
            if (!targetShowSplash) {
              shouldShowSplash = false;
            }
          }, remaining);
          return () => clearTimeout(timer);
        } else {
          shouldShowSplash = false;
        }
      }
    }
  });

  // Client-side authentication redirects
  $effect(() => {
    if (!authStore.loading) {
      const isAuthPage = page.route.id === '/auth';
      if (!authStore.user && !isAuthPage) {
        goto('/auth');
      } else if (authStore.user && (isAuthPage || page.route.id === '/')) {
        goto('/counters');
      }
    }
  });
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet">
</svelte:head>

{#if shouldShowSplash}
    <SplashScreen message={currentMessage} />
{:else}
<main class="min-h-screen grid-bg bg-zinc-50/20 dark:bg-transparent text-zinc-900 dark:text-zinc-100 flex flex-col items-center p-4 md:p-8 overflow-x-hidden relative font-sans transition-colors duration-300">
    <!-- Ambient glowing backgrounds for Cyberpunk aesthetic -->
    <div class="fixed top-[5%] left-[5%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] bg-primary-500/22 dark:bg-primary-500/12 rounded-full blur-[130px] pointer-events-none -z-10 animate-blob-1"></div>
    <div class="fixed bottom-[5%] right-[5%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] bg-secondary-500/18 dark:bg-secondary-500/10 rounded-full blur-[130px] pointer-events-none -z-10 animate-blob-2"></div>

    {@render children()}
</main>
{/if}

<DialogHost />
