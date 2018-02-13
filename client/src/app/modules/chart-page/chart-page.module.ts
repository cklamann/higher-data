import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RestService } from '../../services/rest/rest.service';
import { AppComponent } from '../app/app.component';
import { HttpClientModule } from '@angular/common/http';
import { Schools } from '../../models/Schools';
import { ChartPageComponent } from './chart-page.component';
import { SharedModule } from '../shared/shared.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatRadioModule } from '@angular/material'
import { AppRoutingModule } from '../app-routing/app-routing.module';
import { ChartModule } from '../chart/chart.module';

@NgModule({
	//imports will be available to all components in module 
	imports: [BrowserModule, HttpClientModule, BrowserAnimationsModule, FlexLayoutModule, AppRoutingModule, MatToolbarModule, SharedModule, ChartModule, MatRadioModule],
	declarations: [ChartPageComponent], //list all components in the module
	providers: [RestService, Schools] // module-wide providers, still need to be imported in each component
})

export class ChartPageModule { }