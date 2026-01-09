import { NgFor, NgIf, TitleCasePipe } from '@angular/common'; 
import { FormsModule } from '@angular/forms';

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  inject
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { BankServiceService } from 'app/core/services/bank-service.service';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'settings-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,              // ⬅️ obligatoire pour [(ngModel)]
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    NgFor,
    NgIf,
    MatSelectModule,
    MatOptionModule,
    TitleCasePipe,
    MatSlideToggleModule,
    MatPaginatorModule
  ]
})
export class SettingsTeamComponent implements OnInit, AfterViewInit, OnDestroy {
  private _bankService = inject(BankServiceService);
  private _auth = inject(AuthService);
  private destroy$ = new Subject<void>();

  // Raw and filtered lists
  admins: any[] = [];
  filteredAdmins: any[] = [];
  searchTerm = '';
  // Select list of unique bank names
  banks: string[] = [];
  selectedBank: string = 'All';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // paginator defaults
  pageSizeOptions = [5, 10, 25,50] as const;
  defaultPageSize = 5;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getAdmins();
  }

  ngAfterViewInit(): void {
    // ensure paginator has default values
    if (this.paginator) {
      this.paginator.pageSize = this.defaultPageSize;
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByFn(index: number, item: any): any {
    return item?.id ?? index;
  }

  getAdmins(): void {
    this._bankService.GetAdmins()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const items = Array.isArray(response) ? response : [];
          this.admins = items.map((admin) => ({
            ...admin,
            bankName: admin.bankName || 'No bank Assigned'
          }));
          // build unique bank list
          const uniq = new Set(this.admins.map(a => a.bankName));
          this.banks = ['All', ...Array.from(uniq).sort()];
          // init filtered
          this.selectedBank = 'All';
          this.applyBankFilter(this.selectedBank, false);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching admins:', error);
        }
      });
  }

  // Toggle active/inactive with optimistic UI and rollback on error
  toggleActive(member: any): void {
    const originalStatus = !!member.status;
    const newStatus = !originalStatus;
    member.status = newStatus;
    this.cdr.detectChanges();

    this._auth.deactivateUser(member.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // success
        },
        error: (error) => {
          console.error(`Error updating status for user ${member.username}:`, error);
          member.status = originalStatus;
          this.cdr.detectChanges();
        }
      });
  }

  // Apply bank filter. reset paginator to first page.
  applyBankFilter(bank: string, resetPage = true): void {
    this.selectedBank = bank;
    if (!bank || bank === 'All') {
      this.filteredAdmins = [...this.admins];
    } else {
      const key = bank.toString().toLowerCase();
      this.filteredAdmins = this.admins.filter(a => (a.bankName || '').toLowerCase() === key);
    }
    if (this.paginator && resetPage) {
      this.paginator.firstPage();
    }
    this.cdr.detectChanges();
  }

  // Page slice getter used by template ngFor
  get pagedAdmins(): any[] {
    const data = this.filteredAdmins || [];
    if (!this.paginator) {
      return data.slice(0, this.defaultPageSize);
    }
    const pageIndex = this.paginator.pageIndex ?? 0;
    const pageSize = this.paginator.pageSize ?? this.defaultPageSize;
    const start = pageIndex * pageSize;
    return data.slice(start, start + pageSize);
  }
  applyFilters(resetPage = true): void {
    const bank = this.selectedBank;
    const term = this.searchTerm.toLowerCase();

    this.filteredAdmins = this.admins.filter(a => {
      const bankMatch = !bank || bank === 'All' || (a.bankName || '').toLowerCase() === bank.toLowerCase();
      const nameMatch = !term || (a.username || '').toLowerCase().includes(term);
      return bankMatch && nameMatch;
    });

    if (this.paginator && resetPage) {
      this.paginator.firstPage();
    }
    this.cdr.detectChanges();
  }
  // mat-paginator event handler
  onPageChange(event: PageEvent): void {
    // no server-side call here; just redraw slice
    this.cdr.detectChanges();
  }
}
