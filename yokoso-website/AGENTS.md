# JapanGoodies Project Status

## Repo
`japangoodies/yokosoosaka` → GitHub Pages: `japangoodies.github.io/yokosoosaka/yokoso-website/`
Pushed by user `noobita019`

## Firebase
Project: `japan-goodies` (Firestore), collection `yokoso`, doc `products`
Ad blocker blocks `firestore.googleapis.com` — Firebase writes silently fail
Now using committed `data/products.json` as primary source instead

## Data Flow (as of latest deploy)
**Priority**: `data/products.json` (file) → `localStorage` (only if `yokoso_pending_sync === 'true'`) → Firebase (fallback if available)

- `loadProducts()`: Fetches file via `fetch('data/products.json?_=' + Date.now())` → checks localStorage for `yokoso_pending_sync` flag → uses localStorage only if pending edits exist → falls back to defaults
- `loadCategories()`: Same pattern with `data/categories.json`
- `saveProducts()`: Saves to localStorage, sets `yokoso_pending_sync = 'true'`, tries Firebase, triggers `syncToGitHub()` if auto-sync enabled
- `syncToGitHub()`: PUTs `data/products.json` to repo via GitHub API, on success clears `yokoso_pending_sync = 'false'`
- `syncCategoriesToGitHub()`: PUTs `data/categories.json` to repo via GitHub API (triggered by `saveCategoriesConfig()` if auto-sync on)
- Admin panel on login auto-detects unsynced localStorage data and migrates it

## GitHub Auto Sync
Requires user to create a Personal Access Token (classic, `repo` scope) from github.com/settings/tokens
Paste in admin → Auto Sync panel, check "Auto-sync on save"
CDN takes ~1-2 min to propagate after each sync
Now also syncs `data/categories.json` automatically

## Category Hierarchy (restructured)
**`category0` (Group)** → **`category1` (Subcategory)** → **`category2` (Brand)** → **sizes**
- Groups: e.g. MENS, WOMENS — shown as image carousel buttons
- Subcategories: e.g. Shoes, Clothing — linked to group (filtered by selected group)
- Brands: linked to group + subcategory (filtered dynamically from products)
- Sizes: per product, selected from presets

## Categories Config (`data/categories.json`)
```json
{
  "groups": [{ "name": "MENS", "image": "" }, { "name": "WOMENS", "image": "" }],
  "subcategoryMap": { "MENS": ["Shoes", "Clothing"], "WOMENS": ["Shoes", "Clothing", "Cosmetics"] },
  "brands": ["Nike", "Uniqlo", "GU", ...],
  "sizes": ["S", "M", "L", ...]
}
```
- Old format (`{ types, brands, sizes }`) auto-migrated on load via `migrateCategoriesConfig()`
- Group images uploaded as base64 in admin Category Management panel

## Images
- Uploaded via admin panel → resized to 800px JPEG (quality 0.8) → stored as base64 data URLs in product data
- Stored inline in `data/products.json` → committed to repo via auto-sync
- Each image ~80-150KB as base64; repo stays under limits for typical pasabuy scale

## Recent Architecture Changes
- **Category hierarchy restructured**: Added `category0` (Group) field to products, new `categoriesConfig` format with `groups` + `subcategoryMap`
- **Category carousel**: Groups displayed as horizontally scrollable image buttons — clicking shows subcategory and brand filter pills below
- **Subcategory filter**: Pill buttons below carousel, filtered by selected group; click to filter products by subcategory
- **Brand filter**: Pill buttons below subcategory, filtered by selected group+subcategory; click to filter products by brand
- **Search in header**: Search bar moved from `.search-filter` section to header (always visible next to logo)
- **Linked dropdowns**: Admin form Group→Subcategory→Brand selects cascade (selecting group filters subcategories, selecting subcategory filters brands)
- **Category management UI**: Groups section with image upload, Subcategories section with per-group picker, Brands, Sizes
- **Product card**: Group badge shown above subcategory
- **Dynamic fullscreen viewer**: Created in JS at click-time (no static HTML), bypasses ad-blocker CSS rules
- **File-based data**: Products/categories in `data/*.json` (committed to repo), replaces Firebase as source of truth
- **GitHub API auto-sync**: Commits `data/products.json` and `data/categories.json` directly on save (if token configured)
- **Cache busting**: Meta tags prevent HTML caching, `?_=timestamp` on data fetches
- **loadCategories**: Fetches from GitHub API `contents` endpoint (bypasses CDN), falls back to local file; preserves user's group images from localStorage but gives API images priority for cross-device sync
- **Group image sync**: Shows visible status messages directly in category management section; `resizeImage` now has error handlers for silent failures

## Fullscreen Viewer (`#liveFullscreen`)
- Dynamic element created in `openFullscreen()`
- Vertical swipe (up/down) to navigate images
- X button with `touchstart` handler (bypasses swipe gesture)
- `history.pushState({fullscreen: true}, '', '#fullscreen')` for swipe-back → closes fullscreen, returns to modal
- `touch-action: none` on root and `overscroll-behavior: none` on body prevent browser edge-swipe-back
- `document.documentElement.style.touchAction = 'none'` during fullscreen
- `z-index: 99999`

## Modal
- Dynamic modal created in `openModal()` at click-time
- Image carousel with dots, prev/next buttons (`‹` `›`)
- `img#modalMainImg` created in HTML string, click handler sets `currentModalImages` + `currentImageIndex` then calls `openFullscreen()` directly

## Mobile CSS
- Header search bar compact (0.4rem/0.75rem padding/font)
- Category carousel smaller buttons (100x75px, 0.7rem label)
- Compact filter bar: reduced padding (0.6rem), smaller buttons (0.3rem/0.75rem)
- Admin categories grid stacks to single column

## Known Files
- `yokoso-website/js/app.js` — All logic (~1865 lines)
- `yokoso-website/index.html` — Page structure (search in header, carousel, admin form with group)
- `yokoso-website/css/style.css` — Styles (carousel, header search, product group badge)
- `yokoso-website/data/products.json` — Committed product data (with `category0` field)
- `yokoso-website/data/categories.json` — Committed category config (new `groups`/`subcategoryMap` format)
- `yokoso-website/maintenance.js` — Maintenance mode toggle (`MAINTENANCE_MODE = false`)
- `yokoso-website/maintenance.json` — Maintenance settings

## Test Files (can be cleaned up)
- `yokoso-website/test-*.html` — Various test files created during debugging

## Credentials
- Admin password: `amped2016`
- Firebase API key: `AIzaSyCR8jcz2JeDr3VYztZm2KYdns4uPUajtqQ`
- GitHub: `japangoodies` org, `yokosoosaka` repo
