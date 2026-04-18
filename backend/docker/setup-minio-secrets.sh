#!/bin/sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
TARGET_DIR="$SCRIPT_DIR/secrets"

mkdir -p "$TARGET_DIR"

write_if_missing() {
  target_file="$1"
  content="$2"

  if [ -f "$target_file" ]; then
    echo "Mantido: $target_file"
    return
  fi

  printf '%s\n' "$content" > "$target_file"
  chmod +r "$target_file"
  echo "Criado: $target_file"
}

write_redis_acl() {
  target_file="$TARGET_DIR/redis_users.acl"
  backend_user="$(cat "$TARGET_DIR/redis_backend_user.txt")"
  backend_password="$(cat "$TARGET_DIR/redis_backend_password.txt")"
  ai_user="$(cat "$TARGET_DIR/redis_ai_user.txt")"
  ai_password="$(cat "$TARGET_DIR/redis_ai_password.txt")"

  cat > "$target_file" <<EOF
user default off
user $backend_user on >$backend_password ~auth:* ~ai:* ~jobs:* ~bull:* +@all
user $ai_user on >$ai_password ~ai:* ~jobs:* ~bull:* +@all
EOF
  chmod 600 "$target_file"
  echo "Atualizado: $target_file"
}

write_if_missing "$TARGET_DIR/minio_root_user.txt" "minioadmin"
write_if_missing "$TARGET_DIR/minio_root_password.txt" "troque-esta-senha-root"
write_if_missing "$TARGET_DIR/minio_backend_access_key.txt" "backend-upload-user"
write_if_missing "$TARGET_DIR/minio_backend_secret_key.txt" "troque-esta-senha-backend"
write_if_missing "$TARGET_DIR/minio_ai_access_key.txt" "ai-reader-user"
write_if_missing "$TARGET_DIR/minio_ai_secret_key.txt" "troque-esta-senha-ia"
write_if_missing "$TARGET_DIR/postgres_root_user.txt" "postgres"
write_if_missing "$TARGET_DIR/postgres_root_password.txt" "troque-esta-senha-root"
write_if_missing "$TARGET_DIR/redis_backend_user.txt" "backend"
write_if_missing "$TARGET_DIR/redis_backend_password.txt" "troque-esta-senha-redis-backend"
write_if_missing "$TARGET_DIR/redis_ai_user.txt" "ai-worker"
write_if_missing "$TARGET_DIR/redis_ai_password.txt" "troque-esta-senha-redis-ia"
write_redis_acl

echo
echo "Revise os arquivos em $TARGET_DIR antes de subir o compose."
