import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseAlertComponent } from '@fuse/components/alert';
import { BillingService } from './billing.service';
import { firstValueFrom } from 'rxjs';

interface BillingFile {
  id: string;
  name: string;
  date: Date;
}

interface ParsedLine {
  PinOperationType: string;
  PAN: string;
  PHONE: string;
  BRANCH: string;
  SENT_AT: string;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSidenavModule,
    MatProgressBarModule,
    MatTooltipModule,
    FuseAlertComponent,
  ],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
})
export class BillingComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatDrawer;

  displayedColumns: string[] = ['name', 'date', 'action'];
  dataSource = new MatTableDataSource<BillingFile>([]);
  files: BillingFile[] = [];
  selectedFileMeta: { date?: string; bank?: string } | null = null;
  filterDate: Date | null = null;
  isDownloading = false;
  downloadProgress = 0;
  successMessage = '';
  errorMessage = '';
  drawerMode: 'over' | 'side' = 'over';
  drawerOpened = false;
  pageIndex = 0;
  pageSize = 10;
  selectedFile: BillingFile | null = null;
  parsedRows: ParsedLine[] = [];
  filteredParsedRows: ParsedLine[] = [];
  drawerSearchText = '';

  constructor(private billingService: BillingService) {}

  ngOnInit() {
    // send double size to backend
    this.loadFiles(this.pageIndex, this.pageSize * 2);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadFiles(page: number = 0, size: number = 10) {
    this.billingService.listFiles(page, size).subscribe({
      next: (res) => {
        // parse all returned files (txt + csv)
        const allFiles = res.content.map((fullName: string, idx: number) => {
          const clean = fullName.replace(/\\/g, '/');
          const name = clean.split('/').pop()!;
          const dateMatch = name.match(/\d{4}-\d{2}-\d{2}/)?.[0];
          return {
            id: String(idx),
            name,
            date: dateMatch ? new Date(dateMatch + 'T00:00:00') : new Date(),
          } as BillingFile;
        });

        this.files = allFiles;

        // keep only .txt to display
        const txtOnly = allFiles.filter(f => f.name.endsWith(".txt"));

        // show exactly "pageSize" items
        const visible = txtOnly.slice(0, this.pageSize);

        this.dataSource.data = visible;

        // paginator based only on txt count
        this.paginator.length = txtOnly.length;
        this.paginator.pageIndex = page;
      },
      error: () => this.showError('❌ Failed to load billing files.'),
    });
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    // ALWAYS send double to backend
    const backendSize = this.pageSize * 2;

    this.loadFiles(this.pageIndex, backendSize);
  }

  applyFilter() {
    if (!this.filterDate) {
      this.loadFiles(this.pageIndex, this.pageSize * 2);
    } else {
      const selected = new Date(this.filterDate);
      selected.setHours(0, 0, 0, 0);
      this.dataSource.data = this.files.filter((f) => {
        const fileDate = new Date(f.date);
        fileDate.setHours(0, 0, 0, 0);
        return fileDate.getTime() === selected.getTime();
      });
    }
  }

  resetFilter() {
    this.filterDate = null;
    this.loadFiles(this.pageIndex, this.pageSize * 2);
    this.showSuccess('Filtre réinitialisé');
  }

  async downloadFile(file: BillingFile) {
    this.isDownloading = true;
    this.downloadProgress = 0;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const baseName = file.name.split('.')[0];

      const relatedFiles = this.files.filter(f =>
        f.name.startsWith(baseName) &&
        (f.name.endsWith('.txt') || f.name.endsWith('.csv'))
      );

      for (const f of relatedFiles) {
        const safeFilename = encodeURIComponent(f.name);
        const blob = await firstValueFrom(this.billingService.downloadFile(safeFilename));
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = f.name;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      const interval = setInterval(() => {
        this.downloadProgress += 20;
        if (this.downloadProgress >= 100) {
          clearInterval(interval);
          this.isDownloading = false;
          this.downloadProgress = 0;
          this.showSuccess('Download .txt + .csv completed');
        }
      }, 200);
    } catch {
      this.isDownloading = false;
      this.downloadProgress = 0;
      this.showError('❌ Download failed');
    }
  }

  async openDetails(file: BillingFile) {
    this.selectedFile = file;
    this.drawerOpened = true;
    this.drawerSearchText = '';
    this.parsedRows = [];
    this.filteredParsedRows = [];

    if (!file.name.endsWith('.txt')) return;

    try {
      const safeFilename = encodeURIComponent(file.name);
      const blob = await firstValueFrom(this.billingService.downloadFile(safeFilename));
      const text = await blob.text();
      this.parsedRows = this.parseTxtFile(text);
      this.filteredParsedRows = [...this.parsedRows];
    } catch (err) {
      this.showError('❌ Failed to load file content.');
    }
  }

  parseTxtFile(content: string): ParsedLine[] {
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

    const meta: any = {};
    const dateLine = lines.find(l => l.startsWith('DATE:'));
    const bankLine = lines.find(l => l.startsWith('BANK:'));

    if (dateLine) meta.date = dateLine.replace('DATE:', '').trim();
    if (bankLine) meta.bank = bankLine.replace('BANK:', '').trim();

    this.selectedFileMeta = meta;

    const dataLines = lines.filter(l =>
      /^[A-Za-z0-9]/.test(l) &&
      !l.includes('BANK') &&
      !l.includes('DATE')
    );

    return dataLines.map(line => {
      const parts = line.split(/\s{2,}/);
      return {
        PinOperationType: parts[0] || '',
        PAN: parts[1] || '',
        PHONE: parts[2] || '',
        BRANCH: parts[3] || '',
        SENT_AT: parts[4] || '',
      };
    });
  }

  applyDrawerFilter() {
    const filterValue = this.drawerSearchText.toLowerCase().trim();
    this.filteredParsedRows = this.parsedRows.filter(row =>
      row.PAN.toLowerCase().includes(filterValue) ||
      row.PHONE.toLowerCase().includes(filterValue) ||
      row.BRANCH.toLowerCase().includes(filterValue) ||
      row.PinOperationType.toLowerCase().includes(filterValue) ||
      row.SENT_AT.toLowerCase().includes(filterValue)
    );
  }

  clearDrawerSearch() {
    this.drawerSearchText = '';
    this.applyDrawerFilter();
  }

  closeDrawer() {
    this.drawerOpened = false;
    this.parsedRows = [];
    this.filteredParsedRows = [];
    this.selectedFile = null;
    this.drawerSearchText = '';
  }

  showSuccess(msg: string) {
    this.successMessage = msg;
    setTimeout(() => (this.successMessage = ''), 3000);
  }

  showError(msg: string) {
    this.errorMessage = msg;
    setTimeout(() => (this.errorMessage = ''), 5000);
  }
}
