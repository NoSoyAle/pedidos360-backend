#!/usr/bin/env bash
# =====================================================================
# User Data - bootstrap de la instancia EC2 para Pedidos360
# Configurable en la consola de EC2 > Launch instance > Advanced > User data
# =====================================================================
set -euo pipefail

# --- Variables (edítalas según tu entorno) ---
export DEBIAN_FRONTEND=noninteractive
GITO_URL="https://github.com/TU_USUARIO/pedidos360-backend.git"
APP_DIR="/opt/pedidos360"

# Necesarias para docker-compose.prod.yml (llegan como user data raw en producción:
# se recomienda usar Parameter Store / Secrets Manager; aquí se pasan vía archivo .env)
export DB_USERNAME="pedidos360"
export DB_PASSWORD="REEMPLAZAR_CONTRASENA_SEGURA"
export AZURE_ISSUER_URI="https://login.microsoftonline.com/TU_TENANT_ID/v2.0"
export AZURE_CLIENT_ID="TU_CLIENT_ID_API"

echo "==> Actualizando sistema..."
apt-get update -y && apt-get upgrade -y

echo "==> Instalando Docker..."
apt-get install -y \
    ca-certificates curl gnupg lsb-release git make apt-transport-https

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

echo "==> Agregando usuario ubuntu al grupo docker..."
usermod -aG docker ubuntu

echo "==> Clonando el proyecto..."
mkdir -p "$APP_DIR"
if [ -d "$APP_DIR/Pedidos360" ]; then
  cd "$APP_DIR/Pedidos360" && git pull
else
  git clone "$GITO_URL" "$APP_DIR/Pedidos360"
  cd "$APP_DIR/Pedidos360"
fi

echo "==> Creando .env a partir de variables..."
cat > "$APP_DIR/Pedidos360/.env" <<EOF
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
AZURE_ISSUER_URI=${AZURE_ISSUER_URI}
AZURE_CLIENT_ID=${AZURE_CLIENT_ID}
EOF

echo "==> Levantando servicios..."
cd "$APP_DIR/Pedidos360"
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Bootstrap finalizado. Revisa con: docker compose -f docker-compose.prod.yml ps"