# NextLevel Knowledge Frontend

Interface web da plataforma NextLevel Knowledge, construída com React, Vite e Tailwind CSS.

## Stack

- React
- Vite
- Tailwind CSS
- pnpm

## Requisitos

- Node.js 20+
- pnpm
- Backend da plataforma em execução

## Configuração

1. Instale as dependências:

```bash
pnpm install
```

2. Crie o arquivo de ambiente:

```bash
cp .env.template .env
```

3. Ajuste os valores do `.env` conforme seu ambiente.

Exemplo:

```env
VITE_API_BASE_URL=http://192.168.15.7:3000
```

O prefixo `VITE_` é obrigatório para variáveis expostas ao frontend pelo Vite.

## Executando a aplicação

Desenvolvimento:

```bash
pnpm run dev
```

Desenvolvimento expondo na rede local:

```bash
pnpm run dev --host 0.0.0.0
```

Produção:

```bash
pnpm run build
pnpm run preview
```

## Rotas

- `/login`: autenticação do usuário
- `/register`: cadastro do usuário
- `/dashboard`: upload e listagem de PDFs
- `/documents/:id`: visualização de PDF
- `/chat`: chat com IA vinculado a um PDF escolhido

## Principais módulos

- `pages`: telas da aplicação
- `components`: componentes compartilhados de interface
- `services`: chamadas HTTP e cache local
- `hooks`: hooks reutilizáveis
- `config`: configuração do frontend
- `routes`: definição das rotas da aplicação

## Funcionalidades

- Registro e login de usuários
- Upload de PDFs autenticado
- Listagem de PDFs do usuário
- Visualização de PDF no navegador
- Chat com IA por documento
- Cache do histórico do chat por documento até logout

## Observações

- O backend precisa permitir CORS quando frontend e backend estiverem em hosts diferentes.
- Mudanças no `.env` exigem reiniciar o servidor do Vite.
- Em deploy com rotas reais, configure o servidor para redirecionar rotas do frontend para `index.html`.
