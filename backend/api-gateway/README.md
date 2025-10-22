API Gateway
===========


Cómo probar localmente

1. Instala dependencias y arranca el auth-service (usa in-memory):

```powershell
cd ..\auth-service
npm install
$env:MONGO_URI=''; $env:PORT='3001'; npm run start:dev
```

2. Instala dependencias y arranca el API Gateway:

```powershell
cd ..\api-gateway
npm install
$env:PORT='3000'; npm run start:dev
```

3. Ejecuta el smoke-test (desde la raíz del repo):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
```

Notas
- El gateway por defecto reenvía rutas `/auth/*` y `/users/*` a `http://localhost:3001`. Si cambias puertos modifica `src/interface/controllers/gateway.controller.ts`.
- Si prefieres forzar in-memory en `auth-service` sin comentar código, inicia con `$env:MONGO_URI=''`.
