import {NgModule} from "@angular/core";
import {SharedModule} from "../shared/shared.module";
import {accountRoutes} from "./account.route";
import {RouterModule} from "@angular/router";
import {ActivateComponent} from "./activate/activate.component";
import {RegisterComponent} from "./register/register.component";
import {PasswordComponent} from "./password/password.component";
import {PasswordResetInitComponent} from "./password-reset/init/password-reset-init.component";
import {PasswordResetFinishComponent} from "./password-reset/finish/password-reset-finish.component";
import {SettingsComponent} from "./settings/settings.component";
import {PasswordStrengthBarComponent} from "./password/password-strength-bar/password-strength-bar.component";

@NgModule({
  imports: [SharedModule, RouterModule.forChild(accountRoutes)],
  declarations: [
    ActivateComponent,
    RegisterComponent,
    PasswordComponent,
    PasswordStrengthBarComponent,
    PasswordResetInitComponent,
    PasswordResetFinishComponent,
    SettingsComponent,
  ]
})
export class AccountModule {
}
