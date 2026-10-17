# 🍥 Shinobi Renascido — RPG de texto em chat

Um RPG de fã **não oficial** inspirado na manhã do episódio 1 de Naruto Clássico. Projetado para uso **pelo navegador do Android**, com interface de conversa: mensagens do Narrador, ações livres do jogador, campo de escrita fixo e ficha de personagem acessível pelo menu.

**🎮 Jogar:** https://educacaomggovbr00-web.github.io/shinobi-renascido-rpg/

## O RPG

- Você interpreta **Henrique Uchiha**, 12 anos, consciência Rick-138 e inteligência extraordinária.
- Henrique não conhece previamente os personagens, segredos ou acontecimentos do mundo ninja.
- Ele **aprende uma técnica ao observá-la uma única vez**, mas ainda precisa de chakra e capacidade física para executá-la.
- Foi criado por Hana e Daichi, seus pais adotivos de poucos recursos, em Konoha.
- **Só o jogador decide o que Henrique diz e faz.** O narrador representa o mundo, os NPCs e suas consequências.
- O relógio, a saúde, o chakra, o inventário, os jutsus aprendidos e o progresso ficam salvos no navegador do dispositivo.

## O que mudou na v0.3

A tela antiga tinha um prólogo gigante que escondia a conversa. Agora ela funciona como um chat mobile-first:

- O narrador já apresenta a primeira cena ao abrir o jogo;
- As mensagens aparecem de um lado e as ações do jogador do outro;
- O campo de escrita permanece visível, o texto cresce automaticamente e Enter envia;
- Sugestões de ações ficam compactas, próximas do campo de escrita, no começo;
- Ficha, status, técnicas, inventário e reinício foram para um menu lateral;
- Há indicador de resposta, histórico e salvamento local automático;
- O site identifica claramente quando está no **modo demonstração**.

## Narração por IA: o que funciona e o que ainda falta

**O GitHub Pages publica somente os arquivos estáticos.** O site hospedado lá **NÃO tem uma IA real conectada**: o modo demonstração responde com regras e textos predeterminados, mesmo que você escreva ações livres. Não é correto chamá-lo de ChatGPT ou de narrador IA completo.

O projeto inclui `server.js` para preparar a integração com a API de IA em um servidor Node.js. Para usá-la, é necessário hospedar esse servidor, fornecer `OPENAI_API_KEY` **apenas como segredo no servidor** e apontar o navegador para a hospedagem do servidor. Não coloque chaves em HTML, JavaScript de frontend ou commits do GitHub. A API é cobrada separadamente da assinatura do ChatGPT e pode ter custos.

**Segurança:** este backend ainda é protótipo e não deve ser exposto publicamente com uma chave sem adicionar autenticação, proteção de abuso e limite de gastos por conta. O limite básico por IP não basta como proteção.

### Rodar o backend num ambiente Linux na nuvem

```bash
npm install
npm test
OPENAI_API_KEY="(configure via segredo do servidor)" npm start
```

A porta padrão é `3000`. O frontend em `site/` solicita `POST /api/narrate` quando está hospedado no mesmo servidor Node. No domínio `github.io`, o app mantém a demonstração e não faz pedidos de IA inexistentes.

## Estrutura

- `site/index.html` — interface do chat publicada no GitHub Pages
- `site/style.css` — estilos móveis
- `site/app.js` — conversa, painel, salvamento e integração opcional
- `site/engine.js` — regras do jogo e demonstração narrativa
- `.github/workflows/pages.yml` — publicação pela branch `main`
- `server.js` — backend opcional para API de IA
- `tests/engine.test.js` — testes do motor
- `ROTEIRO.md` — regras e evolução do RPG

**Não oficial, sem vinculação com a franquia Naruto.**