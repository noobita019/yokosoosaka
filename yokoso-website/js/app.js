const DEFAULT_PRODUCTS = [
  { id: 1, name: "Nike Air Force 1 Low (Japan Exclusive)", category0: "MENS", category1: "Shoes", category2: "Nike", sizes: ["7", "8", "9", "10", "11", "12"], price: "₱5,200", description: "Authentic Nike Air Force 1 Low from Japan. Limited Japan-exclusive colorway. Leather upper with Air-Sole cushioning.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 2, name: "Nike Dunk Low Retro", category0: "MENS", category1: "Shoes", category2: "Nike", sizes: ["7", "8", "9", "10", "11"], price: "₱4,800", description: "Classic Nike Dunk Low in premium leather. Japan release. Available in multiple colors.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 3, name: "Nike Air Max 90 (Japan Pack)", category0: "MENS", category1: "Shoes", category2: "Nike", sizes: ["7", "8", "9", "10", "11", "12"], price: "₱5,500", description: "Nike Air Max 90 from the Japan-exclusive pack. Visible Air cushioning. Iconic silhouette.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 4, name: "GU Fluffy Knit Sweater", category0: "MENS", category1: "Clothing", category2: "GU", sizes: ["S", "M", "L", "XL"], price: "₱850", description: "Soft fluffy knit sweater from GU. Available in multiple colors. Perfect for cold season. Oversized relaxed fit.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 5, name: "Uniqlo Airism Oversized T-Shirt", category0: "MENS", category1: "Clothing", category2: "Uniqlo", sizes: ["S", "M", "L", "XL"], price: "₱650", description: "Authentic Uniqlo Airism oversized t-shirt. Ultra-lightweight and breathable. Moisture-wicking fabric.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 6, name: "GU Wide Leg Pants", category0: "MENS", category1: "Clothing", category2: "GU", sizes: ["S", "M", "L", "XL"], price: "₱950", description: "GU wide-leg pants. Comfortable and stylish. Premium cotton blend. Available in black, beige, and navy.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 7, name: "Uniqlo Light Down Jacket", category0: "MENS", category1: "Clothing", category2: "Uniqlo", sizes: ["S", "M", "L", "XL"], price: "₱2,200", description: "Lightweight Uniqlo down jacket. Packable design. 750 fill power. Warm without being bulky. Water-repellent.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 8, name: "Japanese Biore UV Aqua Rich SPF50+", category0: "WOMENS", category1: "Cosmetics", category2: "Biore", sizes: [], price: "₱550", description: "Biore UV Aqua Rich watery essence sunscreen. SPF50+ PA++++. Lightweight, non-sticky, refreshing finish. 80g.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 9, name: "Japanese Sheet Mask Variety Pack (10pcs)", category0: "WOMENS", category1: "Cosmetics", category2: "Generic", sizes: [], price: "₱380", description: "Assorted Japanese facial sheet masks. Infused with collagen, hyaluronic acid, and vitamin C. 10-piece pack.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 10, name: "Heroine Make Waterproof Eyeliner", category0: "WOMENS", category1: "Cosmetics", category2: "Heroine Make", sizes: [], price: "₱480", description: "Japanese Heroine Make waterproof liquid eyeliner. Ultra-fine 0.1mm tip. Smudge-proof and long-lasting. Black.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 11, name: "Onitsuka Tiger Mexico 66", category0: "MENS", category1: "Shoes", category2: "Onitsuka Tiger", sizes: ["6", "7", "8", "9", "10"], price: "₱3,800", description: "Classic Onitsuka Tiger Mexico 66 sneakers. Japan-exclusive colorway. Iconic design. Comfortable sole.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 12, name: "GU Knit Cardigan", category0: "MENS", category1: "Clothing", category2: "GU", sizes: ["S", "M", "L", "XL"], price: "₱1,100", description: "GU open-front knit cardigan. Soft acrylic blend. Oversized fit. Perfect layering piece for any outfit.", available: true, images: ["images/products/placeholder.svg"] }
];

// Firebase
var fbDB = null;
try {
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp({
      apiKey: "AIzaSyCR8jcz2JeDr3VYztZm2KYdns4uPUajtqQ",
      authDomain: "japan-goodies.firebaseapp.com",
      projectId: "japan-goodies",
      storageBucket: "japan-goodies.firebasestorage.app",
      messagingSenderId: "768529751498",
      appId: "1:768529751498:web:b0a48ecd1e709a8a5f0333",
      measurementId: "G-EJ6NKSDDHE"
    });
    fbDB = firebase.firestore();
  }
} catch (e) {}
const FB_COLLECTION = 'yokoso';
const FB_DOC = 'products';
var STOCK_PROXY_URL = localStorage.getItem('yokoso_stock_proxy_url') || 'https://yokoso-stock-proxy.shayera019.workers.dev';

function migrateCategoriesConfig(cfg) {
  if (cfg.types && !cfg.groups) {
    cfg.groups = [{ name: "All", image: "" }];
    cfg.subcategoryMap = { "All": cfg.types || [] };
    delete cfg.types;
  }
  if (!cfg.groups) cfg.groups = [];
  if (!cfg.subcategoryMap) {
    cfg.subcategoryMap = {};
    cfg.groups.forEach(function(g) { if (!cfg.subcategoryMap[g.name]) cfg.subcategoryMap[g.name] = []; });
  }
  cfg.groups.forEach(function(g) {
    if (!cfg.subcategoryMap[g.name]) cfg.subcategoryMap[g.name] = [];
  });
  if (!cfg.brands) cfg.brands = [];
  if (!cfg.sizes) cfg.sizes = [];
  if (!cfg.subcategoryBrands) cfg.subcategoryBrands = {};
  if (!cfg.brandLogos) cfg.brandLogos = {};
  return cfg;
}

let categoriesConfig = migrateCategoriesConfig({
  groups: [
    { name: "MENS", image: "" },
    { name: "WOMENS", image: "" }
  ],
  subcategoryMap: {
    "MENS": ["Shoes", "Clothing"],
    "WOMENS": ["Shoes", "Clothing", "Cosmetics"]
  },
  brands: ["Nike", "Uniqlo", "GU", "Biore", "Onitsuka Tiger", "Heroine Make", "Generic"],
  sizes: ["S", "M", "L", "XL", "6", "7", "8", "9", "10", "11", "12", "One Size", "Free Size"]
});

let currentGroup = 'all';
let currentBrand = 'all';
var adminSearchVal = '';
var adminFilterGroup = 'all';
var adminFilterType = 'all';
var adminFilterBrand = 'all';

let products = [];
let editingId = null;
let currentCategory = 'all';
let currentSearch = '';
let selectedImagesData = [];
let selectedSizes = [];
let _editSizeStock = {};
let currentModalImages = [];
let currentImageIndex = 0;
var scrollPos = 0, bodyLocked = false;

// Per-size stock tracking
var stockMap = {};

function stockField(size) {
  if (!size || size === 'default' || size === 'quantity') return 'q';
  return 's' + size.replace(/[^a-zA-Z0-9]/g, '');
}

function getSizeStock(productId, size) {
  var m = stockMap[productId];
  if (!m) return 5;
  var qty = m[stockField(size)];
  return qty !== undefined ? qty : 0;
}

function getTotalStock(productId) {
  var m = stockMap[productId];
  if (!m) return 5;
  var t = 0;
  for (var k in m) t += m[k];
  return t;
}

function hasSizes(product) {
  return Array.isArray(product.sizes) && product.sizes.length > 0;
}

function lockBody() {
  if (bodyLocked) return;
  bodyLocked = true;
  scrollPos = window.scrollY || window.pageYOffset;
  document.body.style.position = 'fixed';
  document.body.style.top = -scrollPos + 'px';
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.overflow = 'hidden';
}

function unlockBody() {
  if (!bodyLocked) return;
  bodyLocked = false;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.overflow = '';
  window.scrollTo(0, scrollPos);
}

// Prevent body touchmove when overlay is open
document.addEventListener('touchmove', function(e) {
  if (document.getElementById('productModal').classList.contains('active') &&
      !e.target.closest('.modal')) {
    e.preventDefault();
  }
  if (document.getElementById('liveFullscreen')) {
    e.preventDefault();
  }
}, { passive: false });

// Back button closes overlay via hashchange
window.addEventListener('hashchange', function() {
  var live = document.getElementById('liveModal');
  if (live && location.hash !== '#modal') { closeLiveModal(); return; }
  var liveFS = document.getElementById('liveFullscreen');
  var modal = document.getElementById('productModal');
  if (!liveFS && (!modal || !modal.classList.contains('active'))) return;
  var hash = location.hash;
  if (liveFS && hash !== '#fullscreen') {
    closeFullscreen();
    return;
  }
  if (modal && modal.classList.contains('active') && hash !== '#modal') {
    closeModal();
  }
});

function migrateProducts() {
  let migrated = false;
  products.forEach(p => {
    if (p.image && !p.images) {
      p.images = [p.image];
      delete p.image;
      migrated = true;
    }
    if (p.available === undefined) {
      p.available = true;
      migrated = true;
    }
    if (p.category && !p.category1) {
      p.category1 = p.category;
      delete p.category;
      migrated = true;
    }
    if (!p.category0) {
      // Assign to first group that has this subcategory
      var assigned = false;
      (categoriesConfig.groups || []).forEach(function(g) {
        if (assigned) return;
        var subs = categoriesConfig.subcategoryMap[g.name] || [];
        if (subs.indexOf(p.category1) !== -1) {
          p.category0 = g.name;
          assigned = true;
        }
      });
      if (!assigned) p.category0 = (categoriesConfig.groups[0] || {}).name || '';
      migrated = true;
    }
    if (!p.category2) {
      p.category2 = "";
      migrated = true;
    }
    if (!p.sizes) {
      p.sizes = [];
      migrated = true;
    }
    if (p.images) {
      var oldLen = p.images.length;
      p.images = p.images.filter(function(img) { return img && !img.match(/firebasestorage\.googleapis\.com/); });
      if (p.images.length === 0 && oldLen > 0) { p.images = ['images/products/placeholder.svg']; migrated = true; }
      else if (p.images.length !== oldLen) migrated = true;
    }
    if (p.stock === undefined) {
      p.stock = 5;
      migrated = true;
    }
  });
  return migrated;
}

function loadProducts(callback) {
  var rendered = false;
  function done() {
    if (!rendered) { rendered = true; if (callback) callback(); }
  }

  // Stage 1: Load committed data from file
  fetch('data/products.json?_=' + Date.now())
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data && data.length > 0) { products = data; migrateProducts(); }
      else { throw new Error('empty'); }
    })
    .catch(function() {
      // Fallback to localStorage or defaults
      var saved = localStorage.getItem('yokoso_products');
      if (saved) {
        try { products = JSON.parse(saved); migrateProducts(); }
        catch { products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)); }
      } else {
        products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
      }
    })
    .finally(function() {
      // Stage 2: Use localStorage only if there are explicit pending edits
      var saved = localStorage.getItem('yokoso_products');
      var pendingSync = localStorage.getItem('yokoso_pending_sync');
      if (saved && pendingSync === 'true') {
        try {
          var local = JSON.parse(saved);
          if (local.length > 0) { products = local; migrateProducts(); }
        } catch(e) {}
      }
      localStorage.setItem('yokoso_products', JSON.stringify(products));
      if (!saved || pendingSync !== 'true') {
        localStorage.setItem('yokoso_pending_sync', 'false');
      }

      // Stage 3: Firebase sync (if available)
      if (fbDB) {
        fbDB.collection(FB_COLLECTION).doc(FB_DOC).get()
          .then(function(doc) {
            if (doc.exists && doc.data().items && doc.data().items.length > 0) {
              products = doc.data().items;
              migrateProducts();
              localStorage.setItem('yokoso_products', JSON.stringify(products));
            } else {
              fbDB.collection(FB_COLLECTION).doc(FB_DOC).set({ items: products }).catch(function() {});
            }
            done();
          })
          .catch(function() { done(); });
        setTimeout(done, 3000);
      } else {
        done();
      }
    });

  // Load categories
  loadCategories();
}

