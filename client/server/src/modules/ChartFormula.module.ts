import M = require('mathjs');
import _ = require('lodash');
import { SchoolSchema, intSchoolSchema } from '../schemas/SchoolSchema';

import { VariableDefinitionSchema, intVariableDefinitionSchema } from '../schemas/VariableDefinitionSchema';

export interface intFormula {
	validate(): Promise<boolean>;
}

export class ChartFormula implements intFormula {
	formula: string;
	symbolNodes: Array<string>;
	parsed: object;
	constructor(formula: string) {
		this.formula = formula;
		this.parsed = M.parse(formula);
		this.symbolNodes = this._getSymbolNodes();
	}

	public validate() {
		return this._verifyNodes();
	}

	private _transformModelForFormula(school: intSchoolSchema): Array<any> {
		let grouped = _.groupBy(school.data, 'fiscal_year');
		let mapped = _.map(grouped, (v, k) => {
			return {
				[k]: v.map(item => {
					return {
						[item.variable]: parseFloat(item.value.trim()) //todo: cleanup database values -->just update from R
					}
				}).reduce((acc, curr) => {
					return _.assign(acc, curr);
				}, {})
			}
		});
		//make sure to process only years with all required fields
		return mapped.filter(group => _.values(group).length < this.symbolNodes.length);
	}

	private _evaluate(chartData: Array<any>) {
		return chartData.map(datum => {
			return {
				fiscal_year: _.keys(datum)[0],
				value: M.eval(this.formula, _.values(datum)[0])
			}
		});
	}

	public execute(unitid: number): Promise<Array<any>> {
		return SchoolSchema.schema.statics.fetchSchoolWithVariables(unitid, this.symbolNodes)
			.then((school: intSchoolSchema) => this._evaluate(this._transformModelForFormula(school)));
	}

	private _getSymbolNodes() {
		let nodes: any = [];
		_recurse(this.parsed);
		function _recurse(parsed: any) {
			if (parsed.content) {
				parsed = parsed.content;
			}
			if (parsed.args) {
				parsed.args.forEach((child: any) => _recurse(child));
			}
			if (parsed.name) {
				nodes.push(parsed.name);
			}
		}
		return nodes;
	}

	private _verifyNodes(): Promise<boolean> {
		return VariableDefinitionSchema.find().exec()
			.then(variables => {
				let allVars = _.flatMap(variables, vari => vari.variable);
				let valid: boolean = true;
				if (this.symbolNodes.length === 0) {
					valid = false;
				}
				this.symbolNodes.forEach(node => {
					if (allVars.indexOf(node) === -1) {
						valid = false;
					}
				});
				return valid;
			});
	}
}