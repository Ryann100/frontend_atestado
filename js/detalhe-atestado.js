// ── Dados de atestados (substituir pela API real) ──────────────────────
const ATESTADOS = {
  '1': {
    id: 1, tipo: 'Médico', status: 'ok', nri: false,
    competencia: 'Abr/2025', emissao: '02/04/2025',
    inicio: '02/04/2025', fim: '04/04/2025', dias: 3,
    cid: 'J06', cidDesc: 'Infecção aguda das vias aéreas superiores',
    crm: 'CRM/SP 12345', medico: 'Dr. Roberto Lima', especialidade: 'Clínica Geral',
    hospital: 'UPA Central', observacoes: '',
    colaborador: { nome: 'Ana Paula Santos', matricula: '00412', setor: 'Logística', cargo: 'Operador de Logística' },
    log: [
      { acao: 'Atestado cadastrado', detalhe: 'Por Maria Rodrigues · 02/04/2025 às 09:14', tipo: 'criacao' },
    ],
  },
  '2': {
    id: 2, tipo: 'Comparecimento', status: 'ok', nri: false,
    competencia: 'Abr/2025', emissao: '05/04/2025',
    inicio: '05/04/2025', fim: null, dias: null, horas: '2h30',
    cid: 'Z00', cidDesc: 'Exame médico geral / Consulta',
    crm: 'CRM/SP 54321', medico: 'Dra. Camila Souza', especialidade: 'Ortopedia',
    hospital: 'Hospital São Lucas', observacoes: 'Consulta de rotina pré-agendada.',
    colaborador: { nome: 'Carlos Mota', matricula: '00891', setor: 'Operacional', cargo: 'Operador' },
    log: [
      { acao: 'Atestado cadastrado', detalhe: 'Por Maria Rodrigues · 05/04/2025 às 14:30', tipo: 'criacao' },
    ],
  },
  '3': {
    id: 3, tipo: 'Maternidade', status: 'info', nri: false,
    competencia: 'Mar/2025', emissao: '10/03/2025',
    inicio: '10/03/2025', fim: '06/07/2025', dias: 120,
    cid: 'Z34', cidDesc: 'Supervisão de gravidez normal',
    crm: 'CRM/SP 11111', medico: 'Dra. Ana Ferreira', especialidade: 'Ginecologia',
    hospital: 'Hospital São Lucas', observacoes: 'Licença maternidade conforme art. 392 CLT.',
    colaborador: { nome: 'Fernanda Torres', matricula: '01102', setor: 'Administrativo', cargo: 'Analista' },
    log: [
      { acao: 'Atestado cadastrado', detalhe: 'Por Maria Rodrigues · 10/03/2025 às 08:45', tipo: 'criacao' },
    ],
  },
  '4': {
    id: 4, tipo: 'Médico', status: 'warn', nri: true,
    competencia: 'Abr/2025', emissao: '12/04/2025',
    inicio: '12/04/2025', fim: '13/04/2025', dias: 2,
    cid: 'F32', cidDesc: 'Episódio depressivo',
    crm: 'CRM/SP 98765', medico: 'Dr. Paulo Henrique', especialidade: 'Psiquiatria',
    hospital: 'Hospital São Lucas', observacoes: 'Atestado NRI — aguarda revisão do setor de RH.',
    colaborador: { nome: 'João Ribeiro', matricula: '00734', setor: 'Logística', cargo: 'Motorista' },
    log: [
      { acao: 'Atestado cadastrado', detalhe: 'Por Maria Rodrigues · 12/04/2025 às 16:22', tipo: 'criacao' },
      { acao: 'CID F detectado automaticamente', detalhe: 'Sistema · 12/04/2025 às 16:22', tipo: 'alerta' },
    ],
  },
};

// ── Helpers ────────────────────────────────────────────────────────────
function getId() {
  return new URLSearchParams(window.location.search).get('id') || '1';
}

const CORES = ['#e03040','#2e6da4','#8e44ad','#e67e22','#27ae60','#16a085','#d35400','#2980b9'];
function corAvatar(nome) {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = nome.charCodeAt(i) + ((h << 5) - h);
  return CORES[Math.abs(h) % CORES.length];
}
function iniciais(nome) {
  return nome.split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase();
}

