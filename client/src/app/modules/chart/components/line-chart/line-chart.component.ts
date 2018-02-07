import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartFactory } from '../../ChartFactory.factory';
import { Charts } from '../../../../models/Charts';
import { RestService } from '../../../../services/rest/rest.service';
import { intChartExport } from '../../../../../../server/src/models/ChartExporter';
import { LineChart } from '../../models/LineChart';

@Component({
	selector: 'app-line-chart',
	templateUrl: './line-chart.component.html',
	styleUrls: ['./line-chart.component.scss'],
	providers: [ChartFactory]
})


export class LineChartComponent implements OnInit {

	@Input() chartData: intChartExport;
	@Input() chartOverrides: object = {};
	chart: LineChart;
	myRandomSelector: string = "selector" + Math.floor(Math.random() * 10000)

	constructor() {

	}

	ngOnInit() {

	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.chartData && changes.chartData.currentValue && changes.chartData.currentValue.chart.type == 'line') {
			if (this.chart) this.chart.remove();
			this.chart = new LineChart(changes.chartData.currentValue, this.myRandomSelector, this.chartOverrides); 
			this.chart.draw();
		}
	}

}
