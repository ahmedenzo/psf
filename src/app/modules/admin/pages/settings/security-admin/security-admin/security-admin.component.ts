import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
import { Subject, Subscription } from 'rxjs';
import { SecurityServiceService } from 'app/core/services/security-service.service';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FormControl } from '@angular/forms';

export function passwordComplexityValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const password = control.value;

        // Regular expression for password validation
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        // Validate the password
        const valid = passwordPattern.test(password);
        return valid ? null : { passwordComplexity: true };
    };
}

@Component({
  selector: 'app-security-admin',
  standalone: true,
 
  templateUrl: './security-admin.component.html',
  styleUrl: './security-admin.component.scss',
  imports : [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSlideToggleModule, MatButtonModule, MatSelectModule, FuseAlertComponent, MatOptionModule, CommonModule,NgxMatSelectSearchModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SecurityAdminComponent {
  adminFilterCtrl = new FormControl();
  filteredAdmins: any[] = [];
    showCurrentPassword: boolean = false;  // For toggling current password visibility
    showNewPassword: boolean = false;
    securityForm: UntypedFormGroup;
    admins: any[] = [];
    
    adminId: string | null = null;  // To store the user ID
  
    errorMessage: string | null = null;
    successMessage: string | null = null;
    errorMessagegsa: string | null = null;
    
    errorMessageadmi: string | null = null;
    successMessageadmi: string | null = null;

    errorMessagech: string | null = null;
    successMessagech: string | null = null;
    id: string | null = null; // Store the user ID
   
    user: User;

    successMessagegsa: string | null = null;
    generatedPasswordsuper: string | null = null; 
    generatedPassword: string | null = null; 
    private _bankService = inject(BankServiceService);
    private _fuseAlertService = inject(FuseAlertService);
    private _SecurityServiceService=inject(SecurityServiceService)
    private subscriptions: Subscription = new Subscription();
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private cdr: ChangeDetectorRef,
        private _userService: UserService,
    ) {}

    ngOnInit(): void {
        this.securityForm = this._formBuilder.group({
            currentPasswordsuper: [''],
            newPasswordsuper: ['', passwordComplexityValidator()], // Apply the custom validator
            AdminId: [''],
        });
        this.getadmins();

  this.adminFilterCtrl.valueChanges.subscribe(search => {
    this.filteredAdmins = this.admins.filter(admin =>
      admin.username.toLowerCase().includes((search || '').toLowerCase())
    );
  });

        this.subscriptions.add(
            this._userService.user$.subscribe(user => {
              if (user && user.roles) {
                console.log('User roles in ProjectComponent:', user.roles);
             
                this.id = user.id; 
               console.log ('userid',this.id)
              
         
          
              }
            })
          );
 
    }
    

 
        

 
    
    onGenerateRandomPasswordadmin(): void {
        const adminId = this.securityForm.get('AdminId')?.value; 
      
        if (adminId) {
          this._SecurityServiceService.generateRandomPassword(adminId).subscribe({
            next: (response: string) => {
              console.log('Random password generated for admin:', response);
              
              // Directly assign the response as the generated password
              this.generatedPassword = response.trim();
              this.errorMessageadmi = null;
              
              this.cdr.markForCheck();
            },
            error: (error) => {
              console.error('Failed to generate random password', error);
              this.errorMessageadmi = 'Failed to generate random password';
              this.generatedPassword = null;
              this.cdr.markForCheck();
            }
          });
        } else {
          this.errorMessageadmi = 'Please select an admin.';
          this.cdr.markForCheck();
        }
      }


   
    
    

 getadmins(): void {
    this._bankService.GetAdmins().subscribe({
      next: (response) => {
        if (Array.isArray(response) && response.length > 0) {
          this.admins = response;
          this.filteredAdmins = [...this.admins]; // copie initiale
        }
      }
    });
  }

    onCancel(): void {
        this.securityForm.reset();
        this.cdr.markForCheck();
    }

    showAlert(): void {
        this._fuseAlertService.show('myAlertName');
    }

    dismissAlert(): void {
        this._fuseAlertService.dismiss('myAlertName');
    }

    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    onChangePasswordAdmin(): void {
        const defaultUserId = this.id
        this.adminId = defaultUserId;
    
        if (this.securityForm.valid && this.adminId) {  
            const formValues = this.securityForm.value;
            formValues.userId = this.adminId;  
    
            // Create a plain object instead of FormData
            const changePasswordRequest = {
                userId: formValues.userId,
                oldPassword: formValues.currentPasswordsuper,
                newPassword: formValues.newPasswordsuper
            };
    
            console.log('Change Password Request being submitted:', changePasswordRequest);
    
            this._SecurityServiceService.changePassword(changePasswordRequest).subscribe({
                next: (response) => {
                    console.log('Password changed successfully:', response);
                    this.successMessage = 'Password changed successfully!';
                    this.errorMessage = null;
                    this.securityForm.reset();
                    this.cdr.markForCheck();
                    this.getadmins();
    
                    setTimeout(() => {
                        this.successMessage = null;
                        this.cdr.markForCheck();
                    }, 4000);
                },
                error: (error) => {
                    console.error('Failed to change password', error);
                    this.errorMessage = 'Failed to change password '+error;
                    this.successMessage = null;
                    this.cdr.markForCheck();
                    setTimeout(() => {
                        this.errorMessage = null;
                        this.cdr.markForCheck();
                    }, 4000);
                }
            });
        } else {
            console.error('Password error or userId not available');
            this.errorMessage = 'Password not valid or user not available';
        }
    }
    copyToClipboard(password: string | undefined): void {
        if (password) {
            navigator.clipboard.writeText(password)
                .then(() => {
                    console.log('Password copied ');
                    this.successMessagech = 'Password copied '; // Set success message
                    this.cdr.markForCheck();
    
                    // Clear success message after 3 seconds
                    setTimeout(() => {
                        this.successMessagech = null;
                        this.cdr.markForCheck();
                    }, 3000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    this.errorMessagech = 'Failed to copy password'; // Set error message
                    this.cdr.markForCheck();
    
                    // Clear error message after 3 seconds
                    setTimeout(() => {
                        this.errorMessagech = null;
                        this.cdr.markForCheck();
                    }, 3000);
                });
        }
    }

    copyToClipboardadmin(password: string | undefined): void {
        if (password) {
            navigator.clipboard.writeText(password)
                .then(() => {
                    console.log('Password copied ');
                    this.successMessageadmi = 'Password copied '; // Set success message
                    this.cdr.markForCheck();
    
                    // Clear success message after 3 seconds
                    setTimeout(() => {
                        this.successMessageadmi = null;
                        this.cdr.markForCheck();
                    }, 3000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    this.errorMessageadmi = 'Failed to copy password'; // Set error message
                    this.cdr.markForCheck();
    
                    // Clear error message after 3 seconds
                    setTimeout(() => {
                        this.errorMessageadmi = null;
                        this.cdr.markForCheck();
                    }, 3000);
                });
        }
    }



    
    
    
    onGenerateRandomPassword(): void {
        const defaultUserId = this.id
        this.adminId = defaultUserId;
    
        this._SecurityServiceService.generateRandomPassword(this.adminId).subscribe({
            next: (response: string) => {
                console.log('Random password generated for admin:', response);
                
                // Assuming the response is directly the password string, assign it
                this.generatedPasswordsuper = response.trim(); // Ensure no leading/trailing spaces
          
                // Reset success/error messages
                this.successMessagegsa = 'Password generated successfully!';
                this.errorMessagegsa = null;
          
                this.cdr.markForCheck();  // Trigger change detection to update the view
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
              }
            });
          }
}
