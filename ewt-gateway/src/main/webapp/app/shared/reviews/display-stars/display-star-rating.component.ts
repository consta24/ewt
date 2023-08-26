import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ewt-display-star-rating',
  templateUrl: './display-star-rating.component.html',
  styleUrls: ['./display-star-rating.component.scss']

})
export class DisplayStarRatingComponent implements OnInit {
  @Input() value: number = 0;
  @Input() fontSize: string = '24px';


  fullStars: number = 0;
  halfStar: boolean = false;
  emptyStars: number = 0;

  ngOnInit() {
    this.fullStars = Math.floor(this.value);
    this.halfStar = this.value - this.fullStars >= 0.5;
    this.emptyStars = 5 - this.fullStars - (this.halfStar ? 1 : 0);
  }
}
