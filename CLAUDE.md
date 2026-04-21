# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**zhuanpan** (转盘) is a lightweight web-based wheel generator. Users can customize wheel options, weights, and themes, then use, save, and share the configured wheel directly in the browser.

## Tech Stack

**Framework**: Vite + Vanilla JavaScript
- **Why Vite**: Fast dev server with HMR, clean build output, minimal overhead
- **Why Vanilla JS**: Simple, lightweight, and sufficient for a single-page tool
- **Avoid**: Next.js, React, Vue (overkill for this use case)

## Core Architecture

### Two-Mode System

1. **Editor Mode** (Configuration)
   - User inputs: title, options, weights, theme
   - Real-time SVG preview
   - Updates the live wheel immediately

2. **Play Mode** (Execution)
   - Spinning animation with physics
   - Weighted random selection
   - Result display
   - Adjust configuration and spin again without leaving the page

### Key Technical Constraints

- **Single-Page Experience**: Configuration and play happen in one page
- **No External Dependencies**: Keep the app deployable as a static site with no backend
- **SVG Rendering**: Use native SVG with M/L/A path commands
- **Weight-Based Angles**: Calculate扇区 angles from weight ratios

## Development Commands

```bash
# Initialize project (one-time)
npm create vite@latest . -- --template vanilla
npm install

# Development
npm run dev          # Start dev server (localhost:5173)

# Build
npm run build        # Build for production (dist/)

# Preview
npm run preview      # Preview production build
```

## Project Structure (Planned)

```
zhuanpan/
├── index.html           # Main editor page
├── src/
│   ├── main.js          # Entry point
│   ├── wheel.js         # Wheel rendering (SVG generation)
│   ├── spin.js          # Spin animation & physics
│   ├── themes.js        # Theme presets (colors, fonts)
│   ├── preset-manager.js # User preset persistence
│   ├── presets.js       # Built-in presets
│   ├── url-handler.js   # Share URL encoding/decoding
│   └── utils.js         # Helper functions
├── prd.md              # Requirements document
└── CLAUDE.md           # This file
```

## Core Algorithms

### 1. Sector Angle Calculation

```javascript
// Total weight: W = Σ(weight_i)
// Sector i angle = (weight_i / W) × 360°
```

### 2. Weighted Random Selection

```javascript
// Generate random r in [0, W]
// Find which sector contains r by cumulative weight
```

### 3. Spin Physics

```javascript
// Total rotation = (360 × spins) + (360 - target_sector_center_angle)
// Use CSS cubic-bezier or JS frame animation for deceleration
```

### 4. SVG Path Generation

Use SVG path commands:
- `M` (MoveTo) - Start point
- `L` (LineTo) - Line to point
- `A` (Arc) - Arc with radius and angles

## Key Implementation Details

### Data Structure

```javascript
const CONFIG = {
    title: "我的转盘",
    theme: "forest",
    items: [
        { label: "选项A", weight: 1, color: "#2d5a27" },
        { label: "选项B", weight: 3, color: "#90be6d" }
    ]
};
```

### Save And Share Flow

1. Keep the current state in browser memory for immediate play
2. Save reusable configurations to `localStorage` as presets
3. Encode the current configuration into the URL for sharing

### Critical Requirements

- **No External CDNs**: Keep the static site self-contained
- **Weight Precision**: Ensure seamless SVG sector joints
- **Random Fairness**: Weighted selection must match probabilities
- **Browser Support**: Chrome, Safari, Edge (mobile + desktop)
- **Responsive**: Center text must adapt to length

## Development Notes

- Use native ES6+ features (no transpilation needed for modern browsers)
- Prefer CSS variables for theme switching
- Use `requestAnimationFrame` for smooth spin animation
- Test wheel with edge cases (1 item, many items, extreme weight ratios)
- Keep shared URLs backward-compatible when possible

## Browser Testing

Test the app page in:
- Chrome/Edge (Chromium)
- Safari (WebKit)
- Mobile browsers (iOS Safari, Chrome Android)

## File Size Considerations

Keep the shipped app minimal:
- Avoid unnecessary dependencies
- Prefer readable, maintainable browser-native code
- Keep bundle size reasonable for a small static tool
