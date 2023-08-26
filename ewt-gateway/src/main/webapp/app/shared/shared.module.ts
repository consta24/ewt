import {NgModule} from '@angular/core';

import {FindLanguageFromKeyPipe, TranslateDirective} from './language';
import {LoadingComponent} from "./loading/loading.component";
import {SharedLibsModule} from "./shared-libs.module";
import {AlertComponent} from "./alert/alert.component";
import {AlertErrorComponent} from "./alert/alert-error.component";
import {ItemCountComponent} from "./pagination/item-count.component";
import {HasAnyAuthorityDirective} from "./auth/has-any-authority.directive";
import {DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe} from "./date";
import {SortByDirective, SortDirective} from "./sort";
import {FilterComponent} from "./filter";
import {ActiveMenuDirective} from "../layouts/navbar/active-menu.directive";
import {SelectStarRatingComponent} from "./reviews/select-stars/select-star-rating.component";
import {DisplayStarRatingComponent} from "./reviews/display-stars/display-star-rating.component";

/**
 * Application wide Module
 */
@NgModule({
  imports: [SharedLibsModule],
  declarations: [
    FindLanguageFromKeyPipe,
    TranslateDirective,
    AlertComponent,
    AlertErrorComponent,
    ItemCountComponent,
    HasAnyAuthorityDirective,
    DurationPipe,
    FormatMediumDatePipe,
    FormatMediumDatetimePipe,
    SortByDirective,
    SortDirective,
    FilterComponent,
    ActiveMenuDirective,

    DisplayStarRatingComponent,
    LoadingComponent,
    SelectStarRatingComponent,
  ],
  exports: [
    SharedLibsModule,
    FindLanguageFromKeyPipe,
    TranslateDirective,
    AlertComponent,
    AlertErrorComponent,
    ItemCountComponent,
    HasAnyAuthorityDirective,
    DurationPipe,
    FormatMediumDatePipe,
    FormatMediumDatetimePipe,
    SortByDirective,
    SortDirective,
    FilterComponent,
    ActiveMenuDirective,

    DisplayStarRatingComponent,
    SelectStarRatingComponent,
    LoadingComponent
  ],
})
export class SharedModule {
}
