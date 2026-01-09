// sign-in.component.ts
import { NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { RecaptchaModule } from 'ng-recaptcha'; 
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector     : 'auth-sign-in',
    templateUrl  : './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports      : [RouterLink, FuseAlertComponent, NgIf,
         FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,RecaptchaModule, 
         MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm;
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = { type: 'error', message: '' };
    captchaResponse: string | null = null;
    private _redirectURL: string = '/signed-in-redirect';  // Default redirect URL after successful sign-in

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    ngOnInit(): void {
        // Create the sign-in form
        this.signInForm = this._formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', Validators.required],
        });

        // Get the redirect URL from the query parameters or set default
        const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL');
        this._redirectURL = redirectURL && redirectURL !== '/404-not-found' ? redirectURL : '/signed-in-redirect';
    }
    onCaptchaResolved(response: string) {
        this.captchaResponse = response;
      }

   signIn(): void {
    // If the form is invalid, return
    if (this.signInForm.invalid) {
        console.warn('Sign-in form is invalid:', this.signInForm.value);
        return;
    }

    // Disable the form while processing
    this.signInForm.disable();
    this.showAlert = false;

    console.log('Submitting sign-in request with:', this.signInForm.value);

    // Call the sign-in method
    this._authService.signIn(this.signInForm.value).subscribe(
        (response) => {
            // Log the exact response from backend
            console.log('Sign-in successful. Backend response:', response);

            // On successful sign-in, navigate to the valid redirect URL
            this._router.navigateByUrl(this._redirectURL);
        },
        (error: HttpErrorResponse) => {
            // Log full HttpErrorResponse
            console.error('Sign-in error HTTP response:', error);

            // Log backend error object if present
            console.log('Backend error object:', error.error);

            // Log status code and status text
            console.log('Status code:', error.status, 'Status text:', error.statusText);

            // On failed sign-in, reset the form
            this.signInForm.enable();
            this.signInNgForm.resetForm();

            // Determine alert message based on exact backend response
            if (error.error?.status === 403 && error.error?.message === 'User account is inactive') {
                this.alert = {
                    type: 'error',
                    message: 'User account is inactive.',
                };
            } else if (error.error?.status === 400 && error.error?.message === 'Invalid username or password') {
                this.alert = {
                    type: 'error',
                    message: 'Wrong username or password',
                };
            } else if (error.error?.status === 423 && error.error?.message === 'User account is locked') {
                this.alert = {
                    type: 'error',
                    message: 'User account is locked.',
                };
            } else if (error.error?.status === 500) {
                this.alert = {
                    type: 'error',
                    message: 'Internal server error.',
                };
            } else {
                this.alert = {
                    type: 'error',
                    message: 'An unknown error occurred.',
                };
            }

            // Show the alert
            this.showAlert = true;

            // Clear redirectURL query param to avoid repeated redirects
            this._router.navigate([], {
                queryParams: { redirectURL: null },
                queryParamsHandling: 'merge',
            });
        }
    );
}

}
