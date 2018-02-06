import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartFactory } from '../../ChartFactory.factory';
import { Charts } from '../../../../models/Charts';
import { RestService } from '../../../../services/rest/rest.service';
import { intChartExport } from '../../../../../../server/src/models/ChartExporter';
import { LineChart } from '../../models/LineChart';

@Component({
	selector: 'app-line-chart',
	templateUrl: './line-chart.component.html',
	styleUrls: ['./line-chart.component.scss']
})

// todo: methinks this should just be a generic chart component
// it checks the type on chartData.chart.type and news up the proper chart using the factory
// hmm that would mean returning the instantiation logic to the factory
// I like this idea
// also, fucking angular's new watching stuff sucks --> todo: turn these values into observables
// and just watch them like so: https://stackoverflow.com/questions/38571812/how-to-detect-when-an-input-value-changes-in-angular

export class LineChartComponent implements OnInit {

	@Input() chartData: intChartExport; 

	constructor() { 
		 
	}

	ngOnInit() {

	}

}
