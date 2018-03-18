import { Component, OnInit } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, PageEvent } from '@angular/material';
import { intSchoolVarExport, intVariableQueryConfig, intVarAggItem } from '../../../../../server/src/schemas/SchoolSchema';
import { RestService } from '../../../services/rest/rest.service';
import { Schools } from '../../../models/Schools';
import { Observable } from 'rxjs';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

import 'rxjs/add/operator/map';

@Component({
	selector: 'app-table-page',
	templateUrl: './table-page.component.html',
	styleUrls: ['./table-page.component.scss']
})
export class TablePageComponent implements OnInit {

	matTableDataSource: any = new MatTableDataSource<intVarAggItem[]>(); //todo: transform pagination, etc and type
	queryParams: intVariableQueryConfig;
	displayedColumns: string[] = [];
	tableOptionsForm: FormGroup;
	_tableOptionsVisible: boolean = false;
	constructor(private schools: Schools, private fb: FormBuilder) {
		//todo: configure datasource accessors here
		//https://github.com/angular/material2/blob/master/src/demo-app/table/table-demo.ts#L71
	}

	ngOnInit() {
		this.queryParams = {
			matches: {
				unitid: "147767" //hardcoded for now
			},
			sort: '-fiscal_year',
			pagination: {
				page: 1,
				perPage: 25
			},
			inflationAdjusted: "false",
			variables: []
		}
		this._createOptionsForm();
	}

	_createOptionsForm() {
		this.tableOptionsForm = this.fb.group({
			inflationAdjusted: ''
		});
	}

	getTableOptionsVisible() {
		return this._tableOptionsVisible;
	}

	getTableIsCurrency(){
		return true; //todo: figure out
	}

	toggleTableOptionsVisible(){
		this._tableOptionsVisible = !this._tableOptionsVisible;
	}

	onSchoolSelect($event) {
		console.log($event);
	}

	onInflationChange($event) {
		console.log($event);
	}

	setVariables($event) {
		this.queryParams.variables = $event.map(item => item.variable); //these are the displayColumns
		this.schools.fetchWithVariables(this.queryParams)
			.map(res => res) //todo: transform so pagination, etc fits what MatTableDataSource expects?
			.debounceTime(500)
			.subscribe(resp => {
				this.matTableDataSource.data(resp.data); //method expects an array of data to show in table -- but where does pagination stuff get set? Separate directive....
			})

	}

}
