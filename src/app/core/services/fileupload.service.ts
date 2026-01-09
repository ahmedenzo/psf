import { HttpClient, HttpErrorResponse, HttpHeaders, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable, inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, throwError, Subject, interval } from 'rxjs';
import { catchError, map, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { environment } from '../../../../environment.prod';
import { Item } from 'app/modules/admin/apps/file-manager/file-manager.types';

@Injectable({
  providedIn: 'root'
})
export class TabCardHolderService implements OnDestroy {
  private _httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/cardholders`;

  // Selected item
  private _selectedItem: BehaviorSubject<Item | null> = new BehaviorSubject<Item | null>(null);
  item$: Observable<Item | null> = this._selectedItem.asObservable();

  // Report progress
  private _reportProgress: BehaviorSubject<{
    percentage: number;
    created: number;
    updated: number;
    errors: number;
    isProcessing: boolean;
  } | null> = new BehaviorSubject(null);
  reportProgress$ = this._reportProgress.asObservable();

  // For takeUntil
  private _unsubscribeAll: Subject<void> = new Subject<void>();

  constructor() {}

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  /**
   * GET Authorization header
   */
  private getAuthHeaders(): HttpHeaders {
    const accessToken = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
  }

  /**
   * Upload file with progress
   */
  uploadFile(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = this.getAuthHeaders();

    return this._httpClient.post(`${this.apiUrl}/upload`, formData, {
        headers,
        reportProgress: true,
        observe: 'events',
        responseType: 'text'
    }).pipe(
        catchError(this.handleError)
    );
  }

  /**
   * Polling progress for a specific report
   */
  startProgressPolling(reportId: number): void {
    // Reset
    this._reportProgress.next({
      percentage: 0,
      created: 0,
      updated: 0,
      errors: 0,
      isProcessing: true
    });

    interval(1500) // polling every 1.5s
      .pipe(
        switchMap(() => this.getReportProgress(reportId)),
        takeWhile(progress => progress.percentage < 100, true),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe({
        next: (progress) => {
          this._reportProgress.next({
            ...progress,
            isProcessing: progress.percentage < 100
          });
        },
        error: (err) => {
          console.error('Error polling progress', err);
          this._reportProgress.next(null);
        }
      });
  }

  /**
   * GET report progress (single call)
   */
  private getReportProgress(reportId: number): Observable<{
    percentage: number;
    created: number;
    updated: number;
    errors: number;
  }> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get<{
      percentage: number;
      created: number;
      updated: number;
      errors: number;
    }>(`${this.apiUrl}/report/${reportId}/progress`, { headers });
  }

  /**
   * Stop polling manually
   */
  stopProgressPolling(): void {
    this._reportProgress.next(null);
  }

  /**
   * Get all cardholder load reports
   */
  getAllLoadReports(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get(`${this.apiUrl}/load-reports`, { headers })
      .pipe(
        tap(response => console.log('Load reports retrieved successfully', response)),
        catchError(this.handleError)
      );
  }

  /**
   * Get specific load report by ID
   */
  getLoadReportById(id: string): Observable<Item> {
    const headers = this.getAuthHeaders();
    return this._httpClient.get<Item>(`${this.apiUrl}/load-reports/${id}`, { headers })
      .pipe(
        tap(item => {
          console.log('Load report retrieved successfully', item);
          this._selectedItem.next(item);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Set selected item manually
   */
  setSelectedItem(item: Item): void {
    this._selectedItem.next(item);
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server error: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
