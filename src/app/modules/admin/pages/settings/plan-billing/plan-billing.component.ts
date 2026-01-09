import { CurrencyPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation,inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSort ,MatSortModule} from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FuseAlertComponent, FuseAlertService } from '@fuse/components/alert';
import { BankServiceService } from 'app/core/services/bank-service.service';
import { TabBin } from 'app/core/Model/TabBin.model';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BinService } from 'app/core/services/bin-service.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ChangeDetectorRef } from '@angular/core';
import {  ValidatorFn } from '@angular/forms';


export function binSystemCodeValidator(): ValidatorFn {
    return (formGroup: UntypedFormGroup) => {
        const bin = formGroup.get('bin')?.value;
        const systemCode = formGroup.get('systemCode')?.value;

        if (bin.startsWith('4') && systemCode !== '2') {
            return { systemCodeInvalid: true };
        } else if (bin.startsWith('5') && systemCode !== '3') {
            return { systemCodeInvalid: true };
        } else if (bin.startsWith('9') && systemCode !== '1') {
            return { systemCodeInvalid: true };
        }

        return null; // No errors
    };
}

@Component({
    selector       : 'settings-plan-billing',
    templateUrl    : './plan-billing.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [FormsModule, ReactiveFormsModule, FuseAlertComponent, MatRadioModule, NgFor, NgClass, NgIf, MatIconModule, MatTableModule,MatSortModule,MatPaginatorModule,
         MatFormFieldModule, MatInputModule,
          MatSelectModule, MatOptionModule, MatButtonModule,
           CurrencyPipe],
           schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsPlanBillingComponent implements OnInit, AfterViewInit
{   private _binService = inject(BinService);
    @ViewChild('accountFormRef') accountFormRef!: ElementRef;
    private _fuseAlertService = inject(FuseAlertService);
    private _fuseConfirmationService = inject(FuseConfirmationService);
    displayedColumns: string[] = ['bankName','bin', 'systemCode', 'cardType', 'serviceCode','actions'];
    dataSource: MatTableDataSource<TabBin>;
   
    bins: TabBin[] = []; 

    filteredDataSource = new MatTableDataSource<TabBin>
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    accountForm: UntypedFormGroup;
    private _bankService = inject(BankServiceService);  
    banks: any[] = []; 
    uniqueBankCodes: string[] = []; 
 
    selectedBinId: any; // To keep track of which bank is being edited
    selectedBin:any;
    isEditMode: boolean = false;
    binPreview: string 
    isEditing: boolean = false;
    errorMessage: string | null = null; //
    successMessage: string | null = null;
    successMessagedelete: string | null = null;
    successMessageupdate: string | null = null;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private cdr: ChangeDetectorRef 
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
        // Create the form
        this.accountForm = this._formBuilder.group({
            bin: ['', [Validators.required, Validators.pattern(/^[459](\d{5}|\d{7})$/)]], // Accepts 6 or 8 digits, starts with 4, 5, or 9

            systemCode: ['', [Validators.required, Validators.pattern(/^[231]$/)]], // Only 1, 2, or 3 allowed
            cardType: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]], // Exactly 3 digits
            serviceCode: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]], // Exactly 3 digits
            bankId: ['', Validators.required], // Required field
            keyDataA: ['', [Validators.required, Validators.pattern(/^[0-9A-Fa-f]{16}$/)]], // Hexadecimal 16 characters
            keyDataB: ['', [Validators.pattern(/^[0-9A-Fa-f]{16}$/)]], // Hexadecimal 16 characters
          
          },  
        ); // Attach the custom validator
        
          // Automatically update systemCode based on bin value
          this.accountForm.get('bin')?.valueChanges.subscribe(value => {
            if (value.startsWith('4')) {
              this.accountForm.get('systemCode')?.setValue('2', { emitEvent: false });
            } else if (value.startsWith('5')) {
              this.accountForm.get('systemCode')?.setValue('3', { emitEvent: false });
            } else if (value.startsWith('9')) {
              this.accountForm.get('systemCode')?.setValue('1', { emitEvent: false });
            } else {
              this.accountForm.get('systemCode')?.setValue('', { emitEvent: false }); // Clear systemCode if bin is invalid
            }
      
            // Trigger form validation after changing bin
            this.accountForm.get('systemCode')?.markAsTouched();
            this.accountForm.updateValueAndValidity();
          });
      
          // Trigger validation for manual changes to systemCode
   
        

        this.dataSource = new MatTableDataSource(this.bins);
        this.filteredDataSource = new MatTableDataSource(this.bins); 
        this.dataSource.sort = this._sort;
        this.dataSource.paginator = this._paginator;
        this.fetchBinsData()
        this.loadBanks()
        this.uniqueBankCodes = Array.from(new Set(this.bins.map(bin => bin.bankName)));
    }
    

    ngAfterViewInit(): void {
        this.dataSource.sort = this._sort;
        this.dataSource.paginator = this._paginator;
    }
    fetchBinsData(): void {
        this._binService.getAllTabBins().subscribe(
            (response: TabBin[]) => {
                this.bins = response;
                this.dataSource.data = this.bins;
                this.cdr.detectChanges();
    
                // Extract unique bank codes from the fetched bins
                this.uniqueBankCodes = Array.from(new Set(this.bins.map(bin => bin.bankName)));
            },
            (error) => {
                console.error('Error fetching TabBins:', error);
            }
        );
    }
    
      

      onEdit(bin: any) {
        this.accountForm.patchValue({
            bin: bin.bin,
            systemCode: bin.systemCode,
            cardType: bin.cardType,
            serviceCode: bin.serviceCode,
            keyDataA: bin.keyDataA,
            keyDataB: bin.keyDataB,
            bankId: bin.bankCode // Ensure this is the bank ID
        });
    
        this.selectedBinId = bin.id; 
        this.selectedBin = bin.bankCode; // Make sure this is correct
        console.log('Selected Bank ID:', this.selectedBin); // Log the selected bank ID
        this.isEditing = true; 
        this.isEditMode = true; // Indicate you are in editing mode
        this.scrollToForm();
    }
    updateBin(): void {
        if (this.accountForm.invalid) {
            this.errorMessage = 'Form is invalid'; // Provide immediate feedback if the form is invalid
            this.cdr.markForCheck(); // Trigger change detection
            return;
        }
    
        const tabBinRequest = this.accountForm.value;
    
        // Optionally disable the form to prevent multiple submissions
        this.accountForm.disable();
    
        this._binService.updateTabBin(this.selectedBinId, tabBinRequest).subscribe(
            (response) => {
                this.successMessageupdate = 'Bin updated successfully!';
                this.errorMessage = null;
    
                // Fetch updated data and reset state
                this.fetchBinsData();
                this.onCancel();
                this.cdr.markForCheck(); // Trigger change detection
    
                // Set success message timeout
                setTimeout(() => {
                    this.successMessageupdate = null;
                    this.cdr.markForCheck(); // Ensure change detection is triggered
                    // Optionally re-enable the form
                    this.accountForm.enable();
                }, 2000);
            },
            (error) => {
                console.error('Error updating Bin:', error); // Log error for debugging
                this.errorMessage = 'Error updating Bin'; // Provide a more informative error message
                this.cdr.markForCheck(); // Trigger change detection
    
                // Set error message timeout
                setTimeout(() => {
                    this.errorMessage = null;
                    this.cdr.markForCheck(); // Ensure change detection is triggered
                    // Optionally re-enable the form
                    this.accountForm.enable();
                }, 2000);
            }
        );
    }

    getBankName(bankId: string): string {
        console.log('Searching for Bank ID:', bankId); // Log the bank ID
        console.log('Available Banks:', this.banks); // Log all banks to see their IDs
        const bank = this.banks.find(b => b.bankCode === bankId); // Use bankCode for comparison
        console.log('Bank ID:', bankId, 'Found Bank:', bank); // Log the found bank
        return bank ? bank.name : 'Unknown Bank';
    }
    
    
    
    createBin(): void { 
        if (this.accountForm.invalid) {
            this.errorMessage = 'Please fill out all required fields.';
            return;
        }
    
        const tabBinRequest = this.accountForm.value;
        const bankId = tabBinRequest.bankId;
        const selectedBank = this.banks.find(bank => bank.id === bankId);
        const bankName = selectedBank ? selectedBank.name : 'Unknown Bank';
    
        const keyDataA = tabBinRequest.keyDataA;
        const keyDataB = tabBinRequest.keyDataB;
    
        const confirmation = this._fuseConfirmationService.open({
            title: 'Create Confirmation',
            message: `You are about to create a bin for: ${bankName}.\n` +
                      `Key A: ${keyDataA}\n` +
                      `Key B: ${keyDataB}\n` +
                      `Are you sure you want to confirm?`,
            icon: {
                show: true,
                name: 'add',
                color: 'primary'
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'Confirm',
                    color: 'primary'
                },
                cancel: {
                    show: true,
                    label: 'Cancel'
                }
            },
            dismissible: true
        });
    
        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._binService.createTabBin(tabBinRequest).subscribe(
                    (response) => {
                        this.successMessage = 'Bin created successfully!';
                        this.errorMessage = null;
                        this.fetchBinsData(); // Refresh list of bins
                        this.onCancel(); // Reset form
    
                        // Clear success message after 2 seconds
                        setTimeout(() => {
                            this.successMessage = null;
                            this.cdr.detectChanges(); // Directly detect changes
                        }, 2000);
                    },
                    (error) => {
                        this.errorMessage = error.message || 'Error occurred while creating Bin';
                        this.cdr.detectChanges();
    
                        // Clear error message after 2 seconds
                        setTimeout(() => {
                            this.errorMessage = null;
                            this.cdr.detectChanges();
                        }, 2000);
                    }
                );
            } else {
                console.log('Creation cancelled');
            }
        });
    }
    
    
    
    
    
    
    
    

    

    loadBanks(): void {
        this._bankService.getAllBanks().subscribe({
            next: (response) => {
                console.log('Fetched banks data:', response);
                if (response && response.banks && Array.isArray(response.banks)) {
                    this.banks = response.banks; 
                    console.log('Banks data:', this.banks); // Log the banks array to see its structure
                } else {
                    console.error('Invalid banks response format', response);
                }       
            },
            error: (error) => {
                console.error('Error fetching banks:', error);
            }
        });
    }
    
    
  onCancel(): void {
        this.accountForm.reset(); 
  
        this.isEditing = false;
        this.isEditMode = false

    }

    scrollToForm() {
        this.accountFormRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }
    filterByBankCode(selectedBankCode: string): void {
        console.log('Selected Bank Code:', selectedBankCode); // Log the selected bank code
        // If the "All" option is selected, reset to show all data
        if (selectedBankCode === 'all') {
            this.dataSource.data = this.bins;
        } else {
            // Otherwise, filter the data based on the selected bank code
            this.dataSource.data = this.bins.filter(item => item.bankName === selectedBankCode);
        }
    
        // Reset paginator to the first page after filtering
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    
        // Re-apply sorting after filtering
        this.dataSource.sort = this._sort;
    }
    

    showAlert(): void {
        this._fuseAlertService.show('myAlertName'); 
    }

    dismissAlert(): void {
        this._fuseAlertService.dismiss('myAlertName'); 
    }
    




