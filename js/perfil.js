// ── Dados do usuário logado (substituir pela API real) ─────────────────
const USUARIO = {
  nome:       'Maria Rodrigues',
  usuario:    'maria.rodrigues',
  email:      'maria.rodrigues@mello.com.br',
  grupo:      'RH Gestor',
  ultimoAcesso: '24/04/2026 às 08:34',
  acessos: [
    { data:'24/04/2026', hora:'08:34', atual: true  },
    { data:'23/04/2026', hora:'17:52', atual: false },
    { data:'23/04/2026', hora:'08:11', atual: false },
    { data:'22/04/2026', hora:'13:40', atual: false },
    { data:'22/04/2026', hora:'08:05', atual: false },
  ],
  permissoes: [
    { label:'Cadastrar atestados',     icone:'doc'     },
    { label:'Editar atestados',        icone:'editar'  },
    { label:'Ver atestados',           icone:'ver'     },
    { label:'Importar colaboradores',  icone:'upload'  },
    { label:'Ver colaboradores',       icone:'pessoa'  },
    { label:'Cadastrar hospitais',     icone:'hosp'    },
    { label:'Ver relatórios',          icone:'chart'   },
    { label:'Ver dashboard',           icone:'dash'    },
    { label:'Cadastrar usuários',      icone:'user'    },
    { label:'Ver logs',                icone:'log'     },
  ],
};

// ── SVGs das permissões ────────────────────────────────────────────────
const PERM_ICONS = {
  doc:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>`,
  editar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  ver:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  pessoa: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
  hosp:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/><path d="M12 12v4M10 14h4"/></svg>`,
  chart:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  dash:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="6" height="6" rx="1"/><rect x="9" y="3" width="6" height="6" rx="1"/><rect x="16" y="3" width="6" height="6" rx="1"/><rect x="2" y="10" width="6" height="6" rx="1"/><rect x="9" y="10" width="6" height="6" rx="1"/><rect x="16" y="10" width="6" height="6" rx="1"/></svg>`,
  user:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>`,
  log:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
};

// ── Render perfil ──────────────────────────────────────────────────────
function renderPerfil() {
  const u = USUARIO;

  // Avatar e cabeçalho
  document.getElementById('perfilNome').textContent   = u.nome;
  document.getElementById('perfilCargo').textContent  = u.grupo;
  document.getElementById('perfilGrupoBadge').textContent = u.grupo;
  document.getElementById('grupoNome').textContent    = u.grupo;

  // Iniciais no avatar
  const ini = u.nome.split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase();
  document.getElementById('perfilAv').textContent = ini;

  // Dados da conta
  const dados = [
    ['Nome',          u.nome,         'normal'],
    ['Usuário',       u.usuario,      ''],
    ['E-mail',        u.email,        ''],
    ['Grupo',         u.grupo,        'normal'],
    ['Último acesso', u.ultimoAcesso, 'normal'],
  ];
  document.getElementById('dadosLista').innerHTML = dados.map(([k, v, cls]) =>
    `<div class="dado-item">
      <span class="dado-key">${k}</span>
      <span class="dado-val ${cls}">${v}</span>
    </div>`
  ).join('');

  // Permissões
  document.getElementById('permissoesLista').innerHTML = u.permissoes.map(p =>
    `<span class="permissao-badge">
      ${PERM_ICONS[p.icone] || ''}
      ${p.label}
    </span>`
  ).join('');

  // Histórico de acessos
  document.getElementById('acessosLista').innerHTML = u.acessos.map(a =>
    `<div class="acesso-item">
      <div class="acesso-dot ${a.atual ? 'atual' : 'normal'}"></div>
      <div class="acesso-info">
        <div class="acesso-data">${a.data}</div>
        <div class="acesso-hora">às ${a.hora}</div>
      </div>
      ${a.atual ? '<span class="acesso-badge-atual">Atual</span>' : ''}
    </div>`
  ).join('');
}

