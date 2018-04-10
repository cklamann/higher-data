import { Injectable } from '@angular/core';
import { intVarExport, intPaginationArgs, intBaseSchoolModel } from '../../../../server/src/schemas/SchoolSchema';
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
	value: string;
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

	data: intVarDataSourceExport[]
	pagination: intPaginationArgs;
	sort: string;
	util: UtilService;

	constructor(_export: intVarExport) {
		this.data = this._transformExport(_export);
		this.pagination = _export.query.pagination;
		this.sort = _export.query.sort;
	}

	get export() {
		return { data: this.data, pagination: this.pagination, sort: this.sort };
	}

	getColumns(): string[] {
		let keys = Object.keys(this.data[0]).sort();
		let label = keys.pop();
		keys.unshift(label); //if we rename instnm here, would need to do it on the data too so table works...
		return keys;
	}

	_transformExport(_export: intVarExport): intVarDataSourceExport[] {
		//todo: replace with transformer
		console.log(_export);
		var data: intermediateData[][],
			keyCol: string,
			keyMap: string[] = []; // array of unique values for label column
		keyCol = _.keys(_export.data[0]).length === 2 ? // agg has 2 props per item -> brittle, rethink
			_.keys(_export.data[0]).find(datum => datum != "data") :
			_export.data.length > 1 ? 'Name' : 'variable';

		//many schools, one variable (agg included)
		if (keyCol !== 'variable') {
			data = _export.data.map(datum => datum.data);
			data = this._fillInMissingYears(data, _export.query.variables[0]);
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

