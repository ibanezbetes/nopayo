// assets/js/home.js

// ← URL base de tu API Gateway
const API_BASE = 'https://api.nopayo.es';

/** 1) Fetch de productos **/
async function getProducts() {
  const res = await fetch(`${API_BASE}/products`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json(); // devuelve un array [{ productId, name, price, category, new, photo1, description… }, …]
}

/** 2) Si hay 1–2 productos, duplica para que Swiper pueda hacer loop */
function normalizaSlides(items) {
  if (items.length === 1) {
    items.push({ ...items[0] });
  }
  if (items.length === 2) {
    items.push(...items);
  }
  return items;
}

/** 3) Construye el HTML de cada slide */
function buildSlides(items) {
  return items
    .map(
      p => `
<article class="home__article swiper-slide">
  <img
    src="${p.photo1}"
    alt="${p.name}"
    class="home__img"
    data-product-id="${p.productId}"
    data-description="${p.description || ''}"
    data-price="${p.price}"
  />
  <h2 class="home__product">${p.name}</h2>
  <h3 class="home__price">€${p.price.toFixed(2)}</h3>
</article>`
    )
    .join('');
}

/** 4) Inicializa Swiper (usa el global Swiper que provee swiper-bundle.min.js) */
function initSwiper() {
  /* global Swiper */
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

/** 5) Lógica para abrir/cerrar modal y añadir al carrito */
function attachModalLogic() {
  // Abre modal al clickar sobre cualquier slide
  document.querySelectorAll('.home__article').forEach(slide => {
    slide.addEventListener('click', () => {
      const imgEl = slide.querySelector('img.home__img');
      const productId   = imgEl.dataset.productId;
      const name        = slide.querySelector('.home__product').textContent;
      const price       = imgEl.dataset.price;
      const description = imgEl.dataset.description;

      // Rellenamos el modal
      document.getElementById('modal-main-img').src = imgEl.src;
      const nameEl = document.getElementById('modal-name');
      nameEl.textContent = name;
      nameEl.dataset.productId = productId;
      document.getElementById('modal-description').textContent = description;
      document.getElementById('modal-price').textContent = parseFloat(price).toFixed(2);

      // Mostramos
      document.getElementById('product-modal').classList.remove('hidden');
    });
  });

  // Cerrar modal
  document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('product-modal').classList.add('hidden');
  });

  // Añadir al carrito
  document.getElementById('modal-cart').addEventListener('click', () => {
    const size = document.getElementById('modal-size').value;
    if (!size) {
      alert('Selecciona una talla');
      return;
    }
    const productId = document.getElementById('modal-name').dataset.productId;
    const name  = document.getElementById('modal-name').textContent;
    const price = parseFloat(document.getElementById('modal-price').textContent);
    const img   = document.getElementById('modal-main-img').src;

    // Código de tu carrito en localStorage (puede variar según tu implementación)
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push({ productId, name, price, img, size, q: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Añadido al carrito');
    document.getElementById('product-modal').classList.add('hidden');
  });
}

/** 6) Filtra según la página actual */
function filterProducts(all) {
  const path = window.location.pathname.split('/').pop();
  if (path === 'camisetas.html') {
    return all.filter(p => p.category === 'Camisetas');
  } else if (path === 'sudaderas.html') {
    return all.filter(p => p.category === 'Sudaderas');
  } else if (path === 'otros.html') {
    return all.filter(p => p.category !== 'Camisetas' && p.category !== 'Sudaderas');
  } else if (path === 'news.html') {
    return all.filter(p => (p.new || '').toLowerCase() === 'yes');
  }
  // Index (todos)
  return all;
}

/** 7) Arranque: carga, filtra, renderiza, inicializa */
(async () => {
  const wrapper = document.getElementById('home-swiper-wrapper');
  if (!wrapper) return; // si no hay slider en esta página
  try {
    const all     = await getProducts();
    const filted  = filterProducts(all);
    const slides  = normalizaSlides(filted);
    wrapper.innerHTML = buildSlides(slides);
    initSwiper();
    attachModalLogic();
  } catch (err) {
    console.error('Error cargando productos:', err);
    wrapper.innerHTML =
      '<p style="text-align:center;width:100%">No se pudieron cargar los productos.</p>';
  }
})();
