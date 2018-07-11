import { Component, OnInit, QueryList, Output, Input, EventEmitter, OnChanges, SimpleChanges, ViewChildren } from '@angular/core';
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
			.subscribe(change => {
				if (change.length) {
					change.forEach(option => {
						if (option.value && this.urlVariable && option.value.variable == this.urlVariable) {
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

	//todo: get rid of switchmap stuff and use this method everywhere
	updateForm(vari: string) {
		if (this.options.length === 0) {
			this.options.changes.first().subscribe(change => {
				change.forEach(option => {
					if (option.value && option.value.variable == vari) {
						setTimeout(() => {
							option['_selectViaInteraction']();
						});
					}
				});
			});
		} else {
			this.options.forEach(option => {
				if (option.value && option.value.variable == vari) {
					setTimeout(() => {
						option['_selectViaInteraction']();
					});
				}
			})
		};
	}

	listenForSelectChanges(): void {
		this.VariableDefinitionSelectForm.valueChanges
			.subscribe(change => {
				if (this.multi && this.selectMax && change.variable.length >= this.selectMax) {
					this.options.forEach(option => {
						if (!option.selected) {
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
