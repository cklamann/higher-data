import { Injectable, OnInit } from '@angular/core';
import { RestService } from '../../services/rest/rest.service';
import { intChartExport } from '../../../../server/src/models/ChartExporter';
import { Observable } from 'rxjs';
import { intChartDisplayOptions } from './models/BaseChart';
import { LineChart } from './models/LineChart';
import { intChartModel } from '../../../../server/src/schemas/ChartSchema';
import { intSchoolModel } from '../../../../server/src/schemas/SchoolSchema';


@Injectable()


export class ChartService {
	constructor(private rest: RestService) { }

	fetchChart(schoolSlug: string, chartSlug: string): Observable<intChartExport> {
		return this.rest.get(`schools/${schoolSlug}/charts/${chartSlug}`);
	}

	fetchChartPreview(schoolModel: intSchoolModel, chartModel: intChartModel) {
		return this.rest.post(`charts/preview`,{school:schoolModel,chart:chartModel});
	}

	fetchVariablePreview(variable: string, schoolSlug: string): Observable<intChartExport> {
		return this.rest.get(`variables/${variable}/preview/${schoolSlug}`);
	}

	resolveChart(chartData: intChartExport, selector: string, overrides: object) {
		switch (chartData.chart.type) {
			case "line":
				return new LineChart(chartData, selector, overrides);
		}

	}

}