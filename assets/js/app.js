// assets/js/app.js

// ── Helpers ───────────────────────────────────────────────────────────────
const $ = selector => document.querySelector(selector);

// ── Gestión de UI de Login/Logout/Account ─────────────────────────────────
function updateAuthUI() {
  const logged = !!localStorage.getItem('idToken');
  $('#nav-login').classList.toggle('hidden', logged);
  $('#nav-logout').classList.toggle('hidden', !logged);
  $('#nav-account').classList.toggle('hidden', !logged);
}

// ── Carrito en localStorage ────────────────────────────────────────────────
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// ── Renderizado de la tabla del carrito ────────────────────────────────────
function renderCart() {
  const body = $('#cart-body');
  const cart = getCart();
  // Genero cada fila
  body.innerHTML = cart.map((item, i) => `
    <tr data-index="${i}">
      <td>${item.name}</td>
      <td>${item.size}</td>
      <td>
        <button class="qty-btn" data-dir="-1" data-index="${i}">−</button>
        ${item.quantity}
        <button class="qty-btn" data-dir="1"  data-index="${i}">+</button>
      </td>
      <td>€${(item.price * item.quantity).toFixed(2)}</td>
      <td><button class="del-btn" data-index="${i}">✕</button></td>
    </tr>
  `).join('');

  // Calcula y pinta total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  $('#cart-total').textContent = total.toFixed(2);

  // Listeners de + / − cantidad
  body.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      const dir = Number(btn.dataset.dir);
      const c   = getCart();
      c[idx].quantity = Math.max(1, c[idx].quantity + dir);
      saveCart(c);
      renderCart();
    });
  });

  // Listeners de eliminar
  body.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      const c   = getCart();
      c.splice(idx, 1);
      saveCart(c);
      renderCart();
    });
  });
}

// ── Arranque ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Actualiza Nav (login/logout/account)
  updateAuthUI();

  // Rellena la tabla del carrito
  renderCart();

  // Botón checkout
  $('#checkout-btn').addEventListener('click', () => {
    window.location.href = 'checkout.html';
  });
});