function loadCategories() {
  var savedConfig = localStorage.getItem('yokoso_categories');

  // Stage 1: Load committed categories from GitHub API (bypasses CDN), fallback to local file
  var fileFetch = fetch('https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/contents/' + GITHUB_CATEGORIES_PATH)
    .then(function(r) {
      if (!r.ok) throw new Error('API fetch failed');
      return r.json();
    })
    .then(function(data) {
      if (data && data.content) {
        var decoded = atob(data.content.replace(/\n/g, ''));
        return JSON.parse(decoded);
      }
      throw new Error('no content');
    })
    .catch(function() {
      return fetch('data/categories.json?_=' + Date.now())
        .then(function(r) { return r.json(); })
        .catch(function() { return null; });
    });

  fileFetch.then(function(data) {
    if (data) {
      categoriesConfig = migrateCategoriesConfig(data);
    }
  })
  .catch(function() {
    // Fallback: keep whatever we had before
      if (savedConfig) {
        try {
          var parsed = JSON.parse(savedConfig);
          categoriesConfig = migrateCategoriesConfig(parsed);
        } catch(e) {}
      }
      categoriesConfig = migrateCategoriesConfig(categoriesConfig);
    })
    .finally(function() {
      // Stage 2: Overlay with savedConfig (preserves user's edits from before fetch)
      if (savedConfig) {
        try {
          var parsed = JSON.parse(savedConfig);
          var fetched = categoriesConfig;
          // Merge: API/file data is authoritative for groups, but localStorage edits take priority
          var fileGroups = fetched.groups || [];
          var userGroups = parsed.groups || [];
          userGroups.forEach(function(ug) {
            var fg = fileGroups.find(function(g) { return g.name === ug.name; });
            if (fg && !fg.image && ug.image) fg.image = ug.image;
          });
          // Merge subcategoryMap from localStorage (user may have added new subcategories)
          if (parsed.subcategoryMap) {
            Object.keys(parsed.subcategoryMap).forEach(function(g) {
              if (!fetched.subcategoryMap[g]) fetched.subcategoryMap[g] = [];
              parsed.subcategoryMap[g].forEach(function(s) {
                if (fetched.subcategoryMap[g].indexOf(s) === -1) fetched.subcategoryMap[g].push(s);
              });
            });
          }
          if (parsed.brandLogos) {
            if (!fetched.brandLogos) fetched.brandLogos = {};
            Object.keys(parsed.brandLogos).forEach(function(b) {
              if (!fetched.brandLogos[b]) fetched.brandLogos[b] = parsed.brandLogos[b];
            });
          }
          categoriesConfig = migrateCategoriesConfig(fetched);
        } catch(e) {}
      }
      localStorage.setItem('yokoso_categories', JSON.stringify(categoriesConfig));

      // Re-assign category0 for products using authoritative categoriesConfig
      products.forEach(function(p) {
        var assigned = false;
        (categoriesConfig.groups || []).forEach(function(g) {
          if (assigned) return;
          var subs = categoriesConfig.subcategoryMap[g.name] || [];
          if (subs.indexOf(p.category1) !== -1) {
            p.category0 = g.name;
            assigned = true;
          }
        });
        if (!assigned) p.category0 = (categoriesConfig.groups[0] || {}).name || '';
      });
      localStorage.setItem('yokoso_products', JSON.stringify(products));

      // Re-render now that categories are loaded
      renderFilters();
      renderProducts();

      // Stage 3: Firebase sync (if available)
      if (fbDB) {
        var catDone = false;
        fbDB.collection(FB_COLLECTION).doc('categories').get()
          .then(function(doc) {
            if (!catDone) {
              catDone = true;
              if (doc.exists) {
                var fbData = doc.data();
                if (fbData.types || fbData.groups) {
                  var currentBrandLogos = categoriesConfig.brandLogos || {};
                  categoriesConfig = migrateCategoriesConfig(fbData);
                  Object.keys(currentBrandLogos).forEach(function(b) {
                    if (!categoriesConfig.brandLogos[b]) categoriesConfig.brandLogos[b] = currentBrandLogos[b];
                  });
                  localStorage.setItem('yokoso_categories', JSON.stringify(categoriesConfig));
                }
              }
              renderCategoryDropdowns();
              renderCategoryManagement();
              renderFilters();
              renderProducts();
            }
          })
          .catch(function() { if (!catDone) { catDone = true; renderCategoryDropdowns(); renderCategoryManagement(); renderFilters(); renderProducts(); } });
        setTimeout(function() { if (!catDone) { catDone = true; renderCategoryDropdowns(); renderCategoryManagement(); renderFilters(); renderProducts(); } }, 3000);
      } else {
        renderCategoryDropdowns();
        renderCategoryManagement();
        renderFilters();
        renderProducts();
      }

      // Pick up proxy URL from categoriesConfig if not set locally
      if (!localStorage.getItem('yokoso_stock_proxy_url') && categoriesConfig.proxyUrl) {
        STOCK_PROXY_URL = categoriesConfig.proxyUrl;
        localStorage.setItem('yokoso_stock_proxy_url', STOCK_PROXY_URL);
        var pi = document.getElementById('stockProxyUrl');
        if (pi) pi.value = STOCK_PROXY_URL;
      }
    });
}

function saveCategoriesConfig() {
  var groupStatusEl = document.getElementById('groupImageSyncStatus');
  if (groupStatusEl) groupStatusEl.textContent = 'Saving...';
  localStorage.setItem('yokoso_categories', JSON.stringify(categoriesConfig));
  if (fbDB) {
    fbDB.collection(FB_COLLECTION).doc('categories').set(categoriesConfig).catch(function() {});
  }
  var autoSync = localStorage.getItem('autoSyncEnabled') === 'true';
  var token = localStorage.getItem('github_token');
  if (autoSync && token) {
    if (groupStatusEl) groupStatusEl.textContent = 'Syncing categories to GitHub...';
    syncCategoriesToGitHub();
  } else {
    if (groupStatusEl) {
      groupStatusEl.innerHTML = (autoSync ? '' : 'Auto-sync not enabled. ') + (!token ? 'No GitHub token.' : '') + ' <a href="#" onclick="document.getElementById(\'syncSettingsBtn\').click();return false">Open sync settings</a>';
      groupStatusEl.style.color = '#e67e22';
    }
  }
}

function saveProducts() {
  localStorage.setItem('yokoso_products', JSON.stringify(products));
  localStorage.setItem('yokoso_pending_sync', 'true');
  if (fbDB) {
    fbDB.collection(FB_COLLECTION).doc(FB_DOC).set({ items: products }).catch(function() {});
  }
  if (localStorage.getItem('autoSyncEnabled') === 'true' && localStorage.getItem('github_token')) {
    syncToGitHub();
  }
  // Show commit reminder in admin panel
  var reminder = document.getElementById('commitReminder');
  if (!reminder) {
    reminder = document.createElement('div');
    reminder.id = 'commitReminder';
    reminder.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#ffc107;color:#333;padding:12px 20px;border-radius:8px;font-size:14px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.2);cursor:pointer;max-width:300px;';
    reminder.addEventListener('click', function() { this.remove(); });
    document.body.appendChild(reminder);
  }
  var syncing = localStorage.getItem('autoSyncEnabled') === 'true' && localStorage.getItem('github_token');
  reminder.innerHTML = syncing ? 'Syncing to GitHub... ✓' : 'Changes saved locally. <b>Export JSON</b> and commit <code>data/products.json</code> to GitHub to sync all devices.';
  reminder.style.display = 'block';
  clearTimeout(reminder._timeout);
  reminder._timeout = setTimeout(function() { if (reminder) reminder.style.display = 'none'; }, syncing ? 2000 : 6000);
}

function uploadImage(dataUrl) {
    return Promise.resolve(dataUrl);
  }

function getGroups() {
  return categoriesConfig.groups || [];
}

function getSubcategories(groupName) {
  if (!groupName || groupName === 'all') {
    var all = [];
    categoriesConfig.groups.forEach(function(g) {
      (categoriesConfig.subcategoryMap[g.name] || []).forEach(function(s) {
        if (all.indexOf(s) === -1) all.push(s);
      });
    });
    return all;
  }
  return categoriesConfig.subcategoryMap[groupName] || [];
}

function getTypes() {
  var subs = getSubcategories(currentGroup === 'all' ? null : currentGroup);
  return subs;
}

function getBrands() {
  var filtered = products.filter(function(p) { return p.available !== false; });
  if (currentGroup !== 'all') {
    filtered = filtered.filter(function(p) { return p.category0 === currentGroup; });
  }
  if (currentCategory !== 'all') {
    filtered = filtered.filter(function(p) { return p.category1 === currentCategory; });
  }
  var brands = [...new Set(filtered.map(function(p) { return p.category2; }).filter(Boolean))].sort();
  categoriesConfig.brands.forEach(function(b) {
    if (brands.indexOf(b) === -1) brands.push(b);
  });
  return brands.sort();
}

function getBrandsForSubcategory(sub) {
  if (!sub || sub === 'all') return [];
  if (categoriesConfig.subcategoryBrands && categoriesConfig.subcategoryBrands[sub] && categoriesConfig.subcategoryBrands[sub].length) {
    return categoriesConfig.subcategoryBrands[sub].slice().sort();
  }
  var filtered = products.filter(function(p) { return p.available !== false && p.category0 === currentGroup && p.category1 === sub; });
  var brands = [...new Set(filtered.map(function(p) { return p.category2; }).filter(Boolean))].sort();
  return brands;
}

function renderFilters() {
  renderCarousel();
  renderSubcategoryFilter();
  renderBrandFilter();
}

function renderSubcategoryFilter() {
  var container = document.getElementById('subcategoryFilterContainer');
  if (!container) return;
  if (currentGroup === 'all') { container.innerHTML = ''; return; }
  var subs = getSubcategories(currentGroup);
  var html = '';
  subs.forEach(function(s) {
    html += '<button class="filter-btn' + (currentCategory === s && currentBrand === 'all' ? ' active' : '') + '" data-subcategory="' + s + '">' + s + '</button>';
  });
  container.innerHTML = html;
}

function renderCarousel() {
  var container = document.getElementById('categoryCarousel');
  if (!container) return;
  if (document.body.classList.contains('catalog-mode')) return;
  var groups = getGroups();
  container.innerHTML = groups.map(function(g) {
    var active = currentGroup === g.name ? ' active' : '';
    var imgStyle = g.image ? ' style="background-image:url(' + g.image + ');background-size:cover;background-position:center"' : '';
    return '<button class="carousel-group-btn' + active + '" data-group="' + g.name + '"' + imgStyle + '><span class="carousel-group-label">' + g.name + '</span></button>';
  }).join('');
}

function renderBrandFilter() {
  var container = document.getElementById('brandFilterContainer');
  if (!container) return;
  if (currentGroup === 'all' || currentCategory === 'all') {
    container.innerHTML = '';
    return;
  }
  var brands = getBrandsForSubcategory(currentCategory);
  if (!brands.length) { container.innerHTML = ''; return; }
  var html = '<div class="brand-grid">';
  brands.forEach(function(b) {
    var logo = categoriesConfig.brandLogos && categoriesConfig.brandLogos[b] ? categoriesConfig.brandLogos[b] : '';
    var active = currentBrand === b ? ' active' : '';
    html += '<button class="brand-card' + active + '" data-subcategory="' + currentCategory + '" data-brand="' + b + '">';
    if (logo) html += '<img src="' + logo + '" class="brand-card-logo">';
    html += '<span class="brand-card-name">' + b + '</span></button>';
  });
  html += '</div>';
  container.innerHTML = html;
}

var cc = document.getElementById('categoryCarousel');
if (cc) {
  cc.addEventListener('click', function(e) {
    var btn = e.target.closest('.carousel-group-btn');
    if (!btn) return;
    var groupName = btn.dataset.group;
    window.location.href = '?group=' + encodeURIComponent(groupName);
  });
}

var openSubcats = {};

document.addEventListener('click', function(e) {
  var brandCard = e.target.closest('.brand-card');
  if (brandCard) {
    var sub = brandCard.dataset.subcategory;
    var brand = brandCard.dataset.brand;
    currentCategory = sub;
    currentBrand = brand;
    openSubcats = {};
    renderSubcategoryFilter();
    document.getElementById('brandFilterContainer').innerHTML = '';
    renderProducts();
    return;
  }
  var subBtn = e.target.closest('#subcategoryFilterContainer .filter-btn');
  if (subBtn) {
    var sub = subBtn.dataset.subcategory;
    if (sub === 'all') {
      currentCategory = 'all';
      currentBrand = 'all';
      openSubcats = {};
    } else {
      currentCategory = sub;
      currentBrand = 'all';
      openSubcats = {};
    }
    renderSubcategoryFilter();
    renderBrandFilter();
    renderProducts();
    return;
  }
});

function openProduct(id) {
  const product = products.find(p => p.id === id);
  if (product) openModal(product);
}

function renderProducts() {
  var grid = document.getElementById('productGrid');
  var empty = document.getElementById('emptyState');
  var filtered = products.filter(function(p) { return p.available !== false; });
  if (currentGroup !== 'all') {
    filtered = filtered.filter(function(p) { return p.category0 === currentGroup; });
  }
  if (currentCategory !== 'all') {
    filtered = filtered.filter(function(p) { return p.category1 === currentCategory; });
  }
  if (currentBrand !== 'all') {
    filtered = filtered.filter(function(p) { return p.category2 === currentBrand; });
  }
  if (currentSearch) {
    var q = currentSearch.toLowerCase();
    filtered = filtered.filter(function(p) {
      return (p.name && p.name.toLowerCase().indexOf(q) !== -1) ||
             (p.category0 && p.category0.toLowerCase().indexOf(q) !== -1) ||
             (p.category1 && p.category1.toLowerCase().indexOf(q) !== -1) ||
             (p.category2 && p.category2.toLowerCase().indexOf(q) !== -1);
    });
  }
  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = filtered.map(function(p) {
    var brandHtml = p.category2 ? '<span class="product-brand">' + p.category2 + '</span>' : '';
    var sizesHtml = '';
    if (hasSizes(p)) {
      sizesHtml = '<div class="product-sizes">' + p.sizes.map(function(s) {
        var sStock = getSizeStock(p.id, s);
        var sClass = sStock > 0 ? '' : ' size-oos';
        return '<span class="product-size-tag' + sClass + '" onclick="event.stopPropagation();addToCart(' + p.id + ',\'' + s + '\')">' + s + (sStock > 0 && sStock <= 3 ? ' (' + sStock + ')' : '') + '</span>';
      }).join('') + '</div>';
    }
    var stock = p.stock !== undefined ? p.stock : 5;
    var totalAvail = getTotalStock(p.id);
    var stockLabel = totalAvail > 3 ? 'In Stock' : totalAvail > 0 ? 'Only ' + totalAvail + ' left' : 'Out of Stock';
    var stockClass = totalAvail > 0 ? 'in-stock' : 'out-of-stock';
    return '<div class="product-card" data-id="' + p.id + '">' +
      '<img class="product-image" src="' + (p.images?.[0] || 'images/products/placeholder.svg') + '" alt="' + p.name + '" loading="lazy" onerror="if(this.dataset.retry){this.src=\'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\';this.style.background=\'#eee\'}else{this.dataset.retry=\'1\';this.src=\'images/products/placeholder.svg\'}">' +
      '<div class="product-info">' +
      (p.category0 ? '<div class="product-group">' + p.category0 + '</div>' : '') +
      '<div class="product-category">' + p.category1 + '</div>' +
      brandHtml +
      '<div class="product-name" onclick="openProduct(' + p.id + ')">' + p.name + '</div>' +
      sizesHtml +
      '<div class="product-price">' + p.price + '</div>' +
      '<div class="product-stock ' + stockClass + '">' + stockLabel + '</div>' +
      (!hasSizes(p) && totalAvail > 0 ? '<button class="btn-add-cart" data-id="' + p.id + '">Add to Cart</button>' : '') +
      '</div></div>';
  }).join('');

  grid.querySelectorAll('.product-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (e.target.closest('.btn-add-cart')) return;
      var id = parseInt(this.dataset.id);
      if (!isNaN(id)) openProduct(id);
    });
  });
  grid.querySelectorAll('.btn-add-cart').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var id = parseInt(this.dataset.id);
      if (!isNaN(id)) addToCart(id);
    });
  });
}