function badgeStatus(status) {
  const map = { ok:'badge-ok', info:'badge-info', warn:'badge-warn' };
  const txt = { ok:'OK', info:'Em curso', warn:'Revisar' };
  return `<span class="badge ${map[status]}">${txt[status]}</span>`;
}

// ── Render ─────────────────────────────────────────────────────────────
function renderDetalhe(id) {
  const a = ATESTADOS[id];
  if (!a) {
    document.querySelector('.content').innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-muted)">Atestado não encontrado.</div>`;
    return;
  }

  document.title = `Atestado #${a.id} — ${a.colaborador.nome}`;
  document.getElementById('breadcrumbAtual').textContent = `#${a.id} · ${a.colaborador.nome}`;

  if (a.nri) document.getElementById('alertaNri').style.display = 'flex';

  // Cabeçalho
  document.getElementById('detalheHeader').innerHTML = `
    <div class="detalhe-header-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>
    </div>
    <div class="detalhe-header-info">
      <div class="detalhe-header-tipo">${a.tipo}</div>
      <div class="detalhe-header-sub">Atestado #${a.id} · Emitido em ${a.emissao}</div>
    </div>
    <div class="detalhe-header-badges">
      ${badgeStatus(a.status)}
      ${a.nri ? '<span class="badge badge-nri">⚠ NRI</span>' : ''}
      <span class="badge badge-comp">${a.competencia}</span>
    </div>`;

  // Dados do atestado
  const diasHtml = a.dias ? `${a.dias} dia(s)` : a.horas ? `${a.horas} (comparecimento)` : '—';
  const fimHtml  = a.fim || '— (comparecimento)';
  document.getElementById('dadosAtestado').innerHTML = `
    <div class="dado-item">
      <div class="dado-key">Data de emissão</div>
      <div class="dado-val mono">${a.emissao}</div>
    </div>
    <div class="dado-item">
      <div class="dado-key">Competência</div>
      <div class="dado-val mono">${a.competencia}</div>
    </div>
    <div class="dado-item">
      <div class="dado-key">Data início</div>
      <div class="dado-val mono">${a.inicio}</div>
    </div>
    <div class="dado-item">
      <div class="dado-key">Data fim</div>
      <div class="dado-val mono">${fimHtml}</div>
    </div>
    <div class="dado-item full">
      <div class="dado-key">Duração</div>
      <div class="dado-val">${diasHtml}</div>
    </div>`;

  // Dados médicos
  document.getElementById('dadosMedicos').innerHTML = `
    <div class="dado-item">
      <div class="dado-key">CID</div>
      <div class="dado-val mono ${a.nri ? 'nri' : ''}">${a.cid} ${a.nri ? '⚠' : ''}</div>
    </div>
    <div class="dado-item">
      <div class="dado-key">Descrição do CID</div>
      <div class="dado-val">${a.cidDesc}</div>
    </div>
    <div class="dado-item">
      <div class="dado-key">Médico</div>
      <div class="dado-val">${a.medico}</div>
    </div>
    <div class="dado-item">
      <div class="dado-key">CRM</div>
      <div class="dado-val mono">${a.crm}</div>
    </div>
    <div class="dado-item">
      <div class="dado-key">Especialidade</div>
      <div class="dado-val">${a.especialidade}</div>
    </div>
    <div class="dado-item">
      <div class="dado-key">Hospital / Clínica</div>
      <div class="dado-val">${a.hospital}</div>
    </div>`;

  // Observações
  if (a.observacoes) {
    document.getElementById('secaoObs').style.display = 'block';
    document.getElementById('obsTexto').textContent   = a.observacoes;
  }

  // Colaborador mini
  const cor = corAvatar(a.colaborador.nome);
  const ini = iniciais(a.colaborador.nome);
  document.getElementById('colabMini').innerHTML = `
    <div class="colab-mini" onclick="location.href='colaboradores.html?mat=${a.colaborador.matricula}'">
      <div class="colab-mini-av" style="background:color-mix(in srgb,${cor} 20%,transparent);border:1.5px solid color-mix(in srgb,${cor} 40%,transparent);color:${cor}">${ini}</div>
      <div>
        <div class="colab-mini-nome">${a.colaborador.nome}</div>
        <div class="colab-mini-sub">${a.colaborador.matricula} · ${a.colaborador.cargo}</div>
      </div>
      <svg class="colab-mini-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>
    </div>`;

  // Log
  document.getElementById('logLista').innerHTML = a.log.map(l => `
    <div class="log-item">
      <div class="log-dot ${l.tipo === 'criacao' ? 'criacao' : ''}"></div>
      <div>
        <div class="log-acao">${l.acao}</div>
        <div class="log-detalhe">${l.detalhe}</div>
      </div>
    </div>`).join('');
}

