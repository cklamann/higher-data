import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '../app-routing/app-routing.module';
import { AdminModule } from '../admin/admin.module';
import { ChartPageModule } from '../chart-page/chart-page.module';
import { GlobalLayoutModule } from '../global-layout/global-layout.module'
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
	//imports will be available to all components in module 
	imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule, ChartPageModule, AdminModule, GlobalLayoutModule,FlexLayoutModule],
	declarations: [AppComponent], //list all components in the module
	bootstrap: [AppComponent],
	providers: []
})

export class AppModule { }