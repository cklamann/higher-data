import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { VariableDefinitions } from '../../../../models/VariableDefinitions'
import { intVariableDefinitionModel, intVariableDefinitionSchema } from '../../../../../../server/src/schemas/VariableDefinitionSchema';
import { Charts } from '../../../../models/Charts';
import { VariableSelectComponent } from '../../../shared/variable-select/variable-select.component';
import * as _ from 'lodash';

@Component({
	selector: 'app-variable-definer',
	templateUrl: './variable-definer.component.html',
	styleUrls: ['./variable-definer.component.scss']
})
export class VariableDefinerComponent implements OnInit {

	variableDefinitionForm: FormGroup;

	constructor(private fb: FormBuilder, private variableDefinitions: VariableDefinitions) {

	}

	ngOnInit() {
		this.createForm();
		//load in all variables, listen for changes -- when the change happens, fetch definition and load in form
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
		this.variableDefinitionForm.patchValue({
			variable: variable
		});

		this.variableDefinitions.fetchByName(variable)
			.subscribe( varDef => {
				if(varDef){
					//fill out form
				}
			})




		//hmmm... seems like the cleanest way to do this is to first initialize all the arrays with validators
		//by wiping out current .variables, then pushing in chart.variables.length number of variables with addVariable()
		//then, i think, could just do a straight up this.chartBuilderForm.setValue(chart) and be done, since the
		//variable array size would now match!
		// const sources = variableDefinition.sources.map(source => this.fb.group(source)),
		// 	sourceFormArray = this.fb.array(sources);
		// this.variableDefinitionForm.setControl('sources', sourceFormArray);
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
