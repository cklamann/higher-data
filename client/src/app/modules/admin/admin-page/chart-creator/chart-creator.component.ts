import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth.service';
import { intChartModel } from '../../../../../../server/src/schemas/ChartSchema';
import { Charts } from '../../../../models/Charts';

@Component({
	selector: 'app-chart-creator',
	templateUrl: './chart-creator.component.html',
	styleUrls: ['./chart-creator.component.scss']
})
export class ChartCreatorComponent implements OnInit {

	chartBuilderForm: FormGroup;
	chartTypes: string[];
	chartCategories: string[];
	chartValueTypes: string[];
	showChartSearch: boolean = false;

	constructor(private fb: FormBuilder, private auth: AuthService, private Charts: Charts) {

	}

	//todo: once chart search is emitting values, listen for them here and populate form with them on change

	ngOnInit() {
		this.createForm();
		this.chartTypes = this.mockTypes();
		this.chartCategories = this.mockCategories();
		this.chartValueTypes = this.mockValueTypes();
	}

	private mockTypes() {
		return ['line', 'bar', 'area'];
	}

	private mockCategories() {
		return ['Enrollment', 'Finance', 'Teaching'];
	}

	private mockValueTypes() {
		return ['currency', 'percentage', 'integer'];
	}

	createForm() {
		this.chartBuilderForm = this.fb.group({
			name: ['', [Validators.minLength(3), Validators.required]],
			description: ['', [Validators.minLength(3), Validators.required]],
			type: ['', [Validators.minLength(3), Validators.required]],
			category: ['', [Validators.minLength(3), Validators.required]],
			active: ['', [Validators.minLength(3), Validators.required]],
			valueType: ['', [Validators.minLength(3), Validators.required]],
			slug: ['', [Validators.minLength(3), Validators.required]],
			variables: this.fb.array([
				this.initVariable()
			])
		});
	}

	initVariable() {
		return this.fb.group({
			notes: ['', [Validators.minLength(3), Validators.required]],
			formula: ['', [Validators.minLength(3), Validators.required]],
			legendName: ['', [Validators.minLength(3), Validators.required]]
		});
	}

	addVariable() {
		const control = <FormArray>this.chartBuilderForm.controls['variables'];
		control.push(this.initVariable());
	}

	removeVariable(i: number) {
		const control = <FormArray>this.chartBuilderForm.controls['variables'];
		control.removeAt(i);
	}

	onSubmit() {
		return this.Charts.save(this.chartBuilderForm.value).subscribe();
	}

	toggleChartSearch(): void {
		this.showChartSearch = !this.showChartSearch;
	}

}
