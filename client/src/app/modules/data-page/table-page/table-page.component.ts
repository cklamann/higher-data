import { Component, OnInit, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatPaginator, MatSort, MatTableDataSource, PageEvent } from '@angular/material';
import { intVarExport } from '../../../../../server/src/schemas/SchoolDataSchema';
import { intQueryConfig } from '../../../../../server/src/types/types';
import { RestService } from '../../../services/rest/rest.service';
import { Schools } from '../../../models/Schools';
import { Observable } from 'rxjs';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { UtilService } from '../../../services/util/util';
import { VariableDataSource, intVarDataSourceExport } from '../../../services/variableDataSource/variableDataSource';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ModalLoadingComponent } from '../../shared/modals/loading/loading.component';
import { ModalErrorComponent } from '../../shared/modals/error/error.component';
import * as _ from 'lodash';
import 'rxjs/add/operator/map';

@Component({
	selector: 'app-table-page',
	templateUrl: './table-page.component.html',
	styleUrls: ['./table-page.component.scss']
})

export class TablePageComponent implements OnInit {

	@ViewChild('tablePaginator') tablePaginator: MatPaginator;
	@ViewChild('tableSort') tableSort: MatSort;

	groupByForm: FormGroup;
	isAggregateForm: FormGroup;
	filterForm: FormGroup;
	matchesForm: FormGroup;
	matTableDataSource = new MatTableDataSource<intVarDataSourceExport>();
	queryParams: intQueryConfig;
	showTable = false;
	tableOptionsForm: FormGroup;
	visibleColumns: string[] = [];
	variableFriendly: string = '';
	private _columns: string[] = [];
	private _columnIndex: number = 0;
	private _dataTotal: number = 0;
	private _tableOptionsVisible: boolean = false;
	private _variableType: string;
	constructor(private schools: Schools, private fb: FormBuilder, private util: UtilService,
		public dialog: MatDialog) {
	}

	ngOnInit() {
		this._intializeForms();
		this._subscribeToForms();
	}

	private _intializeForms() {

		/*
			working principle is to use independent forms if transforms are needed, so can transform
			on update, then push into parent in order not to trigger parent update prematurely
		*/

		this.filterForm = this.fb.group({
			fieldName: 'variable',
			values: this.fb.array([
				new FormControl('variable').setValidators([Validators.required])
			])
		});

		this.groupByForm = this.fb.group({
			aggFunc: null,
			variable: 'instnm',
		});

		this.matchesForm = this.fb.group({
			match: new FormControl('')
		});

		this.tableOptionsForm = this.fb.group({
			matches: this.fb.array([]),
			sort: {
				field: '',
				direction: ''
			},
			pagination: this.fb.group({
				page: 1,
				perPage: 10
			}),
			groupBy: this.groupByForm,
			inflationAdjusted: 'false',
			filters: this.filterForm
		})

		this.isAggregateForm = this.fb.group({
			isAggregate: false
		})
	}

	private _subscribeToForms() {
		this.tableOptionsForm.get('filters').setValidators([Validators.required]);

		this.tableOptionsForm.get('groupBy').get('variable').setValidators(Validators.required);

		this.tableOptionsForm.get('groupBy').get('variable').valueChanges.subscribe(change => this.matchesForm.reset());

		this.isAggregateForm.valueChanges.subscribe(change => {
			if (change.isAggregate) {
				this.tableOptionsForm.get('groupBy').get('variable').reset();
				this.tableOptionsForm.get('groupBy').get('aggFunc').setValidators(Validators.required);
			} else {
				this.tableOptionsForm.get('groupBy').get('aggFunc').clearValidators();
				this.tableOptionsForm.get('groupBy').get('aggFunc').reset();
				this.tableOptionsForm.get('groupBy').patchValue({ "variable": "instnm" });
			}
			this.matchesForm.reset();
		});

		this.tableOptionsForm.valueChanges.subscribe(change => {
			this.query();
		});
	}

	getDataTotal() {
		return this._dataTotal;
	}

	getTableOptionsVisible() {
		return this._tableOptionsVisible;
	}

	getVariableDefinitionSelected() {
		return this.tableOptionsForm.controls['filters'].value.values.length > 0;
	}

	getTableIsCurrency() {
		return /currency+./.test(this._variableType);
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

	onMatSortChange($event) {
		let sort = {
			field: $event.active === "Name" ? "instnm" : $event.active,
			direction: $event.direction === "desc" ? "-" : ""
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
		if (!this.tableOptionsForm.valid) return;
		let input = _.cloneDeep(this.tableOptionsForm.value);
		//todo: make transformer more deliberate
		input.filters.values = input.filters.values.map(variable => variable.variable);
		input.matches.push(this._transformMatches());
		this.openLoadingDialog();
		this.schools.fetchAggregate(input)
			.map((res: intVarExport) => {
				return new VariableDataSource(res);
			})
			.debounceTime(500)
			.subscribe(resp => {
				this.dialog.closeAll();
				if (!_.isEmpty(resp.export.data)) {
					let data = resp.export.data,
						formattedData = this._formatValues(data);
					this.matTableDataSource.data = formattedData;
					this._dataTotal = resp.export.pagination.total;
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
		this._variableType = $event.valueType;
		this.variableFriendly = $event.friendlyName;
		let control = <FormArray>this.tableOptionsForm.get('filters').get('values');
		control.at(0).patchValue({ variable: $event.variable });
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
		if (this._variableType) {
			return data.map((item: intVarDataSourceExport) => {
				return _.forIn(item, (v, k, obj) => {
					if (_.toNumber(k) && _.toNumber(v)) {
						obj[k] = this.util.numberFormatter().format(v, this._variableType);
					}
				});
			});
		} else return data;
	}

	private _transformMatches() {
		const change = this.matchesForm.value,
			regex = `.+${change.match}.+|${change.match}+.|.+${change.match}|${change.match}`,
			arg = change.match ? regex : `.+`;
		return { [this.groupByForm.value.variable]: { '$regex': arg, '$options': 'is' } };
	};

	private _updateTableOptionsMatches(regex: string = '') {
		if (!regex) regex = `.+`;
		this.tableOptionsForm.setControl('matches', this.fb.group({

		}));
	}

}
