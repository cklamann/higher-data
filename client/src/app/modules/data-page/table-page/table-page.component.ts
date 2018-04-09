import { Component, OnInit, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { MatPaginator, MatSort, MatTableDataSource, PageEvent } from '@angular/material';
import { intSchoolVarExport, intVariableQueryConfig, intVarExport, intVariableAggQueryConfig } from '../../../../../server/src/schemas/SchoolSchema';
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

	@ViewChild('tablePaginator') tablePaginator: MatPaginator; //todo: observe these
	@ViewChild('tableSort') tableSort: MatSort;

	groupByForm: FormGroup;
	isAggregateForm: FormGroup;
	matTableDataSource = new MatTableDataSource<intVarDataSourceExport>();
	queryParams: intVariableQueryConfig | intVariableAggQueryConfig;
	showTable = false;
	tableOptionsForm: FormGroup;
	visibleColumns: string[] = [];
	private _columns: string[] = [];
	private _columnIndex: number = 0;
	private _dataTotal: number = 0;
	private _tableOptionsVisible: boolean = false;
	private _variableType: string;
	constructor(private schools: Schools, private fb: FormBuilder, private util: UtilService,
		public dialog: MatDialog) {
		this.matTableDataSource.sortingDataAccessor = (data: intVarDataSourceExport, property: string) => {
			if (_.toNumber(property)) return property;
			if (property === "instnm") return "instnm";
			if (property === "variable") return "variable"; //todo replace with friendly names once there
		};
	}

	//todo, add status bar, dim and lock screen while loading

	ngOnInit() {
		this._intializeForms();
		this._subscribeToForms();
	}


	private _intializeForms() {
		this.groupByForm = this.fb.group({
			aggFunc: null,
			variable: null,
		});

		this.tableOptionsForm = this.fb.group({
			matches: this.fb.array([]),
			sort: null,
			pagination: this.fb.group({
				page: 1,
				perPage: 10
			}),
			groupBy: this.groupByForm,
			inflationAdjusted: "false",
			variables: this.fb.array([])
		})

		this.isAggregateForm = this.fb.group({
			isAggregate: false
		})
	}

	private _subscribeToForms() {
		this.tableOptionsForm.controls['variables'].setValidators([Validators.required]);

		this.isAggregateForm.valueChanges.subscribe(change => {
			if (change.isAggregate) {
				this.tableOptionsForm.get('groupBy').get('aggFunc').setValidators(Validators.required);
				this.tableOptionsForm.get('groupBy').get('variable').setValidators(Validators.required);
				this.tableOptionsForm.get('groupBy').reset();
			} else {
				this.tableOptionsForm.get('groupBy').get('aggFunc').clearValidators();
				this.tableOptionsForm.get('groupBy').get('variable').clearValidators();
				this.tableOptionsForm.updateValueAndValidity();
			}
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
		return this.tableOptionsForm.controls['variables'].value.length > 0;
	}

	getTableIsCurrency() {
		return /currency/.test(this._variableType);
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

	onMatSortChange($event) {
		const prefix = $event.direction === "desc" ? "-" : "";
		this.tableOptionsForm.patchValue({
			sort: prefix + $event.active
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
			panelClass : 'error-panel',
		});
	}

	openLoadingDialog(): void {
		this.dialog.open(ModalLoadingComponent, {
			disableClose: true
		});
	}

	query() {
		if (!this.tableOptionsForm.valid) return;
		let input = this.tableOptionsForm.value;
		input.variables = input.variables.map(variable => variable.variable);
		const query = this.getIsAggregate() ? this.schools.aggregateQuery(this.tableOptionsForm.value) : this.schools.fetchWithVariables(this.tableOptionsForm.value);
		this.openLoadingDialog();
		query
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
				}
			}, err => {
				this.dialog.closeAll();
				this.openErrorDialog();
				console.log(err)
			});
	}

	setVariable($event) {
		this._variableType = $event.valueType;
		let control = <FormArray>this.tableOptionsForm['controls'].variables;
		control.removeAt(0);
		control.push(this.fb.group({
			variable: $event.variable
		}));
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

}
