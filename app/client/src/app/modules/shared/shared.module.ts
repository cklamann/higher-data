import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolSearchComponent } from './school-search/school-search.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatFormFieldModule, MatOptionModule, 
			MatInputModule, MatSelectModule, MatProgressSpinnerModule, 
			MatDialogModule } from '@angular/material';
import { ChartSearchComponent } from './chart-search/chart-search.component';
import { VariableDefinitionSelectComponent } from './variable-definition-select/variable-definition-select.component';
import { VariableSelectComponent } from './variable-select/variable-select.component';
import { ModalLoadingComponent } from './modals/loading/loading.component';
import { ModalErrorComponent } from './modals/error/error.component';
import { Charts } from '../../models/Charts';
import { SiteContentComponent } from './site-content/site-content.component';
import { stripOptTags } from './pipes/stripOptTags';
import { SafePipe } from './pipes/safe.pipe';

@NgModule({
	imports: [
		CommonModule, ReactiveFormsModule, MatAutocompleteModule, 
		MatFormFieldModule, MatOptionModule, MatInputModule, MatSelectModule, 
		MatProgressSpinnerModule, MatDialogModule
	],
	declarations: [SchoolSearchComponent, ChartSearchComponent, VariableDefinitionSelectComponent,
		VariableSelectComponent, ModalLoadingComponent, ModalErrorComponent, SiteContentComponent, 
		stripOptTags, SafePipe],
	exports: [
		SchoolSearchComponent, ChartSearchComponent, VariableDefinitionSelectComponent, VariableSelectComponent,
		ModalLoadingComponent, SiteContentComponent, stripOptTags, SafePipe
	],
	providers: [Charts],
	entryComponents: [ModalLoadingComponent, ModalErrorComponent]
})

export class SharedModule { }