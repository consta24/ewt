import {Injectable} from "@angular/core";
import {FeedbackReviewService} from "../../ewt/customer/feedback/service/feedback-review.service";
import {IFeedbackReview} from "../../ewt/customer/feedback/model/feedback-review.model";
import {forkJoin, from, Observable, of, reduce, take} from "rxjs";
import {catchError, map, mergeMap, switchMap, tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class FeedbackReviewImageService {
  private imagesCache = new Map<number, string[]>();

  constructor(private feedbackService: FeedbackReviewService) {}

  public getImagesForReviews(reviews: IFeedbackReview[]): Observable<Map<number, string[]>> {
    return forkJoin(reviews.map(review => this.getImagesForReview(review))).pipe(
      map(mapsArray => {
        const result = new Map<number, string[]>();
        mapsArray.forEach(reviewImagesMap => {
          reviewImagesMap.forEach((images, reviewId) => result.set(reviewId, images));
        });
        return result;
      })
    );
  }

  public getImagesForReview(review: IFeedbackReview): Observable<Map<number, string[]>> {
    const reviewId = review.id;
    if (this.imagesCache.has(reviewId)) {
      return of(new Map([[reviewId, this.imagesCache.get(reviewId) || []]]));
    }
    return this.fetchImagesForReview(review).pipe(
      map(images => new Map([[reviewId, images]]))
    );
  }

  private fetchImagesForReview(review: IFeedbackReview): Observable<string[]> {
    return from(review.reviewImages).pipe(
      mergeMap(reviewImage => this.feedbackService.getReviewImageByRef(reviewImage.ref).pipe(
        switchMap(blob => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          return from(new Promise<string>(resolve => {
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
          }));
        }),
        tap(imgData => this.addToImageCache(review.id, imgData)),
        catchError(error => {
          console.error('Error fetching image:', error);
          return of('defaultImagePath');
        })
      )),
      // Collects all the image strings
      reduce((acc, imgData) => [...acc, imgData], [] as string[])
    );
  }


  private addToImageCache(reviewId: number, imgData: string): void {
    const images = this.imagesCache.get(reviewId) || [];
    images.push(imgData);
    this.imagesCache.set(reviewId, images);
  }
}

