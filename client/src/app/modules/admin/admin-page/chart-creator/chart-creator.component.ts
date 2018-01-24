import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth.service';
import { intChartSchema } from '../../../../../../server/src/schemas/ChartSchema';

@Component({
	selector: 'app-chart-creator',
	templateUrl: './chart-creator.component.html',
	styleUrls: ['./chart-creator.component.scss']
})
export class ChartCreatorComponent implements OnInit {

	chartBuilderForm: FormGroup;
	charts: Array<intChartSchema>;
	chartTypes: Array<string>;
	chartCategories: Array<string>;
	chartValueTypes: Array<string>;

	constructor(private fb: FormBuilder, private auth: AuthService) {

	}

	ngOnInit(){
		this.createForm();
		this.chartTypes = this.mockTypes();
		this.chartCategories = this.mockCategories();
		this.chartValueTypes = this.mockValueTypes();
	}

	private mockTypes(){
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
		//send form to backend route that does not exist yet
	}

	fetch() {
		//get all the charts and populate dropdown with them		
	}

}
