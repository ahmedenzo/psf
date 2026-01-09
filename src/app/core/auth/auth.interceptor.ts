import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError, EMPTY } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from './auth.utils';

export const authInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const authService = inject(AuthService);
  const router = inject(Router);

  let newReq = req.clone({ withCredentials: true });

  // Ajouter token si valide
  if (
    authService.accessToken &&
    !AuthUtils.isTokenExpired(authService.accessToken)
  ) {
    newReq = newReq.clone({
      headers: newReq.headers.set(
        'Authorization',
        `Bearer ${authService.accessToken}`
      )
    });
  }

  return next(newReq).pipe(
    catchError((error: HttpErrorResponse) => {

      /* 🔴 403 – Password change required */
if (
  error.status === 403 &&
  error.error?.error === 'PASSWORD_CHANGE_REQUIRED'
) {
  console.warn('Mot de passe doit être changé');

  router.navigate(['/unlock']); // ✅ PATH CORRECT
  return EMPTY; // 🔥 STOP FLUX
}


      /* 🔴 401 – Token invalide */
      if (error.status === 401) {
        console.warn('Token expiré ou invalide');

        authService._clearSession();
        router.navigate(['/sign-in']);

        return EMPTY;
      }

      /* 🔴 Session invalide */
      if (
        error.status === 400 &&
        error.error === 'Session ID is invalid'
      ) {
        alert('Session terminée. Une autre session a été ouverte.');

        authService._clearSession();
        router.navigate(['/sign-in']);

        return EMPTY;
      }

      return throwError(() => error);
    })
  );
};
