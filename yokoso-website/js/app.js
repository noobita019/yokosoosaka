const DEFAULT_PRODUCTS = [
  { id: 1, name: "Nike Air Force 1 Low (Japan Exclusive)", category: "Shoes", price: "₱5,200", description: "Authentic Nike Air Force 1 Low from Japan. Limited Japan-exclusive colorway. Leather upper with Air-Sole cushioning. Sizes 7-12 US.", images: ["images/products/placeholder.svg"] },
  { id: 2, name: "Nike Dunk Low Retro", category: "Shoes", price: "₱4,800", description: "Classic Nike Dunk Low in premium leather. Japan release. Available in multiple colors. Sizes 7-11 US.", images: ["images/products/placeholder.svg"] },
  { id: 3, name: "Nike Air Max 90 (Japan Pack)", category: "Shoes", price: "₱5,500", description: "Nike Air Max 90 from the Japan-exclusive pack. Visible Air cushioning. Iconic silhouette. Sizes 7-12 US.", images: ["images/products/placeholder.svg"] },
  { id: 4, name: "GU Fluffy Knit Sweater", category: "Clothing", price: "₱850", description: "Soft fluffy knit sweater from GU. Available in multiple colors. Perfect for cold season. Oversized relaxed fit.", images: ["images/products/placeholder.svg"] },
  { id: 5, name: "Uniqlo Airism Oversized T-Shirt", category: "Clothing", price: "₱650", description: "Authentic Uniqlo Airism oversized t-shirt. Ultra-lightweight and breathable. Moisture-wicking fabric. Perfect for everyday use.", images: ["images/products/placeholder.svg"] },
  { id: 6, name: "GU Wide Leg Pants", category: "Clothing", price: "₱950", description: "GU wide-leg pants. Comfortable and stylish. Premium cotton blend. Available in black, beige, and navy.", images: ["images/products/placeholder.svg"] },
  { id: 7, name: "Uniqlo Light Down Jacket", category: "Clothing", price: "₱2,200", description: "Lightweight Uniqlo down jacket. Packable design. 750 fill power. Warm without being bulky. Water-repellent.", images: ["images/products/placeholder.svg"] },
  { id: 8, name: "Japanese Biore UV Aqua Rich SPF50+", category: "Cosmetics", price: "₱550", description: "Biore UV Aqua Rich watery essence sunscreen. SPF50+ PA++++. Lightweight, non-sticky, refreshing finish. 80g.", images: ["images/products/placeholder.svg"] },
  { id: 9, name: "Japanese Sheet Mask Variety Pack (10pcs)", category: "Cosmetics", price: "₱380", description: "Assorted Japanese facial sheet masks. Infused with collagen, hyaluronic acid, and vitamin C. 10-piece pack.", images: ["images/products/placeholder.svg"] },
  { id: 10, name: "Heroine Make Waterproof Eyeliner", category: "Cosmetics", price: "₱480", description: "Japanese Heroine Make waterproof liquid eyeliner. Ultra-fine 0.1mm tip. Smudge-proof and long-lasting. Black.", images: ["images/products/placeholder.svg"] },
  { id: 11, name: "Onitsuka Tiger Mexico 66", category: "Shoes", price: "₱3,800", description: "Classic Onitsuka Tiger Mexico 66 sneakers. Japan-exclusive colorway. Iconic design. Comfortable sole. Sizes 6-10 US.", images: ["images/products/placeholder.svg"] },
  { id: 12, name: "GU Knit Cardigan", category: "Clothing", price: "₱1,100", description: "GU open-front knit cardigan. Soft acrylic blend. Oversized fit. Perfect layering piece for any outfit.", images: ["images/products/placeholder.svg"] },
  { id: 13, name: "test", category: "test", price: "11", description: "test", images: ["images/products/placeholder.svg"] }
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

let products = [];
let editingId = null;
let currentCategory = 'all';
let currentSearch = '';
let selectedImagesData = [];
let currentModalImages = [];
let currentImageIndex = 0;

function migrateProducts() {
  let migrated = false;
  products.forEach(p => {
    if (p.image && !p.images) {
      p.images = [p.image];
      delete p.image;
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
}

function saveProducts() {
  localStorage.setItem('yokoso_products', JSON.stringify(products));
  if (fbDB) {
    fbDB.collection(FB_COLLECTION).doc(FB_DOC).set({ items: products }).catch(() => {});
  }
}

function getCategories() {
  return [...new Set(products.map(p => p.category))].sort();
}

function renderFilters() {
  const container = document.getElementById('filterContainer');
  const categories = getCategories();
  container.innerHTML = '<button class="filter-btn active" data-category="all">All</button>';
  categories.forEach(cat => {
    container.innerHTML += `<button class="filter-btn" data-category="${cat}">${cat}</button>`;
  });
}

document.getElementById('filterContainer').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentCategory = btn.dataset.category;
  renderProducts();
});

function renderProducts() {
  const grid = document.getElementById('productGrid');
  const empty = document.getElementById('emptyState');
  let filtered = products;
  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategory);
  }
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }
  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = filtered.map(p => `
    <div class="product-card" data-id="${p.id}">
      <img class="product-image" src="${p.images?.[0] || 'images/products/placeholder.svg'}" alt="${p.name}" loading="lazy"
           onerror="this.src='images/products/placeholder.svg'">
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">${p.price}</div>
      </div>
    </div>
  `).join('');
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
  document.getElementById('modalCategory').textContent = product.category;
  document.getElementById('modalDesc').textContent = product.description;
  document.getElementById('productModal').classList.add('active');
  document.body.style.overflow = 'hidden';
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
  document.body.style.overflow = '';
  currentModalImages = [];
  currentImageIndex = 0;
}

