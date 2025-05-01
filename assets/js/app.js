// assets/js/app.js

/* ============ CONFIGURACIÓN ============ */
const COGNITO_DOMAIN = 'https://nopayo.auth.us-east-1.amazoncognito.com';
const CLIENT_ID      = '1vo21r2lgv19fr990puhu46vd2';
const REDIRECT_URI   = 'https://nopayo.es/callback.html';
const LOGOUT_URI     = 'https://nopayo.es/logout.html';
const API_BASE       = 'https://api.nopayo.es';

/* ============ UTILS ============ */
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* ============ AUTH UI ============ */
function updateAuthUI() {
  const token = localStorage.getItem("idToken");
  $("#nav-login").classList.toggle("hidden", !!token);
  $("#nav-logout").classList.toggle("hidden", !token);
  $("#nav-account").classList.toggle("hidden", !token);
}

$("#nav-login a").addEventListener("click", e => {
  e.preventDefault();
  const url =
    `${COGNITO_DOMAIN}/login?` +
    `client_id=${CLIENT_ID}` +
    `&response_type=token` +
    `&scope=openid+email` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  location.href = url;
});

$("#nav-logout a").addEventListener("click", e => {
  e.preventDefault();
  const url =
    `${COGNITO_DOMAIN}/logout?` +
    `client_id=${CLIENT_ID}` +
    `&logout_uri=${encodeURIComponent(LOGOUT_URI)}`;
  location.href = url;
});

/* ============ API ============ */
async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

