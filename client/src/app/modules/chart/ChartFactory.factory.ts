import { Injectable, OnInit } from '@angular/core';
import { RestService } from '../../services/rest/rest.service';
import { intChartExport } from '../../../../server/src/models/ChartExporter';
import { Observable } from 'rxjs';
import { LineChart } from './models/LineChart';

@Injectable()


// note that this isn't much of a factory, more just like a fetcher, 
//i guess this is where we would do things like adjust for inflation and anything the fe needs to do

export class ChartFactory {
	constructor(private rest: RestService) { }

	fetchChart(schoolSlug:string, chartSlug:string):Observable<intChartExport> {
		return this.rest.get(`schools/${schoolSlug}/charts/${chartSlug}`);
	}

	//todo: rename to fetchVariablePreview
	fetchPreview(variable:string,schoolSlug:string):Observable<intChartExport> {
		return this.rest.get(`variables/${variable}/preview/${schoolSlug}`);
	}

	//note: to fetch a preview without saving, need to pass back the chart model in a post, not the chart slug
}