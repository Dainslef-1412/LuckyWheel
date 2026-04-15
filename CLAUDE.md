# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**zhuanpan** (转盘) is a single-file offline custom wheel generator. Users can customize wheel options, weights, and themes, then export the configured wheel as a **standalone HTML file**. The exported file runs locally without any server or external dependencies.

## Tech Stack

**Framework**: Vite + Vanilla JavaScript
- **Why Vite**: Fast dev server with HMR, clean build output, minimal overhead
- **Why Vanilla JS**: Simple, lightweight, easy to bundle into single HTML file
- **Avoid**: Next.js, React, Vue (overkill for this use case)

## Core Architecture

### Two-Mode System

1. **Editor Mode** (Configuration)
   - User inputs: title, options, weights, theme
   - Real-time SVG preview
   - Generates downloadable HTML file

2. **Play Mode** (Execution)
   - Spinning animation with physics
   - Weighted random selection
   - Result display
   - Toggle back to Editor mode

### Key Technical Constraints

- **Single HTML Export**: All CSS/JS must be inline in generated file
- **No External Dependencies**: No CDN links, no npm imports in exported file
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
│   ├── export.js        # HTML file generation
│   ├── themes.js        # Theme presets (colors, fonts)
│   └── utils.js         # Helper functions
├── template.html        # Standalone wheel template
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

### Export Flow

1. Serialize current state to JSON
2. Inject into `template.html` string
3. Create Blob with MIME type `text/html`
4. Trigger download via `URL.createObjectURL()`

### Critical Requirements

- **No External CDNs**: All CSS/JS must be inline strings
- **Weight Precision**: Ensure seamless SVG sector joints
- **Random Fairness**: Weighted selection must match probabilities
- **Browser Support**: Chrome, Safari, Edge (mobile + desktop)
- **Responsive**: Center text must adapt to length

## Development Notes

- Use native ES6+ features (no transpilation needed for modern browsers)
- Prefer CSS variables for theme switching
- Use `requestAnimationFrame` for smooth spin animation
- Test wheel with edge cases (1 item, many items, extreme weight ratios)
- Ensure exported HTML works offline (no external requests)

## Browser Testing

Test exported HTML in:
- Chrome/Edge (Chromium)
- Safari (WebKit)
- Mobile browsers (iOS Safari, Chrome Android)

## File Size Considerations

Keep exported HTML minimal:
- Minify CSS/JS before injection
- Use short variable names in template
- Avoid unnecessary comments
- Target: < 50KB per file
