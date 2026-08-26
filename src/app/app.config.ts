import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { ADMIN_AUTH_REPOSITORY, AdminAuthRepository } from './core/auth/admin-auth.repository';
import { HttpAdminAuthRepository } from './core/auth/http-admin-auth.repository';
import { MockAdminAuthRepository } from './core/auth/mock-admin-auth.repository';
import { ADMIN_REPOSITORY, AdminRepository } from './core/data-access/admin.repository';
import { HttpAdminRepository } from './core/data-access/http-admin.repository';
import { MockAdminRepository } from './core/data-access/mock-admin.repository';

const authRepositoryFactory = (): AdminAuthRepository =>
  environment.useMockApi ? inject(MockAdminAuthRepository) : inject(HttpAdminAuthRepository);

const adminRepositoryFactory = (): AdminRepository =>
  environment.useMockApi ? inject(MockAdminRepository) : inject(HttpAdminRepository);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(),
    HttpAdminAuthRepository,
    MockAdminAuthRepository,
    HttpAdminRepository,
    MockAdminRepository,
    { provide: ADMIN_AUTH_REPOSITORY, useFactory: authRepositoryFactory },
    { provide: ADMIN_REPOSITORY, useFactory: adminRepositoryFactory },
  ],
};
