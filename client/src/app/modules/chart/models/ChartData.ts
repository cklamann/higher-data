import { intChartExport, intChartExportDataParentModel } from '../../../../../server/src/models/ChartExporter';
import { intFormulaParserResult } from '../../../../../server/src/modules/FormulaParser.module';
import * as _ from 'lodash';
import * as d3 from 'd3';

export class ChartData {
	data: intBaseChartData[];
	constructor(data: intChartExportDataParentModel[]) {
		this.data = _baseTransform(data);
	}

	sortByVal = flag => {
		this.data.forEach(datum => datum.data.sort(_numSort));
		if (flag == 'desc') {
			this.data.forEach(datum => datum.data.reverse());
		}
	};

	getMax = (): number => d3.max(this.data, datum => d3.max(datum.data, item => item.value));
	getMin = (): number => d3.min(this.data, datum => d3.min(datum.data, item => item.value));
	getTotal = (): number => d3.sum(this.data, varGroup => this.sum(varGroup.data));

	sum = (variableObj: intBaseChartDatum[]) => variableObj.reduce((a, b) => {
		return a + b.value;
	}, 0);

	getDateRange = (): Array<Date> => {
		let range = _.flatMap(this.data, c => _.flatMap(c.data, d => d.fiscal_year));
		return _.uniqBy(range, item => item.getFullYear()).sort((a, b) => a - b);
	}

	getSumForYear = (year: Date): number => {
		let everything = _.flatMap(this.data, datum => datum.data);
		let	forYear = everything.filter(item => item.fiscal_year.getFullYear() === year.getFullYear()),
			sum = forYear.reduce((a, b) => a + b.value, 0)
		return sum;
	}

	setNullsToZero = (): void => this.data.forEach(datum => datum.data.forEach(item => item.value === null ? item.value = 0 : item.value = item.value));

	//loops through variables and any variable missing years gets gets zeroes
	setMissingValsToZero = () => {
		let dateRange = this.getDateRange();
		this.data.forEach(datum => {
			let diff = _.differenceBy(dateRange, datum.data.map(item => item.fiscal_year), (item) => item.getFullYear()),
				filler: any = diff.map(date => {
					return {
						fiscal_year: date,
						value: 0,
						legendName: datum.legendName,
						key: datum.key
					}
				})
			if (!_.isEmpty(filler)) datum.data = datum.data.concat(filler);
			datum.data.sort(_dateSort);
		});
	}

	removeDatum = (index) => {
		this.data = this.data.filter((val, i) => i != index);
	}
}

interface intChartDataYear {
	fiscal_year: number,
	data: intChartDataYearDatum[]
}

interface intChartDataYearDatum {
	variable: string;
	value: number;
	key: string;
	legendName: string;
}

export interface intBaseChartData extends intChartExportDataParentModel {
	legendName: string;
	key: string;
	d3Key?: string;
	data: intBaseChartDatum[];
}

export interface intBaseChartDatum extends intFormulaParserResult {
	legendName: string;
	value: number;
	fiscal_year: any;
	key: string;
}

function _baseTransform(data: intChartExportDataParentModel[]): intBaseChartData[] {
	return data.map((variable: any) => {
		let data = variable.data.map((datum: any) => {
			datum = Object.assign(datum, { legendName: variable.legendName });
			datum.value = parseFloat(datum.value);
			datum.key = variable.legendName.toLowerCase().replace(' ', '_');
			datum.fiscal_year = d3.timeParse("%Y")(datum.fiscal_year)
			return datum;
		});
		variable.key = variable.data.length ? variable.data[0].key : "";
		return variable;
	}).filter(datum => datum.data.length > 0);
}

function _numSort(a, b) {
	if (a.value < b.value) return -1;
	if (a.value > b.value) return 1;
	return 0;
}

function _dateSort(a, b) {
	if (a.fiscal_year.getFullYear() < b.fiscal_year.getFullYear()) return -1;
	if (a.fiscal_year.getFullYear() > b.fiscal_year.getFullYear()) return 1;
	return 0;
}

