import { Component, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
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

	//should emit a message when the data is empty... and not display anything
	chart: BaseChart;
	myRandomSelector: string = "selector" + Math.floor(Math.random() * 10000)

	constructor(private ChartService: ChartService) {

	}

	ngOnInit() { //commented out to keep it from interfering
		// (() => {
		// 	window.addEventListener("resize", resizeThrottler, false);
		// 	var resizeTimeout;
		// 	function resizeThrottler() {
		// 		if (!resizeTimeout) {
		// 			resizeTimeout = setTimeout( () => {
		// 				resizeTimeout = null;
		// 				actualResizeHandler();
		// 			}, 150);
		// 		}
		// 	}

		// 	let actualResizeHandler = () => {
		// 		if(this.chart){
		// 			this.chart.redraw();
		// 		}
		// 	}

		// }) ();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.chartData && changes.chartData.currentValue && changes.chartData.currentValue.chart) {
			this.onChartDataChanges(changes.chartData);
		}
	}

	ngAfterViewInit() {
		//subscribe to changes here? I think so 
		//first, create a cold observable on the init hook
		//then onChartDataChanges will update it as fit
		//then the view hook will subscribe...
		//but first, a one-off solution
		console.log("view is ready", $("." + this.myRandomSelector));
		if(this.chart){ 
			this.chart.buildCanvas();
			this.chart.build();
		}
	}

	onChartDataChanges(chartDataChanges) {
		console.log("view not ready?", $("." + this.myRandomSelector));
		if (chartDataChanges.currentValue.data.length === 0) {
			if (this.chart) {
				this.chart.remove();
			}
			console.log("no datter!");
		}
		//if chart or school is new, fetch new chart
		else if (!chartDataChanges.previousValue ||
			!_.isEqual(chartDataChanges.previousValue.chart, chartDataChanges.currentValue.chart) ||
			!_.isEqual(chartDataChanges.previousValue.school, chartDataChanges.currentValue.school)) {
			if (this.chart) this.chart.remove();
			this.chart = this.ChartService.resolveChart(chartDataChanges.currentValue, this.myRandomSelector, this.chartOverrides);
		}
		//if only the data changed, redraw current chart
		else if (_.isEqual(chartDataChanges.previousValue.chart, chartDataChanges.currentValue.chart) &&
			!_.isEqual(chartDataChanges.previousValue.data, chartDataChanges.currentValue.data)) {
			this.chart.chartData = new ChartData(chartDataChanges.currentValue.data);
			this.chart.draw(); //this doesn't need a timeout...
		}
	}

}
