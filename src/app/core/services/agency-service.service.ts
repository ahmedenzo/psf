import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environment.prod';

@Injectable({
    providedIn: 'root'
})
export class AgencyService {
    private _httpClient = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    constructor() {}

    createAgency(agencyRequest: any): Observable<any> {
        const url = `${this.apiUrl}/api/agency/create`;
        const accessToken = localStorage.getItem('accessToken');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        });
        return this._httpClient.post<any>(url, agencyRequest, { headers })
            .pipe(catchError(this.handleError));
    }

    updateAgency(id: number, agencyRequest: any): Observable<any> {
        const url = `${this.apiUrl}/api/agency/update/${id}`;
        const accessToken = localStorage.getItem('accessToken');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        });
        return this._httpClient.put<any>(url, agencyRequest, { headers })
            .pipe(catchError(this.handleError));
    }

    listAllAgenciesAssociatedUser(): Observable<any> {
        const url = `${this.apiUrl}/api/agency/listassociateduser`;
        const accessToken = localStorage.getItem('accessToken');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${accessToken}`
        });
        return this._httpClient.get<any>(url, { headers })
            .pipe(catchError(this.handleError));
    }

    deleteAgency(id: number): Observable<any> {
        const url = `${this.apiUrl}/api/agency/delete/${id}`;
        const accessToken = localStorage.getItem('accessToken');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${accessToken}`
        });
        return this._httpClient.delete<any>(url, { headers })
            .pipe(catchError(this.handleError));
    }

    getAgencyById(id: number): Observable<any> {
        const url = `${this.apiUrl}/api/agency/get/${id}`;
        const accessToken = localStorage.getItem('accessToken');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${accessToken}`
        });
        return this._httpClient.get<any>(url, { headers })
            .pipe(catchError(this.handleError));
    }

    listAllAgencies(): Observable<any> {
        const url = `${this.apiUrl}/api/agency/list`;
        const accessToken = localStorage.getItem('accessToken');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${accessToken}`
        });
        return this._httpClient.get<any>(url, { headers })
            .pipe(catchError(this.handleError));
    }

    GetAgents(): Observable<any> {
        const url = `${this.apiUrl}/api/users/users`;
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        });
        return this._httpClient.get<any>(url, { headers })
            .pipe(catchError(this.handleError));
    }

    associateUserToAgency(userId: number, agencyId: number): Observable<any> {
        const url = `${this.apiUrl}/api/users/associateUserToAgency`;
        const accessToken = localStorage.getItem('accessToken');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${accessToken}`
        });
        const params = new HttpParams()
            .set('userId', userId.toString())
            .set('agencyId', agencyId.toString());
        return this._httpClient.post<any>(url, null, { headers, params })
            .pipe(catchError(this.handleError));
    }

    registerAgent(user: any): Observable<any> {
        const url = `${this.apiUrl}/api/users/signup`;
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        });
        return this._httpClient.post(url, user, { headers });
    }

    batchUploadAgents(formData: FormData): Observable<any> {
        const url = `${this.apiUrl}/api/users/batch-upload`;
        const accessToken = localStorage.getItem('accessToken');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${accessToken}`
        });
        return this._httpClient.post(url, formData, {
            headers,
            responseType: 'blob' as 'json', // Ensure binary response is handled as blob
            observe: 'response'
        }).pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('An error occurred:', error);
        if (error.error instanceof ErrorEvent) {
            console.error('Client-side error:', error.error.message);
        } else {
            console.error(`Backend returned code ${error.status}, body was: ${error.error.message}`);
        }
        const errorMessage = error.error?.message || 'An unexpected error occurred. Please try again later.';
        return throwError(errorMessage);
    }
}