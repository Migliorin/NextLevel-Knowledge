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
  chmod 600 "$target_file"
  echo "Criado: $target_file"
}

write_if_missing "$TARGET_DIR/minio_root_user.txt" "minioadmin"
write_if_missing "$TARGET_DIR/minio_root_password.txt" "troque-esta-senha-root"
write_if_missing "$TARGET_DIR/minio_backend_access_key.txt" "backend-upload-user"
write_if_missing "$TARGET_DIR/minio_backend_secret_key.txt" "troque-esta-senha-backend"
write_if_missing "$TARGET_DIR/minio_ai_access_key.txt" "ai-reader-user"
write_if_missing "$TARGET_DIR/minio_ai_secret_key.txt" "troque-esta-senha-ia"

echo
echo "Revise os arquivos em $TARGET_DIR antes de subir o compose."
