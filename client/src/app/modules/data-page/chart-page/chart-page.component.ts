import { Component, OnInit } from '@angular/core';
import { Schools, School } from '../../../models/Schools';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { intSchoolModel } from '../../../../../server/src/schemas/SchoolSchema';
import { intChartModel } from '../../../../../server/src/schemas/ChartSchema';
import { ChartService } from '../../../modules/chart/ChartService.service';
import { intChartExport } from '../../../../../server/src/models/ChartExporter';
import { TrendChartComponent } from '../../chart/components/trend-chart/trend-chart.component'
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { intBaseChartDatum } from '../../chart/models/ChartData';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import * as _ from 'lodash';

@Component({
	selector: 'chart-page',
	templateUrl: './chart-page.component.html',
	styleUrls: ['./chart-page.component.scss'],
	providers: [ChartService]
})
export class ChartPageComponent implements OnInit {
	title: string = 'Schools';
	searchResults: School[];
	schoolSlug: string = '';
	chartSlug: string = '';
	chartData: intChartExport;
	chartFiltersForm: FormGroup;
	defaultModel: intSchoolModel;
	defaultChart: intChartModel;
	selections: {
		chartSlug: string,
		schoolSlug: string
	} = { chartSlug: null, schoolSlug: null };

	constructor(public Schools: Schools,
		private ChartService: ChartService,
		private fb: FormBuilder,
		private route: ActivatedRoute,
		private router: Router) { }

	ngOnInit(): void {
		this.createForm();
		this.route.params.subscribe(params => {
			this.ChartService.fetchChart(params.chart, params.school)
				.subscribe(res => {
					if (!this.chartData) {
						this.defaultModel = res.school;
						this.defaultChart = res.chart;
						this.selections.chartSlug = res.chart.slug;
						this.selections.schoolSlug = res.school.slug;
					}
					this.chartData = res;

				});
		});

		this.route.queryParams.subscribe(params => {

		});
	}

	createForm() {
		this.chartFiltersForm = this.fb.group({
			filters: ''
		});
	}

	onSchoolSelect(school: intSchoolModel | null) {
		if (school) {
			this.selections.schoolSlug = school.slug;
			this._loadChart();
		}
	}

	onChartSelect(chart: intChartModel) {
		if (chart) {
			this.selections.chartSlug = chart.slug;
			this._loadChart();
		}
	}

	onCutByChange($event) {
		//add cutBy param to url/query
	}

	onInflationChange($event) {
		console.log($event.value ? "checked" : "not checked");
	}

	private _loadChart() {
		if ((this.selections.chartSlug && this.selections.schoolSlug) || (this.chartData)) {
			this.router.navigate([`data/charts/${this.selections.schoolSlug}/${this.selections.chartSlug}`]);
		}
	}
}
