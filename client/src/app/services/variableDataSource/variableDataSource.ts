import { Injectable } from '@angular/core';
import { intVarExport, intPaginationArgs } from '../../../../server/src/schemas/SchoolSchema';
import { UtilService } from '../util/util';
import * as _ from 'lodash';

//this is a fine candidate for unit testing, blya

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
		var data: intermediateData[][],
			keyCol: string,
			keyMap: string[] = []; // array of unique values
		if (_export.data[0].data) { //if it's an intSchoolModel //todo:type check
			keyCol = _export.data.length > 1 ? 'instnm' : 'variable';
			//many schools, one variable
			if (keyCol === 'instnm') {
				data = _export.data.map(datum => datum.data);
				data = this._fillInMissingYears(data, _export.query.variables[0]),
					keyMap = _export.data.map(item => item.instnm);
			} else {
				//one school, one or more variables
				data = _.values(_.groupBy(_export.data[0].data, 'variable'));
				keyMap = Object.keys(_.groupBy(_export.data[0].data, 'variable'))
			}
		} else {
			//aggregate
			keyCol = _export.data.filter(item => !['fiscal_year','variable','value'].includes(item))[0];
			_.groupBy(_export.data,"sector");//
			//this is all sorts of fucked up, 
			//in reality, need to return aggregate data as sector.data, where data contains all the data for that sector,
			//and each one of them will be a row. That's the only way to make this make sense, and that means rewriting
			// the aggregate query, yay.
			
		}

		let exportData: intOutputData[] = _.flatMap(data, datum => datum.reduce((a, b) => Object.assign(a, { [b.fiscal_year]: b.value }), {}));

		exportData.forEach((datum, i) => {
			datum[keyCol] = keyMap[i];
		});

		return exportData;
	}

	//no longer working....
	_fillInMissingYears(data: intermediateData[][], variable: string) {
		const yearRange = _.flatMap(_.flatMap(data, item => _.flatMap(item => item.fiscal_year))),
			uniqYears = _.uniq(yearRange);

		data.forEach(datum => {
			_getMissingYears(datum).forEach(fiscal_year => datum.push({
				fiscal_year: fiscal_year,
				variable: variable,
				value: 'NA'
			}));
		})

		function _getMissingYears(datum) {
			let years = _.flatMap(datum.data, item => item.fiscal_year);
			return _.difference(uniqYears, years);
		}

		return data;
	}

}

