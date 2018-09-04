import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SiteContentComponent } from '../shared/site-content/site-content.component';
import { Router } from '@angular/router';
import { Charts } from '../../models/Charts';
import { BubbleStackChart } from '../chart/models/BubbleStackChart';
import { Schools } from '../../models/Schools';
import { intChartExport } from '../../../../server/src/modules/ChartExporter.module';
import { TrendChartComponent } from '../chart/components/trend-chart/trend-chart.component';
import { RestService } from '../../services/rest/rest.service';
import { states } from '../../services/data/states';
import { sectors } from '../../services/data/sectors';
import { intSchoolQueryArgs } from '../../../../server/src/routes/schoolData';
import { concatMap, first } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs/Rx';
import { ChartData } from '../chart/models/ChartData';
import * as _ from 'lodash';


@Component({
	selector: 'app-about-page',
	templateUrl: './about-page.component.html',
	styleUrls: ['./about-page.component.scss']
})
export class AboutPageComponent implements OnInit {

	@ViewChild('bubbleChart') bubbleChart: any;

	chartData: intChartExport;
	stabbr: string = "PA";
	bubbleSubscription: Subscription;
	private _chartData: any;
	constructor(private router: Router,
		private Charts: Charts,
		private Schools: Schools,
		private rest: RestService) { }

	ngOnInit() {
		// this.rest.getJsonP('https://gd.geobytes.com/GetCityDetails?callback=JSONP_CALLBACK')
		// 	.subscribe(res => {
		// 		let stabbr: string = res.json().geobytescode;
		// 		if (!states.find(state => state.abbreviation === stabbr)) {
		// 			stabbr = this.stabbr;
		// 		} else this.stabbr = stabbr;
		let schoolQuery: intSchoolQueryArgs = {
			match1var: 'state',
			match1vals: this.stabbr,
			match2var: 'sector',
			match2vals: '1',
			match3var: 'variable',
			match3vals: 'in_state_tuition',
			// match4var: 'fiscal_year',
			// match4vals: '2016',
			page: '1',
			ia: 'true',
			type: 'normal',
			perPage: '1',
			sort: 'value',
			order: 'desc'
		}

		let dataQuery: intSchoolQueryArgs = {
			match1var: 'unitid',
			match2var: 'variable',
			match2vals: 'in_state_tuition',
			type: 'normal',
			ia: 'true'
		}

		this._chartData = {
			chart: {
				name: 'My Little Chart',
				slug: 'my-little-chart',
				type: 'bubble-stack',
				category: 'finance',
				active: true,
				description: '',
				variables: [{
					formula: 'in_state_tuition',
					notes: '---',
					legendName: 'In-State Tuition'
				}],
				cuts: [],
				valueType: 'currency0'
			},
			school: {
				unitid: '11111',
				name: 'Does this Matter?',
				state: 'NO',
				city: 'NA',
				ein: '11111',
				sector: '0',
				locale: '1',
				hbcu: '0',
				slug: 'fake'
			},
			data: []
		};

		let that = this;

		let obs = Observable.create(observer => {
			let sector = 1;
			_fetch(sector);
			function _fetch(sector: number) {
				that.rest.get('school-data', Object.assign(schoolQuery, { match2vals: sector }))
					.pipe(
						first(),
						concatMap((res: any) => {
							let dqParams = Object.assign(dataQuery, { match1vals: res.data[0].unitid })
							return that.rest.get('school-data', dqParams);
						})
					)
					.subscribe(val => {
						observer.next(val);
						if (sector < 9) {
							sector++;
							_fetch(sector);
						}
					});
			}

		});

		this.bubbleSubscription = obs.subscribe(res => {
			if (!this.chartData) {
				this._chartData.data.push({ data: res.data, legendName: _lookupSector(1) });
				this.chartData = this._chartData;
			} else {
				let sector = res.data[0].sector;
				this.bubbleChart.chart.chartData.data.push(new ChartData([{
					data: res.data,
					legendName: _lookupSector(sector)
				}]).data[0]);
				this.bubbleChart.chart.draw();
			}
		});

		function _lookupSector(sector) {
			return sectors.find(sect => sect.number == sector).name;
		}

		//});
	}

	ngOnDestroy() {
		this.bubbleSubscription.unsubscribe();
	}

	goto(place: string) {
		this.router.navigate([`data/${place}`]);
	}

	getStateName() {
		return states.find(item => item.abbreviation === this.stabbr).name;
	}

	setChartEmpty($event) {
		//return console.log('i\'m setting chart empty');
	}


}