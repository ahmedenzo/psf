import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, inject, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FuseAlertComponent, FuseAlertService } from '@fuse/components/alert';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BankServiceService } from 'app/core/services/bank-service.service';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subscription } from 'rxjs';

export function passwordComplexityValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const valid = passwordPattern.test(password);
    return valid ? null : { passwordComplexity: true };
  };
}

@Component({
  selector: 'settings-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatTooltipModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatTableModule,
    MatButtonModule,
    MatExpansionModule,
    FuseAlertComponent,
    CommonModule,
    MatSlideToggleModule,
    NgxMatSelectSearchModule, // Added for search functionality
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsAccountComponent implements OnInit {
  private _fuseAlertService = inject(FuseAlertService);
  private _bankService = inject(BankServiceService);
  private _fuseConfirmationService = inject(FuseConfirmationService);

  @ViewChild('accountFormRef') accountFormRef!: ElementRef;

  accountForm: UntypedFormGroup;
  adminForm: UntypedFormGroup;
  AssoAdminForm: UntypedFormGroup;
  logoPreview: string | ArrayBuffer | null = null;
  logoFile: File | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  errorMessageu: string | null = null;
  successMessageu: string | null = null;
  errorMessagea: string | null = null;
  successMessagea: string | null = null;
  successMessageadmin: string | null = null;
  errorMessageadmin: string | null = null;
  showPassword: boolean = false;
  isEditMode: boolean = false;
  selectedBankId: any;
  selectedBank: any;
  banks: any[] = [];
  admins: any[] = [];
  filteredAdmins: any[] = [];
  filteredBanks: any[] = [];
  adminFilterCtrl = new FormControl('');
  bankFilterCtrl = new FormControl('');
  private _subscription: Subscription = new Subscription();

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize forms
    this.accountForm = this._formBuilder.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z]+$/)]],
      bankCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      libelleBanque: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z\s]+$/)]],
      enseigneBanque: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^[A-Za-z\s]+$/)]],
      banqueEtrangere: [false],
      logo: [null],
    });

    this.adminForm = this._formBuilder.group({
      username: ['', Validators.required],
      password: ['', passwordComplexityValidator()],
      email: ['', Validators.email],
      phoneNumber: [''],
    });

    this.AssoAdminForm = this._formBuilder.group({
      AdminId: ['', Validators.required],
      bankId: ['', Validators.required],
    });

    // Auto uppercase fields
    this.autoUppercaseFields(['name', 'libelleBanque', 'enseigneBanque']);

    // Load initial data
    this.loadBanks();
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

    this._subscription.add(
      this.bankFilterCtrl.valueChanges.subscribe(search => {
        this.filteredBanks = this.banks.filter(bank =>
          bank.name.toLowerCase().includes((search || '').toLowerCase())
        );
        this.cdr.markForCheck();
      })
    );
  }

  autoUppercaseFields(fields: string[]): void {
    fields.forEach(field => {
      this.accountForm.get(field)?.valueChanges.subscribe(value => {
        if (value) {
          this.accountForm.get(field)?.setValue(value.toUpperCase(), { emitEvent: false });
        }
      });
    });
  }

  get f() {
    return this.accountForm.controls;
  }

  onEdit(bank: any) {
    this.accountForm.patchValue({
      name: bank.name,
      bankCode: bank.bankCode,
      libelleBanque: bank.libelleBanque,
      enseigneBanque: bank.enseigneBanque,
      banqueEtrangere: bank.banqueEtrangere,
    });

    this.selectedBankId = bank.id;
    this.selectedBank = bank.logoContent;
    this.isEditMode = true;
    this.logoPreview = this.selectedBank ? `data:image/png;base64,${this.selectedBank}` : null;
    this.scrollToForm();
    this.cdr.markForCheck();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result;
        this.logoFile = file;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
      this.accountForm.patchValue({ logo: file });
    }
  }

  onUpdate(): void {
    if (this.accountForm.valid) {
      const formData = new FormData();
      const bankRequest = { ...this.accountForm.value };
      delete bankRequest.logo;

      formData.append('bankRequest', JSON.stringify(bankRequest));

      if (this.logoFile) {
        formData.append('logo', this.logoFile);
      } else if (this.selectedBank) {
        const existingLogoBlob = this.base64ToBlob(this.selectedBank, 'image/png');
        formData.append('logo', existingLogoBlob, 'existing-logo.png');
      }

      if (this.selectedBankId) {
        this.accountForm.disable();
        this._bankService.updateBank(this.selectedBankId, formData).subscribe({
          next: (response) => {
            this.successMessageu = 'Bank updated successfully!';
            this.errorMessageu = null;
            this.accountForm.reset();
            this.logoPreview = null;
            this.logoFile = null;
            this.isEditMode = false;
            this.selectedBankId = null;
            this.loadBanks();
            this.getadmins();
            this.cdr.markForCheck();
            setTimeout(() => {
              this.successMessageu = null;
              this.accountForm.enable();
              this.cdr.markForCheck();
            }, 2000);
          },
          error: (error) => {
            console.error('Error updating bank:', error);
            this.errorMessageu = 'Failed to update bank. Please try again.';
            this.successMessageu = null;
            this.cdr.markForCheck();
            setTimeout(() => {
              this.errorMessageu = null;
              this.accountForm.enable();
              this.cdr.markForCheck();
            }, 2000);
          },
        });
      } else {
        this.errorMessageu = 'No bank selected for update';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.errorMessageu = null;
          this.cdr.markForCheck();
        }, 2000);
      }
    } else {
      this.errorMessageu = 'Form is invalid';
      this.cdr.markForCheck();
      setTimeout(() => {
        this.errorMessageu = null;
        this.cdr.markForCheck();
      }, 2000);
    }
  }

  base64ToBlob(base64: string, type: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([byteNumbers], { type });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.cdr.markForCheck();
  }

  displayedColumns: string[] = ['logo', 'name', 'bank_code', 'BankAdmin', 'actions'];

