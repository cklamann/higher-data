import * as M from 'mathjs';
import * as _ from 'lodash';
import { SchoolSchema, intSchoolSchema, intSchoolData } from '../schemas/SchoolSchema';
import { VariableDefinitionSchema, intVariableDefinitionSchema } from '../schemas/VariableDefinitionSchema';
import { intChartDatum } from '../models/Chart';

export interface intFormula {
	validate(): Promise<boolean>;
}

export interface intFormulaValues {
	[propName: string]: number
}

export interface intFormulaData {
	[key: string]: intFormulaValues
}

// [ { '2003': [{ in_state_tuition: 27108, room_and_board: 8446 }] } ]

export class ChartFormula implements intFormula {
	formula: string;
	cleanFormula: string;
	symbolNodes: string[];
	optionalSymbolNodes: string[];

	constructor(formula: string) {
		this.formula = formula;
		this.cleanFormula = this._stripOptionalMarkers(formula);
		this.symbolNodes = this._getSymbolNodes(this.cleanFormula);
		this.optionalSymbolNodes = this._getSymbolNodes(this.formula).filter(node => node.match(/^__opt_.+/)).map(node => this._stripOptionalMarkers(node));
	}

	public validate() {
		return this._verifyNodes();
	}

	private _transformModelForFormula(data: intSchoolData[]): intFormulaData[] {
		let grouped = _.groupBy(data, 'fiscal_year');
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

		let filtered = mapped.filter(item => _.values(_.values(item)[0]).length === this.symbolNodes.length);
		return filtered; //todo: filter out incomplete years, also rethink data structure -- yes! cause mathjs will blow up otherwise
	}

	private _evaluate(chartData: Array<any>) {
		return chartData.map(datum => {
			return {
				fiscal_year: _.keys(datum)[0],
				value: M.eval(this.cleanFormula, _.values(datum)[0])
			}
		});
	}

	public execute(unitid: number): Promise<intChartDatum[]> {
		return SchoolSchema.schema.statics.fetchSchoolWithVariables(unitid, this.symbolNodes)
			.then((school: intSchoolSchema) => {
				const fullData = this._fillMissingOptionalData(school.data);
				return this._evaluate(this._transformModelForFormula(fullData));
			});
	}

	private _fillMissingOptionalData(schoolData: any[]): intSchoolData[] {
		const yearRange = this._getYearRange(schoolData),
			extantVars = this._getUniqueVars(schoolData),
			missingNodes: string[] = this.optionalSymbolNodes.filter(node => extantVars.indexOf(node) == -1);

		missingNodes.forEach(item => {
			yearRange.forEach(fiscal_year => {
				if (schoolData.filter(datum => datum.fiscal_year == fiscal_year && item == datum.variable).length === 0) {
					schoolData.push({
						"fiscal_year": fiscal_year,
						"variable": item,
						"value": 0
					});
				}
			});
		});

		return schoolData;
	}

	private _getYearRange(yearsData: Array<intSchoolData>): Array<string> {
		const range: Array<any> = yearsData.filter(obj => obj.fiscal_year);
		const vals: Array<string> = _.values(range);
		return _.uniq(vals).sort();
	}

	private _getUniqueVars(yearsData: Array<intSchoolData>): Array<string> {
		const vars: Array<any> = yearsData.filter(obj => obj.variable);
		const vals: Array<string> = _.values(vars);
		return _.uniq(vals);
	}

	private _getSymbolNodes(formula: string): string[] {
		let nodes: any = [],
			parsed: any = M.parse(formula)
		_recurse(parsed);
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

	//verify that there's at least one variable and that a definition exists for every variable passed in
	//this is for on create rather than on build
	private _verifyNodes(): Promise<boolean> {
		return VariableDefinitionSchema.find().exec()
			.then(variables => {
				const allVars = _.flatMap(variables, vari => vari.variable);
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

	private _stripOptionalMarkers(item: string): string {
		return item.replace(/__opt_/g, "");
	}
}