(() => {
  const root = document.documentElement;
  const storageKey = 'sningenia-theme';
  const isSerbian = root.lang === 'sr';
  const labels = isSerbian
    ? { dark: 'Prebaci na svetlu temu', light: 'Prebaci na tamnu temu' }
    : { dark: 'Switch to light mode', light: 'Switch to dark mode' };
  let theme = 'dark';

  const applyTheme = (nextTheme) => {
    theme = nextTheme === 'light' ? 'light' : 'dark';
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#18181C' : '#F7F5FF');
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-label', labels[theme]);
      button.title = labels[theme];
    });
  };

  // Run before styles load so a saved light theme never flashes dark.
  try {
    theme = localStorage.getItem(storageKey) === 'light' ? 'light' : 'dark';
  } catch {
    // Theme switching still works when browser storage is unavailable.
  }
  applyTheme(theme);

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        applyTheme(theme === 'dark' ? 'light' : 'dark');
        try {
          localStorage.setItem(storageKey, theme);
        } catch {
          // Keep the selected theme for this page even if it cannot be saved.
        }
      });
    });
    applyTheme(theme);
    root.classList.add('theme-ready');
  });

  window.addEventListener('storage', (event) => {
    if (event.key === storageKey || event.key === null) applyTheme(event.newValue);
  });
})();
