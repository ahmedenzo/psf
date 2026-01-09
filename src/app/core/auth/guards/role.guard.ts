import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from 'app/core/user/user.service'; // Assuming UserService is where user$ is defined
import { of, switchMap } from 'rxjs';

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const router: Router = inject(Router);
  const userService: UserService = inject(UserService); // Inject the user service

  return userService.user$.pipe(
    switchMap((user) => {
      if (!user || !user.roles || user.roles.length === 0) {
        // If no user or no roles, redirect to the sign-in page
        const redirectURL = state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
        const urlTree = router.parseUrl(`sign-in?${redirectURL}`);
        return of(urlTree);
      }

      // Get the user's roles from user.roles
      const userRoles = user.roles;
      const requiredRoles = route.data['roles'] as Array<string>;

      // Check if the user has any of the required roles
      if (requiredRoles.some(role => userRoles.includes(role))) {
        return of(true);
      } else {
        // Redirect to 404 error if unauthorized
        return of(router.parseUrl('/error/404'));
      }
    })
  );
};
