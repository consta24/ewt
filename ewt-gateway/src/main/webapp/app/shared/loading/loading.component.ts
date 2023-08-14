import {Component, Input} from "@angular/core";

@Component({
  selector: 'ewt-loading',
  templateUrl: 'loading.component.html'
})
export class LoadingComponent {
  @Input() isLoading = false;
}
