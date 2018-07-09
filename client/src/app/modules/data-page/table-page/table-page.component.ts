import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatPaginator, MatSort, MatTableDataSource, PageEvent, MatInput } from '@angular/material';
import { intExport, intExportAgg, intSchoolDataModel } from '../../../../../server/src/schemas/SchoolDataSchema';
import { intSchoolDataAggQuery } from '../../../../../server/src/modules/SchoolDataQuery.module';
import { RestService } from '../../../services/rest/rest.service';
import { Schools } from '../../../models/Schools';
import { Observable } from 'rxjs';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { UtilService } from '../../../services/util/util';
import { SchoolDataSource, SchoolDataSourceAgg, intVarDataSourceExport } from '../../../services/SchoolDataSource/SchoolDataSource';
import { intVariableDefinitionModel } from '../../../../../server/src/schemas/VariableDefinitionSchema';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ModalLoadingComponent } from '../../shared/modals/loading/loading.component';
import { ModalErrorComponent } from '../../shared/modals/error/error.component';
import * as _ from 'lodash';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';


interface intTableOptionsForm {
	searchBox: string,
	sort: {
		field: string,
		direction: string
	},
	pagination: {
		page: number,
		perPage: number
	},
	groupBy: {
		aggFunc: string,
		variable: string
	},
	inflationAdjusted: boolean,
	variable: string
}


@Component({
	selector: 'app-table-page',
	templateUrl: './table-page.component.html',
	styleUrls: ['./table-page.component.scss']
})

export class TablePageComponent implements OnInit {

	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('tableSort') tableSort: MatSort;

	isAggregateForm: FormGroup;
	matTableDataSource = new MatTableDataSource<intVarDataSourceExport>();
	selectedVariable: intVariableDefinitionModel;
	showTable = false;
	tableOptionsForm: FormGroup;
	visibleColumns: string[] = [];
	private _aggOptionsVisible: boolean = false;
	private _columns: string[] = [];
	private _columnIndex: number = 0;
	private _dataTotal: number = 0;
	private _tableOptionsVisible: boolean = false;

	constructor(private schools: Schools, private fb: FormBuilder, private util: UtilService,
		public dialog: MatDialog, private router: Router) {
	}

	ngOnInit() {
		this._intializeForms();
		this._subscribeToForms();
	}

	private _intializeForms() {

		this.isAggregateForm = this.fb.group({
			isAggregate: false
		});

		//todo: get rid of nested stuff -- unnecessary now that we're flattening it
		//rename fields to what be transformer expects, then just .toString them all

		this.tableOptionsForm = this.fb.group({
			searchBox: '',
			sort: {
				field: '',
				direction: ''
			},
			pagination: this.fb.group({
				page: 1,
				perPage: 10
			}, { validator: Validators.required }),
			groupBy: this.fb.group({
				aggFunc: null,
				variable: new FormControl('name', Validators.required)
			}),
			inflationAdjusted: false,
			variable: ''
		});
	}

	private _subscribeToForms() {

		this.isAggregateForm.valueChanges.subscribe(() => {
			this._updateGroupByFields();
			this._aggOptionsVisible = !this._aggOptionsVisible;
			this.tableOptionsForm.updateValueAndValidity();
		})

		this.tableOptionsForm.valueChanges
			.distinctUntilChanged((prev, curr) => this._onlyNameSearchChanged(prev, curr))
			.subscribe(change => this.query());
	}

	getDataTotal() {
		return this._dataTotal;
	}

	getAggOptionsVisible() {
		return this._aggOptionsVisible;
	}

	getLeftArrowVisible() {
		return this.visibleColumns[1] !== this._columns[1];
	}

	getRightArrowVisible() {
		return this.visibleColumns[this.visibleColumns.length - 1] !== this._columns[this._columns.length - 1];
	}

	getShowSearchBox() {
		return !!this.tableOptionsForm.get('variable') && !this.isAggregateForm.get('isAggregate');
	}

	getTableIsCurrency() {
		return /currency+./.test(this.selectedVariable.valueType);
	}

	getTableOptionsVisible() {
		return this._tableOptionsVisible;
	}

	getVariableDefinitionSelected() {
		return !!this.tableOptionsForm.controls['variable'];
	}

	goToVariableSource() {
		this.router.navigate(['data/sources/variables/' + this.selectedVariable.variable])
	}

	onMatSortChange($event) {
		let sort = {
			field: $event.active === "Name" ? "name" : $event.active,
			direction: $event.direction
		}

		this.tableOptionsForm.get('sort').patchValue(sort);
	}

