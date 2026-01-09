import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { StatisticsService } from 'app/core/services/statistics.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private _data: BehaviorSubject<any> = new BehaviorSubject(null);
  private _sentItems: BehaviorSubject<any> = new BehaviorSubject(null);
  private _overallStatistics: BehaviorSubject<any> = new BehaviorSubject(null);
  /**
   * Constructor
   */
  constructor(
    private _httpClient: HttpClient,
    private _statisticsService: StatisticsService // Inject StatisticsService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for data
   */
  get data$(): Observable<any> {
    return this._data.asObservable();
  }
  get sentItems$(): Observable<any> {
    return this._sentItems.asObservable();
  }
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get data from the project dashboard API
   */
  getData(): Observable<any> {
    return this._httpClient.get('api/dashboards/project').pipe(
      tap((response: any) => {
        this._data.next(response);
      })
    );
  }

  getSentItems(page: number, size: number, filters: any = {}): Observable<any> {
    return this._statisticsService.getSentItems(page, size, filters).pipe(
      tap(response => {
        console.log('Sent items fetched in ProjectService', response);
        this._sentItems.next(response); // Stockage local si nécessaire
      })
    );
  }

  /**
   * Get statistics for a specific bank
   */
  getStatisticsForBank(bankId: number): Observable<any> {
    return this._statisticsService.getStatisticsForBank(bankId).pipe(
      tap(response => {
        console.log('Bank statistics fetched in ProjectService', response);
        this._data.next(response); // Update _data if needed
      })
    );
  }

  /**
   * Get statistics for a specific agent
   */
  getAgentStatistics(agentId: string): Observable<any> {
    return this._statisticsService.getStatisticsForAgent(agentId).pipe(
      tap(response => {
        console.log('Agent statistics fetched in ProjectService', response);
        this._data.next(response); // Update _data if needed
      })
    );
  }

  /**
   * Get overall statistics
   */
  getOverallStatistics(): Observable<any> {
    return this._statisticsService.getOverallStatistics().pipe(
      tap(response => {
        console.log('Overall statistics fetched in ProjectService', response);
        this._data.next(response); // Update _data if needed
   
      })
    );
  }



  /**
   * Fetch dynamic overall statistics
   */

}
