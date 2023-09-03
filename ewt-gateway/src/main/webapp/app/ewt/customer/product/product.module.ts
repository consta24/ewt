import {NgModule} from "@angular/core";
import {SharedModule} from "../../../shared/shared.module";
import {ProductRoutingModule} from "./product-routing.module";
import {ProductListComponent} from "./list/product-list.component";
import {ProductViewComponent} from "./view/product-view.component";
import {FeedbackModule} from "../feedback/feedback.module";


@NgModule({
  imports: [SharedModule, FeedbackModule, ProductRoutingModule],
  declarations: [ProductListComponent, ProductViewComponent],
})
export class ProductModule {
}
