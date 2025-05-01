/* =================  Config AWS  ================== */
const COGNITO_DOMAIN = 'https://nopayo.auth.us-east-1.amazoncognito.com';
const CLIENT_ID      = '1vo21r2lgv19fr990puhu46vd2';
const REDIRECT_URI   = 'https://nopayo.es/callback.html';
const LOGOUT_URI     = 'https://nopayo.es/logout.html';
const API_BASE       = 'https://api.nopayo.es';

/* =================  Utilidades  ================== */
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const qs = k => new URLSearchParams(location.search).get(k);
const cart = () => JSON.parse(localStorage.getItem('cart') || '[]');
const save = c => { localStorage.setItem('cart', JSON.stringify(c)); updateCounter(); };
const updateCounter = () => $('#cart-count')?.textContent = cart().length;

/* =================  Auth UI  ===================== */
function authUI(){
  const t = localStorage.getItem('idToken');
  $('#btn-login')?.classList.toggle('d-none', !!t);
  $('#btn-logout')?.classList.toggle('d-none', !t);
}
$('#btn-login')?.addEventListener('click', ()=>{
  location = `${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=token&scope=openid+email&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
});
$('#btn-logout')?.addEventListener('click', ()=>{
  location = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(LOGOUT_URI)}`;
});

/* =================  Productos  =================== */
async function fetchProducts(){
  const r = await fetch(`${API_BASE}/products`);
  if(!r.ok) throw new Error(r.status);
  return r.json();
}
function cardHTML(p){
  return `<div class="card">
    <img src="${p.photo1}" alt="${p.name}">
    <h4>${p.name}</h4>
    <p class="small">${p.description}</p>
    <p><strong>€${p.price.toFixed(2)}</strong></p>
    <select class="form-select sel-size">
      <option value="">Talla…</option>
      <option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option>
    </select>
    <button class="btn btn-dark add-btn"
            data-id="${p.productId}" data-name="${p.name}"
            data-price="${p.price}" data-img="${p.photo1}">
      Añadir 🛒
    </button>
  </div>`;
}
function bindGridEvents(grid){
  grid.querySelectorAll('.add-btn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const card = e.target.closest('.card');
      const size = card.querySelector('.sel-size').value;
      if(!size){alert('Selecciona talla');return;}
      const {id,name,price,img} = e.target.dataset;
      const c = cart(); c.push({id,name,price:+price,img,size,q:1});
      save(c); alert('Añadido al carrito');
    });
  });
}
async function renderGrid(){
  const grid = $('#grid'); if(!grid) return;
  try{
    const all = await fetchProducts();
    const cat = qs('category');
    $('#cat-title')?.textContent = cat || '';
    const list = cat ? all.filter(p=>p.category===cat) : all;
    grid.innerHTML = list.map(cardHTML).join('');
    bindGridEvents(grid);
  }catch(err){
    grid.innerHTML = '<p>Error cargando productos.</p>';
    console.error(err);
  }
}

/* =================  Carrito  ===================== */
const sub = it => it.price * it.q;
const tot = arr => arr.reduce((t,x)=>t + sub(x),0);
function row(it,i){
  return `<tr data-i="${i}">
    <td>${it.name}</td><td>${it.size}</td>
    <td>
      <button class="q" data-d="-1">−</button>
      ${it.q}
      <button class="q" data-d="1">+</button>
    </td>
    <td>€${sub(it).toFixed(2)}</td>
    <td><button class="del">✕</button></td>
  </tr>`;
}
function renderCart(){
  const body = $('#cart-body'); if(!body) return;
  const c = cart();
  body.innerHTML = c.map(row).join('');
  $('#cart-total')?.textContent = tot(c).toFixed(2);
  body.onclick = e =>{
    const tr = e.target.closest('tr'); if(!tr) return;
    const idx = +tr.dataset.i; const arr = cart();
    if(e.target.classList.contains('q')){
      arr[idx].q = Math.max(1, arr[idx].q + +e.target.dataset.d);
    }else if(e.target.classList.contains('del')){
      arr.splice(idx,1);
    }
    save(arr); renderCart();
  };
}

/* =================  Init  ======================== */
document.addEventListener('DOMContentLoaded', ()=>{
  authUI(); updateCounter();
  if($('#grid'))      renderGrid();
  if($('#cart-body')) renderCart();
});
