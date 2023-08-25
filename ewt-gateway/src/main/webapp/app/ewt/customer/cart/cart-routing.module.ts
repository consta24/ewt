import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {CartDrawerComponent} from "./drawer/cart-drawer.component";


const cartRoutes: Routes = [
  {
    path: '',
    component: CartDrawerComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(cartRoutes)],
})
export class CartRoutingModule {
}
