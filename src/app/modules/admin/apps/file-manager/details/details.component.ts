import { NgIf, DatePipe } from '@angular/common'; // Import DatePipe
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Item } from 'app/modules/admin/apps/file-manager/file-manager.types';
import { FileManagerListComponent } from 'app/modules/admin/apps/file-manager/list/list.component';
import { Subject, takeUntil } from 'rxjs';
import { TabCardHolderService } from 'app/core/services/fileupload.service';
import { CommonModule } from '@angular/common';
import { MatDrawerToggleResult } from '@angular/material/sidenav';

@Component({
    selector: 'file-manager-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatButtonModule, RouterLink, MatIconModule, NgIf, DatePipe, CommonModule], // Add DatePipe here
})
export class FileManagerDetailsComponent implements OnInit, OnDestroy {
    item: Item | null = null; // Holds the selected item
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fileManagerListComponent: FileManagerListComponent,
        private _fileManagerService: TabCardHolderService // Injecting TabCardHolderService
    ) {}

    ngOnInit(): void {
        // Open the drawer
        if (this._fileManagerListComponent.matDrawer) {
            this._fileManagerListComponent.matDrawer.open();
        }

        // Subscribe to the current item observable
        this._fileManagerService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: Item | null) => {
                if (item) {
                    // Open the drawer if it's closed
                    if (this._fileManagerListComponent.matDrawer) {
                        this._fileManagerListComponent.matDrawer.open();
                    }

                    // Assign the fetched item
                    this.item = item;

                    // Trigger UI update
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    // Extract the BIN from the card number (first 6 or 8 digits depending on card length)
    getBinNumber(cardNumber: string): string {
        const trimmedCardNumber = cardNumber.trim();
        // Return the first 6 digits for 16-digit cards and the first 8 digits for 19-digit cards
        if (trimmedCardNumber.length === 16) {
            return trimmedCardNumber.substring(0, 6);
        } else if (trimmedCardNumber.length === 19) {
            return trimmedCardNumber.substring(0, 8);
        }
        return 'Unknown BIN'; // Handle unexpected cases
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._fileManagerListComponent.matDrawer.close();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
