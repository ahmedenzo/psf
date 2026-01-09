import { NgIf } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FuseFullscreenComponent } from '@fuse/components/fullscreen';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { MessagesComponent } from 'app/layout/common/messages/messages.component';
import { NotificationsComponent } from 'app/layout/common/notifications/notifications.component';
import { QuickChatComponent } from 'app/layout/common/quick-chat/quick-chat.component';
import { SearchComponent } from 'app/layout/common/search/search.component';
import { ShortcutsComponent } from 'app/layout/common/shortcuts/shortcuts.component';
import { UserComponent } from 'app/layout/common/user/user.component';
import { Subject, takeUntil } from 'rxjs';

import { Subscription } from 'rxjs';
@Component({
    selector     : 'classy-layout',
    templateUrl  : './classy.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [
        FuseLoadingBarComponent,
        FuseVerticalNavigationComponent,
        NotificationsComponent,
        UserComponent,
        NgIf,
        MatIconModule,
        MatButtonModule,
        LanguagesComponent,
        FuseFullscreenComponent,
        SearchComponent,
        ShortcutsComponent,
        MessagesComponent,
        RouterOutlet,
        QuickChatComponent
    ],
})
export class ClassyLayoutComponent implements OnInit, OnDestroy
{
 
    isScreenSmall: boolean;
    navigation: Navigation;
    
    agencyName : any;
    agencyCode : any;
    role: string[] = [];
    id: string | null = null; // Store the user ID
    private subscriptions: Subscription = new Subscription();
    user: User;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    admins : any [] =[]
    bankName: string | null = null; 
    bankLogo: string | null = null;  

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number
    {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {

        this.subscriptions.add(
            this._userService.user$.subscribe(user => {
              if (user && user.roles) {
                console.log('User roles in ProjectComponent:', user.roles);
                this.role = user.roles;
                this.id = user.id; // Get the user ID
      
                // Check user role and fetch user details if Admin
                if (this.role.includes('ROLE_ADMIN') || this.role.includes('ROLE_USER')) {
                  this.fetchUserById(this.id); 
              }
          
              }
            })
          );
      
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) =>
            {
                this.navigation = navigation;
            });

        // Subscribe to the user service
  

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });
    }
    private fetchUserById(userId: string | null): void {
        if (userId) {
            this.subscriptions.add(
                this._userService.getUserById(userId).subscribe(
                    (user: User) => {
                        console.log('User details:', user);
                        if (this.role.includes('ROLE_ADMIN')) {
                            // Fetch and set bank details for Admin
                            this.bankName = user.bank?.name || null;
                            this.bankLogo = user.bank?.logoContent || null;  // Set logoContent for bankLogo
                        }
                        if (this.role.includes('ROLE_USER')) {
                            // Fetch and set agency details for User
                            this.bankName = user.bank?.name || null; 
                            this.agencyName = user.agency?.name || null;
                            this.agencyCode = user.agency?.agencyCode || null;
                            this.bankLogo = user.bank?.logoContent || null;  // Set logoContent for bankLogo
                            console.log('Agency details:', this.agencyName, this.agencyCode);
                        }
                    },
                    (error) => {
                        console.error('Error fetching user by ID:', error);
                    }
                )
            );
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

    
 
    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

}
