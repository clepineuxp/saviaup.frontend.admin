const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const custom = (window as unknown as { __env?: { apiBaseUrl?: string; apiUrl?: string } }).__env;
    if (custom?.apiBaseUrl && custom.apiBaseUrl.trim() !== '' && !custom.apiBaseUrl.startsWith('${')) return custom.apiBaseUrl;
    if (custom?.apiUrl && custom.apiUrl.trim() !== '' && !custom.apiUrl.startsWith('${')) return custom.apiUrl;

    const hostname = window.location?.hostname ?? '';
    if (hostname.startsWith('dev.') || hostname === 'dev.admin.saviaup.com') {
      return 'https://dev.api.admin.saviaup.com';
    }
    if (hostname.startsWith('qa.') || hostname === 'qa.admin.saviaup.com') {
      return 'https://qa.api.admin.saviaup.com';
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5100';
    }
  }
  return 'https://admin-api.saviaup.com';
};

export const environment = {
  production: true,
  useMockApi: false,
  get apiBaseUrl(): string {
    return getApiBaseUrl();
  },
};
