# Frontend Styles Documentation

## Overview
This document describes the styling system, color scheme, and CSS architecture used in the QuoteSwipe application.

---

## globals.css

**Location:** `src/styles/globals.css`

### Import Structure
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Important:** Font imports must precede Tailwind directives to avoid CSS parsing errors.

### Base Layer Styles
```css
@layer base {
  * { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background-color: theme('colors.background.primary');
    color: theme('colors.gray.800');
    line-height: 1.6;
  }
}
```

### Mobile Device Support
```css
.pt-safe-area-inset-top {
  padding-top: env(safe-area-inset-top);
}

.pb-safe-area-inset-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### Custom Components
```css
@layer components {
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: theme('colors.background.secondary');
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: theme('colors.border.medium');
    border-radius: 2px;
  }
}
```

### Utility Classes
```css
@layer utilities {
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }

  .transition-smooth {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .glass {
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.8);
  }

  .gradient-text {
    background: linear-gradient(135deg, theme('colors.primary.500'), theme('colors.secondary.400'));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}
```

---

## Tailwind Configuration

**Location:** `tailwind.config.js`

### Color System
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#fdf2f8',
        100: '#fce7f3',
        200: '#fbcfe8',
        300: '#f9a8d4',
        400: '#f472b6',
        500: '#F7AAD6',  // Main pink
        600: '#db2777',
        700: '#be185d',
        800: '#9d174d',
        900: '#831843',
      },
      secondary: {
        50: '#fefcff',
        100: '#fef7ff',
        200: '#feeeff',
        300: '#fdd8ff',
        400: '#FFC0E6',  // Soft pink
        500: '#e879f9',
        600: '#d946ef',
        700: '#c026d3',
        800: '#a21caf',
        900: '#86198f',
      },
      accent: '#FFD6EF',  // Light pink
      background: {
        primary: '#f8fafc',    // Lightest gray
        secondary: '#f1f5f9',  // Light gray
        card: '#f8f8f8',       // Border color
      },
      border: {
        light: '#e2e8f0',      // Medium gray
        medium: '#cbd5e1',     // Deep gray
        divider: '#f0f0f0',    // Divider line
        disabled: '#e8e8e8',   // Disabled state
      }
    }
  }
}
```

### Typography
- **Primary Font:** Inter (Google Fonts)
- **Fallback:** system-ui, -apple-system, sans-serif
- **Font Smoothing:** Enabled for better rendering

---

## Design System Usage

### Color Applications

#### Primary Colors
- **#F7AAD6** - Main buttons, active states, mood tags
- **#FFC0E6** - Secondary buttons, hover states
- **#FFD6EF** - Accent elements, highlights

#### Background Hierarchy
- **#f8fafc** - App background
- **#f1f5f9** - Tab navigation background
- **#f8f8f8** - Card backgrounds

#### Text Colors
- **gray-800** - Primary text
- **border-medium (#cbd5e1)** - Secondary text, placeholders

### Component-Specific Styling

#### QuoteCard
```css
.quote-card {
  @apply bg-background-card rounded-2xl shadow-lg border border-border-light p-8;
}
```

#### TabNavigation
```css
.tab-indicator {
  @apply bg-primary-500 rounded-xl shadow-sm;
}
```

#### MoodSelector
```css
.mood-option {
  @apply border-2 border-border-light bg-background-card hover:border-primary-300;
}

.mood-option.selected {
  @apply border-primary-500 bg-primary-50;
}
```

---

## Animation Guidelines

### Framer Motion Defaults
```typescript
// Smooth transitions
transition: { duration: 0.3, ease: "easeOut" }

// Spring animations
transition: { type: "spring", stiffness: 300, damping: 30 }
```

### Common Animation Patterns
- **Card entrance:** `y: 10 → 0` with opacity
- **Modal slides:** Bottom sheet with backdrop
- **Hover effects:** Minimal scale changes (1.02x max)
- **Tap feedback:** Scale down slightly (0.98x)

---

## Responsive Design

### Breakpoints
- **Mobile First:** 375px - 414px (primary target)
- **Tablet:** 768px+
- **Desktop:** 1024px+ (minimal support)

### Layout Patterns
- **Full height containers:** `min-h-screen`
- **Safe area handling:** Custom utility classes
- **Touch targets:** Minimum 44px (`.touch-target`)

---

## Performance Considerations

### CSS Optimization
- Uses Tailwind's purge system
- Critical font loading with `display=swap`
- Minimal custom CSS (leverages Tailwind utilities)

### Animation Performance
- Uses `transform` and `opacity` for animations
- Hardware acceleration via `translate3d`
- Avoids layout-triggering animations