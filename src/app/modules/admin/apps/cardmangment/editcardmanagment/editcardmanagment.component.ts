import { Component, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, NgForm } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FuseConfirmationService } from '@fuse/services/confirmation';

interface CardItem {
  cardHolderName: string;
  phoneNumber: string;
  identification?: string;
  cardNumber: string;
  bankName: string;
  clientNumber?: string;
  finalDate?: string;
}

@Component({
  selector: 'app-editcardmanagment',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './editcardmanagment.component.html',
  styleUrls: ['./editcardmanagment.component.scss']
})
export class EditcardmanagmentComponent {
  @ViewChild('editForm') editForm!: NgForm;

  cardType: 'visa' | 'mastercard' | 'unknown' = 'unknown';

  // Dynamic validation states  
  isPhoneValid = true;
  isCINValid = true;

  constructor(
    public dialogRef: MatDialogRef<EditcardmanagmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: CardItem },
    private _fuseConfirmationService: FuseConfirmationService
  ) {
    this.detectCardType();
    this.validatePhone();
    this.validateCIN();
  }

  /* ---------------------
     Card Type Detection
  --------------------- */
  private detectCardType(): void {
    const number = this.data?.item?.cardNumber || '';
    if (number.startsWith('4')) this.cardType = 'visa';
    else if (number.startsWith('5')) this.cardType = 'mastercard';
    else this.cardType = 'unknown';
  }

  /* ----------------------
     Format Final Date
  ---------------------- */
  formatFinalDate(finalDate?: string): string {
    if (!finalDate || finalDate.length !== 4) return 'N/A';
    return finalDate.substring(0, 2) + '/' + finalDate.substring(2, 4);
  }

  /* ----------------------
     Phone Validation
  ---------------------- */
  get phoneLength(): number {
    return (this.data.item.phoneNumber || '').length;
  }

  validatePhone() {
    const phone = this.data.item.phoneNumber || '';
    this.isPhoneValid = /^[0-9]{11,13}$/.test(phone);
  }

  /* ----------------------
     CIN / Passport Validation
     ICAO Standard: 6–12 alphanumeric
  ---------------------- */
  get cinLength(): number {
    return (this.data.item.identification || '').length;
  }

  validateCIN() {
    const id = this.data.item.identification || '';
    this.isCINValid = /^[A-Za-z0-9]{6,12}$/.test(id);
  }

  /* ----------------------
            Save
  ---------------------- */
  save(): void {
    if (!this.isPhoneValid || !this.isCINValid) {
      this.showError('Invalid Fields', 'Please fix the validation errors.');
      return;
    }

    const { phoneNumber, identification } = this.data.item;

    this.dialogRef.close({ identification, phoneNumber });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  /* ----------------------
         Alert Wrapper
  ---------------------- */
  private showError(title: string, message: string): void {
    this._fuseConfirmationService.open({
      title,
      message,
      icon: { show: true, name: 'heroicons_outline:x-circle', color: 'warn' },
      actions: { confirm: { show: true, label: 'OK', color: 'primary' }, cancel: { show: false } },
      dismissible: true
    });
  }
}
