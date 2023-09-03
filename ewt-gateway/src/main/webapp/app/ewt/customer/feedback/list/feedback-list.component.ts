import {Component, Input, OnInit} from "@angular/core";
import {FeedbackReviewModalComponent} from "../modal/review-modal/feedback-review-modal.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FeedbackQuestionModalComponent} from "../modal/question-modal/feedback-question-modal.component";
import {FeedbackService} from "../service/feedback.service";
import {IFeedbackReview} from "../model/feedback-review.model";
import {FeedbackReviewImageService} from "../../../../shared/image/feedback-review-image.service";
import dayjs from "dayjs/esm";
import {IFeedbackReviewInfo} from "../model/feedback-review-info.model";

@Component({
  selector: 'ewt-customer-feedback-list',
  templateUrl: 'feedback-list.component.html',
})
export class FeedbackListComponent implements OnInit {
  @Input("productId") productId!: number;

  isLoading = true;
  reviewInfo!: IFeedbackReviewInfo;
  reviews: IFeedbackReview[] = [];

  imagesMap: Map<number, string[]> = new Map();

  isReviewsExpanded = true;
  isQuestionsExpanded = false;

  reviewsPerPage = 2;
  currentPage = 1;
  totalReviews = 0;

  constructor(private modalService: NgbModal, private feedbackService: FeedbackService, private feedbackReviewImageService: FeedbackReviewImageService) {
  }

  ngOnInit(): void {
    this.fetchReviewInfo();
    this.fetchReviews();
  }

  fetchReviewInfo() {
    this.feedbackService.getReviewInfoForProduct(this.productId).subscribe({
      next: (reviewInfo) => {
        this.reviewInfo = reviewInfo;
        console.log(reviewInfo);
      },
      error: () => {
        //TODO:
      }
    })
  }

  fetchReviews() {
    const pageable = {
      page: this.currentPage - 1,
      size: this.reviewsPerPage,
      sort: ["creation_date,desc"]
    }
    this.feedbackService.getReviewsPageForProduct(this.productId, pageable).subscribe({
      next: (res) => {
        if (res.body) {
          this.reviews = res.body.map(review => ({
            ...review,
            creationDate: dayjs(review.creationDate)
          }));
          this.totalReviews = Number(res.headers.get('X-Total-Count'))
          this.fetchReviewsImages();
        } else {
          //TODO:
        }
      },
      error: () => {
        //TODO:
      }
    })
  }

  openReviewModal() {
    const modalRef = this.modalService.open(FeedbackReviewModalComponent, {centered: true});
    modalRef.componentInstance.productId = this.productId;
    modalRef.closed.subscribe(() => {
      this.fetchReviewInfo();
      this.fetchReviews()
    })
  }

  openQuestionModal() {
    const modalRef = this.modalService.open(FeedbackQuestionModalComponent, {centered: true});
    modalRef.componentInstance.productId = this.productId;
    modalRef.closed.subscribe(() => this.fetchReviews())
  }

  toggleReviews() {
    if (!this.isReviewsExpanded) {
      this.isQuestionsExpanded = false;
    }
    this.isReviewsExpanded = !this.isReviewsExpanded;
  }

  toggleQuestions() {
    if (!this.isQuestionsExpanded) {
      this.isReviewsExpanded = false;
    }
    this.isQuestionsExpanded = !this.isQuestionsExpanded;
  }

  getImagesForReview(reviewId: number) {
    return this.imagesMap.get(reviewId);
  }

  private fetchReviewsImages() {
    this.feedbackReviewImageService.getImagesForReviews(this.reviews).subscribe({
      next: (imagesMap) => {
        this.imagesMap = imagesMap;
        this.isLoading = false;
      },
      error: () => {
        //TODO:
      }
    })
  }
}
