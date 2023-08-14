import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import {configurationRoute} from "./configuration.route";
import {ConfigurationComponent} from "./configuration.component";
@NgModule({
  imports: [SharedModule, RouterModule.forChild([configurationRoute])],
  declarations: [
    ConfigurationComponent
  ]
})
export class ConfigurationModule {
}
