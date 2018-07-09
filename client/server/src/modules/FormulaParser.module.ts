import { SchoolSchema, intSchoolModel } from '../schemas/SchoolSchema';
import { intSchoolDataSchema } from '../schemas/SchoolDataSchema'
import { SchoolDataSchema, intSchoolDataModel, intVarExport, intSchoolBaseDataModel } from '../schemas/SchoolDataSchema';
import { VariableDefinitionSchema, intVariableDefinitionSchema } from '../schemas/VariableDefinitionSchema';
import { SchoolDataQuery } from '../modules/SchoolDataQuery.module';
import * as M from 'mathjs';
import * as _ from 'lodash';

export interface intFormulaParserResult {
	fiscal_year: string,
	value: any
}

export class FormulaParser {
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

	private _transformModelForFormula(data: intSchoolBaseDataModel[]): object[] {
		let grouped = _.groupBy(data, 'fiscal_year');
		let mapped = _.map(grouped, (v, k) => {
			return {
				[k]: v.map(item => {
					return {
						[item.variable]: item.value
					}
				}).reduce((acc, curr) => {
					return _.assign(acc, curr);
				}, {})
			}
		});

		let filtered = mapped.filter(item => _.values(_.values(item)[0]).length === this.symbolNodes.length);
		return filtered;
	}

	//any is the intermediate data model
	private _evaluate(chartData: any[]): intFormulaParserResult[] {
		return chartData.map(datum => {
			return {
				fiscal_year: _.keys(datum)[0],
				value: M.eval(this.cleanFormula, _.values(datum)[0])
			}
		});
	}

	public execute(unitid: string): Promise<intFormulaParserResult[]> {
		let qc = SchoolDataQuery.createBase();
		qc.addMatch('unitid',unitid);
		qc.addMatch('variable', this.symbolNodes);
		return SchoolDataSchema.schema.statics.fetch(qc)
			.then((result: intSchoolDataSchema[]) => {
				const data = result ? result.map(item => {
					return {fiscal_year: item.fiscal_year, 
							variable: item.variable, 
							value: item.value}
						}) : [],
					fullData = this._fillMissingOptionalData(data),
					transformedData = this._transformModelForFormula(fullData);
				return this._evaluate(transformedData);
			});
	}

	private _fillMissingOptionalData(schoolData: intSchoolBaseDataModel[]): intSchoolBaseDataModel[] {
		const yearRange = this._getYearRange(schoolData);

		yearRange.forEach(year => {
			this.optionalSymbolNodes.forEach(optionalNode => {
				if(!schoolData.find(datum => datum.fiscal_year === year && datum.variable === optionalNode)){
					schoolData.push({
					"fiscal_year": year,
					"variable": optionalNode,
					"value": 0});
				}
			});
		});

		return schoolData;
	}

	private _getYearRange(yearsData: intSchoolBaseDataModel[]): string[] {
		return _.uniq(yearsData.map(datum => datum.fiscal_year));
	}

	private _getSymbolNodes(formula: string): string[] {
		let nodes: string[] = [],
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