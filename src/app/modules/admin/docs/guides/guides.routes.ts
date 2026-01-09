import { Routes } from '@angular/router';
import { JwtComponent } from 'app/modules/admin/docs/guides/authentication/jwt/jwt';
import { ComponentThemingComponent } from 'app/modules/admin/docs/guides/customization/component-theming/component-theming';
import { MultiLanguageCustomizationComponent } from 'app/modules/admin/docs/guides/customization/multi-language/multi-language';
import { PageLayoutsComponent } from 'app/modules/admin/docs/guides/customization/page-layouts/page-layouts';
import { SplashScreenCustomizationComponent } from 'app/modules/admin/docs/guides/customization/splash-screen/splash-screen';
import { TailwindCSSComponent } from 'app/modules/admin/docs/guides/customization/tailwindcss/tailwindcss';
import { ThemeLayoutsComponent } from 'app/modules/admin/docs/guides/customization/theme-layouts/theme-layouts';
import { ThemingComponent } from 'app/modules/admin/docs/guides/customization/theming/theming';
import { ComponentStructureComponent } from 'app/modules/admin/docs/guides/development/component-structure/component-structure';
import { DeploymentComponent } from 'app/modules/admin/docs/guides/development/deployment/deployment';
import { DirectoryStructureComponent } from 'app/modules/admin/docs/guides/development/directory-structure/directory-structure';
import { StarterKitComponent } from 'app/modules/admin/docs/guides/development/starter-kit/starter-kit';
import { UpdatingComponent } from 'app/modules/admin/docs/guides/development/updating/updating';
import { InstallationComponent } from 'app/modules/admin/docs/guides/getting-started/installation/installation';
import { IntroductionComponent } from 'app/modules/admin/docs/guides/getting-started/introduction/introduction';
import { PrerequisitesComponent } from 'app/modules/admin/docs/guides/getting-started/prerequisites/prerequisites';
import { ServingComponent } from 'app/modules/admin/docs/guides/getting-started/serving/serving';
import { GuidesComponent } from 'app/modules/admin/docs/guides/guides.component';

export default [
    {
        path     : '',
        component: GuidesComponent,
        children : [
            {
                path      : '',
                pathMatch : 'full',
                redirectTo: 'getting-started',
            },
            {
                path    : 'getting-started',
                children: [
                    {
                        path      : '',
                        pathMatch : 'full',
                        redirectTo: 'introduction',
                    },
                    {
                        path     : 'introduction',
                        component: IntroductionComponent,
                    },
                    {
                        path     : 'prerequisites',
                        component: PrerequisitesComponent,
                    },
                    {
                        path     : 'installation',
                        component: InstallationComponent,
                    },
                    {
                        path     : 'serving',
                        component: ServingComponent,
                    },
                ],
            },
]}

] as Routes;
