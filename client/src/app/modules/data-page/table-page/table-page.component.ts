import { Component, OnInit } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, PageEvent} from '@angular/material';
import { intSchoolVarExport, intVariableQueryConfig, intVarExport, intVariableAggQueryConfig, intVarAggItem } from '../../../../../server/src/schemas/SchoolSchema';
import { RestService } from '../../../services/rest/rest.service';
import { Schools } from '../../../models/Schools';
import { Observable } from 'rxjs';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { UtilService } from '../../../services/util/util';
import { VariableDataSource, intOutputData } from '../../../services/variableDataSource/variableDataSource'
	; import * as _ from 'lodash';

import 'rxjs/add/operator/map';

@Component({
	selector: 'app-table-page',
	templateUrl: './table-page.component.html',
	styleUrls: ['./table-page.component.scss']
})

export class TablePageComponent implements OnInit {

	matTableDataSource = new MatTableDataSource<intOutputData>(); //todo: transform pagination, etc and type
	queryParams: intVariableQueryConfig | intVariableAggQueryConfig;
	tableOptionsForm: FormGroup;
	visibleColumns: string[] = [];
	showTable = false;
	private _columns: string[] = [];
	private _columnIndex: number = 0;
	private _tableOptionsVisible: boolean = false;
	constructor(private schools:Schools, private fb: FormBuilder, private util: UtilService) {
		//todo: configure datasource accessors here
		//https://github.com/angular/material2/blob/master/src/demo-app/table/table-demo.ts#L71
	}

	//todo: for the time being, get rid of the school select altogether, allow for just one variable
	//selected, that way we know how to format it (stored in ui) -- then if they want to limit it, they can filter by schools
	//in the future, we will allow composition through custom formulas

	ngOnInit() {
		this._createOptionsForm();
	}

	_createOptionsForm() {
		this.tableOptionsForm = this.fb.group({
			matches: this.fb.array([]),
			sort: 'fiscal_year',
			pagination: this.fb.group({
				page: 1,
				perPage: 25
			}),
			groupBy: this.fb.group({
				aggFunc: '',
				aggFuncName: '',
				variable: '',
			}),
			inflationAdjusted: "false",
			variables: this.fb.array([])
		})
	}

	getTableOptionsVisible() {
		return this._tableOptionsVisible;
	}

	getTableIsCurrency() {
		return true; //todo: figure out -- snag from variable
	}

	toggleTableOptionsVisible() {
		this._tableOptionsVisible = !this._tableOptionsVisible;
	}

	onInflationChange($event) {
		console.log($event);
	}

	setVariables($event) {
		this.tableOptionsForm.controls['variables'].reset();
		this.tableOptionsForm.controls['variables'].value.push($event.variable);
		this.query();
	}

	getIsAggQuery() {
		return false;
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
		if (this.tableOptionsForm.controls['variables'].value.length > 0) {
			const query = this.getIsAggQuery() ? this.schools.aggregateQuery(this.tableOptionsForm.value) : this.schools.fetchWithVariables(this.tableOptionsForm.value);
			query
				.map((res: intVarExport) => {
					return new VariableDataSource(res);
				})
				.debounceTime(500)
				.subscribe(resp => {
					//don't set paginator on table source, use template instead, since query controls it
					if (!_.isEmpty(resp.export().data)) {
						this.matTableDataSource.data = resp.export().data; 
						this._columns = resp.getColumns();
						this.setVisibleColumns();
						this.showTable = true;
					}
				});
		}
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
