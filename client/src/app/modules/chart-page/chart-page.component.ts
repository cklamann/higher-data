import { Component, OnInit } from '@angular/core';
import { Schools, School } from '../../models/Schools';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { intSchoolModel } from '../../../../server/src/schemas/SchoolSchema';
import { intChartModel } from '../../../../server/src/schemas/ChartSchema';
import { ChartService } from '../../modules/chart/ChartService.service';
import { intChartExport } from '../../../../server/src/models/ChartExporter';
import { TrendChartComponent } from '../chart/components/trend-chart/trend-chart.component'
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { intBaseChartDatum } from '../chart/models/ChartData';


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
	chartData: intChartExport; //todo: make this an array of data that we can pass to ChartDataExposed
	chartDataExposed: intChartExport;
	chartFiltersForm: FormGroup;
	constructor(public Schools: Schools, private ChartService: ChartService, private fb: FormBuilder) { }

	ngOnInit(): void {
		this.createForm();
	}

	createForm() {
		this.chartFiltersForm = this.fb.group({
			filters: ''
		});
	}

	onSchoolSelect(school: intSchoolModel | null) {
		this.school = school;
		this._loadChart();
	}

	onChartSelect(chart: intChartModel) {
		this.chart = chart;
		this._loadChart();
	}

	onCutByChange($event) {
		this.ChartService.cutChartDataBy($event.value, this.school.slug, _.cloneDeep(this.chartData))
			.subscribe(res => {
				this.chartDataExposed = res;
			});
	}

	private _loadChart() {
		if (this.chart && this.school) {
			this.ChartService.fetchChart(this.school.slug, this.chart.slug)
				.subscribe(res => {
					this.chartData = res
					this.chartDataExposed = _.cloneDeep(res);
				});
		}
	}

	//todo: 'redirect' to this page with slugs as route params
	//the feed route params to api, this will create stable links for all charts

}
