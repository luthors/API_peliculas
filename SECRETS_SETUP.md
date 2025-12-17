# Guía de Configuración de Secretos - GitHub Actions

## 🔐 Secretos Requeridos

Esta guía te ayudará a configurar todos los secretos necesarios para que el pipeline CI/CD funcione correctamente.

## 📋 Lista Completa de Secretos

### 🚂 Railway (Backend)

| Nombre del Secret | Descripción | Obligatorio |
|-------------------|-------------|-------------|
| `RAILWAY_TOKEN` | Token de API de Railway | ✅ Sí |
| `RAILWAY_PROJECT_ID` | ID del proyecto en Railway | ⚠️ Opcional* |
| `RAILWAY_SERVICE_ID` | ID del servicio en Railway | ⚠️ Opcional* |

\* Opcional si usas Railway auto-deploy desde GitHub

### ▲ Vercel (Frontend)

| Nombre del Secret | Descripción | Obligatorio |
|-------------------|-------------|-------------|
| `VERCEL_TOKEN` | Token de Vercel | ✅ Sí |
| `VERCEL_ORG_ID` | ID de tu organización/usuario Vercel | ✅ Sí |
| `VERCEL_PROJECT_ID` | ID del proyecto Vercel | ✅ Sí |

### 🔧 Aplicación

| Nombre del Secret | Descripción | Obligatorio |
|-------------------|-------------|-------------|
| `MONGODB_URI_PROD` | URI de MongoDB Atlas para producción | ✅ Sí |
| `JWT_SECRET_PROD` | Secret para firmar tokens JWT | ✅ Sí |
| `REACT_APP_API_URL` | URL del backend en producción | ⚠️ Opcional** |

\** Opcional si usas valores por defecto

---

## 🛠️ Cómo Obtener Cada Secret

### 1. Railway Token

