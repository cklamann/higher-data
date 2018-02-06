import { Component, OnInit, Input } from '@angular/core';
import { ChartFactory } from '../../ChartFactory.factory';
import { Charts } from '../../../../models/Charts';
import { RestService } from '../../../../services/rest/rest.service';

@Component({
	selector: 'app-line-chart',
	templateUrl: './line-chart.component.html',
	styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit {

	@Input() chartSlug: string;
	@Input() schoolSlug: string;

	constructor(private ChartFactory: ChartFactory) { 
		 

	}

	ngOnInit() {
		//fetch chart from backend route that's not defined yet
		//let chart = new Chart(nwData.unitid, testChartValidAddition.slug);

	}

}
