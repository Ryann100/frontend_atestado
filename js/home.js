// ── Toggle sidebar (mobile) ───────────────────────────────────────────
const sidebar        = document.getElementById('sidebar');
const menuToggle     = document.getElementById('menuToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('open');
});

sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
});

// ── Fechar sidebar ao clicar num item (mobile) ────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('open');
    }
  });
});

// ── Saudação dinâmica ─────────────────────────────────────────────────
const hora = new Date().getHours();
const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
const titleEl  = document.querySelector('.topbar-title');
if (titleEl) {
  titleEl.textContent = `${saudacao}, Maria 👋`;
}

// ── Data dinâmica ─────────────────────────────────────────────────────
const subEl = document.querySelector('.topbar-sub');
if (subEl) {
  const hoje = new Date();
  subEl.textContent = hoje.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}
