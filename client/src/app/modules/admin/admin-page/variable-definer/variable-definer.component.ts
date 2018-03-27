import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { VariableDefinitions } from '../../../../models/VariableDefinitions'
import { intVariableDefinitionModel, intVariableDefinitionSchema } from '../../../../../../server/src/schemas/VariableDefinitionSchema';
import { Charts } from '../../../../models/Charts';
import { VariableDefinitionSelectComponent } from '../../../shared/variable-definition-select/variable-definition-select.component';
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

	//todo: add Friendly Name, Category, and better Type field (that corresponds to chartVariable type)	
	//store Categories in db, select from dropdown

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
				})
			})
	}

	onVariableDefinitionSelect(variable: intVariableDefinitionModel): void {
		this.variable = variable.variable;
		this.variableDefinitionForm.patchValue({
			variable: variable,
			_id: '',
			type: ''
		});
		const control = <FormArray>this.variableDefinitionForm.controls['sources'],
			limit = _.clone(control.length);
		for (let i = 0; i < limit; i++) {
			control.removeAt(0);
		}
		this.variableDefinitions.fetchByName(variable.variable)
			.subscribe(varDef => {
				if (varDef) {
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
		if (!this.variable) return;
		const schoolSlug = this.school ? this.school.slug : 'northwestern-university-147767';
		this.ChartService.fetchChartByVariable(this.variable, schoolSlug)
			.subscribe(res => {
				this.chartData = res;
			});
	}
}