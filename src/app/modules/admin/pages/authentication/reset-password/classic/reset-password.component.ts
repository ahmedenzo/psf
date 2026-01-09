import { NgIf } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { FuseValidators } from '@fuse/validators';
import { SecurityServiceService } from 'app/core/services/security-service.service';
import { UserService } from 'app/core/user/user.service';
import { Subscription } from 'rxjs';
 
export function passwordComplexityValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const password = control.value;
 
     
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
 
        // Validate the password
        const valid = passwordPattern.test(password);
        return valid ? null : { passwordComplexity: true };
    };
}
 
@Component({
    selector: 'reset-password-classic',
    templateUrl: './reset-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [NgIf, FuseAlertComponent, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
})
export class ResetPasswordClassicComponent implements OnInit {
    resetPasswordForm: UntypedFormGroup;
    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = { type: 'success', message: '' };
    userId: string | null = null;
    subscriptions: Subscription = new Subscription();
 
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _securityService: SecurityServiceService,
        private _userService: UserService,
        private cdr: ChangeDetectorRef
    ) {}
 
    ngOnInit(): void {
        this.resetPasswordForm = this._formBuilder.group({
            currentPasswordsuper: ['', Validators.required],
            password: ['', passwordComplexityValidator()],
            passwordConfirm: ['', Validators.required],
        }, {
            validators: FuseValidators.mustMatch('password', 'passwordConfirm'),
        });
 
        this.subscriptions.add(
            this._userService.user$.subscribe(user => {
                if (user) {
                    this.userId = user.id;
                }
            })
        );
    }
 
    resetPassword(): void {

    if (this.resetPasswordForm.valid) {

        const formValues = this.resetPasswordForm.value;

        const changePasswordRequest = {
            userId: this.userId,
            oldPassword: formValues.currentPasswordsuper,
            newPassword: formValues.password
        };

        /* 🔍 DEBUG LOGS (IMPORTANT) */
        console.log('🔑 Token:', localStorage.getItem('accessToken'));
        console.log('👤 user$ id:', this.userId);
        console.log('📦 Payload:', changePasswordRequest);
        console.log(
            '🧪 Token parts count:',
            localStorage.getItem('accessToken')?.split('.').length
        );

        this._securityService.changePassword(changePasswordRequest).subscribe({

            next: (response) => {
                console.log('✅ Password changed successfully:', response);

                this.alert = {
                    type: 'success',
                    message: 'Password changed successfully!'
                };

                this.showAlert = true;
                this.resetPasswordForm.reset();
                this.cdr.markForCheck();

                setTimeout(() => {
                    this.showAlert = false;
                    this.cdr.markForCheck();
                }, 4000);
            },

            error: (error) => {
                console.error('❌ Failed to change password', error);

                this.alert = {
                    type: 'error',
                    message: 'Failed to change password: ' + (error?.error?.message || error)
                };

                this.showAlert = true;
                this.cdr.markForCheck();

                setTimeout(() => {
                    this.showAlert = false;
                    this.cdr.markForCheck();
                }, 4000);
            }
        });

    } else {

        this.alert = {
            type: 'error',
            message: 'Please fill all required fields.'
        };

        this.showAlert = true;
        this.cdr.markForCheck();

        setTimeout(() => {
            this.showAlert = false;
            this.cdr.markForCheck();
        }, 4000);
    }
}

   
 
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}
 
