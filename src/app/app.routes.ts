import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { RoleGuard } from './core/auth/guards/role.guard';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    {path: '', pathMatch : 'full', redirectTo: 'dashboards/project'},

   
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'dashboards/project'},

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes')},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes')},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes')},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
           
        
        ]
    },
    // Auth routes for authenticated users
{
  path: '',
  canActivate: [AuthGuard],
  canActivateChild: [AuthGuard],
  component: LayoutComponent,
  data: { layout: 'empty' },
  children: [
    {
      path: 'unlock',
      loadChildren: () =>
        import('app/modules/auth/unlock-session/unlock-session.routes')
    }
  ]
},



    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
         
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},
        ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [

            // Dashboards
            {path: 'dashboards', children: [
                {path: 'project', loadChildren: () => import('app/modules/admin/dashboards/project/project.routes')},
                {path: 'analytics', loadChildren: () => import('app/modules/admin/dashboards/analytics/analytics.routes')},
                {path: 'finance', loadChildren: () => import('app/modules/admin/dashboards/finance/finance.routes')},
               {path: 'crypto', loadChildren: () => import('app/modules/admin/dashboards/crypto/crypto.routes')},
            ]},

            // Apps
// Apps (restricted to ROLE_ADMIN and ROLE_USER)
{
  path: 'apps',
  canActivate: [RoleGuard],
  data: {
      roles: ['ROLE_ADMIN', 'ROLE_USER']  // Allow both admin and user
  },
  children: [
      // Help Center
      {
          path: 'help-center',
          loadChildren: () => import('app/modules/admin/apps/help-center/help-center.routes')
      },
   
  ]
},

     
            {path: 'pages', children: [

        
                           {
                path: 'authentication',
                loadChildren: () => import('app/modules/admin/pages/authentication/authentication.routes'),
                canActivate: [RoleGuard],
                data: {
                    roles: ['ROLE_USER'] // Allow only ROLE_USER
                }
            },


                {path: 'error', children: [
                  {path: '404', loadChildren: () => import('app/modules/admin/pages/error/error-404/error-404.routes')},
                 //   {path: '500', loadChildren: () => import('app/modules/admin/pages/error/error-500/error-500.routes')}
                ]},

    
                {
                  path: 'profile',
                  loadChildren: () => import('app/modules/admin/pages/profile/profile.routes'),
                  canActivate: [RoleGuard],
                  data: {
                      roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN']  // Allow both super admin and admin
                  }
              },
              
              // Settings (restricted to ROLE_SUPER_ADMIN and ROLE_ADMIN)
              {
                  path: 'settings',
                  loadChildren: () => import('app/modules/admin/pages/settings/settings.routes'),
                  canActivate: [RoleGuard],
                  data: {
                      roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN']  // Allow both super admin and admin
                  }
              },
                {
                  path: 'file-manager',
                  loadChildren: () => import('app/modules/admin/apps/file-manager/file-manager.routes'),
                  canActivate: [RoleGuard],  // Add RoleGuard
                  data: {
                      roles: ['ROLE_SUPER_ADMIN']  // Restrict to super admin
                  }
              }, 
                        {
                  path: 'cardmangement',
                  loadChildren: () => import('app/modules/admin/apps/cardmangment/cardmanagment/cardmanahment.routes'),
                  canActivate: [RoleGuard],  // Add RoleGuard
                  data: {
                      roles: ['ROLE_ADMIN']  // Restrict to super admin
                  }
              }, 
                            {
                  path: 'billing',
                  loadChildren: () => import('app/modules/admin/apps/billing/billing/billing.routes'),
                  canActivate: [RoleGuard],  // Add RoleGuard
                  data: {
                      roles: ['ROLE_SUPER_ADMIN','ROLE_ADMIN']  // Restrict to super admin
                  }
              }, 
            ]},


            {
              path: 'docs',
              canActivate: [RoleGuard],
              data: {
                  roles: ['ROLE_USER']  // Allow only users with the ROLE_USER
              },
              children: [
                  // Changelog
                  {
                      path: 'pinsender',
                      loadChildren: () => import('app/modules/admin/docs/changelog/changelog.routes')
                  },
          
              ]
          },

    //  404 & Catch all
           {path: '404-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/admin/pages/error/error-404/error-404.routes')},
           {path: '**', redirectTo: '404-not-found'}
        ]
    }
];
