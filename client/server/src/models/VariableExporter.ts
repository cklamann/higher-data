import * as M from 'mathjs';
import * as _ from 'lodash';
import * as Q from 'q';
import { SchoolSchema, intSchoolModel, intSchoolDataModel } from '../schemas/SchoolSchema';
import { ChartSchema, intChartModel, intChartVariableModel } from '../schemas/ChartSchema'
import { FormulaParser, intFormulaParserResult } from '../modules/FormulaParser.module';
import { VariableDefinitionSchema, intVariableDefinitionSchema } from '../schemas/VariableDefinitionSchema';
import { InflationTableSchema } from '../schemas/InflationTableSchema';

export interface intVariableExport {
	data: intVariableExportDataParentModel[],
	options: intVariableExportOptions
}

export interface intVariableExportDataParentModel {
	variable: string;
	data: intSchoolDataModel[];
}

export interface intVariableExportOptions {
	inflationAdjusted?: string;
	groupBy?: string[];
	aggFunc?: string;
}

export class VariableExport {

	constructor(private schoolSlug: string, private variables: string[], private options: intVariableExportOptions) {

	}

	public export(): Q.Promise<intVariableExport> {
		let promise: Promise<any>;
		if (this.schoolSlug === "aggregate") {
			SchoolSchema.aggregate([{ "$project": { "sector": 1, "data": { "$filter": { input: "$data", as: "var", cond: { "$in": ["$$var.variable", ["room_and_board", "in_state_tuition"]] } } } } }, { "$unwind": { "path": "$data" } }, { "$group": { "_id": { "sector": "$sector", "fiscal_year": "$data.fiscal_year", "variable": "$data.variable" }, "average": { "$avg": "$data.value" } } }])

		} else {
			SchoolSchema.find({ slug: this.schoolSlug }, {})
		}
		promise
			.then(res => {
				let promises = res.map((result, i) => {
					return this.options.inflationAdjusted === 'true' ? this._adjustForInflation(result) : Q.when(result);
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
			.catch(err => err);
	}
	_adjustForInflation(res: intFormulaParserResult[]): intFormulaParserResult[] {
		//need to transform input and output here...
		return InflationTableSchema.schema.statics.calculate(res);
	}


	//db.schools.aggregate([{"$project":{"sector":1,"data":{"$filter":{input:"$data",as: "var",cond:{ "$in": ["$$var.variable", ["room_and_board","in_state_tuition"]]}}}}}, {"$unwind":{"path":"$data"}},{"$group":{"_id":{"sector":"$sector","fiscal_year":"$data.fiscal_year","variable":"$data.variable"},"median":{"$avg":"$data.value"}}}])

	//the above should work now
	//should figure out why R is updating them like this (i.e., as strings not numbers) and fix
	//then update mongoose schema
}