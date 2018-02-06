import { Injectable, OnInit } from '@angular/core';
import { RestService } from '../../services/rest/rest.service';
import { intChartExport } from '../../../../server/src/models/ChartExporter';
import { Observable } from 'rxjs';

@Injectable()

export class ChartFactory {
	constructor(private rest: RestService) { }

	newChart(schoolSlug, chartSlug):Observable<intChartExport> {
		return this.rest.get(`schools/${schoolSlug}/charts/${chartSlug}`)

	}
}