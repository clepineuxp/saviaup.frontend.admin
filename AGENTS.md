# AGENTS.md — SaviaUp Frontend Admin

## Propósito

Este repositorio contiene la consola privada de administración de plataforma de SaviaUp. Es independiente de `saviaup.frontend`, que pertenece a usuarios de organizaciones.

## Stack

- Angular 21.2, componentes standalone y rutas lazy.
- TypeScript 5.9 estricto.
- Signals para estado; RxJS para I/O asíncrono.
- Reactive Forms tipados.
- SCSS, ESLint, Prettier y Vitest.

No bajar versiones, incorporar un kit visual externo ni acoplar esta aplicación al frontend operativo sin petición explícita.

## Arquitectura obligatoria

```text
Component → Store/Facade (Signals) → Repository token → HTTP o Mock
```

- Los componentes no inyectan `HttpClient`.
- Los endpoints se implementan únicamente en adaptadores HTTP.
- Los mocks y credenciales temporales permanecen dentro de adaptadores mock.
- Las entidades de persistencia nunca se exponen como modelos de UI.
- Todas las rutas privadas declaran guard.
- Componentes nuevos: standalone, OnPush y control flow moderno.
- Evitar `any`, suscripciones sin ciclo de vida y textos de error internos.

## Seguridad

La consola administra recursos globales; nunca reutilizar el contexto firmado de un tenant como autoridad de plataforma. El backend futuro debe usar autenticación y autorización administrativa separadas, auditoría de mutaciones, rate limiting y códigos de error estables.

No registrar ni persistir contraseñas, tokens, reset tokens o datos sensibles. `sessionStorage` solo conserva la sesión mock temporal. La aplicación no puede desplegarse públicamente mientras `useMockApi` sea `true`.

El cambio de owner, desactivación de organizaciones, permisos, membresías y restablecimiento de contraseña requiere confirmación visible y estado de progreso.

## Diseño

- Mantener la interfaz sobria, densa y profesional.
- Reutilizar los tokens globales de `src/styles.scss`.
- Usar exclusivamente los PNG oficiales de `public/logo` para la marca.
- Mantener foco visible, labels, contraste, estados de carga/error/disabled y soporte desde 320 px.
- No depender únicamente del color para comunicar estados.
- Respetar `prefers-reduced-motion`.

## Validación obligatoria

```bash
npm run format:check
npm run lint
npm test -- --watch=false
npm run build
```

Agregar pruebas para el camino exitoso, la restricción de seguridad relevante y el estado resultante de cada mutación nueva. No borrar pruebas para aprobar la suite.
