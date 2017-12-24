import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RestService } from '../../services/rest/rest.service';
import { AppComponent } from './app/app.component';
import { HttpClientModule } from '@angular/common/http';
import { Schools } from '../../models/Schools';
import { SchoolSearchComponent } from './school-search/school-search.component';
import { ReactiveFormsModule } from '@angular/forms'; 
import { MatAutocompleteModule, MatFormFieldModule, MatOptionModule, MatInputModule} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from "@angular/flex-layout";


@NgModule({
	//imports are modules, so you can selectively load parts of the framework
	imports: [BrowserModule, HttpClientModule, ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatOptionModule, MatInputModule, BrowserAnimationsModule, FlexLayoutModule],
	declarations: [AppComponent, SchoolSearchComponent], //list all components in the module
	bootstrap: [AppComponent], // which component to bootstrap
	providers: [RestService,Schools] // module-wide providers, still need to be imported in each component
})

export class AppModule { }