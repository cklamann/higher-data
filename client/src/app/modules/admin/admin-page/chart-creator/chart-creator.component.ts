import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { intChartModel, intChartSchema } from '../../../../../../server/src/schemas/ChartSchema';
import { Charts } from '../../../../models/Charts';
import { VariableSelectComponent } from '../../../shared/variable-select/variable-select.component';
import * as _ from 'lodash';

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

	constructor(private fb: FormBuilder, private Charts: Charts) {

	}

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
			_id: '',
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

	initVariable(variable: any = null) {
		return this.fb.group({
			notes: ['', [Validators.minLength(3), Validators.required]],
			formula: ['', [Validators.minLength(3), Validators.required]],
			legendName: ['', [Validators.minLength(3), Validators.required]],
			_id: '',
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
		let formContent = _stripEmptyIds(this.chartBuilderForm.value);
		return this.Charts.save(this.chartBuilderForm.value).subscribe();
	}


	toggleChartSearch(): void {
		this.showChartSearch = !this.showChartSearch;
	}

	onChartSelect(chart: intChartSchema): void {
		this.chartBuilderForm.reset();
		const control = <FormArray>this.chartBuilderForm.controls['variables'],
			limit = _.clone(control.length);
		for (let i = 0; i < limit; i++) {
			control.removeAt(0);
		}
		chart.variables.forEach(variable => this.addVariable());
		this.chartBuilderForm.setValue(chart);
	}

	onVariableSelect(variable: string, i: number): void {
		let control = <FormArray>this.chartBuilderForm.controls['variables'];
		control.at(i).patchValue({ formula: control.at(i).value.formula + " " + variable });
	}

}

//private helpers --> todo: move to utility class
let _stripEmptyIds = function(model: any): any {
	_.forEach(model, (item, key, parent) => {
		if (_.isArray(item)) {
			item.forEach(val => _stripEmptyIds(val));
		}
		if (key === "_id" && item == "") {
			delete parent[key];
		}
		return model;
	});
}