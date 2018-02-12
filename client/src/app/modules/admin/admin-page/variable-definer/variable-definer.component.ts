import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { VariableDefinitions } from '../../../../models/VariableDefinitions'
import { intVariableDefinitionModel, intVariableDefinitionSchema } from '../../../../../../server/src/schemas/VariableDefinitionSchema';
import { Charts } from '../../../../models/Charts';
import { VariableSelectComponent } from '../../../shared/variable-select/variable-select.component';
import { ChartService } from '../../../chart/ChartService.service';
import { intSchoolModel } from '../../../../../../server/src/schemas/SchoolSchema';
import { intChartExport } from '../../../../../../server/src/models/ChartExporter';
import * as _ from 'lodash';

@Component({
	selector: 'app-variable-definer',
	templateUrl: './variable-definer.component.html',
	styleUrls: ['./variable-definer.component.scss']
})
export class VariableDefinerComponent implements OnInit {

	variableDefinitionForm: FormGroup;
	school: intSchoolModel;
	chartData: intChartExport;
	variable: string;
	chartOverrides: object = {
		widthRatio: .75
	}

	constructor(private fb: FormBuilder,
		private variableDefinitions: VariableDefinitions,
		private ChartService: ChartService) {

	}

	ngOnInit() {
		this.createForm();
	}

	createForm() {
		this.variableDefinitionForm = this.fb.group({
			_id: '',
			variable: ['', [Validators.minLength(3), Validators.required]],
			type: ['', [Validators.minLength(3), Validators.required]],
			sources: this.fb.array([
				this.initSource()
			])
		});
	}

	initSource(variable: any = null) {
		return this.fb.group({
			startYear: ['', [Validators.minLength(3), Validators.required]],
			endYear: ['', [Validators.minLength(3), Validators.required]],
			source: ['', [Validators.minLength(3), Validators.required]],
			table: ['', [Validators.minLength(3), Validators.required]],
			formula: ['', [Validators.minLength(3), Validators.required]],
			definition: ['', [Validators.minLength(3), Validators.required]],
			notes: ['', [Validators.minLength(3), Validators.required]],
			_id: '',
		});
	}

	addSource() {
		const control = <FormArray>this.variableDefinitionForm.controls['sources'];
		control.push(this.initSource());
	}

	removeVariable(i: number) {
		const control = <FormArray>this.variableDefinitionForm.controls['sources'];
		control.removeAt(i);
	}

	onSubmit() {
		let formContent = _stripEmptyIds(this.variableDefinitionForm.value);
		return this.variableDefinitions.save(this.variableDefinitionForm.value).subscribe();
	}

	onVariableSelect(variable: string): void {
		this.variable = variable;
		this.variableDefinitionForm.patchValue({
			variable: variable
		});
		const control = <FormArray>this.variableDefinitionForm.controls['sources'],
			limit = _.clone(control.length);
		for (let i = 0; i < limit; i++) {
			control.removeAt(0);
		}
		this.variableDefinitions.fetchByName(variable)
			.subscribe(varDef => {
				if (varDef) {
					varDef.sources.forEach(variable => this.addSource());
					this.variableDefinitionForm.setValue(varDef);
				}
			})
		this._loadChart();
	}

	onSchoolSelect(school: intSchoolModel) {
		this.school = school;
		this._loadChart();
	}

	private _loadChart() {
		if (!this.variable) return;
		const schoolSlug = this.school ? this.school.slug : 'northwestern-university-147767';
		this.ChartService.fetchVariablePreview(this.variable, schoolSlug)
			.subscribe(res => {
				this.chartData = res;
			});
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