// ---- PROXY-BASED REAL-TIME STOCK ----
var stockPollTimer = null;
var stockInitialized = false;

function proxyUrl(path) {
  return (STOCK_PROXY_URL || '') + '/' + path.replace(/^\/+/, '');
}

function isProxyReady() {
  return STOCK_PROXY_URL && STOCK_PROXY_URL.startsWith('http');
}

function setProxyStatus(msg, isError) {
  var el = document.getElementById('proxyStatus');
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? '#e94560' : '#2e7d32';
}

function syncStockToFirestore(productId) {
  if (!isProxyReady()) return;
  var p = products.find(function(x) { return x.id === productId; });
  if (!p) return;
  var body = {};
  if (hasSizes(p)) {
    var m = stockMap[productId];
    if (m) {
      body = m;
    } else {
      var perSize = Math.max(1, Math.floor((p.stock !== undefined ? p.stock : 5) / p.sizes.length));
      p.sizes.forEach(function(s) { body[stockField(s)] = perSize; });
      body.q = 0;
    }
  } else {
    body.q = p.stock !== undefined ? p.stock : 5;
  }
  console.log('[Stock] Syncing product', productId, '->', JSON.stringify(body));
  fetch(proxyUrl('stocks/' + productId), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(function(r) {
    if (!r.ok) console.warn('[Stock] Sync PUT failed:', r.status);
    return r.json().then(function(d) { console.log('[Stock] Sync response for', productId, ':', d); });
  }).catch(function(err) { console.warn('[Stock] Sync error for', productId, ':', err.message); });
}

function syncAllStockToFirestore() {
  if (!isProxyReady()) return;
  products.forEach(function(p) {
    syncStockToFirestore(p.id);
  });
  setProxyStatus('Stock synced to proxy');
}

function loadStockFromFirestore(callback) {
  if (!isProxyReady()) { console.log('[Stock] Proxy not ready, using local stock'); stockInitialized = true; if (callback) callback(); return; }
  var url = proxyUrl('stocks');
  console.log('[Stock] Loading from', url);
  fetch(url)
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      console.log('[Stock] Load response', r.status);
      return r.json();
    })
    .then(function(docs) {
      console.log('[Stock] Got docs:', docs ? docs.length : 0);
      if (Array.isArray(docs)) {
        docs.forEach(function(doc) {
          if (doc && doc.id) {
            var id = parseInt(doc.id);
            var p = products.find(function(x) { return x.id === id; });
            if (p && doc.fields) {
              // If product has sizes but doc has only 'q' (or old 'default'), migrate to per-size fields
              if (hasSizes(p) && Object.keys(doc.fields).length === 1 && (doc.fields.q !== undefined || doc.fields.default !== undefined)) {
                var total = doc.fields.q !== undefined ? doc.fields.q : doc.fields.default;
                stockMap[id] = {};
                var perSize = Math.max(1, Math.floor(total / p.sizes.length));
                p.sizes.forEach(function(s) { stockMap[id][stockField(s)] = perSize; });
                stockMap[id].q = 0;
              } else {
                stockMap[id] = doc.fields;
              }
              p.stock = getTotalStock(id);
              console.log('[Stock] Product', id, 'stockMap:', JSON.stringify(stockMap[id]), 'total:', p.stock);
            }
          }
        });
      }
      // Initialize stockMap for products not in Firestore yet
      products.forEach(function(p) {
        if (!stockMap[p.id]) {
          if (hasSizes(p)) {
            stockMap[p.id] = {};
            var perSize = Math.max(1, Math.floor((p.stock !== undefined ? p.stock : 5) / p.sizes.length));
            p.sizes.forEach(function(s) { stockMap[p.id][stockField(s)] = perSize; });
            stockMap[p.id].q = 0;
          } else {
            stockMap[p.id] = { q: p.stock !== undefined ? p.stock : 5 };
          }
          p.stock = getTotalStock(p.id);
          syncStockToFirestore(p.id);
        }
      });
      stockInitialized = true;
      setProxyStatus('Proxy connected (' + (docs ? docs.length : 0) + ' stock docs)');
      if (callback) callback();
    })
    .catch(function(err) {
      console.warn('[Stock] Load error:', err.message);
      stockInitialized = true;
      setProxyStatus('Proxy error: ' + (err.message || 'connection failed'), true);
      if (callback) callback();
    });
}

function subscribeStockUpdates() {
  if (!isProxyReady()) return;
  if (stockPollTimer) clearInterval(stockPollTimer);
  stockPollTimer = setInterval(function() {
    fetch(proxyUrl('stocks'))
      .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function(docs) {
        if (!Array.isArray(docs)) return;
        var changed = false;
        docs.forEach(function(doc) {
          if (doc && doc.id) {
            var id = parseInt(doc.id);
            var p = products.find(function(x) { return x.id === id; });
            if (p && doc.fields) {
              var fields = doc.fields;
              // Migrate old format to per-size
              if (hasSizes(p) && Object.keys(fields).length === 1 && (fields.q !== undefined || fields.default !== undefined)) {
                var total = fields.q !== undefined ? fields.q : fields.default;
                fields = {};
                var perSize = Math.max(1, Math.floor(total / p.sizes.length));
                p.sizes.forEach(function(s) { fields[stockField(s)] = perSize; });
                fields.q = 0;
              }
              var newTotal = 0;
              for (var k in fields) newTotal += fields[k];
              if (stockInitialized && p.stock !== newTotal) {
                // Don't overwrite local stock that was recently modified (pending async sync)
                if (p._stockLock && p._stockLock > Date.now()) return;
                stockMap[id] = fields;
                p.stock = newTotal;
                changed = true;
              }
            }
          }
        });
        if (changed) renderProducts();
      })
      .catch(function() {});
  }, 5000);
}

function firestoreAddToCart(productId, size) {
  if (!isProxyReady()) { console.warn('[Stock] Proxy not ready'); return; }
  var field = stockField(size);
  var url = proxyUrl('stocks/' + productId + '/decrement');
  console.log('[Stock] Decrement fetch to', url, 'field:', field);
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 1, field: field })
  }).then(function(r) {
    console.log('[Stock] Decrement response', r.status);
    if (r.ok) setProxyStatus('Stock updated via proxy');
    else setProxyStatus('Proxy write failed (HTTP ' + r.status + ')', true);
  }).catch(function(err) {
    console.warn('[Stock] Decrement error', err.message);
    setProxyStatus('Proxy write error: ' + (err.message || 'connection failed'), true);
  });
}

function firestoreRestoreStock(productId, amount, size) {
  if (!isProxyReady() || amount <= 0) return;
  var field = stockField(size);
  var url = proxyUrl('stocks/' + productId + '/increment');
  console.log('[Stock] Increment fetch to', url, 'field:', field, 'amount:', amount);
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amount, field: field })
  }).then(function(r) {
    console.log('[Stock] Increment response', r.status);
    if (r.ok) setProxyStatus('Stock restored via proxy');
    else setProxyStatus('Proxy restore failed (HTTP ' + r.status + ')', true);
  }).catch(function(err) {
    console.warn('[Stock] Increment error', err.message);
    setProxyStatus('Proxy restore error: ' + (err.message || 'connection failed'), true);
  });
}

function testProxyConnection() {
  var statusEl = document.getElementById('proxyStatus');
  if (!statusEl) return;
  statusEl.textContent = 'Testing...';
  statusEl.style.color = '#888';
  if (!isProxyReady()) { setProxyStatus('No proxy URL configured', true); return; }
  fetch(proxyUrl('stocks'))
    .then(function(r) {
      if (r.ok) { setProxyStatus('Connected! (' + r.status + ')'); return r.json(); }
      throw new Error('HTTP ' + r.status);
    })
    .then(function(docs) {
      setProxyStatus('Connected — ' + (Array.isArray(docs) ? docs.length : 0) + ' products in stock');
    })
    .catch(function(err) {
      setProxyStatus('Test failed: ' + (err.message || 'connection error'), true);
    });
}

// Pre-fill proxy URL input on load and auto-connect if saved
// Priority: localStorage > categoriesConfig > JS default
(function initProxy() {
  var saved = localStorage.getItem('yokoso_stock_proxy_url');
  if (saved) {
    STOCK_PROXY_URL = saved;
  } else if (categoriesConfig && categoriesConfig.proxyUrl) {
    STOCK_PROXY_URL = categoriesConfig.proxyUrl;
    localStorage.setItem('yokoso_stock_proxy_url', STOCK_PROXY_URL);
  }
  var input = document.getElementById('stockProxyUrl');
  if (input) {
    if (!input.value) input.value = STOCK_PROXY_URL;
  }
  if (STOCK_PROXY_URL) setProxyStatus('Proxy configured, connecting...');
})();

function applyProxyUrl() {
  var input = document.getElementById('stockProxyUrl');
  if (!input) return;
  STOCK_PROXY_URL = input.value.trim();
  localStorage.setItem('yokoso_stock_proxy_url', STOCK_PROXY_URL);
  // Persist across devices via categoriesConfig (synced to GitHub)
  if (categoriesConfig) {
    categoriesConfig.proxyUrl = STOCK_PROXY_URL;
    saveCategoriesConfig();
  }
  if (isProxyReady()) {
    setProxyStatus('Connecting...');
    stockInitialized = false;
    syncAllStockToFirestore();
    loadStockFromFirestore(function() {
      renderProducts();
      subscribeStockUpdates();
    });
  } else {
    setProxyStatus('Enter a valid proxy URL', true);
  }
}

// ---- CART SYSTEM ----
var cart = JSON.parse(localStorage.getItem('yokoso_cart') || '[]');

function saveCart() {
  localStorage.setItem('yokoso_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  var badge = document.getElementById('cartBadge');
  if (!badge) return;
  var count = cart.reduce(function(sum, item) { return sum + item.qty; }, 0);
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function cartKey(id, size) {
  return id + '_' + (size || '');
}

function addToCart(productId, size) {
  var p = products.find(function(x) { return x.id === productId; });
  if (!p) return;
  var field = stockField(size);
  var avail = getSizeStock(productId, size);
  if (avail <= 0) { alert('Size ' + size + ' is out of stock.'); return; }
  var key = cartKey(productId, size);
  var existing = cart.find(function(item) { return cartKey(item.id, item.size) === key; });
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id: productId,
      size: size || null,
      qty: 1,
      name: p.name,
      price: p.price,
      image: p.images?.[0] || 'images/products/placeholder.svg'
    });
  }
  if (!stockMap[productId]) stockMap[productId] = {};
  stockMap[productId][field] = Math.max(0, (stockMap[productId][field] || 0) - 1);
  p.stock = getTotalStock(productId);
  p._stockLock = Date.now() + 10000; // prevent poll overwrite for 10s
  saveCart();
  console.log('[Cart] Added ' + p.name + (size ? ' (' + size + ')' : '') + ', remaining ' + field + ': ' + stockMap[productId][field]);
  firestoreAddToCart(productId, size);
  renderProducts();
  showCartNotification(p.name + (size ? ' (' + size + ')' : ''));
}

function removeFromCart(productId, size) {
  var key = cartKey(productId, size);
  var idx = cart.findIndex(function(x) { return cartKey(x.id, x.size) === key; });
  if (idx === -1) return;
  var item = cart[idx];
  var p = products.find(function(x) { return x.id === productId; });
  var field = stockField(item.size);
  if (p) {
    if (!stockMap[productId]) stockMap[productId] = {};
    stockMap[productId][field] = (stockMap[productId][field] || 0) + item.qty;
    p.stock = getTotalStock(productId);
    p._stockLock = Date.now() + 10000;
  }
  cart.splice(idx, 1);
  saveCart();
  if (item) {
    firestoreRestoreStock(productId, item.qty, item.size);
    renderProducts();
  }
  renderCart();
}

function updateCartQty(productId, delta, size) {
  var key = cartKey(productId, size);
  var idx = cart.findIndex(function(x) { return cartKey(x.id, x.size) === key; });
  if (idx === -1) return;
  var item = cart[idx];
  var p = products.find(function(x) { return x.id === productId; });
  var field = stockField(item.size);
  var avail = p ? getSizeStock(productId, item.size) : 0;
  var newQty = item.qty + delta;
  if (newQty <= 0) { removeFromCart(productId, item.size); return; }
  if (delta > 0 && delta > avail) { alert('Not enough stock for size ' + (item.size || 'this item') + '.'); return; }
  if (p) {
    if (!stockMap[productId]) stockMap[productId] = {};
    stockMap[productId][field] = Math.max(0, (stockMap[productId][field] || 0) - delta);
    p.stock = getTotalStock(productId);
    p._stockLock = Date.now() + 10000;
  }
  item.qty = newQty;
  saveCart();
  if (p) {
    if (delta > 0) { firestoreAddToCart(productId, item.size); }
    else { firestoreRestoreStock(productId, Math.abs(delta), item.size); }
    renderProducts();
  }
  renderCart();
}

function getCartTotal() {
  return cart.reduce(function(sum, item) {
    var price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
    return sum + (isNaN(price) ? 0 : price * item.qty);
  }, 0);
}

