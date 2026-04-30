// ── Carregamento ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  carregarHospitais();
});

// ── Cores ──────────────────────────────────────────────────────────────
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

let clicouFora = false;

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
  const nome     = document.getElementById('hospNome').value.trim();
  const tipo     = document.getElementById('hospTipo').value;
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

//─── Funcões do Hospitais ────────────────────────────────────────────────
async function limparModalHospital() {
  document.getElementById('hospNome').value     = '';
  document.getElementById('hospTipo').value     = '';
  document.getElementById('hospEndereco').value = '';
  hospitalEditandoId = null;
  document.getElementById('modalHospitalTitulo').innerText = 'Cadastrar hospital';
}

async function carregarHospitais() {
  try {
    const res = await fetch('https://api-atestado.onrender.com/hospital/');
    const data = await res.json();

    renderHospitais(data);

  } catch (error) {
    console.error('Erro ao carregar hospitais:', error);
  }
}

async function editarHospital(id) {
  try {
    const res = await fetch(`https://api-atestado.onrender.com/hospital/${id}`);
    const hospital = await res.json();

    if (!res.ok) {
      alert('Erro ao buscar hospital: ' + hospital.error);
      return;
    }

    document.getElementById('hospNome').value     = hospital.nome;
    document.getElementById('hospTipo').value     = hospital.tipo;
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