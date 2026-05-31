# JapanGoodies Project Status

## Repo
`japangoodies/yokosoosaka` → GitHub Pages: `japangoodies.github.io/yokosoosaka/yokoso-website/`
Pushed by user `noobita019`

## Hosting
Migrated from GitHub Pages → **Cloudflare Pages** (May 31, 2026)
- Production: `https://japangoodies.pages.dev`
- Worker: `yokoso-stock-proxy` (unchanged)
- Auto-deploy: GitHub → Cloudflare Pages (on push to `main`, root dir `yokoso-website`)

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
- `yokoso-website/js/app.js` — All logic (~3700 lines)
- `yokoso-website/index.html` — Page structure, now with PWA manifest + apple-touch-icon
- `yokoso-website/css/style.css` — Styles (carousel, header search, product group badge)
- `yokoso-website/data/products.json` — Committed product data (with `category0` field)
- `yokoso-website/data/categories.json` — Committed category config (new `groups`/`subcategoryMap` format)
- `yokoso-website/maintenance.js` — Maintenance mode toggle (`MAINTENANCE_MODE = false`)
- `yokoso-website/maintenance.json` — Maintenance settings
- `yokoso-website/manifest.json` — PWA manifest (app name, icons, theme_color #d32f2f)
- `yokoso-website/sw.js` — PWA service worker (cache-first for assets, network-first for data)
- `yokoso-website/images/app-icon-192.png` — PWA icon (192x192, from logo)
- `yokoso-website/images/app-icon-512.png` — PWA icon (512x512, from logo)
- `yokoso-website/workers/stock-proxy/index.js` — Cloudflare Worker (stock proxy + orders API)

## Test Files (can be cleaned up)
- `yokoso-website/test-*.html` — Various test files created during debugging

## Session History (May 31, 2026)

### Fix: Real-time stock sync across devices
- **Problem**: Per-color per-size stock changes (admin edits, cart additions) were only saved locally as `{ q: total }` to the proxy. On page refresh, other devices saw stale stock because the product's variant data came from the CDN-cached `data/products.json`.
- **Fix**: `syncStockToFirestore` now sends full per-variant stock as `color|size` keys. `loadStockFromFirestore` and `subscribeStockUpdates` restore variant stock from proxy fields. `addToCart`, `removeFromCart`, and `updateCartQty` also sync to the proxy.
- **Files**: `js/app.js`

### Migrated: GitHub Pages → Cloudflare Pages
- Created Cloudflare Pages project `yokoso-website`
- Deployed static site to `https://yokoso-website.pages.dev`
- Production branch: `main`
- Worker at `yokoso-stock-proxy` remains unchanged and independent

## Session History (May 30, 2026)

### Fix: Firebase "undefined" deposit field error
- **Problem**: `deposit || undefined` passed `undefined` to Firestore when deposit was empty, causing "Unsupported field value: undefined"
- **Fix**: Changed to conditional `if (deposit) upd.deposit = deposit` in `js/app.js:2631,2637`
- **Files**: `js/app.js`

### Fix: Admin stock changes not reflecting on customer site
- **Problem**: When admin edited stock via product form, the proxy (stockMap) was never synced. On page refresh, `loadStockFromFirestore()` loaded old proxy data which overrode the new variants stock.
- **Fix**: Added `syncStockToFirestore(savedId)` after updating stockMap in the form submit handler (`js/app.js:2651`)
- **Files**: `js/app.js`

### Change: Product image display from cropped to full
- **Problem**: `object-fit: cover` cropped images on product cards and modal
- **Fix**: Changed to `object-fit: contain` and background to `#fff` in CSS and modal inline style
- **Files**: `css/style.css`, `js/app.js`

### Change: Per-order KV keys (remove 10 MB limit)
- **Problem**: All orders stored in single KV key `"orders"` — capped at 10 MB
- **Fix**: Each order stored under its own key `order:{poNumber}`; `kvGetOrders()` uses paginated KV list
- **Files**: `workers/stock-proxy/index.js`

### Added: `/orders/clear-all` endpoint
- **Purpose**: One-time route to wipe test orders from KV and Firestore
- **Files**: `workers/stock-proxy/index.js`

### Added: Telegram bot notifications (admin-only, Option A)
- Notifications sent for new orders (saveOrder), deposit paid (depositPaidOrder), and confirmed orders (confirmOrder)
- Config via admin → Config: Bot Token (from @BotFather) and Admin Chat ID (from @userinfobot)
- Worker endpoint: `POST /notifications/telegram` — proxies to api.telegram.org
- Bot token and chat ID stored in localStorage (`telegram_bot_token`, `telegram_chat_id`)
- Replaced WhatsApp notification (fully removed)

### Added: PWA (Progressive Web App) support
- **Files created**: `manifest.json`, `sw.js`, `images/app-icon-192.png`, `images/app-icon-512.png`
- **HTML updated**: manifest link, apple-touch-icon, theme-color meta
- **JS updated**: service worker registration at end of init
- **Service worker**: cache-first for static assets, network-first for `data/*.json` and API calls

## Credentials
- Admin password: `amped2016`
- Firebase API key: `AIzaSyCR8jcz2JeDr3VYztZm2KYdns4uPUajtqQ`
- GitHub: `japangoodies` org, `yokosoosaka` repo
