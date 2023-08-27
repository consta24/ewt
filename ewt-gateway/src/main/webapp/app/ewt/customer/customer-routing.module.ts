import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {ErrorComponent} from "../../layouts/error/error.component";


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
    loadChildren: () => import('./product/product.module').then(m => m.ProductModule)
  },
  {
    path: 'cart',
    loadChildren: () => import('./cart/cart.module').then(m => m.CartModule)
  },
  {
    path: 'checkout',
    loadChildren: () => import('./checkout/checkout.module').then(m => m.CheckoutModule)
  }
]

@NgModule({
  imports: [RouterModule.forChild(storeAdminRoutes)],
})
export class CustomerRoutingModule {
}
