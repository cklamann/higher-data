import { Injectable } from '@angular/core';
import { intVarExport, intPaginationArgs } from '../../../../server/src/schemas/SchoolSchema';
import { UtilService } from '../util/util';
import * as _ from 'lodash';

/*

idea here is to layout the table config, complete with transformers, should probably be a class

--to make my tables, we need:

	column names -> composed of column1 and fiscal_years, where column1 is the key (either variable or school)
	data -> array of objects with all the data

	pagination -> not sure

	this class can take new data and update, as long as the data is of the same type and structure
	otherwise, if a new data shape comes in, it will rebuild


const rows = [
	{ "id": "1", "name": "Macaw, scarlet", "lat": "31.215291", "lng": "118.931012" },
	{ "id": "2", "name": "Armadillo, nine-banded", "lat": "35.663752", "lng": "103.389346" },
	{ "id": "3", "name": "Greater roadrunner", "lat": "13.17535", "lng": "44.27461" },
	{ "id": "4", "name": "Goanna lizard", "lat": "22.671042", "lng": "113.823131" },
	{ "id": "5", "name": "Cape starling", "lat": "16.0213558", "lng": "100.417181" }
];
const columns = Array<string>(Object.keys(rows[0]));
const data = new MatTableDataSource<Object>(rows);

*/

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
		let data: intermediateData[][],
			keyCol: string;
		if (_export.data[0].data) { //if it's varExport
			keyCol = _export.data.length > 1 ? 'instnm' : 'variable';
			//many schools, one variable
			if (keyCol === 'instnm') {
				//array of data arrays with instnm on every item
				const filledData = this._fillInMissingYears(_export.data);
				data = filledData.map(datum => datum.data.forEach(item => Object.assign(item, datum['keyCol'])));
			} else {
				//one school, one or more variables
				data = _.values(_.groupBy(_export.data[0].data, 'variable'));
			}
		} else {
			keyCol = _export.data[0].filter(item => ['fiscal_year', 'variable', 'value'].includes(this.util.getKey(item)));
			data = _.values(_.groupBy(_export.data, keyCol));
		}

		let exportData: intOutputData[] = _.flatMap(data, datum => datum.reduce((a, b) => Object.assign(a, { [b.fiscal_year]: b.value }), {}));

		exportData.forEach(datum => datum[keyCol] = data[0][0][keyCol]);

		return exportData;
	}

	_fillInMissingYears(exportData: any[]) {
		const yearRange = _.flatMap(exportData, datum => _.flatMap(datum.data, item => item.fiscal_year)),
			uniqYears = _.uniq(yearRange);

		exportData.forEach(datum => {
			_getMissingYears(datum).forEach(fiscal_year => datum.push({
				fiscal_year: fiscal_year,
				variable: datum[0].variable,
				value: 'NA'
			}));
		})

		let _getMissingYears = datum => {
			let years = _.flatMap(datum, item => item.fiscal_year);
			return _.difference(uniqYears, years);
		}

		return exportData;
	}

}

