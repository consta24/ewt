import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";


const ewtRoutes: Routes = [
  {
    path: 'store-admin',
    loadChildren: () => import('./store-admin/store-admin.module').then(m => m.StoreAdminModule)
  },
  {
    path: '',
    loadChildren: () => import('./customer/customer.module').then(m => m.CustomerModule)
  }
]
@NgModule({
  imports: [RouterModule.forChild(ewtRoutes)],
})
export class EwtRoutingModule {
}