	onPageEvent($event) {
		this.tableOptionsForm.get('pagination').patchValue({
			page: $event.pageIndex + 1,
			perPage: $event.pageSize,
			total: $event.length,
		});
	}

	openErrorDialog(): void {
		this.dialog.open(ModalErrorComponent, {
			panelClass: 'error-panel',
		});
	}

	openLoadingDialog(): void {
		this.dialog.open(ModalLoadingComponent, {
			disableClose: true
		});
	}

	query() {
		this._validateGroupByFields();
		if (!this.tableOptionsForm.valid) return;

		let queryString = this._transformQuery();

		this.openLoadingDialog();

		this.schools.fetchData(queryString)
			.map((res: any) => {
				if (this.isAggregateForm.get('isAggregate')) {
					return new SchoolDataSourceAgg(res, this.tableOptionsForm.value.groupBy.variable);
				} else return new SchoolDataSource(res, 'name');
			})
			.debounceTime(500)
			.subscribe(resp => {
				this.dialog.closeAll();
				if (!_.isEmpty(resp)) {
					this.matTableDataSource.data = this._formatValues(resp.export.data);
					this._dataTotal = resp.export.total;
					this._columns = resp.getColumns();
					this.setVisibleColumns();
					this.showTable = true;
				} else this.showTable = false;
			}, err => {
				this.dialog.closeAll();
				this.openErrorDialog();
				console.log(err)
			});
	}

	setVariable($event) {
		this.selectedVariable = $event;
		this.tableOptionsForm.get('variable').patchValue($event.variable)
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

	shiftVisibleColumnsRight() {
		this._columnIndex++;
		this.setVisibleColumns();
	}

	shiftVisibleColumnsLeft() {
		this._columnIndex--;
		this.setVisibleColumns();
	}

	toggleTableOptionsVisible() {
		this._tableOptionsVisible = !this._tableOptionsVisible;
	}

	private _formatValues(data: intVarDataSourceExport[]): intVarDataSourceExport[] {
		if (this.selectedVariable) {
			return data.map((item: intVarDataSourceExport) => {
				return _.forIn(item, (v, k, obj) => {
					if (_.toNumber(k) && _.toNumber(v)) {
						obj[k] = this.util.numberFormatter().format(v, this.selectedVariable.valueType);
					}
				});
			});
		} else return data;
	}

	//don't submit when user types something in the box, wait for button press
	private _onlyNameSearchChanged(prev: intTableOptionsForm, curr: intTableOptionsForm): boolean {
		const formBezMatch = [prev, curr].map(form => Object.entries(form))
			.map(pairs => pairs.filter(item => item[0] != 'searchBox'));

		return _.isEqual(formBezMatch[0], formBezMatch[1]);
	}

	private _transformQuery(): string {
		let qs = '',
			vals = this.tableOptionsForm.value;
		qs += `match1var=variable&match1vals=${vals.variable}`;
		if (vals.pagination.page) qs += `&page=${vals.pagination.page}`;
		if (vals.pagination.perPage) qs += `&perPage=${vals.pagination.perPage}`;
		if (vals.sort.field) qs += `&sort=${vals.field}`;
		if (vals.sort.direction) qs += `&order=${vals.direction}`;
		if (vals.inflationAdjusted) qs += `&ia=true`;
		if (this.isAggregateForm.value.isAggregate) {
			qs += `&type=aggregate`;
			qs += `&gbField=${vals.groupBy.variable}`;
			qs += `&gbFunc=${vals.groupBy.aggFunc}`;
			qs += `&qField=${vals.groupBy.variable}`;
		} else {
			if (vals.searchBox) {
				qs += `&qField=name`;
				qs += `&qVal=${vals.searchBox}`;
			}
		}
		return qs;
	}

	private _updateGroupByFields() {
		if (this._aggOptionsVisible) {
			this.tableOptionsForm.get('groupBy').get('aggFunc').setErrors(null);
			this.tableOptionsForm.get('groupBy').patchValue({ 'variable': 'name', 'aggFunc': null });
		} else this.tableOptionsForm.get('groupBy').patchValue({ 'variable': null });
	}

	private _validateGroupByFields() {
		if (this._aggOptionsVisible
			&& !this.tableOptionsForm.get('groupBy').get('aggFunc').value) {
			this.tableOptionsForm.get('groupBy').get('aggFunc').setErrors({ 'required': true });
		} else this.tableOptionsForm.get('groupBy').get('aggFunc').setErrors(null);
	}
}