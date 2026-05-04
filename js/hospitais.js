// ── CARREGAMENTO ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  carregarHospitais();
  carregarMedicos();
});

// ── CORES ──────────────────────────────────────────────────────────────
const TIPO_CORES = {
  'Hospital': { bg: 'rgba(46,109,164,0.12)', color: '#4a9fd9' },
  'UPA': { bg: 'rgba(224,48,64,0.10)', color: '#e03040' },
  'Clínica': { bg: 'rgba(39,174,96,0.12)', color: '#2ecc71' },
  'Pronto-socorro': { bg: 'rgba(230,126,34,0.12)', color: '#e67e22' },
  'Consultório': { bg: 'rgba(142,68,173,0.12)', color: '#9b59b6' },
};

function tipoIcon(tipo) {
  const c = TIPO_CORES[tipo] || { bg: 'rgba(127,140,141,0.15)', color: 'var(--text-muted)' };
  return `<div class="hosp-icon" style="background:${c.bg}">
    <svg viewBox="0 0 24 24" fill="none" stroke="${c.color}" stroke-width="2" stroke-linecap="round">
      <rect x="2" y="7" width="20" height="15" rx="2"/>
      <path d="M8 7V5a4 4 0 0 1 8 0v2"/>
      <path d="M12 12v4M10 14h4"/>
    </svg>
  </div>`;
}

function iniciais(nome) {
  return nome.replace('Dr. ', '').replace('Dra. ', '').split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

// ── TABS ────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab' + btn.dataset.tab.charAt(0).toUpperCase() + btn.dataset.tab.slice(1)).classList.add('active');
  });
});

// ── HOSPITAIS ─────────────────────────────────────────────────────────

let hospitalEditandoId = null;
const modalHospital = document.getElementById('modalHospital');
const inputBusca = document.getElementById('buscaHospital');
const filtroTipo = document.getElementById('filtroTipoHosp');
let todosHospitais = [];
let clicouFora = false;

inputBusca.addEventListener('input', buscarHospitais);
filtroTipo.addEventListener('change', buscarHospitais);

document.getElementById('btnNovoHospital').addEventListener('click', () => {
  limparModalHospital();
  modalHospital.classList.add('open');
});

document.getElementById('fecharModalHospital').addEventListener('click', () => {
  limparModalHospital();
  modalHospital.classList.remove('open');
});

document.getElementById('cancelarHospital').addEventListener('click', () => {
  limparModalHospital();
  modalHospital.classList.remove('open');
});

modalHospital.addEventListener('mousedown', (e) => {
  clicouFora = e.target === modalHospital;
});

modalHospital.addEventListener('mouseup', (e) => {
  if (clicouFora && e.target === modalHospital) {
    limparModalHospital();
    modalHospital.classList.remove('open');
  }
});

document.querySelector('#modalHospital .modal').addEventListener('click', (e) => {
  e.stopPropagation();
});

