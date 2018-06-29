import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { VariableDefinitions } from '../../../../models/VariableDefinitions'
import { intVariableDefinitionModel, intVariableDefinitionSchema } from '../../../../../../server/src/schemas/VariableDefinitionSchema';
import { Charts } from '../../../../models/Charts';
import { Categories } from '../../../../models/Categories';
import { VariableDefinitionSelectComponent } from '../../../shared/variable-definition-select/variable-definition-select.component';
import { intSchoolModel } from '../../../../../../server/src/schemas/SchoolSchema';
import { intChartExport } from '../../../../../../server/src/models/ChartExporter';
import { UtilService } from '../../../../services/util/util';
import * as _ from 'lodash';

@Component({
	selector: 'app-variable-definer',
	templateUrl: './variable-definer.component.html',
	styleUrls: ['./variable-definer.component.scss'],
})
export class VariableDefinerComponent implements OnInit {

	variableDefinitionForm: FormGroup;
	school: intSchoolModel;
	chartData: intChartExport;
	chartOverrides: object = {
		widthRatio: .75
	}
	valueTypes: string[] = this._getValueTypes();
	categories: string[];

	constructor(private fb: FormBuilder,
		private variableDefinitions: VariableDefinitions,
		private util: UtilService,
		private cats: Categories,
		private Charts: Charts) {
		this.cats.fetch('variable')
			.subscribe(res => this.categories = res.categories);
	}

	ngOnInit() {
		this.createForm();
	}

	createForm() {
		this.variableDefinitionForm = this.fb.group({
			_id: '',
			variable: ['', [Validators.minLength(3), Validators.required]],
			valueType: ['', [Validators.minLength(3), Validators.required]],
			friendlyName: ['', [Validators.minLength(3), Validators.required]],
			category: ['', [Validators.minLength(3), Validators.required]],
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
		this.variableDefinitions.save(this.variableDefinitionForm.value)
			.subscribe(res => {
				this.variableDefinitionForm.patchValue({
					_id: res._id
				});
			});
	}

	onVariableSelect(variable: string): void {
		this.variableDefinitionForm.patchValue({
			variable: variable,
			_id: '',
			valueType: '',
			friendlyName: '',
			category: '',
		});
		const control = <FormArray>this.variableDefinitionForm.controls['sources'],
			limit = _.clone(control.length);
		for (let i = 0; i < limit; i++) {
			control.removeAt(0);
		}
		this.variableDefinitions.fetchByName(variable)
			.subscribe(varDef => {
				if (varDef.length > 0) {
					varDef[0].sources.forEach(variable => this.addSource());
					this.variableDefinitionForm.setValue(varDef[0]);
				}
			})
		this._loadChart();
	}

	onSchoolSelect(school: intSchoolModel) {
		this.school = school;
		this._loadChart();
	}

	private _loadChart() {
		if (!this.variableDefinitionForm.value.variable) return;
		const name = this.school ? this.school.name : 'Northwestern University';
		this.Charts.fetchChartByVariable(this.variableDefinitionForm.value.variable, name)
			.subscribe(res => {
				this.chartData = res;
			});
	}

	private _getValueTypes() {
		const formatters = this.util.numberFormatter().getFormats().map(formatter => formatter.name);
		return _.values(formatters);
	}
}