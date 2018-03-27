import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatPaginator, MatSort, MatTableDataSource, PageEvent } from '@angular/material';
import { intSchoolVarExport, intVariableQueryConfig, intVarExport, intVariableAggQueryConfig, intVarAggItem } from '../../../../../server/src/schemas/SchoolSchema';
import { RestService } from '../../../services/rest/rest.service';
import { Schools } from '../../../models/Schools';
import { Observable } from 'rxjs';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { UtilService } from '../../../services/util/util';
import { VariableDataSource, intOutputData } from '../../../services/variableDataSource/variableDataSource';
import { states } from '../../../services/data/states';
import { sectors } from '../../../services/data/sectors';

import * as _ from 'lodash';
import 'rxjs/add/operator/map';

@Component({
	selector: 'app-table-page',
	templateUrl: './table-page.component.html',
	styleUrls: ['./table-page.component.scss'],
	animations: [
		//since neither state is tied to a state(), both styles will vanish when animation has run
		trigger('aggTypeSelected', [
			transition('* => *', [
				style({
					outline: 'thin #673ab7 solid',
					opacity: 1
				}),
				animate('250ms ease-in', style({
					outline: 'thin #673ab7 solid',
					opacity: 0
				}))
			])
		])
	]
})

export class TablePageComponent implements OnInit {

	groupByForm: FormGroup;
	isAggregateForm: FormGroup;
	matTableDataSource = new MatTableDataSource<intOutputData>();
	queryParams: intVariableQueryConfig | intVariableAggQueryConfig;
	sectors = sectors;
	showTable = false;
	states = states;
	tableOptionsForm: FormGroup;
	visibleColumns: string[] = [];
	private _columns: string[] = [];
	private _columnIndex: number = 0;
	private _tableOptionsVisible: boolean = false;
	private _variableType: string;
	constructor(private schools: Schools, private fb: FormBuilder, private util: UtilService) {
		//todo: configure datasource accessors here
		//https://github.com/angular/material2/blob/master/src/demo-app/table/table-demo.ts#L71
	}

	ngOnInit() {
		this._intializeForms();
		this._subscribeToForms();
	}

	_intializeForms() {
		this.groupByForm = this.fb.group({
			aggFunc: '',
			aggFuncName: '',
			variable: '',
		});

		this.tableOptionsForm = this.fb.group({
			matches: this.fb.array([]),
			sort: 'fiscal_year',
			pagination: this.fb.group({
				page: 1,
				perPage: 25
			}),
			groupBy: this.groupByForm,
			inflationAdjusted: "false",
			variables: this.fb.array([])
		})

		this.isAggregateForm = this.fb.group({
			isAggregate: false
		})
	}

	_subscribeToForms() {
		this.isAggregateForm.controls['isAggregate'].valueChanges.subscribe((isAgg: boolean) => {
			if (isAgg) {
				this.groupByForm.controls['aggFunc'].setValidators([Validators.required])
				this.groupByForm.controls['variable'].setValidators([Validators.required])
			} else {
				this.groupByForm.controls['aggFunc'].setValidators([Validators.nullValidator])
				this.groupByForm.controls['variable'].setValidators([Validators.nullValidator])
			}
		});
		this.tableOptionsForm.valueChanges.subscribe(form => {
			//have to double check with variables b/c custom validator not bubbling up working....
			console.log(form.variables);
			if (this.tableOptionsForm.valid && form.variables.length > 0) {
				this.query();
			}
		})
	}

	getTableOptionsVisible() {
		return this._tableOptionsVisible;
	}

	getVariableDefinitionSelected() {
		return this.tableOptionsForm.controls['variables'].value.length > 0;
	}

	getTableIsCurrency() {
		return this._variableType == "currency";
	}

	toggleTableOptionsVisible() {
		this._tableOptionsVisible = !this._tableOptionsVisible;
	}

	setVariable($event) {
		this._variableType = $event.type;
		let control = <FormArray>this.tableOptionsForm['controls'].variables;
		control.push(this.fb.group({
					variable: $event.variable
				}))
		console.log(this.tableOptionsForm.value);
	}

	getAggQueryIsSector() {
		return this.groupByForm.controls['variable'].value == 'sector';
	}

	getAggQueryIsState() {
		return this.groupByForm.controls['variable'].value == 'state';
	}

	getIsAggregate() {
		return this.isAggregateForm.controls['isAggregate'].value;
	}

	getLeftArrowVisible() {
		return this.visibleColumns[1] !== this._columns[1];
	}

	getRightArrowVisible() {
		return this.visibleColumns[this.visibleColumns.length - 1] !== this._columns[this._columns.length - 1];
	}

	shiftVisibleColumnsRight() {
		this._columnIndex++;
		this.setVisibleColumns();
	}

	shiftVisibleColumnsLeft() {
		this._columnIndex--;
		this.setVisibleColumns();
	}

	query() {
		let input = this.tableOptionsForm.value;
		input.variables = input.variables.map(variable => variable.variable);
		const query = this.getIsAggregate() ? this.schools.aggregateQuery(this.tableOptionsForm.value) : this.schools.fetchWithVariables(this.tableOptionsForm.value);
		query
			.map((res: intVarExport) => {
				return new VariableDataSource(res);
			})
			.debounceTime(500)
			.subscribe(resp => {
				if (!_.isEmpty(resp.export().data)) {
					this.matTableDataSource.data = resp.export().data;
					this._columns = resp.getColumns();
					this.setVisibleColumns();
					this.showTable = true;
				}
			});
	}

	setVisibleColumns() {
		let numCols = 5;
		this.visibleColumns = [];
		if (this._columnIndex > 0) {
			this.visibleColumns.push(this._columns[0]);
			numCols--;
		}
		for (let i = this._columnIndex; i <= numCols + this._columnIndex; i++) {
			this.visibleColumns.push(this._columns[i]);
		}
	}

}
