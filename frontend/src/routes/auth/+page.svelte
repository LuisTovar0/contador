<script lang="ts">
  import { isFirebaseConfigured } from '$lib/firebase';
  import { authStore, themeStore } from '$lib/store.svelte';
  import { CircleAlert, Lock, LogIn, Moon, Play, Sun, User, UserPlus } from 'lucide-svelte';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import { i18n, t } from '$lib';


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
      error = t('auth.error.fieldsRequired');
      loading = false;
      return;
    }

    const usernameRegex = /^[A-Za-z_][A-Za-z0-9_]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      error = t('auth.error.invalidUsername');
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
      error = err.message || t('auth.error.authFailed');
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
      error = err.message || t('auth.error.demoFailed');
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
    <title>{t('auth.title')}</title>
    <meta name="description" content={t('auth.description')} />
</svelte:head>

<div class="flex-1 flex items-center justify-center py-12 px-4 w-full relative z-10">
    <!-- Language & Theme Switcher top bar -->
    <div class="absolute top-0 right-0 flex items-center gap-1.5 z-20">
        <!-- Language Switcher button -->
        <IconButton
                tooltip={t('language.select')}
                type="button"
                onclick={() => i18n.setLocale(i18n.locale === 'pt-PT' ? 'en-GB' : 'pt-PT')}
                class="text-[10px] font-bold"
        >
            <span>{i18n.locale.split('-')[0].toUpperCase()}</span>
        </IconButton>

        <!-- Theme Switcher button -->
        <IconButton
                tooltip={themeStore.current === 'dark' ? t('theme.lightTooltip') : t('theme.darkTooltip')}
                type="button"
                onclick={() => themeStore.toggle()}
        >
            {#if themeStore.current === 'dark'}
                <Moon size={14} />
            {:else}
                <Sun size={14} />
            {/if}
        </IconButton>
    </div>

    <div class="w-full max-w-md bg-white/25 dark:bg-black/35 backdrop-blur-xl border border-zinc-200/55 dark:border-primary-500/20 border-t-white/80 border-l-white/80 dark:border-t-white/18 dark:border-l-white/18 p-6 rounded-2xl shadow-[0_12px_40px_0_rgba(9,9,11,0.06),inset_0_1px_0_0_rgba(255,255,255,0.6)] dark:shadow-[0_16px_48px_0_rgba(0,0,0,0.37),inset_0_1px_0_0_rgba(255,255,255,0.12)] relative overflow-hidden transition-all duration-300 ring-1 ring-black/5 dark:ring-white/5">
        <!-- Specular reflection glass highlight -->
        <div class="absolute inset-0 bg-linear-to-br from-white/35 dark:from-white/12 via-transparent to-transparent pointer-events-none"></div>

        <!-- Logo & Tagline -->
        <div class="text-center mb-6 mt-2 relative z-10 select-none">
            <h1 class="text-2xl font-black tracking-tight text-primary-600 dark:text-primary-400">Contador</h1>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">{t('auth.tagline')}</p>
        </div>

        <!-- Firebase status alert -->
        {#if !isFirebaseConfigured}
            <div class="mb-5 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-start gap-2 relative z-10">
                <CircleAlert size={14} class="text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5" />
                <div class="leading-relaxed">
                    <span>{t('auth.firebaseNotConnected')}</span>
                </div>
            </div>
        {/if}

        <!-- Tabs -->
        <div class="grid grid-cols-2 gap-1 p-1 bg-zinc-100/80 dark:bg-zinc-950/60 rounded-xl border border-zinc-200/55 dark:border-primary-500/10 mb-5 relative z-10 shrink-0 select-none shadow-inner">
            <button
                    type="button"
                    onclick={() => {
                    activeTab = 'login';
                    error = null;
                }}
                    class="py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer
                {activeTab === 'login'
                    ? 'bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-primary-500/25 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}"
            >
                <LogIn size={13} />
                <span>{t('auth.signIn')}</span>
            </button>
            <button
                    type="button"
                    onclick={() => {
                    activeTab = 'register';
                    error = null;
                }}
                    class="py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer
                {activeTab === 'register'
                    ? 'bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-primary-500/25 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}"
            >
                <UserPlus size={13} />
                <span>{t('auth.register')}</span>
            </button>
        </div>

        <!-- Error Message -->
        {#if error}
            <div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2 relative z-10">
                <CircleAlert size={14} class="shrink-0 text-red-600 dark:text-red-400" />
                <span>{error}</span>
            </div>
        {/if}

        <!-- Form -->
        <form onsubmit={handleSubmit} class="space-y-4 relative z-10">
            <!-- Username Input -->
            <div>
                <label for="username"
                       class="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-1.5">{t('auth.username')}</label>
                <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
                        <User size={14} />
                    </span>
                    <input
                            type="text"
                            id="username"
                            bind:value={username}
                            placeholder={t('auth.usernamePlaceholder')}
                            required
                            class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-primary-500/15 rounded-xl pl-9 pr-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 text-xs"
                    />
                </div>
            </div>

            <!-- Password Input -->
            <div>
                <label for="password"
                       class="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-1.5">{t('auth.password')}</label>
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
                            class="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-primary-500/15 rounded-xl pl-9 pr-3 py-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 text-xs"
                    />
                </div>
            </div>

            <!-- Submit Button -->
            <button
                    type="submit"
                    disabled={loading}
                    class="w-full py-2.5 bg-primary-600 hover:bg-primary-500 text-white disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-950 dark:disabled:text-zinc-600 rounded-xl font-bold transition-all active:translate-y-[0.5px] text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-primary-glow"
            >
                {#if loading}
                    <span>{t('auth.connecting')}</span>
                {:else if activeTab === 'login'}
                    <LogIn size={13} />
                    <span>{t('auth.signIn')}</span>
                {:else}
                    <UserPlus size={13} />
                    <span>{t('auth.createAccount')}</span>
                {/if}
            </button>
        </form>

        <!-- Divider -->
        <div class="my-6"> </div>

        <!-- Anonymous Play -->
        <button
                type="button"
                onclick={handleAnonymous}
                disabled={loading}
                class="w-full py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-secondary-50/50 dark:hover:bg-secondary-950/15 hover:border-secondary-300 dark:hover:border-secondary-500/40 text-zinc-700 dark:text-secondary-400 rounded-xl font-bold transition-all active:translate-y-[0.5px] text-xs flex items-center justify-center gap-1.5 relative z-10 cursor-pointer hover:shadow-secondary-glow"
        >
            <Play size={13} />
            <span>{t('auth.playDemo')}</span>
        </button>
    </div>
</div>
