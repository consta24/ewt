import {NgModule} from "@angular/core";
import {SharedModule} from "../../shared/shared.module";
import {StoreAdminRoutingModule} from "./store-admin-routing.module";

@NgModule({
  imports: [SharedModule, StoreAdminRoutingModule],
  declarations: [],
})
export class StoreAdminModule {
}
