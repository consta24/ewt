import { Route } from '@angular/router';

import { HomeComponent } from './home.component';

export const homeRoute: Route = {
  path: '',
  component: HomeComponent,
  data: {
    authorities: [],
    pageTitle: 'Home Page Title',
  },
};
