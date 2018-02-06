import { Injectable, OnInit } from '@angular/core';
import { LineChart } from './models/LineChart';
import { RestService } from '../../services/rest/rest.service';
import { intChartExport } from '../../../../server/src/models/ChartExporter';

@Injectable()

export class ChartFactory {
	constructor(public LineChart: LineChart, private rest: RestService) { }

	newChart(schoolSlug, chartSlug, displayOptions) {

		this.rest.get(`schools/${schoolSlug}/charts/${chartSlug}`)
			.subscribe((chart: intChartExport) => {
				if (chart.chart.type == "line") {
					return new LineChart(chart);
				}
			})

	}
}