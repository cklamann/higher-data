import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Schools, School } from '../../../models/Schools';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';

//todo: export selected model into parent directive

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
	constructor(private fb: FormBuilder, private Schools: Schools) {
		this.createForm();
	}

	ngOnInit() {
		this.listenForSearchChanges(); //register even
	}

	createForm() {
		this.searchForm = this.fb.group({
			searchText: ['', [Validators.minLength(3), Validators.required]],
		});
	}

	listenForSearchChanges(): void {
		this.searchForm.valueChanges.debounceTime(500).subscribe(input => {
			if (input.searchText.length > 3 && input.searchText != this.searchTerm) {
				this.searchTerm = input.searchText;
				this.Schools.search(`${input.searchText}`).subscribe(res => {
					this.autocompleteResults = res;
				});
			}
		});
	}

	showSchoolName(school: School): any {
		return school ? school.getName() : school;
	}
}
