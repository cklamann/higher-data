import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartService } from '../../ChartService.service';
import { Charts } from '../../../../models/Charts';
import { RestService } from '../../../../services/rest/rest.service';
import { intChartExport } from '../../../../../../server/src/models/ChartExporter';
import { LineChart } from '../../models/LineChart';

@Component({
	selector: 'app-trend-chart',
	templateUrl: './trend-chart.component.html',
	styleUrls: ['./trend-chart.component.scss'],
	providers: [ChartService]
})


export class TrendChartComponent implements OnInit {

	@Input() chartData: intChartExport;
	@Input() chartOverrides: object = {};
	chart: LineChart;
	myRandomSelector: string = "selector" + Math.floor(Math.random() * 10000)

	constructor() {

	}

	ngOnInit() {

	}

	//to refactor: 
	  // 2) delegate chart-type determination to ChartService
	//idea is that any trend chart can pass into here, depending -- either a line or an area chart -- handle the details in the factory

	ngOnChanges(changes: SimpleChanges) {
		if (changes.chartData && changes.chartData.currentValue && changes.chartData.currentValue.chart.type == 'line') {
			if (this.chart) this.chart.remove();
			
			//this.chart = ChartService.resolveChart(changes.chartData.currentValue, this.myRandomSelector, this.chartOverrides);
			this.chart = new LineChart(changes.chartData.currentValue, this.myRandomSelector, this.chartOverrides); 
			this.chart.draw();
		}
	}

}
