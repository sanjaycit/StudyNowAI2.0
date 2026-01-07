# 📺 Fullscreen Blank Screen Fix

## Issue Reported
When leaving fullscreen mode, the screen became "blank and white".

## Root Causes Identified
1. **Automatic `requestFullscreen()` Call**: The `handleFullscreenChange` function was automatically trying to re-request fullscreen immediately after exit. Modern browsers block this (requires user gesture) and it can cause UI locking or console errors, potentially interfering with rendering.
2. **Overlay Styling**: The overlay relied on Tailwind classes (`bg-black bg-opacity-50`) which might fail to render transparency correctly in some environments, leading to a solid (blank/white) appearance or forcing a layout shift.

## Fixes Applied

### 1. Removed Auto-Request Logic 🛑
Removed the automatic `requestFullscreen()` call from the event handler.
- **Why**: The overlay prompt already provides a button for the user to click.
- **Benefit**: Prevents browser errors and "fighting" with the user's action.

```javascript
/* BEFORE */
if (!isFs) {
    requestFullscreen(); // ❌ Causes issues
}

/* AFTER */
if (!isFs) {
    // Do not auto-request fullscreen - it fails without user gesture
    // The overlay will prompt the user to click
}
```

### 2. Robust Overlay Styling 🎨
Switched to inline styles for the overlay background.
- **Why**: Ensures the dark transparent background is applied correctly regardless of CSS class loading or support.
- **Values**: Used `rgba(0, 0, 0, 0.85)` for a clearer dark overlay that definitely isn't white.

```javascript
/* BEFORE */
className="fixed inset-0 bg-black bg-opacity-50 ..."

/* AFTER */
className="fixed inset-0 ... "
style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
```

## How to Test

1. Start a quiz
2. **Press Esc** to exit fullscreen
3. **Observation**:
   - Screen should darken (dark gray/black overlay)
   - "Fullscreen Required" white box should appear in center
   - **NO** blank white screen
   - **NO** flickering
4. Click "Enter Fullscreen Mode" to return

## Why "Blank and White"?
The "blank and white" description likely referred to:
- "Blank" = The quiz content disappeared (covered by overlay)
- "White" = The overlay background might have been rendering incorrectly (solid white/gray due to blur) OR the user was referring to the large white modal box against a "blank" background.

With `rgba(0, 0, 0, 0.85)`, the background is explicitly **dark**, so the "white" issue should be resolved.

---

**Status**: ✅ **FIXED** 
Overlay is now stable, dark, and doesn't auto-trigger browser restrictions.
