import { Injectable } from '@angular/core';
import { intChartModel, intChartSchema, intCutByModel, intChartVariableModel } from '../../../server/src/schemas/ChartSchema';
import { RestService } from '../services/rest/rest.service';
import { Observable, Subscription } from 'rxjs';
import { intChartExport, intChartExportOptions } from '../../../server/src/modules/ChartExporter.module';
import { intChartDisplayOptions } from '../modules/chart/models/BaseChart';
import { LineChart } from '../modules/chart/models/LineChart';
import { AreaChart } from '../modules/chart/models/AreaChart';
import { SteamChart } from '../modules/chart/models/SteamChart';
import { BubbleStackChart } from '../modules/chart/models/BubbleStackChart';
import 'rxjs/add/operator/map';
import { intSchoolModel } from '../../../server/src/schemas/SchoolSchema';
import { intFormulaParserResult } from '../../../server/src/modules/FormulaParser.module';
import * as _ from 'lodash';
import 'rxjs/add/observable/throw';


@Injectable()
export class Charts {
	constructor(private rest: RestService) { }

	fetch(id: number): Observable<intChartSchema> {
		return this.rest.get(`api/charts/${id}`);
	}

	fetchAll(): Observable<intChartModel[]> {
		return this.rest.get(`charts`);
	}

	save(model: intChartModel): Observable<intChartSchema> {
		return this.rest.post(`charts`, model);
	}

	delete(_id: string): Observable<any> {
		return this.rest.delete(`charts/${_id}`);
	}

	fetchChart(schoolSlug: string, chartSlug: string, options: intChartExportOptions = {}): Observable<intChartExport> {
		var queryString = "";
		if (!_.isEmpty(options)) {
			queryString = "?" + Object.entries(options)
				.map(pair => pair[0] + "=" + pair[1])
				.join("&")
				.replace(/\+/g, "%2B");
		}
		return this.rest.get(`schools/${schoolSlug}/charts/${chartSlug}${queryString}`);
	}

	fetchChartPreview(schoolModel: intSchoolModel, chartModel: intChartModel) {
		return this.rest.post(`charts/preview`, { school: schoolModel, chart: chartModel });
	}

	fetchChartByVariable(variable: string, name: string): Observable<intChartExport> {
		return this.rest.get(`variables/${variable}/chart/${name}`);
	}

	resolveChart(chartData: intChartExport, selector: string, overrides: object) {
		switch (chartData.chart.type) {
			case "line":
				return new LineChart(chartData, selector, overrides);
			case "area":
				return new AreaChart(chartData, selector, overrides);
			case "steam":
				return new SteamChart(chartData, selector, overrides);
			case "bubble-stack":
				return new BubbleStackChart(chartData, selector, overrides);
		}
	}
}

export class Chart implements intChartModel {
	name: string;
	slug: string;
	type: string;
	category: string;
	active: boolean;
	valueType: string;
	description: string;
	variables: intChartVariableModel[];
	cuts: intCutByModel[];
	constructor(obj: intChartModel) {
		this.name = obj.name;
		this.slug = obj.slug;
		this.type = obj.type;
		this.category = obj.category;
		this.active = obj.active;
		this.valueType = obj.valueType;
		this.description = obj.description;
		this.variables = obj.variables;
		this.cuts = obj.cuts;
	}
}