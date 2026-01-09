import { I18nPluralPipe, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { finalize, Subject, takeUntil, takeWhile, tap, timer } from 'rxjs';

@Component({
    selector     : 'auth-sign-out',
    templateUrl  : './sign-out.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [NgIf, RouterLink, I18nPluralPipe],
})
export class AuthSignOutComponent implements OnInit, OnDestroy
{
    countdown: number = 5;
    countdownMapping: any = {
        '=1'   : '# second',
        'other': '# seconds',
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _router: Router,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Sign out and subscribe to the result
        this._authService.signOut().subscribe({
            next: () => {
                console.log('Sign-out complete');

                // Redirect after the countdown
                timer(1000, 1000)
                    .pipe(
                        tap(() => this.countdown--),
                        takeWhile(() => this.countdown > 0),
                        finalize(() => {
                            this._router.navigate(['sign-in']);
                        }),
                        takeUntil(this._unsubscribeAll),
                    )
                    .subscribe();
            },
            error: (err) => {
                console.error('Erreur lors de la déconnexion:', err);
                // Rediriger même en cas d'erreur pour éviter les états incohérents
                this._router.navigate(['sign-in']);
            }
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}