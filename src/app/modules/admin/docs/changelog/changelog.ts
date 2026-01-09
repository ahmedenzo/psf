/* eslint-disable max-len */
import { ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { Component, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgClass, CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { CardNumberFormatDirective } from './card-number-format.directive';
import { NgOtpInputModule } from 'ng-otp-input';
import { CrudService } from './crud.service';
import { OtpInputDirective } from './otp-input.directive';
import { AlertComponent } from '../alert/alert/alert.component';
import { FuseAlertComponent, FuseAlertService } from '@fuse/components/alert';

import { interval, Subscription, take } from 'rxjs';
import { MessageResponse } from './MessageResponse';

export enum PinOperationType {
  INITIAL_PIN = 'INITIAL_PIN',
  PIN_REMINDER = 'PIN_REMINDER'
}



@Component({
    selector       : 'changelog',
    templateUrl    : './changelog.html',
    styleUrls: ['./crud.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports: [
        CommonModule,
        MatIconModule,
        FormsModule,
        MatFormFieldModule,
        NgClass,
        CardNumberFormatDirective,
        MatInputModule,
        TextFieldModule,
        ReactiveFormsModule,
        MatButtonToggleModule,
        NgOtpInputModule,
        MatButtonModule,
        MatSelectModule,
        MatOptionModule,
        MatChipsModule,
        MatDatepickerModule,
        OtpInputDirective,
        FuseAlertComponent,
        AlertComponent,
      ],

      
})
export class ChangelogComponent
{
  private _fuseAlertService = inject(FuseAlertService);
    firstFormGroup: FormGroup;
    otpFormGroup: FormGroup;
    otpSent = false;
    
    verificationSubscription: Subscription | null = null;
    errorMessage: string | null = null; //
    successMessage: string | null = null;
    errorMessage1: string | null = null; //
    successMessage1: string | null = null;
    errorMessage2: string | null = null; //
    successMessage2: string | null = null;
    gsm: string = '';
    card: string = '';
    showSnackbar = false;
    isSuccess = false;
    snackbarMessage = '';
    otpVerified = false;
    countend: boolean = false;
    verificationStatus: string | null = null;
    isResendEnabled = false;
    hasResentOnce = false;  
    countdown: number = 90;
    countdownSubscription: Subscription | null = null;
    alertType: 'success' | 'warning' | 'error' = 'success';
    alertMessage = '';
    currentYear: number = new Date().getFullYear() % 100; 
    selectedCountryCode: string = '216'; 
  cardType: string | null = null;
    months = [
      { value: '01', viewValue: '01' },
      { value: '02', viewValue: '02' },
      { value: '03', viewValue: '03' },
      { value: '04', viewValue: '04' },
      { value: '05', viewValue: '05' },
      { value: '06', viewValue: '06' },
      { value: '07', viewValue: '07' },
      { value: '08', viewValue: '08' },
      { value: '09', viewValue: '09' },
      { value: '10', viewValue: '10' },
      { value: '11', viewValue: '11' },
      { value: '12', viewValue: '12' },
    ];
    countryCodes = [
      { code: '213', name: 'Algeria' },
      { code: '244', name: 'Angola' },
      { code: '973', name: 'Bahrain' },
      { code: '32', name: 'Belgium' },
      { code: '237', name: 'Cameroon' },
      { code: '1', name: 'Canada' },
      { code: '385', name: 'Croatia' },
      { code: '420', name: 'Czech Republic' },
      { code: '243', name: 'Democratic Republic of the Congo'},
      { code: '45', name: 'Denmark' },
      { code: '20', name: 'Egypt' },
      { code: '358', name: 'Finland' },
      { code: '33', name: 'France' },
      { code: '49', name: 'Germany' },
      { code: '233', name: 'Ghana' },
      { code: '353', name: 'Ireland' },
      { code: '39', name: 'Italy' },
      { code: '225', name: 'Ivory Coast' },
      { code: '962', name: 'Jordan' },
      { code: '965', name: 'Kuwait' },
      { code: '961', name: 'Lebanon' },
      { code: '218', name: 'Libya' },
      { code: '352', name: 'Luxembourg' },
      { code: '223', name: 'Mali' },
      { code: '356', name: 'Malta' },
      { code: '212', name: 'Morocco' },
      { code: '31', name: 'Netherlands' },
      { code: '47', name: 'Norway' },
      { code: '968', name: 'Oman' },
      { code: '970', name: 'Palestine' },
      { code: '48', name: 'Poland' },
      { code: '351', name: 'Portugal' },
      { code: '974', name: 'Qatar' },
      { code: '242', name: 'Republic of the Congo' },
      { code: '40', name: 'Romania' },
      { code: '7', name: 'Russia' },
      { code: '250', name: 'Rwanda' },
      { code: '966', name: 'Saudi Arabia' },
      { code: '221', name: 'Senegal' },
      { code: '381', name: 'Serbia' },
      { code: '27', name: 'South Africa' },
      { code: '82', name: 'South Korea' },
      { code: '34', name: 'Spain' },
      { code: '46', name: 'Sweden' },
      { code: '41', name: 'Switzerland' },
      { code: '886', name: 'Taiwan' },
      { code: '992', name: 'Tajikistan' },
      { code: '255', name: 'Tanzania' },
      { code: '228', name: 'Togo' },
      { code: '216', name: 'Tunisia' },
      { code: '90', name: 'Turkey' },
      { code: '971', name: 'United Arab Emirates' },
      { code: '44', name: 'United Kingdom' },
      { code: '1', name: 'United States' },

    ];
   
    years = Array.from({ length: 10 }, (_, i) => {
      const year = (this.currentYear + i).toString().padStart(2, '0');
      return { value: year, viewValue: `20${year}` };
    });
    constructor(
      private _formBuilder: FormBuilder,
      private crudService: CrudService,
      private cdr: ChangeDetectorRef
    ) {
      this.firstFormGroup = this._formBuilder.group({
        cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
        nationalId: ['', [Validators.required, this.nationalIdValidator()]],  // Custom validator
        gsm: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
        finalDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
        countryCode: [this.selectedCountryCode, Validators.required] ,
        operationType: ['INITIAL_PIN', Validators.required] 
      });
  this.firstFormGroup.get('cardNumber')?.valueChanges.subscribe(value => {
      this.detectCardType(value);
    });
      this.otpFormGroup = this._formBuilder.group({
        otp1: ['', [Validators.required, Validators.maxLength(1)]],
        otp2: ['', [Validators.required, Validators.maxLength(1)]],
        otp3: ['', [Validators.required, Validators.maxLength(1)]],
        otp4: ['', [Validators.required, Validators.maxLength(1)]],
        otp5: ['', [Validators.required, Validators.maxLength(1)]],
        otp6: ['', [Validators.required, Validators.maxLength(1)]],

      });
      this.cdr.markForCheck();
    }
    detectCardType(cardNumber: string): void {
    if (!cardNumber) {
      this.cardType = null;
      return;
    }
    if (cardNumber.startsWith('4')) {
      this.cardType = 'visa';
    } else if (['51', '52', '53', '54', '55'].some(prefix => cardNumber.startsWith(prefix))) {
      this.cardType = 'mastercard';
    } else {
      this.cardType = null;
    }
  }
nationalIdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return { required: true };
    }

    const cinPattern = /^\d{8}$/;                 // CIN : 8 chiffres
    const passportPattern = /^[A-Za-z0-9]{6,12}$/; // Passeport : 6 à 12 alphanumériques

    if (cinPattern.test(control.value) || passportPattern.test(control.value)) {
      return null; // valid
    }

    return { pattern: true }; // invalid
  };
}

    cardNumberValidator(control: AbstractControl): { [key: string]: any } | null {
      const value = control.value ? control.value.replace(/\D/g, '') : '';
      if (!value) {
        return { 'required': true };
      }
      if (value.length !== 16 || !this.isValidCardNumber(value)) {
        return { 'pattern': true };
      }
      return null;
    }
  
    private isValidCardNumber(cardNumber: string): boolean {
      let sum = 0;
      let shouldDouble = false;
  
      for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i), 10);
  
        if (shouldDouble) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }
  
        sum += digit;
        shouldDouble = !shouldDouble;
      }
  
      return (sum % 10 === 0);
    }
    formatExpiration(event: any) {
      const input = event.target;
      let value = input.value.replace(/\D/g, ''); // Remove non-digit characters
    
      if (value.length > 4) {
        value = value.slice(0, 4); // Limit to 4 digits
      }
    
      if (value.length <= 2) {
        input.value = value;
      } else {
        input.value = `${value.slice(0, 2)}/${value.slice(2)}`;
      }

      this.firstFormGroup.get('finalDate')?.setValue(input.value, { emitEvent: false });
    

      this.validateExpiration(value);
    }
    
    validateExpiration(value: string) {
      const month = parseInt(value.slice(0, 2), 10);
      const year = parseInt(value.slice(2, 4), 10);
    
      // Get the current year in two-digit format (e.g., 24 for 2024)
      const currentYear = new Date().getFullYear() % 100;
    
      if (month < 1 || month > 12) {
        this.firstFormGroup.get('finalDate')?.setErrors({ invalidMonth: true });
      } else if (year < currentYear) {
        this.firstFormGroup.get('finalDate')?.setErrors({ invalidYear: true });
      } else {
        this.firstFormGroup.get('finalDate')?.setErrors(null);
      }
    }

    
   verifyCardholder(): void {
  if (this.firstFormGroup.valid) {
    const {
      cardNumber,
      nationalId,
      gsm,
      finalDate,
      countryCode,
      operationType
    } = this.firstFormGroup.value;

    const formattedExpiration = finalDate.replace('/', '');
    this.gsm = countryCode + gsm;
    this.card = cardNumber;

    // ✅ Logs envoyés au Backend
    console.log('🔹 Sending Verification Request...');
    console.log('📌 Card Number:', cardNumber);
    console.log('🪪 National ID:', nationalId);
    console.log('📱 Phone (formatted):', this.gsm);
    console.log('⏳ Expiration:', formattedExpiration);
    console.log('⚙️ Operation Type:', operationType);

    this.resetAlerts();

    this.crudService.verifyCardholder(
      cardNumber,
      nationalId,
      this.gsm,
      formattedExpiration,
      operationType
    ).subscribe(
      (response) => {
        console.log('✅ Backend Response Success:', response);
        this.successMessage = 'Verification initiated successfully. Waiting for status...';
        this.hideMessageAfterTimeout();
        this.subscribeToVerificationUpdates();
      },
      (error) => {
        console.error('❌ Backend Response Error:', error);
        this.errorMessage = 'Failed to initiate verification: Check Information';
        this.hideMessageAfterTimeout();
      }
    );
  } else {
    console.warn('⚠️ Form invalid → Verification NOT sent');
    console.table(this.firstFormGroup.errors);
  }
}


    subscribeToVerificationUpdates(): void {
        if (!this.verificationSubscription) {
            this.verificationSubscription = this.crudService.getVerificationStatusUpdates().subscribe(
                (status) => {
                    if (status) {
                        this.resetAlerts();
                        this.verificationStatus = status.message;
                        console.log('Received verification status:', status);

                        if (status.message === 'OTP sent successfully to Cardholder phone') {
                            this.successMessage = `Verification: ${status.message}`;
                            this.startCountdown();
                            this.otpSent = true;
                            this.isResendEnabled = true;
                        } else {
                            this.errorMessage = `Verification failed: ${status.message}`;
                            this.otpSent = false;
                        }

                        this.hideMessageAfterTimeout(); // Hide after 2 seconds
                    }
                },
                (error) => {
                    console.error('WebSocket Error:', error);
                    this.errorMessage = 'Error receiving verification status.';
                    this.hideMessageAfterTimeout(); // Hide after 2 seconds
                }
            );
        }
    }

    hideMessageAfterTimeout(): void {
        setTimeout(() => {
            this.resetAlerts();
            this.cdr.markForCheck(); // Trigger change detection
        }, 3000); // 2 seconds timeout
    }

    resetAlerts(): void {
        this.successMessage = null;
        this.errorMessage = null;
        this.verificationStatus = null;
        this.cdr.markForCheck();
    }

