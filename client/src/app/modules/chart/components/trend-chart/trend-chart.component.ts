import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartService } from '../../ChartService.service';
import { Charts } from '../../../../models/Charts';
import { RestService } from '../../../../services/rest/rest.service';
import { intChartExport } from '../../../../../../server/src/models/ChartExporter';
import { BaseChart } from '../../models/BaseChart';
import { ChartData } from '../../models/ChartData';
import * as _ from 'lodash';

@Component({
	selector: 'app-trend-chart',
	templateUrl: './trend-chart.component.html',
	styleUrls: ['./trend-chart.component.scss'],
	providers: [ChartService]
})


export class TrendChartComponent implements OnInit {

	@Input() chartData: intChartExport;
	@Input() chartOverrides: object = {};
	chart: BaseChart;
	myRandomSelector: string = "selector" + Math.floor(Math.random() * 10000)

	constructor(private ChartService: ChartService) {

	}

	ngOnInit() {
		// problem was that having this method on base chart seemed to confuse d3
		// it wasn't updating the way it was supposed to
		// method should wipe out image, hold onto data, redraw chart
		// not working by brute force method below, likely for the same reasons it wasn't working before
		// but i think the listeners are maybe getting called 
		// yea I think onChartDataChanges sees the change and tries to update and fails
		// before, was setting ChartData to null, then reupping, but that fires the watcher and creates chaos
		// better to have a clear way of doing it right 
		window.addEventListener('resize', () => {
			 this.chart.remove();
			 this.chart.buildCanvas();
			 this.chart.build();
		}, false);

	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.chartData && changes.chartData.currentValue && changes.chartData.currentValue.chart) {
			this.onChartDataChanges(changes.chartData);
		}
	}

	onChartDataChanges(chartDataChanges) {
		if (chartDataChanges) {
			//if chart or school is new, fetch new chart
			if (!chartDataChanges.previousValue ||
				!_.isEqual(chartDataChanges.previousValue.chart, chartDataChanges.currentValue.chart) ||
				!_.isEqual(chartDataChanges.previousValue.school, chartDataChanges.currentValue.school)) {
				if (this.chart) this.chart.remove();
				this.chart = this.ChartService.resolveChart(chartDataChanges.currentValue, this.myRandomSelector, this.chartOverrides);
				this.chart.draw();
			}
			//if only the data changed, redraw current chart
			else if (_.isEqual(chartDataChanges.previousValue.chart, chartDataChanges.currentValue.chart) &&
				!_.isEqual(chartDataChanges.previousValue.data, chartDataChanges.currentValue.data)) {
				this.chart.chartData = new ChartData(chartDataChanges.currentValue.data);
				this.chart.draw();
			}
		}
	}

}
