import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {errorRoute} from './layouts/error/error.route';
import {DEBUG_INFO_ENABLED} from 'app/app.constants';
import {Authority} from 'app/config/authority.constants';
import {NavbarComponent} from './layouts/navbar/navbar.component';

import {UserRouteAccessService} from 'app/core/auth/user-route-access.service';

@NgModule({
  imports: [
    RouterModule.forRoot(
      [
        {
          path: '',
          component: NavbarComponent,
          outlet: 'navbar'
        },
        {
          path: '',
          loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
          title: 'home.title',
        },
        {
          path: 'admin',
          data: {
            authorities: [Authority.ADMIN],
          },
          canActivate: [UserRouteAccessService],
          loadChildren: () => import('./admin/admin-routing.module').then(m => m.AdminRoutingModule),
        },
        {
          path: 'account',
          loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
        },
        {
          path: 'login',
          loadChildren: () => import('./login/login.module').then(m => m.LoginModule),
        },
        {
          path: '',
          loadChildren: () => import(`./ewt/ewt-routing.module`).then(m => m.EwtRoutingModule),

        },
        ...errorRoute,
      ],
      {enableTracing: DEBUG_INFO_ENABLED, bindToComponentInputs: true}
    ),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
