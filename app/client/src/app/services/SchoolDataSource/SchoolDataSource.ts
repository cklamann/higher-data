import { intExportAgg } from '../../../../server/src/schemas/SchoolDataSchema';
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

export class SchoolDataSourceAgg {
	private _keyCol: string;
	private _total: number;
	private data: intVarDataSourceExport[];

	constructor(_data: intExportAgg, keyCol: string) {
		this._keyCol = keyCol;
		this._total = _data.query.pagination.total;
		this.data = _data.data.length > 0 ? this._transformExport(_data) : [];
	}

	get export() {
		return {data: this.data, total:this._total};
	}

	getColumns(): string[] {
		let keys = Object.keys(this.data[0]).sort().reverse();
		return keys;
	}

	_transformExport(_data): intVarDataSourceExport[] {
		let data: intermediateData[][];
		data = _data.data.map(datum => datum.data);
		data = this._fillInMissingYears(data, this._keyCol);
		let keyMap = _data.data.map(item => item[this._keyCol]);

		let exportData = <intVarDataSourceExport[]>_.flatMap(data, datum => datum.reduce((a, b) => Object.assign(a, { [b.fiscal_year]: b.value }), {}));

		if (this._keyCol === "sector") {
			keyMap = keyMap.map(key => sectors.find(sector => sector.number === key).name);
		}

		exportData.forEach((datum, i) => {
			datum[this._keyCol] = keyMap[i];
		});

		return exportData;
	}

	_fillInMissingYears(data: intermediateData[][], variable: string) {

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