resetState(): void {
  this.otpSent = false;
  this.verificationStatus = null;
  this.resetAlerts();
  this.isResendEnabled = false;

  // ✅ remet toujours le type d’opération par défaut
  this.firstFormGroup.patchValue({ operationType: 'INITIAL_PIN' });
}


    ngOnDestroy(): void {
    this.clearCountdown();
        if (this.verificationSubscription) {
            this.verificationSubscription.unsubscribe();
        }
        this.resetState();
    }
    
  verifyOtp(): void {
  if (this.otpFormGroup.valid) {
    const otp = Object.values(this.otpFormGroup.value).join('');
    const operationType = this.firstFormGroup.get('operationType')?.value
      ?? PinOperationType.INITIAL_PIN;

    this.crudService.validateOtp(
      this.gsm,
      otp,
      this.card,
      operationType
    ).subscribe(
      (response: MessageResponse) => {
        if (response.message === 'Phone number validated successfully.') {
          this.successMessage1 = response.message;
          this.otpVerified = true;
          this.isResendEnabled = false;
          this.clearCountdown();
          this.resetToCardholderForm(true);
          setTimeout(() => {
            this.successMessage1 = null;
            this.cdr.markForCheck();
          }, 2000);
        } else {
          this.handleOtpFailure(response.message);
        }
      },
      () => this.handleOtpFailure('OTP validation failed. Please try again.')
    );
  }
}




