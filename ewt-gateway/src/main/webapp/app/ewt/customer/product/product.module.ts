import {NgModule} from "@angular/core";
import {SharedModule} from "../../../shared/shared.module";
import {ProductRoutingModule} from "./product-routing.module";
import {ProductListComponent} from "./list/product-list.component";
import {ProductViewComponent} from "./view/product-view.component";
import {NgOptimizedImage} from "@angular/common";
import {ProductViewReviewModalComponent} from "./view/review-modal/product-view-review-modal.component";
import {ProductViewQuestionModalComponent} from "./view/question-modal/product-view-question-modal.component";


@NgModule({
  imports: [SharedModule, ProductRoutingModule, NgOptimizedImage],
  declarations: [ProductListComponent, ProductViewComponent, ProductViewReviewModalComponent, ProductViewQuestionModalComponent],
})
export class ProductModule {
}
