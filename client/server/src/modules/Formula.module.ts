import M = require('mathjs');
import _ = require('lodash');
import { SchoolSchema, intSchoolModel } from '../models/School';
// here's how i imagine it
//	hits route with chart and unitid
//  Chart = Chart.schema.static.fetch('name');
//	Chart.get(unitid); 
//	get method loops through all Formulas on all lines and binds the data
//
import { VariableDefinitionSchema, intVariableDefinitionModel } from '../models/VariableDefinition';

export class Formula {
	formula: string;
	symbolNodes: Array<object>;
	parsed: object;
	constructor(formula: string) {
		this.formula = formula;
		this.parsed = M.parse(formula);
		this.symbolNodes = this._getSymbolNodes();
	}

	validate(cb: any) {
		return this._verifyNodes(cb);
	}

	private _fetchValues(unitid: number, cb: any) {
		return SchoolSchema.schema.statics.fetchSchoolWithVariables(unitid, this.symbolNodes, function(err: any, school: any) {
			if (err) return err;
			return cb(school);
		});
	}

	//todo: all this shit needs to get converted to promises er were gonna be in callback hell
	//http://thecodebarbarian.com/80-20-guide-to-async-await-in-node.js.html
	//http://mongoosejs.com/docs/promises.html
	//note that exec() will return a promise....


	private _transformValues() {
		//group by year
		//filter out incomplete groups --> use external transformer for all this
	}

	execute(unitid: number, cb: any) {
		return this._fetchValues(unitid, function(school: intSchoolModel) {
			return cb(this._evaluate(this.formula, this._transformModel(school)));
		});
	}

	private _getSymbolNodes() {
		let nodes: any = [];
		_recurse(this.parsed);
		function _recurse(parsed: any) {
			if (parsed.content) {
				parsed = parsed.content;
			}
			if (parsed.args) {
				parsed.args.forEach(child => _recurse(child));
			}
			if (parsed.name) {
				nodes.push(parsed.name);
			}
		}
		return nodes;
	}

	private _verifyNodes(cb: any): void {
		VariableDefinitionSchema.find({}, (err, res) => {
			let allVars = _.flatMap(res, vari => vari.variable);
			let valid: boolean = true;
			this.symbolNodes.forEach(node => {
				if (allVars.indexOf(node) === -1) {
					valid = false;
				}
			});
			return cb(valid);
		});
	}

}