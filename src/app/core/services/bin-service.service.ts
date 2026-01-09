import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class BinService {
  private _httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/tabbin`; // Assuming 'tabBin' is the endpoint prefix
  
  constructor() {}

  // Helper method to get Authorization header
  private getAuthHeaders(): HttpHeaders {
    const accessToken = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });
  }

  // Helper method to handle errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Backend returned an error response
      switch (error.status) {
        case 409:
          errorMessage = 'Conflict: Bin already exists';
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

  // Create a new TabBin
  createTabBin(tabBinRequest: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this._httpClient.post(`${this.apiUrl}/create`, tabBinRequest, { headers })
      .pipe(
        tap(response => console.log('TabBin created successfully', response)),
        catchError((error) => {
          return this.handleError(error); // Handle error here
        })
      );
  }

  // Fetch a specific TabBin by bin ID
  getTabBinByBin(bin: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get(`${this.apiUrl}/${bin}`, { headers })
      .pipe(
        tap(response => console.log(`Fetched TabBin: ${bin}`, response)),
        catchError(this.handleError)
      );
  }

  // Fetch all TabBins
  getAllTabBins(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get(`${this.apiUrl}/all`, { headers })
      .pipe(
        tap(response => console.log('Fetched all TabBins', response)),
        catchError(this.handleError)
      );
  }

  // Update an existing TabBin
  updateTabBin(bin: string, tabBinRequest: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this._httpClient.put(`${this.apiUrl}/update/${bin}`, tabBinRequest, { headers })
      .pipe(
        tap(response => console.log(`Updated TabBin: ${bin}`, response)),
        catchError(this.handleError)
      );
  }

  // Delete a TabBin by bin ID
  deleteTabBin(bin: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this._httpClient.delete(`${this.apiUrl}/delete/${bin}`, { headers })
      .pipe(
        tap(response => console.log(`Deleted TabBin: ${bin}`, response)),
        catchError(this.handleError)
      );
  }
}