// ── Editar atestado ────────────────────────────────────────────────────
function editarAtestado() {
  location.href = `novo-atestado.html?id=${getId()}`;
}

// ── Gerar PDF ──────────────────────────────────────────────────────────
function gerarPDF() {
  const id = getId();
  const a  = ATESTADOS[id];
  if (!a) return;

  const diasTexto  = a.dias ? `${a.dias} dia(s)` : a.horas ? `${a.horas} (comparecimento)` : '—';
  const nriTexto   = a.nri ? '⚠ SIM — Requer revisão do RH' : 'Não';
  const statusMap  = { ok:'OK', info:'Em curso', warn:'Revisar' };
  const fimTexto   = a.fim || '— (comparecimento)';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Atestado #${a.id}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a1a1a; padding: 40px; font-size: 13px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #e03040; padding-bottom: 20px; margin-bottom: 28px; }
  .header-titulo { font-size: 22px; font-weight: 700; color: #e03040; }
  .header-sub    { font-size: 13px; color: #666; margin-top: 4px; }
  .header-right  { text-align: right; font-size: 12px; color: #888; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-left: 6px; }
  .badge-ok   { background: #eafaf1; color: #1e8449; border: 1px solid #1e8449; }
  .badge-warn { background: #fef9e7; color: #d68910; border: 1px solid #d68910; }
  .badge-info { background: #eaf2fb; color: #1a5276; border: 1px solid #1a5276; }
  .badge-nri  { background: #fdedec; color: #e03040; border: 1px solid #e03040; }
  .secao { margin-bottom: 24px; }
  .secao-titulo { font-size: 11px; font-weight: 700; color: #e03040; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #f0f0f0; padding-bottom: 6px; margin-bottom: 14px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .campo-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 3px; }
  .campo-val   { font-size: 13px; font-weight: 600; color: #1a1a1a; }
  .campo-val.nri { color: #e03040; }
  .alerta-nri { background: #fdedec; border: 1.5px solid #e03040; border-radius: 8px; padding: 10px 14px; color: #e03040; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
  .obs { background: #f8f8f8; border-radius: 8px; padding: 12px 14px; color: #444; line-height: 1.6; }
  .footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 14px; display: flex; justify-content: space-between; font-size: 11px; color: #aaa; }
  .assinatura { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  .assin-linha { border-top: 1px solid #555; padding-top: 6px; font-size: 11px; color: #666; }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="header-titulo">Mello Transportes</div>
    <div class="header-sub">Relatório de Atestado / Afastamento</div>
    <div style="margin-top:8px">
      <span style="font-size:12px;color:#555">Atestado <strong>#${a.id}</strong></span>
      <span class="badge badge-${a.status === 'ok' ? 'ok' : a.status === 'info' ? 'info' : 'warn'}">${statusMap[a.status]}</span>
      ${a.nri ? '<span class="badge badge-nri">⚠ NRI</span>' : ''}
    </div>
  </div>
  <div class="header-right">
    <div><strong>Competência:</strong> ${a.competencia}</div>
    <div style="margin-top:4px"><strong>Gerado em:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</div>
    <div style="margin-top:4px"><strong>Emitido por:</strong> Maria Rodrigues</div>
  </div>
</div>

${a.nri ? `<div class="alerta-nri">⚠ ATENÇÃO: Este atestado possui CID categoria F e está classificado como NRI. Requer revisão do setor de RH antes de ser finalizado.</div>` : ''}

<div class="secao">
  <div class="secao-titulo">Dados do Colaborador</div>
  <div class="grid">
    <div><div class="campo-label">Nome completo</div><div class="campo-val">${a.colaborador.nome}</div></div>
    <div><div class="campo-label">Matrícula</div><div class="campo-val">${a.colaborador.matricula}</div></div>
    <div><div class="campo-label">Setor</div><div class="campo-val">${a.colaborador.setor}</div></div>
    <div><div class="campo-label">Cargo</div><div class="campo-val">${a.colaborador.cargo}</div></div>
  </div>
</div>

<div class="secao">
  <div class="secao-titulo">Dados do Atestado</div>
  <div class="grid">
    <div><div class="campo-label">Tipo de afastamento</div><div class="campo-val">${a.tipo}</div></div>
    <div><div class="campo-label">Competência</div><div class="campo-val">${a.competencia}</div></div>
    <div><div class="campo-label">Data de emissão</div><div class="campo-val">${a.emissao}</div></div>
    <div><div class="campo-label">Data início</div><div class="campo-val">${a.inicio}</div></div>
    <div><div class="campo-label">Data fim</div><div class="campo-val">${fimTexto}</div></div>
    <div><div class="campo-label">Duração</div><div class="campo-val">${diasTexto}</div></div>
  </div>
</div>

<div class="secao">
  <div class="secao-titulo">Dados Médicos</div>
  <div class="grid">
    <div><div class="campo-label">CID</div><div class="campo-val ${a.nri ? 'nri' : ''}">${a.cid}${a.nri ? ' ⚠' : ''}</div></div>
    <div><div class="campo-label">Descrição do CID</div><div class="campo-val">${a.cidDesc}</div></div>
    <div><div class="campo-label">Classificação NRI</div><div class="campo-val ${a.nri ? 'nri' : ''}">${nriTexto}</div></div>
    <div><div class="campo-label">Médico responsável</div><div class="campo-val">${a.medico}</div></div>
    <div><div class="campo-label">CRM</div><div class="campo-val">${a.crm}</div></div>
    <div><div class="campo-label">Especialidade</div><div class="campo-val">${a.especialidade}</div></div>
    <div><div class="campo-label">Hospital / Clínica</div><div class="campo-val">${a.hospital}</div></div>
  </div>
</div>

${a.observacoes ? `<div class="secao"><div class="secao-titulo">Observações</div><div class="obs">${a.observacoes}</div></div>` : ''}

<div class="assinatura">
  <div><div class="assin-linha">Responsável RH — Assinatura e carimbo</div></div>
  <div><div class="assin-linha">Colaborador — Ciência e assinatura</div></div>
</div>

<div class="footer">
  <span>Sistema de Gestão de Atestados — Mello Transportes</span>
  <span>Documento gerado automaticamente</span>
</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 600);
}

// ── Modal excluir ──────────────────────────────────────────────────────
const modalExcluir = document.getElementById('modalExcluir');
document.getElementById('btnExcluir').addEventListener('click', () => modalExcluir.classList.add('open'));
document.getElementById('fecharModalExcluir').addEventListener('click', () => modalExcluir.classList.remove('open'));
document.getElementById('cancelarExcluir').addEventListener('click', () => modalExcluir.classList.remove('open'));
document.getElementById('confirmarExcluir').addEventListener('click', () => {
  modalExcluir.classList.remove('open');
  location.href = 'atestados.html';
});

// ── Sidebar mobile ─────────────────────────────────────────────────────
const sidebar        = document.getElementById('sidebar');
const menuToggle     = document.getElementById('menuToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');
menuToggle.addEventListener('click', () => { sidebar.classList.toggle('open'); sidebarOverlay.classList.toggle('open'); });
sidebarOverlay.addEventListener('click', () => { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); });

// ── Init ───────────────────────────────────────────────────────────────
renderDetalhe(getId());