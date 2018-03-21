import { Component, OnInit } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, PageEvent } from '@angular/material';
import { intSchoolVarExport, intVariableQueryConfig, intVariableAggQueryConfig, intVarAggItem } from '../../../../../server/src/schemas/SchoolSchema';
import { RestService } from '../../../services/rest/rest.service';
import { Schools } from '../../../models/Schools';
import { Observable } from 'rxjs';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import * as _ from 'lodash';

import 'rxjs/add/operator/map';

@Component({
	selector: 'app-table-page',
	templateUrl: './table-page.component.html',
	styleUrls: ['./table-page.component.scss']
})
export class TablePageComponent implements OnInit {

	/*

	Plan:

	Table has years as columns with arrows

	Two table view types:

	1) One variable, many schools (fetchWithVariables) -- in future compose with others -- "build your own formula")
	2) one variable, many schools (fetchAggregate) 

	then they decide if they want aggergate or not 

	no more multiselect

	*/

	matTableDataSource: any = new MatTableDataSource<intVarAggItem[]>(); //todo: transform pagination, etc and type
	queryParams: intVariableQueryConfig | intVariableAggQueryConfig;
	displayedColumns: string[] = [];
	tableOptionsForm: FormGroup;
	_tableOptionsVisible: boolean = false;
	constructor(private schools: Schools, private fb: FormBuilder) {
		//todo: configure datasource accessors here
		//https://github.com/angular/material2/blob/master/src/demo-app/table/table-demo.ts#L71
	}

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

		console.log(this.tableOptionsForm);
		console.log(this.tableOptionsForm.value);
		console.log(this.tableOptionsForm.controls['groupBy'].value);
		console.log(this.tableOptionsForm.controls['groupBy'].value.aggFunc);
	}

	getTableOptionsVisible() {
		return this._tableOptionsVisible;
	}

	getTableIsCurrency() {
		return true; //todo: figure out
	}

	toggleTableOptionsVisible() {
		this._tableOptionsVisible = !this._tableOptionsVisible;
	}

	onSchoolSelect($event) {
		if ($event) {
			let index = _.findIndex(this.tableOptionsForm.controls['matches'].value, (obj: any) => obj.key === "unitid");
			if (index > -1) {
				this.tableOptionsForm.controls['matches'].value[index].unitid = $event.unitid;
			} else {
				this.tableOptionsForm.controls['matches'].reset();
				this.tableOptionsForm.controls['matches'].value.push({ unitid: $event.unitid });
			}

			this.query();
		}
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

	query() {
		if (this.tableOptionsForm.controls['matches'].value.length > 0 && this.tableOptionsForm.controls['variables'].value.length > 0) {
			let query = this.getIsAggQuery() ? this.schools.aggregateQuery(this.tableOptionsForm.value) : this.schools.fetchWithVariables(this.tableOptionsForm.value);
			query
				.map(res => res) //todo: transform so pagination, etc fits what MatTableDataSource expects?
				.debounceTime(500)
				.subscribe(resp => {
					this.matTableDataSource.data(resp.data); //method expects an array of data to show in table -- but where does pagination stuff get set? Separate directive....
				})
		}

	}

}
