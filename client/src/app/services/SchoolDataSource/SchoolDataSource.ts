import { Injectable } from '@angular/core';
import { intExportAgg, intExport } from '../../../../server/src/schemas/SchoolDataSchema';
import { sectors } from '../data/sectors';
import * as _ from 'lodash';
import * as d3 from 'd3';

interface intermediateData {
	fiscal_year: string;
	value: number | string;
	variable?: string;
	name?: string;
	sector?: string;
	state?: string;
}

export interface intVarDataSourceExport {
	fiscal_year: string;
	[key: string]: any
}

@Injectable()
//todo: don't return the query from backend (don't need it), just total
//one school, one var (should take many var too...)
export class SchoolDataSource {
	private _keyCol: string;
	private _data: intExport;
	private data: intVarDataSourceExport[];

	constructor(_data: intExport, keyCol: string) {
		this._keyCol = keyCol;
		this.data = _data.data.length > 0 ? this._transformExport() : [];
	}

	get export() {
		return {data: this.data, total:this._data.total};
	}

	getColumns(): string[] {
		//make label first
		let keys = Object.keys(this.data[0]).sort();
		let label = keys.pop();
		keys.unshift(label);
		return keys;
	}

	_transformExport() {
		const data = _.values(_.groupBy(this._data.data, 'fiscal_year')),
			filledData = this._fillInMissingYears(data, data[0][0].variable),
			keyMap = filledData.map(datum => datum[0][this._keyCol]);
		let exportData = <intVarDataSourceExport[]>_.flatMap(filledData, datum => datum.reduce((a, b) => Object.assign(a, { [b.fiscal_year]: b.value }), {}));
		exportData.forEach((datum, i) => {
			datum[this._keyCol] = keyMap[i];
		});
		return exportData;
	}

	_fillInMissingYears(data: intermediateData[][], variable: string) {
		//use all years to ensure uniformity between views
		const yearRange = d3.timeYears(new Date('2001'), new Date())
			.map(year => year.getFullYear())
			.map(year => String(year));

		data.forEach(datum => {
			_getMissingYears(datum).forEach(fiscal_year => datum.push({
				fiscal_year: fiscal_year,
				variable: variable,
				value: 'NA'
			}));
		})

		function _getMissingYears(datum) {
			let years = datum.map(item => item.fiscal_year);
			return _.difference(yearRange, years);
		}

		return data;
	}

}

export class SchoolDataSourceAgg {
	private _data: intExport;
	constructor(_data: intExport, keyCol: string) {

	}

	// _transformExport(_data: intVarExport): intVarDataSourceExport[] {
	// 	let data: intermediateData[][];

	// 	data = _data.data.map(datum => datum.data);
	// 	data = this._fillInMissingYears(data, this._keyCol);
	// 	let keyMap = _data.data.map(item => item[this._keyCol]);

	// 	let exportData = <intVarDataSourceExport[]>_.flatMap(data, datum => datum.reduce((a, b) => Object.assign(a, { [b.fiscal_year]: b.value }), {}));

	// 	if (this._keyCol === "sector") {
	// 		keyMap = keyMap.map(key => sectors.find(sector => sector.number === key).name);
	// 	}
	// 	//rebuild keys
	// 	exportData.forEach((datum, i) => {
	// 		datum[this._keyCol] = keyMap[i];
	// 	});

	// 	return exportData;
	// }
}