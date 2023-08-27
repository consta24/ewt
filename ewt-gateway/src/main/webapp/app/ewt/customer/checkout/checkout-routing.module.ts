import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {CheckoutComponent} from "./drawer/checkout.component";


const cartRoutes: Routes = [
  {
    path: '',
    component: CheckoutComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(cartRoutes)],
})
export class CheckoutRoutingModule {
}
