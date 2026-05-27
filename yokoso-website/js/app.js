const DEFAULT_PRODUCTS = [
  { id: 1, name: "Nike Air Force 1 Low (Japan Exclusive)", category1: "Shoes", category2: "Nike", sizes: ["7", "8", "9", "10", "11", "12"], price: "₱5,200", description: "Authentic Nike Air Force 1 Low from Japan. Limited Japan-exclusive colorway. Leather upper with Air-Sole cushioning.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 2, name: "Nike Dunk Low Retro", category1: "Shoes", category2: "Nike", sizes: ["7", "8", "9", "10", "11"], price: "₱4,800", description: "Classic Nike Dunk Low in premium leather. Japan release. Available in multiple colors.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 3, name: "Nike Air Max 90 (Japan Pack)", category1: "Shoes", category2: "Nike", sizes: ["7", "8", "9", "10", "11", "12"], price: "₱5,500", description: "Nike Air Max 90 from the Japan-exclusive pack. Visible Air cushioning. Iconic silhouette.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 4, name: "GU Fluffy Knit Sweater", category1: "Clothing", category2: "GU", sizes: ["S", "M", "L", "XL"], price: "₱850", description: "Soft fluffy knit sweater from GU. Available in multiple colors. Perfect for cold season. Oversized relaxed fit.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 5, name: "Uniqlo Airism Oversized T-Shirt", category1: "Clothing", category2: "Uniqlo", sizes: ["S", "M", "L", "XL"], price: "₱650", description: "Authentic Uniqlo Airism oversized t-shirt. Ultra-lightweight and breathable. Moisture-wicking fabric.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 6, name: "GU Wide Leg Pants", category1: "Clothing", category2: "GU", sizes: ["S", "M", "L", "XL"], price: "₱950", description: "GU wide-leg pants. Comfortable and stylish. Premium cotton blend. Available in black, beige, and navy.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 7, name: "Uniqlo Light Down Jacket", category1: "Clothing", category2: "Uniqlo", sizes: ["S", "M", "L", "XL"], price: "₱2,200", description: "Lightweight Uniqlo down jacket. Packable design. 750 fill power. Warm without being bulky. Water-repellent.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 8, name: "Japanese Biore UV Aqua Rich SPF50+", category1: "Cosmetics", category2: "Biore", sizes: [], price: "₱550", description: "Biore UV Aqua Rich watery essence sunscreen. SPF50+ PA++++. Lightweight, non-sticky, refreshing finish. 80g.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 9, name: "Japanese Sheet Mask Variety Pack (10pcs)", category1: "Cosmetics", category2: "Generic", sizes: [], price: "₱380", description: "Assorted Japanese facial sheet masks. Infused with collagen, hyaluronic acid, and vitamin C. 10-piece pack.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 10, name: "Heroine Make Waterproof Eyeliner", category1: "Cosmetics", category2: "Heroine Make", sizes: [], price: "₱480", description: "Japanese Heroine Make waterproof liquid eyeliner. Ultra-fine 0.1mm tip. Smudge-proof and long-lasting. Black.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 11, name: "Onitsuka Tiger Mexico 66", category1: "Shoes", category2: "Onitsuka Tiger", sizes: ["6", "7", "8", "9", "10"], price: "₱3,800", description: "Classic Onitsuka Tiger Mexico 66 sneakers. Japan-exclusive colorway. Iconic design. Comfortable sole.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 12, name: "GU Knit Cardigan", category1: "Clothing", category2: "GU", sizes: ["S", "M", "L", "XL"], price: "₱1,100", description: "GU open-front knit cardigan. Soft acrylic blend. Oversized fit. Perfect layering piece for any outfit.", available: true, images: ["images/products/placeholder.svg"] },
  { id: 13, name: "test", category1: "test", category2: "test", sizes: [], price: "11", description: "test", available: true, images: ["images/products/placeholder.svg"] }
];

// Firebase
var fbDB = null;
var fbStorage = null;
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
    if (firebase.storage) fbStorage = firebase.storage();
  }
} catch (e) {}
const FB_COLLECTION = 'yokoso';
const FB_DOC = 'products';

