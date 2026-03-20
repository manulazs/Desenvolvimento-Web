document.addEventListener('DOMContentLoaded', () => {
  // Navegação ativa
  document.querySelectorAll('.main-nav .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.main-nav .nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Menu mobile simples
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.main-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    });
  }
});
