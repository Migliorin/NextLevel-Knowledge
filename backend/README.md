# NextLevel Knowledge Backend

API backend da plataforma NextLevel Knowledge, construída com NestJS, Prisma, PostgreSQL e MinIO.

## Stack

- NestJS
- Prisma
- PostgreSQL
- MinIO
- Swagger
- JWT

## Requisitos

- Node.js 20+
- pnpm
- Docker e Docker Compose

## Configuração

1. Instale as dependências:

```bash
pnpm install
```

2. Crie o arquivo de ambiente a partir do template:

```bash
cp .env.template .env
```

3. Ajuste os valores do `.env` conforme seu ambiente.

## Ambiente local

O projeto possui um `docker/docker-compose.yml` para subir:

- PostgreSQL
- MinIO
- inicialização de credenciais e policies do MinIO

Arquivos sensíveis do Docker devem ficar em `docker/secrets/`, pasta que já está ignorada no Git.

## Banco de dados

Executar migrations:

```bash
pnpm exec prisma migrate deploy
```

Executar seed:

```bash
pnpm run seed
```

## Executando a aplicação

Desenvolvimento:

```bash
pnpm run start:dev
```

Produção:

```bash
pnpm run build
pnpm run start:prod
```

## Documentação da API

Com a aplicação rodando, o Swagger fica disponível em:

```text
/docs
```

## Principais módulos

- `auth`: registro, login e autenticação JWT
- `upload`: upload de PDFs autenticados
- `minio`: integração com armazenamento de objetos
- `prisma`: acesso ao banco de dados

