import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { ProductListComponent } from './list/product-list.component';
import { ProductRoutingModule } from './product-routing.module';
import { ProductAddComponent } from './add/product-add.component';
import { AttributesListComponent } from './list/attributes/attributes-list.component';
import { CategoriesListComponent } from './list/categories/categories-list.component';
import { NgxEditorModule } from 'ngx-editor';

@NgModule({
  imports: [SharedModule, ProductRoutingModule, NgxEditorModule],
  declarations: [ProductListComponent, ProductAddComponent, AttributesListComponent, CategoriesListComponent],
})
export class ProductModule {}
