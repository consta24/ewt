import {NgModule} from "@angular/core";
import SharedModule from "../../../shared/shared.module";
import {ProductListComponent} from "./list/product-list.component";
import {ProductsRoutingModule} from "./products-routing.module";

@NgModule({
  imports: [SharedModule, ProductsRoutingModule],
  declarations: [ProductListComponent],
})
export class ProductsModule {}
