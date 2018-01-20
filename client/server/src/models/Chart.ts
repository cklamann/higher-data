import M = require('mathjs');
import _ = require('lodash');
import Q = require('q');
import { SchoolSchema, intSchoolSchema } from '../schemas/SchoolSchema';
import { ChartSchema, intChartSchema, intChartVariable } from '../schemas/ChartSchema'
import { ChartFormula, intFormula } from '../modules/ChartFormula.module';
import { VariableDefinitionSchema, intVariableDefinitionSchema } from '../schemas/VariableDefinitionSchema';

export interface intChartModel {
	export(): any; //this is sole public method
}

export interface intChartExportData {
	//define data model type here
}

export class Chart implements intChartModel {
	schoolP: intSchoolSchema;
	chartP: any;//typing doing funny things here and i suspect elsewhere
	chart: intChartSchema;
	school: intSchoolSchema;

	constructor(school: number, chartSlug: string) {
		this.schoolP = SchoolSchema.schema.statics.fetch(school);
		this.chartP = ChartSchema.findOne({ slug: chartSlug });
	}

	public export() {
		return Q.all([this.chartP, this.schoolP])
			.then((vals: any) => {
				this.chart = vals[0];
				this.school = vals[1];
				let promises: Array<Promise<object>> = []; //todo, define object with interface 
				this.chart.variables.forEach((variable: intChartVariable) => {
					let varVal = new ChartFormula(variable.formula);
					promises.push(varVal.execute(this.school.unitid));
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
					data: data
				}
			})
			.catch(err => err);
	}
}