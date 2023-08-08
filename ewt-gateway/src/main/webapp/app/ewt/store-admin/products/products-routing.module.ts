import {RouterModule, Routes} from "@angular/router";
import {ProductListComponent} from "./list/product-list.component";
import {NgModule} from "@angular/core";

const productRoutes: Routes = [
  {
    path: '',
    component: ProductListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(productRoutes)],
})
export class ProductsRoutingModule {
}
