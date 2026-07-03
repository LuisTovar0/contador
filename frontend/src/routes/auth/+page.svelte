<script lang="ts">
  import { isFirebaseConfigured } from '$lib/firebase';
  import { authStore, themeStore } from '$lib/store.svelte';
  import { CircleAlert, Lock, LogIn, Moon, Play, Sun, User, UserPlus } from 'lucide-svelte';
  import IconButton from '$lib/components/IconButton.svelte';

  let activeTab = $state<'login' | 'register'>('login');
  let username = $state('');
  let password = $state('');
  let error = $state<string | null>(null);
  let loading = $state(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = null;
    loading = true;

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      error = 'Please fill out all fields.';
      loading = false;
      return;
    }

    const usernameRegex = /^[A-Za-z_][A-Za-z0-9_]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      error = 'Username must start with a letter or underscore, contain only letters, numbers, or underscores, and be at least 2 characters long.';
      loading = false;
      return;
    }

    try {
      if (activeTab === 'login') {
        await authStore.login(trimmedUsername, password);
      } else {
        await authStore.register(trimmedUsername, password);
      }
    } catch (err: any) {
      error = err.message || 'Authentication failed.';
    } finally {
      loading = false;
    }
  }

  async function handleAnonymous() {
    error = null;
    loading = true;
    try {
      await authStore.loginAnonymously();
    } catch (err: any) {
      error = err.message || 'Demo mode entrance failed.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
    <title>Contador • Sign In</title>
    <meta name="description" content="Sign in, sign up, or launch a demo session to start tracking with Contador." />
</svelte:head>

<div class="flex-1 flex items-center justify-center py-12 px-4 w-full relative z-10">
    <div class="w-full max-w-md bg-white/75 dark:bg-zinc-900/60 backdrop-blur-lg border border-zinc-200/60 dark:border-purple-500/25 p-6 rounded-2xl shadow-lg dark:shadow-[0_0_30px_rgba(168,85,247,0.1)] relative overflow-hidden transition-all duration-300">
        <!-- Theme Switcher floating button in Auth Card -->
        <IconButton
                tooltip={themeStore.current === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                type="button"
                onclick={() => themeStore.toggle()}
                variant="outline"
                size="lg"
                shape="square"
                class="absolute top-4 right-4 z-20"
        >
            {#if themeStore.current === 'dark'}
                <Sun size={14} />
            {:else}
                <Moon size={14} />
            {/if}
        </IconButton>

        <!-- Logo & Tagline -->
        <div class="text-center mb-6 mt-2 relative z-10 select-none">
            <h1 class="text-2xl font-black tracking-tight text-purple-650 dark:text-purple-400">Contador</h1>
            <p class="text-xs text-zinc-550 dark:text-zinc-400 mt-1 font-medium">Para contar coisas</p>
        </div>

        <!-- Firebase status alert -->
        {#if !isFirebaseConfigured}
            <div class="mb-5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-[11px] text-zinc-650 dark:text-zinc-400 flex items-start gap-2 relative z-10">
                <CircleAlert size={14} class="text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5" />
                <div class="leading-relaxed">
                    <span>Firebase is not connected yet. You will be logged into a <strong>local session</strong>.</span>
                </div>
            </div>
        {/if}

        <!-- Tabs -->
        <div class="grid grid-cols-2 gap-1 p-1 bg-zinc-100/80 dark:bg-zinc-950/60 rounded-xl border border-zinc-200/50 dark:border-purple-500/10 mb-5 relative z-10 shrink-0 select-none shadow-inner">
            <button
                    type="button"
                    onclick={() => {
                    activeTab = 'login';
                    error = null;
                }}
                    class="py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer
                {activeTab === 'login'
                    ? 'bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-purple-500/25 text-purple-650 dark:text-purple-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}"
            >
                <LogIn size={13} />
                <span>Sign In</span>
            </button>
            <button
                    type="button"
                    onclick={() => {
                    activeTab = 'register';
                    error = null;
                }}
                    class="py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer
                {activeTab === 'register'
                    ? 'bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-purple-500/25 text-purple-650 dark:text-purple-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}"
            >
                <UserPlus size={13} />
                <span>Register</span>
            </button>
        </div>

        <!-- Error Message -->
        {#if error}
            <div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-455 rounded-xl text-xs flex items-center gap-2 relative z-10">
                <CircleAlert size={14} class="shrink-0 text-red-600 dark:text-red-450" />
                <span>{error}</span>
            </div>
        {/if}

        <!-- Form -->
        <form onsubmit={handleSubmit} class="space-y-4 relative z-10">
            <!-- Username Input -->
            <div>
                <label for="username"
                       class="block text-[10px] font-semibold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Username</label>
                <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
                        <User size={14} />
                    </span>
                    <input
                            type="text"
                            id="username"
                            bind:value={username}
                            placeholder="e.g., username"
                            required
                            class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-purple-500/15 rounded-xl pl-9 pr-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 text-xs"
                    />
                </div>
            </div>

            <!-- Password Input -->
            <div>
                <label for="password"
                       class="block text-[10px] font-semibold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Password</label>
                <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
                        <Lock size={14} />
                    </span>
                    <input
                            type="password"
                            id="password"
                            bind:value={password}
                            placeholder="••••••••"
                            required
                            class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-purple-500/15 rounded-xl pl-9 pr-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 text-xs"
                    />
                </div>
            </div>

            <!-- Submit Button -->
            <button
                    type="submit"
                    disabled={loading}
                    class="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-950 dark:disabled:text-zinc-650 rounded-xl font-bold transition-all active:translate-y-[0.5px] text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(168,85,247,0.2)] dark:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
                {#if loading}
                    <span>Connecting...</span>
                {:else if activeTab === 'login'}
                    <LogIn size={13} />
                    <span>Sign In</span>
                {:else}
                    <UserPlus size={13} />
                    <span>Create Account</span>
                {/if}
            </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6 z-10 shrink-0">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>
            <div class="relative flex justify-center text-xs">
                <span class="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-0.5 rounded-full border border-zinc-200/60 dark:border-purple-500/20 text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider transition-colors duration-300">Or Quick Play</span>
            </div>
        </div>

        <!-- Anonymous Play -->
        <button
                type="button"
                onclick={handleAnonymous}
                disabled={loading}
                class="w-full py-2 border border-zinc-250 dark:border-emerald-500/25 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/15 hover:border-emerald-250 dark:hover:border-emerald-500/40 text-zinc-700 dark:text-emerald-400 rounded-xl font-bold transition-all active:translate-y-[0.5px] text-xs flex items-center justify-center gap-1.5 relative z-10 cursor-pointer hover:shadow-[0_0_12px_rgba(34,197,94,0.15)]"
        >
            <Play size={13} />
            <span>Play in Demo Mode (No Log In)</span>
        </button>
    </div>
</div>
