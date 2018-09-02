import { Component, OnInit } from '@angular/core';
import { SiteContentComponent } from '../shared/site-content/site-content.component';
import { Router } from '@angular/router';
import { Charts } from '../../models/Charts';
import { Schools } from '../../models/Schools';
import { intChartExport } from '../../../../server/src/modules/ChartExporter.module';
import { TrendChartComponent } from '../chart/components/trend-chart/trend-chart.component';
import { RestService } from '../../services/rest/rest.service';
import { states } from '../../services/data/states';
import { sectors } from '../../services/data/sectors';
import { intSchoolQueryArgs } from '../../../../server/src/routes/schoolData';
import { switchMap } from 'rxjs/operators';

@Component({
	selector: 'app-about-page',
	templateUrl: './about-page.component.html',
	styleUrls: ['./about-page.component.scss']
})
export class AboutPageComponent implements OnInit {

	chartData: intChartExport;
	constructor(private router: Router,
		private Charts: Charts,
		private Schools: Schools,
		private rest: RestService) { }

	ngOnInit() {
		this.rest.getJsonP('http://gd.geobytes.com/GetCityDetails?callback=JSONP_CALLBACK')
			.subscribe(res => {
				let stabbr: string = res.json().geobytescode;
				if (!states.find(state => state.abbreviation === stabbr)) {
					stabbr = "NY";
				}
				//first fetch the school with the highest val
				let schoolQuery: intSchoolQueryArgs = {
					match1var: 'state',
					match1vals: stabbr,
					match2var: 'sector',
					match2vals: '1',
					match3var: 'variable',
					match3vals: 'total_net_assets',
					page: '1',
					type: 'normal',
					perPage: '1',
					sort: 'value',
					order: 'desc'
				}

				let dataQuery: intSchoolQueryArgs = {
					match1var: 'unitid',
					match2var: 'variable',
					match2vals: 'total_net_assets',
					type: 'normal'
				}

				this.rest.get('school-data', schoolQuery).pipe(
					// switchMap(res => {
					// 	let dqParams = Object.assign(dataQuery, { match1vals: res.data[0].unitid })
					// 	return this.rest.get('school-data', dqParams);
					// }),
					switchMap(res => {
						return this.Schools.fetch(res.data[0].unitid);
					}),
					switchMap(res => {
						return this.Charts.fetchChart(res.slug, 'loan-bubble')
					})
				).subscribe(x => this.chartData = x);

				//todo => once school data is set, kick off second process of populating 
				//chart with other data, repeating schoolQuery/DataQuery for each sector 
				//and pushing results into chart

			});

	}

	goto(place: string) {
		this.router.navigate([`data/${place}`]);
	}

	setChartEmpty() {
		return console.log('...');
	}

}
