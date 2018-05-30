import { Injectable, OnInit } from '@angular/core';
import { RestService } from '../../services/rest/rest.service';
import { intChartExport, intChartExportOptions } from '../../../../server/src/models/ChartExporter';
import { Observable } from 'rxjs';
import { intChartDisplayOptions } from './models/BaseChart';
import { LineChart } from './models/LineChart';
import { AreaChart } from './models/AreaChart';
import 'rxjs/add/operator/map';
import { intChartModel } from '../../../../server/src/schemas/ChartSchema';
import { intSchoolModel } from '../../../../server/src/schemas/SchoolSchema';
import { intFormulaParserResult } from '../../../../server/src/modules/FormulaParser.module';
import * as _ from 'lodash';


@Injectable()

//todo: reconcile this with Charts model -- is that not a better place for all this?

export class ChartService {
	constructor(private rest: RestService) { }

	fetchChart(schoolSlug: string, chartSlug: string, options: intChartExportOptions = {}): Observable<intChartExport> {
		var queryString = "";
		if(!_.isEmpty(options)){
			let vars = _.toPairs(options);
			queryString = "?" + vars.map( pair => pair[0] + "=" + pair[1]).join("&").replace(/\+/g,"%2B");
		}
		return this.rest.get(`schools/${schoolSlug}/charts/${chartSlug}${queryString}`);
	}

	fetchChartPreview(schoolModel: intSchoolModel, chartModel: intChartModel) {
		return this.rest.post(`charts/preview`, { school: schoolModel, chart: chartModel });
	}

	fetchChartByVariable(variable: string, instnm: string): Observable<intChartExport> {
		return this.rest.get(`variables/${variable}/chart/${instnm}`);
	}

	resolveChart(chartData: intChartExport, selector: string, overrides: object) {
		switch (chartData.chart.type) {
			case "line":
				return new LineChart(chartData, selector, overrides);
			case "area":
				return new AreaChart(chartData, selector, overrides);
		}
	}

}