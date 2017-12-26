import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RestService } from '../../services/rest/rest.service';
import { AppComponent } from './app/app.component';
import { HttpClientModule } from '@angular/common/http';
import { Schools } from '../../models/Schools';
import { SchoolSearchComponent } from './school-search/school-search.component';
import { ChartPageComponent } from './chart-page/chart-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatFormFieldModule, MatOptionModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from "@angular/flex-layout";
import { AppRoutingModule } from '../app-routing/app-routing.module';

@NgModule({
	//imports will be available to all components in module 
	imports: [BrowserModule, HttpClientModule, ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatOptionModule, MatInputModule, BrowserAnimationsModule, FlexLayoutModule, AppRoutingModule],
	declarations: [ChartPageComponent, SchoolSearchComponent], //list all components in the module
	bootstrap: [ChartPageComponent], // which component to bootstrap
	providers: [RestService, Schools] // module-wide providers, still need to be imported in each component
})

export class ChartPageModule { }