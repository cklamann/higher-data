import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { intChartModel, intChartSchema } from '../../../../../../server/src/schemas/ChartSchema';
import { intVariableDefinitionModel } from '../../../../../../server/src/schemas/VariableDefinitionSchema';
import { Charts } from '../../../../models/Charts';
import { VariableDefinitionSelectComponent } from '../../../shared/variable-definition-select/variable-definition-select.component';
import { intSchoolModel } from '../../../../../../server/src/schemas/SchoolSchema';
import { intChartExport } from '../../../../../../server/src/models/ChartExporter';
import { ChartService } from '../../../chart/ChartService.service';
import { UtilService } from '../../../../services/util/util';

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
	school: intSchoolModel;
	chartData: intChartExport;
	chartOverrides: object = {
		widthRatio: .75
	}

	constructor(private fb: FormBuilder,
		private Charts: Charts,
		private ChartService: ChartService,
		private util: UtilService) { }

	ngOnInit() {
		this.createForm();
		this.chartTypes = this.mockTypes();
		this.chartCategories = this.mockCategories();
		this.chartValueTypes = this.getValueTypes();
	}

	private mockTypes() {
		return ['line', 'bar', 'area'];
	}

	private mockCategories() {
		return ['Enrollment', 'Finance', 'Teaching'];
	}

	private getValueTypes() {
		const formatters = this.util.numberFormatter().getFormats().map(formatter => formatter.name);
		return _.values(formatters);
	}

	private arrayLengthValidator(length:number): ValidatorFn {
		return (control: AbstractControl): { [key: string]: any } => {
			console.log(control.value);
			return control.value.length === 0 ? { 'emptyArray': { value: control.value } } : null;
		};
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
			variables: this.fb.array([], this.arrayLengthValidator(1)),
			cuts: this.fb.array([])
		});
	}

	initVariable() {
		return this.fb.group({
			notes: ['', [Validators.minLength(3), Validators.required]],
			formula: ['', [Validators.minLength(3), Validators.required]],
			legendName: ['', [Validators.minLength(3), Validators.required]]
		});
	}

	initCut() {
		return this.fb.group({
			name: ['', [Validators.minLength(3)]],
			formula: ['', [Validators.minLength(3)]]
		});
	}

	addVariable() {
		const control = <FormArray>this.chartBuilderForm.controls['variables'];
		control.push(this.initVariable());
	}

	addCut() {
		const control = <FormArray>this.chartBuilderForm.controls['cuts'];
		control.push(this.initCut());
	}

	deleteChart() {
		return this.Charts.delete(this.chartBuilderForm.value._id)
			.subscribe(() => {
				this.chartBuilderForm.reset();
			})
	}

	removeVariable(i: number) {
		const control = <FormArray>this.chartBuilderForm.controls['variables'];
		control.removeAt(i);
	}

	removeCut(i: number) {
		const control = <FormArray>this.chartBuilderForm.controls['cuts'];
		control.removeAt(i);
	}

	onSubmit() {
		return this.Charts.save(this.chartBuilderForm.value)
			.subscribe(res => {
				this.chartBuilderForm.patchValue({
					_id: res._id
				})
			});
	}

	toggleChartSearch(): void {
		this.showChartSearch = !this.showChartSearch;
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
		this.chartBuilderForm.setValue(chart);
	}

	onVariableDefinitionSelect(variable: intVariableDefinitionModel, i: number): void {
		let control = <FormArray>this.chartBuilderForm.controls['variables'];
		control.at(i).patchValue({ formula: control.at(i).value.formula + " " + variable.variable });
	}

	onCutVariableSelect(variable: intVariableDefinitionModel, i: number): void {
		let control = <FormArray>this.chartBuilderForm.controls['cuts'];
		control.at(i).patchValue({ formula: control.at(i).value.formula + " " + variable.variable });
	}

	getPreview() {
		this._loadChart();
	}

	onSchoolSelect(school: intSchoolModel) {
		this.school = school;
		this._loadChart();
	}

	private _loadChart() {
		if (this.chartBuilderForm.valid && this.school) {
			this.ChartService.fetchChartPreview(this.school, this.chartBuilderForm.value)
				.subscribe(res => this.chartData = res);
		}
	}

}