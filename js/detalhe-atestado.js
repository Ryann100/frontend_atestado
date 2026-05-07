// ── Init ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  carregarUsuario()
  carregarDetalhe()
})

function carregarUsuario() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const nome = usuario.nome || 'Usuário'
  const iniciais = nome.split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('')
  const avatarEl = document.querySelector('.topbar-avatar')
  if (avatarEl) avatarEl.textContent = iniciais
}

// ── Helpers ────────────────────────────────────────────────────────────
function getId() {
  return new URLSearchParams(window.location.search).get('id')
}

function formatarData(dataStr) {
  if (!dataStr) return '—'
  return new Date(dataStr).toLocaleDateString('pt-BR')
}

const CORES = ['#e03040','#2e6da4','#8e44ad','#e67e22','#27ae60','#16a085','#d35400','#2980b9']
function corAvatar(nome) {
  let h = 0
  for (let i = 0; i < nome.length; i++) h = nome.charCodeAt(i) + ((h << 5) - h)
  return CORES[Math.abs(h) % CORES.length]
}
function iniciais(nome) {
  return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

function badgeStatus(cid) {
  const nri = cid && cid.startsWith('F')
  if (nri) return `<span class="badge badge-warn">Revisar</span>`
  return `<span class="badge badge-ok">OK</span>`
}

// ── Carregar detalhe ───────────────────────────────────────────────────
async function carregarDetalhe() {
  const id = getId()
  if (!id) {
    mostrarErro('ID do atestado não informado.')
    return
  }

  try {
    const res = await fetch(`https://api-atestado.onrender.com/atestado/id/${id}`)
    if (!res.ok) throw new Error('Atestado não encontrado')
    const a = await res.json()
    renderDetalhe(a)
  } catch (error) {
    console.error('Erro ao carregar atestado:', error)
    mostrarErro('Não foi possível carregar o atestado.')
  }
}

function mostrarErro(msg) {
  document.querySelector('.content').innerHTML = `
    <div style="text-align:center;padding:60px;color:var(--text-muted)">${msg}</div>`
}

// ── Render ─────────────────────────────────────────────────────────────
function renderDetalhe(a) {
  const nri = a.cid && a.cid.startsWith('F')
  const colab = a.colaborador || {}
  const tipo = a.tipo || {}
  const medico = a.medico || {}
  const hospital = a.hospital || {}

  document.title = `Atestado #${a.id} — ${colab.nome || ''}`
  document.getElementById('breadcrumbAtual').textContent = `#${a.id} · ${colab.nome || ''}`

  if (nri) document.getElementById('alertaNri').style.display = 'flex'

  // Cabeçalho
  document.getElementById('detalheHeader').innerHTML = `
    <div class="detalhe-header-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>
    </div>
    <div class="detalhe-header-info">
      <div class="detalhe-header-tipo">${tipo.tipo || '—'}</div>
      <div class="detalhe-header-sub">Atestado #${a.id} · Emitido em ${formatarData(a.dataEmissao)}</div>
    </div>
    <div class="detalhe-header-badges">
      ${badgeStatus(a.cid)}
      ${nri ? '<span class="badge badge-nri">⚠ NRI</span>' : ''}
      <span class="badge badge-comp">${a.competencia || '—'}</span>
    </div>`

  // Duração
  const temHora = a.horaInicio && a.horaFim
  const duracaoHtml = a.quantidadeDias
    ? `${a.quantidadeDias} dia(s)`
    : temHora
      ? `${a.horaInicio} – ${a.horaFim} (comparecimento)`
      : '—'

  // Dados do atestado
  document.getElementById('dadosAtestado').innerHTML = `
    <div class="dado-item">
      <div class="dado-key">Data de emissão</div>
      <div class="dado-val mono">${formatarData(a.dataEmissao)}</div>
    </div>
    <div class="dado-item">
      <div class="dado-key">Competência</div>
      <div class="dado-val mono">${a.competencia || '—'}</div>
    </div>
    <div class="dado-item">
      <div class="dado-key">Data início</div>
      <div class="dado-val mono">${formatarData(a.dataInicio)}</div>
    </div>
    <div class="dado-item">
      <div class="dado-key">Data fim</div>
      <div class="dado-val mono">${formatarData(a.dataFim)}</div>
    </div>
    <div class="dado-item full">
      <div class="dado-key">Duração</div>
      <div class="dado-val">${duracaoHtml}</div>
    </div>`

  // Dados médicos
  document.getElementById('dadosMedicos').innerHTML = `
    <div class="dado-item">
      <div class="dado-key">CID</div>
      <div class="dado-val mono ${nri ? 'nri' : ''}">${a.cid || '—'} ${nri ? '⚠' : ''}</div>
    </div>
    <div class="dado-item">
      <div class="dado-key">Médico</div>
      <div class="dado-val">${medico.nome || '—'}</div>
    </div>
    <div class="dado-item">
      <div class="dado-key">CRM</div>
      <div class="dado-val mono">${medico.crm || '—'}</div>
    </div>
    <div class="dado-item">
      <div class="dado-key">Especialidade</div>
      <div class="dado-val">${medico.especialidade || '—'}</div>
    </div>
    <div class="dado-item">
      <div class="dado-key">Hospital / Clínica</div>
      <div class="dado-val">${hospital.nome || '—'}</div>
    </div>`

  // Observações
  if (a.observacoes) {
    document.getElementById('secaoObs').style.display = 'block'
    document.getElementById('obsTexto').textContent = a.observacoes
  }

  // Colaborador mini
  const cor = corAvatar(colab.nome || '')
  const ini = iniciais(colab.nome || '?')
  document.getElementById('colabMini').innerHTML = `
    <div class="colab-mini" onclick="location.href='colaboradores.html?mat=${colab.matricula}'">
      <div class="colab-mini-av" style="background:color-mix(in srgb,${cor} 20%,transparent);border:1.5px solid color-mix(in srgb,${cor} 40%,transparent);color:${cor}">${ini}</div>
      <div>
        <div class="colab-mini-nome">${colab.nome || '—'}</div>
        <div class="colab-mini-sub">${colab.matricula || ''} · ${colab.cargo || ''}</div>
      </div>
      <svg class="colab-mini-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
    </div>`
}

// ── Sidebar mobile ─────────────────────────────────────────────────────
const sidebar        = document.getElementById('sidebar')
const menuToggle     = document.getElementById('menuToggle')
const sidebarOverlay = document.getElementById('sidebarOverlay')

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open')
  sidebarOverlay.classList.toggle('open')
})
sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('open')
  sidebarOverlay.classList.remove('open')
})