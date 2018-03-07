import * as M from 'mathjs';
import * as _ from 'lodash';
import * as Q from 'q';
import { SchoolSchema, intSchoolModel } from '../schemas/SchoolSchema';
import { ChartSchema, intChartModel, intChartVariableModel } from '../schemas/ChartSchema'
import { FormulaParser, intFormulaParserResult } from '../modules/FormulaParser.module';
import { VariableDefinitionSchema, intVariableDefinitionSchema } from '../schemas/VariableDefinitionSchema';
import { getInflationAdjuster } from '../modules/InflationAdjuster.service';

export interface intChartExport {
	chart: intChartModel,
	school: intSchoolModel,
	data: intChartExportDataParentModel[],
	options: intChartExportOptions
}

export interface intChartExportDataParentModel {
	legendName: string,
	data: intFormulaParserResult[]
}

export interface intChartExportOptions {
	cut?: string;
	inflationAdjusted?: string;
}

export class ChartExport {

	constructor(public school: intSchoolModel, public chart: intChartModel, private options: intChartExportOptions = {}) {
		if (this.options.cut) {
			this.chart.variables.forEach(vari => {
				vari.formula = '(' + vari.formula + ')' + '/' + this.options.cut;
			});
		}
	}

	public export(): Promise<intChartExport> {
		let promises: Promise<intFormulaParserResult[]>[] = [];
		this.chart.variables.forEach((variable: intChartVariableModel) => {
			let varVal = new FormulaParser(variable.formula);
			promises.push(varVal.execute(this.school.unitid));
		});
		return Promise.all(promises)
			.then(values => {
				if (this.options.inflationAdjusted == 'true') {
					let promises: Promise<intFormulaParserResult[]>[] = [];
					values.forEach(value => promises.push(this._adjustForInflation(value)));
					return Promise.all(promises);
				} else return values;
			})
			.then(values => {
				return values.map((result, i) => {
					return {
						legendName: this.chart.variables[i].legendName,
						data: result
					}
				});
			})
			.then(data => {
				return {
					chart: this.chart,
					school: this.school,
					data: data,
					options: this.options
				}
			})
			.catch(err => err);
	}
	_adjustForInflation(res: intFormulaParserResult[]): Promise<intFormulaParserResult[]> {
		return getInflationAdjuster().then(adjuster => {
			res.forEach(item => item.value = adjuster(item.fiscal_year, item.value));
			return res;
		});
	}
}