**Pasos**:
1. Ve a [railway.app](https://railway.app)
2. Crea una cuenta o inicia sesión
3. Click en tu avatar (esquina superior derecha)
4. Settings → Tokens
5. Click "Create Token"
6. Copia el token (solo se muestra una vez)

**Comando para configurar**:
```bash
gh secret set RAILWAY_TOKEN
# Pega el token cuando se solicite
```

### 2. Railway Project ID y Service ID (Opcional)

**Opción A: Via CLI**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# En el directorio del backend
cd API_peliculas_IUDigital-main

# Crear proyecto
railway init

# Ver IDs
railway status
```

**Opción B: Via Dashboard**
1. Ve al proyecto en Railway
2. URL se ve así: `railway.app/project/{PROJECT_ID}`
3. Click en el servicio → URL: `.../{PROJECT_ID}/service/{SERVICE_ID}`

**Comando para configurar**:
```bash
gh secret set RAILWAY_PROJECT_ID
gh secret set RAILWAY_SERVICE_ID
```

### 3. Vercel Token

**Pasos**:
1. Ve a [vercel.com](https://vercel.com)
2. Crea cuenta o inicia sesión
3. Settings → Tokens
4. "Create Token"
5. Dale un nombre (ej: "GitHub Actions")
6. Scope: "Full Account"
7. Copia el token

**Comando para configurar**:
```bash
gh secret set VERCEL_TOKEN
```

### 4. Vercel Org ID y Project ID

**Método 1: Desplegar primero manualmente**
```bash
# Instalar Vercel CLI
npm install -g vercel

# En directorio del frontend
cd frontend

# Login
vercel login

# Deploy (sigue el wizard)
vercel

# Los IDs se guardan en .vercel/project.json
cat .vercel/project.json
```

El archivo `.vercel/project.json` se verá así:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

**Método 2: Desde Dashboard**
1. Ve a tu proyecto en Vercel
2. Settings → General
3. En la sección "Project ID" encontrarás ambos IDs

**Comando para configurar**:
```bash
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
```

### 5. MongoDB URI (Producción)

**Opción A: MongoDB Atlas (Recomendado)**

1. Ve a [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crea cuenta gratuita
3. Create New Cluster (M0 Sandbox - Gratuito)
4. Database Access → Add New Database User
   - Username: `admin_peliculas`
   - Password: (genera uno fuerte o usa autogenerado)
5. Network Access → Add IP Address → "Allow Access from Anywhere" (0.0.0.0/0)
6. Database → Connect → "Connect your application"
7. Copia la connection string:
   ```
   mongodb+srv://admin_peliculas:<password>@cluster0.xxxxx.mongodb.net/peliculas_db?retryWrites=true&w=majority
   ```
8. Reemplaza `<password>` con tu password real

**Opción B: MongoDB en Railway**
```bash
railway add --database mongodb
railway variables get MONGO_URL
```

**Comando para configurar**:
```bash
gh secret set MONGODB_URI_PROD
# Pega: mongodb+srv://usuario:password@host/peliculas_db
```

### 6. JWT Secret

**Generar secret seguro**:

```bash
# Método 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Método 2: OpenSSL
openssl rand -hex 64

# Método 3: PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Copia el resultado (debe ser un string largo y aleatorio).

**Comando para configurar**:
```bash
gh secret set JWT_SECRET_PROD
```

### 7. React App API URL

Esta es la URL donde se desplegará tu backend en Railway.

**Antes del primer deploy**: Usa un placeholder
```
https://peliculas-backend.railway.app/api/v1
```

**Después del primer deploy**: Obtén la URL real
1. Ve a tu proyecto en Railway
2. Settings → Domains
3. Railway asigna: `https://tu-servicio.up.railway.app`
4. Agrega `/api/v1` al final

**Comando para configurar**:
```bash
gh secret set REACT_APP_API_URL
# Pega: https://tu-backend.railway.app/api/v1
```

---

## 🚀 Configuración Rápida con Script

**Prerequisitos**:
- GitHub CLI instalado (`gh`)
- Cuentas en Railway y Vercel configuradas

```bash
# Navega al directorio del proyecto
cd "c:\Luis Toro\IUDigital\Peliculas"

# Configurar secretos uno por uno
echo "🔐 Configurando secretos de GitHub..."

# Railway
gh secret set RAILWAY_TOKEN
gh secret set RAILWAY_PROJECT_ID
gh secret set RAILWAY_SERVICE_ID

# Vercel
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID

# Aplicación
gh secret set MONGODB_URI_PROD
gh secret set JWT_SECRET_PROD
gh secret set REACT_APP_API_URL

echo "✅ Configuración completada!"
```

---

## ✅ Verificar Secretos Configurados

```bash
# Listar todos los secretos (sin mostrar valores)
gh secret list

# Debería mostrar:
# RAILWAY_TOKEN
# RAILWAY_PROJECT_ID (opcional)
# RAILWAY_SERVICE_ID (opcional)
# VERCEL_TOKEN
# VERCEL_ORG_ID
# VERCEL_PROJECT_ID
# MONGODB_URI_PROD
# JWT_SECRET_PROD
# REACT_APP_API_URL (opcional)
```

---

## 🔄 Actualizar Secretos

Si necesitas cambiar un secret:

```bash
# Eliminar
gh secret remove NOMBRE_DEL_SECRET

# Re-crear
gh secret set NOMBRE_DEL_SECRET
```

O simplemente sobrescribir:
```bash
gh secret set NOMBRE_DEL_SECRET
# Pega el nuevo valor
```

---

## 🛡️ Mejores Prácticas de Seguridad

✅ **Nunca** commits secretos en el código  
✅ **Nunca** compartas secretos por chat/email  
✅ **Rota** secretos regularmente (cada 3-6 meses)  
✅ **Usa** secretos diferentes para dev/staging/prod  
✅ **Revisa** logs de acceso a secretos regularmente  
✅ **Revoca** tokens inmediatamente si se comprometen  

---

## ⚠️ Troubleshooting

### Error: "secret not found"
```bash
# Verifica que el nombre del secret esté correcto
gh secret list

# Re-configura el secret
gh secret set NOMBRE_CORRECTO
```

### Error: "invalid token" en Railway/Vercel
```bash
# Verifica que el token no haya expirado
# Genera un nuevo token en el dashboard
# Actualiza el secret
gh secret set RAILWAY_TOKEN  # o VERCEL_TOKEN
```

### Workflow no encuentra variables de entorno
```bash
# Verifica el nombre exacto en el workflow .yml
# Los nombres deben coincidir exactamente (case-sensitive)
```

---

## 📋 Checklist Final

Antes de hacer push para ejecutar el pipeline:

- [ ] Todos los secretos configurados (`gh secret list` muestra 6-9 items)
- [ ] MongoDB Atlas cluster creado y accesible
- [ ] Railway proyecto creado (o token válido)
- [ ] Vercel proyecto creado con IDs obtenidos
- [ ] JWT secret generado de forma segura (64+ caracteres)
- [ ] URLs de producción confirmadas
- [ ] `.env` en `.gitignore` (no versionar secretos locales)

---

## 🎯 Siguiente Paso

Una vez configurados todos los secretos:

```bash
# Hacer commit de los workflows
git add .github/
git commit -m "feat: add CI/CD pipeline with Blue/Green deployment"
git push origin main

# El pipeline se ejecutará automáticamente
```

Monitorea en: **https://github.com/luthors/API_peliculas/actions**

---

**¿Necesitas ayuda?** Consulta [.github/workflows/README.md](./.github/workflows/README.md) para más detalles.
