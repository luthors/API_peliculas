# GitHub Actions Workflows - Documentación

## 📋 Resumen

Este proyecto utiliza GitHub Actions para implementar un pipeline CI/CD completo con estrategia de despliegue Blue/Green.

## 🔄 Workflows Disponibles

### 1. CI - Tests Automáticos (`ci.yml`)

**Trigger**: Push o Pull Request a `main` o `develop`

**Propósito**: Ejecutar tests automáticos y lint para garantizar calidad del código

**Jobs**:
- `test-backend`: Ejecuta tests del backend con pnpm
- `test-frontend`: Ejecuta tests del frontend con npm
- `lint-backend`: Ejecuta linter del backend (no bloquea pipeline)
- `ci-summary`: Resumen del estado de todos los tests

**Variables requeridas**: Ninguna (usa valores por defecto para testing)

---

### 2. Build & Push Docker Images (`build-push.yml`)

**Trigger**: Push a `main` o manualmente con `workflow_dispatch`

**Propósito**: Construir imágenes Docker y publicarlas en GitHub Container Registry

**Jobs**:
- `build-backend`: Construye imagen del backend
- `build-frontend`: Construye imagen del frontend
- `build-summary`: Resumen del build

**Permisos requeridos**:
- `contents: read`
- `packages: write`

**Secretos utilizados**:
- `GITHUB_TOKEN` (automático)

**Tags generadas**:
- `latest` (solo en branch main)
- `main-{sha}` (con hash del commit)
- `{branch}` (nombre del branch)

---

### 3. Deploy - Blue/Green Strategy (`deploy.yml`)

**Trigger**: 
- Automático: Cuando `build-push.yml` completa exitosamente
- Manual: Via `workflow_dispatch`

**Propósito**: Desplegar aplicación con estrategia Blue/Green

**Jobs**:
1. `deploy-backend-green`: Despliega backend a Railway (ambiente green)
2. `deploy-frontend`: Despliega frontend a Vercel
3. `smoke-tests`: Ejecuta tests críticos en ambiente green
4. `switch-traffic`: Cambia tráfico de blue a green
5. `rollback-to-blue`: Ejecuta rollback si hay fallo (automático o manual)
6. `deployment-summary`: Resumen del despliegue

**Ambientes de GitHub**:
- `production-green`: Ambiente temporal para validación
- `production-blue`: Ambiente de producción actual
- `production`: Ambiente principal

## 🔑 Secretos Requeridos

Configurar en: **Settings → Secrets and variables → Actions → Repository secrets**

### Para Railway (Backend)

| Secret | Descripción | Cómo obtenerlo |
|--------|-------------|----------------|
| `RAILWAY_TOKEN` | Token de API de Railway | Railway Dashboard → Settings → Tokens |
| `RAILWAY_PROJECT_ID` | ID del proyecto Railway | URL del proyecto en Railway |
| `RAILWAY_SERVICE_ID` | ID del servicio Railway | Railway CLI: `railway service` |

### Para Vercel (Frontend)

| Secret | Descripción | Cómo obtenerlo |
|--------|-------------|----------------|
| `VERCEL_TOKEN` | Token de Vercel | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | ID de organización Vercel | `.vercel/project.json` después de primer deploy |
| `VERCEL_PROJECT_ID` | ID del proyecto Vercel | `.vercel/project.json` después de primer deploy |

### Para Aplicación

| Secret | Descripción | Requerido para |
|--------|-------------|----------------|
| `MONGODB_URI_PROD` | URI de MongoDB producción | Railway deployment |
| `JWT_SECRET_PROD` | Secret para JWT producción | Railway deployment |
| `REACT_APP_API_URL` | URL del backend | Build del frontend |

## 🚀 Configuración Inicial

### 1. Instalar Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### 2. Crear Proyecto en Railway

```bash
cd API_peliculas_IUDigital-main
railway init
railway up
```

Obtener IDs:
```bash
railway status
```

### 3. Configurar MongoDB en Railway

```bash
railway add --database mongodb
```

