import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {NgbModalModule, NgbModule, NgbPaginationModule} from "@ng-bootstrap/ng-bootstrap";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {TranslateModule} from "@ngx-translate/core";
import {RouterModule} from "@angular/router";
import {NgSelectModule} from '@ng-select/ng-select'
import {DragDropModule} from '@angular/cdk/drag-drop'

@NgModule({
  exports: [
    FormsModule,
    CommonModule,
    NgbModule,
    InfiniteScrollModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule,
    NgbModalModule,
    NgSelectModule,
    NgbPaginationModule,
    DragDropModule
  ]
})
export class SharedLibsModule {
}
