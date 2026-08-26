# SaviaUp Frontend Admin

Panel privado de administración de plataforma para SaviaUp. Es una aplicación Angular independiente del frontend operativo de restaurantes y gastrobares.

## Estado actual

La primera versión incluye:

- acceso administrativo temporal aislado en el adaptador mock;
- dashboard con usuarios, organizaciones, volumen operativo y alertas;
- consulta y búsqueda global de usuarios;
- visualización de todas las organizaciones a las que pertenece cada usuario;
- reactivación/desactivación de membresías por organización;
- reasignación de membresías no propietarias entre organizaciones;
- solicitud administrativa de restablecimiento de contraseña;
- listado y detalle de organizaciones;
- activación/desactivación de organizaciones;
- administración del límite de permisos (`tenant_permissions`);
- transferencia de owner a otro miembro activo;
- supervisión del flujo operativo de caja, mesas, órdenes y cobro;
- modelo visual de planes y precios preparado para una fase posterior.

El backend actual de SaviaUp todavía no publica `/api/admin`. Por eso `environment.useMockApi` permanece temporalmente en `true`, incluso para validar el build de producción. **No se debe publicar esta versión en internet** hasta implementar autenticación real de administradores, autorización, auditoría y los endpoints globales.

## Desarrollo local

Requisitos: Node.js 22+ y npm 10+.

```bash
npm install
npm start
```

La aplicación se sirve en `http://localhost:4300`.

Acceso de desarrollo:

```text
Correo:     admin@saviaup.local
Contraseña: Savia123*
```

Las credenciales viven únicamente en `MockAdminAuthRepository`. La sesión mock se guarda en `sessionStorage`; nunca se persiste la contraseña.

## Validación

```bash
npm run format:check
npm run lint
npm test -- --watch=false
npm run build
```

## Arquitectura

El flujo de cada capacidad es:

```text
Componente → AdminStore (Signals) → ADMIN_REPOSITORY → Mock o HTTP
```

- `core/models`: modelos de UI de plataforma.
- `core/auth`: sesión administrativa temporal y adaptadores de autenticación.
- `core/data-access`: contrato de repositorio, adaptador mock y adaptador HTTP futuro.
- `core/store`: propietario del estado y de las mutaciones.
- `features`: rutas standalone y lazy de dashboard, usuarios, organizaciones, operación y planes.
- `layouts`: shell privado responsive.
- `shared`: iconografía reutilizable y primitivas compartidas.

Los componentes no conocen `HttpClient` ni deciden qué adaptador se encuentra activo.

## Rutas

| Ruta                 | Propósito                                                |
| -------------------- | -------------------------------------------------------- |
| `/login`             | Acceso temporal de plataforma                            |
| `/dashboard`         | Resumen ejecutivo y actividad reciente                   |
| `/users`             | Usuarios, membresías, reactivación, reasignación y reset |
| `/organizations`     | Estado y catálogo de organizaciones                      |
| `/organizations/:id` | Owner, permisos, miembros y operación por organización   |
| `/operation`         | Supervisión consolidada del flujo operativo              |
| `/plans`             | Preparación visual de planes y pricing                   |

Todas las rutas privadas están protegidas por `authGuard`.

## Contrato backend propuesto

`HttpAdminRepository` deja centralizado el contrato esperado bajo `/api/admin`:

```text
POST  /api/admin/auth/login
GET   /api/admin/dashboard
GET   /api/admin/users
POST  /api/admin/users/{userId}/password-reset
GET   /api/admin/organizations
GET   /api/admin/organizations/{organizationId}
PATCH /api/admin/organizations/{organizationId}/status
PATCH /api/admin/organizations/{organizationId}/permissions/{permissionCode}
PUT   /api/admin/organizations/{organizationId}/owner
PATCH /api/admin/memberships/{membershipId}/status
POST  /api/admin/memberships/reassign
GET   /api/admin/operations
GET   /api/admin/plans
```

Antes de activar el adaptador HTTP, el backend debe incorporar un contexto de administrador de plataforma separado del contexto tenant, permisos globales, rate limiting, trazabilidad de actor/correlation id y auditoría inmutable para cada mutación sensible.

## Planes y precios

La UI ya modela nombre, precio mensual, moneda, estado, organizaciones asignadas y cantidad de capacidades. La fase backend debe resolver:

1. persistencia y versionado de precios;
2. conjunto de permisos incluido por plan;
3. aprovisionamiento atómico al crear una organización;
4. suscripciones, vigencia, renovaciones e historial;
5. reglas de upgrade/downgrade y facturación.
