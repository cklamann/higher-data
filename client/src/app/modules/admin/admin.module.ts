import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatInputModule, MatTabsModule } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material';
import { Users } from '../../models/Users';
import { RestService } from '../../services/rest/rest.service';
import { InterceptService } from '../../services/intercept/intercept.service';
import { LoginPageComponent } from './login-page/login-page.component'
import { FlexLayoutModule } from "@angular/flex-layout";
import { AppRoutingModule } from '../app-routing/app-routing.module';
import { ChartCreatorComponent } from './admin-page/chart-creator/chart-creator.component';
import { VariableDefinerComponent } from './admin-page/variable-definer/variable-definer.component';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    FlexLayoutModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  declarations: [AdminPageComponent,LoginPageComponent, ChartCreatorComponent, VariableDefinerComponent],
  providers: [Users, RestService, InterceptService]
})
export class AdminModule { }