function showCartNotification(name) {
  var el = document.getElementById('cartNotification');
  if (!el) return;
  el.textContent = name + ' added to cart!';
  el.classList.add('active');
  clearTimeout(el._timeout);
  el._timeout = setTimeout(function() { el.classList.remove('active'); }, 2000);
}

function toggleCart() {
  var el = document.getElementById('cartSlideout');
  var ov = document.getElementById('cartOverlay');
  if (!el) return;
  el.classList.toggle('active');
  if (ov) ov.classList.toggle('active');
  if (el.classList.contains('active')) renderCart();
}

function renderCart() {
  var list = document.getElementById('cartItems');
  var totalEl = document.getElementById('cartTotal');
  if (!list) return;
  if (cart.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:2rem 1rem;color:#888">Your cart is empty</div>';
    if (totalEl) totalEl.textContent = '';
    return;
  }
  list.innerHTML = cart.map(function(item) {
    var price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
    var subtotal = isNaN(price) ? item.price : '₱' + (price * item.qty).toFixed(2);
    var sizeEl = item.size ? '<div class="cart-item-size">Size ' + item.size + '</div>' : '';
    return '<div class="cart-item">' +
      '<img src="' + item.image + '" class="cart-item-img" onerror="this.src=\'images/products/placeholder.svg\'">' +
      '<div class="cart-item-info">' +
      '<div class="cart-item-name">' + item.name + '</div>' + sizeEl +
      '<div class="cart-item-price">' + item.price + '</div>' +
      '<div class="cart-item-qty">' +
      '<button class="cart-qty-btn" onclick="updateCartQty(' + item.id + ',-1,\'' + (item.size || '') + '\')">−</button>' +
      '<span>' + item.qty + '</span>' +
      '<button class="cart-qty-btn" onclick="updateCartQty(' + item.id + ',1,\'' + (item.size || '') + '\')">+</button>' +
      '</div></div>' +
      '<button class="cart-item-remove" onclick="removeFromCart(' + item.id + ',\'' + (item.size || '') + '\')">×</button>' +
      '</div>';
  }).join('');
  if (totalEl) {
    var total = getCartTotal();
    totalEl.textContent = total > 0 ? 'Total: ₱' + total.toFixed(2) : '';
  }
}

function openModalFullscreen() {
  try {
    currentModalImages = _modalImages.slice();
    currentImageIndex = _modalImageIdx;
    document.title = 'FS:' + currentModalImages.length;
    openFullscreen();
  } catch (e) {
    console.error('openModalFullscreen error:', e);
  }
}

function closeLiveModal() {
  var el = document.getElementById('liveModal');
  if (el) { el.remove(); unlockBody(); if (location.hash === '#modal') history.back(); }
}

var _modalImages = [];
var _modalImageIdx = 0;

function modalNav(delta) {
  if (_modalImages.length < 2) return;
  modalGoTo((_modalImageIdx + delta + _modalImages.length) % _modalImages.length);
}

function modalGoTo(index) {
  _modalImageIdx = index;
  var img = document.getElementById('modalMainImg');
  if (img) { img.src = _modalImages[_modalImageIdx]; }
  var dots = document.querySelectorAll('#liveModal .modal-dot');
  dots.forEach(function(d, i) { d.style.background = i === _modalImageIdx ? '#e94560' : '#ddd'; });
}

function openModal(product) {
  try {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'liveModal';
    overlay.style.cssText = 'display:flex !important;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;align-items:center;justify-content:center;padding:20px;';
    
    _modalImages = (Array.isArray(product.images) && product.images.length > 0) ? product.images : [product.image || 'images/products/placeholder.svg'];
    _modalImageIdx = 0;
    var productHasSizes = hasSizes(product);
    var sizesHtml = '';
    if (productHasSizes) {
      sizesHtml = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">' + product.sizes.map(function(s) {
        var sStock = getSizeStock(product.id, s);
        var sClass = sStock > 0 ? 'modal-size-btn' : 'modal-size-btn size-oos';
        var sLabel = sStock > 0 ? s : s + ' (OOS)';
        return '<button class="' + sClass + '" data-size="' + s + '" onclick="selectModalSize(this,\'' + s + '\')">' + sLabel + '</button>';
      }).join('') + '</div>';
    }
    var dotsHtml = _modalImages.length > 1 ? '<div style="display:flex;justify-content:center;gap:6px;padding:8px 0;position:absolute;bottom:0;left:0;right:0">' + _modalImages.map(function(_, i) { return '<span class="modal-dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + (i === 0 ? '#e94560' : '#ddd') + ';cursor:pointer" onclick="modalGoTo(' + i + ')"></span>'; }).join('') + '</div>' : '';
    var totalAvail = getTotalStock(product.id);
    
    overlay.innerHTML = '<div style="background:#fff;border-radius:16px;max-width:720px;width:100%;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.15)">' +
      '<button onclick="closeLiveModal()" style="position:absolute;top:12px;right:16px;background:rgba(0,0,0,0.06);border:none;font-size:24px;cursor:pointer;color:#666;z-index:10;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center">×</button>' +
      '<div style="display:flex;flex-direction:column">' +
        '<div style="position:relative">' +
          (_modalImages.length > 1 ? '<button onclick="modalNav(-1)" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);z-index:5;background:rgba(255,255,255,0.8);border:none;border-radius:50%;width:36px;height:36px;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#333">‹</button>' : '') +
          (_modalImages.length > 1 ? '<button onclick="modalNav(1)" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);z-index:5;background:rgba(255,255,255,0.8);border:none;border-radius:50%;width:36px;height:36px;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#333">›</button>' : '') +
          '<img id="modalMainImg" src="' + (_modalImages[0] || 'images/products/placeholder.svg') + '" style="width:100%;height:500px;object-fit:cover;background:#f0f0f0;cursor:pointer" onerror="if(this.dataset.retry){this.src=\'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\';this.style.background=\'#eee\'}else{this.dataset.retry=\'1\';this.src=\'images/products/placeholder.svg\'}">' +
          dotsHtml +
        '</div>' +
        '<div style="padding:24px 32px 32px">' +
          '<h2 style="font-size:20px;margin:0 0 4px;line-height:1.3">' + (product.name || '') + '</h2>' +
          '<p style="font-size:18px;font-weight:700;color:#e94560;margin:0 0 4px">' + (product.price || '') + '</p>' +
          '<p style="font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#888;font-weight:600;margin:0 0 8px">' + (product.category0 ? product.category0 + ' / ' : '') + (product.category1 || '') + (product.category2 ? ' · ' + product.category2 : '') + '</p>' +
          sizesHtml +
          '<p style="color:#666;margin:0 0 16px;line-height:1.6;font-size:14px">' + (product.description || '') + '</p>' +
          '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
          '<span style="font-size:0.8rem;font-weight:600;padding:4px 10px;border-radius:4px;' + (totalAvail > 0 ? 'background:#e8f5e9;color:#2e7d32' : 'background:#ffebee;color:#c62828') + '">' + (totalAvail > 3 ? 'In Stock' : totalAvail > 0 ? 'Only ' + totalAvail + ' left' : 'Out of Stock') + '</span>' +
          (totalAvail > 0 ? '<button id="modalAddToCartBtn" onclick="addToCartFromModal(' + product.id + ')" style="padding:12px 32px;border-radius:8px;border:none;font-weight:600;font-size:14px;background:#e94560;color:#fff;cursor:pointer">' + (productHasSizes ? 'Select a size' : 'Add to Cart') + '</button>' : '') +
          '<a href="https://m.me/yokosoosaka" target="_blank" style="display:inline-block;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;background:#e94560;color:#fff">Inquire / Order</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
    
    document.body.appendChild(overlay);
    var mImg = overlay.querySelector('#modalMainImg');
    if (mImg) { mImg.addEventListener('click', function(e) { currentModalImages = _modalImages.slice(); currentImageIndex = _modalImageIdx; openFullscreen(); }); }
    overlay.addEventListener('click', function(e) { if (e.target === this) closeLiveModal(); });
    lockBody();
    try { history.pushState({modal: true}, '', '#modal'); } catch (e) {}
  } catch (e) {
    console.error('openModal error:', e);
  }
}

// Modal size selection
var _modalSelectedSize = null;

function selectModalSize(el, size) {
  document.querySelectorAll('#liveModal .modal-size-btn').forEach(function(b) { b.style.borderColor = '#ddd'; b.style.background = '#f5f5f7'; });
  el.style.borderColor = '#e94560';
  el.style.background = '#ffe8eb';
  _modalSelectedSize = size;
  var btn = document.getElementById('modalAddToCartBtn');
  if (btn) btn.textContent = 'Add to Cart' + ' (' + size + ')';
}

function addToCartFromModal(productId) {
  var p = products.find(function(x) { return x.id === productId; });
  if (!p) return;
  if (hasSizes(p)) {
    if (!_modalSelectedSize) { alert('Please select a size first.'); return; }
    addToCart(productId, _modalSelectedSize);
  } else {
    addToCart(productId);
  }
  closeLiveModal();
}

var _modalImgRetry = 0;
function showModalImage() {
  const img = document.getElementById('modalImage');
  if (!img) { console.error('modalImage element not found!'); return; }
  img.onerror = function() {
    if (_modalImgRetry > 0) { this.onerror = null; this.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; return; }
    _modalImgRetry++;
    this.src = 'images/products/placeholder.svg';
  };
  img.src = currentModalImages[currentImageIndex] || 'images/products/placeholder.svg';
  const dotsContainer = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  if (currentModalImages.length > 1) {
    dotsContainer.innerHTML = currentModalImages.map((_, i) =>
      `<span class="carousel-dot ${i === currentImageIndex ? 'active' : ''}" data-index="${i}"></span>`
    ).join('');
    dotsContainer.style.display = '';
    prevBtn.style.display = '';
    nextBtn.style.display = '';
  } else {
    dotsContainer.innerHTML = '';
    dotsContainer.style.display = 'none';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  }
}

var cp = document.getElementById('carouselPrev');
if (cp) cp.addEventListener('click', () => {
  if (currentModalImages.length < 2) return;
  currentImageIndex = (currentImageIndex - 1 + currentModalImages.length) % currentModalImages.length;
  showModalImage();
});

var cn = document.getElementById('carouselNext');
if (cn) cn.addEventListener('click', () => {
  if (currentModalImages.length < 2) return;
  currentImageIndex = (currentImageIndex + 1) % currentModalImages.length;
  showModalImage();
});

var cd = document.getElementById('carouselDots');
if (cd) cd.addEventListener('click', e => {
  const dot = e.target.closest('.carousel-dot');
  if (!dot) return;
  currentImageIndex = parseInt(dot.dataset.index);
  showModalImage();
});

function closeModal() {
  var pm = document.getElementById('productModal');
  if (pm) { pm.classList.remove('active'); pm.style.display = ''; }
  unlockBody();
  currentModalImages = [];
  currentImageIndex = 0;
  if (location.hash === '#modal') history.back();
}

var pm = document.getElementById('productModal');
if (pm) pm.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
var mc = document.querySelector('#productModal .modal-close');
if (mc) mc.addEventListener('click', closeModal);
// Fullscreen image viewer
function openFullscreen() {
  if (currentModalImages.length === 0) return;
  var old = document.getElementById('liveFullscreen');
  if (old) old.remove();
  var ov = document.createElement('div');
  ov.id = 'liveFullscreen';
  ov.style.cssText = 'display:flex!important;position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;background:#000!important;z-index:99999!important;';
  document.body.appendChild(ov);
  var track = document.createElement('div');
  track.style.cssText = 'position:relative;width:100%;height:100%;display:flex;flex-direction:column;';
  var h = window.innerHeight;
  for (var i = 0; i < currentModalImages.length; i++) {
    var slide = document.createElement('div');
    slide.style.cssText = 'height:' + h + 'px;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
    var img = document.createElement('img');
    img.src = currentModalImages[i];
    img.style.cssText = 'max-width:100vw;max-height:100vh;object-fit:contain;user-select:none;';
    slide.appendChild(img);
    track.appendChild(slide);
  }
  track.style.transform = 'translate3d(0,' + (-currentImageIndex * h) + 'px,0)';
  ov.appendChild(track);
  var closeBtn = document.createElement('button');
  closeBtn.textContent = '\u00D7';
  closeBtn.style.cssText = 'position:fixed!important;top:16px!important;right:20px!important;background:rgba(255,255,255,0.1)!important;border:none!important;color:#fff!important;font-size:2rem!important;width:44px!important;height:44px!important;border-radius:50%!important;cursor:pointer!important;z-index:999999!important;display:flex!important;align-items:center!important;justify-content:center!important;';
  closeBtn.onclick = closeFullscreen;
  closeBtn.addEventListener('touchstart', function(e) { e.stopPropagation(); closeFullscreen(); });
  closeBtn.addEventListener('touchend', function(e) { e.preventDefault(); });
  ov.appendChild(closeBtn);
  var counter = document.createElement('div');
  counter.id = 'fsCounter';
  counter.style.cssText = 'position:fixed!important;top:20px!important;left:50%!important;transform:translateX(-50%)!important;color:rgba(255,255,255,0.5)!important;font-size:0.85rem!important;z-index:10!important;pointer-events:none!important;';
  counter.textContent = (currentImageIndex + 1) + ' / ' + currentModalImages.length;
  ov.appendChild(counter);
  ov.addEventListener('click', function(e) { if (e.target === this) closeFullscreen(); });
  document.documentElement.style.touchAction = 'none';
  document.body.style.overscrollBehavior = 'none';
  lockBody();
  try { history.pushState({fullscreen: true}, '', '#fullscreen'); } catch (e) {}
}

