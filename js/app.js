/**
 * รู้ทันโรคพืช พลัส (Smart Plant Protection & Crop Health Dashboard)
 * แอพพลิเคชันคอนโทรลเลอร์หลัก (Main Application Controller)
 */

const App = (function () {
  let currentFontSize = parseInt(localStorage.getItem('pp_font_size') || '16', 10);
  let currentTheme = localStorage.getItem('pp_theme') || 'light';

  function init() {
    applyTheme(currentTheme);
    applyFontSize(currentFontSize);
    setupNavigation();
    setupGlobalTools();
    updateDashboardStats();
    registerServiceWorker();

    // Initialize sub-modules
    DiagnosisModule.init();
    NutrientsModule.init();
    MoaModule.init();
    CalculatorModule.init();

    // Track local visit counter
    trackVisits();
  }

  function setupNavigation() {
    // Desktop Sidebar & Mobile Bottom Navigation
    document.querySelectorAll('[data-target-view]').forEach(item => {
      item.addEventListener('click', () => {
        const viewId = item.dataset.targetView;
        navigateToView(viewId);
        closeMobileSidebar();
      });
    });

    // Mobile menu drawer button & close button
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('sidebar-close-btn');
    const backdrop = document.getElementById('sidebar-backdrop');
    const sidebar = document.getElementById('app-sidebar');

    function openMobileSidebar() {
      if (sidebar) sidebar.classList.add('open');
      if (backdrop) backdrop.classList.add('active');
    }

    function closeMobileSidebar() {
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
    }

    if (menuBtn) menuBtn.addEventListener('click', openMobileSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeMobileSidebar);
    if (backdrop) backdrop.addEventListener('click', closeMobileSidebar);

    // Close modal on backdrop click or Escape
    const modal = document.getElementById('detail-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) DiagnosisModule.closeDetail();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') DiagnosisModule.closeDetail();
    });
  }

  function navigateToView(viewId) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));

    // Show target view
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update active nav state in sidebar & bottom nav
    document.querySelectorAll('[data-target-view]').forEach(item => {
      if (item.dataset.targetView === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  function setupGlobalTools() {
    // Font sizing
    const btnPlus = document.getElementById('font-plus-btn');
    const btnMinus = document.getElementById('font-minus-btn');

    if (btnPlus) {
      btnPlus.addEventListener('click', () => {
        currentFontSize = Math.min(24, currentFontSize + 2);
        applyFontSize(currentFontSize);
      });
    }

    if (btnMinus) {
      btnMinus.addEventListener('click', () => {
        currentFontSize = Math.max(13, currentFontSize - 2);
        applyFontSize(currentFontSize);
      });
    }

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
      });
    }

    // Fullscreen toggle
    const fullBtn = document.getElementById('fullscreen-btn');
    if (fullBtn) {
      fullBtn.addEventListener('click', toggleFullscreen);
    }

    // Global Search Bar in Top Header
    const globalSearchInput = document.getElementById('global-search-input');
    if (globalSearchInput) {
      globalSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = globalSearchInput.value.trim();
          if (q) {
            navigateToView('diagnosis-view');
            const pestSearch = document.getElementById('pest-search-input');
            if (pestSearch) {
              pestSearch.value = q;
              pestSearch.dispatchEvent(new Event('input'));
            }
          }
        }
      });
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pp_theme', theme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' ? '☀️ โหมดสว่าง' : '🌙 โหมดมืด';
    }
  }

  function applyFontSize(size) {
    document.documentElement.style.setProperty('--fs', size + 'px');
    localStorage.setItem('pp_font_size', size.toString());
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  function updateDashboardStats() {
    const pestStat = document.getElementById('stat-pests-count');
    const nutrientStat = document.getElementById('stat-nutrients-count');
    const moaStat = document.getElementById('stat-moa-count');

    if (pestStat) pestStat.textContent = PESTS_DATA.length;
    if (nutrientStat) nutrientStat.textContent = Object.keys(NUTRIENTS_DATA).length;
    if (moaStat) moaStat.textContent = MOA_DATABASE.length;
  }

  function trackVisits() {
    try {
      const count = Number(localStorage.getItem('pp_visits_count') || 0) + 1;
      localStorage.setItem('pp_visits_count', count.toString());
      const counterEl = document.getElementById('footer-visit-counter');
      if (counterEl) {
        counterEl.textContent = `ยินดีต้อนรับ • เปิดใช้งานบนอุปกรณ์นี้แล้ว ${count.toLocaleString('th-TH')} ครั้ง`;
      }
    } catch {}
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  return {
    init,
    navigateToView
  };
})();

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', App.init);
