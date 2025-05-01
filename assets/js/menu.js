// assets/js/menu.js

document.addEventListener("DOMContentLoaded", () => {
  // ———————————————— CONFIGURACIÓN COGNITO ————————————————
  const COGNITO_DOMAIN = "https://nopayo.auth.us-east-1.amazoncognito.com";
  const CLIENT_ID      = "1vo21r2lgv19fr990puhu46vd2";
  const REDIRECT_URI   = encodeURIComponent("https://nopayo.es/callback.html");
  // ———————————————————————————————————————————————————————————

  // Elementos del menú
  const navMenu    = document.getElementById("nav-menu");
  const navToggle  = document.getElementById("nav-toggle");
  const navClose   = document.getElementById("nav-close");

  // Enlaces de auth
  const liLogin    = document.getElementById("nav-login");
  const liLogout   = document.getElementById("nav-logout");
  const liAccount  = document.getElementById("nav-account");

  // 1) Abrir / cerrar menú hamburguesa
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.add("show-menu");
    });
  }
  if (navClose && navMenu) {
    navClose.addEventListener("click", () => {
      navMenu.classList.remove("show-menu");
    });
  }
  // cerrar al hacer clic en cualquier enlace
  document.querySelectorAll(".nav__link").forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("show-menu");
    });
  });

  // 2) Lógica Login
  liLogin.addEventListener("click", (e) => {
    e.preventDefault();
    const loginUrl =
      `${COGNITO_DOMAIN}/login?` +
      `client_id=${CLIENT_ID}` +
      `&response_type=token` +
      `&scope=openid+email` +
      `&redirect_uri=${REDIRECT_URI}`;
    window.location.href = loginUrl;
  });

  // 3) Lógica Logout
  liLogout.addEventListener("click", (e) => {
    e.preventDefault();
    // 3.1 Borra token
    localStorage.removeItem("idToken");
    // 3.2 Actualiza UI
    updateAuthUI();
  });

  // 4) Actualizar UI según estado de autenticación
  function updateAuthUI() {
    const token = localStorage.getItem("idToken");
    if (token) {
      // usuario autenticado
      liLogin.classList.add("hidden");
      liLogout.classList.remove("hidden");
      liAccount.classList.remove("hidden");
    } else {
      // no autenticado
      liLogin.classList.remove("hidden");
      liLogout.classList.add("hidden");
      liAccount.classList.add("hidden");
    }
  }

  // Ejecutar al inicio
  updateAuthUI();
});