loadBanks(): void {
  this._bankService.getAllBanks().subscribe({
    next: (response) => {
      if (response && response.banks && Array.isArray(response.banks)) {
        this.banks = response.banks.map(bank => ({
          ...bank,
          logoPreview: bank.logoContent ? bank.logoContent : null
        }));
        this.filteredBanks = [...this.banks];
        this.cdr.markForCheck();
      }
    },
    error: (error) => {
      console.error('Error fetching banks:', error);
    },
  });
}

  scrollToForm() {
    this.accountFormRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  getadmins(): void {
    this._bankService.GetAdmins().subscribe({
      next: (response) => {
        console.log('Fetched Admins data:', response);
        if (Array.isArray(response) && response.length > 0) {
          this.admins = response.map(admin => ({
            ...admin,
            logoPreview: admin.logoContent ? `data:image/png;base64,${admin.logoContent}` : null,
          }));
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

  onSave(): void {
    if (this.accountForm.valid && this.logoFile) {
      const formData = new FormData();
      const bankRequest = { ...this.accountForm.value };
      delete bankRequest.logo;

      formData.append('bankRequest', JSON.stringify(bankRequest));
      formData.append('logo', this.logoFile);

      this._bankService.createBank(formData).subscribe({
        next: (response) => {
          console.log('Bank created successfully:', response);
          this.successMessage = 'Bank created successfully!';
          this.errorMessage = null;
          this.accountForm.reset();
          this.logoPreview = null;
          this.logoFile = null;
          this.loadBanks();
          this.getadmins();
          this.cdr.markForCheck();
          setTimeout(() => {
            this.successMessage = null;
            this.cdr.markForCheck();
          }, 1000);
        },
        error: (error) => {
          console.error('Failed to create bank:', error);
          this.errorMessage = error.message || 'Error occurred while creating bank';
          this.successMessage = null;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.errorMessage = null;
            this.cdr.markForCheck();
          }, 1000);
        },
      });
    } else {
      console.error('Form is invalid or logo file is missing');
      this.errorMessage = 'Form is invalid or logo file is missing';
      this.cdr.markForCheck();
      setTimeout(() => {
        this.errorMessage = null;
        this.cdr.markForCheck();
      }, 4000);
    }
  }

  generatePassword() {
    const length = 12;
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '@$!%*?&';
    const allChars = lowercase + uppercase + numbers + specialChars;

    let password = '';
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    password = this.shufflePassword(password);
    this.adminForm.get('password')?.setValue(password);
    this.cdr.markForCheck();
  }

  shufflePassword(password: string): string {
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  associateAdmin(): void {
    if (this.AssoAdminForm.valid) {
      const adminId = this.AssoAdminForm.get('AdminId')?.value;
      const bankId = this.AssoAdminForm.get('bankId')?.value;

      const selectedAdmin = this.admins.find(admin => admin.id === adminId);
      const selectedBank = this.banks.find(bank => bank.id === bankId);

      const adminName = selectedAdmin ? selectedAdmin.username : 'Unknown Admin';
      const bankName = selectedBank ? selectedBank.name : 'Unknown Bank';

      const confirmation = this._fuseConfirmationService.open({
        title: 'Association Confirmation',
        message: `You are about to associate Admin: ${adminName}.\nWith Bank: ${bankName}.\nAre you sure you want to confirm?`,
        icon: { show: true, name: 'link', color: 'primary' },
        actions: {
          confirm: { show: true, label: 'Confirm', color: 'primary' },
          cancel: { show: true, label: 'Cancel' },
        },
        dismissible: true,
      });

      confirmation.afterClosed().subscribe(result => {
        if (result === 'confirmed') {
          this._bankService.associateAdminToBank(adminId, bankId).subscribe({
            next: (response) => {
              console.log('Admin associated to bank successfully:', response);
              this.successMessagea = 'Admin associated to bank successfully!';
              this.errorMessagea = null;
              this.AssoAdminForm.reset();
              this.adminFilterCtrl.setValue('');
              this.bankFilterCtrl.setValue('');
              this.filteredAdmins = [...this.admins];
              this.filteredBanks = [...this.banks];
              this.loadBanks();
              this.getadmins();
              this.cdr.markForCheck();
              setTimeout(() => {
                this.successMessagea = null;
                this.cdr.markForCheck();
              }, 4000);
            },
            error: (error) => {
              console.error('Failed to associate admin to bank:', error);
              this.errorMessagea = error.error?.message || error.message || 'Failed to associate admin to bank';
              this.successMessagea = null;
              this.cdr.markForCheck();
              setTimeout(() => {
                this.errorMessagea = null;
                this.cdr.markForCheck();
              }, 4000);
            },
          });
        } else {
          console.log('Association cancelled');
        }
      });
    }
  }

  refreshPage(): void {
    window.location.reload();
  }

  registerAdmin(): void {
    if (this.adminForm.valid) {
      const user = this.adminForm.value;
      user.role = ['admin'];

      this._bankService.registerAdmin(user).subscribe({
        next: (response) => {
          console.log('Admin registered successfully:', response);
          this.successMessageadmin = 'Admin registered successfully!';
          this.errorMessageadmin = null;
          this.adminForm.reset();
          this.loadBanks();
          this.getadmins();
          this.cdr.markForCheck();
          setTimeout(() => {
            this.successMessageadmin = null;
            this.cdr.markForCheck();
          }, 4000);
        },
        error: (error) => {
          console.error('Failed to register admin:', error);
          this.errorMessageadmin = error.error?.message || 'Failed to register admin';
          this.successMessageadmin = null;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.errorMessageadmin = null;
            this.cdr.markForCheck();
          }, 4000);
        },
      });
    }
  }

  onCancel(): void {
    this.accountForm.reset();
    this.logoPreview = null;
    this.logoFile = null;
    this.isEditMode = false;
    this.cdr.markForCheck();
  }

  onCanceladmin(): void {
    this.adminForm.reset();
    this.cdr.markForCheck();
  }

  onCancelass(): void {
    this.AssoAdminForm.reset();
    this.adminFilterCtrl.setValue('');
    this.bankFilterCtrl.setValue('');
    this.filteredAdmins = [...this.admins];
    this.filteredBanks = [...this.banks];
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