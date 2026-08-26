export const environment = {
  production: true,
  // Temporal hasta que /api/admin esté disponible. No desplegar públicamente con este valor.
  useMockApi: true,
  apiBaseUrl: 'https://api.saviaup.com',
} as const;