resendOtp(): void {
  if (!this.hasResentOnce) {
    this.hasResentOnce = true;
    this.isResendEnabled = false;

    this.crudService.resendOtp(this.gsm, this.card).subscribe(
      (response: MessageResponse) => {
        if (response.message === 'OTP resent successfully.') {
          this.successMessage2 = response.message;
          this.startCountdown();
        } else {
          this.handleOtpFailure(response.message);
        }

        setTimeout(() => {
          this.successMessage2 = null;
          this.cdr.markForCheck();
        }, 2000);
      },
      () => {
        this.handleOtpFailure('Failed to resend OTP. Returning to cardholder form.');
        this.cdr.markForCheck();
      }
    );
  } else {
    this.errorMessage2 = 'Resend OTP can only be attempted once.';
    setTimeout(() => {
      this.errorMessage2 = null;
      this.cdr.markForCheck();
    }, 2000);
  }
}


handleOtpFailure(errorMessage: string): void {
  this.errorMessage1 = errorMessage;
  this.successMessage = null;
  this.otpFormGroup.reset();

  // Enable resend button if countdown has ended and no resend attempt has been made
  this.isResendEnabled = this.countdown === 0 && !this.hasResentOnce;

  // Clear error message after 4 seconds
  setTimeout(() => {
      this.errorMessage1 = null;
      this.cdr.markForCheck();
  }, 2000);

  this.cdr.markForCheck();
}




