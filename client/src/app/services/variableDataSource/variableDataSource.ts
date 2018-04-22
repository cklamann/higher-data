import { Injectable } from '@angular/core';
import { intVarExport } from '../../../../server/src/schemas/SchoolDataSchema';
import { UtilService } from '../util/util';
import { sectors } from '../data/sectors';
import * as _ from 'lodash';
import * as d3 from 'd3';

interface inputData {
	fiscal_year: string,
	value: string,
	variable?: string,
	instnm?: string
};

interface intermediateData {
	fiscal_year: string;
	value: number | string;
	variable?: string;
	instnm?: string;
	sector?: string;
	state?: string;
}

export interface intVarDataSourceExport {
	fiscal_year: string;
	[key: string]: any
}

@Injectable()
export class VariableDataSource {

	private _export: intVarExport;
	data: intVarDataSourceExport[];
	util: UtilService;

	constructor(_export: intVarExport) {
		this._export = _export;
		this.data = _export.data.length > 0 ? this._transformExport(_export) : [];
	}

	get export() {
		return { data: this.data, pagination: this._export.query.pagination, sort: this._export.query.sort };
	}

	getColumns(): string[] {
		let keys = Object.keys(this.data[0]).sort();
		let label = keys.pop();
//		label = label === "instnm" ? "Name" : label;
		keys.unshift(label);
		return keys;
	}

	_transformExport(_export: intVarExport): intVarDataSourceExport[] {
		//todo: replace with transformer
		var data: intermediateData[][],
			keyCol: string,
			keyMap: string[] = []; // array of unique values for label column
		keyCol = _.keys(_export.data[0]).length === 2 ? // agg has 2 props per item -> brittle, rethink
			_.keys(_export.data[0]).find(datum => datum != "data") :
			_export.data.length > 1 ? 'instnm' : 'variable';

		//many schools, one variable (agg included)
		if (keyCol !== 'variable') {
			data = _export.data.map(datum => datum.data);
			data = this._fillInMissingYears(data, _export.query.filters.values[0]);
			keyMap = _export.data.map(item => item[keyCol]);
		} else {
			//one school, one or more variables (currently)
			data = _.values(_.groupBy(_export.data[0].data, 'variable'));
			keyMap = Object.keys(_.groupBy(_export.data[0].data, 'variable'))
		}

		let exportData = <intVarDataSourceExport[]>_.flatMap(data, datum => datum.reduce((a, b) => Object.assign(a, { [b.fiscal_year]: b.value }), {}));

		if (keyCol === "sector") {
			keyMap = keyMap.map(key => sectors.find(sector => sector.number === key).name);
		}

		exportData.forEach((datum, i) => {
			datum[keyCol] = keyMap[i];
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

