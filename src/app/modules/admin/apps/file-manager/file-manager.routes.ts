import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes } from '@angular/router';
import { TabCardHolderService } from 'app/core/services/fileupload.service';
import { FileManagerDetailsComponent } from 'app/modules/admin/apps/file-manager/details/details.component';
import { FileManagerComponent } from 'app/modules/admin/apps/file-manager/file-manager.component';
import { FileManagerListComponent } from 'app/modules/admin/apps/file-manager/list/list.component';
import { catchError, throwError } from 'rxjs';

/**
 * Item resolver
 *
 * @param route
 * @param state
 */
const itemResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const fileManagerService = inject(TabCardHolderService);
    const router = inject(Router);

    // Get the 'id' from the route parameters and pass it to the service
    const id = route.paramMap.get('id');

    return fileManagerService.getLoadReportById(id!).pipe(
        catchError((error) => {
            console.error(error);

            // Navigate back to parent URL if the item is not available
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            router.navigateByUrl(parentUrl);

            // Throw the error
            return throwError(error);
        })
    );
};

/**
 * Can deactivate file manager details
 *
 * @param component
 * @param currentRoute
 * @param currentState
 * @param nextState
 */
const canDeactivateFileManagerDetails = (
    component: FileManagerDetailsComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
) => {
    let nextRoute: ActivatedRouteSnapshot = nextState.root;
    while (nextRoute.firstChild) {
        nextRoute = nextRoute.firstChild;
    }

    // If navigating to another item in the file manager...
    if (nextState.url.includes('/details')) {
        return true;
    }

    // Close the drawer before navigating away
    return component.closeDrawer().then(() => true);
};

export default [
    {
        path: '',
        component: FileManagerComponent,
        children: [
            {
                path: '',
                component: FileManagerListComponent,
                resolve: {
                    items: () => inject(TabCardHolderService).getAllLoadReports(), // Corrected method call to get all load reports
                },
                children: [
                    {
                        path: 'details/:id',
                        component: FileManagerDetailsComponent,
                        resolve: {
                            item: itemResolver, // Correctly resolving the item by 'id'
                        },
                        canDeactivate: [canDeactivateFileManagerDetails],
                    },
                ],
            },
        ],
    },
] as Routes;
