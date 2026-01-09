import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environment.prod';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  private apiUrl = `${environment.apiUrl}/api/files`;

  constructor(private http: HttpClient) {}

  /**
   * List billing files (paginated)
   */
listFiles(page: number = 0, size: number = 20): Observable<any> {
  return this.http.get<any>(this.apiUrl, {
    params: {
      page: page,
      size: size
    }
  });
}

downloadFile(filename: string): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/download/${filename}`, {
    responseType: 'blob' as const
  });
}


}
