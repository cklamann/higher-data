import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { Users } from '../../models/Users';
import { RestService } from '../../services/rest/rest.service';
import { InterceptService } from '../../services/intercept/intercept.service';
import { LoginPageComponent } from './login-page/login-page.component'
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FlexLayoutModule,

  ],
  declarations: [AdminPageComponent,LoginPageComponent],
  providers: [Users, RestService, InterceptService]
})
export class AdminPageModule { }
