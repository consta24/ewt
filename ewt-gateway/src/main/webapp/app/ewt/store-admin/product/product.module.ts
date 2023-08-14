import {NgModule} from "@angular/core";
import {SharedModule} from "../../../shared/shared.module";
import {ProductListComponent} from "./list/product-list.component";
import {ProductRoutingModule} from "./product-routing.module";
import {ProductAddComponent} from "./add/product-add.component";
import {NgOptimizedImage} from "@angular/common";

@NgModule({
  imports: [SharedModule, ProductRoutingModule, NgOptimizedImage],
  declarations: [ProductListComponent, ProductAddComponent],
})
export class ProductModule {
}
