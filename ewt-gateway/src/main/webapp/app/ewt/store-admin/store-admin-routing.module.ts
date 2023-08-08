import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import ErrorComponent from "../../layouts/error/error.component";


const storeAdminRoutes: Routes = [
  {
    path: '',
    component: ErrorComponent,
    data: {
      errorMessage: 'error.http.404',
    },
    title: 'error.title',
  },
  {
    path: 'products',
    loadChildren: () => import('./products/products.module').then(m => m.ProductsModule)
  }
]
@NgModule({
  imports: [RouterModule.forChild(storeAdminRoutes)],
})
export default class StoreAdminRoutingModule {
}
