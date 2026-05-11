// ── Init ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  carregarUsuario();
  carregarHome();
  carregarUltimoAcidente();
});

// ── Usuário logado ─────────────────────────────────────────────────────
function carregarUsuario() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const nome = usuario.nome || 'Usuário';

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const primeiro = nome.split(' ')[0];
  const iniciais = nome.split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('');

  const titleEl = document.querySelector('.topbar-title');
  if (titleEl) titleEl.textContent = `${saudacao}, ${primeiro} 👋`;

  const avatarEl = document.querySelector('.topbar-avatar');
  if (avatarEl) avatarEl.textContent = iniciais;

  const subEl = document.querySelector('.topbar-sub');
  if (subEl) {
    subEl.textContent = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  const badge = document.getElementById('competenciaBadge');
  if (badge) {
    const hoje = new Date();
    const nomeMes = hoje.toLocaleDateString('pt-BR', { month: 'numeric', year: 'numeric' });
    badge.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      Competência Atual: ${nomeMes}
    `;
  }
}

// ── Cores dos avatares ─────────────────────────────────────────────────
const CORES = ['#e03040', '#2e6da4', '#8e44ad', '#e67e22', '#27ae60', '#16a085', '#d35400', '#2980b9'];
function corAvatar(nome) {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return CORES[Math.abs(hash) % CORES.length];
}
function iniciaisAvatar(nome) {
  return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

// ── Helpers ────────────────────────────────────────────────────────────
function formatarData(dataStr) {
  if (!dataStr) return '—';
  return new Date(dataStr).toLocaleDateString('pt-BR');
}

function formatarPeriodo(inicio, fim) {
  const ini = new Date(inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  if (!fim) return ini;
  const fimStr = new Date(fim).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return `${ini} – ${fimStr}`;
}

function badgeStatus(cid) {
  if (cid && cid.startsWith('F')) return `<span class="badge badge-warn">Revisar</span>`;
  return `<span class="badge badge-ok">OK</span>`;
}

function cidHtml(cid) {
  if (!cid) return '—';
  if (cid.startsWith('F')) return `<span class="cid-nri">${cid} ⚠</span>`;
  return cid;
}

function getCompetenciaAtual() {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  return `${hoje.getFullYear()}/${mes}`;
}

// ── Carregar home ──────────────────────────────────────────────────────
async function carregarHome() {
  const tbody = document.getElementById('tbodyHome');

  try {
    const [resAtestados, resColaboradores, resTipos] = await Promise.all([
      fetch('https://api-atestado.onrender.com/atestado/'),
      fetch('https://api-atestado.onrender.com/colaborador/'),
      fetch('https://api-atestado.onrender.com/tipo-atestado/')
    ]);

    const atestados = await resAtestados.json();
    const colaboradores = await resColaboradores.json();
    const tipos = await resTipos.json();

    const mapaColabs = {};
    colaboradores.forEach(c => { mapaColabs[c.matricula] = c; });

    const mapaTipos = {};
    tipos.forEach(t => { mapaTipos[t.id] = t; });

    const enriquecidos = atestados.map(a => ({
      id: a.id,
      matricula: a.matricula,
      colaborador: mapaColabs[a.matricula]?.nome || a.matricula,
      tipo: mapaTipos[a.tipoId]?.tipo || '—',
      emissao: a.dataEmissao,
      inicio: a.dataInicio,
      fim: a.dataFim,
      dias: a.quantidadeDias,
      cid: a.cid,
      competencia: a.competencia,
    }));

    // ── Cards ──────────────────────────────────────────────────────────
    const competencia = getCompetenciaAtual();
    const doMes = enriquecidos.filter(a => a.competencia === competencia);
    const comparecimentos = doMes.filter(a => a.tipo.toLowerCase().includes('comparecimento')).length;
    const diasAfastamento = doMes.reduce((s, a) => s + (a.dias || 0), 0);
    const pendentes = doMes.filter(a => a.cid && a.cid.startsWith('F')).length;

    document.getElementById('card-atestados').textContent = doMes.length;
    document.getElementById('card-comparecimentos').textContent = comparecimentos;
    document.getElementById('card-dias').textContent = diasAfastamento;
    document.getElementById('card-pendentes').textContent = pendentes;

    // ── Tabela (últimos 5) ─────────────────────────────────────────────
    const ultimos = [...enriquecidos]
      .sort((a, b) => new Date(b.emissao) - new Date(a.emissao))
      .slice(0, 5);

    if (ultimos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">Nenhum atestado encontrado.</td></tr>';
      return;
    }

    tbody.innerHTML = ultimos.map(a => `
      <tr onclick="location.href='detalhe-atestado.html?id=${a.id}'">
        <td>
          <div class="collab">
            <div class="collab-av" style="--c:${corAvatar(a.colaborador)}">${iniciaisAvatar(a.colaborador)}</div>
            ${a.colaborador}
          </div>
        </td>
        <td>${a.tipo}</td>
        <td>${formatarData(a.emissao)}</td>
        <td>${formatarPeriodo(a.inicio, a.fim)}</td>
        <td>${a.dias ?? '—'}</td>
        <td>${cidHtml(a.cid)}</td>
        <td>${badgeStatus(a.cid)}</td>
      </tr>
    `).join('');

  } catch (error) {
    console.error('Erro ao carregar home:', error);
    tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar dados.</td></tr>';
  }
}

// ── Modal registrar acidente ─────────────────────────────────────────
const modalAcidente = document.getElementById('modalAcidente');
const btnRegistrar = document.getElementById('btnRegistrarAcidente');
const modalClose = document.getElementById('modalClose');
const modalCancelar = document.getElementById('modalCancelar');
const modalDataHoje = document.getElementById('modalDataHoje');

function abrirModal() {
  const hoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
  modalDataHoje.textContent = hoje;
  modalAcidente.classList.add('open');
}

function fecharModal() {
  modalAcidente.classList.remove('open');
}

btnRegistrar.addEventListener('click', abrirModal);
modalClose.addEventListener('click', fecharModal);
modalCancelar.addEventListener('click', fecharModal);
modalAcidente.addEventListener('click', (e) => {
  if (e.target === modalAcidente) fecharModal();
});

const modalConfirmar = document.getElementById('modalConfirmar');
const modalDescricao = document.getElementById('modalObservacoes');

modalConfirmar.addEventListener('click', registrarAcidente);

async function registrarAcidente() {

  try {

    const descricao = modalDescricao.value.trim();

    const response = await fetch('https://api-atestado.onrender.com/acidente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        descricao
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao registrar acidente');
    }

    fecharModal();

    modalDescricao.value = '';

    await carregarUltimoAcidente();

    alert('Acidente registrado com sucesso!');

  } catch (error) {

    console.error(error);

    alert('Erro ao registrar acidente');
  }
}

async function carregarUltimoAcidente() {

  try {

    const response = await fetch('https://api-atestado.onrender.com/acidente/ultimo');

    if (!response.ok) {
      throw new Error('Erro ao buscar acidente');
    }

    const acidente = await response.json();

    const dataAcidente = new Date(acidente.dataAcidente);
    const hoje = new Date();

    const diffMs = hoje - dataAcidente;

    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    document.getElementById('diasSemAcidente').textContent = dias;

  } catch (error) {

    console.error(error);

    document.getElementById('diasSemAcidente').textContent = '—';
  }
}

// ── Sidebar mobile ─────────────────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('open');
});
sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
});
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('open');
    }
  });
});