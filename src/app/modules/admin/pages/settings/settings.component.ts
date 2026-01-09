import { CommonModule, NgClass, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject, takeUntil } from 'rxjs';
import { SettingsAccountComponent } from './account/account.component';
import { SettingsNotificationsComponent } from './notifications/notifications.component';
import { SettingsPlanBillingComponent } from './plan-billing/plan-billing.component';
import { SettingsSecurityComponent } from './security/security.component';
import { SettingsTeamComponent } from './team/team.component';
import { UserService } from 'app/core/user/user.service'; // Import UserService
import { SettingsAccountAdminComponent } from './account-admin/settings-account-admin/settings-account-admin.component';
import { TeamAdminComponent } from './team-admin/team-admin/team-admin.component';
import { SecurityAdminComponent } from './security-admin/security-admin/security-admin.component';

@Component({
    selector       : 'settings',
    templateUrl    : './settings.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [MatSidenavModule, SecurityAdminComponent,MatButtonModule,TeamAdminComponent, MatIconModule,SettingsAccountAdminComponent, NgFor, NgClass, NgSwitch, NgSwitchCase, SettingsAccountComponent, SettingsSecurityComponent, SettingsPlanBillingComponent, SettingsNotificationsComponent, SettingsTeamComponent,CommonModule],
})
export class SettingsComponent implements OnInit, OnDestroy
{
    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    selectedPanel: string = 'account';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _userService: UserService // Inject UserService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
   
// Inside ngOnInit method
ngOnInit(): void {
    // Initialize with an empty array
    this.panels = [];

    // Subscribe to user$ observable to get user data including roles
    this._userService.user$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(user => {
            if (user && user.roles) {
                console.log('User roles in SettingsComponent:', user.roles);

                // Get the first role (assuming single role)
                const role = user.roles[0];
                console.log('First user role:', role);

                // Set up panels based on the role
                if (role === 'ROLE_SUPER_ADMIN') {
                    this.panels = [
                        {
                            id         : 'account',
                            icon       : 'heroicons_outline:user-circle',
                            title      : 'SuperAdmin Panel',
                            description: 'Manage Bank and Admin Owner',
                        },
                        {
                            id         : 'security',
                            icon       : 'heroicons_outline:lock-closed',
                            title      : 'SuperAdminSecurity',
                            description: 'Manage yours and Admins password',
                        },
                        {
                            id         : 'plan-billing',
                            icon       : 'heroicons_outline:credit-card',
                            title      : 'Bins',
                            description: 'Manage Bins',
                        },
                        {
                            id         : 'team',
                            icon       : 'heroicons_outline:user-group',
                            title      : 'SuperAdminTeam',
                            description: 'Manage your existing team and change status',
                        },
                    ];
                    this.selectedPanel = 'account'; // or set to another default if necessary
                } else if (role === 'ROLE_ADMIN') {
                    this.panels = [
                        {
                            id         : 'agency',
                            icon       : 'heroicons_outline:user-circle',
                            title      : 'Admin Panel',
                            description: 'Manage your account and details',
                        },
                        {
                            id         : 'securityadmin',
                            icon       : 'heroicons_outline:lock-closed',
                            title      : 'AdminSecurity',
                            description: 'Manage your password and security settings',
                        },
                        {
                            id         : 'adminteam',
                            icon       : 'heroicons_outline:user-group',
                            title      : 'AdminTeam',
                            description: 'Manage your existing team and change status',
                        },
                    ];
                    this.selectedPanel = 'agency'; // Set default panel for admin
                } else if (role === 'ROLE_USER') {
                    this.panels = [
                        {
                            id         : 'account',
                            icon       : 'heroicons_outline:user-circle',
                            title      : 'User Account',
                            description: 'View and update your account details',
                        },
                    ];
                    this.selectedPanel = 'account'; // Set default panel for user
                }

                // Trigger change detection since we're inside a subscription
                this._changeDetectorRef.markForCheck();
            } else {
                console.error('User or roles are undefined.');
            }
        });

    // Subscribe to media changes (existing code)
    this._fuseMediaWatcherService.onMediaChange$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(({matchingAliases}) =>
        {
            // Set the drawerMode and drawerOpened
            if ( matchingAliases.includes('lg') )
            {
                this.drawerMode = 'side';
                this.drawerOpened = true;
            }
            else
            {
                this.drawerMode = 'over';
                this.drawerOpened = false;
            }

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
}


        // Subscribe to media changes (existing code)


    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
 
    
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Navigate to the panel
     *
     * @param panel
     */
    goToPanel(panel: string): void {
        this.selectedPanel = panel;
        console.log('Selected panel:', this.selectedPanel); // Debugging
        if (this.drawerMode === 'over') {
            this.drawer.close();
        }
    }
    

    /**
     * Get the details of the panel
     *
     * @param id
     */
    getPanelInfo(id: string): any
    {
        return this.panels.find(panel => panel.id === id);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
