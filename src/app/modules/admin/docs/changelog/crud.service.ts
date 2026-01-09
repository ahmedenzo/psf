import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../../environment.prod';
import { Client, Message } from '@stomp/stompjs';
import { MessageResponse } from './MessageResponse';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  private apiUrl = environment.apiUrl;
  private stompClient: Client;
  private verificationStatusSubject: BehaviorSubject<MessageResponse | null> = new BehaviorSubject<MessageResponse | null>(null);
  private isVerifying = false; // Garde pour éviter les appels multiples

  constructor(private http: HttpClient) {
    this.initializeStompClient();
  }

  private initializeStompClient(): void {
    this.stompClient = new Client({
      brokerURL: environment.brokerURL,
      reconnectDelay: 0, // Désactiver la reconnexion automatique
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log('STOMP Debug:', str),
      onConnect: () => {
        console.log('WebSocket connecté');
        this.stompClient.subscribe('/topic/verification-status', (message: Message) => {
          const response = JSON.parse(message.body) as MessageResponse;
          console.log('Réponse reçue:', response);
          this.verificationStatusSubject.next(response);

          // Retarder la déconnexion pour laisser le temps au serveur
          setTimeout(() => {
            this.stompClient.deactivate()
              .then(() => {
                console.log('Déconnexion réussie');
                this.isVerifying = false; // Réinitialiser la garde
              })
              .catch((err) => console.error('Erreur lors de la déconnexion:', err));
          }, 500);
        });
      },
      onStompError: (frame) => {
        console.error('Erreur STOMP: ' + frame.headers['message']);
        console.error('Détails: ' + frame.body);
      },
      onWebSocketClose: (evt) => {
        console.log('WebSocket fermé:', evt);
        this.isVerifying = false; // Réinitialiser en cas de fermeture
      }
    });
  }

  /**
   * Verifies cardholder details and sends OTP.
   * Ensures WebSocket is connected before sending the HTTP request.
   */
  verifyCardholder(
    cardNumber: string,
    nationalId: string,
    gsm: string,
    finalDate: string,
    operationType: 'INITIAL_PIN' | 'PIN_REMINDER'
  ): Observable<any> {

    if (this.isVerifying) {
      return throwError(() => new Error('Vérification déjà en cours'));
    }

    this.isVerifying = true;

    const url = `${this.apiUrl}/api/cardholders/verify`;
    const body = { cardNumber, nationalId, gsm, finalDate, operationType };

    return new Observable(observer => {
      if (!this.stompClient.active) {
        this.stompClient.activate();
      }

      const waitForConnection = () => {
        if (this.stompClient.connected) {
          this.http.post(url, body, { responseType: 'text' })
            .pipe(catchError(this.handleError<any>('verifyCardholder')))
            .subscribe({
              next: (response) => {
                observer.next(response);
                observer.complete();
              },
              error: (err) => {
                this.isVerifying = false;
                observer.error(err);
                observer.complete();
              }
            });
        } else {
          setTimeout(waitForConnection, 100);
        }
      };

      waitForConnection();
    });
  }

  /**
   * Get real-time verification status updates via WebSocket.
   */
  getVerificationStatusUpdates(): Observable<MessageResponse | null> {
    return this.verificationStatusSubject.asObservable();
  }

  /**
   * Validates the OTP entered by the user.
   */
validateOtp(
    phoneNumber: string,
    otp: string,
    cardNumber: string,
    operationType: 'INITIAL_PIN' | 'PIN_REMINDER'
  ): Observable<MessageResponse> {

    const url = `${this.apiUrl}/api/otp/validate`;
    const body = { phoneNumber, otp, cardNumber, operationType };

    return this.http.post<MessageResponse>(url, body)
      .pipe(catchError(this.handleErrorotp<MessageResponse>('validateOtp')));
  }
  /**
   * Resend OTP to the specified phone number.
   */
resendOtp(gsmNumber: string, cardNumber: string): Observable<any> {
  const url = `${this.apiUrl}/api/otp/resend`;
  const body = {
    phoneNumber: gsmNumber,
    cardNumber: cardNumber
  };
  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  return this.http.post<any>(url, body, { headers })
    .pipe(catchError(this.handleError<any>('resendOtp')));
}

  /**
   * Handles HTTP operation errors for OTP-related requests.
   */
  private handleErrorotp<T>(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<T> => {
      let errorMessage: string;
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        errorMessage = `Error ${error.status}: ${error.error.message || error.message}`;
      }
      console.error(`${operation} failed: ${errorMessage}`);
      return throwError(() => new Error(errorMessage));
    };
  }

  /**
   * Handles HTTP operation errors for general requests.
   */
  private handleError<T>(operation = 'operation') {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error(error.message || 'Une erreur est survenue'));
    };
  }
}