O usar MongoDB Atlas y configurar `MONGODB_URI_PROD` en secrets.

### 4. Instalar Vercel CLI y Configurar Proyecto

```bash
npm install -g vercel
cd frontend
vercel
```

Seguir el wizard de configuración. Los IDs se guardarán en `.vercel/project.json`.

### 5. Configurar Secretos en GitHub

```bash
# Railway
gh secret set RAILWAY_TOKEN --body "tu-token-aqui"
gh secret set RAILWAY_PROJECT_ID --body "tu-project-id"
gh secret set RAILWAY_SERVICE_ID --body "tu-service-id"

# Vercel
gh secret set VERCEL_TOKEN --body "tu-token-aqui"
gh secret set VERCEL_ORG_ID --body "tu-org-id"
gh secret set VERCEL_PROJECT_ID --body "tu-project-id"

# Aplicación
gh secret set MONGODB_URI_PROD --body "mongodb+srv://..."
gh secret set JWT_SECRET_PROD --body "tu-jwt-secret"
gh secret set REACT_APP_API_URL --body "https://tu-backend.railway.app/api/v1"
```

## 📊 Flujo del Pipeline

```
┌─────────────────┐
│   Git Push      │
│   to main       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   CI Workflow   │
│  ├─ Test Back   │
│  ├─ Test Front  │
│  └─ Lint        │
└────────┬────────┘
         │ ✅ Tests OK
         ▼
┌─────────────────┐
│ Build & Push    │
│  ├─ Build Back  │
│  ├─ Build Front │
│  └─ Push GHCR   │
└────────┬────────┘
         │ ✅ Build OK
         ▼
┌─────────────────┐
│ Deploy Green    │
│  ├─ Railway     │
│  ├─ Vercel      │
│  └─ Smoke Tests │
└────────┬────────┘
         │ ✅ Green OK
         ▼
┌─────────────────┐
│ Switch Traffic  │
│ Blue → Green    │
└────────┬────────┘
         │
         ▼ ✅ Done
┌─────────────────┐
│  Production     │
│  (Green)        │
└─────────────────┘
```

## 🔄 Estrategia Blue/Green

### Concepto

- **Blue**: Versión actual en producción
- **Green**: Nueva versión a desplegar

### Proceso

1. **Despliegue a Green**: Nueva versión se despliega en ambiente green
2. **Validación**: Health checks y smoke tests en green
3. **Switch**: Tráfico cambia de blue a green
4. **Monitoreo**: Se observan métricas por 1 minuto
5. **Rollback o Commit**:
   - Si green funciona: Blue se elimina, Green se convierte en Blue
   - Si green falla: Rollback automático a Blue

### Ventajas

- ✅ **Zero downtime**: No hay interrupción del servicio
- ✅ **Rollback rápido**: Volver a versión anterior es instantáneo
- ✅ **Testing en producción**: Green se prueba con tráfico real antes de switch completo
- ✅ **Seguridad**: Siempre hay una versión estable (blue) de respaldo

## 🛠️ Comandos Útiles

### Ver estado de workflows

```bash
gh run list
gh run view <run-id>
gh run watch
```

### Trigger manual de deploy

```bash
gh workflow run deploy.yml
```

### Ejecutar rollback manual

```bash
gh workflow run deploy.yml -f rollback=true
```

### Ver logs de workflow

```bash
gh run view --log
```

## 🐛 Troubleshooting

### Pipeline falla en tests

```bash
# Ejecutar tests localmente
cd API_peliculas_IUDigital-main
pnpm test

cd ../frontend
npm test
```

### Build de Docker falla

```bash
# Probar build local
docker build -t test-backend ./API_peliculas_IUDigital-main
docker build -t test-frontend ./frontend
```

### Deploy a Railway falla

```bash
# Verificar variables de entorno
railway variables

# Ver logs
railway logs
```

### Deploy a Vercel falla

```bash
# Verificar build local
cd frontend
vercel build

# Deploy manual
vercel --prod
```

## 📚 Recursos

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Blue-Green Deployment](https://martinfowler.com/bliki/BlueGreenDeployment.html)
