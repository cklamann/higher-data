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
import { intChartFormulaResult } from '../../../../server/src/modules/ChartFormula.module';


@Injectable()

//todo: reconcile this with Charts model -- is that not a better place for all this?

export class ChartService {
	constructor(private rest: RestService) { }

	fetchChart(schoolSlug: string, chartSlug: string): Observable<intChartExport> {
		return this.rest.get(`schools/${schoolSlug}/charts/${chartSlug}`);
	}

	fetchChartPreview(schoolModel: intSchoolModel, chartModel: intChartModel) {
		return this.rest.post(`charts/preview`, { school: schoolModel, chart: chartModel });
	}

	fetchChartByVariable(variable: string, schoolSlug: string): Observable<intChartExport> {
		return this.rest.get(`variables/${variable}/chart/${schoolSlug}`);
	}

	fetchExport(formula: string, schoolSlug: string, options: intChartExportOptions): Observable<intChartFormulaResult[]> {
		return this.rest.post(`schools/export/${schoolSlug}`, { formula: formula })
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