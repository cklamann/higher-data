import { Component, OnInit, QueryList, Output, Input, EventEmitter, OnChanges, SimpleChanges, ViewChildren} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect, MatOption } from '@angular/material';
import { VariableDefinitions } from '../../../models/VariableDefinitions';
import { intVariableDefinitionModel } from '../../../../../server/src/schemas/VariableDefinitionSchema';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';


@Component({
	selector: 'app-variable-definition-select',
	templateUrl: './variable-definition-select.component.html',
	styleUrls: ['./variable-definition-select.component.scss']
})
export class VariableDefinitionSelectComponent implements OnInit {
	VariableDefinitionSelectForm: FormGroup;
	@Output()
	onVariableDefinitionSelect: EventEmitter<string> = new EventEmitter<string>();
	@Input()
	defined: boolean = false;
	@Input()
	urlVariable: string = "";
	@Input()
	multi: boolean = false;
	@Input()
	selectMax: number;
	@ViewChildren(MatOption) options: QueryList<MatOption>;

	variables: intVariableDefinitionModel[] = [];

	constructor(private fb: FormBuilder, private VariableDefinitions: VariableDefinitions) {
		
	}

	ngOnInit() {
		this.createForm();
		this.VariableDefinitions.fetchAll(this.defined)
			.switchMap(res => {
				this.variables = res;
				return this.options.changes;
			})
			.first()//we are only interested in the initial values
			.subscribe(change => {
				if (change.length) {
					change.forEach(option => {
						if (option.value && this.urlVariable && option.value.variable == this.urlVariable) {
							//avoid viewsetaftercheck error
							//todo: replace with better solution once angular solves it
							setTimeout(() => {
								option['_selectViaInteraction']();
							});

						}
					});
				}
			});
		this.listenForSelectChanges();
	}

	createForm() {
		this.VariableDefinitionSelectForm = this.fb.group({
			variable: [''],
		});
	}

	listenForSelectChanges(): void {
		this.VariableDefinitionSelectForm.valueChanges
			.subscribe(change => {
				if (this.multi && this.selectMax && change.variable.length >= this.selectMax) {
					this.options.forEach(option => {
						if(!option.selected){
							option.disabled = true;
						}
					})
				} else this.options.forEach(option => option.disabled = false);
			})

		this.VariableDefinitionSelectForm.valueChanges.debounceTime(500).subscribe(input => {
			this.onVariableDefinitionSelect.emit(input.variable);
		});
	}

}