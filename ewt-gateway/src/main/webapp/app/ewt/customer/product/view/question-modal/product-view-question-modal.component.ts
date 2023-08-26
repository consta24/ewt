import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {Component} from "@angular/core";

@Component({
  selector: 'ewt-customer-product-view-question-modal',
  templateUrl: 'product-view-question-modal.component.html',
})
export class ProductViewQuestionModalComponent {
  constructor(public activeModal: NgbActiveModal) { }

  closeModal() {
    this.activeModal.dismiss();
  }

  submitReview() {
    // Handle review submission here
    this.closeModal();
  }
}
