#!/usr/bin/env bash
# =====================================================================
# Despliegue del frontend Angular a S3 + CloudFront
# Requisitos:
#   - bucket S3 creado para hosting estático (public-read*)
#   - AWS CLI configurado
# =====================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BUCKET="${1:?Uso: $0 <nombre-bucket-s3> [distribution-id] [api-url-base] [msal-client-id] [msal-tenant-id]}"
DISTRIBUTION_ID="${2:-}"
API_URL_BASE="${3:-https://TU_API_GATEWAY.amazonaws.com}"
MSAL_CLIENT_ID="${4:-AZURE_CLIENT_ID_A_REEMPLAZAR}"
MSAL_TENANT_ID="${5:-AZURE_TENANT_ID_A_REEMPLAZAR}"

echo "==> Configurando @env para el build ..."

# Sobrescribe la constante API_BASE y los valores de MSAL antes de compilar
ENV_FILE="$ROOT/frontend/src/app/api.base.ts"
cat > "$ENV_FILE" <<EOF
// Generado automáticamente por aws/s3/deploy-frontend.sh — no editar manualmente.
export const API_BASE = '${API_URL_BASE}';
EOF

CONFIG_FILE="$ROOT/frontend/src/app/auth.config.ts"
sed -i.bak \
  -e "s#AZURE_CLIENT_ID_A_REEMPLAZAR#${MSAL_CLIENT_ID}#g" \
  -e "s#AZURE_TENANT_ID_A_REEMPLAZAR#${MSAL_TENANT_ID}#g" \
  "$CONFIG_FILE"
rm -f "$CONFIG_FILE.bak"

echo "==> Compilando producción ..."
cd "$ROOT/frontend"
npx ng build --configuration production

echo "==> Sincronizando con S3 ..."
aws s3 sync dist/pedidos360-web/browser s3://${BUCKET}/ \
  --delete \
  --exclude "*.map"

echo "==> Publicando index.html como documento del sitio ..."
aws s3 website s3://${BUCKET}/ --index-document index.html --error-document index.html

echo "==> Estableciendo política pública ..."
aws s3api put-bucket-policy --bucket "$BUCKET" --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [{
    \"Sid\": \"PublicReadGetObject\",
    \"Effect\": \"Allow\",
    \"Principal\": \"*\",
    \"Action\": \"s3:GetObject\",
    \"Resource\": \"arn:aws:s3:::${BUCKET}/*\"
  }]
}"

echo "==> Configurando CloudFront ..."
if [ -n "$DISTRIBUTION_ID" ]; then
  aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" | tail -3
  echo "  Invalidation enviada para $DISTRIBUTION_ID"
else
  echo "  Omitido: pasa el ID de distribución CloudFront para invalidar la caché."
fi

echo "==> Listo. Sitio en: http://${BUCKET}.s3-website-<region>.amazonaws.com"