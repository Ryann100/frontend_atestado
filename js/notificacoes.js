// ── Dados de notificações ──────────────────────────────────────────────
let NOTIFICACOES = [
  {
    id: 1, lida: false, prioridade: 'urgente',
    titulo: 'CID F detectado — João Ribeiro',
    desc: 'Atestado cadastrado com CID F32 (NRI). Requer revisão antes de finalizar.',
    tempo: 'há 2 horas',
    link: 'atestados.html', linkTexto: 'Ver atestado',
    icone: 'alerta',
  },
  {
    id: 2, lida: false, prioridade: 'urgente',
    titulo: 'CID F detectado — Camila Ferreira',
    desc: 'Atestado cadastrado com CID F41 (NRI). Requer revisão antes de finalizar.',
    tempo: 'há 3 horas',
    link: 'atestados.html', linkTexto: 'Ver atestado',
    icone: 'alerta',
  },
  {
    id: 3, lida: false, prioridade: 'atencao',
    titulo: 'Retorno previsto amanhã — Carlos Mota',
    desc: 'O colaborador Carlos Mota tem retorno previsto para amanhã, 24/04/2026.',
    tempo: 'há 4 horas',
    link: 'colaboradores.html?mat=00891', linkTexto: 'Ver ficha',
    icone: 'relogio',
  },
  {
    id: 4, lida: false, prioridade: 'atencao',
    titulo: 'CRM irregular — Dr. Paulo Henrique',
    desc: 'CRM/SP 98765 não localizado no CFM. Atestados vinculados devem ser revisados.',
    tempo: 'há 5 horas',
    link: 'hospitais.html', linkTexto: 'Ver médicos',
    icone: 'aviso',
  },
  {
    id: 5, lida: false, prioridade: 'info',
    titulo: 'Importação de planilha concluída',
    desc: '3 colaboradores atualizados: 1 novo, 1 alteração de cargo, 1 desligamento.',
    tempo: 'há 6 horas',
    link: 'lista-colaboradores.html', linkTexto: 'Ver colaboradores',
    icone: 'check',
  },
  {
    id: 6, lida: true, prioridade: 'info',
    titulo: 'Novo atestado cadastrado — Ana Paula Santos',
    desc: 'Atestado médico (J06) cadastrado para competência Abr/2025.',
    tempo: 'ontem às 14h',
    link: 'atestados.html', linkTexto: 'Ver atestado',
    icone: 'doc',
  },
  {
    id: 7, lida: true, prioridade: 'info',
    titulo: 'Atestado editado — Marcos Lima',
    desc: 'O atestado de licença luto foi editado por Maria Rodrigues.',
    tempo: 'ontem às 10h',
    link: 'atestados.html', linkTexto: 'Ver atestado',
    icone: 'doc',
  },
  {
    id: 8, lida: true, prioridade: 'atencao',
    titulo: 'Reincidência detectada — João Ribeiro',
    desc: 'João Ribeiro acumula 4 atestados no período — padrão de reincidência identificado.',
    tempo: 'há 2 dias',
    link: 'colaboradores.html?mat=00734', linkTexto: 'Ver ficha',
    icone: 'aviso',
  },
  {
    id: 9, lida: true, prioridade: 'info',
    titulo: 'Novo colaborador cadastrado — Patricia Oliveira',
    desc: 'Importação de planilha incluiu novo colaborador: matrícula 01601, setor Logística.',
    tempo: 'há 3 dias',
    link: 'lista-colaboradores.html', linkTexto: 'Ver colaboradores',
    icone: 'pessoa',
  },
];

// ── Estado ─────────────────────────────────────────────────────────────
let filtroAtivo = 'todas';

// ── Ícones SVG por tipo ────────────────────────────────────────────────
const ICONES = {
  alerta: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  aviso:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  relogio:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  check:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  doc:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>`,
  pessoa: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
};

const PRIORIDADE_LABEL = { urgente:'Urgente', atencao:'Atenção', info:'Info', sucesso:'Sucesso' };
const ICONE_CLASSE     = { urgente:'urgente', atencao:'atencao', info:'info', sucesso:'sucesso' };

// ── Filtrar ────────────────────────────────────────────────────────────
function filtrar() {
  switch (filtroAtivo) {
    case 'nao-lidas': return NOTIFICACOES.filter(n => !n.lida);
    case 'urgente':   return NOTIFICACOES.filter(n => n.prioridade === 'urgente');
    case 'atencao':   return NOTIFICACOES.filter(n => n.prioridade === 'atencao');
    case 'info':      return NOTIFICACOES.filter(n => n.prioridade === 'info');
    default:          return NOTIFICACOES;
  }
}

// ── Render ─────────────────────────────────────────────────────────────
function render() {
  const lista   = filtrar();
  const naoLidas = NOTIFICACOES.filter(n => !n.lida).length;
  const sub      = naoLidas > 0 ? `${naoLidas} não lida(s)` : 'Tudo em dia ✓';
  document.getElementById('topbarSub').textContent = sub;

  const container = document.getElementById('notifLista');
  const empty     = document.getElementById('notifEmpty');

  if (lista.length === 0) {
    container.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  container.innerHTML = lista.map(n => {
    const cls       = ICONE_CLASSE[n.prioridade] || 'info';
    const dotColor  = { urgente:'var(--danger)', atencao:'#e67e22', info:'#4a9fd9', sucesso:'#2ecc71' }[n.prioridade];
    const corBorda  = dotColor;

    return `<div class="notif-item ${n.lida ? 'lida' : 'nao-lida'}"
              style="--prioridade-cor:${corBorda}"
              data-id="${n.id}"
              onclick="marcarLida(${n.id})">

      <div class="notif-icone ${cls}">
        ${ICONES[n.icone] || ICONES.doc}
      </div>

      <div class="notif-conteudo">
        <div class="notif-topo">
          <div class="notif-titulo">${n.titulo}</div>
          <div class="notif-tempo">${n.tempo}</div>
        </div>
        <div class="notif-desc">${n.desc}</div>
        <div class="notif-rodape">
          <div style="display:flex;align-items:center;gap:8px">
            <span class="notif-badge ${cls}">${PRIORIDADE_LABEL[n.prioridade]}</span>
            ${!n.lida ? `<div class="notif-dot-lida" style="background:${dotColor}"></div>` : ''}
          </div>
          <a href="${n.link}" class="notif-link" onclick="event.stopPropagation()">${n.linkTexto} →</a>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── Marcar como lida ───────────────────────────────────────────────────
window.marcarLida = (id) => {
  const n = NOTIFICACOES.find(n => n.id === id);
  if (n) n.lida = true;
  render();
};

// ── Marcar todas ───────────────────────────────────────────────────────
document.getElementById('btnMarcarTodas').addEventListener('click', () => {
  NOTIFICACOES.forEach(n => n.lida = true);
  render();
});

// ── Tabs de filtro ─────────────────────────────────────────────────────
document.querySelectorAll('.filtro-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtro-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtroAtivo = btn.dataset.filtro;
    render();
  });
});

// ── Sidebar mobile ─────────────────────────────────────────────────────
const sidebar        = document.getElementById('sidebar');
const menuToggle     = document.getElementById('menuToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');
menuToggle.addEventListener('click', () => { sidebar.classList.toggle('open'); sidebarOverlay.classList.toggle('open'); });
sidebarOverlay.addEventListener('click', () => { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); });

// ── Init ───────────────────────────────────────────────────────────────
render();