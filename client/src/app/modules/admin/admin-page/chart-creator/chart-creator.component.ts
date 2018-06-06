import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { intChartModel, intChartSchema } from '../../../../../../server/src/schemas/ChartSchema';
import { intVariableDefinitionModel } from '../../../../../../server/src/schemas/VariableDefinitionSchema';
import { Charts } from '../../../../models/Charts';
import { Categories } from '../../../../models/Categories';
import { VariableDefinitionSelectComponent } from '../../../shared/variable-definition-select/variable-definition-select.component';
import { intSchoolModel } from '../../../../../../server/src/schemas/SchoolSchema';
import { intChartExport } from '../../../../../../server/src/models/ChartExporter';
import { UtilService } from '../../../../services/util/util';

import * as _ from 'lodash';

@Component({
	selector: 'app-chart-creator',
	templateUrl: './chart-creator.component.html',
	styleUrls: ['./chart-creator.component.scss']
})
export class ChartCreatorComponent implements OnInit {

	chartBuilderForm: FormGroup;
	chartCategories: string[];
	chartData: intChartExport;
	chartOverrides: object = {
		widthRatio: .75
	}
	chartTypes: string[];
	chartValueTypes: string[];
	school: intSchoolModel;
	showChartSearch: boolean = false;

	constructor(private Categories: Categories,
		private fb: FormBuilder,
		private Charts: Charts,
		private util: UtilService) { }

	ngOnInit() {
		this.createForm();
		this.chartTypes = this._mockTypes();
		this.Categories.fetch('chart').subscribe(cats => this.chartCategories = cats.categories);
		this.chartValueTypes = this._getValueTypes();
	}

	addCut() {
		const control = <FormArray>this.chartBuilderForm.controls['cuts'];
		control.push(this.initCut());
	}
	
	addVariable() {
		const control = <FormArray>this.chartBuilderForm.controls['variables'];
		control.push(this.initVariable());
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
			slug: ['', [Validators.minLength(3)]],
			variables: this.fb.array([], this._arrayLengthValidator(1)),
			cuts: this.fb.array([])
		});
	}

	deleteChart() {
		return this.Charts.delete(this.chartBuilderForm.value._id)
			.subscribe(() => {
				this.chartBuilderForm.reset();
			})
	}

	getPreview() {
		this._loadChart();
	}

	initCut() {
		return this.fb.group({
			name: ['', [Validators.minLength(3)]],
			formula: ['', [Validators.minLength(3)]]
		});
	}

	initVariable() {
		return this.fb.group({
			notes: ['', [Validators.minLength(3), Validators.required]],
			formula: ['', [Validators.minLength(3), Validators.required]],
			legendName: ['', [Validators.minLength(3), Validators.required]]
		});
	}

	onChartSelect(chart: intChartSchema): void {
		this.chartBuilderForm.reset();
		const vari = <FormArray>this.chartBuilderForm.controls['variables'],
			vlimit = _.clone(vari.length);
		for (let i = 0; i < vlimit; i++) {
			vari.removeAt(0);
		}
		const cut = <FormArray>this.chartBuilderForm.controls['cuts'],
			climit = _.clone(cut.length);
		for (let i = 0; i < climit; i++) {
			cut.removeAt(0);
		}
		chart.variables.forEach(variable => this.addVariable());
		chart.cuts.forEach(variable => this.addCut());
		this.chartBuilderForm.setValue(this.util.boolToString(chart));
	}
	
	onCutVariableSelect(variable: intVariableDefinitionModel, i: number): void {
		let control = <FormArray>this.chartBuilderForm.controls['cuts'];
		control.at(i).patchValue({ formula: control.at(i).value.formula + " " + variable.variable });
	}

	onVariableDefinitionSelect(variable: intVariableDefinitionModel, i: number): void {
		let control = <FormArray>this.chartBuilderForm.controls['variables'];
		control.at(i).patchValue({ formula: control.at(i).value.formula + " " + variable.variable });
	}

	onSchoolSelect(school: intSchoolModel) {
		this.school = school;
		this._loadChart();
	}

	onSubmit() {
		const transformed = <intChartModel>this.util.stringToBool(_.cloneDeep(this.chartBuilderForm.value));
		return this.Charts.save(transformed)
			.subscribe(res => {
				this.chartBuilderForm.patchValue({
					_id: res._id
				})
			});
	}

	removeCut(i: number) {
		const control = <FormArray>this.chartBuilderForm.controls['cuts'];
		control.removeAt(i);
	}
	
	removeVariable(i: number) {
		const control = <FormArray>this.chartBuilderForm.controls['variables'];
		control.removeAt(i);
	}

	toggleChartSearch(): void {
		this.showChartSearch = !this.showChartSearch;
	}

	private _arrayLengthValidator(length:number): ValidatorFn {
		return (control: AbstractControl): { [key: string]: any } => {
			return control.value.length === 0 ? { 'emptyArray': { value: control.value } } : null;
		};
	}
	
	private _getValueTypes() {
		return this.util.numberFormatter().getFormats().map(formatter => formatter.name);
	}
	
	private _loadChart() {
		if (this.chartBuilderForm.valid && this.school) {
			this.Charts.fetchChartPreview(this.school, this.chartBuilderForm.value)
				.subscribe(res => this.chartData = res);
		}
	}
	
	private _mockTypes() {
		return ['line', 'bar', 'area'];
	}

}