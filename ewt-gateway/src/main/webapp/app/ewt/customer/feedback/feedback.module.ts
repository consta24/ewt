import {NgModule} from "@angular/core";
import {SharedModule} from "../../../shared/shared.module";
import {FeedbackReviewModalComponent} from "./modal/review-modal/feedback-review-modal.component";
import {FeedbackQuestionModalComponent} from "./modal/question-modal/feedback-question-modal.component";
import {FeedbackListComponent} from "./list/feedback-list.component";
import {NgOptimizedImage} from "@angular/common";


@NgModule({
    imports: [SharedModule, NgOptimizedImage],
  declarations: [FeedbackListComponent, FeedbackReviewModalComponent, FeedbackQuestionModalComponent],
  exports: [
    FeedbackListComponent
  ]
})
export class FeedbackModule {
}
