/* ============================================================================
   NOPAYO · Conecta plantilla con backend AWS
   ---------------------------------------------------------------------------
   • Obtiene productos de https://api.nopayo.es/products
   • Rellena el .swiper-wrapper con artículos reales
   • Soporta filtros:
       - news.html            → ?filter=new
       - category.html?cat=X  → X = Camisetas | Sudaderas | Otros
   ========================================================================== */

/* ---------- Configuración mínima ---------- */
const API_BASE = 'https://api.nopayo.es';   //  ←  tu API Gateway

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);

/* ---------- Construye la tarjeta ---------- */
function slideHTML (p) {
  return `
  <article class="home__article swiper-slide">
    <img src="${p.photo1}" alt="${p.name}" class="home__img">
    <h2 class="home__product">${p.name}</h2>
    <h3 class="home__price">€${p.price.toFixed(2)}</h3>
  </article>`;
}

/* ---------- Llama a la API ---------- */
async function fetchProducts () {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();            // array [{ productId, name, price, category, new, photo1, … }]
}

/* ---------- Decide filtro según URL ---------- */
function applyFilter (all) {
  const url = new URL(location.href);

  /* /news.html  →  solo “new” === "si" */
  if (url.pathname.endsWith('news.html') || url.searchParams.get('filter') === 'new') {
    return all.filter(p => p.new?.toLowerCase?.() === 'si');
  }

  /* /category.html?cat=Camisetas  →  por categoría */
  const cat = url.searchParams.get('cat');
  if (cat) {
    if (cat === 'Otros')
      return all.filter(p => !['Camisetas', 'Sudaderas'].includes(p.category));
    return all.filter(p => p.category === cat);
  }

  /* index.html  →  todos */
  return all;
}

/* ---------- Inserta slides y arranca Swiper ---------- */
async function renderSlider () {
  const wrapper = $('.swiper-wrapper');
  if (!wrapper) return;               /* no slider en esta página */

  try {
    const all   = await fetchProducts();
    const items = applyFilter(all);

    /* sustituye las tarjetas de demo por las reales */
    wrapper.innerHTML = items.map(slideHTML).join('');

    /* Re-inicializa Swiper (la plantilla ya cargó Swiper JS) */
    // eslint-disable-next-line no-undef
    new Swiper('.home__swiper', {
      loop: true,
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      spaceBetween: 24,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      }
    });
  } catch (err) {
    console.error('Error cargando productos:', err);
    wrapper.insertAdjacentHTML('beforeend',
      '<p style="grid-column:1/-1;color:red">Error cargando productos.</p>');
  }
}

document.addEventListener('DOMContentLoaded', renderSlider);