function closeFullscreen() {
  var ov = document.getElementById('liveFullscreen');
  if (ov) ov.remove();
  document.documentElement.style.touchAction = '';
  document.body.style.overscrollBehavior = '';
  var modal = document.getElementById('productModal');
  var live = document.getElementById('liveModal');
  if ((!modal || !modal.classList.contains('active')) && !live) unlockBody();
  if (location.hash === '#fullscreen') {
    try { history.back(); } catch (e) {}
  }
}

var modalImg = document.getElementById('modalImage');
modalImg.addEventListener('click', openFullscreen);
(function() {
  var touchStartX = 0, touchStartY = 0;
  modalImg.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  modalImg.addEventListener('touchend', function(e) {
    if (currentModalImages.length < 2) { openFullscreen(); return; }
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    var dist = Math.abs(dx) + Math.abs(dy);
    if (dist > 15) {
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < -30) { currentImageIndex = (currentImageIndex + 1) % currentModalImages.length; showModalImage(); }
        else if (dx > 30) { currentImageIndex = (currentImageIndex - 1 + currentModalImages.length) % currentModalImages.length; showModalImage(); }
      }
    } else {
      openFullscreen();
    }
  }, { passive: true });
})();

function updateCounter() {
  var el = document.getElementById('fsCounter') || document.getElementById('fullscreenCounter');
  if (el) el.textContent = (currentImageIndex + 1) + ' / ' + currentModalImages.length;
}

function getFullscreenTrack() {
  var ov = document.getElementById('liveFullscreen');
  return ov ? ov.firstElementChild : document.getElementById('fullscreenTrack');
}

// Fullscreen swipe / drag
(function() {
  var viewer = document.getElementById('fullscreenViewer');
  var startY = 0, startX = 0;
  var dragging = false;
  var dragOffset = 0;

  function isActive() { return !!document.getElementById('liveFullscreen'); }

  function nav(dir) {
    if (currentModalImages.length < 2) return;
    var next = currentImageIndex + dir;
    if (next < 0 || next >= currentModalImages.length) return;
    currentImageIndex = next;
    updateCounter();
    var h = window.innerHeight;
    var tr = getFullscreenTrack();
    if (!tr) return;
    tr.style.transition = 'transform 0.3s ease';
    tr.style.transform = 'translate3d(0,' + (-next * h) + 'px,0)';
  }

  document.addEventListener('touchstart', function(e) {
    if (!isActive()) return;
    var t = e.touches[0];
    if (!t) return;
    startY = t.clientY;
    startX = t.clientX;
    dragOffset = 0;
    dragging = true;
    var tr = getFullscreenTrack();
    if (tr) tr.style.transition = 'none';
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', function(e) {
    if (!dragging || !isActive()) return;
    if (currentModalImages.length < 2) { dragging = false; return; }
    var t = e.touches[0];
    if (!t) return;
    var dy = t.clientY - startY;
    var h = window.innerHeight;
    dragOffset = dy;
    var tr = getFullscreenTrack();
    if (!tr) return;
    tr.style.transition = 'none';
    var offset = dy * 0.3;
    if (currentImageIndex === 0) offset = Math.min(offset, 0);
    if (currentImageIndex === currentModalImages.length - 1) offset = Math.max(offset, 0);
    tr.style.transform = 'translate3d(0,' + (-currentImageIndex * h + offset) + 'px,0)';
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchend', function(e) {
    if (!dragging) return;
    dragging = false;
    if (currentModalImages.length < 2) return;
    if (Math.abs(dragOffset) > 50) {
      nav(dragOffset < 0 ? 1 : -1);
    } else {
      var h = window.innerHeight;
      var tr = getFullscreenTrack();
      if (!tr) return;
      tr.style.transition = 'transform 0.3s ease';
      tr.style.transform = 'translate3d(0,' + (-currentImageIndex * h) + 'px,0)';
    }
  }, { passive: true });

  document.addEventListener('wheel', function(e) {
    if (!isActive()) return;
    if (currentModalImages.length < 2) return;
    if (Math.abs(e.deltaY) < 20) return;
    nav(e.deltaY > 0 ? 1 : -1);
  }, { passive: true });
})();

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    var live = document.getElementById('liveModal');
    if (live) { closeLiveModal(); return; }
    if (document.getElementById('liveFullscreen')) {
      closeFullscreen();
      return;
    }
    closeModal();
    return;
  }
  if (document.getElementById('liveFullscreen')) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (currentImageIndex > 0) {
        currentImageIndex--;
        updateCounter();
        var tr = getFullscreenTrack();
        if (tr) {
          var h2 = window.innerHeight;
          tr.style.transition = 'transform 0.3s ease';
          tr.style.transform = 'translate3d(0,' + (-currentImageIndex * h2) + 'px,0)';
        }
      }
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (currentImageIndex < currentModalImages.length - 1) {
        currentImageIndex++;
        updateCounter();
        var tr = getFullscreenTrack();
        if (tr) {
          var h2 = window.innerHeight;
          tr.style.transition = 'transform 0.3s ease';
          tr.style.transform = 'translate3d(0,' + (-currentImageIndex * h2) + 'px,0)';
        }
      }
      e.preventDefault();
    }
    return;
  }
  if (!document.getElementById('productModal').classList.contains('active')) return;
  if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
    currentImageIndex--;
    showModalImage();
  }
  if (e.key === 'ArrowRight' && currentImageIndex < currentModalImages.length - 1) {
    currentImageIndex++;
    showModalImage();
  }
});

var si = document.getElementById('searchInput');
if (si) si.addEventListener('input', e => {
  currentSearch = e.target.value;
  renderProducts();
});

function doSearch(e) {
  if (e) e.preventDefault();
  var input = document.getElementById('searchInput');
  input.readOnly = true;
  input.blur();
  setTimeout(function() {
    input.readOnly = false;
    requestAnimationFrame(function() {
      var el = document.querySelector('.product-card .product-image') || document.getElementById('productGrid');
      if (el) {
        var y = el.getBoundingClientRect().top + window.pageYOffset - 250;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    });
  }, 600);
}

if (si) si.addEventListener('search', doSearch);

if (si) si.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    doSearch(e);
  }
});

var mt = document.getElementById('menuToggle');
if (mt) mt.addEventListener('click', () => {
  document.querySelector('.nav').classList.toggle('open');
});

// ---- ADMIN PANEL ----

function renderAdminList() {
  renderAdminFilterDropdowns();
  var container = document.getElementById('adminProductList');
  var filtered = products;
  if (adminSearchVal) {
    var q = adminSearchVal.toLowerCase();
    filtered = filtered.filter(function(p) {
      return (p.name && p.name.toLowerCase().indexOf(q) !== -1) ||
             (p.category0 && p.category0.toLowerCase().indexOf(q) !== -1) ||
             (p.category1 && p.category1.toLowerCase().indexOf(q) !== -1) ||
             (p.category2 && p.category2.toLowerCase().indexOf(q) !== -1);
    });
  }
  if (adminFilterGroup !== 'all') {
    filtered = filtered.filter(function(p) { return p.category0 === adminFilterGroup; });
  }
  if (adminFilterType !== 'all') {
    filtered = filtered.filter(function(p) { return p.category1 === adminFilterType; });
  }
  if (adminFilterBrand !== 'all') {
    filtered = filtered.filter(function(p) { return p.category2 === adminFilterBrand; });
  }
  document.getElementById('productCount').textContent = filtered.length;
  if (filtered.length === 0) {
    container.innerHTML = '<p style="color:#888;text-align:center;padding:2rem">' + (products.length === 0 ? 'No products yet. Add your first product!' : 'No products match your filters.') + '</p>';
    return;
  }
  container.innerHTML = filtered.map(function(p) {
    var catStr = p.category1;
    if (p.category0) catStr = p.category0 + ' / ' + catStr;
    if (p.category2) catStr += ' · ' + p.category2;
    var sizesStr = p.sizes && p.sizes.length > 0 ? ' · Sizes: ' + p.sizes.join(', ') : '';
    var stockStr = ' · Stock: ' + (p.stock !== undefined ? p.stock : 5);
    return '<div class="admin-product-item" data-id="' + p.id + '">' +
      '<img src="' + (p.images?.[0] || 'images/products/placeholder.svg') + '" alt="' + p.name + '" onerror="if(this.dataset.retry)this.style.display=\'none\';else{this.dataset.retry=\'1\';this.src=\'images/products/placeholder.svg\'}">' +
      '<div class="admin-product-item-info">' +
      '<div class="name">' + p.name + '</div>' +
      '<div class="meta">' + catStr + ' · ' + p.price + sizesStr + stockStr + '</div>' +
      '</div>' +
      '<div class="admin-product-item-actions">' +
      '<button class="btn btn-sm ' + (p.available !== false ? 'btn-success' : 'btn-secondary') + ' toggle-available-btn">' + (p.available !== false ? 'Available' : 'Hidden') + '</button>' +
      '<button class="btn btn-secondary btn-sm edit-product-btn">Edit</button>' +
      '<button class="btn btn-danger btn-sm delete-product-btn">Delete</button>' +
      '</div></div>';
  }).join('');

  container.querySelectorAll('.toggle-available-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = parseInt(e.target.closest('.admin-product-item').dataset.id);
      const p = products.find(x => x.id === id);
      if (p) {
        p.available = p.available === false;
        saveProducts();
        renderAdminList();
        renderProducts();
        renderFilters();
      }
    });
  });

  container.querySelectorAll('.edit-product-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = parseInt(e.target.closest('.admin-product-item').dataset.id);
      editProduct(id);
    });
  });
  container.querySelectorAll('.delete-product-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = parseInt(e.target.closest('.admin-product-item').dataset.id);
      deleteProduct(id);
    });
  });
}

function renderCategoryDropdowns() {
  var groupSelect = document.getElementById('formCategory0');
  var typeSelect = document.getElementById('formCategory1');
  var brandSelect = document.getElementById('formCategory2');
  if (!groupSelect || !typeSelect || !brandSelect) return;

  var groups = getGroups();
  groupSelect.innerHTML = groups.map(function(g) {
    return '<option value="' + g.name + '">' + g.name + '</option>';
  }).join('');

  updateSubcategoryDropdown();
  updateBrandDropdown();
  renderSizePresets();
}

function updateSubcategoryDropdown() {
  var groupSelect = document.getElementById('formCategory0');
  var typeSelect = document.getElementById('formCategory1');
  if (!groupSelect || !typeSelect) return;
  var group = groupSelect.value;
  var subs = getSubcategories(group);
  var currentVal = typeSelect.value;
  typeSelect.innerHTML = '<option value="">Select subcategory...</option>' + subs.map(function(t) {
    var sel = t === currentVal ? ' selected' : '';
    return '<option value="' + t + '"' + sel + '>' + t + '</option>';
  }).join('');
  updateBrandDropdown();
}

function updateBrandDropdown() {
  var groupSelect = document.getElementById('formCategory0');
  var typeSelect = document.getElementById('formCategory1');
  var brandSelect = document.getElementById('formCategory2');
  if (!groupSelect || !typeSelect || !brandSelect) return;
  var group = groupSelect.value;
  var sub = typeSelect.value;
  var filtered = products.filter(function(p) { return p.available !== false; });
  if (group) filtered = filtered.filter(function(p) { return p.category0 === group; });
  if (sub) filtered = filtered.filter(function(p) { return p.category1 === sub; });
  var usedBrands = [...new Set(filtered.map(function(p) { return p.category2; }).filter(Boolean))].sort();
  var allBrands = categoriesConfig.brands.slice();
  usedBrands.forEach(function(b) { if (allBrands.indexOf(b) === -1) allBrands.push(b); });
  var currentVal = brandSelect.value;
  brandSelect.innerHTML = '<option value="">Select brand...</option>' + allBrands.map(function(b) {
    var sel = b === currentVal ? ' selected' : '';
    return '<option value="' + b + '"' + sel + '>' + b + '</option>';
  }).join('');
}

function renderSizePresets() {
  var container = document.getElementById('formSizePresets');
  if (!container) return;
  var allSizes = categoriesConfig.sizes.slice();
  getUsedSizes().forEach(function(s) { if (allSizes.indexOf(s) === -1) allSizes.push(s); });
  container.innerHTML = allSizes.map(function(s) {
    var active = selectedSizes.indexOf(s) !== -1;
    return '<button type="button" class="form-size-preset' + (active ? ' active' : '') + '" data-size="' + s + '">' + s + '</button>';
  }).join('');
  container.querySelectorAll('.form-size-preset').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var s = this.dataset.size;
      var idx = selectedSizes.indexOf(s);
      if (idx === -1) { selectedSizes.push(s); } else { selectedSizes.splice(idx, 1); }
      renderSizeTags();
      renderSizePresets();
    });
  });
}

function renderSizeTags() {
  var container = document.getElementById('formSizeTags');
  if (!container) return;
  if (selectedSizes.length === 0) { container.innerHTML = ''; renderSizeStockInputs(); return; }
  container.innerHTML = selectedSizes.map(function(s, i) {
    return '<span class="form-size-tag">' + s + '<span class="form-size-tag-remove" data-index="' + i + '">×</span></span>';
  }).join('');
  container.querySelectorAll('.form-size-tag-remove').forEach(function(el) {
    el.addEventListener('click', function() {
      var idx = parseInt(this.dataset.index);
      selectedSizes.splice(idx, 1);
      renderSizeTags();
      renderSizePresets();
    });
  });
  renderSizeStockInputs();
}

