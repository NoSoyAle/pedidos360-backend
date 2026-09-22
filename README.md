# Pedidos360 — Evaluación Parcial N°1 (Encargo)

Sistema de gestión de pedidos (CRUD de productos, clientes y pedidos) con arquitectura cloud native:

- **Frontend**: Angular + MSAL (autenticación con **Microsoft Entra ID / Azure AD**).
- **Backend**: microservicios **Spring Boot** (clientes, productos, pedidos) que validan el **JWT** recibido del IDaaS. Desplegados en **EC2**.
- **API de entrada**: **AWS API Gateway** como puerta de entrada única a los microservicios.
- **Base de datos**: PostgreSQL (entidad/repositorio JPA por microservicio).

```
                    ┌──────────────────────┐
  Usuario ────────► │ Frontend Angular      │  (S3 + CloudFront)
   (MSAL login)     │  (MSAL / JWT)         │
                    └──────────┬───────────┘
                               │  HTTPS
         Authorization: Bearer <JWT de Entra ID>
                               ▼
                    ┌──────────────────────┐
                    │ AWS API Gateway      │  (HTTP proxy -> EC2)
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ NGINX (en EC2)       │
                    └──────┬───────┬───────┘
                           │       │
                ┌──────────▼──┐ ┌──▼────────────┐ ┌─────────▼──────┐
                │ Clientes MS │ │ Productos MS  │ │ Pedidos MS     │
                │ (Spring)    │ │ (Spring)      │ │ (Spring)       │
                └──────┬──────┘ └──────┬────────┘ └───────┬────────┘
                       │              │                  │
                       └──────────────┴────────────┬─────┘
                                                  ▼
                                         ┌──────────────────┐
                                         │ PostgreSQL (RDS  │
                                         │ o contenedor EC2)│
                                         └──────────────────┘
```

---

## 1. Repositorios

La entrega exige **dos repositorios** de GitHub (según lo que corresponde a cada tecnología, con sus `.gitignore`):

| Repositorio | Contenido |
|---|---|
| `pedidos360-backend` | `/backend` + `docker-compose.prod.yml` + `aws/ec2` + `aws/api-gateway` |
| `pedidos360-frontend` | `/frontend` |

Ejemplo de creación:

```bash
# Repositorio backend
cd Pedidos360/backend
git init && git add . && git commit -m "Backend Pedidos360: microservicios Spring Boot"
git remote add origin https://github.com/TU_USUARIO/pedidos360-backend.git
git push -u origin main

# Repositorio frontend
cd Pedidos360/frontend
git init && git add . && git commit -m "Frontend Pedidos360: Angular + MSAL"
git remote add origin https://github.com/TU_USUARIO/pedidos360-frontend.git
git push -u origin main
```

---

## 2. Configuración de Microsoft Entra ID (Azure AD)

> Los valores `AZURE_CLIENT_ID`, `AZURE_TENANT_ID` y el scope de tu API reemplazan los placeholders en:
> `frontend/src/app/auth.config.ts` (guarda los reales en variables de entorno / script de build, no en GitHub).

1. En **Entra ID**, ve a *App registrations* → *New registration*.
   - **Frontend (SPA)**: tipo cuenta *Single-page application*, redirect URI = `http://localhost:4200` (y la URL de CloudFront).
   - **Backend (API)**: Expose an API → application ID URI = `api://pedidos360` → scope `access_as_user`.
2. Configura *Authentication* → *Implicit & hybrid flows*: **Access tokens** y **ID tokens** (necesario en SPA).
3. Anota:
   - **Tenant ID** → `AZURE_ISSUER_URI=https://login.microsoftonline.com/<TENANT_ID>/v2.0`
   - **Client ID del backend** → `AZURE_CLIENT_ID` (propiedad Spring).
   - **Client ID del SPA** → `clientId` en `auth.config.ts` y `MSAL_CLIENT_ID` (script de despliegue).

---

## 3. Despliegue del backend en EC2

