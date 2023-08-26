import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {Component} from "@angular/core";

@Component({
  selector: 'ewt-customer-product-view-review-modal',
  templateUrl: 'product-view-review-modal.component.html',
})
export class ProductViewReviewModalComponent {
  constructor(public activeModal: NgbActiveModal) { }

  closeModal() {
    this.activeModal.dismiss();
  }

  submitReview() {
    // Handle review submission here
    this.closeModal();
  }
}
