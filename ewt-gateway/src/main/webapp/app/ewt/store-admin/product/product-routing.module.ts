import {RouterModule, Routes} from "@angular/router";
import {ProductListComponent} from "./list/product-list.component";
import {NgModule} from "@angular/core";
import {ProductAddComponent} from "./add/product-add.component";
import {AttributesListComponent} from "./list/attributes/attributes-list.component";
import {CategoriesListComponent} from "./list/categories/categories-list.component";

const productRoutes: Routes = [
  {
    path: '',
    component: ProductListComponent
  },
  {
    path: 'attributes',
    component: AttributesListComponent
  },
  {
    path: 'add',
    component: ProductAddComponent
  },
  {
    path: 'edit/:productId',
    component: ProductAddComponent
  },
  {
    path: 'categories',
    component: CategoriesListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(productRoutes)],
})
export class ProductRoutingModule {
}
