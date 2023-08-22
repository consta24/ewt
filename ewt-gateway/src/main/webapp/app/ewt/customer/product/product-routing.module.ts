import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {ProductListComponent} from "./list/product-list.component";
import {ProductViewComponent} from "./view/product-view.component";


const productRoutes: Routes = [
  {
    path: '',
    component: ProductListComponent
  },
  {
    path: ':productId',
    component: ProductViewComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(productRoutes)],
})
export class ProductRoutingModule {
}
