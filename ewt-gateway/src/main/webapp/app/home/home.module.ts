import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from 'app/shared/shared.module';
import { HomeComponent } from './home.component';
import {homeRoute} from "./home.route";

@NgModule({
  imports: [SharedModule, RouterModule.forChild([homeRoute])],
  declarations: [HomeComponent],
})
export class HomeModule {}
