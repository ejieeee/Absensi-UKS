/**
 * Core UI Logic for PMR Wira SMKN 7 Samarinda System
 * Handles sidebar toggles, mobile drawer, toasts, modals, and date display.
 */

document.addEventListener('DOMContentLoaded', () => {
  initDateDisplay();
  initSidebar();
  initMobileNav();
  initProfileDropdown();
  initActiveNavLink();
});

// Format current date in Indonesian
function initDateDisplay() {
  const dateElements = document.querySelectorAll('[data-current-date]');
  if (!dateElements.length) return;

  const now = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const formattedDate = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  dateElements.forEach(el => {
    el.textContent = formattedDate;
  });
}

// Collapsible Desktop Sidebar
function initSidebar() {
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  if (!toggleBtn) return;

  // Restore saved preference if any
  const isCollapsed = localStorage.getItem('pmr_sidebar_collapsed') === 'true';
  if (isCollapsed && window.innerWidth > 992) {
    document.body.classList.add('sidebar-collapsed');
  }

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-collapsed');
    const state = document.body.classList.contains('sidebar-collapsed');
    localStorage.setItem('pmr_sidebar_collapsed', state ? 'true' : 'false');
  });
}

// Mobile Drawer Navigation
function initMobileNav() {
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const backdrop = document.getElementById('mobileBackdrop');

  if (!mobileToggle || !backdrop) return;

  mobileToggle.addEventListener('click', () => {
    document.body.classList.add('mobile-menu-open');
    backdrop.classList.add('show');
  });

  backdrop.addEventListener('click', closeMobileMenu);

  // Close when pressing Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('mobile-menu-open')) {
      closeMobileMenu();
    }
  });
}

function closeMobileMenu() {
  document.body.classList.remove('mobile-menu-open');
  const backdrop = document.getElementById('mobileBackdrop');
  if (backdrop) backdrop.classList.remove('show');
}

// Profile Dropdown Menu
function initProfileDropdown() {
  const profileBtn = document.getElementById('profileBtn');
  const profileMenu = document.getElementById('profileMenu');

  if (!profileBtn || !profileMenu) return;

  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
      profileMenu.classList.remove('show');
    }
  });
}

// Mark Current Active Link in Sidebar
function initActiveNavLink() {
  let rawPath = window.location.pathname.replace(/\\/g, '/');
  let currentPath = (rawPath.split('/').pop() || 'index.html').split('?')[0].split('#')[0];
  if (!currentPath || currentPath === '') currentPath = 'index.html';

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Global Toast Notification Helper
function showToast(title, message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconClass = 'bi-check-circle-fill';
  if (type === 'warning') iconClass = 'bi-exclamation-triangle-fill';
  if (type === 'danger') iconClass = 'bi-x-circle-fill';
  if (type === 'info') iconClass = 'bi-info-circle-fill';

  toast.innerHTML = `
    <i class="bi ${iconClass} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Global Modal Helper
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

// Global Modal Backdrop Close & ESC
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('show');
    document.body.style.overflow = '';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const activeModals = document.querySelectorAll('.modal-overlay.show');
    activeModals.forEach(modal => {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    });
  }
});

// Expose globally
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
