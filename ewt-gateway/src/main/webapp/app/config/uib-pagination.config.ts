import { Injectable } from '@angular/core';
import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';

import { ITEMS_PER_PAGE_20 } from 'app/config/pagination.constants';

@Injectable({ providedIn: 'root' })
export class PaginationConfig {
  constructor(config: NgbPaginationConfig) {
    config.boundaryLinks = true;
    config.maxSize = 5;
    config.pageSize = ITEMS_PER_PAGE_20;
    config.size = 'sm';
  }
}