let categoriesConfig = { types: ["Clothing", "Shoes", "Cosmetics"], brands: ["Nike", "Uniqlo", "GU", "Biore", "Onitsuka Tiger", "Heroine Make", "Generic"], sizes: ["S", "M", "L", "XL", "6", "7", "8", "9", "10", "11", "12", "One Size", "Free Size"] };
let currentBrand = 'all';
var adminSearchVal = '';
var adminFilterType = 'all';
var adminFilterBrand = 'all';

let products = [];
let editingId = null;
let currentCategory = 'all';
let currentSearch = '';
let selectedImagesData = [];
let selectedSizes = [];
let currentModalImages = [];
let currentImageIndex = 0;
var scrollPos = 0, bodyLocked = false;

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
  if (document.getElementById('fullscreenViewer').classList.contains('active')) {
    e.preventDefault();
  }
}, { passive: false });

// Back button closes overlay via hashchange
window.addEventListener('hashchange', function() {
  var fs = document.getElementById('fullscreenViewer');
  var modal = document.getElementById('productModal');
  if ((!fs || !fs.classList.contains('active')) && (!modal || !modal.classList.contains('active'))) return;
  var hash = location.hash;
  if (fs && fs.classList.contains('active') && hash !== '#fullscreen') {
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
    if (!p.category2) {
      p.category2 = "";
      migrated = true;
    }
    if (!p.sizes) {
      p.sizes = [];
      migrated = true;
    }
  });
  return migrated;
}

function loadProducts(callback) {
  const saved = localStorage.getItem('yokoso_products');
  if (saved) {
    try {
      products = JSON.parse(saved);
      migrateProducts();
    } catch {
      products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    }
  } else {
    products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
  }

  var rendered = false;
  function done() {
    if (!rendered) { rendered = true; if (callback) callback(); }
  }

  if (fbDB) {
    fbDB.collection(FB_COLLECTION).doc(FB_DOC).get()
      .then(doc => {
        if (doc.exists && doc.data().items && doc.data().items.length > 0) {
          products = doc.data().items;
          migrateProducts();
          localStorage.setItem('yokoso_products', JSON.stringify(products));
        } else {
          fbDB.collection(FB_COLLECTION).doc(FB_DOC).set({ items: products }).catch(() => {});
        }
        done();
      })
      .catch(function() { done(); });
    setTimeout(done, 3000);
  } else {
    done();
  }

  var savedConfig = localStorage.getItem('yokoso_categories');
  if (savedConfig) {
    try {
      var parsed = JSON.parse(savedConfig);
      if (parsed.types && parsed.brands) { categoriesConfig = parsed; if (!categoriesConfig.sizes) categoriesConfig.sizes = []; }
    } catch (e) {}
  }

  if (fbDB) {
    fbDB.collection(FB_COLLECTION).doc('categories').get()
      .then(function(doc) {
        if (doc.exists && doc.data().types && doc.data().brands) {
          categoriesConfig = doc.data();
          if (!categoriesConfig.sizes) categoriesConfig.sizes = [];
          localStorage.setItem('yokoso_categories', JSON.stringify(categoriesConfig));
        }
        renderCategoryDropdowns();
        renderCategoryManagement();
      })
      .catch(function() { renderCategoryDropdowns(); renderCategoryManagement(); });
  } else {
    renderCategoryDropdowns();
    renderCategoryManagement();
  }
}

function saveCategoriesConfig() {
  localStorage.setItem('yokoso_categories', JSON.stringify(categoriesConfig));
  if (fbDB) {
    fbDB.collection(FB_COLLECTION).doc('categories').set(categoriesConfig).catch(function() {});
  }
}

function saveProducts() {
  localStorage.setItem('yokoso_products', JSON.stringify(products));
  if (fbDB) {
    fbDB.collection(FB_COLLECTION).doc(FB_DOC).set({ items: products }).catch(() => {});
  }
}

function dataURLToBlob(dataUrl) {
  var parts = dataUrl.split(',');
  var mime = parts[0].match(/:(.*?);/)[1];
  var bytes = atob(parts[1]);
  var ab = new ArrayBuffer(bytes.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < bytes.length; i++) ia[i] = bytes.charCodeAt(i);
  return new Blob([ab], { type: mime });
}

