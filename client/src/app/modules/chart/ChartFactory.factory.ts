import { Injectable } from '@angular/core';
import { LineChart } from './models/LineChart';

@Injectable()

export class ChartFactory {
	constructor(public LineChart: LineChart){}

	newChart(data,displayOptions){
		if(displayOptions.type == "line"){
			return new LineChart(data,displayOptions);
		}	
	}
}