onDelete(binId: string, binValue: string): void {
    console.log('Attempting to delete bin with ID:', binId);

    const confirmation = this._fuseConfirmationService.open({
        title: 'Delete Confirmation',
        message: `Are you sure you want to delete this bin: ${binValue}?`,
        icon: {
            show: true,
            name: 'delete',
            color: 'warn'
        },
        actions: {
            confirm: {
                show: true,
                label: 'Delete',
                color: 'warn'
            },
            cancel: {
                show: true,
                label: 'Cancel'
            }
        },
        dismissible: true
    });

    confirmation.afterClosed().subscribe((result) => {
        if (result === 'confirmed') {
            this._binService.deleteTabBin(binId).subscribe(
                (response) => {
                    console.log('TabBin deleted successfully', response);
                    this.successMessagedelete = 'Bin deleted successfully!';
                    this.errorMessage = null;

                    this.fetchBinsData(); 

                    // Clear success message after 2 seconds
                    setTimeout(() => {
                        this.successMessagedelete = null;
                        this.cdr.detectChanges(); // Ensure change detection
                    }, 2000);
                },
                (error) => {
                    console.error('Failed to delete Bin:', error);
                    this.errorMessage = 'Failed to delete Bin';
                    this.successMessagedelete = null;

                    // Clear error message after 2 seconds
                    setTimeout(() => {
                        this.errorMessage = null;
                        this.cdr.detectChanges(); // Ensure change detection
                    }, 2000);
                }
            );
        } else {
            console.log('Deletion cancelled');
        }
    });
}

    
    
    
}    