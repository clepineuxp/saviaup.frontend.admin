import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ADMIN_SESSION_KEY, readAdminSession } from './admin-session.storage';

export const adminAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const session = readAdminSession();
  const isAdminApi = request.url.startsWith(`${environment.apiBaseUrl}/api/admin`);
  const authenticatedRequest =
    isAdminApi && session
      ? request.clone({ setHeaders: { Authorization: `Bearer ${session.accessToken}` } })
      : request;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && isAdminApi) {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
      }
      return throwError(() => error);
    }),
  );
};
