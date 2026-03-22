// ==================== TOGGLE THEME ====================
function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById('btn-theme');
  if (body.classList.contains('dark')) {
    body.classList.remove('dark');
    body.classList.add('light');
    btn.textContent = '☀️';
    localStorage.setItem('crabcode-theme', 'light');
  } else {
    body.classList.remove('light');
    body.classList.add('dark');
    btn.textContent = '🌙';
    localStorage.setItem('crabcode-theme', 'dark');
  }
}

// Load theme
function loadTheme() {
  const theme = localStorage.getItem('crabcode-theme') || 'dark';
  document.body.classList.remove('dark', 'light');
  document.body.classList.add(theme);
  document.getElementById('btn-theme').textContent = theme === 'dark' ? '🌙' : '☀️';
}


export { toggleTheme, loadTheme };
