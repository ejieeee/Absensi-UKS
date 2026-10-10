/**
 * Shared Navbar & Hamburger Menu Logic (navbar.js)
 * Khusus Portal Sekretaris & Pembina - PMR Wira SMKN 7 Samarinda
 */

(function () {
  'use strict';

  function initNavbar() {
    const hamburgerBtn = document.getElementById('hamburgerToggle');
    const navMenu = document.getElementById('navMenu');

    if (!hamburgerBtn || !navMenu) return;

    function toggleMenu(forceState) {
      const willShow = typeof forceState === 'boolean'
        ? forceState
        : !navMenu.classList.contains('show');

      if (willShow) {
        navMenu.classList.add('show');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        const icon = hamburgerBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('bi-list');
          icon.classList.add('bi-x-lg');
        }
      } else {
        navMenu.classList.remove('show');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        const icon = hamburgerBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('bi-x-lg');
          icon.classList.add('bi-list');
        }
      }
    }

    hamburgerBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu();
    });

    // Tutup menu jika klik di luar navbar
    document.addEventListener('click', function (e) {
      if (navMenu.classList.contains('show')) {
        if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
          toggleMenu(false);
        }
      }
    });

    // Tutup menu jika menekan tombol Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('show')) {
        toggleMenu(false);
      }
    });

    // Tutup menu saat ukuran layar kembali ke desktop (> 768px)
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && navMenu.classList.contains('show')) {
        toggleMenu(false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }
})();
