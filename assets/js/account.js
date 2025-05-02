// assets/js/account.js
const API_BASE = 'https://api.nopayo.es';
const token    = localStorage.getItem('idToken');

if (!token) {
  // si no está autenticado, redirigir al login
  window.location.href = 'index.html';
}

async function fetchProfile() {
  const res = await fetch(`${API_BASE}/user`, {
    headers: { Authorization: token }
  });
  if (!res.ok) throw new Error('Error al obtener perfil');
  return res.json();
}

async function saveProfile(profile) {
  const res = await fetch(`${API_BASE}/user`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify(profile)
  });
  if (!res.ok) throw new Error('Error guardando perfil');
  return res.json();
}

async function fetchOrders() {
  const res = await fetch(`${API_BASE}/orders`, {
    headers: { Authorization: token }
  });
  if (!res.ok) throw new Error('Error al obtener pedidos');
  return res.json(); // [{ orderId, date, total, items: [...] }, …]
}

function renderOrders(orders) {
  const ul = document.getElementById('orders-list');
  if (orders.length === 0) {
    ul.innerHTML = '<li>No tienes pedidos aún.</li>';
    return;
  }
  ul.innerHTML = orders.map(o => `
    <li class="order-item" data-id="${o.orderId}">
      <strong>Pedido ${o.orderId}</strong> — ${new Date(o.date).toLocaleString()} — €${o.total.toFixed(2)}
    </li>
  `).join('');
  // click en cada pedido para detalles
  document.querySelectorAll('.order-item').forEach(li => {
    li.addEventListener('click', async () => {
      const id = li.dataset.id;
      try {
        const res = await fetch(`${API_BASE}/orders/${id}`, {
          headers: { Authorization: token }
        });
        if (!res.ok) throw new Error();
        const order = await res.json();
        // mostrar detalles (puedes usar alert o un modal)
        alert(
          `Pedido ${order.orderId}\nFecha: ${new Date(order.date).toLocaleString()}\n` +
          order.items.map(i => `${i.name} x${i.quantity} — €${i.price.toFixed(2)}`).join('\n') +
          `\nTotal: €${order.total.toFixed(2)}`
        );
      } catch {
        alert('Error cargando detalles del pedido.');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Rellenar perfil
  try {
    const prof = await fetchProfile();
    document.getElementById('profile-email').value   = prof.email || '';
    document.getElementById('profile-street').value  = prof.address?.street || '';
    document.getElementById('profile-number').value  = prof.address?.number || '';
    document.getElementById('profile-door').value    = prof.address?.door   || '';
    document.getElementById('profile-phone').value   = prof.phone || '';
  } catch (err) {
    console.error(err);
    alert('No se pudo cargar su perfil.');
  }

  // 2) Guardar perfil al enviar form
  document.getElementById('profile-form').addEventListener('submit', async e => {
    e.preventDefault();
    const profile = {
      address: {
        street: document.getElementById('profile-street').value.trim(),
        number: document.getElementById('profile-number').value.trim(),
        door:   document.getElementById('profile-door').value.trim()
      },
      phone: document.getElementById('profile-phone').value.trim()
    };
    try {
      await saveProfile(profile);
      alert('Perfil actualizado.');
    } catch (err) {
      console.error(err);
      alert('Error al guardar perfil.');
    }
  });

  // 3) Cargar y mostrar pedidos
  try {
    const orders = await fetchOrders();
    renderOrders(orders);
  } catch (err) {
    console.error(err);
    const ul = document.getElementById('orders-list');
    ul.innerHTML = '<li>Error cargando pedidos.</li>';
  }
});
