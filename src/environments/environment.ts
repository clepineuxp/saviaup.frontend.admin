const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const custom = (window as unknown as { __env?: { apiBaseUrl?: string; apiUrl?: string } }).__env;
    if (custom?.apiBaseUrl && custom.apiBaseUrl.trim() !== '') return custom.apiBaseUrl;
    if (custom?.apiUrl && custom.apiUrl.trim() !== '') return custom.apiUrl;
  }
  return 'http://localhost:5100';
};

export const environment = {
  production: false,
  useMockApi: false,
  get apiBaseUrl(): string {
    return getApiBaseUrl();
  },
};
