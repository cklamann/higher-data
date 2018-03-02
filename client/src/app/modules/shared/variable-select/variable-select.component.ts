import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material';
import { VariableDefinitions } from '../../../models/VariableDefinitions';
import { intVariableDefinitionModel } from '../../../../../server/src/schemas/VariableDefinitionSchema';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';


@Component({
	selector: 'app-variable-select',
	templateUrl: './variable-select.component.html',
	styleUrls: ['./variable-select.component.scss']
})
export class VariableSelectComponent implements OnInit {
	variableSelectForm: FormGroup;
	@Output()
	onVariableSelect: EventEmitter<string> = new EventEmitter<string>();
	@Input()
	defined: boolean = false;

	variables: intVariableDefinitionModel[] = [];

	constructor(private fb: FormBuilder, private VariableDefinitions: VariableDefinitions) {
		this.createForm();
	}

	ngOnInit() {
		this.VariableDefinitions.fetchAll(this.defined)
			.subscribe(variables => {
				this.variables = variables;
			});
		this.listenForSelectChanges();
	}

	createForm() {
		this.variableSelectForm = this.fb.group({
			variable: [''],
		});
	}

	listenForSelectChanges(): void {
		this.variableSelectForm.valueChanges.debounceTime(500).subscribe(input => {
			this.onVariableSelect.emit(input.variable);
		});
	}

}
