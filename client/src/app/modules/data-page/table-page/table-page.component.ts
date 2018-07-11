import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator, MatSort, MatTableDataSource, PageEvent, MatInput } from '@angular/material';
import { intExport, intExportAgg, intSchoolDataModel } from '../../../../../server/src/schemas/SchoolDataSchema';
import { intSchoolDataAggQuery } from '../../../../../server/src/modules/SchoolDataQuery.module';
import { Schools } from '../../../models/Schools';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { UtilService } from '../../../services/util/util';
import { SchoolDataSourceAgg, intVarDataSourceExport } from '../../../services/SchoolDataSource/SchoolDataSource';
import { intVariableDefinitionModel } from '../../../../../server/src/schemas/VariableDefinitionSchema';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ModalLoadingComponent } from '../../shared/modals/loading/loading.component';
import { ModalErrorComponent } from '../../shared/modals/error/error.component';
import * as _ from 'lodash';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';


interface intTableOptionsForm {
	qVal: string,
	sortField: string,
	sortDirection: string,
	page: number,
	perPage: number
	gbFunc: string,
	gbField: string
	ia: boolean,
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

		this.tableOptionsForm = this.fb.group({
			qVal: '',
			sort: 'name',
			order: 'asc',
			page: 1,
			perPage: 10,
			gbFunc: new FormControl('first', Validators.required),
			gbField: new FormControl('name', Validators.required),
			ia: false,
			variable: new FormControl('', Validators.required)
		});
	}

	private _subscribeToForms() {

		this.isAggregateForm.valueChanges
			.subscribe(change => {
				if (!change.isAggregate) {
					this.tableOptionsForm.patchValue({
						gbFunc: 'first',
						gbField: 'name'
					});
				} else {
					this.tableOptionsForm.patchValue({
						gbFunc: null,
						gbField: null
					});
				}
			})

		this.tableOptionsForm.valueChanges
			.distinctUntilChanged((prev, curr) => this._onlyNameSearchChanged(prev, curr))
			.subscribe(change => this.query());
	}

	getDataTotal() {
		return this._dataTotal;
	}

	getAggOptionsVisible() {
		return this.isAggregateForm.get('isAggregate').value;
	}

	getLeftArrowVisible() {
		return this.visibleColumns[1] !== this._columns[1];
	}

	getRightArrowVisible() {
		return this.visibleColumns[this.visibleColumns.length - 1] !== this._columns[this._columns.length - 1];
	}

	getShowSearchBox() {
		return !!this.tableOptionsForm.get('variable').value && !this.isAggregateForm.get('isAggregate').value;
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

		this.tableOptionsForm.patchValue({
			sort: sort.field,
			order: sort.direction
		});
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

		if (!this.tableOptionsForm.valid) return;

		let queryString = this._transformQuery();

		this.openLoadingDialog();

		this.schools.fetchData(queryString)
			.map((res: any) => {
				return new SchoolDataSourceAgg(res, this.tableOptionsForm.value.gbField);
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
			.map(pairs => pairs.filter(item => item[0] != 'qVal'));

		return _.isEqual(formBezMatch[0], formBezMatch[1]);
	}

	private _transformQuery(): string {
		let qs = '',
			vals = this.tableOptionsForm.value;
		qs += `match1var=variable&match1vals=${vals.variable}`;
		qs += `&qField=${vals.gbField}`;
		return qs += '&' + Object.entries(vals)
						.filter(pair => !['variable','qField'].includes(pair[0]))
						.map(pair => pair.join('='))
						.join('&');
	}
}