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
	chartOptionsVisible: boolean = false;
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
			if (params.chart && params.school) {
				//todo: add third options argument here once _loadChart is passed it
				this.ChartService.fetchChart(params.chart, params.school)
					.subscribe(res => {
						if (!this.chartData) {
							this.defaultModel = res.school;
							this.defaultChart = res.chart;
							this.selections.chartSlug = res.chart.slug;
							this.selections.schoolSlug = res.school.slug;
						}
						this._setChartData(res);
					});
			}
		});

		this.route.queryParams.subscribe(params => {

		});
	}

	createForm() {
		this.chartFiltersForm = this.fb.group({
			filters: '',
			inflationAdjusted: '',
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
		//these really should be changing the url...
		this.chartData.options.cut = $event.value;
		//todo: call _loadChart instead
		this.ChartService.fetchChart(this.chartData.chart.slug, this.chartData.school.slug, this.chartData.options)
			.subscribe(res => this._setChartData(res));
	}

	onInflationChange($event) {
		//these really should be changing the url...
		this.chartData.options.infationAdjusted = $event.value;
		//todo: call _loadChart instead
		this.ChartService.fetchChart(this.chartData.school.slug, this.chartData.chart.slug, this.chartData.options)
			.subscribe(res => this._setChartData(res));
	}

	getChartTitle(): string {
		if (this.chartData) {
			return `${this.chartData.school.instnm} (${this.chartData.school.state}): ${this.chartData.chart.name}`;
		} else return "";
	}

	toggleChartOptionsVisible(): void {
		this.chartOptionsVisible = !this.chartOptionsVisible;
	}

	hasOptions(): boolean {
		return this.chartData &&
			(this.chartData.chart.cuts.length > 0 ||
				this.chartData.chart.valueType === "currency0");
	}

	getChartOptionsVisible(): boolean {
		return this.chartOptionsVisible;
	}

	private _setChartData(res: intChartExport) {
		//todo: once _loadChart passes in options, slice those off here and display them into ui filter form
		//so user knows what he's looking at
		this.chartData = res;
	}

	private _loadChart(): void {
		//todo: add options to query string
		//by principle, all data changes flow through url...
		if ((this.selections.chartSlug && this.selections.schoolSlug) || (this.chartData)) {
			this.router.navigate([`data/charts/${this.selections.schoolSlug}/${this.selections.chartSlug}`]);
		}
	}
}
