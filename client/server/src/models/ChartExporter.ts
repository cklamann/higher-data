import * as M from 'mathjs';
import * as _ from 'lodash';
import * as Q from 'q';
import { SchoolSchema, intSchoolSchema } from '../schemas/SchoolSchema';
import { ChartSchema, intChartSchema, intChartVariableModel } from '../schemas/ChartSchema'
import { ChartFormula, intFormula, intChartFormulaResult } from '../modules/ChartFormula.module';
import { VariableDefinitionSchema, intVariableDefinitionSchema } from '../schemas/VariableDefinitionSchema';

export interface  intChartExporter {
	export(): Q.Promise<intChartExport>; 
}

export interface intChartExport {
	chart: intChartSchema,
	school: intSchoolSchema,
	data: intChartExportDataParentModel[]
}

export interface intChartExportDataParentModel {
	legendName: string,
	data: intChartFormulaResult[]
}

export class Chart implements intChartExporter {
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
				this.chart.variables.forEach((variable: intChartVariableModel) => {
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