function renderSizeStockInputs() {
  var container = document.getElementById('formSizeStock');
  if (!container) return;
  if (selectedSizes.length === 0) { container.style.display = 'none'; return; }
  container.style.display = 'block';
  container.innerHTML = '<label style="font-size:0.8rem;color:#aaa;margin-bottom:4px;display:block">Stock per size</label>' +
    '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
    selectedSizes.map(function(s) {
      var val = _editSizeStock && _editSizeStock[s] !== undefined ? _editSizeStock[s] : 5;
      return '<div style="display:flex;flex-direction:column;align-items:center;gap:2px"><span style="font-size:11px;color:#888">' + s + '</span><input type="number" class="size-stock-input" data-size="' + s + '" value="' + val + '" min="0" style="width:50px;padding:4px 6px;border:1px solid rgba(255,255,255,0.15);border-radius:4px;background:rgba(255,255,255,0.06);color:#fff;font-size:0.8rem;text-align:center;outline:none"></div>';
    }).join('') +
    '</div>';
  container.querySelectorAll('.size-stock-input').forEach(function(inp) {
    inp.addEventListener('input', function() {
      _editSizeStock[this.dataset.size] = parseInt(this.value) || 0;
    });
  });
}

function getUsedSizes() {
  var all = [];
  products.forEach(function(p) {
    if (p.sizes) { p.sizes.forEach(function(s) { if (all.indexOf(s) === -1) all.push(s); }); }
  });
  return all.sort();
}

function resetForm() {
  editingId = null;
  document.getElementById('formTitle').textContent = 'Add Product';
  document.getElementById('formSubmitBtn').textContent = 'Add Product';
  document.getElementById('formCancelBtn').style.display = 'none';
  document.getElementById('productForm').reset();
  document.getElementById('formStock').value = 5;
  selectedImagesData = [];
  renderImagePreview();
  selectedSizes = [];
  _editSizeStock = {};
  renderSizeTags();
  renderSizePresets();
  var ss = document.getElementById('formSizeStock');
  if (ss) ss.style.display = 'none';
}

function populateForm(product) {
  editingId = product.id;
  document.getElementById('formTitle').textContent = 'Edit Product';
  document.getElementById('formSubmitBtn').textContent = 'Save Changes';
  document.getElementById('formCancelBtn').style.display = 'inline-block';
  document.getElementById('formName').value = product.name;
  document.getElementById('formCategory0').value = product.category0 || '';
  updateSubcategoryDropdown();
  document.getElementById('formCategory1').value = product.category1 || '';
  updateBrandDropdown();
  document.getElementById('formCategory2').value = product.category2 || '';
  document.getElementById('formPrice').value = product.price;
  document.getElementById('formDesc').value = product.description;
  document.getElementById('formAvailable').checked = product.available !== false;
  document.getElementById('formStock').value = product.stock !== undefined ? product.stock : 5;
  selectedSizes = product.sizes ? product.sizes.slice() : [];
  // Populate per-size stock from stockMap
  _editSizeStock = {};
  var sm = stockMap[product.id];
  if (sm && selectedSizes.length > 0) {
    selectedSizes.forEach(function(s) {
      var k = stockField(s);
      _editSizeStock[s] = sm[k] !== undefined ? sm[k] : 5;
    });
  }
  renderSizeTags();
  renderSizePresets();
  var imgs = product.images || (product.image ? [product.image] : []);
  selectedImagesData = imgs.filter(function(img) { return img && img.indexOf('placeholder') === -1; });
  renderImagePreview();
  document.getElementById('formImage').value = '';
}

function editProduct(id) {
  const product = products.find(p => p.id === id);
  if (product) populateForm(product);
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  products = products.filter(p => p.id !== id);
  saveProducts();
  renderAdminList();
  renderFilters();
}

var pf = document.getElementById('productForm');
if (pf) pf.addEventListener('submit', function(e) {
  e.preventDefault();
  var name = document.getElementById('formName').value.trim();
  var category0 = document.getElementById('formCategory0').value;
  var category1 = document.getElementById('formCategory1').value;
  var category2 = document.getElementById('formCategory2').value;
  var price = document.getElementById('formPrice').value.trim();
  var description = document.getElementById('formDesc').value.trim();
  if (!name || !category0 || !category1 || !category2 || !price || !description) return;

  var submitBtn = document.getElementById('formSubmitBtn');
  var origText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Uploading...';

  var toUpload = selectedImagesData.filter(function(s) { return s.startsWith('data:'); });
  var keep = selectedImagesData.filter(function(s) { return !s.startsWith('data:'); });

  function finish(images) {
    var stock = parseInt(document.getElementById('formStock').value) || 0;
    if (editingId) {
      var idx = products.findIndex(function(p) { return p.id === editingId; });
      if (idx !== -1) {
        products[idx] = Object.assign({}, products[idx], { name: name, category0: category0, category1: category1, category2: category2, price: price, description: description, images: images, sizes: selectedSizes.slice(), available: document.getElementById('formAvailable').checked, stock: stock });
        // Update stockMap from per-size inputs if product has sizes
        if (selectedSizes.length > 0) {
          if (!stockMap[products[idx].id]) stockMap[products[idx].id] = {};
          selectedSizes.forEach(function(s) {
            var val = _editSizeStock[s] !== undefined ? _editSizeStock[s] : 0;
            stockMap[products[idx].id][stockField(s)] = val;
          });
          stockMap[products[idx].id].q = 0;
          products[idx].stock = getTotalStock(products[idx].id);
        }
      }
    } else {
      var maxId = products.length > 0 ? Math.max.apply(null, products.map(function(p) { return p.id; })) : 0;
      var newId = maxId + 1;
      products.push({ id: newId, name: name, category0: category0, category1: category1, category2: category2, price: price, description: description, images: images, sizes: selectedSizes.slice(), available: document.getElementById('formAvailable').checked, stock: stock });
      // Initialize stockMap for new product with sizes
      if (selectedSizes.length > 0) {
        stockMap[newId] = {};
        selectedSizes.forEach(function(s) {
          var val = _editSizeStock[s] !== undefined ? _editSizeStock[s] : 5;
          stockMap[newId][stockField(s)] = val;
        });
        stockMap[newId].q = 0;
        products[products.length - 1].stock = getTotalStock(newId);
      }
    }
    saveProducts();
    if (editingId || selectedSizes.length > 0) {
      var pid = editingId || (products.length > 0 ? products[products.length - 1].id : null);
      if (pid) syncStockToFirestore(pid);
    }
    resetForm();
    renderAdminList();
    renderFilters();
    submitBtn.disabled = false;
    submitBtn.textContent = origText;
  }

  if (toUpload.length === 0) {
    finish(keep.length > 0 ? keep : ['images/products/placeholder.svg']);
    return;
  }

  Promise.all(toUpload.map(function(src) { return uploadImage(src); })).then(function(urls) {
    finish(urls.concat(keep));
  }).catch(function() {
    alert('Failed to upload one or more images. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = origText;
  });
});

var fcb = document.getElementById('formCancelBtn');
if (fcb) fcb.addEventListener('click', resetForm);

var nsi = document.getElementById('newSizeInput');
if (nsi) nsi.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    var val = this.value.trim();
    if (val && selectedSizes.indexOf(val) === -1) { selectedSizes.push(val); this.value = ''; renderSizeTags(); renderSizePresets(); }
  }
});

var asb = document.getElementById('addSizeBtn');
if (asb) asb.addEventListener('click', function() {
  var input = document.getElementById('newSizeInput');
  var val = input.value.trim();
  if (val && selectedSizes.indexOf(val) === -1) { selectedSizes.push(val); input.value = ''; renderSizeTags(); renderSizePresets(); }
});

var fc0 = document.getElementById('formCategory0');
if (fc0) {
  fc0.addEventListener('change', function() {
    updateSubcategoryDropdown();
  });
}
var fc1 = document.getElementById('formCategory1');
if (fc1) {
  fc1.addEventListener('change', function() {
    updateBrandDropdown();
  });
}

function renderImagePreview() {
  const container = document.getElementById('formImagePreview');
  if (selectedImagesData.length === 0) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = selectedImagesData.map((src, i) =>
    `<div class="image-wrapper">
      <img src="${src}">
      <button type="button" class="remove-image" data-index="${i}">×</button>
    </div>`
  ).join('');
  container.querySelectorAll('.remove-image').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      selectedImagesData.splice(idx, 1);
      renderImagePreview();
    });
  });
}

var aib = document.getElementById('addImageBtn');
if (aib) aib.addEventListener('click', () => {
  document.getElementById('formImage').click();
});

function resizeImage(file, maxW, maxQ, cb) {
  const reader = new FileReader();
  reader.onload = function(ev) {
    const img = new Image();
    img.onload = function() {
      let w = img.width, h = img.height;
      if (w > maxW || h > maxW) {
        const ratio = Math.min(maxW / w, maxW / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      cb(canvas.toDataURL('image/jpeg', maxQ));
    };
    img.onerror = function() {
      var el = document.getElementById('groupImageSyncStatus');
      if (el) { el.textContent = 'Error: image failed to load'; el.style.color = '#dc3545'; }
    };
    img.src = ev.target.result;
  };
  reader.onerror = function() {
    var el = document.getElementById('groupImageSyncStatus');
    if (el) { el.textContent = 'Error: failed to read file'; el.style.color = '#dc3545'; }
  };
  reader.readAsDataURL(file);
}

var fi = document.getElementById('formImage');
if (fi) fi.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  resizeImage(file, 800, 0.8, function(dataUrl) {
    selectedImagesData.push(dataUrl);
    renderImagePreview();
  });
  e.target.value = '';
});

