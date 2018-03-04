import { Component, OnInit } from '@angular/core';
import { intChartModel } from '../../../../../../server/src/schemas/ChartSchema';
import { Router, ActivatedRoute } from '@angular/router';
import { ChartSearchComponent } from '../../../shared/chart-search/chart-search.component';
import { intVariableDefinitionModel } from '../../../../../../server/src/schemas/VariableDefinitionSchema';
import { VariableDefinitions } from '../../../../models/VariableDefinitions';
import * as M from 'mathjs';
import * as _ from 'lodash';

@Component({
	selector: 'app-chart-sources',
	templateUrl: './chart-sources.component.html',
	styleUrls: ['./chart-sources.component.scss']
})

export class ChartSourcesComponent implements OnInit {

	definitions: intChartSourceDefinition[];
	urlChart: string = "";
	chart: intChartModel;

	constructor(private router: Router, private route: ActivatedRoute, private vds: VariableDefinitions) { }

	ngOnInit() {
		//intialize via url
		this.route.params.subscribe(params => {
			if (params.chart && !this.chart) {
				this._updateChildSelectControl(params.chart);
			}
		});
	}

	//update via dropxown
	setChart($event) {
		this.chart = $event;
		this._initializeDefinitions();
		this.router.navigate([`data/sources/charts/${this.chart.slug}`]);
	}

	private _initializeDefinitions() {
		const definitions = this.chart.variables.map(variable => {
			return <intChartSourceDefinition>{
				legendName: variable.legendName,
				formula: variable.formula,
				variables: this._getSymbolNodes(variable.formula)
			}
		}),
			uniqueSymbolNodes = _.uniq(_.flatMap(definitions, definition => definition.variables));
		this.vds.fetchByName(uniqueSymbolNodes.join(","))
			.first().subscribe(defs => {
				definitions.forEach(def => {
					let matches: intVariableDefinitionModel[] = [];
					defs.forEach(df => {
						if(def.variables.indexOf(df.variable) != -1){
							matches.push(df);
						}
					});
					def.variableDefinitions = matches;
					//def.variableDefinitions.sort( (a,b) => a.variable.toLowerCase() < b.variable.toLowerCase());
				});
			})
		this.definitions = definitions;
	}

	private _updateChildSelectControl(chartName: string) {
		this.urlChart = chartName;
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

}

export interface intChartSourceDefinition {
	legendName: string;
	formula: string;
	variables: string[];
	variableDefinitions: intVariableDefinitionModel[]; 
}