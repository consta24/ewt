import {NgModule} from "@angular/core";
import {SharedModule} from "../../../shared/shared.module";
import {CheckoutRoutingModule} from "./checkout-routing.module";
import {CheckoutComponent} from "./drawer/checkout.component";


@NgModule({
  imports: [SharedModule, CheckoutRoutingModule],
  declarations: [CheckoutComponent],
  exports: [
    CheckoutComponent
  ]
})
export class CheckoutModule {
}
