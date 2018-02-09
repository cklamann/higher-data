import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Schools, School } from '../../../models/Schools';
import { intSchoolModel } from '../../../../../server/src/schemas/SchoolSchema';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';

@Component({
	selector: 'app-school-search',
	templateUrl: './school-search.component.html',
	styleUrls: ['./school-search.component.scss']
})
export class SchoolSearchComponent implements OnInit {
	searchForm: FormGroup;
	searchTerm: string;
	selectedSchool: School;
	autocompleteResults: School[];
	
	@Input()
	defaultSchoolId:string;

	@Output()
	onSchoolSelect: EventEmitter<intSchoolModel|null> = new EventEmitter<intSchoolModel|null>();
	
	constructor(private fb: FormBuilder, private Schools: Schools) {
		this.createForm();
	}

	ngOnInit() {
		this.listenForSearchChanges();
		console.log(this.defaultSchoolId);
		if(this.defaultSchoolId){
			this.Schools.fetch(this.defaultSchoolId)
				.subscribe( res => this.onSchoolSelect.emit(res))
		} 
	}

	createForm() {
		this.searchForm = this.fb.group({
			searchText: ['', [Validators.minLength(3), Validators.required]],
			schoolSelect: '',
		});
	}

	listenForSearchChanges(): void {
		this.searchForm.valueChanges.debounceTime(500).subscribe(input => {
			if (input.searchText.length > 3 && input.searchText != this.searchTerm) {
				this.onSchoolSelect.emit(null);
				this.searchTerm = input.searchText;
				this.Schools.search(`${input.searchText}`).subscribe(res => {
					this.autocompleteResults = res;
				});
			}
		});
	}

	onSchoolSelected(event):void{
		this.onSchoolSelect.emit(event.option.value);
	}

	showSchoolName(school: School): any {
		return school ? school.getName() : school;
	}
}
