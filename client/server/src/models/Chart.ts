import * as M from 'mathjs';
import * as _ from 'lodash';
import * as Q from 'q';
import { SchoolSchema, intSchoolSchema } from '../schemas/SchoolSchema';
import { ChartSchema, intChartSchema, intChartVariable } from '../schemas/ChartSchema'
import { ChartFormula, intFormula } from '../modules/ChartFormula.module';
import { VariableDefinitionSchema, intVariableDefinitionSchema } from '../schemas/VariableDefinitionSchema';

export interface intChartModel {
	export(): Q.Promise<intChartExport>; 
}

export interface intChartDatum {
	fiscal_year: string,
	value: string	
}

export interface intChartExport {
	chart: intChartSchema,
	school: intSchoolSchema,
	data: intChartExportData[]
}

export interface intChartExportData {
	legendName: string,
	data: intChartDatum[]
}

export class Chart implements intChartModel {
	schoolP: Q.Promise<intSchoolSchema>; 
	chartP: any; //odd typing things going on...
	chart: intChartSchema;
	school: intSchoolSchema;

	constructor(school: number, chartSlug: string) {
		this.schoolP = SchoolSchema.schema.statics.fetch(school);
		this.chartP = ChartSchema.findOne({ slug: chartSlug });
	}

	public export(): Q.Promise<intChartExport> {
		return Q.all([this.chartP, this.schoolP])
			.then((vals: any) => {
				this.chart = vals[0];
				this.school = vals[1];
				let promises: Promise<object>[] = [];  
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
					data: data,
				}
			})
			.catch(err => err);
	}
}