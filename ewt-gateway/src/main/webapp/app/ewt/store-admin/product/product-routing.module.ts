import {RouterModule, Routes} from "@angular/router";
import {ProductListComponent} from "./list/product-list.component";
import {NgModule} from "@angular/core";
import {ProductAddComponent} from "./add/product-add.component";

const productRoutes: Routes = [
  {
    path: '',
    component: ProductListComponent
  },
  {
    path: 'add',
    component: ProductAddComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(productRoutes)],
})
export class ProductRoutingModule {
}
