import {NgModule} from "@angular/core";
import {userManagementRoute} from "./user-management.route";
import {UserManagementComponent} from "./list/user-management.component";
import {UserManagementDetailComponent} from "./detail/user-management-detail.component";
import {UserManagementUpdateComponent} from "./update/user-management-update.component";
import {UserManagementDeleteDialogComponent} from "./delete/user-management-delete-dialog.component";
import {RouterModule} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";

@NgModule({
  imports: [SharedModule, RouterModule.forChild(userManagementRoute)],
  declarations: [
    UserManagementComponent,
    UserManagementDetailComponent,
    UserManagementUpdateComponent,
    UserManagementDeleteDialogComponent,
  ]
})
export class UserManagementModule {
}
