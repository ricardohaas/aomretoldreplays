const STORAGE_KEY = 'aomstats_video_links';
const URL_STORAGE_KEY = 'aomstats_json_url';

async function loadLinks() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || {};
}

async function saveLinks(links) {
  await chrome.storage.local.set({ [STORAGE_KEY]: links });
}

async function renderLinks() {
  const links = await loadLinks();
  const entries = Object.entries(links);
  const countMsg = document.getElementById('countMsg');
  const linkList = document.getElementById('linkList');

  if (entries.length === 0) {
    countMsg.textContent = 'Nenhum link carregado.';
    linkList.innerHTML = '';
    return;
  }

  countMsg.textContent = `${entries.length} link(s) carregado(s).`;

  linkList.innerHTML = entries.map(([id, url]) => `
    <div class="link-item">
      <span class="id">${id}</span>
      <span class="url" title="${url}">${url}</span>
    </div>
  `).join('');
}

async function importData(imported) {
  if (!Array.isArray(imported)) throw new Error('Formato inválido');

  const links = await loadLinks();

  for (const item of imported) {
    if (item.id && item.url) {
      links[String(item.id)] = item.url;
    }
  }

  await saveLinks(links);
  await renderLinks();
}

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// File import
document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      await importData(imported);
      alert('Importação concluída! Recarregue a página de replays para ver os ícones.');
    } catch {
      alert('Erro ao importar. Verifique se é um JSON válido.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// URL import
const urlInput = document.getElementById('jsonUrl');
const fetchBtn = document.getElementById('fetchUrlBtn');
const fetchStatus = document.getElementById('fetchStatus');

chrome.storage.local.get(URL_STORAGE_KEY).then(result => {
  if (result[URL_STORAGE_KEY]) {
    urlInput.value = result[URL_STORAGE_KEY];
  }
});

fetchBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  if (!url) {
    fetchStatus.textContent = 'Insira uma URL.';
    return;
  }

  fetchStatus.textContent = 'Baixando...';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const imported = await res.json();
    await importData(imported);

    await chrome.storage.local.set({ [URL_STORAGE_KEY]: url });
    fetchStatus.textContent = `Importado com sucesso! (${imported.length} registro(s))`;
  } catch (err) {
    fetchStatus.textContent = 'Erro ao baixar: ' + err.message;
  }
});

document.getElementById('clearBtn').addEventListener('click', async () => {
  if (confirm('Limpar todos os dados?')) {
    await saveLinks({});
    await renderLinks();
  }
});

renderLinks();
