import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from '../../../../environment.prod';
import { TokenService } from './token.service';
import { CookieService } from './cookie.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private _httpClient = inject(HttpClient);
  private _tokenService = inject(TokenService);
  private _cookieService = inject(CookieService);
  private _userService = inject(UserService);
  private apiUrl = environment.apiUrl;

  private _authenticated = false;
  private _alertSubject = new BehaviorSubject<string | null>(null);
  public alert$ = this._alertSubject.asObservable();
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        this._tokenService.setToken(token);  // Save the token securely using TokenService
    }

    /**
     * Getter for access token
     */
    get accessToken(): string {
        return this._tokenService.getToken() ?? '';  // Retrieve the token from TokenService
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Trigger an alert to display to the user
     * @param message
     */
    triggerAlert(message: string): void {
        this._alertSubject.next(message);
    }
/**
 * Deactivate a user by ID
 * @param userId The ID of the user to deactivate
 * @returns Observable<any> - Response from the backend
 */
deactivateUser(userId: number): Observable<any> {
  const url = `${this.apiUrl}/api/users/${userId}/deactivate`;

  return this._httpClient.put(url, null, { withCredentials: true }).pipe(
    tap(() => console.log(`User with ID ${userId} deactivated successfully.`)),
    catchError(this.handleError)
  );
}



  signIn(credentials: { username: string; password: string }): Observable<any> {
    if (this._authenticated) {
      return throwError(() => new Error('User is already logged in.'));
    }

    return this._httpClient
      .post(`${this.apiUrl}/api/auth/signin`, credentials, { withCredentials: true })
      .pipe(
        switchMap((response: any) => {
          const token = response.token;
          if (!token) {
            return throwError(() => new Error('Access token is missing from response.'));
          }

          this.accessToken = token;
          this._authenticated = true;

          const userData = {
            id: response.id,
            username: response.username,
            roles: response.roles,
            sessionId: response.sessionId,
            adminId: response.adminId,
            bankId: response.bankId,
            agencyId: response.agencyId,
          };

          this._userService.user = userData;
          this._cookieService.setCookie('userData', JSON.stringify(userData), 7);

          return of(response);
        }),
        catchError((error) => {
          console.error('Error during sign-in:', error);
          this.triggerAlert('Wrong username or password.');
          this._authenticated = false;
          return throwError(() => error);
        })
      );
  }

  signOut(): Observable<any> {
    const userDataCookie = this._cookieService.getCookie('userData');
    const userData = userDataCookie ? JSON.parse(userDataCookie) : null;

    if (!userData || !userData.sessionId) {
      console.warn('No sessionId found in cookie, local logout only.');
      this._clearSession();
      this.router.navigate(['/sign-in']);
      return of(null);
    }

    const sessionId = userData.sessionId;
    return this._httpClient
      .post(`${this.apiUrl}/api/auth/signout?SessionId=${sessionId}`, null, { withCredentials: true })
      .pipe(
        tap(() => {
          console.log('Sign-out success');
          this._clearSession();
          this.router.navigate(['/sign-in']);
        }),
        catchError((error) => {
          console.error('Error during sign-out:', error);
          this._clearSession();
          this.router.navigate(['/sign-in']);
          return throwError(() => error);
        })
      );
  }


  public _clearSession(): void {
    this._tokenService.removeToken();
    this._cookieService.deleteCookie('userData');
    this._authenticated = false;
  }
    /**
     * Check the authentication status
     */
  check(): Observable<boolean> {
  // Si déjà authentifié
  if (this._authenticated) {
    return of(true);
  }

  // Si aucun token ou token expiré → nettoyage local
  if (!this.accessToken || AuthUtils.isTokenExpired(this.accessToken)) {
    console.warn('Token expiré, session nettoyée');
    this._clearSession();
    return of(false);
  }

  // Sinon token encore valide
  return of(true);
}


    /**
     * Refresh the access token using the refresh token stored in cookies
     */
    

    /**
     * Forgot password
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post(`${this.apiUrl}/api/auth/forgot-password`, email);
    }

    /**
     * Reset password
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post(`${this.apiUrl}/api/auth/reset-password`, password);
    }










  signUp(user: {
    name: string;
    email: string;
    password: string;
    company: string;
  }): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/api/auth/sign-up`, user);
  }

  unlockSession(credentials: { username: string; password: string }): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/api/auth/unlock-session`, credentials);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => new Error('An error occurred while processing the request.'));
  }

 
}
