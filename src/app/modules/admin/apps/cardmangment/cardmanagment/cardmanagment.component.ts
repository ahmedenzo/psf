import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs/operators';
import { EditcardmanagmentComponent } from '../editcardmanagment/editcardmanagment.component';
import { CardmangserviceService } from '../cardmangservice.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';

interface CardItem {
  identification: string;
  clientNumber: string;
  cardHolderName: string;
  phoneNumber: string;
  cardNumber: string;
  bankName: string;
  finalDate?: string;
}

interface Filters {
  cinPassport: string;
  phoneNumber: string;
  cardNumber: string;
  bankName: string;
}

@Component({
  selector: 'app-cardmanagment',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    MatSortModule,
    MatTooltipModule
  ],
  templateUrl: './cardmanagment.component.html',
  styleUrls: ['./cardmanagment.component.scss']
})
export class CardmanagmentComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['bankName', 'cardHolderName', 'cardNumber', 'identification', 'phoneNumber', 'actions'];
  dataSource = new MatTableDataSource<CardItem>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filters: Filters = { cinPassport: '', phoneNumber: '', cardNumber: '', bankName: '' };
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;
  searchTriggered = false;

  cardNumberError: string | null = null;

  constructor(
    public dialog: MatDialog,
    private cardService: CardmangserviceService,
    private _fuseConfirmationService: FuseConfirmationService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /** 🔢 dynamic phone length */
  get phoneLength(): number {
    return (this.filters.phoneNumber || '').length;
  }

  private isValidCardNumber(card: string): boolean {
    return /^[4-5]\d{15}$/.test(card);
  }

  private loadCards(): void {
    this.loading = true;

    if (!this.filters.cardNumber && !this.filters.cinPassport && !this.filters.phoneNumber) {
      setTimeout(() => (this.loading = false), 300);
      this.dataSource.data = [];
      this.totalItems = 0;
      return;
    }

    this.cardService
      .searchCards({
        panClear: this.filters.cardNumber || undefined,
        nationalId: this.filters.cinPassport || undefined,
        gsm: this.filters.phoneNumber || undefined,
        page: this.pageIndex,
        size: this.pageSize
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          const content = res?.content || [];
          this.dataSource.data = content.map((c: any) => ({
            identification: c.nationalId,
            clientNumber: c.clientNumber,
            cardHolderName: c.name,
            phoneNumber: c.gsm,
            cardNumber: c.panClear,
            bankName: this.mapBankName(c.bankCode),
            finalDate: c.finalDate
          }));

          this.totalItems = res.numberOfElements ?? content.length;
        },
        error: () => {
          this.dataSource.data = [];
          this.totalItems = 0;
        }
      });
  }

  private mapBankName(code?: string): string {
    const map: Record<string, string> = {
      '00150': 'BCT', '00101': 'ATB', '00103': 'BNA', '00104': 'ABT',
      '00105': 'BT', '00107': 'Amen B', '00108': 'BIAT', '00110': 'STB',
      '00111': 'UBCI', '00112': 'UIB', '00114': 'BH', '00117': 'ONP',
      '00120': 'BTK', '00121': 'TSB', '00123': 'QNB', '00124': 'BTE',
      '00125': 'ZITOUNA BANK', '00126': 'BTL', '00127': 'BTS',
      '00128': 'ABC', '00132': 'ALBARAKA', '00133': 'NAIB',
      '00147': 'WIFAK BANK', '00173': 'TIB'
    };
    return map[code ?? ''] || 'Unknown';
  }

  clearFilters(): void {
    this.filters = { cinPassport: '', phoneNumber: '', cardNumber: '', bankName: '' };
    this.pageIndex = 0;
    this.dataSource.data = [];
    this.totalItems = 0;
    this.searchTriggered = false;
    this.cardNumberError = '';
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCards();
  }

  editItem(item: CardItem): void {
    const dialogRef = this.dialog.open(EditcardmanagmentComponent, {
      width: '500px',
      data: { item: { ...item } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;

        const updatePayload = {
          nationalId: result.identification,
          gsm: result.phoneNumber
        };

        this.cardService.updateCardHolder(item.clientNumber, updatePayload)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: () => {
              this._fuseConfirmationService.open({
                title: 'Card Updated',
                message: 'Your card information has been updated successfully.',
                icon: { show: true, name: 'heroicons_outline:check-circle', color: 'success' },
                actions: { confirm: { show: true, label: 'OK', color: 'primary' } },
                dismissible: true
              });

              this.clearFilters();
            },
            error: () => {
              this._fuseConfirmationService.open({
                title: 'Save Failed',
                message: 'An error occurred while saving your card.',
                icon: { show: true, name: 'heroicons_outline:x-circle', color: 'warn' },
                actions: { confirm: { show: true, label: 'OK', color: 'primary' } },
                dismissible: true
              });
            }
          });
      }
    });
  }

  /** VALIDATION 11–13 digits */
  applyFilters(): void {
    this.cardNumberError = '';

    if (this.filters.cardNumber && !this.isValidCardNumber(this.filters.cardNumber)) {
      this.cardNumberError = 'Invalid card — must start with 4 or 5 and contain 16 digits.';
      return;
    }

    if (this.filters.cinPassport && this.filters.cinPassport.trim().length < 6) {
      this.cardNumberError = 'Invalid CIN / Passport — must be at least 6 characters.';
      return;
    }

    if (this.filters.phoneNumber && !/^[0-9]{11,13}$/.test(this.filters.phoneNumber)) {
      this.cardNumberError = 'Invalid Phone Number — must contain 11 to 13 digits.';
      return;
    }

    this.pageIndex = 0;
    this.searchTriggered = true;
    this.loadCards();
  }
}
