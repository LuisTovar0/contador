<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';
  import { t } from '$lib';

  interface Props {
    message?: string;
  }

  let { message = '' }: Props = $props();
</script>

<div class="splash-root" aria-label="Loading" role="status" out:fade={{ duration: 800, easing: cubicInOut }}>
  <!-- ===== Glassmorphism Scene ===== -->
  <div class="splash-scene">
    <!-- SVG ClipPath Helper (Normalized to bounding box) -->
    <svg class="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
      <defs>
        <clipPath id="sp-plus-clip" clipPathUnits="objectBoundingBox">
          <path d="M 0.35,0.35
                   L 0.35,0.10
                   A 0.10,0.10 0 0,1 0.45,0
                   L 0.55,0
                   A 0.10,0.10 0 0,1 0.65,0.10
                   L 0.65,0.35
                   L 0.90,0.35
                   A 0.10,0.10 0 0,1 1.00,0.45
                   L 1.00,0.55
                   A 0.10,0.10 0 0,1 0.90,0.65
                   L 0.65,0.65
                   L 0.65,0.90
                   A 0.10,0.10 0 0,1 0.55,1.00
                   L 0.45,1.00
                   A 0.10,0.10 0 0,1 0.35,0.90
                   L 0.35,0.65
                   L 0.10,0.65
                   A 0.10,0.10 0 0,1 0,0.55
                   L 0,0.45
                   A 0.10,0.10 0 0,1 0.10,0.35
                   Z" />
        </clipPath>
      </defs>
    </svg>

    <!-- Ambient Light Pools (Glows) -->
    <div class="sp-ambient sp-ambient-plus"></div>
    <div class="sp-ambient sp-ambient-minus"></div>

    <!-- Connecting thread (SVG used only for drawing the curved line) -->
    <svg class="sp-thread-container" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        class="sp-thread"
        d="M 95,80 Q 120,105 145,125"
        stroke="var(--sp-thread-color)"
        stroke-width="1.2"
        stroke-linecap="round"
      />
    </svg>

    <!-- Floating Motes -->
    <div class="sp-mote sp-mote-1"></div>
    <div class="sp-mote sp-mote-2"></div>
    <div class="sp-mote sp-mote-3"></div>

    <!-- Plus Sign Glass Shape -->
    <div class="sp-sign sp-sign-plus">
      <!-- Glass body clipped to plus shape -->
      <div class="absolute inset-0 bg-plus-glass backdrop-blur-xl" style="clip-path: url(#sp-plus-clip);">
        <!-- Specular reflection glass highlight -->
        <div class="absolute inset-0 bg-linear-to-br from-glass-specular via-transparent to-transparent pointer-events-none"></div>
      </div>

      <!-- Plus sign rim stroke (SVG overlay to trace the clipped border with exactly 1px borders) -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Light edges path (top/left highlights) -->
        <path
          d="M 16,36 L 36,36 L 36,16 A 14,14 0 0,1 50,2
             M 64,36 L 84,36
             M 36,64 L 36,84
             M 2,50 A 14,14 0 0,1 16,36"
          fill="none"
          class="sp-plus-border-light"
          stroke-width="1.25"
          stroke-linecap="round"
        />
        <!-- Dark edges path (bottom/right shadows) -->
        <path
          d="M 50,2 A 14,14 0 0,1 64,16 L 64,36
             M 84,36 A 14,14 0 0,1 84,64 L 64,64 L 64,84 A 14,14 0 0,1 36,84
             M 36,64 L 16,64 A 14,14 0 0,1 2,50"
          fill="none"
          class="sp-plus-border-dark"
          stroke-width="1.25"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <!-- Minus Sign Glass Shape -->
    <div class="sp-sign sp-sign-minus glass-surface border border-card-border border-t-card-border-t border-l-card-border-l rounded-lg shadow-card ring-1 ring-card-ring">
      <!-- Specular reflection glass highlight -->
      <div class="absolute inset-0 bg-linear-to-br from-glass-specular via-transparent to-transparent pointer-events-none rounded-lg"></div>
    </div>
  </div>

  <!-- ===== Text Content ===== -->
  <div class="splash-text">
    <h1 class="splash-title">Contador</h1>
    <p class="splash-tagline">{t('auth.tagline')}</p>
    {#if message}
      <p class="splash-status">{message}</p>
    {/if}
    <div class="splash-loader">
      <span class="loader-dot"></span>
      <span class="loader-dot"></span>
      <span class="loader-dot"></span>
    </div>
  </div>
</div>

<style>
  /* ===== Root Container ===== */
  .splash-root {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--splash-bg);
    overflow: hidden;
    animation: splash-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;

    /* ===== Dark Theme (Default) ===== */
    --splash-bg: var(--color-zinc-950);

    /* Ambient pools */
    --sp-ambient-plus: oklch(0.52 0.14 145 / 0.22);
    --sp-ambient-minus: oklch(0.52 0.16 300 / 0.24);

    /* Motes */
    --sp-mote-color: oklch(0.82 0.08 145 / 0.55);

    /* Thread */
    --sp-thread-color: oklch(0.75 0.06 170 / 0.18);

    /* Text */
    --splash-title-color: var(--color-primary-400);
    --splash-tagline: var(--color-zinc-500);
    --splash-status: var(--color-zinc-600);
    --splash-loader-dot: var(--color-primary-400);

    transition: background-color 0.3s ease;
  }

  /* ===== Light Theme Overrides ===== */
  :global(.light) .splash-root {
    --splash-bg: var(--color-zinc-100);

    --sp-ambient-plus: oklch(0.62 0.10 145 / 0.08);
    --sp-ambient-minus: oklch(0.62 0.12 300 / 0.10);

    --sp-mote-color: oklch(0.52 0.10 145 / 0.35);

    --sp-thread-color: oklch(0.48 0.08 170 / 0.10);

    --splash-title-color: var(--color-primary-600);
    --splash-tagline: var(--color-zinc-600);
    --splash-status: var(--color-zinc-700);
    --splash-loader-dot: var(--color-primary-500);
  }

  @keyframes splash-enter {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* ===== Scene Container ===== */
  .splash-scene {
    position: relative;
    width: 240px;
    height: 180px;
    flex-shrink: 0;
  }

  /* ===== Ambient Pools ===== */
  .sp-ambient {
    position: absolute;
    border-radius: 50%;
    filter: blur(28px);
    pointer-events: none;
    opacity: 0;
  }

  .sp-ambient-plus {
    left: 20px;
    top: 15px;
    width: 110px;
    height: 110px;
    background-color: var(--sp-ambient-plus);
    animation:
      ambient-in 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards,
      ambient-breathe 8s ease-in-out 1.2s infinite;
  }

  .sp-ambient-minus {
    right: 15px;
    bottom: 15px;
    width: 100px;
    height: 100px;
    background-color: var(--sp-ambient-minus);
    animation:
      ambient-in 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards,
      ambient-breathe 10s ease-in-out 1.3s infinite;
  }

  @keyframes ambient-in {
    from { opacity: 0; }
    to   { opacity: 0.45; }
  }

  @keyframes ambient-breathe {
    0%, 100% { opacity: 0.35; transform: scale(1); }
    50%      { opacity: 0.55; transform: scale(1.06); }
  }

  /* ===== Connecting Thread ===== */
  .sp-thread-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .sp-thread {
    stroke-dasharray: 80;
    stroke-dashoffset: 80;
    animation: thread-draw 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards;
  }

  @keyframes thread-draw {
    to {
      stroke-dashoffset: 0;
      opacity: 0.4;
    }
  }

  /* ===== Floating Motes ===== */
  .sp-mote {
    position: absolute;
    border-radius: 50%;
    background-color: var(--sp-mote-color);
  }

  .sp-mote-1 {
    left: 120px;
    top: 95px;
    width: 3.5px;
    height: 3.5px;
    animation: mote-drift-1 9s ease-in-out infinite;
  }

  .sp-mote-2 {
    left: 145px;
    top: 110px;
    width: 2.5px;
    height: 2.5px;
    animation: mote-drift-2 11s ease-in-out 2s infinite;
  }

  .sp-mote-3 {
    left: 110px;
    top: 120px;
    width: 2px;
    height: 2px;
    animation: mote-drift-3 8s ease-in-out 3.5s infinite;
  }

  @keyframes mote-drift-1 {
    0%, 100% { transform: translate(0, 0); opacity: 0.15; }
    30%      { transform: translate(8px, -10px); opacity: 0.55; }
    60%      { transform: translate(-4px, -18px); opacity: 0.25; }
  }

  @keyframes mote-drift-2 {
    0%, 100% { transform: translate(0, 0); opacity: 0.1; }
    50%      { transform: translate(-9px, 12px); opacity: 0.5; }
  }

  @keyframes mote-drift-3 {
    0%, 100% { transform: translate(0, 0); opacity: 0.2; }
    40%      { transform: translate(11px, -6px); opacity: 0.5; }
    80%      { transform: translate(-3px, 8px); opacity: 0.15; }
  }

  /* ===== Glass Shapes ===== */
  .sp-sign {
    position: absolute;
  }

  .sp-sign-plus {
    left: 40px;
    top: 25px;
    width: 80px;
    height: 80px;
    transform-origin: center center;
    filter: drop-shadow(0 10px 20px rgba(9, 9, 11, 0.06));
    animation:
      plus-enter 0.9s cubic-bezier(0.16, 1, 0.3, 1) both,
      plus-float 10s ease-in-out 0.9s infinite;
  }

  :global(.dark) .sp-sign-plus {
    filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.37));
  }

  /* Glass borders mapping top/left to white highlight, and bottom/right to theme border */
  .sp-plus-border-light {
    stroke: rgba(255, 255, 255, 0.8);
    transition: stroke 0.3s ease;
  }
  .sp-plus-border-dark {
    stroke: rgba(228, 228, 231, 0.55);
    transition: stroke 0.3s ease;
  }

  :global(.dark) .sp-plus-border-light {
    stroke: rgba(255, 255, 255, 0.18);
  }
  :global(.dark) .sp-plus-border-dark {
    stroke: var(--color-primary-500);
    stroke-opacity: 0.2;
  }

  @keyframes plus-enter {
    from {
      opacity: 0;
      transform: translate(-20px, -14px) scale(0.7);
    }
    to {
      opacity: 1;
      transform: translate(0, 0) scale(1);
    }
  }

  @keyframes plus-float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25%      { transform: translate(5px, -4px) rotate(3deg); }
    50%      { transform: translate(2px, 3px) rotate(-1deg); }
    75%      { transform: translate(-4px, -1px) rotate(-2deg); }
  }

  .sp-sign-minus {
    right: 40px;
    bottom: 25px;
    width: 80px;
    height: 24px;
    transform-origin: center center;
    animation:
      minus-enter 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both,
      minus-float 12s ease-in-out 1.02s infinite;
  }

  @keyframes minus-enter {
    from {
      opacity: 0;
      transform: translate(20px, 14px) scale(0.7);
    }
    to {
      opacity: 1;
      transform: translate(0, 0) scale(1);
    }
  }

  @keyframes minus-float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25%      { transform: translate(-3px, 4px) rotate(-2deg); }
    50%      { transform: translate(-5px, -2px) rotate(1.5deg); }
    75%      { transform: translate(4px, 3px) rotate(-1deg); }
  }

  /* ===== Text ===== */
  .splash-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    margin-top: -4px;
    animation: text-rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
  }

  @keyframes text-rise {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .splash-title {
    font-family: var(--font-sans), sans-serif;
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--splash-title-color);
    margin: 0;
    transition: color 0.3s ease;
    text-wrap: balance;
  }

  .splash-tagline {
    font-family: var(--font-sans), sans-serif;
    font-size: 0.8rem;
    font-weight: 400;
    color: var(--splash-tagline);
    margin: 0;
    letter-spacing: 0.06em;
    text-transform: lowercase;
    transition: color 0.3s ease;
  }

  .splash-status {
    font-family: var(--font-mono), monospace;
    font-size: 0.65rem;
    font-weight: 500;
    color: var(--splash-status);
    margin: 8px 0 0;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    animation: status-pulse 2s ease-in-out infinite;
    transition: color 0.3s ease;
  }

  @keyframes status-pulse {
    0%, 100% { opacity: 0.5; }
    50%      { opacity: 1; }
  }

  /* ===== Dot Loader ===== */
  .splash-loader {
    display: flex;
    gap: 6px;
    margin-top: 12px;
  }

  .loader-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--splash-loader-dot);
    opacity: 0.3;
    animation: dot-bounce 1.4s ease-in-out infinite;
    transition: background-color 0.3s ease;
  }

  .loader-dot:nth-child(2) { animation-delay: 0.2s; }
  .loader-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes dot-bounce {
    0%, 80%, 100% { opacity: 0.3; transform: scale(1); }
    40%           { opacity: 1; transform: scale(1.5); }
  }

  /* ===== Reduced Motion ===== */
  @media (prefers-reduced-motion: reduce) {
    .splash-root,
    .splash-root * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }

    .sp-sign-plus,
    .sp-sign-minus {
      opacity: 1;
      transform: none;
    }

    .sp-ambient {
      opacity: 0.4;
    }

    .sp-thread {
      stroke-dashoffset: 0;
      opacity: 0.35;
    }
  }
</style>
