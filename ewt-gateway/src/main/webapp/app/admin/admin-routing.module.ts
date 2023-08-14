import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ErrorComponent} from "../layouts/error/error.component";

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ErrorComponent,
        data: {
          errorMessage: 'error.http.404',
        },
        title: 'error.title',
      },
      {
        path: 'user-management',
        loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule),
        data: {
          pageTitle: 'userManagement.home.title'
        }
      },
      {
        path: 'docs',
        loadChildren: () => import('./docs/docs.module').then(m => m.DocsModule),
      },
      {
        path: 'configuration',
        loadChildren: () => import('./configuration/configuration.module').then(m => m.ConfigurationModule),
        title: 'configuration.title',
      },
      {
        path: 'health',
        loadComponent: () => import('./health/health.component'),
        title: 'health.title',
      },
      {
        path: 'logs',
        loadComponent: () => import('./logs/logs.component'),
        title: 'logs.title',
      },
      {
        path: 'metrics',
        loadComponent: () => import('./metrics/metrics.component'),
        title: 'metrics.title',
      },
      {
        path: 'gateway',
        loadComponent: () => import('./gateway/gateway.component'),
        title: 'gateway.title',
      },
    ]),
  ],
})
export class AdminRoutingModule {
}
