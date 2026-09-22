#!/usr/bin/env bash
# =====================================================================
# Despliegue manual rápido hacia una EC2 existente (SSH)
# Uso:  ./deploy-ec2.sh ec2-user@54.xxx.xxx.xxx /ruta/al/repo
# =====================================================================
set -euo pipefail

TARGET="${1:?Uso: $0 <user@host> <ruta-destino>}"
DEST="${2:-/opt/pedidos360}"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND_DIR="$ROOT/backend"

echo "==> Sincronizando backend (excluye target/ y node_modules) ..."
rsync -az --delete \
  --exclude '**/target' --exclude '.git' \
  -e ssh "$BACKEND_DIR/" "$TARGET:$DEST/backend/"

echo "==> Sincronizando docker-compose y nginx ..."
rsync -az -e ssh "$ROOT/docker-compose.prod.yml" "$TARGET:$DEST/"
rsync -az -e ssh "$ROOT/aws/nginx/" "$TARGET:$DEST/aws/nginx/"

echo "==> Levantando servicios en la EC2 ..."
ssh "$TARGET" <<EOF
  set -euo pipefail
  cd "$DEST"
  cp -n .env.example .env 2>/dev/null || true
  docker compose -f docker-compose.prod.yml up -d --build
  docker compose -f docker-compose.prod.yml ps
  curl -s http://localhost:8080/api/health && echo
EOF

echo "==> Listo. Los microservicios responden en http://<IP_PUBLICA_EC2>/api/..."