document.getElementById('productModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
document.querySelector('#productModal .modal-close').addEventListener('click', closeModal);
// Fullscreen image viewer
function openFullscreen() {
  if (currentModalImages.length === 0) return;
  document.getElementById('fullscreenViewer').classList.add('active');
  renderFullscreenTrack();
}

function renderFullscreenTrack() {
  const track = document.getElementById('fullscreenTrack');
  track.innerHTML = currentModalImages.map((src, i) =>
    `<div class="fullscreen-slide">
      <img src="${src}" onerror="this.src='images/products/placeholder.svg'" alt="">
    </div>`
  ).join('');
  goToSlide(currentImageIndex, false);
  updateCounter();
}

function goToSlide(index, smooth) {
  currentImageIndex = index;
  const track = document.getElementById('fullscreenTrack');
  track.style.transition = smooth ? 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)' : 'none';
  track.style.transform = `translateY(-${index * 100}vh)`;
  updateCounter();
}

function updateCounter() {
  document.getElementById('fullscreenCounter').textContent =
    `${currentImageIndex + 1} / ${currentModalImages.length}`;
}

function closeFullscreen() {
  document.getElementById('fullscreenViewer').classList.remove('active');
}

var modalImg = document.getElementById('modalImage');
modalImg.addEventListener('click', openFullscreen);
modalImg.addEventListener('touchend', function(e) {
  e.preventDefault();
  openFullscreen();
});

// Fullscreen swipe / drag
(function() {
  const viewer = document.getElementById('fullscreenViewer');
  const track = document.getElementById('fullscreenTrack');
  let startY = 0, startX = 0;
  let dragging = false;
  let dragOffset = 0;

  function nav(dir) {
    if (currentModalImages.length < 2) return;
    var next = (currentImageIndex + dir + currentModalImages.length) % currentModalImages.length;
    goToSlide(next, true);
  }

  viewer.addEventListener('touchstart', e => {
    const t = e.touches[0];
    startY = t.clientY;
    startX = t.clientX;
    dragOffset = 0;
    dragging = true;
    track.style.transition = 'none';
  }, { passive: true });

  viewer.addEventListener('touchmove', e => {
    if (!dragging || currentModalImages.length < 2) return;
    const t = e.touches[0];
    const dy = t.clientY - startY;
    const dx = t.clientX - startX;
    if (Math.abs(dy) > Math.abs(dx)) {
      dragOffset = dy;
      track.style.transform = `translateY(${-currentImageIndex * 100 + dy * 0.4}vh)`;
    }
  }, { passive: true });

  viewer.addEventListener('touchend', e => {
    if (!dragging) return;
    dragging = false;
    if (currentModalImages.length < 2) return;
    if (Math.abs(dragOffset) > 50) {
      nav(dragOffset < 0 ? 1 : -1);
    } else {
      goToSlide(currentImageIndex, true);
    }
  }, { passive: true });

  viewer.addEventListener('wheel', e => {
    if (currentModalImages.length < 2) return;
    if (Math.abs(e.deltaY) < 20) return;
    nav(e.deltaY > 0 ? 1 : -1);
  }, { passive: true });
})();

document.getElementById('fullscreenViewer').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeFullscreen();
});

