import { Component, OnInit } from '@angular/core';
import { Schools, School } from '../../models/Schools';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { intSchoolModel } from '../../../../server/src/schemas/SchoolSchema';
import { intChartModel } from '../../../../server/src/schemas/ChartSchema';
import { ChartService } from '../../modules/chart/ChartService.service';
import { intChartExport } from '../../../../server/src/models/ChartExporter';
import { TrendChartComponent } from '../chart/components/trend-chart/trend-chart.component'

@Component({
	selector: 'chart-page',
	templateUrl: './chart-page.component.html',
	styleUrls: ['./chart-page.component.scss'],
	providers: [ChartService]
})
export class ChartPageComponent implements OnInit {
	title: string = 'Schools';
	searchResults: School[];
	school: intSchoolModel;
	chart: intChartModel;
	chartData: intChartExport;
	constructor(public Schools: Schools, private ChartService: ChartService) { }

	ngOnInit(): void {

	}

	onSchoolSelect(school: intSchoolModel | null) {
		this.school = school;
		this._loadChart();
	}

	onChartSelect(chart: intChartModel) {
		this.chart = chart;
		this._loadChart();
	}

	private _loadChart() {
		if (this.chart && this.school) {
			this.ChartService.fetchChart(this.school.slug, this.chart.slug)
				.subscribe(res => {
					this.chartData = res
				});
		}
	}

	//todo: 'redirect' to this page with slugs as route params
	//the feed route params to api, this will create stable links for all charts

	//pattern: once data is loaded, then can just have a bunch of chart directives sitting there waiting for the data

}
