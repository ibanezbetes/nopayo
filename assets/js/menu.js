// assets/js/menu.js
document.addEventListener('DOMContentLoaded', () => {
  const navMenu    = document.getElementById('nav-menu'),
        navToggle  = document.getElementById('nav-toggle'),
        navClose   = document.getElementById('nav-close'),
        navLogin   = document.getElementById('nav-login'),
        navLogout  = document.getElementById('nav-logout'),
        navAccount = document.getElementById('nav-account');

  // Hamburguesa
  if (navToggle) navToggle.addEventListener('click', () => navMenu.classList.add('show-menu'));
  if (navClose)  navClose .addEventListener('click', () => navMenu.classList.remove('show-menu'));
  document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('show-menu'));
  });

  // Estado de sesión
  const token = localStorage.getItem('idToken');
  if (token) {
    navLogin.classList.add('hidden');
    navLogout.classList.remove('hidden');
    navAccount.classList.remove('hidden');
  } else {
    navLogin.classList.remove('hidden');
    navLogout.classList.add('hidden');
    navAccount.classList.add('hidden');
  }

  // Redirección a Cognito
  const COGNITO_DOMAIN = 'https://nopayo.auth.us-east-1.amazoncognito.com',
        CLIENT_ID      = '1vo21r2lgv19fr990puhu46vd2',
        REDIRECT_URI   = 'https://nopayo.es/callback.html',
        LOGOUT_URI     = 'https://nopayo.es/logout.html';

  document.querySelector('#nav-login a')?.addEventListener('click', () => {
    window.location.href = `${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=token&scope=openid+email&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  });
  document.querySelector('#nav-logout a')?.addEventListener('click', () => {
    localStorage.removeItem('idToken');
    window.location.href = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(LOGOUT_URI)}`;
  });
});
