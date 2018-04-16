import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminPageComponent } from './admin-page/admin-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatInputModule, MatTabsModule, MatButtonModule, MatButtonToggleModule, MatCardModule } from '@angular/material';
import { MatOptionModule, MatSelectModule } from '@angular/material';
import { Users } from '../../models/Users';
import { VariableDefinitions } from '../../models/VariableDefinitions';
import { RestService } from '../../services/rest/rest.service';
import { InterceptService } from '../../services/intercept/intercept.service';
import { LoginPageComponent } from './login-page/login-page.component';
import { ContentManagerComponent } from './admin-page/content-manager/content-manager.component';
import { FlexLayoutModule } from "@angular/flex-layout";
import { AppRoutingModule } from '../app-routing/app-routing.module';
import { ChartCreatorComponent } from './admin-page/chart-creator/chart-creator.component';
import { VariableDefinerComponent } from './admin-page/variable-definer/variable-definer.component';
import { SharedModule } from '../shared/shared.module';
import { ChartModule } from '../chart/chart.module';
import { ChartService } from '../chart/ChartService.service';
import { Categories} from '../../models/Categories';
import { SiteContent } from '../../models/SiteContent';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';


@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    FlexLayoutModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatTabsModule,
    MatButtonModule,
    ReactiveFormsModule,
    SharedModule,
    ChartModule,
    FroalaEditorModule,
    FroalaViewModule
  ],
  declarations: [AdminPageComponent, LoginPageComponent, ChartCreatorComponent, VariableDefinerComponent, ContentManagerComponent],
  providers: [Users, RestService, InterceptService, VariableDefinitions, ChartService, Categories, SiteContent]
})
export class AdminModule { }