function uploadImage(dataUrl) {
  return new Promise(function(resolve, reject) {
    try {
      var blob = dataURLToBlob(dataUrl);
      var filename = 'product_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.jpg';
      var ref = fbStorage.ref('product-images/' + filename);
      ref.put(blob, { contentType: 'image/jpeg' }).then(function(snapshot) {
        return snapshot.ref.getDownloadURL();
      }).then(function(url) {
        resolve(url);
      }).catch(function(err) {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

function getTypes() {
  var types = [...new Set(products.filter(p => p.category1).map(p => p.category1))].sort();
  categoriesConfig.types.forEach(function(t) {
    if (types.indexOf(t) === -1) types.push(t);
  });
  return types.sort();
}

function getBrands() {
  var brands = [...new Set(products.filter(p => p.category2).map(p => p.category2))].sort();
  categoriesConfig.brands.forEach(function(b) {
    if (brands.indexOf(b) === -1) brands.push(b);
  });
  return brands.sort();
}

function renderFilters() {
  var container = document.getElementById('filterContainer');
  var types = getTypes();
  container.innerHTML = '<button class="filter-btn active" data-category="all">All</button>';
  types.forEach(function(t) {
    container.innerHTML += '<button class="filter-btn" data-category="' + t + '">' + t + '</button>';
  });

  var brandContainer = document.getElementById('brandFilterContainer');
  if (brandContainer) {
    var brands = getBrands();
    var brandHtml = '<button class="filter-btn' + (currentBrand === 'all' ? ' active' : '') + '" data-brand="all">All Brands</button>';
    brands.forEach(function(b) {
      brandHtml += '<button class="filter-btn' + (currentBrand === b ? ' active' : '') + '" data-brand="' + b + '">' + b + '</button>';
    });
    brandContainer.innerHTML = brandHtml;
  }
}

document.getElementById('filterContainer').addEventListener('click', function(e) {
  var btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('#filterContainer .filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  currentCategory = btn.dataset.category;
  renderProducts();
});

document.addEventListener('click', function(e) {
  var btn = e.target.closest('#brandFilterContainer .filter-btn');
  if (!btn) return;
  document.querySelectorAll('#brandFilterContainer .filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  currentBrand = btn.dataset.brand;
  renderProducts();
});

function renderProducts() {
  var grid = document.getElementById('productGrid');
  var empty = document.getElementById('emptyState');
  var filtered = products.filter(function(p) { return p.available !== false; });
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
    var sizesHtml = p.sizes && p.sizes.length > 0 ? '<div class="product-sizes">' + p.sizes.map(function(s) { return '<span class="product-size-tag">' + s + '</span>'; }).join('') + '</div>' : '';
    return '<div class="product-card" data-id="' + p.id + '">' +
      '<img class="product-image" src="' + (p.images?.[0] || 'images/products/placeholder.svg') + '" alt="' + p.name + '" loading="lazy" onerror="this.src=\'images/products/placeholder.svg\'">' +
      '<div class="product-info">' +
      '<div class="product-category">' + p.category1 + '</div>' +
      brandHtml +
      '<div class="product-name">' + p.name + '</div>' +
      sizesHtml +
      '<div class="product-price">' + p.price + '</div>' +
      '</div></div>';
  }).join('');
  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      const product = products.find(p => p.id === id);
      if (product) openModal(product);
    });
  });
}

function openModal(product) {
  currentModalImages = product.images || [product.image || 'images/products/placeholder.svg'];
  currentImageIndex = 0;
  showModalImage();
  document.getElementById('modalTitle').textContent = product.name;
  document.getElementById('modalPrice').textContent = product.price;
  document.getElementById('modalCategory').textContent = product.category1 + (product.category2 ? ' · ' + product.category2 : '');
  var sizesEl = document.getElementById('modalSizes');
  if (product.sizes && product.sizes.length > 0) {
    sizesEl.innerHTML = product.sizes.map(function(s) { return '<span class="modal-size-tag">' + s + '</span>'; }).join('');
    sizesEl.style.display = '';
  } else {
    sizesEl.innerHTML = '';
    sizesEl.style.display = 'none';
  }
  document.getElementById('modalDesc').textContent = product.description;
  document.getElementById('productModal').classList.add('active');
  lockBody();
  history.pushState({modal: true}, '', '#modal');
}

function showModalImage() {
  const img = document.getElementById('modalImage');
  img.src = currentModalImages[currentImageIndex] || 'images/products/placeholder.svg';
  img.onerror = function() {
    this.src = 'images/products/placeholder.svg';
  };
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

document.getElementById('carouselPrev').addEventListener('click', () => {
  if (currentModalImages.length < 2) return;
  currentImageIndex = (currentImageIndex - 1 + currentModalImages.length) % currentModalImages.length;
  showModalImage();
});

document.getElementById('carouselNext').addEventListener('click', () => {
  if (currentModalImages.length < 2) return;
  currentImageIndex = (currentImageIndex + 1) % currentModalImages.length;
  showModalImage();
});

document.getElementById('carouselDots').addEventListener('click', e => {
  const dot = e.target.closest('.carousel-dot');
  if (!dot) return;
  currentImageIndex = parseInt(dot.dataset.index);
  showModalImage();
});

function closeModal() {
  document.getElementById('productModal').classList.remove('active');
  unlockBody();
  currentModalImages = [];
  currentImageIndex = 0;
  if (location.hash === '#modal') history.back();
}

document.getElementById('productModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
document.querySelector('#productModal .modal-close').addEventListener('click', closeModal);
// Fullscreen image viewer
function openFullscreen() {
  if (currentModalImages.length === 0) return;
  document.getElementById('fullscreenViewer').classList.add('active');
  lockBody();
  renderFullscreenTrack();
  history.pushState({fullscreen: true}, '', '#fullscreen');
}

function renderFullscreenTrack() {
  var track = document.getElementById('fullscreenTrack');
  var h = window.innerHeight;
  var html = '';
  for (var i = 0; i < currentModalImages.length; i++) {
    html += '<div class="fullscreen-slide" style="height:' + h + 'px"><img src="' + currentModalImages[i] + '" alt=""></div>';
  }
  track.innerHTML = html;
  updateCounter();
  track.style.transition = 'none';
  track.style.transform = 'translate3d(0,' + (-currentImageIndex * h) + 'px,0)';
}

function updateCounter() {
  document.getElementById('fullscreenCounter').textContent =
    (currentImageIndex + 1) + ' / ' + currentModalImages.length;
}

function closeFullscreen() {
  document.getElementById('fullscreenViewer').classList.remove('active');
  var modal = document.getElementById('productModal');
  if (!modal || !modal.classList.contains('active')) unlockBody();
  if (location.hash === '#fullscreen') history.back();
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

// Fullscreen swipe / drag
(function() {
  var viewer = document.getElementById('fullscreenViewer');
  var track = document.getElementById('fullscreenTrack');
  var startY = 0, startX = 0;
  var dragging = false;
  var dragOffset = 0;

  function nav(dir) {
    if (currentModalImages.length < 2) return;
    var next = currentImageIndex + dir;
    if (next < 0 || next >= currentModalImages.length) return;
    currentImageIndex = next;
    updateCounter();
    var h = window.innerHeight;
    track.style.transition = 'transform 0.3s ease';
    track.style.transform = 'translate3d(0,' + (-next * h) + 'px,0)';
  }

  document.addEventListener('touchstart', function(e) {
    if (!viewer.classList.contains('active')) return;
    var t = e.touches[0];
    if (!t) return;
    startY = t.clientY;
    startX = t.clientX;
    dragOffset = 0;
    dragging = true;
    track.style.transition = 'none';
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', function(e) {
    if (!dragging || !viewer.classList.contains('active')) return;
    if (currentModalImages.length < 2) { dragging = false; return; }
    var t = e.touches[0];
    if (!t) return;
    var dy = t.clientY - startY;
    var h = window.innerHeight;
    dragOffset = dy;
    track.style.transition = 'none';
    var offset = dy * 0.3;
    if (currentImageIndex === 0) offset = Math.min(offset, 0);
    if (currentImageIndex === currentModalImages.length - 1) offset = Math.max(offset, 0);
    track.style.transform = 'translate3d(0,' + (-currentImageIndex * h + offset) + 'px,0)';
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
      track.style.transition = 'transform 0.3s ease';
      track.style.transform = 'translate3d(0,' + (-currentImageIndex * h) + 'px,0)';
    }
  }, { passive: true });

  viewer.addEventListener('wheel', function(e) {
    if (currentModalImages.length < 2) return;
    if (Math.abs(e.deltaY) < 20) return;
    nav(e.deltaY > 0 ? 1 : -1);
  }, { passive: true });
})();

document.getElementById('fullscreenViewer').addEventListener('click', function(e) {
  if (e.target === e.currentTarget) closeFullscreen();
});

document.querySelector('#fullscreenViewer .fullscreen-close').addEventListener('click', closeFullscreen);
document.querySelector('#fullscreenViewer .fullscreen-close').addEventListener('touchend', function(e) {
  e.preventDefault();
  closeFullscreen();
});



document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('fullscreenViewer').classList.contains('active')) {
      closeFullscreen();
      return;
    }
    closeModal();
    return;
  }
  if (document.getElementById('fullscreenViewer').classList.contains('active')) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (currentImageIndex > 0) {
        goToSlide(currentImageIndex - 1, true);
      }
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (currentImageIndex < currentModalImages.length - 1) {
        goToSlide(currentImageIndex + 1, true);
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

document.getElementById('searchInput').addEventListener('input', e => {
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

document.getElementById('searchForm').addEventListener('submit', doSearch);

document.getElementById('searchInput').addEventListener('search', doSearch);

document.getElementById('searchInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    doSearch(e);
  }
});

document.getElementById('menuToggle').addEventListener('click', () => {
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
             (p.category1 && p.category1.toLowerCase().indexOf(q) !== -1) ||
             (p.category2 && p.category2.toLowerCase().indexOf(q) !== -1);
    });
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
    if (p.category2) catStr += ' · ' + p.category2;
    var sizesStr = p.sizes && p.sizes.length > 0 ? ' · Sizes: ' + p.sizes.join(', ') : '';
    return '<div class="admin-product-item" data-id="' + p.id + '">' +
      '<img src="' + (p.images?.[0] || 'images/products/placeholder.svg') + '" alt="' + p.name + '" onerror="this.src=\'images/products/placeholder.svg\'">' +
      '<div class="admin-product-item-info">' +
      '<div class="name">' + p.name + '</div>' +
      '<div class="meta">' + catStr + ' · ' + p.price + sizesStr + '</div>' +
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
  var typeSelect = document.getElementById('formCategory1');
  var brandSelect = document.getElementById('formCategory2');
  if (!typeSelect || !brandSelect) return;

  var types = categoriesConfig.types.slice();
  getTypes().forEach(function(t) { if (types.indexOf(t) === -1) types.push(t); });

  var brands = categoriesConfig.brands.slice();
  getBrands().forEach(function(b) { if (brands.indexOf(b) === -1) brands.push(b); });

  typeSelect.innerHTML = '<option value="">Select type...</option>' + types.map(function(t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');
  brandSelect.innerHTML = '<option value="">Select brand...</option>' + brands.map(function(b) { return '<option value="' + b + '">' + b + '</option>'; }).join('');
  renderSizePresets();
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
  if (selectedSizes.length === 0) { container.innerHTML = ''; return; }
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
  selectedImagesData = [];
  selectedSizes = [];
  renderImagePreview();
  renderSizeTags();
  renderSizePresets();
}

function populateForm(product) {
  editingId = product.id;
  document.getElementById('formTitle').textContent = 'Edit Product';
  document.getElementById('formSubmitBtn').textContent = 'Save Changes';
  document.getElementById('formCancelBtn').style.display = 'inline-block';
  document.getElementById('formName').value = product.name;
  document.getElementById('formCategory1').value = product.category1 || '';
  document.getElementById('formCategory2').value = product.category2 || '';
  document.getElementById('formPrice').value = product.price;
  document.getElementById('formDesc').value = product.description;
  document.getElementById('formAvailable').checked = product.available !== false;
  selectedSizes = product.sizes ? product.sizes.slice() : [];
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

document.getElementById('productForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var name = document.getElementById('formName').value.trim();
  var category1 = document.getElementById('formCategory1').value;
  var category2 = document.getElementById('formCategory2').value;
  var price = document.getElementById('formPrice').value.trim();
  var description = document.getElementById('formDesc').value.trim();
  if (!name || !category1 || !category2 || !price || !description) return;

  var submitBtn = document.getElementById('formSubmitBtn');
  var origText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Uploading...';

  var toUpload = selectedImagesData.filter(function(s) { return s.startsWith('data:'); });
  var keep = selectedImagesData.filter(function(s) { return !s.startsWith('data:'); });

  function finish(images) {
    if (editingId) {
      var idx = products.findIndex(function(p) { return p.id === editingId; });
      if (idx !== -1) {
        products[idx] = Object.assign({}, products[idx], { name: name, category1: category1, category2: category2, price: price, description: description, images: images, sizes: selectedSizes.slice(), available: document.getElementById('formAvailable').checked });
      }
    } else {
      var maxId = products.length > 0 ? Math.max.apply(null, products.map(function(p) { return p.id; })) : 0;
      products.push({ id: maxId + 1, name: name, category1: category1, category2: category2, price: price, description: description, images: images, sizes: selectedSizes.slice(), available: document.getElementById('formAvailable').checked });
    }
    saveProducts();
    resetForm();
    renderAdminList();
    renderFilters();
    submitBtn.disabled = false;
    submitBtn.textContent = origText;
  }

  if (toUpload.length === 0 || !fbStorage) {
    var allImages = keep.length > 0 ? keep : (editingId
      ? (products.find(p => p.id === editingId)?.images || ['images/products/placeholder.svg'])
      : ['images/products/placeholder.svg']);
    finish(allImages);
    return;
  }

  Promise.all(toUpload.map(function(src) { return uploadImage(src); })).then(function(urls) {
    finish(keep.concat(urls));
  }).catch(function() {
    alert('Failed to upload one or more images. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = origText;
  });
});

document.getElementById('formCancelBtn').addEventListener('click', resetForm);

document.getElementById('newSizeInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    var val = this.value.trim();
    if (val && selectedSizes.indexOf(val) === -1) { selectedSizes.push(val); this.value = ''; renderSizeTags(); renderSizePresets(); }
  }
});

document.getElementById('addSizeBtn').addEventListener('click', function() {
  var input = document.getElementById('newSizeInput');
  var val = input.value.trim();
  if (val && selectedSizes.indexOf(val) === -1) { selectedSizes.push(val); input.value = ''; renderSizeTags(); renderSizePresets(); }
});

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

document.getElementById('addImageBtn').addEventListener('click', () => {
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
      ctx.drawImage(img, 0, 0, w, h);
      cb(canvas.toDataURL('image/jpeg', maxQ));
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

document.getElementById('formImage').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  resizeImage(file, 800, 0.8, function(dataUrl) {
    selectedImagesData.push(dataUrl);
    renderImagePreview();
  });
  e.target.value = '';
});

// Import/Export
document.getElementById('exportBtn').addEventListener('click', () => {
  const data = JSON.stringify(products, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'yokoso-products.json';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFileInput').click();
});

document.getElementById('importFileInput').addEventListener('change', e => {
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

// Navigation between public and admin view
const ADMIN_PASSWORD = 'amped2016';

function showAdminPanel() {
  if (prompt('Enter admin password:') !== ADMIN_PASSWORD) return;
  document.getElementById('maintenanceOverlay').classList.add('active');
  document.getElementById('maintenancePublic').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  renderAdminFilterDropdowns();
  renderAdminList();
}

document.getElementById('enterAdminBtn').addEventListener('click', showAdminPanel);

document.getElementById('footerAdminLink').addEventListener('click', e => {
  e.preventDefault();
  showAdminPanel();
});

function renderAdminFilterDropdowns() {
  var typeSelect = document.getElementById('adminFilterType');
  var brandSelect = document.getElementById('adminFilterBrand');
  if (!typeSelect || !brandSelect) return;
  var types = getTypes();
  var brands = getBrands();
  typeSelect.innerHTML = '<option value="all">All Types</option>' + types.map(function(t) { return '<option value="' + t + '"' + (adminFilterType === t ? ' selected' : '') + '>' + t + '</option>'; }).join('');
  brandSelect.innerHTML = '<option value="all">All Brands</option>' + brands.map(function(b) { return '<option value="' + b + '"' + (adminFilterBrand === b ? ' selected' : '') + '>' + b + '</option>'; }).join('');
}

document.getElementById('adminSearch').addEventListener('input', function() {
  adminSearchVal = this.value;
  renderAdminList();
});

document.getElementById('adminFilterType').addEventListener('change', function() {
  adminFilterType = this.value;
  renderAdminList();
});

document.getElementById('adminFilterBrand').addEventListener('change', function() {
  adminFilterBrand = this.value;
  renderAdminList();
});

document.getElementById('manageCategoriesBtn').addEventListener('click', function() {
  var el = document.getElementById('adminCategories');
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
  renderCategoryManagement();
});

document.getElementById('backToPublicBtn').addEventListener('click', function() {
  document.getElementById('adminCategories').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'none';
  adminSearchVal = '';
  adminFilterType = 'all';
  adminFilterBrand = 'all';
  if (typeof MAINTENANCE_MODE !== 'undefined' && MAINTENANCE_MODE) {
    document.getElementById('maintenancePublic').style.display = 'block';
  } else {
    document.getElementById('maintenanceOverlay').classList.remove('active');
  }
});

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

function renderCategoryManagement() {
  var typeList = document.getElementById('typeTagList');
  var brandList = document.getElementById('brandTagList');
  var sizeList = document.getElementById('sizeTagList');
  if (!typeList || !brandList) return;
  typeList.innerHTML = categoriesConfig.types.map(function(t) {
    return '<span class="admin-tag"><span class="admin-tag-label" title="Double-click to rename">' + t + '</span><span class="admin-tag-remove" data-type="' + t + '">×</span></span>';
  }).join('');
  brandList.innerHTML = categoriesConfig.brands.map(function(b) {
    return '<span class="admin-tag"><span class="admin-tag-label" title="Double-click to rename">' + b + '</span><span class="admin-tag-remove" data-brand="' + b + '">×</span></span>';
  }).join('');
  if (sizeList) {
    sizeList.innerHTML = categoriesConfig.sizes.map(function(s) {
      return '<span class="admin-tag"><span class="admin-tag-label" title="Double-click to rename">' + s + '</span><span class="admin-tag-remove" data-size-cat="' + s + '">×</span></span>';
    }).join('');
  }
  document.querySelectorAll('#typeTagList .admin-tag-remove').forEach(function(el) {
    el.addEventListener('click', function() {
      var t = this.dataset.type;
      categoriesConfig.types = categoriesConfig.types.filter(function(x) { return x !== t; });
      saveCategoriesConfig();
      renderCategoryManagement();
      renderCategoryDropdowns();
      renderAdminFilterDropdowns();
    });
  });
  document.querySelectorAll('#brandTagList .admin-tag-remove').forEach(function(el) {
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
  document.querySelectorAll('#typeTagList .admin-tag-label').forEach(function(el) {
    el.addEventListener('dblclick', function() { makeEditableTag(el.parentNode, categoriesConfig.types, 'types'); });
  });
  document.querySelectorAll('#brandTagList .admin-tag-label').forEach(function(el) {
    el.addEventListener('dblclick', function() { makeEditableTag(el.parentNode, categoriesConfig.brands, 'brands'); });
  });
}

document.getElementById('addTypeBtn').addEventListener('click', function() {
  var input = document.getElementById('newTypeInput');
  var val = input.value.trim();
  if (!val) return;
  if (categoriesConfig.types.indexOf(val) === -1) {
    categoriesConfig.types.push(val);
    saveCategoriesConfig();
    renderCategoryManagement();
    renderCategoryDropdowns();
  }
  input.value = '';
});

document.getElementById('addBrandBtn').addEventListener('click', function() {
  var input = document.getElementById('newBrandInput');
  var val = input.value.trim();
  if (!val) return;
  if (categoriesConfig.brands.indexOf(val) === -1) {
    categoriesConfig.brands.push(val);
    saveCategoriesConfig();
    renderCategoryManagement();
    renderCategoryDropdowns();
  }
  input.value = '';
});

document.getElementById('addSizeCatBtn').addEventListener('click', function() {
  var input = document.getElementById('newSizeCatInput');
  var val = input.value.trim();
  if (!val) return;
  if (categoriesConfig.sizes.indexOf(val) === -1) {
    categoriesConfig.sizes.push(val);
    saveCategoriesConfig();
    renderCategoryManagement();
    renderSizePresets();
  }
  input.value = '';
});

document.getElementById('newTypeInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); document.getElementById('addTypeBtn').click(); }
});
document.getElementById('newBrandInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); document.getElementById('addBrandBtn').click(); }
});
document.getElementById('newSizeCatInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') { e.preventDefault(); document.getElementById('addSizeCatBtn').click(); }
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
loadProducts(function() {
  if (typeof MAINTENANCE_MODE !== 'undefined' && MAINTENANCE_MODE) {
    document.getElementById('maintenanceOverlay').classList.add('active');
    return;
  }
  renderFilters();
  renderProducts();
});
