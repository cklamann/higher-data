import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolSearchComponent } from './school-search/school-search.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatFormFieldModule, MatOptionModule, MatInputModule, MatSelectModule } from '@angular/material';
import { ChartSearchComponent } from './chart-search/chart-search.component';
import { VariableSelectComponent } from './variable-select/variable-select.component';
import { Charts } from '../../models/Charts';


@NgModule({
	imports: [
		CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatOptionModule, MatInputModule, MatSelectModule
	],
	declarations: [SchoolSearchComponent, ChartSearchComponent, VariableSelectComponent],
	exports: [
		SchoolSearchComponent, ChartSearchComponent, VariableSelectComponent
	],
	providers: [Charts]
})
export class SharedModule { }
