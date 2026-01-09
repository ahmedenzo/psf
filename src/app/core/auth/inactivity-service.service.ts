import { Injectable, NgZone } from '@angular/core';
import {  Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityServiceService {

  private inactivityTime: number = 5 * 60 * 1000; 
    private inactivityTimer: any;

    constructor(private router: Router, private ngZone: NgZone,private AuthService :AuthService , private _router: Router,) {
        this.startInactivityListener();
    }


    private startInactivityListener(): void {
        this.resetTimer();


        window.addEventListener('mousemove', () => this.resetTimer());
        window.addEventListener('keypress', () => this.resetTimer());
        window.addEventListener('click', () => this.resetTimer());
    }

    private resetTimer(): void {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }


        this.ngZone.runOutsideAngular(() => {
            this.inactivityTimer = setTimeout(() => {
                this.ngZone.run(() => {
                    this.logout();
                });
            }, this.inactivityTime);
        });
    }

 
    private logout(): void {
      this.AuthService.signOut().subscribe(() => {
        this._router.navigate(['sign-in']);
    
          console.log ('Session Locked')
      });
  }
}