// Import/Export
var eb = document.getElementById('exportBtn');
if (eb) eb.addEventListener('click', () => {
  const data = JSON.stringify(products, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.json';
  a.click();
  URL.revokeObjectURL(url);
});

var ib = document.getElementById('importBtn');
if (ib) ib.addEventListener('click', () => {
  document.getElementById('importFileInput').click();
});

var ifi = document.getElementById('importFileInput');
if (ifi) ifi.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const data = JSON.parse(ev.target.result);
      if (!Array.isArray(data)) throw new Error('Invalid format');
      if (data.length > 0 && !data[0].name) throw new Error('Invalid format');
      data = data.map(function(p) {
        if (p.image && !p.images) {
          p.images = [p.image];
          delete p.image;
        }
        if (p.category && !p.category1) {
          p.category1 = p.category;
          delete p.category;
        }
        if (!p.category0) p.category0 = (categoriesConfig.groups[0] || {}).name || '';
        if (!p.category2) p.category2 = '';
        if (!p.sizes) p.sizes = [];
        return p;
      });
      if (confirm(`Replace all ${products.length} products with ${data.length} imported products?`)) {
        products = data;
        saveProducts();
        resetForm();
        renderAdminList();
        renderFilters();
        renderProducts();
        alert('Products imported successfully!');
      }
    } catch {
      alert('Invalid JSON file. Please export a valid products file first.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// GitHub Auto Sync
var GITHUB_OWNER = 'japangoodies';
var GITHUB_REPO = 'yokosoosaka';
var GITHUB_PATH = 'yokoso-website/data/products.json';
var GITHUB_CATEGORIES_PATH = 'yokoso-website/data/categories.json';
var GITHUB_BRANCH = 'main';

var ssb = document.getElementById('syncSettingsBtn');
if (ssb) ssb.addEventListener('click', function() {
  var el = document.getElementById('adminSyncSettings');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
  var gti = document.getElementById('githubTokenInput');
  if (gti) gti.value = localStorage.getItem('github_token') || '';
  var ast = document.getElementById('autoSyncToggle');
  if (ast) ast.checked = localStorage.getItem('autoSyncEnabled') === 'true';
});

var gti = document.getElementById('githubTokenInput');
if (gti) gti.addEventListener('input', function() {
  localStorage.setItem('github_token', this.value);
});

var ast = document.getElementById('autoSyncToggle');
if (ast) ast.addEventListener('change', function() {
  localStorage.setItem('autoSyncEnabled', this.checked ? 'true' : 'false');
});

function syncToGitHub() {
  var token = localStorage.getItem('github_token');
  if (!token) return;
  if (syncToGitHub._busy) { syncToGitHub._queued = true; return; }
  syncToGitHub._busy = true;
  var statusEl = document.getElementById('syncStatus');
  statusEl.textContent = 'Syncing...';
  statusEl.style.color = '#666';
  var content = JSON.stringify(products, null, 2);
  var encoded = btoa(unescape(encodeURIComponent(content)));
  doGitHubSync(GITHUB_PATH, encoded, 'Auto-sync products from admin panel', statusEl, 0)
    .then(function() { syncToGitHub._busy = false; if (syncToGitHub._queued) { syncToGitHub._queued = false; syncToGitHub(); } })
    .catch(function(err) {
      syncToGitHub._busy = false;
      if (statusEl) { statusEl.textContent = 'Sync failed: ' + err.message; statusEl.style.color = '#dc3545'; }
      if (syncToGitHub._queued) { syncToGitHub._queued = false; syncToGitHub(); }
    });
}

function doGitHubSync(filePath, encoded, message, statusEl, attempt) {
  var token = localStorage.getItem('github_token');
  if (!token) { return Promise.reject(new Error('No token')); }
  statusEl = statusEl || document.getElementById('syncStatus');
  return fetch('https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/contents/' + filePath, {
    headers: { 'Authorization': 'token ' + token }
  })
  .then(function(r) {
    if (r.status === 404) return null;
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(function(data) {
    var sha = data ? data.sha : null;
    return fetch('https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/contents/' + filePath, {
      method: 'PUT',
      headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message, content: encoded, sha: sha, branch: GITHUB_BRANCH })
    });
  })
  .then(function(r) {
    if (r.status === 409 && attempt < 3) {
      return doGitHubSync(filePath, encoded, message, statusEl, attempt + 1);
    }
    if (!r.ok) throw new Error('HTTP ' + r.status);
    if (filePath === GITHUB_PATH) localStorage.setItem('yokoso_pending_sync', 'false');
    if (statusEl) { statusEl.textContent = 'Synced ✓ (CDN ~1-2 min)'; statusEl.style.color = '#28a745'; }
  });
}

function syncCategoriesToGitHub() {
  var token = localStorage.getItem('github_token');
  if (!token) return;
  if (syncToGitHub._busy) { syncToGitHub._queued = true; return; }
  syncToGitHub._busy = true;
  var statusEl = document.getElementById('syncStatus');
  var groupStatusEl = document.getElementById('groupImageSyncStatus');
  if (statusEl) { statusEl.textContent = 'Syncing categories...'; statusEl.style.color = '#666'; }
  if (groupStatusEl) { groupStatusEl.textContent = 'Syncing categories to GitHub...'; groupStatusEl.style.color = '#888'; }
  var content = JSON.stringify(categoriesConfig, null, 2);
  var encoded = btoa(unescape(encodeURIComponent(content)));
  doGitHubSync(GITHUB_CATEGORIES_PATH, encoded, 'Auto-sync categories from admin panel', null, 0)
    .then(function() {
      syncToGitHub._busy = false;
      if (syncToGitHub._queued) { syncToGitHub._queued = false; syncToGitHub(); }
      if (statusEl) { statusEl.textContent = 'Categories synced to GitHub ✓'; statusEl.style.color = '#28a745'; }
      if (groupStatusEl) { groupStatusEl.textContent = 'Synced ✓'; groupStatusEl.style.color = '#28a745'; setTimeout(function() { groupStatusEl.textContent = ''; }, 4000); }
    })
    .catch(function(err) {
      syncToGitHub._busy = false;
      console.error('Categories sync failed:', err.message);
      if (statusEl) { statusEl.textContent = 'Sync failed: ' + err.message; statusEl.style.color = '#dc3545'; }
      if (groupStatusEl) { groupStatusEl.innerHTML = 'Saved locally. GitHub sync failed (' + err.message + '). Check token in <a href="#" onclick="document.getElementById(\'syncSettingsBtn\').click();return false" style="color:#007bff">sync settings</a>.'; groupStatusEl.style.color = '#e67e22'; }
      if (syncToGitHub._queued) { syncToGitHub._queued = false; syncToGitHub(); }
    });
}

// Navigation between public and admin view
const ADMIN_PASSWORD = 'amped2016';

function showAdminPanel() {
  if (prompt('Enter admin password:') !== ADMIN_PASSWORD) return;
  // Migrate localStorage data if not yet synced
  if (localStorage.getItem('yokoso_pending_sync') !== 'true') {
    var saved = localStorage.getItem('yokoso_products');
    if (saved) {
      try {
        var local = JSON.parse(saved);
        if (local.length > 0 && JSON.stringify(local) !== JSON.stringify(products)) {
          products = local;
          migrateProducts();
          saveProducts();
        }
      } catch(e) {}
    }
  }
  document.getElementById('maintenanceOverlay').classList.add('active');
  document.getElementById('maintenancePublic').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  var proxySection = document.getElementById('adminStockProxy');
  if (proxySection) proxySection.style.display = 'block';
  var syncSection = document.getElementById('adminSyncSettings');
  if (syncSection) syncSection.style.display = 'block';
  renderAdminFilterDropdowns();
  renderAdminList();
}

var eab = document.getElementById('enterAdminBtn');
if (eab) eab.addEventListener('click', showAdminPanel);

var fal = document.getElementById('footerAdminLink');
if (fal) fal.addEventListener('click', e => {
  e.preventDefault();
  showAdminPanel();
});

function renderAdminFilterDropdowns() {
  var groupSelect = document.getElementById('adminFilterGroup');
  var typeSelect = document.getElementById('adminFilterType');
  var brandSelect = document.getElementById('adminFilterBrand');
  if (!typeSelect || !brandSelect) return;
  if (groupSelect) {
    var groups = getGroups();
    groupSelect.innerHTML = '<option value="all">All Groups</option>' + groups.map(function(g) {
      var sel = adminFilterGroup === g.name ? ' selected' : '';
      return '<option value="' + g.name + '"' + sel + '>' + g.name + '</option>';
    }).join('');
  }
  var types = getTypes();
  var brands = getBrands();
  typeSelect.innerHTML = '<option value="all">All Subcategories</option>' + types.map(function(t) {
    return '<option value="' + t + '"' + (adminFilterType === t ? ' selected' : '') + '>' + t + '</option>';
  }).join('');
  brandSelect.innerHTML = '<option value="all">All Brands</option>' + brands.map(function(b) {
    return '<option value="' + b + '"' + (adminFilterBrand === b ? ' selected' : '') + '>' + b + '</option>';
  }).join('');
}

var admSearch = document.getElementById('adminSearch');
if (admSearch) admSearch.addEventListener('input', function() {
  adminSearchVal = this.value;
  renderAdminList();
});

var afg = document.getElementById('adminFilterGroup');
if (afg) {
  afg.addEventListener('change', function() {
    adminFilterGroup = this.value;
    renderAdminList();
  });
}

var aft = document.getElementById('adminFilterType');
if (aft) aft.addEventListener('change', function() {
  adminFilterType = this.value;
  renderAdminList();
});

var afb = document.getElementById('adminFilterBrand');
if (afb) afb.addEventListener('change', function() {
  adminFilterBrand = this.value;
  renderAdminList();
});

var mcb = document.getElementById('manageCategoriesBtn');
if (mcb) mcb.addEventListener('click', function() {
  var el = document.getElementById('adminCategories');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
  renderCategoryManagement();
});

var sgp = document.getElementById('subcategoryGroupPicker');
if (sgp) sgp.addEventListener('change', function() {
  selectedSubcategoryGroup = this.value;
  renderSubcategoryTagList();
});

var backBtn = document.getElementById('backToPublicBtn');
if (backBtn) backBtn.addEventListener('click', function() {
  var ac = document.getElementById('adminCategories');
  if (ac) ac.style.display = 'none';
  var ap = document.getElementById('adminPanel');
  if (ap) ap.style.display = 'none';
  adminSearchVal = '';
  adminFilterGroup = 'all';
  adminFilterType = 'all';
  adminFilterBrand = 'all';
  renderAdminList();
  renderFilters();
  renderProducts();
});

var selectedSubcategoryGroup = '';

// ---- CATEGORY MANAGEMENT ----

function makeEditableTag(el, list, key) {
  var span = el.querySelector('.admin-tag-label') || el;
  var orig = span.textContent;
  span.contentEditable = true;
  span.focus();
  var range = document.createRange();
  range.selectNodeContents(span);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  function save() {
    span.contentEditable = false;
    var val = span.textContent.trim();
    if (val && val !== orig) {
      var idx = categoriesConfig[key].indexOf(orig);
      if (idx !== -1) {
        categoriesConfig[key][idx] = val;
        saveCategoriesConfig();
        renderCategoryDropdowns();
        renderAdminFilterDropdowns();
      }
    } else {
      span.textContent = orig;
    }
  }
  span.addEventListener('blur', save);
  span.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); span.blur(); }
    if (e.key === 'Escape') { span.textContent = orig; span.blur(); }
  });
}

function renderSubcategoryTagList() {
  var subList = document.getElementById('subcategoryTagList');
  var subPicker = document.getElementById('subcategoryGroupPicker');
  if (!subList || !subPicker) return;
  var selectedGroup = subPicker.value;
  if (!selectedGroup) return;
  var subs = getSubcategories(selectedGroup);
  subList.innerHTML = subs.map(function(s) {
    return '<span class="admin-tag"><span class="admin-tag-label" title="Double-click to rename">' + s + '</span><span class="admin-tag-remove" data-subcategory="' + s + '" data-group="' + selectedGroup + '">×</span></span>';
  }).join('');
  subList.querySelectorAll('.admin-tag-remove').forEach(function(el) {
    el.addEventListener('click', function() {
      var s = this.dataset.subcategory;
      var g = this.dataset.group;
      var arr = categoriesConfig.subcategoryMap[g];
      if (arr) {
        categoriesConfig.subcategoryMap[g] = arr.filter(function(x) { return x !== s; });
        saveCategoriesConfig();
        renderCategoryManagement();
        renderCategoryDropdowns();
        renderAdminFilterDropdowns();
        renderFilters();
      }
    });
  });
  subList.querySelectorAll('.admin-tag-label').forEach(function(el) {
    el.addEventListener('dblclick', function() { makeEditableSubcategoryTag(el.parentNode); });
  });
}

function renderCategoryManagement() {
  var groupList = document.getElementById('groupTagList');
  var brandList = document.getElementById('brandTagList');
  var sizeList = document.getElementById('sizeTagList');
  if (!groupList || !brandList) return;

  // Groups
  groupList.innerHTML = (categoriesConfig.groups || []).map(function(g) {
    return '<span class="admin-tag"><span class="admin-tag-label" title="Double-click to rename">' + g.name + '</span><span class="admin-tag-remove" data-group="' + g.name + '">×</span></span>';
  }).join('');

  // Subcategories picker - only populate if empty or groups changed
  var subPicker = document.getElementById('subcategoryGroupPicker');
  if (subPicker) {
    var groups = getGroups();
    var needsRepopulate = subPicker.options.length !== groups.length;
    if (!needsRepopulate) {
      for (var i = 0; i < groups.length; i++) {
        if (subPicker.options[i].value !== groups[i].name) { needsRepopulate = true; break; }
      }
    }
    if (needsRepopulate) {
      subPicker.innerHTML = groups.map(function(g) {
        return '<option value="' + g.name + '">' + g.name + '</option>';
  }).join('');

  grid.querySelectorAll('.product-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (e.target.closest('.btn-add-cart')) return;
      var id = parseInt(this.dataset.id);
      if (!isNaN(id)) openProduct(id);
    });
  });
  grid.querySelectorAll('.btn-add-cart').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var id = parseInt(this.dataset.id);
      if (!isNaN(id)) addToCart(id);
    });
  });
}
    if (selectedSubcategoryGroup && groups.some(function(g) { return g.name === selectedSubcategoryGroup; })) {
      subPicker.value = selectedSubcategoryGroup;
    } else {
      selectedSubcategoryGroup = groups.length ? groups[0].name : '';
      if (selectedSubcategoryGroup) subPicker.value = selectedSubcategoryGroup;
    }
    renderSubcategoryTagList();
  }

  brandList.innerHTML = (categoriesConfig.brands || []).map(function(b) {
    return '<span class="admin-tag"><span class="admin-tag-label" title="Double-click to rename">' + b + '</span><span class="admin-tag-remove" data-brand="' + b + '">×</span></span>';
  }).join('');
  if (sizeList) {
    sizeList.innerHTML = (categoriesConfig.sizes || []).map(function(s) {
      return '<span class="admin-tag"><span class="admin-tag-label" title="Double-click to rename">' + s + '</span><span class="admin-tag-remove" data-size-cat="' + s + '">×</span></span>';
    }).join('');
  }

  // Group remove handlers
  groupList.querySelectorAll('.admin-tag-remove').forEach(function(el) {
    el.addEventListener('click', function() {
      var g = this.dataset.group;
      categoriesConfig.groups = categoriesConfig.groups.filter(function(x) { return x.name !== g; });
      delete categoriesConfig.subcategoryMap[g];
      saveCategoriesConfig();
      renderCategoryManagement();
      renderCategoryDropdowns();
      renderAdminFilterDropdowns();
      renderFilters();
    });
  });

  brandList.querySelectorAll('.admin-tag-remove').forEach(function(el) {
    el.addEventListener('click', function() {
      var b = this.dataset.brand;
      categoriesConfig.brands = categoriesConfig.brands.filter(function(x) { return x !== b; });
      saveCategoriesConfig();
      renderCategoryManagement();
      renderCategoryDropdowns();
      renderAdminFilterDropdowns();
    });
  });

  if (sizeList) {
    sizeList.querySelectorAll('.admin-tag-remove').forEach(function(el) {
      el.addEventListener('click', function() {
        var s = this.dataset.sizeCat;
        categoriesConfig.sizes = categoriesConfig.sizes.filter(function(x) { return x !== s; });
        saveCategoriesConfig();
        renderCategoryManagement();
        renderSizePresets();
      });
    });
    sizeList.querySelectorAll('.admin-tag-label').forEach(function(el) {
      el.addEventListener('dblclick', function() { makeEditableTag(el.parentNode, categoriesConfig.sizes, 'sizes'); });
    });
  }

  // Rename handlers
  groupList.querySelectorAll('.admin-tag-label').forEach(function(el) {
    el.addEventListener('dblclick', function() { makeEditableGroupTag(el.parentNode); });
  });
  brandList.querySelectorAll('.admin-tag-label').forEach(function(el) {
    el.addEventListener('dblclick', function() { makeEditableTag(el.parentNode, categoriesConfig.brands, 'brands'); });
  });

  // Group image preview
  renderGroupImagePreview();
  renderBrandMapUI();
  renderBrandLogoUI();
}

function renderBrandMapUI() {
  var picker = document.getElementById('brandMapSubcategoryPicker');
  if (!picker) return;
  var allSubs = [];
  (categoriesConfig.groups || []).forEach(function(g) {
    (categoriesConfig.subcategoryMap[g.name] || []).forEach(function(s) {
      if (allSubs.indexOf(s) === -1) allSubs.push(s);
    });
  });
  var currentSub = picker.value && allSubs.indexOf(picker.value) !== -1 ? picker.value : (allSubs[0] || '');
  picker.innerHTML = allSubs.map(function(s) {
    return '<option value="' + s + '"' + (s === currentSub ? ' selected' : '') + '>' + s + '</option>';
  }).join('');
  renderBrandMapCheckboxes(currentSub);
}

function renderBrandMapCheckboxes(sub) {
  var container = document.getElementById('brandMapCheckboxes');
  if (!container) return;
  var assigned = categoriesConfig.subcategoryBrands[sub] || [];
  var allBrands = categoriesConfig.brands || [];
  container.innerHTML = allBrands.map(function(b) {
    var checked = assigned.indexOf(b) !== -1 ? ' checked' : '';
    return '<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:0.8rem;color:#ccc;padding:4px 8px;background:rgba(255,255,255,0.05);border-radius:4px"><input type="checkbox" class="brand-map-cb" data-subcategory="' + sub + '" data-brand="' + b + '"' + checked + '>' + b + '</label>';
  }).join('');
}

