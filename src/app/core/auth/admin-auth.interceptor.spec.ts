import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { adminAuthInterceptor } from './admin-auth.interceptor';
import { ADMIN_SESSION_KEY } from './admin-session.storage';

describe('adminAuthInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([adminAuthInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    sessionStorage.setItem(
      ADMIN_SESSION_KEY,
      JSON.stringify({
        administrator: { id: 'admin-1', name: 'Admin', email: 'admin@saviaup.co' },
        accessToken: 'signed-admin-token',
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      }),
    );
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    sessionStorage.clear();
  });

  it('adds the bearer token only to the administrative API', () => {
    const http = TestBed.inject(HttpClient);
    const controller = TestBed.inject(HttpTestingController);

    http.get(`${environment.apiBaseUrl}/api/admin/dashboard`).subscribe();
    const adminRequest = controller.expectOne(`${environment.apiBaseUrl}/api/admin/dashboard`);
    expect(adminRequest.request.headers.get('Authorization')).toBe('Bearer signed-admin-token');
    adminRequest.flush({});

    http.get('https://example.com/public').subscribe();
    const externalRequest = controller.expectOne('https://example.com/public');
    expect(externalRequest.request.headers.has('Authorization')).toBe(false);
    externalRequest.flush({});
  });
});
