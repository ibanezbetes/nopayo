/* ================== CONFIG ================== */
const API_BASE = 'https://api.nopayo.es';   // <-- tu API Gateway
/* ============================================ */

/* ========== helpers ========== */
async function getProducts(){
  const r = await fetch(`${API_BASE}/products`,{cache:'no-store'});
  if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}
function ensureLoop(arr){
  if(arr.length===1) arr.push({...arr[0]});
  if(arr.length===2) arr.push(...arr);
  return arr;
}
function tplSlide(p){
  return `
  <article class="home__article swiper-slide" data-id="${p.productId}">
     <img src="${p.photo1}" alt="${p.name}" class="home__img">
     <h2 class="home__product">${p.name}</h2>
     <h3 class="home__price">€${p.price.toFixed(2)}</h3>
  </article>`;
}
function initSwiper(){
  new Swiper('.home__swiper',{
    loop:true,grabCursor:true,slidesPerView:1,
    navigation:{nextEl:'.swiper-button-next',prevEl:'.swiper-button-prev'}
  });
}

/* ========= modal refs ========= */
const $modal = document.getElementById('product-modal');
const $mBack = document.getElementById('modal-backdrop');
const $mClose= document.getElementById('modal-close');
const $mMain = document.getElementById('modal-main-img');
const $mThumbs= document.getElementById('modal-thumbs');
const $mName = document.getElementById('modal-name');
const $mDesc = document.getElementById('modal-description');
const $mPrice= document.getElementById('modal-price');
const $mSize = document.getElementById('modal-size');
const $btnFav= document.getElementById('modal-fav');
const $btnCart=document.getElementById('modal-cart');

/* ========= viewer refs ========= */
const $viewer = document.getElementById('viewer');
const $vBack  = document.getElementById('viewer-backdrop');
const $vClose = document.getElementById('viewer-close');
const $vPrev  = document.getElementById('viewer-prev');
const $vNext  = document.getElementById('viewer-next');
const $vImg   = document.getElementById('viewer-img');

let viewerPhotos = [];
let viewerIdx = 0;

/* ========= funciones ========= */
function openViewer(array,idx){
  viewerPhotos = array;
  viewerIdx = idx;
  $vImg.src = viewerPhotos[viewerIdx];
  $viewer.classList.remove('hidden');
}
function closeViewer(){ $viewer.classList.add('hidden'); }
function nextViewer(step){
  viewerIdx = (viewerIdx + step + viewerPhotos.length) % viewerPhotos.length;
  $vImg.src = viewerPhotos[viewerIdx];
}

function openModal(prod){
  $mName.textContent = prod.name;
  $mDesc.textContent = prod.description;
  $mPrice.textContent= prod.price.toFixed(2);

  const photos = [prod.photo1,prod.photo2,prod.photo3,prod.photo4].filter(Boolean);
  $mMain.src = photos[0] ?? '';
  $mThumbs.innerHTML = photos.map((src,i)=>`
       <img src="${src}" class="${i===0?'active':''}" data-idx="${i}">
  `).join('');

  // thumbs click
  [...$mThumbs.children].forEach(img=>{
    img.onclick = ()=>{
      [...$mThumbs.children].forEach(t=>t.classList.remove('active'));
      img.classList.add('active');$mMain.src = img.src;
    };
  });

  // viewer
  $mMain.onclick = ()=>openViewer(photos,[...$mThumbs.children].findIndex(t=>t.classList.contains('active')));

  // botones fav / cart
  $btnFav.onclick  = ()=>toggleFav(prod.productId);
  $btnCart.onclick = ()=>addCart(prod.productId,$mSize.value);

  $modal.classList.remove('hidden');
}
function closeModal(){ $modal.classList.add('hidden'); }

function toggleFav(id){
  const favs = JSON.parse(localStorage.getItem('favs')||'[]');
  const idx = favs.indexOf(id);
  if(idx>-1){favs.splice(idx,1);alert('Quitado de favoritos');}
  else {favs.push(id);alert('Añadido a favoritos');}
  localStorage.setItem('favs',JSON.stringify(favs));
}
function addCart(id,size){
  const cart = JSON.parse(localStorage.getItem('cart')||'[]');
  cart.push({id,size,qty:1});localStorage.setItem('cart',JSON.stringify(cart));
  alert('Añadido al carrito');
}

/* ========= cerrar overlays ========= */
$mBack.onclick = $mClose.onclick = closeModal;
$vBack.onclick = $vClose.onclick = ()=>closeViewer();
$vPrev.onclick = ()=>nextViewer(-1);
$vNext.onclick = ()=>nextViewer(1);

/* ========= ARRANQUE ========= */
(async()=>{
  const wrap = document.getElementById('home-swiper-wrapper');

  try{
    let prods = await getProducts();
    // filtros de página (si existen variables globales)
    if(window.FILTER_CATEGORY) prods = prods.filter(p=>p.category===FILTER_CATEGORY);
    if(window.FILTER_OTHERS)   prods = prods.filter(p=>!['Camisetas','Sudaderas'].includes(p.category));
    if(window.FILTER_NEW)      prods = prods.filter(p=>p.new==='Yes' || p.new===true);

    prods = ensureLoop(prods);
    wrap.innerHTML = prods.map(tplSlide).join('');
    initSwiper();

    // click slide -> modal
    wrap.addEventListener('click',e=>{
      const art = e.target.closest('.home__article');
      if(!art) return;
      const prod = prods.find(p=>p.productId===art.dataset.id);
      prod && openModal(prod);
    });

  }catch(err){
    console.error(err);
    wrap.innerHTML='<p style="text-align:center;width:100%">No se pudieron cargar los productos.</p>';
  }
})();
