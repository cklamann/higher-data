import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '../app-routing/app-routing.module';
import { GlobalLayoutModule } from '../global-layout/global-layout.module'
import { FlexLayoutModule } from "@angular/flex-layout";
import { AdminPageModule } from '../admin-page/admin-page.module';
import { ChartPageModule } from '../chart-page/chart-page.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { InterceptService } from '../../services/intercept/intercept.service';
import { AuthService } from '../../services/auth/auth.service'
import { BlogModule } from '../blog/blog.module';

@NgModule({
	//imports will be available to all components in module 
	imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule, ChartPageModule, AdminPageModule,
		GlobalLayoutModule, FlexLayoutModule, HttpClientModule, BlogModule],
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