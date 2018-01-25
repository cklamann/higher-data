import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolSearchComponent } from './school-search/school-search.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatFormFieldModule, MatOptionModule, MatInputModule } from '@angular/material';

@NgModule({
	imports: [
		CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatOptionModule, MatInputModule
	],
	declarations: [SchoolSearchComponent],
	exports: [
		SchoolSearchComponent
	]
})
export class SharedModule { }
