---
name: Contador
description: Sleek neon-cyberpunk counter app with history and undo/redo.
colors:
  primary: "#a855f7"
  secondary: "#22c55e"
  tertiary: "#6366f1"
  neutral-bg: "#09090b"
  neutral-surface: "#18181b"
  neutral-ink: "#fafafa"
  neutral-muted: "#71717a"
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-ink}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
---

# Design

## Overview
**Creative North Star: "Neon Glass Utility"**
A high-tech, energetic, mobile-first utility built for speed and visual satisfaction. The interface uses frosted glass cards (backdrop-blur), crisp glowing neon borders, and sharp typography to evoke a cyberpunk console aesthetic. It takes visual cues from Linear (precision details) and Raycast (speed and efficiency).

## Colors
**The Cyberpunk Glow Rule.** Use deep space black (#09090b) as the background canvas. Accentuate interactive and stateful items with neon purple (#a855f7) and neon green (#22c55e).
**The Tonal Hierarchy Rule.** All surfaces are semi-transparent dark gray glass cards overlaid on glowing radial backgrounds. Text colors must be high-contrast zinc-50 (#fafafa) for headings and active content, and zinc-500 (#71717a) for secondary labels.

## Typography
**The Single-Family Rule.** Use a clean, geometric sans-serif (e.g. system-ui, Inter, or Outfit) for all text. Monospace numerals should be preferred for the counter numbers to prevent layout shift during transitions.
- Display sizes: large, crisp numbers (4rem to 6rem) for current counter values.
- Labels & Actions: Tighter scale ratios with strong weights (font-semibold, font-bold) for button readability.

## Elevation
**The Glass & Glow Rule.** Instead of traditional shadows, elevation is represented by the backdrop-filter blur intensity (backdrop-blur-md to backdrop-blur-xl) combined with a thin translucent border (white at 10% opacity) and neon-tinted drop-shadow glows (drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]).

## Components
### Counter Card
A glass card with a frosted background, subtle glowing border matching the counter's color theme, displaying large mono-spaced digits. Include custom action zones for increments.

### Glass Buttons
Rounded buttons with semi-transparent background, active neon border, and haptic-like scale transitions on hover and active click states.

## Do's and Don'ts
### Do's
- Use vibrant neon green (#22c55e) for incremental actions and neon purple (#a855f7) for decremental or secondary actions.
- Implement smooth transitions (150-200ms) for value changes with brief scale pops.
- Allow instant undo/redo via a bottom snackbar notification.

### Don'ts
- Never use flat white or gray backgrounds.
- Do not mix different display fonts. Keep labels and numbers unified.
- Avoid side-stripe borders or text styling with gradients.
