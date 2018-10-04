import { Component, AfterViewInit, OnChanges, Input, SimpleChanges, HostListener } from '@angular/core';
import { Charts } from '../../../../models/Charts';
import { RestService } from '../../../../services/rest/rest.service';
import { intChartExport } from '../../../../../../server/src/modules/ChartExporter.module';
import { BaseChart } from '../../models/BaseChart';
import { ChartData } from '../../models/ChartData';
import { EventEmitter, Output } from '@angular/core'
import * as _ from 'lodash';

@Component({
	selector: 'app-trend-chart',
	templateUrl: './trend-chart.component.html',
	styleUrls: ['./trend-chart.component.scss']
})


export class TrendChartComponent {

	@Input() chartData: intChartExport;
	@Input() chartOverrides: object = {};
	@Output() onChartEmpty: EventEmitter<boolean> = new EventEmitter<boolean>();

	chart: BaseChart;
	myRandomSelector: string = "selector" + Math.floor(Math.random() * 10000);

	constructor(private Charts: Charts) { }

	@HostListener('window:resize', ['$event'])
	resizeThrottler() {
		let resizeTimeout;
		if (!resizeTimeout) {
			resizeTimeout = setTimeout(() => {
				resizeTimeout = null;
				actualResizeHandler();
			}, 150);
		}
		let actualResizeHandler = () => {
			if (this.chart) {
				this.chart.redraw();
			}
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.chartData && changes.chartData.currentValue && changes.chartData.currentValue.chart) {
			this.onChartDataChanges(changes.chartData);
		}
	}

	ngAfterViewInit() {
		//if first load, wait till template is drawn before loading chart
		if (this.chart) {
			this.chart.buildCanvas();
			this.chart.build();
		}
	}

	onChartDataChanges(chartDataChanges) {
		let chartEmpty = false;
		if (!chartDataChanges.currentValue.data.some(datum => datum.data.length > 0)) {
			if (this.chart) {
				this.chart.chartData = new ChartData(chartDataChanges.currentValue.data);
				this.chart.remove();
			}
			chartEmpty = true;
		}
		//if chart or school is new, fetch new chart
		else if (!chartDataChanges.previousValue ||
			!_.isEqual(chartDataChanges.previousValue.chart, chartDataChanges.currentValue.chart) ||
			!_.isEqual(chartDataChanges.previousValue.school, chartDataChanges.currentValue.school)) {
			if (this.chart) this.chart.remove();
			this.chart = this.Charts.resolveChart(chartDataChanges.currentValue, this.myRandomSelector, this.chartOverrides);
		}
		//if only the data changed, redraw current chart
		else if (_.isEqual(chartDataChanges.previousValue.chart, chartDataChanges.currentValue.chart) &&
			!_.isEqual(chartDataChanges.previousValue.data, chartDataChanges.currentValue.data)) {
			this.chart.chartData = new ChartData(chartDataChanges.currentValue.data);
			this.chart.draw();
		}
		this.onChartEmpty.emit(chartEmpty);
	}

}
