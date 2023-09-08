import {Component, Input, OnInit} from "@angular/core";
import {FeedbackReviewModalComponent} from "../modal/review-modal/feedback-review-modal.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FeedbackQuestionModalComponent} from "../modal/question-modal/feedback-question-modal.component";
import {FeedbackService} from "../service/feedback.service";
import {IFeedbackReview} from "../model/feedback-review.model";
import {FeedbackReviewImageService} from "../../../../shared/image/feedback-review-image.service";
import dayjs from "dayjs/esm";
import {IFeedbackReviewInfo} from "../model/feedback-review-info.model";
import {defaultIfEmpty, forkJoin, of, switchMap} from "rxjs";
import {tap} from "rxjs/operators";

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

  reviewsPerPage = 5;
  currentPage = 1;
  totalReviews = 0;

  constructor(private modalService: NgbModal, private feedbackService: FeedbackService, private feedbackReviewImageService: FeedbackReviewImageService) {
  }

  ngOnInit(): void {
    this.fetchReviewsData();
  }

  fetchReviewsData() {
    const pageable = {
      page: this.currentPage - 1,
      size: this.reviewsPerPage,
      sort: ["creation_date,desc"]
    }

    forkJoin({
      reviewInfo: this.feedbackService.getReviewInfoForProduct(this.productId).pipe(
        defaultIfEmpty(null)
      ),
      reviewsPage: this.feedbackService.getReviewsPageForProduct(this.productId, pageable)
    }).pipe(
      tap((results) => {
        if (results.reviewInfo) {
          this.reviewInfo = results.reviewInfo;
        }
        if (results.reviewsPage.body) {
          this.reviews = results.reviewsPage.body.map(review => ({
            ...review,
            creationDate: dayjs(review.creationDate)
          }));
          this.totalReviews = Number(results.reviewsPage.headers.get('X-Total-Count'));
        } else {
          //TODO:
        }
      }),
      switchMap(() => {
        if (this.reviews && this.reviews.length > 0) {
          return this.feedbackReviewImageService.getImagesForReviews(this.reviews);
        } else {
          return of(null);
        }
      })
    ).subscribe({
      next: (imagesMap) => {
        if (imagesMap) {
          this.imagesMap = imagesMap;
        }
        this.isLoading = false;
      },
      error: () => {
        //TODO:
      }
    });
  }


  openReviewModal() {
    const modalRef = this.modalService.open(FeedbackReviewModalComponent, {centered: true});
    modalRef.componentInstance.productId = this.productId;
    modalRef.closed.subscribe(() => this.fetchReviewsData());
  }

  openQuestionModal() {
    const modalRef = this.modalService.open(FeedbackQuestionModalComponent, {centered: true});
    modalRef.componentInstance.productId = this.productId;
    modalRef.closed.subscribe(() => this.fetchReviewsData());
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
}
