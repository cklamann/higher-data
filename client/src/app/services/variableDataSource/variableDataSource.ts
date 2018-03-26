import { Injectable } from '@angular/core';
import { intVarExport, intPaginationArgs } from '../../../../server/src/schemas/SchoolSchema';
import { UtilService } from '../util/util';
import * as _ from 'lodash';

interface inputData {
	fiscal_year: string,
	value: string,
	variable?: string,
	instnm?: string
};

interface intermediateData {
	fiscal_year: string,
	value: string,
	variable?: string,
	instnm?: string
	sector?: string;
	state?: string;
}

export interface intOutputData {
	[key: string]: string;
};


@Injectable()
export class VariableDataSource {

	data: intOutputData[]
	pagination: intPaginationArgs;
	sort: string;
	util: UtilService;

	constructor(_export: intVarExport) {
		this.data = this._transformExport(_export);
		this.pagination = _export.query.pagination;
		this.sort = _export.query.sort;
	}

	export() {
		return { data: this.data, pagination: this.pagination, sort: this.sort };
	}

	getColumns(): string[] {
		let keys = Object.keys(this.data[0]).sort();
		let label = keys.pop();
		keys.unshift(label);
		return keys;
	}

	_transformExport(_export: intVarExport): intOutputData[] {
		//todo: replace with transformer
		let data: intermediateData[][],
			keyCol: string;
		if (_export.data[0].data) { //if it's varExport
			keyCol = _export.data.length > 1 ? 'instnm' : 'variable';
			//many schools, one variable
			if (keyCol === 'instnm') {
				//array of data arrays with instnm on every item
				const filledData = this._fillInMissingYears(_export);
				data = filledData.data.map(datum => datum.data.map(item => Object.assign(item, { [keyCol]: datum[keyCol] })));
			} else {
				//one school, one or more variables
				data = _.values(_.groupBy(_export.data[0].data, 'variable'));
			}
		} else {
			keyCol = _export.data[0].filter(item => ['fiscal_year', 'variable', 'value'].includes(this.util.getKey(item)));
			data = _.values(_.groupBy(_export.data, keyCol));
		}

		let exportData: intOutputData[] = _.flatMap(data, datum => datum.reduce((a, b) => Object.assign(a, { [b.fiscal_year]: b.value }), {}));

		exportData.forEach((datum, i) => {
			datum[keyCol] = data[i][0][keyCol];
		});

		return exportData;
	}

	_fillInMissingYears(_export: intVarExport) {
		const yearRange = _.flatMap(_export.data, datum => _.flatMap(datum.data, item => item.fiscal_year)),
			uniqYears = _.uniq(yearRange);

		_export.data.forEach(datum => {
			_getMissingYears(datum).forEach(fiscal_year => datum.data.push({
				fiscal_year: fiscal_year,
				variable: _export.query.variables[0],
				value: 'NA'
			}));
		})

		function _getMissingYears(datum) {
			let years = _.flatMap(datum.data, item => item.fiscal_year);
			return _.difference(uniqYears, years);
		}

		return _export;
	}

}

