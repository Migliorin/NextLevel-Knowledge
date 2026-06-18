# Contrato Redis para status de extração da IA

Este contrato define como o serviço de IA deve atualizar o status de extração dos PDFs no Redis.

## Identificador do documento

O backend envia para a IA o `documentProtocolId` pelo websocket de extração.

Esse valor é o nome do objeto PDF no MinIO sem a extensão `.pdf`.

Exemplo:

```text
MinIO path: 12/6f5c4f4d-8c34-43a6-8b61-caf2e4bb67d8.pdf
documentProtocolId: 6f5c4f4d-8c34-43a6-8b61-caf2e4bb67d8
```

## Chave Redis

Chave padrão:

```text
ai:document:{documentProtocolId}:status
```

Exemplo:

```text
ai:document:6f5c4f4d-8c34-43a6-8b61-caf2e4bb67d8:status
```

Se o backend tiver a variável `AI_DOCUMENT_STATUS_REDIS_KEY_PREFIX`, a chave passa a ser:

```text
{AI_DOCUMENT_STATUS_REDIS_KEY_PREFIX}:{documentProtocolId}
```

O prefixo customizado também precisa ser permitido no ACL do Redis. No `docker/secrets/redis_users.acl` atual, os usuários `backend` e `ai-worker` já podem acessar `ai:*`, então mantenha o prefixo dentro de `ai:*` se não quiser alterar ACL.

## Status permitidos

```text
0 = PENDING
1 = EXTRACTING
2 = EXTRACTED
3 = ERROR
```

## Payload recomendado

Grave o valor como JSON string:

```json
{
  "documentProtocolId": "6f5c4f4d-8c34-43a6-8b61-caf2e4bb67d8",
  "status": 1,
  "statusId": 1,
  "progress": 45,
  "message": "Executando OCR",
  "updatedAt": "2026-06-18T15:20:00.000Z"
}
```

O backend também aceita temporariamente valores simples:

```text
1
EXTRACTING
{"status":"EXTRACTING"}
{"statusId":1}
```

## Quando atualizar

1. Ao receber o pedido de extração:
   - O backend já grava `EXTRACTING`.
   - A IA pode repetir `EXTRACTING` com `progress: 0`.

2. Durante OCR, parsing, chunking e indexação:
   - A IA deve manter `status/statusId` como `EXTRACTING`.
   - Atualize `progress` e `message` se disponíveis.

3. Ao concluir tudo que deixa o documento consultável pelo chat:
   - Grave `EXTRACTED`.
   - Use `status: 2` e `statusId: 2`.

4. Se qualquer etapa falhar:
   - Grave `ERROR`.
   - Use `status: 3` e `statusId: 3`.
   - Inclua `message` com o motivo resumido.

## Observação de sincronização

O frontend não acessa Redis diretamente. Ele consulta `GET /files`.

Ao listar arquivos, o backend lê o Redis, calcula o status efetivo e sincroniza o `statusId` no Postgres quando detectar mudança.