function makeEditableGroupTag(el) {
  var span = el.querySelector('.admin-tag-label') || el;
  var orig = span.textContent;
  span.contentEditable = true;
  span.focus();
  var range = document.createRange();
  range.selectNodeContents(span);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  function save() {
    span.contentEditable = false;
    var val = span.textContent.trim();
    if (val && val !== orig) {
      // Update subcategoryMap key
      var subs = categoriesConfig.subcategoryMap[orig] || [];
      delete categoriesConfig.subcategoryMap[orig];
      categoriesConfig.subcategoryMap[val] = subs;
      // Update group name
      var grp = categoriesConfig.groups.find(function(g) { return g.name === orig; });
      if (grp) grp.name = val;
      // Update all products with this group
      products.forEach(function(p) {
        if (p.category0 === orig) p.category0 = val;
      });
      saveCategoriesConfig();
      saveProducts();
      renderCategoryManagement();
      renderCategoryDropdowns();
      renderAdminFilterDropdowns();
      renderFilters();
      renderProducts();
    } else {
      span.textContent = orig;
    }
  }
  span.addEventListener('blur', save);
  span.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); span.blur(); }
    if (e.key === 'Escape') { span.textContent = orig; span.blur(); }
  });
}

function makeEditableSubcategoryTag(el) {
  var span = el.querySelector('.admin-tag-label') || el;
  var orig = span.textContent;
  span.contentEditable = true;
  span.focus();
  var range = document.createRange();
  range.selectNodeContents(span);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  var subPicker = document.getElementById('subcategoryGroupPicker');
  var group = subPicker ? subPicker.value : '';
  function save() {
    span.contentEditable = false;
    var val = span.textContent.trim();
    if (val && val !== orig && group) {
      var arr = categoriesConfig.subcategoryMap[group];
      if (arr) {
        var idx = arr.indexOf(orig);
        if (idx !== -1) arr[idx] = val;
      }
      products.forEach(function(p) {
        if (p.category0 === group && p.category1 === orig) p.category1 = val;
      });
      saveCategoriesConfig();
      saveProducts();
      renderCategoryManagement();
      renderCategoryDropdowns();
      renderAdminFilterDropdowns();
      renderFilters();
      renderProducts();
    } else {
      span.textContent = orig;
    }
  }
  span.addEventListener('blur', save);
  span.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') { e.preventDefault(); span.blur(); }
    if (e.key === 'Escape') { span.textContent = orig; span.blur(); }
  });
}

function renderGroupImagePreview() {
  var container = document.getElementById('groupImagePreview');
  var targetSelect = document.getElementById('groupImageTarget');
  if (!container || !targetSelect) return;
  var groups = getGroups();
  targetSelect.innerHTML = '<option value="">Set image for...</option>' + groups.map(function(g) {
    return '<option value="' + g.name + '">' + g.name + '</option>';
  }).join('');
  container.innerHTML = groups.map(function(g) {
    var imgHtml = g.image ? '<img src="' + g.image + '" style="width:100px;height:100px;object-fit:cover;border-radius:8px;cursor:pointer" title="Click to remove ' + g.name + ' image" data-group-image="' + g.name + '">' : '';
    return imgHtml ? '<div style="text-align:center"><div style="font-size:0.7rem;color:#aaa;margin-bottom:2px">' + g.name + '</div>' + imgHtml + '</div>' : '';
  }).join('');
  container.querySelectorAll('[data-group-image]').forEach(function(img) {
    img.addEventListener('click', function() {
      var gn = this.dataset.groupImage;
      if (confirm('Remove image for ' + gn + '?')) {
        var grp = categoriesConfig.groups.find(function(g) { return g.name === gn; });
        if (grp) { grp.image = ''; saveCategoriesConfig(); renderGroupImagePreview(); renderCarousel(); }
      }
    });
  });
}

var groupTargetSelect = document.getElementById('groupImageTarget');

var ugiBtn = document.getElementById('uploadGroupImageBtn');
if (ugiBtn) ugiBtn.addEventListener('click', function() {
  if (!groupTargetSelect || !groupTargetSelect.value) { alert('Select a group first.'); return; }
  document.getElementById('groupImageInput').click();
});

var giInput = document.getElementById('groupImageInput');
if (giInput) giInput.addEventListener('change', function(e) {
  var file = e.target.files[0];
  if (!file || !groupTargetSelect || !groupTargetSelect.value) return;
  var targetGroup = groupTargetSelect.value;
  resizeImage(file, 400, 0.7, function(dataUrl) {
    var grp = categoriesConfig.groups.find(function(g) { return g.name === targetGroup; });
    if (grp) grp.image = dataUrl;
    saveCategoriesConfig();
    renderGroupImagePreview();
    renderCarousel();
  });
  e.target.value = '';
});

var giUrl = document.getElementById('groupImageUrl');
if (giUrl) giUrl.addEventListener('change', function() {
  if (!groupTargetSelect || !groupTargetSelect.value) return;
  var url = this.value.trim();
  if (url) {
    var targetGroup = groupTargetSelect.value;
    var grp = categoriesConfig.groups.find(function(g) { return g.name === targetGroup; });
    if (grp) grp.image = url;
    saveCategoriesConfig();
    renderGroupImagePreview();
    renderCarousel();
  }
});

// ---- BRAND LOGO UI ----
function renderBrandLogoUI() {
  var picker = document.getElementById('brandLogoPicker');
  if (!picker) return;
  var brands = categoriesConfig.brands || [];
  var current = picker.value && brands.indexOf(picker.value) !== -1 ? picker.value : (brands[0] || '');
  picker.innerHTML = '<option value="">Select brand...</option>' + brands.map(function(b) {
    return '<option value="' + b + '"' + (b === current ? ' selected' : '') + '>' + b + '</option>';
  }).join('');
  renderBrandLogoPreview();
}
function renderBrandLogoPreview() {
  var container = document.getElementById('brandLogoPreview');
  if (!container) return;
  var brands = categoriesConfig.brands || [];
  container.innerHTML = brands.filter(function(b) { return categoriesConfig.brandLogos && categoriesConfig.brandLogos[b]; }).map(function(b) {
    var logo = categoriesConfig.brandLogos[b];
    return '<div style="text-align:center"><img src="' + logo + '" style="width:40px;height:40px;object-fit:contain;border-radius:4px;cursor:pointer" title="Click to remove ' + b + ' logo" data-brand-logo="' + b + '"><div style="font-size:0.65rem;color:#aaa;margin-top:2px">' + b + '</div></div>';
  }).join('');
  container.querySelectorAll('[data-brand-logo]').forEach(function(img) {
    img.addEventListener('click', function() {
      var bn = this.dataset.brandLogo;
      if (confirm('Remove logo for ' + bn + '?')) {
        if (categoriesConfig.brandLogos) delete categoriesConfig.brandLogos[bn];
        saveCategoriesConfig();
        renderBrandLogoPreview();
      }
    });
  });
}

var uploadBrandLogoBtn = document.getElementById('uploadBrandLogoBtn');
if (uploadBrandLogoBtn) uploadBrandLogoBtn.addEventListener('click', function() {
  var picker = document.getElementById('brandLogoPicker');
  if (!picker || !picker.value) { alert('Select a brand first.'); return; }
  document.getElementById('brandLogoInput').click();
});

var bli = document.getElementById('brandLogoInput');
if (bli) bli.addEventListener('change', function(e) {
  var file = e.target.files[0];
  var picker = document.getElementById('brandLogoPicker');
  if (!file || !picker || !picker.value) return;
  var targetBrand = picker.value;
  resizeImage(file, 200, 0.7, function(dataUrl) {
    if (!categoriesConfig.brandLogos) categoriesConfig.brandLogos = {};
    categoriesConfig.brandLogos[targetBrand] = dataUrl;
    saveCategoriesConfig();
    renderBrandLogoPreview();
    renderFilters();
  });
  e.target.value = '';
});

var blu = document.getElementById('brandLogoUrl');
if (blu) blu.addEventListener('change', function() {
  var picker = document.getElementById('brandLogoPicker');
  if (!picker || !picker.value) return;
  var url = this.value.trim();
  if (url) {
    var targetBrand = picker.value;
    if (!categoriesConfig.brandLogos) categoriesConfig.brandLogos = {};
    categoriesConfig.brandLogos[targetBrand] = url;
    saveCategoriesConfig();
    renderBrandLogoPreview();
    renderFilters();
  }
});

// ---- CATEGORY MANAGEMENT ADD HANDLERS ----
var agb = document.getElementById('addGroupBtn');
if (agb) agb.addEventListener('click', function() {
  var input = document.getElementById('newGroupInput');
  var val = input.value.trim();
  if (!val) return;
  if ((categoriesConfig.groups || []).some(function(g) { return g.name === val; })) return;
  categoriesConfig.groups.push({ name: val, image: '' });
  categoriesConfig.subcategoryMap[val] = [];
  input.value = '';
  saveCategoriesConfig();
  renderCategoryManagement();
  renderCategoryDropdowns();
  renderAdminFilterDropdowns();
  renderFilters();
});
var ngi = document.getElementById('newGroupInput');
if (ngi) ngi.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); var btn = document.getElementById('addGroupBtn'); if (btn) btn.click(); } });

var asb = document.getElementById('addSubcategoryBtn');
if (asb) asb.addEventListener('click', function() {
  var input = document.getElementById('newSubcategoryInput');
  var val = input.value.trim();
  if (!val) return;
  var picker = document.getElementById('subcategoryGroupPicker');
  var group = picker ? picker.value : '';
  if (!group) return;
  if ((categoriesConfig.subcategoryMap[group] || []).indexOf(val) !== -1) return;
  if (!categoriesConfig.subcategoryMap[group]) categoriesConfig.subcategoryMap[group] = [];
  categoriesConfig.subcategoryMap[group].push(val);
  input.value = '';
  saveCategoriesConfig();
  renderCategoryManagement();
  renderCategoryDropdowns();
  renderAdminFilterDropdowns();
  renderFilters();
});
var nsi2 = document.getElementById('newSubcategoryInput');
if (nsi2) nsi2.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); var btn = document.getElementById('addSubcategoryBtn'); if (btn) btn.click(); } });

var abb = document.getElementById('addBrandBtn');
if (abb) abb.addEventListener('click', function() {
  var input = document.getElementById('newBrandInput');
  var val = input.value.trim();
  if (!val) return;
  if ((categoriesConfig.brands || []).indexOf(val) !== -1) return;
  categoriesConfig.brands.push(val);
  input.value = '';
  saveCategoriesConfig();
  renderCategoryManagement();
  renderCategoryDropdowns();
  renderAdminFilterDropdowns();
});
var nbi = document.getElementById('newBrandInput');
if (nbi) nbi.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); var btn = document.getElementById('addBrandBtn'); if (btn) btn.click(); } });

var ascb = document.getElementById('addSizeCatBtn');
if (ascb) ascb.addEventListener('click', function() {
  var input = document.getElementById('newSizeCatInput');
  var val = input.value.trim();
  if (!val) return;
  if ((categoriesConfig.sizes || []).indexOf(val) !== -1) return;
  categoriesConfig.sizes.push(val);
  input.value = '';
  saveCategoriesConfig();
  renderCategoryManagement();
});
var nsci = document.getElementById('newSizeCatInput');
if (nsci) nsci.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); var btn = document.getElementById('addSizeCatBtn'); if (btn) btn.click(); } });

// ---- BRAND MAP UI ----
var bmsp = document.getElementById('brandMapSubcategoryPicker');
if (bmsp) bmsp.addEventListener('change', function() {
  renderBrandMapCheckboxes(this.value);
});

var bmc = document.getElementById('brandMapCheckboxes');
if (bmc) bmc.addEventListener('change', function(e) {
  var cb = e.target.closest('.brand-map-cb');
  if (!cb) return;
  var sub = cb.dataset.subcategory;
  var brand = cb.dataset.brand;
  if (!categoriesConfig.subcategoryBrands[sub]) categoriesConfig.subcategoryBrands[sub] = [];
  var arr = categoriesConfig.subcategoryBrands[sub];
  if (cb.checked) {
    if (arr.indexOf(brand) === -1) arr.push(brand);
  } else {
    categoriesConfig.subcategoryBrands[sub] = arr.filter(function(b) { return b !== brand; });
  }
  saveCategoriesConfig();
});

// ---- HERO CAROUSEL ----
(function() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length < 2) return;
  let idx = 0;
  setInterval(() => {
    slides[idx].classList.remove('active');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active');
  }, 5000);
})();

// ---- INIT ----
function parseURLParams() {
  var params = new URLSearchParams(window.location.search);
  var group = params.get('group');
  if (group) {
    currentGroup = group;
    currentCategory = 'all';
    currentBrand = 'all';
    document.body.classList.add('catalog-mode');
    var ch = document.getElementById('catalogHeader');
    if (ch) { ch.style.display = 'block'; }
    var ct = document.getElementById('catalogTitle');
    if (ct) {
      ct.textContent = group;
      ct.style.cursor = 'pointer';
      ct.onclick = function() {
        currentCategory = 'all';
        currentBrand = 'all';
        renderSubcategoryFilter();
        renderBrandFilter();
        renderProducts();
      };
    }
    var cc = document.getElementById('categoryCarousel');
    if (cc) { cc.style.display = 'none'; }
  }
}

loadProducts(function() {
  if (typeof MAINTENANCE_MODE !== 'undefined' && MAINTENANCE_MODE) {
    document.getElementById('maintenanceOverlay').classList.add('active');
    return;
  }
  parseURLParams();
  loadStockFromFirestore(function() {
    renderFilters();
    renderProducts();
    subscribeStockUpdates();
    updateCartBadge();
  });
});
