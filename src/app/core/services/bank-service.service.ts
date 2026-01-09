import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { environment } from '../../../../environment.prod';



@Injectable({ providedIn: 'root' })
export class BankServiceService {
    private _httpClient = inject(HttpClient);
    private apiUrl = environment.apiUrl; 

    constructor() {}



    
    createBank(formData: FormData): Observable<any> {
        const url = `${this.apiUrl}/api/bank/add`;
        const accessToken = localStorage.getItem('accessToken');
    
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${accessToken}`
        });
        return this._httpClient.post<any>(url, formData, { headers })
            .pipe(
                catchError(this.handleError)
            );
    }
    
    
    updateBank(id: number,formData: FormData): Observable<any> {
        const url = `${this.apiUrl}/api/bank/update`;
        const accessToken = localStorage.getItem('accessToken');
    
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${accessToken}`
        });
    
        // Post request with FormData (let the browser handle Content-Type)
        return this._httpClient.put<any>(`${url}/${id}`, formData, { headers })
            .pipe(
                catchError(this.handleError)
            );
    }
    
    updateUser(updateUserRequest: any): Observable<any> {
        const url = `${this.apiUrl}/api/auth/update`;  // Assuming the backend URL for user update
        const accessToken = localStorage.getItem('accessToken');
        
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'  // JSON request body
        });

        // Make PUT request to update the user
        return this._httpClient.put<any>(url, updateUserRequest, { headers })
            .pipe(
                catchError(this.handleError)  // Error handling
            );
    }
 

    getAllBanks(): Observable<any> {
        const url = `${this.apiUrl}/api/bank/banks/list`; 
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
        });
       
        return this._httpClient.get<any>(url, { headers })
          .pipe(
            catchError(this.handleError)
          );


}

associateAdminToBank(adminId: string, bankId: number): Observable<any> {
  const url = `${this.apiUrl}/api/users/associateAdminToBank`;
  const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  });
  const params = new HttpParams()
      .set('adminId', adminId)
      .set('bankId', bankId.toString());

  return this._httpClient.post(url, null, { headers, params }).pipe(
      catchError(this.handleError1) // Attach error handler
  );
}

private handleError1(error: HttpErrorResponse) {
  let errorMessage = 'An unknown error occurred!';
  
  if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client-side error: ${error.error.message}`;
  } else {
      // Server-side error
      errorMessage = `Server error ${error.status}: ${error.message}`;
      
      // You can further customize error messages based on status codes
      if (error.status === 403) {
          errorMessage = 'This admin already has a bank associated and cannot change it!';
      }
  }
  
  // Log the error to the console for debugging
  console.error('Error Details:', error);

  // Optionally, add other error handling logic, like showing a notification
  return throwError(() => new Error(errorMessage));
}

registerAdmin(user: any): Observable<any> {
    const url = `${this.apiUrl}/api/users/signup`; 
    const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
    });
    

    return this._httpClient.post(url, user, { headers });
}

GetAdmins (): Observable<any>{

    const url = `${this.apiUrl}/api/users/users`; 
    const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
    });
    return this._httpClient.get<any>(url, { headers })
    .pipe(
      catchError(this.handleError)
    );
}


private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Backend returned an error response
      switch (error.status) {
        case 409:
          errorMessage = 'Error: BankCode already exists';
          break;
        case 400:
          errorMessage = 'Bad Request: Invalid input';
          break;
        case 401:
          errorMessage = 'Unauthorized: Please check your credentials';
          break;
        case 404:
          errorMessage = 'Not Found: Resource does not exist';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          break;
      }
    }
    console.error('Error response:', errorMessage); // Log the error for debugging
    return throwError(() => new Error(errorMessage));
  }

}