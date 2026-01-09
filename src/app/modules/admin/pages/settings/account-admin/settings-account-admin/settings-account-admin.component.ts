import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, inject, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FuseAlertComponent, FuseAlertService } from '@fuse/components/alert';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AgencyService } from 'app/core/services/agency-service.service';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { Agency, Region, BizerteCities, TunisCities, NabeulCities, TozeurCities, ZaghouanCities, TataouineCities, SousseCities, SilianaCities, SidiBouzidCities, SfaxCities, MonastirCities, MedenineCities, ManoubaCities, MahdiaCities, KefCities, KebiliCities, KasserineCities, KairouanCities, JendoubaCities, GafsaCities, GabesCities, BenArousCities, BejaCities, ArianaCities } from 'app/core/Model/Agency.model';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject, takeUntil } from 'rxjs';

export function passwordComplexityValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const password = control.value;
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const valid = passwordPattern.test(password);
        return valid ? null : { passwordComplexity: true };
    };
}

@Component({
  selector: 'app-settings-account-admin',
  templateUrl: './settings-account-admin.component.html',
  styleUrl: './settings-account-admin.component.scss',
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
      NgxMatSelectSearchModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsAccountAdminComponent implements OnInit {
  private _fuseAlertService = inject(FuseAlertService);
  private _AgencyService = inject(AgencyService);  
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  @ViewChild('accountFormRef') accountFormRef!: ElementRef;
  showPasswordHint = false;
  regions = Object.values(Region);
  availableCities: string[] = [];
  accountForm: UntypedFormGroup;
  adminForm: UntypedFormGroup;
  AssoagentForm: UntypedFormGroup;
  private _fuseConfirmationService = inject(FuseConfirmationService);
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
  selectedagencetId: any;
  selectedagence: any;
  Agency: any[] = [];
  agents: any[] = [];
  agentFilterCtrl = new FormControl();
  filteredAgents: any[] = [];
  agencyFilterCtrl = new FormControl(); // Added for agency search
  filteredAgencies: any[] = []; // Added for agency search
  selectedFile: File | null = null;
  isLoading: boolean = false;

  constructor(
      private _formBuilder: UntypedFormBuilder,
      private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.accountForm = this._formBuilder.group({
      name: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      agencyCode: ['', Validators.required],
      contactPhoneNumber: ['', Validators.required],
      adresse: ['', Validators.required],
      region: ['', Validators.required],
      city: ['', Validators.required],
    });

    this.accountForm.get('region')?.valueChanges.subscribe(region => {
      this.updateCitiesForRegion(region);
    });

    this.adminForm = this._formBuilder.group({
      username: ['', Validators.required],
      password: ['', passwordComplexityValidator()],
      email: ['', Validators.email],
      phoneNumber: [''],
    });

    this.AssoagentForm = this._formBuilder.group({
      userId: ['', Validators.required],
      agencyId: ['', Validators.required],
    });

    this.loadagency();
    this.getagents();

    // Subscribe to agentFilterCtrl value changes for agent search
    this.agentFilterCtrl.valueChanges.pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe(search => {
      this.filteredAgents = this.agents.filter(agent =>
        agent.username.toLowerCase().includes((search || '').toLowerCase())
      );
      this.cdr.markForCheck();
    });

    // Subscribe to agencyFilterCtrl value changes for agency search
    this.agencyFilterCtrl.valueChanges.pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe(search => {
      this.filteredAgencies = this.Agency.filter(agency =>
        agency.name.toLowerCase().includes((search || '').toLowerCase())
      );
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  updateCitiesForRegion(region: Region): void {
    switch (region) {
        case Region.Ariana:
            this.availableCities = Object.values(ArianaCities);
            break;
        case Region.Beja:
            this.availableCities = Object.values(BejaCities);
            break;
        case Region.BenArous:
            this.availableCities = Object.values(BenArousCities);
            break;
        case Region.Bizerte:
            this.availableCities = Object.values(BizerteCities);
            break;
        case Region.Gabes:
            this.availableCities = Object.values(GabesCities);
            break;
        case Region.Gafsa:
            this.availableCities = Object.values(GafsaCities);
            break;
        case Region.Jendouba:
            this.availableCities = Object.values(JendoubaCities);
            break;
        case Region.Kairouan:
            this.availableCities = Object.values(KairouanCities);
            break;
        case Region.Kasserine:
            this.availableCities = Object.values(KasserineCities);
            break;
        case Region.Kebili:
            this.availableCities = Object.values(KebiliCities);
            break;
        case Region.Kef:
            this.availableCities = Object.values(KefCities);
            break;
        case Region.Mahdia:
            this.availableCities = Object.values(MahdiaCities);
            break;
        case Region.Manouba:
            this.availableCities = Object.values(ManoubaCities);
            break;
        case Region.Medenine:
            this.availableCities = Object.values(MedenineCities);
            break;
        case Region.Monastir:
            this.availableCities = Object.values(MonastirCities);
            break;
        case Region.Nabeul:
            this.availableCities = Object.values(NabeulCities);
            break;
        case Region.Sfax:
            this.availableCities = Object.values(SfaxCities);
            break;
        case Region.SidiBouzid:
            this.availableCities = Object.values(SidiBouzidCities);
            break;
        case Region.Siliana:
            this.availableCities = Object.values(SilianaCities);
            break;
        case Region.Sousse:
            this.availableCities = Object.values(SousseCities);
            break;
        case Region.Tataouine:
            this.availableCities = Object.values(TataouineCities);
            break;
        case Region.Tozeur:
            this.availableCities = Object.values(TozeurCities);
            break;
        case Region.Tunis:
            this.availableCities = Object.values(TunisCities);
            break;
        case Region.Zaghouan:
            this.availableCities = Object.values(ZaghouanCities);
            break;
        default:
            this.availableCities = [];
            break;
    }
    this.cdr.markForCheck();
  }

  onEdit(agence: any) {
      this.accountForm.patchValue({
          name: agence.name,
          contactEmail: agence.contactEmail,
          contactPhoneNumber: agence.contactPhoneNumber,
          adresse: agence.adresse,
          region: agence.region,
          city: agence.city,
      });
      this.selectedagencetId = agence.id;
      this.isEditMode = true;
      this.scrollToForm();
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(/[^a-zA-Z]/).filter(Boolean);
    return parts.length >= 2
        ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
        : name.slice(0, 2).toUpperCase();
  }

  onUpdate(): void {
      if (this.accountForm.valid) {
          if (this.selectedagencetId) {
              this._AgencyService.updateAgency(this.selectedagencetId, this.accountForm.value).subscribe({
                  next: (response) => {
                      this.successMessageu = 'Agency updated successfully!';
                      this.errorMessageu = null;
                      this.accountForm.reset();
                      this.isEditMode = false;
                      this.selectedagencetId = null;
                      this.cdr.markForCheck();
                      setTimeout(() => {
                          this.successMessageu = null;
                          this.cdr.markForCheck();
                      }, 4000);
                  },
                  error: (error) => {
                      this.errorMessageu = 'Failed to update Agency';
                      this.successMessageu = null;
                      this.cdr.markForCheck();
                      setTimeout(() => {
                          this.errorMessageu = null;
                          this.cdr.markForCheck();
                      }, 4000);
                  }
              });
          } else {
              this.errorMessage = 'No Agency selected for update';
          }
      } else {
          this.errorMessage = 'Form is invalid';
      }
      this.cdr.markForCheck();
  }

  togglePasswordVisibility(): void {
      this.showPassword = !this.showPassword;
      this.cdr.markForCheck();
  }

  displayedColumns: string[] = ['logo', 'name', 'bank_code', 'BankAdmin', 'actions'];
  
  loadagency(): void {
      this.isLoading = true;
      this._AgencyService.listAllAgencies().subscribe({
          next: (response) => {
              this.Agency = Array.isArray(response) ? response : [];
              this.filteredAgencies = [...this.Agency]; // Initialize filteredAgencies
              this.isLoading = false;
              this.cdr.markForCheck();
          },
          error: (error) => {
              console.error('Error fetching agencies:', error);
              this.Agency = [];
              this.filteredAgencies = []; // Initialize filteredAgencies on error
              this.isLoading = false;
              this.cdr.markForCheck();
          }
      });
  }
  
  scrollToForm() {
      this.accountFormRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  getagents(): void {
      this._AgencyService.GetAgents().subscribe({
          next: (response) => {
              console.log('Fetched Agents data:', response);
              if (Array.isArray(response) && response.length > 0) {
                  this.agents = response;
                  this.filteredAgents = [...this.agents];
                  console.log('Agents data:', this.agents);
                  this.cdr.markForCheck();
              } else {
                  console.warn('No valid agents data found. Response structure:', response);
              }
          },
          error: (error) => {
              console.error('Error fetching agents:', error);
              this.cdr.markForCheck();
          }
      });
  }

  onSaveagence(): void {
      if (this.accountForm.valid) {
          this._AgencyService.createAgency(this.accountForm.value).subscribe({
              next: (response) => {
                  console.log('Agency created successfully:', response);
                  this.successMessage = 'Agency created successfully!';
                  this.errorMessage = null;
                  this.accountForm.reset();
                  this.loadagency();
                  this.getagents();
                  this.cdr.markForCheck();
                  setTimeout(() => {
                      this.successMessage = null;
                      this.cdr.markForCheck();
                  }, 4000);
              },
              error: (error) => {
                  console.error('Failed to create agency:', error);
                  if (error.error && error.error.message) {
                      this.errorMessage = error.error.message;
                  } else {
                      this.errorMessage = 'Failed to create agency: Agency Code Already Exist';
                  }
                  this.successMessage = null;
                  this.cdr.markForCheck();
                  setTimeout(() => {
                      this.errorMessage = null;
                      this.cdr.markForCheck();
                  }, 4000);
              }
          });
      } else {
          console.error('Form is invalid ');
          this.errorMessage = 'Form is invalid ';
          setTimeout(() => {
              this.errorMessage = null;
              this.cdr.markForCheck();
          }, 4000);
      }
  }

  generatePassword() {
      const length = 12;
      const lowercase = "abcdefghijklmnopqrstuvwxyz";
      const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numbers = "0123456789";
      const specialChars = "@$!%*?&";
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
   
  associateagent(): void {
      if (this.AssoagentForm.valid) {
          const userId = this.AssoagentForm.get('userId')?.value;
          const agencyId = this.AssoagentForm.get('agencyId')?.value;
          const selectedAdmin = this.agents.find(admin => admin.id === userId);
          const selectedBank = this.Agency.find(bank => bank.id === agencyId);
          const adminName = selectedAdmin ? selectedAdmin.username : 'Unknown Admin';
          const agencyName = selectedBank ? selectedBank.name : 'Unknown Agency';
  
          const confirmation = this._fuseConfirmationService.open({
              title: 'Confirm Association',
              message: `Are you sure you want to associate ${adminName} with ${agencyName}?`,
              icon: {
                  show: true,
                  name: 'link',
                  color: 'primary'
              },
              actions: {
                  confirm: {
                      label: 'Yes',
                      color: 'primary'
                  },
                  cancel: {
                      label: 'No'
                  }
              }
          });
  
          confirmation.afterClosed().subscribe((result) => {
              if (result === 'confirmed') {
                  this._AgencyService.associateUserToAgency(userId, agencyId).subscribe({
                      next: (response) => {
                          console.log('Agent associated to Agency successfully:', response);
                          this.successMessagea = 'Agent associated to Agency successfully!';
                          this.errorMessagea = null;
                          this.AssoagentForm.reset();
                          this.cdr.markForCheck();
                          setTimeout(() => {
                              this.successMessagea = null;
                              this.cdr.markForCheck();
                          }, 4000);
                      },
                      error: (error) => {
                          console.error('Failed associated to Agency:', error);
                          this.errorMessagea = 'Failed associated to Agency';
                          this.successMessagea = null;
                          this.cdr.markForCheck();
                          setTimeout(() => {
                              this.errorMessagea = null;
                              this.cdr.markForCheck();
                          }, 4000);
                      }
                  });
              }
          });
      }
  }

  refreshPage(): void {
      window.location.reload();
  }
  
  registeragent(): void {
      if (this.adminForm.valid) {
          const user = this.adminForm.value;
          console.log('ogagent', user);
          user.role = ['user'];
          this._AgencyService.registerAgent(user).subscribe({
              next: (response) => {
                  console.log('Agent registered successfully:', response);
                  this.successMessageadmin = 'Agent registered successfully!';
                  this.errorMessageadmin = null;
                  this.adminForm.reset();
                  this.cdr.markForCheck();
                  this.loadagency();
                  this.getagents();
                  setTimeout(() => {
                      this.successMessageadmin = null;
                      this.cdr.markForCheck();
                  }, 4000);
              },
              error: (error) => {
                  console.error('Failed to register admin:', error);
                  if (error.error && error.error.message) {
                      this.errorMessageadmin = error.error.message;
                  } else {
                      this.errorMessageadmin = 'Failed to register admin';
                  }
                  this.successMessageadmin = null;
                  this.cdr.markForCheck();
                  setTimeout(() => {
                      this.errorMessageadmin = null;
                      this.cdr.markForCheck();
                  }, 4000);
              }
          });
      }
  }
  
  onCancel(): void {
      this.accountForm.reset();
      this.cdr.markForCheck();
      this.isEditMode = false;
  }
  onCanceladmin(): void {
      this.adminForm.reset();
      this.cdr.markForCheck();
  }
  onCancelass(): void {
      this.AssoagentForm.reset();
      this.cdr.markForCheck();
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.errorMessageadmin = null;
      this.cdr.markForCheck();
    }
  }

  batchUploadAgents(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this._AgencyService.batchUploadAgents(formData).subscribe({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const contentDisposition = event.headers.get('content-disposition');
            const filename = contentDisposition?.split(';')[1].split('filename=')[1].replace(/"/g, '') || 'users_result.txt';
            const blob = new Blob([event.body], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
            this.successMessageadmin = 'Batch upload completed successfully!';
            this.errorMessageadmin = null;
            this.selectedFile = null;
            this.cdr.markForCheck();
            setTimeout(() => {
              this.successMessageadmin = null;
              this.cdr.markForCheck();
            }, 4000);
          }
        },
        error: (error) => {
          console.error('Failed to upload batch:', error);
          this.errorMessageadmin = 'Failed to upload batch';
          this.successMessageadmin = null;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.errorMessageadmin = null;
            this.cdr.markForCheck();
          }, 4000);
        }
      });
    } else {
      this.errorMessageadmin = 'Please select a file';
      this.cdr.markForCheck();
      setTimeout(() => {
        this.errorMessageadmin = null;
        this.cdr.markForCheck();
      }, 4000);
    }
  }

  showAlert(): void {
      this._fuseAlertService.show('myAlertName');
  }

  dismissAlert(): void {
      this._fuseAlertService.dismiss('myAlertName');
  }
}