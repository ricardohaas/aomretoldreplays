# AOM Stats Video Linker

Sistema para vincular vídeos do YouTube a replays no [aomstats.io](https://aomstats.io/replays).

## Estrutura

```
app/          - Aplicação desktop para cadastrar IDs + URLs
extension/    - Extensão Chrome que exibe os links na página de replays
```

## Como usar

### 1. App de cadastro

Abra `app/index.html` no navegador. Use o formulário para adicionar partidas:

- **ID da Partida**: número que aparece como `ID: 123456` na página de replays
- **URL do Vídeo**: link do YouTube

Clique em **Exportar JSON** para gerar o arquivo `aomstats-links.json`.

### 2. Extensão Chrome

1. Abra `chrome://extensions/`
2. Ative "Modo do desenvolvedor"
3. Clique em "Carregar sem compactação"
4. Selecione a pasta `extension/`
5. Clique no ícone da extensão e escolha:

   - **Arquivo**: importe o JSON manualmente (igual antes)
   - **URL (GitHub)**: cole a URL raw do GitHub e clique "Baixar da URL" — a extensão salva a URL e sempre usará os dados atualizados

   Exemplo de URL raw: `https://raw.githubusercontent.com/seu-usuario/seu-repo/main/aomstats-links.json`

Os ícones do YouTube aparecerão automaticamente ao lado dos IDs na página [aomstats.io/replays](https://aomstats.io/replays).

### Formato do JSON

```json
[
  { "id": "40517439", "url": "https://www.youtube.com/watch?v=..." },
  { "id": "40517645", "url": "https://youtu.be/..." }
]
```
