import { Injectable, OnInit } from '@angular/core';
import { RestService } from '../../services/rest/rest.service';
import { intChartExport } from '../../../../server/src/models/ChartExporter';
import { Observable } from 'rxjs';
import { LineChart } from './models/LineChart';

@Injectable()

export class ChartFactory {
	constructor(private rest: RestService) { }

	fetchChart(schoolSlug:string, chartSlug:string):Observable<intChartExport> {
		return this.rest.get(`schools/${schoolSlug}/charts/${chartSlug}`);
	}

	fetchPreview(variable:string,schoolSlug:string):Observable<intChartExport> {
		return this.rest.get(`variables/${variable}/preview/${schoolSlug}`);
	}
}