async function toggleFavoriteApi(productId) {
  const token = localStorage.getItem("idToken");
  const res = await fetch(`${API_BASE}/favorites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({ productId })
  });
  if (!res.ok) throw new Error("Error toggling favorite");
  return res.json();
}

/* ============ SLIDER ============ */
function normalizeSlides(items) {
  if (items.length === 1) items.push(items[0]);
  if (items.length === 2) items.push(...items);
  return items;
}

function buildSlide(p) {
  return `
    <article class="home__article swiper-slide" data-id="${p.productId}">
      <img src="${p.photo1}" alt="${p.name}" class="home__img"/>
      <h2 class="home__product">${p.name}</h2>
      <h3 class="home__price">€${p.price.toFixed(2)}</h3>
    </article>`;
}

export async function loadProducts({ category, filter } = {}) {
  const wrapper = $("#home-swiper-wrapper");
  if (!wrapper) return;

  try {
    let all = await fetchProducts();

    if (filter) {
      all = all.filter(filter);
    } else if (category) {
      if (category === "Otros") {
        all = all.filter(p => p.category !== "Camisetas" && p.category !== "Sudaderas");
      } else {
        all = all.filter(p => p.category === category);
      }
    }

    const items = normalizeSlides(all);
    wrapper.innerHTML = items.map(buildSlide).join("");

    // Usa el Swiper global de swiper-bundle.min.js
    new Swiper('.home__swiper', {
      loop: true,
      grabCursor: true,
      slidesPerView: 1,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      }
    });
  } catch (err) {
    console.error("Error cargando productos:", err);
    wrapper.innerHTML = '<p style="text-align:center;color:red">Error cargando productos.</p>';
  }
}

/* ============ MODAL & VIEWER ============ */
let currentProduct = null;

async function openModal(productId) {
  const all = await fetchProducts();
  currentProduct = all.find(p => p.productId === productId);
  if (!currentProduct) return;

  $("#modal-main-img").src = currentProduct.photo1;
  $("#modal-name").textContent = currentProduct.name;
  $("#modal-description").textContent = currentProduct.description;
  $("#modal-price").textContent = currentProduct.price.toFixed(2);

  $("#modal-thumbs").innerHTML = [1,2,3,4].map(i => {
    const url = currentProduct[`photo${i}`];
    return url ? `<img src="${url}" data-url="${url}">` : '';
  }).join('');

  $("#product-modal").classList.remove("hidden");
}

function closeModal() {
  $("#product-modal").classList.add("hidden");
}

$("#modal-close").onclick    = closeModal;
$("#modal-backdrop").onclick = closeModal;

$("#modal-thumbs").onclick = e => {
  if (e.target.tagName === "IMG") {
    $("#modal-main-img").src = e.target.dataset.url;
  }
};

$("#modal-main-img").onclick = () => {
  $("#viewer-img").src = $("#modal-main-img").src;
  $("#viewer").classList.remove("hidden");
};

$("#viewer-close").onclick    = () => $("#viewer").classList.add("hidden");
$("#viewer-backdrop").onclick = () => $("#viewer").classList.add("hidden");
$("#viewer-prev").onclick     = () => {
  const thumbs = Array.from($("#modal-thumbs img"));
  const idx    = thumbs.findIndex(img => img.src === $("#viewer-img").src);
  const prev   = thumbs[(idx - 1 + thumbs.length) % thumbs.length];
  $("#viewer-img").src = prev.src;
};
$("#viewer-next").onclick     = () => {
  const thumbs = Array.from($("#modal-thumbs img"));
  const idx    = thumbs.findIndex(img => img.src === $("#viewer-img").src);
  const next   = thumbs[(idx + 1) % thumbs.length];
  $("#viewer-img").src = next.src;
};

document.addEventListener("click", e => {
  const art = e.target.closest(".home__article");
  if (art) openModal(art.dataset.id);
});

/* — Toggle favorito en modal — */
$("#modal-fav").onclick = async () => {
  if (!currentProduct) return;
  try {
    const { favorites } = await toggleFavoriteApi(currentProduct.productId);
    alert(favorites.includes(currentProduct.productId)
      ? "Añadido a favoritos" : "Eliminado de favoritos");
  } catch {
    alert("Error en favoritos");
  }
};

/* — Añadir al carrito desde el modal — */
$("#modal-cart").onclick = () => {
  if (!currentProduct) return;
  const size = $("#modal-size").value;
  if (!size) { alert("Selecciona talla"); return; }
  const cart = JSON.parse(localStorage.getItem("cart")||"[]");
  cart.push({
    id: currentProduct.productId,
    name: currentProduct.name,
    price: currentProduct.price,
    img: currentProduct.photo1,
    size,
    q: 1
  });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Añadido al carrito");
};

/* ============ RENDER CARRITO ============ */
function renderCart() {
  const body = $("#cart-body");
  if (!body) return;
  let c = JSON.parse(localStorage.getItem("cart")||"[]");
  body.innerHTML = c.map((it,i) => `
    <tr data-i="${i}">
      <td>${it.name}</td>
      <td>${it.size}</td>
      <td>
        <button class="q" data-d="-1">−</button>
        ${it.q}
        <button class="q" data-d="1">+</button>
      </td>
      <td>€${(it.q*it.price).toFixed(2)}</td>
      <td><button class="del">✕</button></td>
    </tr>
  `).join("");
  $("#cart-total").textContent = c.reduce((s,x)=>s+x.price*x.q,0).toFixed(2);

  body.onclick = e => {
    const tr = e.target.closest("tr");
    if (!tr) return;
    const i = +tr.dataset.i;
    if (e.target.classList.contains("q")) {
      c[i].q = Math.max(1, c[i].q + +e.target.dataset.d);
    }
    else if (e.target.classList.contains("del")) {
      c.splice(i,1);
    }
    localStorage.setItem("cart", JSON.stringify(c));
    renderCart();
  };
}

/* ============ RENDER FAVORITOS ============ */
async function renderFavorites() {
  const container = $("#favorites-list");
  if (!container) return;
  const token = localStorage.getItem("idToken");
  if (!token) {
    $("#no-favs").textContent = "Inicia sesión para ver favoritos.";
    $("#no-favs").style.display = "block";
    return;
  }
  const res = await fetch(`${API_BASE}/favorites`, {
    headers:{ Authorization: token }
  });
  if (!res.ok) {
    $("#no-favs").textContent = "Error cargando favoritos.";
    $("#no-favs").style.display = "block";
    return;
  }
  const { favorites } = await res.json();
  if (!favorites.length) {
    $("#no-favs").style.display = "block";
    return;
  }
  const all = await fetchProducts();
  const items = all.filter(p => favorites.includes(p.productId));
  container.innerHTML = items.map(p => `
    <div class="card">
      <img src="${p.photo1}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>€${p.price.toFixed(2)}</p>
    </div>
  `).join('');
}

/* ============ INIT ============ */
document.addEventListener("DOMContentLoaded", () => {
  updateAuthUI();

  const path = location.pathname;
  if (path.endsWith("index.html")||path==="/")        loadProducts();
  if (path.endsWith("camisetas.html"))                loadProducts({ category:"Camisetas" });
  if (path.endsWith("sudaderas.html"))                loadProducts({ category:"Sudaderas" });
  if (path.endsWith("otros.html"))                    loadProducts({ category:"Otros" });
  if (path.endsWith("news.html"))                     loadProducts({ new:"yes" });

  renderCart();
  renderFavorites();
});
