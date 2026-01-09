import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { CookieService } from '../auth/cookie.service';
import { environment } from '../../../../environment.prod';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _httpClient = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/api/users`;
    private _user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null); // Use BehaviorSubject
    private _cookieService = inject(CookieService);
    constructor() {
        const userData = this._cookieService.getCookie('userData'); // Use the same key as in setCookie
        if (userData) {
            try {
                const parsedUserData = JSON.parse(userData);  
  
                this.user = parsedUserData;  
            } catch (error) {
               
            }
        } else {
            console.warn('UserService: No user found in cookies on initialization.');
        }
    }
    
    getUserById(userId: string): Observable<User | any> {
        const url = `${this.apiUrl}/${userId}`;
        const accessToken = localStorage.getItem('accessToken');
    
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${accessToken}`
        });
    
        return this._httpClient.get<User>(url, { headers }).pipe(
          catchError(this.handleError) 
        );
      }
    
      /**
       * Error handling
       * @param error The error response from the API
       * @returns Observable<never>
       */
      private handleError(error: any): Observable<never> {
        console.error('An error occurred:', error);
        return throwError(() => new Error(error.message || 'Server error')); // Customize error message
      }

    /**
     * Observable to get the current user
     */
    get user$(): Observable<User | null> {
        const userValue = this._user.getValue();
 
        return this._user.asObservable();
    }

    /**
     * Setter for the user
     */
    set user(value: User | null) {
      
        this._user.next(value);
    }

    /**
     * Clear user data from both BehaviorSubject and cookies
     */
    clearUserData(): void {

        this.user = null;
        this._cookieService.deleteCookie('user');
    }

    /**
     * Set user after successful sign-in
     */
    setUserFromSignIn(user: User): void {

        this.user = user; // This will invoke the setter
    
        // Store user data in cookies for 7 days
        this._cookieService.setCookie('userData', JSON.stringify(user), 7); // Store as JSON string
    }
    
    

    /**
     * Get the roles from the current user
     */
    getRoles(): string[] | null {
        const user = this._user.getValue();
        if (user && user.roles) {

            return user.roles;
        }
        console.warn('UserService: getRoles - User or roles not available.');
        return null;
    }

    /**
     * Get the current access token from localStorage
     */
    getAccessToken(): string {
        const token = localStorage.getItem('accessToken');
   
        return token ?? '';
    }

    /**
     * Get the current user value from BehaviorSubject
     */
    getCurrentUser(): User | null {
        const currentUser = this._user.getValue();

        return currentUser;
    }

    /**
     * Update user data and log the updated user
     */
    update(user: User): Observable<any> {
        console.log('UserService: Update called with user:', user);
        return this._httpClient.patch<User>('api/common/user', { user }).pipe(
            map((response) => {
                console.log('UserService: User updated successfully. New user data:', response);
                this._user.next(response);
            })
        );
    }
}