### Opción A: User Data (nueva instancia)
Copia `aws/ec2/user-data.sh` en *Launch instance → User data*. La instancia instalará Docker, clonará el repo y levantará todo.

> Requiere `docker-compose.prod.yml` en el repo backend y las variables en el script.

### Opción B: Despliegue a una EC2 existente
```bash
chmod +x aws/ec2/deploy-ec2.sh
./aws/ec2/deploy-ec2.sh ubuntu@<IP_EC2> /opt/pedidos360
```

Ambos levantan:
- PostgreSQL (puerto interno)
- 3 microservicios Spring Boot (`clientes`, `productos`, `pedidos`)
- NGINX que enruta `/api/clientes`, `/api/productos`, `/api/pedidos` al microservicio correcto (puerto **80**)

Verificación:
```bash
curl http://<IP_EC2>/api/health
```

---

## 4. AWS API Gateway

La plantilla `aws/api-gateway/pedidos360-api-openapi.yaml` define los endpoints y exige el header `Authorization`.

1. Consola AWS → *API Gateway* → *Create API* → **REST API** → *Import* → sube `pedidos360-api-openapi.yaml`.
2. Crea el **recurso integrado (HTTP proxy)**:
   - Cada `{proxy+}` / método apunta a `http://<IP_PUBLICA_EC2>:80/api/...`
   - Método passthrough activado (la validación del JWT la hace el microservicio).
3. *Deploy API* → nuevo Stage (`dev`) → copia la **URL de invocación** (ej. `https://xxxx.execute-api.us-east-1.amazonaws.com/dev`).
4. Actualiza `API_BASE` (frontend) con esa URL.

---

## 5. Despliegue del frontend en S3 + CloudFront

```bash
chmod +x aws/s3/deploy-frontend.sh
./aws/s3/deploy-frontend.sh <bucket> <cloudfront-id> <API_URL_BASE> <MSAL_CLIENT_ID> <MSAL_TENANT_ID>
```

El script:
1. Regenera `frontend/src/app/api.base.ts` con la URL del API Gateway.
2. Reemplaza los placeholders MSAL en `auth.config.ts`.
3. Compila con `ng build --configuration production`.
4. Sincroniza `dist` a S3 y configura hosting estático.
5. Invalida la caché de CloudFront.

---

## 6. Verificación final

```bash
# Backend: compilar y testear
cd backend && mvn test && mvn package -DskipTests

# Frontend: compilar
cd frontend && npx ng build --configuration production

# Flujo completo
# 1) Abre la URL de CloudFront -> redirige al login de Entra ID
# 2) Inicia sesión con cuenta de la organización
# 3) El frontend pide un token (MSAL) y lo adjunta (Authorization: Bearer)
# 4) API Gateway enruta -> NGINX -> microservicio que valida el JWT (issuer + firma)
# 5) CRUD de productos, clientes y pedidos funcional
```

---

## 7. Estructura de carpetas

```
Pedidos360/
├── backend/
│   ├── pom.xml                     # POM padre multi-módulo
│   ├── common-sec/                 # Seguridad compartida (Resource Server JWT)
│   ├── clientes-service/           # Microservicio Clientes
│   ├── productos-service/          # Microservicio Productos
│   ├── pedidos-service/            # Microservicio Pedidos
│   └── Dockerfile                  # Imagen genérica por microservicio
├── frontend/
│   ├── src/app/auth.config.ts      # Config MSAL (Entra ID)
│   ├── src/app/api.base.ts         # URL base de la API (regenerada en deploy)
│   └── src/app/...                 # Vistas CRUD + interceptor JWT
├── aws/
│   ├── ec2/                        # user-data.sh + deploy-ec2.sh
│   ├── api-gateway/                # plantilla OpenAPI del API Gateway
│   ├── nginx/                      # nginx.conf interno (enrutado por microservicio)
│   └── s3/                         # deploy-frontend.sh
├── docker-compose.prod.yml         # Stack completo para EC2
└── .env.example
```