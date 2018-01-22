import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
	selector: 'app-chart-creator',
	templateUrl: './chart-creator.component.html',
	styleUrls: ['./chart-creator.component.scss']
})
export class ChartCreatorComponent implements OnInit {

	chartBuilderForm: FormGroup;
	constructor(private fb: FormBuilder, private auth: AuthService) {
		this.createForm();
	}

	ngOnInit(){
		
	}

	createForm() {
		this.chartBuilderForm = this.fb.group({
			chartName: ['', [Validators.minLength(3), Validators.required]],
			chartDescription: ['', [Validators.minLength(3), Validators.required]],
			variables: this.fb.array([
				this.initVariable()
			])
		});
	}

	initVariable() {
		return this.fb.group({
			name: ['', [Validators.minLength(3), Validators.required]],
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

}
