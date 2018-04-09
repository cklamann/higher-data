import { Component, OnInit, Output, Input, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
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
	defaultModel: School;

	@Output()
	onSchoolSelect: EventEmitter<intSchoolModel | null> = new EventEmitter<intSchoolModel | null>();

	constructor(private fb: FormBuilder, private Schools: Schools) {
		this.createForm();
	}

	ngOnInit() {
		this.listenForSearchChanges();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.defaultModel.currentValue) {
			this.searchForm.patchValue({
				searchText: changes.defaultModel.currentValue
			});
		}
	}

	createForm() {
		this.searchForm = this.fb.group({
			searchText: ['', [Validators.minLength(3), Validators.required]],
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

	onSchoolSelected(event): void {
		this.onSchoolSelect.emit(event.option.value);
	}

	showSchoolName(school: School): any {
		return school ? school.getName() : school;
	}
}
