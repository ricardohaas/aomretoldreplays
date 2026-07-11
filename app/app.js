const STORAGE_KEY = 'aomstats_links';

let games = loadGames();

function loadGames() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveGames() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

function renderTable() {
  const tbody = document.getElementById('gamesBody');
  const emptyMsg = document.getElementById('emptyMsg');

  tbody.innerHTML = '';

  if (games.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';

  games.forEach((game, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${game.id}</td>
      <td class="url-cell"><a href="${game.url}" target="_blank">${game.url}</a></td>
      <td><button class="remove-btn" data-index="${index}">Remover</button></td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      games.splice(index, 1);
      saveGames();
      renderTable();
    });
  });
}

function extractYoutubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return url;
}

document.getElementById('gameForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const gameId = document.getElementById('gameId').value.trim();
  const videoUrl = document.getElementById('videoUrl').value.trim();

  if (!gameId || !videoUrl) return;

  if (games.some(g => g.id === gameId)) {
    alert('Este ID já foi cadastrado.');
    return;
  }

  games.push({ id: gameId, url: videoUrl });
  saveGames();
  renderTable();

  document.getElementById('gameForm').reset();
  document.getElementById('gameId').focus();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  if (games.length === 0) {
    alert('Nenhum jogo cadastrado para exportar.');
    return;
  }

  const data = JSON.stringify(games, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'aomstats-links.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (!Array.isArray(imported)) throw new Error('Formato inválido');

      for (const item of imported) {
        if (!item.id || !item.url) continue;
        if (!games.some(g => g.id === item.id)) {
          games.push({ id: String(item.id), url: item.url });
        }
      }

      saveGames();
      renderTable();
      alert('Importação concluída!');
    } catch {
      alert('Erro ao importar o arquivo. Verifique se é um JSON válido.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

document.getElementById('clearBtn').addEventListener('click', () => {
  if (games.length === 0) return;
  if (confirm('Tem certeza que deseja limpar todos os jogos?')) {
    games = [];
    saveGames();
    renderTable();
  }
});

renderTable();
