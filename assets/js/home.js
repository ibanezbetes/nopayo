// assets/js/home.js

// ← URL base de tu API Gateway
const API_BASE = 'https://api.nopayo.es';

/**
 * 1) Obtiene todos los productos desde /products
 */
async function getProducts() {
  const res = await fetch(`${API_BASE}/products`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json(); // [{ productId, name, price, category, new, photo1, photo2, photo3, photo4, description, … }]
}

/**
 * 2) Si vienen 1-2 ítems duplicados para que Swiper pueda hacer loop
 */
function normalizeSlides(items) {
  if (items.length === 1) items.push({ ...items[0] });
  if (items.length === 2) items.push(...items);
  return items;
}

/**
 * 3) Renderiza el HTML de cada slide
 */
function buildSlides(items) {
  return items.map(p => `
    <article class="home__article swiper-slide" data-id="${p.productId}">
      <img src="${p.photo1}" alt="${p.name}" class="home__img">
      <h2 class="home__product">${p.name}</h2>
      <h3 class="home__price">€${p.price.toFixed(2)}</h3>
    </article>
  `).join('');
}

/**
 * 4) Inicializa Swiper (usa el global Swiper ya cargado por swiper-bundle.min.js)
 */
function initSwiper() {
  new Swiper('.home__swiper', {
    loop: true,
    grabCursor: true,
    slidesPerView: 1,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
}

/**
 * Añade al carrito en localStorage (clave "cart")
 */
function addToCart(product, size) {
  if (!size) {
    alert('Por favor, selecciona una talla antes de añadir al carrito.');
    return;
  }
  const key  = 'cart';
  const cart = JSON.parse(localStorage.getItem(key) || '[]');
  cart.push({
    productId: product.productId,
    name:      product.name,
    price:     product.price,
    img:       product.photo1,
    size,
    quantity:  1
  });
  localStorage.setItem(key, JSON.stringify(cart));
  alert('Producto añadido al carrito.');
}

/**
 * 5) Lógica del modal: abrir, galería, cerrar y añadir al carrito
 */
function attachModalLogic(products) {
  const modal      = document.getElementById('product-modal');
  const backdrop   = document.getElementById('modal-backdrop');
  const closeBtn   = document.getElementById('modal-close');
  const mainImg    = document.getElementById('modal-main-img');
  const thumbs     = document.getElementById('modal-thumbs');
  const nameEl     = document.getElementById('modal-name');
  const descEl     = document.getElementById('modal-description');
  const priceEl    = document.getElementById('modal-price');
  const sizeSelect = document.getElementById('modal-size');
  const cartBtn    = document.getElementById('modal-cart');

  // Abre modal al clicar un slide
  document.querySelectorAll('.home__article').forEach(slide => {
    slide.addEventListener('click', () => {
      const id = slide.dataset.id;
      const p  = products.find(x => x.productId === id);
      if (!p) return;

      // Carga galería (hasta 4 fotos)
      const photos = [p.photo1, p.photo2, p.photo3, p.photo4].filter(Boolean);
      mainImg.src = photos[0];
      thumbs.innerHTML = photos.map((u,i) => `
        <img src="${u}"
             class="modal__thumb${i===0?' active':''}"
             data-index="${i}">
      `).join('');

      // Click en thumbs → actualiza mainImg
      thumbs.querySelectorAll('img').forEach(img => {
        img.addEventListener('click', () => {
          thumbs.querySelectorAll('img').forEach(x => x.classList.remove('active'));
          img.classList.add('active');
          mainImg.src = img.src;
        });
      });

      // Rellena info
      nameEl.textContent         = p.name;
      nameEl.dataset.productId   = p.productId;
      descEl.textContent         = p.description || '';
      priceEl.textContent        = p.price.toFixed(2);
      sizeSelect.value           = ''; // reset

      // Muestra modal
      modal.classList.remove('hidden');
    });
  });

  // Cerrar modal
  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  backdrop .addEventListener('click', () => modal.classList.add('hidden'));

  // Añadir al carrito
  cartBtn.addEventListener('click', () => {
    const prodId = nameEl.dataset.productId;
    const p      = products.find(x => x.productId === prodId);
    addToCart(p, sizeSelect.value);
  });
}

/**
 * 6) ARRANQUE: carga, filtra, renderiza Swiper y modal
 */
(async () => {
  const wrapper = document.getElementById('home-swiper-wrapper');
  try {
    let productos = await getProducts();

    // FILTRO POR CATEGORÍA EXACTA
    if (window.FILTER_CATEGORY) {
      productos = productos.filter(p => p.category === window.FILTER_CATEGORY);
    }
    // FILTRO POR EXCLUSIÓN (para “Otros”)
    if (window.FILTER_EXCLUDE && Array.isArray(window.FILTER_EXCLUDE)) {
      productos = productos.filter(p => !window.FILTER_EXCLUDE.includes(p.category));
    }

    // Normaliza y pinta
    const items = normalizeSlides(productos);
    wrapper.innerHTML = buildSlides(items);
    initSwiper();

    // Enlaza modal con los productos filtrados
    attachModalLogic(productos);

  } catch (err) {
    console.error('Error cargando productos:', err);
    wrapper.innerHTML =
      '<p style="text-align:center;width:100%">No se pudieron cargar los productos.</p>';
  }
})();
