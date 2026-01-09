import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
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

  // Fetch statistics for a specific bank
  getStatisticsForBank(bankId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get(`${this.apiUrl}/api/statistics/bank/${bankId}`, { headers })
      .pipe(
        tap(response => console.log('Fetched bank statistics', response)),
        catchError(this.handleError)
      );
  }

getSentItems(page: number, size: number, filters: any = {}): Observable<any> {
  const headers = this.getAuthHeaders();

  let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

  // Ajouter dynamiquement les filtres
  for (const key in filters) {
    if (filters[key]) {
      params = params.set(key, filters[key]);
    }
  }

  return this._httpClient.get(`${this.apiUrl}/api/statistics/sent-items`, {
    headers,
    params
  }).pipe(
    tap(response => console.log('Fetched sent items', response)),
    catchError(this.handleError)
  );
}


  getStatisticsForAgent(agentId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get(`${this.apiUrl}/api/statistics/agent/${agentId}`, { headers })
      .pipe(
        tap(response => console.log('Fetched agent statistics', response)),
        catchError(this.handleError)
      );
  }

  // Fetch overall statistics
  getOverallStatistics(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get(`${this.apiUrl}/api/statistics/overall`, { headers })
      .pipe(
        tap(response => console.log('Fetched overall statistics', response)),
        catchError(this.handleError)
      );
  }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('StatisticsService error:', error);
    return throwError(() => new Error(error.message || 'Server Error'));
  }
}