document.getElementById('salvarHospital').addEventListener('click', async () => {
  const nome = document.getElementById('hospNome').value.trim();
  const tipo = document.getElementById('hospTipo').value;
  const endereco = document.getElementById('hospEndereco').value.trim();

  if (!nome || !tipo || !endereco) {
    alert('Preencha todos os campos!');
    return;
  }

  const estaEditando = hospitalEditandoId;

  try {
    let res;
    if (estaEditando !== null) {
      //PATCH para atualizar hospital existente
      res = await fetch(`https://api-atestado.onrender.com/hospital/${estaEditando}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, tipo, endereco }),
      });
    } else {
      //POST para criar novo hospital
      res = await fetch('https://api-atestado.onrender.com/hospital/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, tipo, endereco }),
      });
    }

    const data = await res.json();
    if (!res.ok) {
      alert('Erro: ' + (data.error || res.statusText));
      return;
    }

    await carregarHospitais();
    await limparModalHospital();
    modalHospital.classList.remove('open');
    mostrarToast(estaEditando ? 'Hospital atualizado!' : 'Hospital cadastrado!');
  } catch (error) {
    alert('Erro: ' + error.message);
  }
});

//─── FUNÇÕES DO HOSPITAL ────────────────────────────────────────────────
async function limparModalHospital() {
  document.getElementById('hospNome').value = '';
  document.getElementById('hospTipo').value = '';
  document.getElementById('hospEndereco').value = '';
  hospitalEditandoId = null;
  document.getElementById('modalHospitalTitulo').innerText = 'Cadastrar hospital';
}

async function carregarHospitais() {
  const res = await fetch('https://api-atestado.onrender.com/hospital/');
  todosHospitais = await res.json();
  renderHospitais(todosHospitais);
}

function buscarHospitais() {
  const nome = inputBusca.value.toLowerCase().trim();
  const tipo = filtroTipo.value;

  const filtrados = todosHospitais.filter(h => {
    const matchNome = h.nome.toLowerCase().includes(nome);
    const matchTipo = tipo ? h.tipo === tipo : true;
    return matchNome && matchTipo;
  });

  renderHospitais(filtrados);
}

async function editarHospital(id) {
  try {
    const res = await fetch(`https://api-atestado.onrender.com/hospital/${id}`);
    const hospital = await res.json();

    if (!res.ok) {
      alert('Erro ao buscar hospital: ' + hospital.error);
      return;
    }

    document.getElementById('hospNome').value = hospital.nome;
    document.getElementById('hospTipo').value = hospital.tipo;
    document.getElementById('hospEndereco').value = hospital.endereco;
    document.getElementById('modalHospitalTitulo').innerText = 'Editar hospital';

    hospitalEditandoId = id;
    modalHospital.classList.add('open');
  } catch (error) {
    alert('Erro ao buscar hospital: ' + error.message);
  }
}

function mostrarToast(mensagem) {
  const toast = document.createElement('div');
  toast.innerText = mensagem;

  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.background = '#2ecc71';
  toast.style.color = '#fff';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
  toast.style.zIndex = '9999';

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

async function buscarHospitais() {
  const nome = inputBusca.value.toLowerCase().trim();
  const tipo = filtroTipo.value;

  try {
    const res = await fetch('https://api-atestado.onrender.com/hospital/');
    const data = await res.json();
    const filtrados = data.filter(h => {
      const matchNome = h.nome.toLowerCase().includes(nome);
      const matchTipo = tipo ? h.tipo === tipo : true;

      return matchNome && matchTipo;
    });

    renderHospitais(filtrados);

  } catch (error) {
    console.error('Erro na busca:', error);
  }
}

async function renderHospitais(data) {
  const tbody = document.getElementById('tbodyHospitais');
  tbody.innerHTML = '';

  data.forEach(h => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${tipoIcon(h.tipo)} ${h.nome}</td>
      <td>${h.tipo}</td>
      <td>${h.endereco}</td>
      <td>—</td>
      <td>
        <button class="btn-outline" onclick="editarHospital(${h.id})">
          Editar
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ── MÉDICOS ───────────────────────────────────────────────────────────

let medicoEditandoId = null;
let todosMedicos = [];
const modalMedico = document.getElementById('modalMedico');
const inputBuscaMedico = document.getElementById('buscaMedico');
const filtroStatusCrm = document.getElementById('filtroStatusCrm');

inputBuscaMedico.addEventListener('input', filtrarMedicos);
filtroStatusCrm.addEventListener('change', filtrarMedicos);

document.getElementById('btnNovoMedico').addEventListener('click', () => {
  limparModalMedico();
  carregarHospitaisNoModal();
  modalMedico.classList.add('open');
});

document.getElementById('fecharModalMedico').addEventListener('click', () => {
  limparModalMedico();
  modalMedico.classList.remove('open');
});

document.getElementById('cancelarMedico').addEventListener('click', () => {
  limparModalMedico();
  modalMedico.classList.remove('open');
});

document.getElementById('hospDropdownToggle').addEventListener('click', (e) => {
  e.stopPropagation();
  const menu = document.getElementById('hospDropdownMenu');
  const toggle = document.getElementById('hospDropdownToggle');
  menu.classList.toggle('open');
  toggle.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.hosp-dropdown')) {
    const menu = document.getElementById('hospDropdownMenu');
    const toggle = document.getElementById('hospDropdownToggle');
    if (menu) menu.classList.remove('open');
    if (toggle) toggle.classList.remove('open');
  }
});

let clicouForaMedico = false;

modalMedico.addEventListener('mousedown', (e) => {
  clicouForaMedico = e.target === modalMedico;
});

modalMedico.addEventListener('mouseup', (e) => {
  if (clicouForaMedico && e.target === modalMedico) {
    limparModalMedico();
    modalMedico.classList.remove('open');
  }
});

document.querySelector('#modalMedico .modal').addEventListener('click', (e) => {
  e.stopPropagation();
});

document.getElementById('salvarMedico').addEventListener('click', async () => {
  const nome = document.getElementById('medNome').value.trim();
  const crm = document.getElementById('medCrm').value.trim();
  const especialidade = document.getElementById('medEspecialidade').value.trim();
  const statusCrm = document.getElementById('medStatusCrm').value;
  const checkboxes = document.querySelectorAll('#hospDropdownMenu input[type="checkbox"]:checked');
  const hospitaisSelecionados = Array.from(checkboxes).map(cb => Number(cb.value));

  if (!nome || !especialidade) {
    alert('Preencha todos os campos obrigatórios!');
    return;
  }

  if (!medicoEditandoId && !crm) {
    alert('Informe o CRM!');
    return;
  }

  const estaEditando = medicoEditandoId;

  try {
    let res;
    if (estaEditando) {
      res = await fetch(`https://api-atestado.onrender.com/medico/id/${estaEditando}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, especialidade, statusCrm }),
      });
    } else {
      res = await fetch('https://api-atestado.onrender.com/medico/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, crm, especialidade, statusCrm: 'Ativo' }),
      });
    }

    const data = await res.json();
    if (!res.ok) {
      alert('Erro: ' + (data.error || res.statusText));
      return;
    }

    if (!estaEditando) {
      for (const hospitalId of hospitaisSelecionados) {
        await fetch(`https://api-atestado.onrender.com/medico-hospital/medico/${data.id}/hospital/${hospitalId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    await carregarMedicos();
    limparModalMedico();
    modalMedico.classList.remove('open');
    mostrarToast(estaEditando ? 'Médico atualizado!' : 'Médico cadastrado!');
  } catch (error) {
    alert('Erro: ' + error.message);
  }
});

// ── FUNÇÕES DO HOSPITAL ────────────────────────────────────────────────

async function carregarHospitaisNoModal() {
  const menu = document.getElementById('hospDropdownMenu');
  menu.innerHTML = '';

  try {
    const res = await fetch('https://api-atestado.onrender.com/hospital/');
    const hospitais = await res.json();

    hospitais.forEach(h => {
      const label = document.createElement('label');
      label.classList.add('hosp-dropdown-item');
      label.innerHTML = `
        <input type="checkbox" value="${h.id}" name="hospitalVinculo">
        ${tipoIcon(h.tipo)}
        <span>${h.nome}</span>
      `;
      menu.appendChild(label);
    });

    menu.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', atualizarLabelDropdown);
    });

  } catch (error) {
    console.error('Erro ao carregar hospitais no modal:', error);
  }
}

function atualizarLabelDropdown() {
  const selecionados = Array.from(
    document.querySelectorAll('#hospDropdownMenu input:checked')
  ).map(c => c.closest('label').querySelector('span').textContent.trim());

  document.getElementById('hospDropdownLabel').textContent =
    selecionados.length ? selecionados.join(', ') : 'Selecionar hospitais...';
}

function limparModalMedico() {
  document.getElementById('medNome').value = '';
  document.getElementById('medCrm').value = '';
  document.getElementById('medEspecialidade').value = '';
  medicoEditandoId = null;
  document.getElementById('modalMedicoTitulo').innerText = 'Cadastrar médico';
  document.getElementById('medStatusCrm').value = 'Ativo';

  const crmInput = document.getElementById('medCrm');
  if (crmInput) crmInput.disabled = false;
}

async function carregarMedicos() {
  try {
    const res = await fetch('https://api-atestado.onrender.com/medico/');
    const data = await res.json();
    todosMedicos = data;
    renderMedicos(todosMedicos);
  } catch (error) {
    console.error('Erro ao carregar médicos:', error);
  }
}

let debounceTimer;
function filtrarMedicos() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const busca = inputBuscaMedico.value.toLowerCase().trim();
    const status = filtroStatusCrm.value;

    const filtrados = todosMedicos.filter(m => {
      const matchNome = m.nome.toLowerCase().includes(busca) ||
        m.crm.toLowerCase().includes(busca);
      const matchStatus = status ? m.statusCrm === status : true;
      return matchNome && matchStatus;
    });

    renderMedicos(filtrados);
  }, 300);
}

let renderVersao = 0;

async function renderMedicos(medicos) {
  const versaoAtual = ++renderVersao;

  const tbody = document.getElementById('tbodyMedicos');
  tbody.innerHTML = '';

  if (!medicos || medicos.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">Nenhum médico cadastrado.</td></tr>';
    return;
  }

  // Busca todos os vínculos de uma vez em paralelo
  const vinculosPromises = medicos.map(m =>
    fetch(`https://api-atestado.onrender.com/medico-hospital/medico/${m.id}/hospitais`)
      .then(r => r.ok ? r.json() : [])
      .catch(() => [])
  );

  const todosVinculos = await Promise.all(vinculosPromises);

  if (versaoAtual !== renderVersao) return;

  medicos.forEach((m, i) => {
    const statusClass = m.statusCrm === 'Ativo' ? 'badge-ativo' : 'badge-inativo';

    // Usa todosHospitais que já está em memória, sem novo fetch
    const vinculos = todosVinculos[i];
    const hospitaisNomes = vinculos.length > 0
      ? vinculos.map(v => {
          const h = todosHospitais.find(h => h.id === v.hospitalId);
          return h ? h.nome : '?';
        }).join(', ')
      : '—';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div class="med-avatar">${iniciais(m.nome)}</div> ${m.nome}</td>
      <td>${m.crm}</td>
      <td>${m.especialidade}</td>
      <td>${hospitaisNomes}</td>
      <td>—</td>
      <td><span class="badge ${statusClass}">${m.statusCrm}</span></td>
      <td>
        <button class="btn-outline" onclick="editarMedico(${m.id})">Editar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function editarMedico(id) {
  try {
    const res = await fetch(`https://api-atestado.onrender.com/medico/id/${id}`);
    const medico = await res.json();

    await carregarHospitaisNoModal();

    if (!res.ok) {
      alert('Erro ao buscar médico: ' + medico.error);
      return;
    }

    document.getElementById('medNome').value = medico.nome;
    document.getElementById('medCrm').value = medico.crm;
    document.getElementById('medEspecialidade').value = medico.especialidade;
    document.getElementById('modalMedicoTitulo').innerText = 'Editar médico';
    document.getElementById('medStatusCrm').value = medico.statusCrm;

    const vinculos = await fetch(`https://api-atestado.onrender.com/medico-hospital/medico/${id}/hospitais`);
    if (vinculos.ok) {
      const data = await vinculos.json();
      data.forEach(v => {
        const checkbox = document.querySelector(`#hospDropdownMenu input[value="${v.hospitalId}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }

    medicoEditandoId = id;
    modalMedico.classList.add('open');
    const crmInput = document.getElementById('medCrm');
    if (crmInput) crmInput.disabled = true;
  } catch (error) {
    alert('Erro ao buscar médico: ' + error.message);
  }
}