# SaviaUp Frontend Admin

Panel privado de administración global para SaviaUp. Es una aplicación Angular independiente del frontend operacional de restaurantes y consume exclusivamente `saviaup.backend.admin`.

## Capacidades

- autenticación real con identidad administrativa independiente;
- dashboard global y auditoría reciente;
- usuarios, membresías, reactivación, reasignación y reset de contraseña;
- organizaciones, owners y límite efectivo de permisos;
- monitoreo de órdenes, ventas, mesas y cajas;
- creación y edición de planes, pricing y capacidades;
- asignación de planes a organizaciones con confirmación explícita;
- excepciones de permisos por organización.

## Desarrollo local

Requisitos: Node.js 22+, npm 10+ y la API administrativa en `http://localhost:5100`.

```bash
npm install
npm start
```

La aplicación se sirve en `http://localhost:4300`. No hay credenciales quemadas: el primer usuario se crea mediante el bootstrap seguro documentado en `../saviaup.backend.admin/README.md`.

## Arquitectura

```text
Componente → AdminStore (Signals) → contrato de repositorio → adaptador HTTP
```

- los componentes no usan `HttpClient`;
- el token vive en `sessionStorage` y el interceptor lo agrega solo al API administrativo;
- `environment.useMockApi` está en `false`; los mocks permanecen únicamente para pruebas y desarrollo aislado;
- todas las rutas privadas están protegidas por `authGuard`;
- las mutaciones sensibles requieren confirmación en UI y autorización `SUPER_ADMIN` en backend.

## Entornos

| Entorno    | API                             |
| ---------- | ------------------------------- |
| Desarrollo | `http://localhost:5100`         |
| Producción | `https://admin-api.saviaup.com` |

Antes de desplegar, ajusta el host productivo si la infraestructura usa otro dominio y registra el origen del frontend en `Cors:AllowedOrigins` del backend.

## Rutas

| Ruta                 | Propósito                                   |
| -------------------- | ------------------------------------------- |
| `/login`             | Acceso administrativo                       |
| `/dashboard`         | Resumen ejecutivo y auditoría               |
| `/users`             | Usuarios, membresías y recuperación         |
| `/organizations`     | Catálogo global de organizaciones           |
| `/organizations/:id` | Owner, plan, permisos, miembros y operación |
| `/operation`         | Supervisión consolidada                     |
| `/plans`             | Planes, pricing y capacidades               |

## Validación

```bash
npm run format:check
npm run lint
npm test -- --watch=false
npm run build
```
