import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { environment } from '../../../../environment.prod';


@Injectable({
  providedIn: 'root'
})
export class SecurityServiceService {
  private _httpClient = inject(HttpClient);
  private apiUrl = environment.apiUrl; 

  constructor() { }


  changePassword(bankRequest: any): Observable<any> {
    const url = `${this.apiUrl}/api/users/changePassword`;
    const accessToken = localStorage.getItem('accessToken');

    const headers = new HttpHeaders({
        'Authorization': `Bearer ${accessToken}`
    });
    return this._httpClient.post<any>(url, bankRequest, { headers })
        .pipe(
            catchError(this.handleError)
        );
}


forgetPassword(formData: FormData): Observable<any> {
  const url = `${this.apiUrl}/api/users/forgetPassword`;
  const accessToken = localStorage.getItem('accessToken');

  const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
  });
  return this._httpClient.post<any>(url, formData, { headers })
      .pipe(
          catchError(this.handleError)
      );
}


generateRandomPassword(userId: string): Observable<any> {
  const url = `${this.apiUrl}/api/users/forgetPassword`;
  const accessToken = localStorage.getItem('accessToken');

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${accessToken}`,
  });

  const requestBody = { userId };

  // Set the responseType to 'text' to handle plain text response
  return this._httpClient.post(url, requestBody, { headers, responseType: 'text' }).pipe(
    catchError(this.handleError)
  );
}


private handleError(error: HttpErrorResponse): Observable<never> {
  // Log the error message for debugging
  console.error('An error occurred:', error);

  // Check if the error response has a message and status code
  if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred.
      console.error('Client-side error:', error.error.message);
  } else {
      // A backend error occurred.
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error.message}`);
  }

  // Return a user-friendly error message
  const errorMessage = error.error?.message || 'An unexpected error occurred. Please try again later.';
  // Return an observable with a user-facing error message
  return throwError(errorMessage);
}

}

