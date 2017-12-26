import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RestService } from '../../services/rest/rest.service';
import { AppComponent } from './app/app.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '../app-routing/app-routing.module';
import { AdminModule } from '../admin/admin.module';
import { ChartPageModule } from '../chart-page/chart-page.module';

@NgModule({
	//imports will be available to all components in module 
	imports: [BrowserModule, HttpClientModule, BrowserAnimationsModule, AppRoutingModule, ChartPageModule, AdminModule],
	declarations: [AppComponent], //list all components in the module
	bootstrap: [AppComponent],
	providers: []
})

export class AppModule { }