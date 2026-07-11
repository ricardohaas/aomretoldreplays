const STORAGE_KEY = 'aomstats_video_links';

let videoLinks = {};

async function loadLinks() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  videoLinks = result[STORAGE_KEY] || {};
}

function extractGameId(text) {
  const match = text.match(/ID:\s*(\d+)/);
  return match ? match[1] : null;
}

function findAndLinkIds() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (node.parentElement?.closest('.aom-video-link, script, style, svg')) {
          return NodeFilter.FILTER_REJECT;
        }
        if (/ID:\s*\d+/.test(node.textContent)) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      }
    }
  );

  const processedNodes = new Set();

  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent;
    const gameId = extractGameId(text);
    if (!gameId) continue;

    const parent = node.parentElement;
    if (!parent || processedNodes.has(parent)) continue;

    if (videoLinks[gameId]) {
      const existingLink = parent.querySelector('.aom-video-link');
      if (existingLink) continue;

      const link = document.createElement('a');
      link.href = videoLinks[gameId];
      link.target = '_blank';
      link.className = 'aom-video-link';
      link.title = `Abrir vídeo no YouTube (ID: ${gameId})`;
      link.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000" width="18" height="18">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      `;
      parent.appendChild(link);
      processedNodes.add(parent);
    }
  }
}

async function init() {
  await loadLinks();
  findAndLinkIds();

  const observer = new MutationObserver(() => {
    findAndLinkIds();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

init();
