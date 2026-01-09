import {
    NgFor,
    NgIf,
    DatePipe,
    AsyncPipe
} from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subject, animationFrameScheduler, interval } from 'rxjs';
import { takeUntil, takeWhile } from 'rxjs/operators';
import { CardHolderLoadReport } from 'app/core/Model/file.model';
import { TabCardHolderService } from 'app/core/services/fileupload.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FuseAlertComponent, FuseAlertService } from '@fuse/components/alert';
import { HttpEvent, HttpEventType } from '@angular/common/http';

@Component({
    selector: 'file-manager-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        AsyncPipe,
        RouterOutlet,
        RouterLink,
        FuseAlertComponent,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatSidenavModule,
        MatProgressBarModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule
    ],
})
export class FileManagerListComponent implements OnInit, OnDestroy {

    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    drawerMode: 'side' | 'over';
    uploadProgress = 0;
    uploadStatus = 'Waiting...';
    isUploading = false;

    loadReports: CardHolderLoadReport[] = [];
    private _fuseAlertService = inject(FuseAlertService);

    dataSource = new MatTableDataSource<CardHolderLoadReport>();
    displayedColumns = ['fileName', 'loadDate', 'createdCount', 'updatedCount', 'status'];

    currentProcessingReport$ = this._fileuploadService.reportProgress$;
    currentProcessingReportId: number | null = null;

    errorMessage: string | null = null;
    successMessage: string | null = null;

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _fileuploadService: TabCardHolderService,
    ) {}

    ngOnInit(): void {
        this.getAllReports();

        // Auto-update progress bar in real time
        this.currentProcessingReport$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(progress => {
                if (progress) {
                    this.uploadProgress = progress.percentage;
                    this.uploadStatus = progress.isProcessing ? 'Processing...' : 'Completed ✔️';
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    ngAfterViewInit(): void {
        this.dataSource.paginator = this._paginator;
        this.dataSource.sort = this._sort;
        this._changeDetectorRef.markForCheck();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._fileuploadService.stopProgressPolling();
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
        this.dataSource.filter = filterValue;
        this.dataSource.paginator?.firstPage();
    }

    onFileSelected(event: any): void {
        const inputRef = event.target;
        const file: File = inputRef.files?.[0];
        if (!file) return;

        this.isUploading = true;
        this.uploadProgress = 0;
        this.uploadStatus = 'Starting...';
        this.successMessage = null;
        this.errorMessage = null;

        let backendProgress = 0;

        // Smooth animation
        interval(0, animationFrameScheduler)
            .pipe(
                takeWhile(() => this.isUploading),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                if (this.uploadProgress < backendProgress) {
                    this.uploadProgress++;
                    this.updateUploadStatus();
                    this._changeDetectorRef.markForCheck();
                }
            });

        // Upload
        this._fileuploadService.uploadFile(file)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (event: HttpEvent<any>) => {

                    if (event.type === HttpEventType.UploadProgress && event.total) {
                        backendProgress = Math.min(
                            Math.round((event.loaded * 100) / event.total), 95
                        );
                    }

                    if (event.type === HttpEventType.Response) {
                        const responseBody = event.body;
                        let reportId: number | null = null;

                        try {
                            reportId = responseBody?.reportId || null;
                        } catch {
                            reportId = null;
                        }

                        backendProgress = 100;

                        setTimeout(() => {
                            this.uploadProgress = 100;
                            this.uploadStatus = 'Upload completed ✔️';
                            this.isUploading = false;
                            this.successMessage = 'File uploaded successfully. Processing started...';

                            if (reportId) {
                                this.currentProcessingReportId = reportId;
                                this._fileuploadService.startProgressPolling(reportId);
                            }

                            this.getAllReports();
                            this._changeDetectorRef.markForCheck();

                            setTimeout(() => {
                                this.successMessage = null;
                                this._changeDetectorRef.markForCheck();
                            }, 4000);
                        }, 250);

                        inputRef.value = '';
                        return;
                    }
                },
                error: (err) => {
                    this.isUploading = false;
                    this.uploadProgress = 0;
                    this.uploadStatus = 'Upload failed ❌';
                    this.errorMessage = err.message || 'File upload failed.';
                    this._changeDetectorRef.markForCheck();

                    setTimeout(() => {
                        this.errorMessage = null;
                        this._changeDetectorRef.markForCheck();
                    }, 3500);
                }
            });
    }

    private updateUploadStatus(): void {
        const p = this.uploadProgress;
        if (p < 20) this.uploadStatus = 'Uploading file...';
        else if (p < 60) this.uploadStatus = 'Processing data...';
        else if (p < 90) this.uploadStatus = 'Validating records...';
        else if (p < 100) this.uploadStatus = 'Finalizing...';
    }

    getAllReports(): void {
        this._fileuploadService.getAllLoadReports()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(reports => {
                this.dataSource.data = reports.sort(
                    (a, b) => new Date(b.loadDate).getTime() - new Date(a.loadDate).getTime()
                );
                this._changeDetectorRef.markForCheck();
            });
    }

    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
