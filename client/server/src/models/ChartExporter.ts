import * as M from 'mathjs';
import * as _ from 'lodash';
import * as Q from 'q';
import { SchoolSchema, intSchoolModel } from '../schemas/SchoolSchema';
import { ChartSchema, intChartModel, intChartVariableModel } from '../schemas/ChartSchema'
import { ChartFormula, intFormula, intChartFormulaResult } from '../modules/ChartFormula.module';
import { VariableDefinitionSchema, intVariableDefinitionSchema } from '../schemas/VariableDefinitionSchema';
import { InflationTableSchema } from '../schemas/InflationTableSchema';

export interface intChartExport {
	chart: intChartModel,
	school: intSchoolModel,
	data: intChartExportDataParentModel[],
	options: intChartExportOptions
}

export interface intChartExportDataParentModel {
	legendName: string,
	data: intChartFormulaResult[]
}

export interface intChartExportOptions {
	cut?: string;
	infationAdjusted?: string;
}

export class ChartExport {

	constructor(public school: intSchoolModel, public chart: intChartModel, private options: intChartExportOptions = {}) {
		if (this.options.cut) {
			this.chart.variables.forEach(vari => {
				vari.formula = '(' + vari.formula + ')' + '/' + this.options.cut;
			});
		}
	}

	public export(): Q.Promise<intChartExport> {
		let promises: Q.Promise<intChartFormulaResult[]>[] = [];
		this.chart.variables.forEach((variable: intChartVariableModel) => {
			let varVal = new ChartFormula(variable.formula);
			promises.push(varVal.execute(this.school.unitid));
		});
		return Q.all(promises)
			.then(values => {
				let promises = values.map((result, i) => {
					return this.options.infationAdjusted === 'true' ? this._adjustForInflation(result) : Q.when(result);
				});
				return Q.all(promises);
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
	_adjustForInflation(res: intChartFormulaResult[]): intChartFormulaResult[] {
		return InflationTableSchema.schema.statics.calculate(res);
	}
}