import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '../app-routing/app-routing.module';
import { GlobalLayoutModule } from '../global-layout/global-layout.module'
import { FlexLayoutModule } from "@angular/flex-layout";
import { AdminModule } from '../admin/admin.module';
import { ChartPageModule } from '../data-page/data-page.module';
import { SharedModule } from '../shared/shared.module'
import { BlogModule } from '../blog/blog.module';
import { ChartModule } from '../chart/chart.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { InterceptService } from '../../services/intercept/intercept.service';
import { AuthService } from '../../services/auth/auth.service';
import { RestService } from '../../services/rest/rest.service';

@NgModule({
	//imports will be available to all components in module 
	imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule, ChartPageModule, AdminModule,
		GlobalLayoutModule, FlexLayoutModule, HttpClientModule, BlogModule, SharedModule, ChartModule],
	declarations: [AppComponent], //list all components in the module
	bootstrap: [AppComponent],
	providers: [{
		provide: HTTP_INTERCEPTORS,
		useClass: InterceptService,
		multi: true
	},
		AuthService]
})

export class AppModule { }