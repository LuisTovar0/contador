<script lang="ts">
  import { i18n, t } from '$lib';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import { isFirebaseConfigured } from '$lib/firebase';
  import { authStore, themeStore } from '$lib/store.svelte';
  import { CircleAlert, Lock, LogIn, Moon, Play, Sun, User, UserPlus } from 'lucide-svelte';


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

<div class="flex-1 flex items-center justify-center px-4 w-full relative z-10">
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

    <div class="flex flex-col gap-6 w-full max-w-md glass-surface border border-card-border border-t-card-border-t border-l-card-border-l p-6 rounded-2xl shadow-card relative overflow-hidden transition-all duration-300 ring-1 ring-card-ring">
        <!-- Specular reflection glass highlight -->
        <div class="absolute inset-0 bg-linear-to-br from-glass-specular via-transparent to-transparent pointer-events-none"></div>

        <!-- Logo & Tagline -->
        <div class="text-center relative z-10 select-none">
            <h1 class="text-2xl font-black tracking-tight text-primary-brand">Contador</h1>
            <p class="text-xs text-muted mt-1 font-medium">{t('auth.tagline')}</p>
        </div>

        <!-- Firebase status alert -->
        {#if !isFirebaseConfigured}
            <div class="p-3 rounded-xl border border-default bg-surface-muted text-[11px] text-alt flex items-start gap-2 relative z-10">
                <CircleAlert size={14} class="text-muted shrink-0 mt-0.5" />
                <div class="leading-relaxed">
                    <span>{t('auth.firebaseNotConnected')}</span>
                </div>
            </div>
        {/if}

        <!-- Tabs -->
        <div class="grid grid-cols-2 gap-1 p-1 bg-surface-muted rounded-xl border border-tab-shell relative z-10 shrink-0 select-none shadow-inner">
            <button
                    type="button"
                    onclick={() => {
                    activeTab = 'login';
                    error = null;
                }}
                    class="py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer
                {activeTab === 'login'
                    ? 'bg-surface-elevated border border-tab-selected text-primary-brand shadow-sm'
                    : 'text-zinc-500 hover:text-secondary'}"
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
                    ? 'bg-surface-elevated border border-tab-selected text-primary-brand shadow-sm'
                    : 'text-zinc-500 hover:text-secondary'}"
            >
                <UserPlus size={13} />
                <span>{t('auth.createAccount')}</span>
            </button>
        </div>

        <!-- Error Message -->
        {#if error}
            <div class="p-3 bg-red-500/10 border border-red-500/20 text-error rounded-xl text-xs flex items-center gap-2 relative z-10">
                <CircleAlert size={14} class="shrink-0 text-error" />
                <span>{error}</span>
            </div>
        {/if}

        <!-- Form -->
        <form onsubmit={handleSubmit} class="space-y-4 relative z-10">
            <!-- Username Input -->
            <div>
                <label for="username"
                       class="block text-[10px] font-semibold text-label-text uppercase tracking-wider mb-1.5">{t('auth.username')}</label>
                <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                        <User size={14} />
                    </span>
                    <input
                            type="text"
                            id="username"
                            bind:value={username}
                            placeholder={t('auth.usernamePlaceholder')}
                            required
                            class="w-full glass-surface border border-input-border rounded-xl pl-9 pr-3 py-2 text-primary placeholder:text-placeholder focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 text-xs"
                    />
                </div>
            </div>

            <!-- Password Input -->
            <div>
                <label for="password"
                       class="block text-[10px] font-semibold text-label-text uppercase tracking-wider mb-1.5">{t('auth.password')}</label>
                <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                        <Lock size={14} />
                    </span>
                    <input
                            type="password"
                            id="password"
                            bind:value={password}
                            placeholder="••••••••"
                            required
                            class="w-full glass-surface border border-input-border rounded-xl pl-9 pr-3 py-2 text-primary placeholder:text-placeholder focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 text-xs"
                    />
                </div>
            </div>

            <!-- Submit Button -->
            <button
                    type="submit"
                    disabled={loading}
                    class="w-full py-2.5 bg-primary-600 hover:bg-primary-500 text-white disabled:bg-disabled disabled:text-disabled rounded-xl font-bold transition-all active:translate-y-[0.5px] text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-primary-glow"
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

        <!-- Anonymous Play -->
        <button
                type="button"
                onclick={handleAnonymous}
                disabled={loading}
                class="w-full py-2 border border-default hover:bg-secondary-action-hover hover:border-secondary-action-hover text-secondary-action rounded-xl font-bold transition-all active:translate-y-[0.5px] text-xs flex items-center justify-center gap-1.5 relative z-10 cursor-pointer hover:shadow-secondary-glow"
        >
            <Play size={13} />
            <span>{t('auth.playDemo')}</span>
        </button>

        <p class="text-center text-[10px] text-muted">
            <a href="https://luistovar.dev" target="_blank" rel="noopener noreferrer"
               class="underline underline-offset-2">Luís Tovar</a>
            ·
            <a href="https://github.com/LuisTovar0/contador" target="_blank" rel="noopener noreferrer"
               class="text-primary-500 hover:text-primary-brand underline underline-offset-2 transition-colors">Source
                code</a>
        </p>
    </div>
</div>
