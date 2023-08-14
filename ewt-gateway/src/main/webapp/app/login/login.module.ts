import {NgModule} from "@angular/core";
import {LoginComponent} from "./login.component";
import {RouterModule} from "@angular/router";
import {SharedModule} from "../shared/shared.module";
import {loginRoute} from "./login.route";

@NgModule({
  imports: [SharedModule, RouterModule.forChild([loginRoute])],
  declarations: [LoginComponent]
})
export class LoginModule {}
