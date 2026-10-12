/**
 * Shared Navbar & Sidebar Drawer Logic (navbar.js)
 * PMR Wira SMKN 7 Samarinda
 */
(function () {
  'use strict';

  function getBackdrop() {
    let backdrop = document.getElementById('navBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'navBackdrop';
      backdrop.className = 'mobile-nav-backdrop';
      document.body.appendChild(backdrop);
      backdrop.addEventListener('click', closeMenu);
    }
    return backdrop;
  }

  function openMenu() {
    const navMenu = document.getElementById('navMenu');
    const hamburgerBtn = document.getElementById('hamburgerToggle');
    const backdrop = getBackdrop();

    if (navMenu) navMenu.classList.add('show');
    if (backdrop) backdrop.classList.add('show');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    const navMenu = document.getElementById('navMenu');
    const hamburgerBtn = document.getElementById('hamburgerToggle');
    const backdrop = document.getElementById('navBackdrop');

    if (navMenu) navMenu.classList.remove('show');
    if (backdrop) backdrop.classList.remove('show');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu && navMenu.classList.contains('show')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  window.toggleNavMenu = toggleMenu;
  window.openNavMenu = openMenu;
  window.closeNavMenu = closeMenu;

  function init() {
    const hamburgerBtn = document.getElementById('hamburgerToggle');
    const drawerCloseBtn = document.getElementById('drawerCloseBtn');

    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
      });
    }

    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', function (e) {
        e.preventDefault();
        closeMenu();
      });
    }

    // Tutup saat mengklik salah satu link menu
    const navLinks = document.querySelectorAll('#navMenu a');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Tutup dengan tombol ESC keyboard
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeMenu();
      }
    });

    // Tutup otomatis jika layar di-resize kembali ke desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 992) {
        closeMenu();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();