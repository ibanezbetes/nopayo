// assets/js/favoritesLoader.js
export async function fetchFavorites(token) {
    const res = await fetch('https://api.nopayo.es/favorites', {
      headers: {
        Authorization: token
      }
    });
    if (!res.ok) throw new Error(res.statusText);
    // espera [{ productId, name, price, photo1, … }, …]
    return res.json();
  }
  