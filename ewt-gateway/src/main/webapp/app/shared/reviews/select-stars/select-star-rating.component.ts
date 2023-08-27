import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'ewt-select-star-rating',
  templateUrl: './select-star-rating.component.html',
  styleUrls: ['./select-star-rating.component.scss']
})
export class SelectStarRatingComponent {

  @Output() ratingChange = new EventEmitter<number>();
  @Input() fontSize: string = '24px';


  rating: number = 5;
  hoveredRating: number | null = null;

  setRating(value: number): void {
    this.rating = value;
    this.ratingChange.emit(this.rating);
  }

  previewRating(value: number): void {
    this.hoveredRating = value;
  }

  resetPreview(): void {
    this.hoveredRating = null;
  }
}
