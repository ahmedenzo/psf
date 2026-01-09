import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BankServiceService } from 'app/core/services/bank-service.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseAlertComponent, FuseAlertService } from '@fuse/components/alert';
import { Subscription } from 'rxjs';
import { SecurityServiceService } from 'app/core/services/security-service.service';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

export function passwordComplexityValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const valid = passwordPattern.test(password);
    return valid ? null : { passwordComplexity: true };
  };
}

@Component({
  selector: 'settings-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatSelectModule,
    FuseAlertComponent,
    MatOptionModule,
    CommonModule,
    NgxMatSelectSearchModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsSecurityComponent implements OnInit {
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  securityForm: UntypedFormGroup;
  admins: any[] = [];
  filteredAdmins: any[] = [];
  adminFilterCtrl = new FormControl('');
  superadminId: string | null = null;
  private _subscription: Subscription = new Subscription();
  errorMessage: string | null = null;
  successMessage: string | null = null;
  errorMessagegsa: string | null = null;
  errorMessageadmi: string | null = null;
  successMessageadmi: string | null = null;
  errorMessagech: string | null = null;
  successMessagech: string | null = null;
  successMessagegsa: string | null = null;
  generatedPasswordsuper: string | null = null;
  generatedPassword: string | null = null;
  private _bankService = inject(BankServiceService);
  private _fuseAlertService = inject(FuseAlertService);
  private _SecurityServiceService = inject(SecurityServiceService);

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize the form
    this.securityForm = this._formBuilder.group({
      currentPasswordsuper: [''],
      newPasswordsuper: ['', passwordComplexityValidator()],
      AdminId: [''],
    });

    // Fetch admins
    this.getadmins();

    // Subscribe to search input changes
    this._subscription.add(
      this.adminFilterCtrl.valueChanges.subscribe(search => {
        this.filteredAdmins = this.admins.filter(admin =>
          admin.username.toLowerCase().includes((search || '').toLowerCase())
        );
        this.cdr.markForCheck();
      })
    );
  }

  getadmins(): void {
    this._bankService.GetAdmins().subscribe({
      next: (response) => {
        console.log('Fetched Admins data:', response);
        if (Array.isArray(response) && response.length > 0) {
          this.admins = response;
          this.filteredAdmins = [...this.admins]; // Initialize filteredAdmins
          this.cdr.markForCheck();
        } else {
          console.warn('No valid admins data found. Response structure:', response);
        }
      },
      error: (error) => {
        console.error('Error fetching admins:', error);
      },
    });
  }

  onChangePasswordSuperAdmin(): void {
    const defaultUserId = '1';
    this.superadminId = defaultUserId;

    if (this.securityForm.valid && this.superadminId) {
      const formValues = this.securityForm.value;
      formValues.userId = this.superadminId;
      const changePasswordRequest = {
        userId: formValues.userId,
        oldPassword: formValues.currentPasswordsuper,
        newPassword: formValues.newPasswordsuper,
      };

      console.log('Change Password Request being submitted:', changePasswordRequest);

      this._SecurityServiceService.changePassword(changePasswordRequest).subscribe({
        next: (response) => {
          console.log('Password changed successfully:', response);
          this.successMessage = 'Password changed successfully!';
          this.errorMessage = null;
          this.securityForm.reset();
          this.cdr.markForCheck();
          setTimeout(() => {
            this.successMessage = null;
            this.cdr.markForCheck();
          }, 4000);
        },
        error: (error) => {
          console.error('Failed to change password', error);
          this.errorMessage = 'Failed to change password: ' + error.message;
          this.successMessage = null;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.errorMessage = null;
            this.cdr.markForCheck();
          }, 4000);
        },
      });
    } else {
      console.error('Password error or userId not available');
      this.errorMessage = 'Password not valid or user not available';
      this.cdr.markForCheck();
      setTimeout(() => {
        this.errorMessage = null;
        this.cdr.markForCheck();
      }, 4000);
    }
  }

  copyToClipboard(password: string | undefined): void {
    if (password) {
      navigator.clipboard.writeText(password).then(() => {
        console.log('Password copied');
        this.successMessagech = 'Password copied to clipboard';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.successMessagech = null;
          this.cdr.markForCheck();
        }, 3000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
        this.errorMessagech = 'Failed to copy password';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.errorMessagech = null;
          this.cdr.markForCheck();
        }, 3000);
      });
    }
  }

  copyToClipboardadmin(password: string | undefined): void {
    if (password) {
      navigator.clipboard.writeText(password).then(() => {
        console.log('Password copied');
        this.successMessageadmi = 'Password copied to clipboard';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.successMessageadmi = null;
          this.cdr.markForCheck();
        }, 3000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
        this.errorMessageadmi = 'Failed to copy password';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.errorMessageadmi = null;
          this.cdr.markForCheck();
        }, 3000);
      });
    }
  }

  onGenerateRandomPassword(): void {
    const defaultUserId = '1';
    this.superadminId = defaultUserId;

    this._SecurityServiceService.generateRandomPassword(this.superadminId).subscribe({
      next: (response: string) => {
        console.log('Random password generated for superadmin:', response);
        this.generatedPasswordsuper = response.trim();
        this.successMessagegsa = 'Password generated successfully!';
        this.errorMessagegsa = null;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.successMessagegsa = null;
          this.cdr.markForCheck();
        }, 4000);
      },
      error: (error) => {
        console.error('Failed to generate random password', error);
        this.errorMessagegsa = 'Failed to generate random password';
        this.successMessagegsa = null;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.errorMessagegsa = null;
          this.cdr.markForCheck();
        }, 4000);
      },
    });
  }

  onGenerateRandomPasswordadmin(): void {
    const adminId = this.securityForm.get('AdminId')?.value;

    if (adminId) {
      this._SecurityServiceService.generateRandomPassword(adminId).subscribe({
        next: (response: string) => {
          console.log('Random password generated for admin:', response);
          this.generatedPassword = response.trim();
          this.successMessageadmi = 'Password generated successfully!';
          this.errorMessageadmi = null;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.successMessageadmi = null;
            this.cdr.markForCheck();
          }, 4000);
        },
        error: (error) => {
          console.error('Failed to generate random password', error);
          this.errorMessageadmi = 'Failed to generate random password';
          this.generatedPassword = null;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.errorMessageadmi = null;
            this.cdr.markForCheck();
          }, 4000);
        },
      });
    } else {
      this.errorMessageadmi = 'Please select an admin.';
      this.cdr.markForCheck();
      setTimeout(() => {
        this.errorMessageadmi = null;
        this.cdr.markForCheck();
      }, 4000);
    }
  }

  onCancel(): void {
    this.securityForm.reset();
    this.adminFilterCtrl.setValue('');
    this.filteredAdmins = [...this.admins];
    this.cdr.markForCheck();
  }

  showAlert(): void {
    this._fuseAlertService.show('myAlertName');
  }

  dismissAlert(): void {
    this._fuseAlertService.dismiss('myAlertName');
  }

  ngOnDestroy(): void {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }
}