// ══════════════════════════════════════════════════════════════════════
// MODAL ALTERAR SENHA
// ══════════════════════════════════════════════════════════════════════
const modalSenha     = document.getElementById('modalSenha');
const btnAlterar     = document.getElementById('btnAlterarSenha');
const fecharModal    = document.getElementById('fecharModalSenha');
const cancelarSenha  = document.getElementById('cancelarSenha');
const salvarSenha    = document.getElementById('salvarSenha');
const senhaNova      = document.getElementById('senhaNova');

btnAlterar.addEventListener('click', () => modalSenha.classList.add('open'));
fecharModal.addEventListener('click', fecharModalSenha);
cancelarSenha.addEventListener('click', fecharModalSenha);
modalSenha.addEventListener('click', e => { if (e.target === modalSenha) fecharModalSenha(); });

function fecharModalSenha() {
  modalSenha.classList.remove('open');
  document.getElementById('senhaAtual').value   = '';
  document.getElementById('senhaNova').value    = '';
  document.getElementById('senhaConfirma').value = '';
  document.getElementById('forcaSenha').innerHTML = '';
  ['reqTamanho','reqNumero','reqEspecial'].forEach(id => {
    document.getElementById(id).classList.remove('ok');
  });
}

// ── Toggle mostrar/ocultar senha ───────────────────────────────────────
document.querySelectorAll('.toggle-senha').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    input.type  = input.type === 'password' ? 'text' : 'password';
  });
});

// ── Força da senha ─────────────────────────────────────────────────────
senhaNova.addEventListener('input', () => {
  const val  = senhaNova.value;
  const wrap = document.getElementById('forcaSenha');

  const temTamanho  = val.length >= 8;
  const temNumero   = /\d/.test(val);
  const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);

  // Atualizar requisitos
  document.getElementById('reqTamanho').classList.toggle('ok', temTamanho);
  document.getElementById('reqNumero').classList.toggle('ok', temNumero);
  document.getElementById('reqEspecial').classList.toggle('ok', temEspecial);

  // Barras de força
  const forca = [temTamanho, temNumero, temEspecial].filter(Boolean).length;
  const classes = ['', 'fraca', 'media', 'forte'];
  wrap.innerHTML = Array(3).fill(0).map((_, i) =>
    `<div class="forca-barra ${i < forca ? classes[forca] : ''}"></div>`
  ).join('');
});

// ── Salvar nova senha ──────────────────────────────────────────────────
salvarSenha.addEventListener('click', () => {
  const atual    = document.getElementById('senhaAtual').value;
  const nova     = document.getElementById('senhaNova').value;
  const confirma = document.getElementById('senhaConfirma').value;

  if (!atual) {
    document.getElementById('senhaAtual').classList.add('error');
    setTimeout(() => document.getElementById('senhaAtual').classList.remove('error'), 1500);
    return;
  }
  if (nova.length < 8) {
    document.getElementById('senhaNova').classList.add('error');
    setTimeout(() => document.getElementById('senhaNova').classList.remove('error'), 1500);
    return;
  }
  if (nova !== confirma) {
    document.getElementById('senhaConfirma').classList.add('error');
    setTimeout(() => document.getElementById('senhaConfirma').classList.remove('error'), 1500);
    return;
  }

  fecharModalSenha();
  mostrarToast('Senha alterada com sucesso!');
});

// ── Toast ──────────────────────────────────────────────────────────────
function mostrarToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>${msg}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 2500);
}

// ── Sidebar mobile ─────────────────────────────────────────────────────
const sidebar        = document.getElementById('sidebar');
const menuToggle     = document.getElementById('menuToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');
menuToggle.addEventListener('click', () => { sidebar.classList.toggle('open'); sidebarOverlay.classList.toggle('open'); });
sidebarOverlay.addEventListener('click', () => { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); });

// ── Init ───────────────────────────────────────────────────────────────
renderPerfil();