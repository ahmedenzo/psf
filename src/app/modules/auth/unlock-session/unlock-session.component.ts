import { NgIf } from '@angular/common';
import {
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectorRef
} from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { FuseValidators } from '@fuse/validators';

import { UserService } from 'app/core/user/user.service';
import { SecurityServiceService } from 'app/core/services/security-service.service';
import { AuthService } from 'app/core/auth/auth.service'; // ← AJOUTÉ

/* 🔐 Password complexity validator */
export function passwordComplexityValidator() {
    return (control) => {
        const value = control.value;
        if (!value) return null;

        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        return regex.test(value) ? null : { passwordComplexity: true };
    };
}

@Component({
    selector: 'auth-unlock-session',
    templateUrl: './unlock-session.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        NgIf,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        RouterLink
    ],
})
export class AuthUnlockSessionComponent implements OnInit {

    @ViewChild('unlockSessionNgForm') unlockSessionNgForm: NgForm;

    unlockSessionForm: UntypedFormGroup;
    showAlert = false;
    alert: { type: FuseAlertType; message: string } = { type: 'success', message: '' };

    username: string;
    userId: string;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _userService: UserService,
        private _securityService: SecurityServiceService,
        private _router: Router,
        private _authService: AuthService,         // ← AJOUTÉ
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.unlockSessionForm = this._formBuilder.group(
            {
                username: [{ value: '', disabled: true }],
                currentPassword: ['', Validators.required],
                password: ['', passwordComplexityValidator()],
                passwordConfirm: ['', Validators.required],
            },
            {
                validators: FuseValidators.mustMatch('password', 'passwordConfirm')
            }
        );

        this._userService.user$.subscribe(user => {
            if (user) {
                this.userId = user.id;
                this.username = user.username;

                this.unlockSessionForm.patchValue({
                    username: user.username
                });
            }
        });
    }

    changePassword(): void {
        if (this.unlockSessionForm.invalid) {
            this.alert = {
                type: 'error',
                message: 'Please correct the errors in the form.'
            };
            this.showAlert = true;
            return;
        }

        const payload = {
            userId: this.userId,
            oldPassword: this.unlockSessionForm.get('currentPassword')?.value,
            newPassword: this.unlockSessionForm.get('password')?.value
        };

        console.log('👤 userId:', this.userId);
        console.log('📦 Payload:', payload);

        this.unlockSessionForm.disable();
        this.showAlert = false;

        this._securityService.changePassword(payload).subscribe({
            next: (response) => {
                console.log('✅ Password changed successfully:', response);

                // Message de succès
                this.alert = {
                    type: 'success',
                    message: 'Password changed successfully! You will be redirected to the login page.'
                };
                this.showAlert = true;
                this.cdr.markForCheck();

                // Attendre un peu pour que l'utilisateur voie le message
                setTimeout(() => {
                    // 🔥 Nettoyer complètement la session (token + cookies + état)
                    this._authService._clearSession();

                    // 🔥 Redirection vers sign-in (l'utilisateur devra se reconnecter avec son nouveau mot de passe)
                    this._router.navigate(['/sign-in']);
                }, 2000); // 2 secondes pour lire le message
            },
            error: (error) => {
                console.error('❌ Failed to change password:', error);

                this.unlockSessionForm.enable();

                this.alert = {
                    type: 'error',
                    message: 'Password change failed:' + 
                             (error?.error?.message || error?.message || 'Check your old password')
                };
                this.showAlert = true;
                this.cdr.markForCheck();
            }
        });
    }
}