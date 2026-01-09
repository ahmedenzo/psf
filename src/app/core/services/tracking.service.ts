import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { environment } from '../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private _httpClient = inject(HttpClient);
  private apiUrl = environment.apiUrl; 

  constructor() { }

  private getAuthHeaders(): HttpHeaders {
    const accessToken = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });
  }

  getAllLogs(page: number = 0, size: number = 50): Observable<any> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get(`${this.apiUrl}/api/monitor/logs/all?page=${page}&size=${size}`, { headers })
      .pipe(
        tap(response => console.log('Fetched paginated logs', response)),
        catchError(this.handleError)
      );
  }
  
  getActiveSessions(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get<any>(`${this.apiUrl}/api/monitor/activeSessions`, { headers })
      .pipe(
        tap(response => console.log('Fetched active sessions', response)),
        catchError(this.handleError)
      );
  }

  // Get all sessions
  getAllSessions(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get<any>(`${this.apiUrl}/api/monitor/allSessions`, { headers })
      .pipe(
        tap(response => console.log('Fetched all sessions', response)),
        catchError(this.handleError)
      );
  }

  // Get activities by user and date
  getActivitiesByUserAndDate(username: string, date: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get<any>(`${this.apiUrl}/api/monitor/activities/user`, {
      headers,
      params: { username, date },
    })
    .pipe(
      tap(response => console.log('Fetched activities by user and date', response)),
      catchError(this.handleError)
    );
  }

  // Get most used APIs
  getMostUsedApis(): Observable<Record<string, number>> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get<Record<string, number>>(`${this.apiUrl}/api/monitor/most-used-apis`, { headers })
      .pipe(
        tap(response => console.log('Fetched most used APIs', response)),
        catchError(this.handleError)
      );
  }

  // Get API performance statistics
  getApiPerformanceStatistics(): Observable<Record<string, number>> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get<Record<string, number>>(`${this.apiUrl}/api/monitor/api-performance`, { headers })
      .pipe(
        tap(response => console.log('Fetched API performance statistics', response)),
        catchError(this.handleError)
      );
  }

  // Get average response time
  getAverageResponseTime(): Observable<string> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get<string>(`${this.apiUrl}/api/monitor/average-response-time`, {
      headers,
      responseType: 'text' as 'json', // Cast responseType to 'json' for TypeScript compatibility
    })
      .pipe(
        tap(response => console.log('Fetched average response time:', response)),
        catchError(this.handleError)
      );
  }

  // Get error count
  getErrorCount(): Observable<string> {
    const headers = this.getAuthHeaders();
    console.log('Making GET request to:', `${this.apiUrl}/api/monitor/error-count`);
    console.log('Headers:', headers);
  
    return this._httpClient.get(`${this.apiUrl}/api/monitor/error-count`, { headers, responseType: 'text' })
      .pipe(
        tap(response => {
          console.log('Raw response from API:', response);
        }),
        catchError((error) => {
          console.error('Error during HTTP request:', error);
          return this.handleError(error);
        })
      );
  }
  
  

  // Get API request distribution by hour
  getApiRequestDistributionByHour(): Observable<Record<string, any>> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get<Record<string, any>>(`${this.apiUrl}/api/monitor/api-request-distribution/hour`, { headers })
      .pipe(
        tap(response => console.log('Fetched API request distribution by hour', response)),
        catchError(this.handleError)
      );
  }









  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
