import { Component, Input, OnInit } from '@angular/core';
import { FeedbackReviewModalComponent } from '../modal/review-modal/feedback-review-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FeedbackQuestionModalComponent } from '../modal/question-modal/feedback-question-modal.component';
import { FeedbackReviewService } from '../service/feedback-review.service';
import { IFeedbackReview } from '../model/feedback-review.model';
import { FeedbackReviewImageService } from '../../../../shared/image/feedback-review-image.service';
import dayjs from 'dayjs/esm';
import { IFeedbackReviewInfo } from '../model/feedback-review-info.model';
import { defaultIfEmpty, forkJoin, of, switchMap, take } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Account } from '../../../../core/auth/account.model';
import { AccountService } from '../../../../core/auth/account.service';
import { IFeedbackQuestion } from '../model/feedback-question.model';
import { ITEMS_PER_PAGE_20 } from '../../../../config/pagination.constants';
import { FeedbackQuestionService } from '../service/feedback-question.service';
import { expandFadeAnimation } from '../../../../shared/animations/expand-fade.animation';

@Component({
  selector: 'ewt-customer-feedback-list',
  templateUrl: 'feedback-list.component.html',
  animations: [expandFadeAnimation],
  styleUrls: ['feedback-list.component.scss'],
})
export class FeedbackListComponent implements OnInit {
  @Input('productId') productId!: number;

  isLoading = true;
  isLoggedIn = false;

  reviewInfo!: IFeedbackReviewInfo;
  reviews: IFeedbackReview[] = [];
  questions: IFeedbackQuestion[] = [];

  imagesMap: Map<number, string[]> = new Map();

  isReviewsExpanded = true;
  isQuestionsExpanded = false;

  itemsPerPage = ITEMS_PER_PAGE_20;
  currentPage = 1;

  totalQuestions = 0;
  totalReviews = 0;

  constructor(
    private modalService: NgbModal,
    private feedbackQuestionService: FeedbackQuestionService,
    private feedbackReviewService: FeedbackReviewService,
    private feedbackReviewImageService: FeedbackReviewImageService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.fetchLoginStatus();
    this.fetchReviewsData();
    this.fetchQuestionsData();
  }

  fetchLoginStatus() {
    this.accountService
      .getAuthenticationState()
      .pipe(take(1))
      .subscribe((account: Account | null) => {
        if (account) {
          this.isLoggedIn = true;
        }
      });
  }

  fetchReviewsData() {
    const pageable = {
      page: this.currentPage - 1,
      size: this.itemsPerPage,
      sort: ['creation_date,desc'],
    };

    forkJoin({
      reviewInfo: this.feedbackReviewService.getReviewInfoForProduct(this.productId).pipe(defaultIfEmpty(null)),
      reviewsPage: this.feedbackReviewService.getReviewsPageForProduct(this.productId, pageable),
    })
      .pipe(
        tap(results => {
          if (results.reviewInfo) {
            this.reviewInfo = results.reviewInfo;
          }
          if (results.reviewsPage.body?.length) {
            this.reviews = results.reviewsPage.body.map(review => ({
              ...review,
              creationDate: dayjs(review.creationDate),
            }));
            this.totalReviews = Number(results.reviewsPage.headers.get('X-Total-Count'));
          } else {
            this.reviews = [];
          }
        }),
        switchMap(() => {
          if (this.reviews && this.reviews.length > 0) {
            return this.feedbackReviewImageService.getImagesForReviews(this.reviews);
          } else {
            return of(null);
          }
        })
      )
      .subscribe({
        next: imagesMap => {
          if (imagesMap) {
            this.imagesMap = imagesMap;
          }
          this.isLoading = false;
        },
        error: () => {
          this.reviews = [];
        },
      });
  }

  fetchQuestionsData() {
    const pageable = {
      page: this.currentPage - 1,
      size: this.itemsPerPage,
      sort: ['creation_date,desc'],
    };

    this.feedbackQuestionService
      .getQuestionsPageForProduct(this.productId, pageable)
      .pipe(
        tap(res => {
          if (res.body) {
            res.body.forEach(question => (question.answer = 'test'));
            this.questions = res.body.map(question => ({
              ...question,
              creationDate: dayjs(question.creationDate),
            }));
          } else {
            this.questions = [];
          }
        })
      )
      .subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: () => {
          this.questions = [];
        },
      });
  }

  openReviewModal() {
    const modalRef = this.modalService.open(FeedbackReviewModalComponent, { centered: true });
    modalRef.componentInstance.productId = this.productId;
    modalRef.closed.subscribe(() => this.fetchReviewsData());
  }

  openQuestionModal() {
    const modalRef = this.modalService.open(FeedbackQuestionModalComponent, { centered: true });
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