document.querySelector('#fullscreenViewer .fullscreen-close').addEventListener('click', closeFullscreen);



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
      if (currentModalImages.length > 1) {
        var next = (currentImageIndex - 1 + currentModalImages.length) % currentModalImages.length;
        goToSlide(next, true);
      }
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (currentModalImages.length > 1) {
        var next = (currentImageIndex + 1) % currentModalImages.length;
        goToSlide(next, true);
      }
      e.preventDefault();
    }
    return;
  }
  if (!document.getElementById('productModal').classList.contains('active')) return;
  if (e.key === 'ArrowLeft' && currentModalImages.length > 1) {
    currentImageIndex = (currentImageIndex - 1 + currentModalImages.length) % currentModalImages.length;
    showModalImage();
  }
  if (e.key === 'ArrowRight' && currentModalImages.length > 1) {
    currentImageIndex = (currentImageIndex + 1) % currentModalImages.length;
    showModalImage();
  }
});

document.getElementById('searchInput').addEventListener('input', e => {
  currentSearch = e.target.value;
  renderProducts();
});

document.getElementById('menuToggle').addEventListener('click', () => {
  document.querySelector('.nav').classList.toggle('open');
});

// ---- ADMIN PANEL ----

function renderAdminList() {
  const container = document.getElementById('adminProductList');
  document.getElementById('productCount').textContent = products.length;
  if (products.length === 0) {
    container.innerHTML = '<p style="color:#888;text-align:center;padding:2rem">No products yet. Add your first product!</p>';
    return;
  }
  container.innerHTML = products.map(p => `
    <div class="admin-product-item" data-id="${p.id}">
      <img src="${p.images?.[0] || 'images/products/placeholder.svg'}" alt="${p.name}"
           onerror="this.src='images/products/placeholder.svg'">
      <div class="admin-product-item-info">
        <div class="name">${p.name}</div>
        <div class="meta">${p.category} · ${p.price}</div>
      </div>
      <div class="admin-product-item-actions">
        <button class="btn btn-secondary btn-sm edit-product-btn">Edit</button>
        <button class="btn btn-danger btn-sm delete-product-btn">Delete</button>
      </div>
    </div>
  `).join('');

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

function resetForm() {
  editingId = null;
  document.getElementById('formTitle').textContent = 'Add Product';
  document.getElementById('formSubmitBtn').textContent = 'Add Product';
  document.getElementById('formCancelBtn').style.display = 'none';
  document.getElementById('productForm').reset();
  selectedImagesData = [];
  renderImagePreview();
}

function populateForm(product) {
  editingId = product.id;
  document.getElementById('formTitle').textContent = 'Edit Product';
  document.getElementById('formSubmitBtn').textContent = 'Save Changes';
  document.getElementById('formCancelBtn').style.display = 'inline-block';
  document.getElementById('formName').value = product.name;
  document.getElementById('formCategory').value = product.category;
  document.getElementById('formPrice').value = product.price;
  document.getElementById('formDesc').value = product.description;
  const imgs = product.images || (product.image ? [product.image] : []);
  selectedImagesData = imgs.filter(img => img && !img.includes('placeholder'));
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

document.getElementById('productForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('formName').value.trim();
  const category = document.getElementById('formCategory').value.trim();
  const price = document.getElementById('formPrice').value.trim();
  const description = document.getElementById('formDesc').value.trim();
  if (!name || !category || !price || !description) return;

  const images = selectedImagesData.length > 0 ? selectedImagesData : (editingId
    ? (products.find(p => p.id === editingId)?.images || ['images/products/placeholder.svg'])
    : ['images/products/placeholder.svg']);

  if (editingId) {
    const idx = products.findIndex(p => p.id === editingId);
    if (idx !== -1) {
      products[idx] = { ...products[idx], name, category, price, description, images };
    }
  } else {
    const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
    products.push({ id: maxId + 1, name, category, price, description, images });
  }

  saveProducts();
  resetForm();
  renderAdminList();
  renderFilters();
});

document.getElementById('formCancelBtn').addEventListener('click', resetForm);

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
      data = data.map(p => {
        if (p.image && !p.images) {
          p.images = [p.image];
          delete p.image;
        }
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
  renderAdminList();
}

document.getElementById('enterAdminBtn').addEventListener('click', showAdminPanel);

document.getElementById('footerAdminLink').addEventListener('click', e => {
  e.preventDefault();
  showAdminPanel();
});

document.getElementById('backToPublicBtn').addEventListener('click', () => {
  document.getElementById('adminPanel').style.display = 'none';
  if (typeof MAINTENANCE_MODE !== 'undefined' && MAINTENANCE_MODE) {
    document.getElementById('maintenancePublic').style.display = 'block';
  } else {
    document.getElementById('maintenanceOverlay').classList.remove('active');
  }
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