private resetToCardholderForm(resetOtpState: boolean = false): void {
  this.otpSent = false;
  this.isResendEnabled = true;
  this.countdown = 0;
  this.otpVerified = false;
  this.hasResentOnce = false;

  console.log(this.otpSent)
  // Clear OTP state if specified
  if (resetOtpState) {
     
  }
  console.log(this.otpVerified)
  // Display the message for 2 seconds before clearing the form
 this.resetOtpForm();
  this.cdr.markForCheck();

  setTimeout(() => {
      // Clear the error message and reset the cardholder form
      this.errorMessage = null;
      this.clearCardholderForm(); // Ensure you clear the form
      this.cdr.markForCheck();
  }, 3000); // Display message for 2 seconds

  this.clearCountdown();
  this.cdr.markForCheck();
}




private clearCardholderForm(): void {
  const countryCode = this.firstFormGroup.get('countryCode')?.value;

  this.firstFormGroup.reset();

  // ✅ après reset, on remet les valeurs par défaut voulues
  this.firstFormGroup.patchValue({
    countryCode,
    operationType: 'INITIAL_PIN'
  });
}






clearCountdown(): void {
  if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
  }
  this.countdown = 90;
}

    cancelOtp(): void {
      this.otpSent = false; 
      this.otpVerified = false;
      this.resetOtpForm()
      this.resetCardholderForm();
    }
    resetCardholderForm(): void {
      // Reset cardholder form fields
      this.firstFormGroup.reset();
    }
    resetOtpForm(): void {
      // Reset OTP form fields
      this.otpFormGroup.reset();
    }
    showAlert(): void {
      this._fuseAlertService.show('myAlertName'); 
  }

  dismissAlert(): void {
      this._fuseAlertService.dismiss('myAlertName'); 
  }



  private startCountdown(): void {
    
    this.clearCountdown();
    this.countdown = 90;
    this.countend = false;
    this.countdownSubscription = interval(1000).pipe(take(90)).subscribe({
        next: () => {
            this.countdown--;
            this.cdr.markForCheck();
        },
        complete: () => {
          this.countend = true;
            // Only reset if the user has already attempted a resend and OTP is still not verified
            if (this.hasResentOnce && !this.otpVerified) {
                this.errorMessage2 = 'Maximum attempts reached.';
                this.resetToCardholderForm();
                this.resetOtpForm();
                setTimeout(() => {
                  this.errorMessage2 = null;
                  this.cdr.markForCheck();
              }, 2000);
            }
            this.cdr.markForCheck();
        },
    });
}


 
  }

  
