import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../../environment.prod';

export interface CardHolderDto {
  clientNumber: string;
  panClear: string;
  name: string;
  bankCode: string;
  finalDate: string;
  nationalId: string;
  gsm: string;
}

export interface SliceResponse<T> {
  content: T[];
  pageable: any;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface MessageResponse {
  message: string;
  code: number;
}

export interface CardHolderUpdateRequest {
  nationalId?: string;
  gsm?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CardmangserviceService {
  private apiUrl = `${environment.apiUrl}/api/cardholders`;

  constructor(private http: HttpClient) {}

  /**
   * 🔍 Search cardholders (all params optional)
   * You can pass 1 param, 2 params, or all
   */
  searchCards(filters: {
    panClear?: string;
    nationalId?: string;
    gsm?: string;
    page?: number;
    size?: number;
  } = {}): Observable<SliceResponse<CardHolderDto>> {
    let params = new HttpParams();

    // Add only provided params
    if (filters.panClear) params = params.set('panClear', filters.panClear);
    if (filters.nationalId) params = params.set('nationalId', filters.nationalId);
    if (filters.gsm) params = params.set('gsm', filters.gsm);
    if (filters.page !== undefined) params = params.set('page', filters.page);
    if (filters.size !== undefined) params = params.set('size', filters.size);

    return this.http
      .get<SliceResponse<CardHolderDto>>(`${this.apiUrl}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  /** ✏️ Update cardholder */
  updateCardHolder(id: string, updateRequest: CardHolderUpdateRequest): Observable<MessageResponse> {
    return this.http
      .patch<MessageResponse>(`${this.apiUrl}/${id}`, updateRequest)
      .pipe(catchError(this.handleError));
  }

  /** ⚠️ Centralized error handler */
  private handleError(error: HttpErrorResponse) {
    const errorMsg =
      error.error?.message ||
      (error.status ? `Server returned code ${error.status}` : 'Network error');
    console.error('Card Management Error:', errorMsg);
    return throwError(() => new Error(errorMsg));
  }
}
