import {NgModule} from "@angular/core";
import {SharedModule} from "../../../shared/shared.module";
import {CartRoutingModule} from "./cart-routing.module";
import {CartDrawerComponent} from "./drawer/cart-drawer.component";


@NgModule({
  imports: [SharedModule, CartRoutingModule],
  declarations: [CartDrawerComponent],
  exports: [
    CartDrawerComponent
  ]
})
export class CartModule {
}
