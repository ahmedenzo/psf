import { Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { defaultNavigation, compactNavigation, futuristicNavigation, horizontalNavigation } from 'app/mock-api/common/navigation/data';
import { cloneDeep } from 'lodash-es';
import { UserService } from 'app/core/user/user.service'; // Import UserService

@Injectable({ providedIn: 'root' })
export class NavigationMockApi {
    private readonly _compactNavigation: FuseNavigationItem[] = compactNavigation;
    private readonly _defaultNavigation: FuseNavigationItem[] = defaultNavigation;
    private readonly _futuristicNavigation: FuseNavigationItem[] = futuristicNavigation;
    private readonly _horizontalNavigation: FuseNavigationItem[] = horizontalNavigation;

    constructor(
        private _fuseMockApiService: FuseMockApiService,
        private _userService: UserService  // Inject UserService
    ) {
        // Register Mock API handlers
        this.registerHandlers();
    }

    registerHandlers(): void {
        this._fuseMockApiService.onGet('api/common/navigation').reply(() => {
            // Get user roles from the UserService
            const roles = this._userService.getRoles();
            const isSuperAdmin = roles?.includes('ROLE_SUPER_ADMIN');
            const isAdmin = roles?.includes('ROLE_ADMIN');
            const isuser = roles?.includes('ROLE_USER');

            // Clone the navigation arrays to avoid mutating the original data
            const compactNav = cloneDeep(this._compactNavigation);
            const defaultNav = cloneDeep(this._defaultNavigation);
            const futuristicNav = cloneDeep(this._futuristicNavigation);
            const horizontalNav = cloneDeep(this._horizontalNavigation);

            // Filter or modify navigation based on user roles
            if (!isSuperAdmin) {
                // Remove "File Manager" or any other restricted items for non-Super Admins
                this.removeNavigationItem(defaultNav, 'pages.file-manager');

            }
        if (!isuser) {
                // Remove "File Manager" or any other restricted items for non-Super Admins
                this.removeNavigationItem(defaultNav, 'pages.authentication');
                this.removeNavigationItem(defaultNav, 'documentation.changelog');
                this.removeNavigationItem(defaultNav, 'documentation');
            }
            if (!isAdmin && !isSuperAdmin ) {
          
                this.removeNavigationItem(defaultNav, 'pages.billing');
                this.removeNavigationItem(defaultNav, 'pages.settings');
                
            }
            if (!isAdmin ) {
                // Remove "File Manager" or any other restricted items for non-Super Admins
                this.removeNavigationItem(defaultNav, 'apps.help-center');
                this.removeNavigationItem(defaultNav, 'apps.help-center.guides');
                this.removeNavigationItem(defaultNav, 'apps.help-center.support');
                this.removeNavigationItem(defaultNav, 'pages.cardmangement');
            }

            // Return the navigation
            return [200, {
                compact: compactNav,
                default: defaultNav,
                futuristic: futuristicNav,
                horizontal: horizontalNav,
            }];
        });
    }

    /**
     * Utility function to remove navigation item by ID
     */
    private removeNavigationItem(navigation: FuseNavigationItem[], id: string): void {
        navigation.forEach((item, index) => {
            if (item.id === id) {
                navigation.splice(index, 1);
            }
            if (item.children) {
                this.removeNavigationItem(item.children, id);
            }
        });
    }
}