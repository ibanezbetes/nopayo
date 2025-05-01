/* ===========================================================================
   BACK-END
   ========================================================================== */
   const API_BASE = 'https://api.nopayo.es';     // ← tu API Gateway
   /* ========================================================================== */
   
   /* =========  UTILIDADES COMUNES (idénticas a home.js)  ========= */
   async function getProducts () {
     const res = await fetch(`${API_BASE}/products`, { cache: 'no-store' });
     if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
     return res.json();
   }
   
   function normalizaSlides (items) {
     if (items.length === 1) items.push({ ...items[0] });
     if (items.length === 2) items.push(...items);
     return items;
   }
   
   function buildSlides (items) {
     return items
       .map(
         (p) => `
         <article class="home__article swiper-slide">
           <img src="${p.photo1}" alt="${p.name}" class="home__img"/>
           <h2 class="home__product">${p.name}</h2>
           <h3 class="home__price">€${p.price.toFixed(2)}</h3>
         </article>`
       )
       .join('');
   }
   
   function initSwiper () {
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
   
   /* =========  ARRANQUE  ========= */
   (async () => {
     const wrapper = document.getElementById('home-swiper-wrapper');
   
     try {
       let productos = await getProducts();
   
       /* ========  FILTRO SEGÚN LA PÁGINA  ======== */
       /*   Estas variables quedan definidas en cada HTML                */
       if (window.FILTER_CATEGORY) {
         productos = productos.filter(
           (p) => p.category === window.FILTER_CATEGORY
         );
       }
   
       if (window.FILTER_OTHERS) {
         productos = productos.filter(
           (p) => p.category !== 'Camisetas' && p.category !== 'Sudaderas'
         );
       }
   
       if (window.FILTER_NEW) {
         productos = productos.filter(
           (p) => p.new === 'Yes' || p.new === true
         );
       }
       /* ============================================================= */
   
       const items = normalizaSlides(productos);
       wrapper.innerHTML = buildSlides(items);
       initSwiper();
     } catch (err) {
       console.error('Error cargando productos:', err);
       wrapper.innerHTML =
         '<p style="text-align:center;width:100%">No se pudieron cargar los productos.</p>';
     }
   })();
   