import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RestService } from '../../services/rest/rest.service';
import { AppComponent } from '../app/app.component';
import { HttpClientModule } from '@angular/common/http';
import { Schools } from '../../models/Schools';
import { ChartPageComponent } from './chart-page/chart-page.component';
import { SharedModule } from '../shared/shared.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatRadioModule, MatTabsModule } from '@angular/material';
import { MatCardModule } from '@angular/material';
import { AppRoutingModule } from '../app-routing/app-routing.module';
import { ChartModule } from '../chart/chart.module';
import { DataPageComponent } from './data-page.component';
import { TablePageComponent } from './table-page/table-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SourcesPageComponent } from './sources-page/sources-page.component';
import { ChartSourcesComponent } from './sources-page/chart-sources/chart-sources.component';
import { VariableSourcesComponent } from './sources-page/variable-sources/variable-sources.component';
import { SourceDisplayComponent } from './sources-page/source-display/source-display.component';

@NgModule({
	//imports will be available to all components in module 
	imports: [BrowserModule, HttpClientModule, ReactiveFormsModule, MatTabsModule, BrowserAnimationsModule, FlexLayoutModule, AppRoutingModule, MatToolbarModule, SharedModule, ChartModule, MatRadioModule, MatCardModule],
	declarations: [ChartPageComponent, DataPageComponent, TablePageComponent, SourcesPageComponent, ChartSourcesComponent, VariableSourcesComponent, SourceDisplayComponent], //list all components in the module
	providers: [RestService, Schools] // module-wide providers, still need to be imported in each component
})

export class ChartPageModule { }