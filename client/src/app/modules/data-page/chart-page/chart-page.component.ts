import { Component, OnInit } from '@angular/core';
import { Schools, School } from '../../../models/Schools';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { intSchoolModel } from '../../../../../server/src/schemas/SchoolSchema';
import { intChartModel } from '../../../../../server/src/schemas/ChartSchema';
import { ChartService } from '../../../modules/chart/ChartService.service';
import { intChartExport, intChartExportOptions } from '../../../../../server/src/models/ChartExporter';
import { TrendChartComponent } from '../../chart/components/trend-chart/trend-chart.component'
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { intBaseChartDatum } from '../../chart/models/ChartData';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/switchMap';

@Component({
	selector: 'chart-page',
	templateUrl: './chart-page.component.html',
	styleUrls: ['./chart-page.component.scss'],
	providers: [ChartService]
})

export class ChartPageComponent implements OnInit {
	chartData: intChartExport;
	chartOptionsForm: FormGroup;
	chartOptionsVisible: boolean = false;
	private _chartEmpty: boolean = false;
	private _inflationAdjusted: boolean = false;
	private _cut: string = '';
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
		let params = this.route.params;
		let queryVars = this.route.queryParams;
		params.flatMap(param => {
			return queryVars.map(qv => {
				return Object.assign({}, qv, param);
			})
		}).subscribe(params => {
			if (params.chart && params.school) {
				let options = _.fromPairs(Object.entries(params).filter(pair => pair[0] != "chart" && pair[0] != "school"));
				this.ChartService.fetchChart(params.school, params.chart, options)
					.subscribe(data => this.chartData = data);
				this._setUi(params.school, params.chart);
				this._setOptions(options);
			}
		});
	}

	createForm() {
		this.chartOptionsForm = this.fb.group({
			cut: '',
			inflationAdjusted: '',
		});

		this.chartOptionsForm.get('inflationAdjusted').valueChanges.subscribe(change => {
			this._inflationAdjusted = change;
		})

		this.chartOptionsForm.get('cut').valueChanges.subscribe(change => {
			this._cut = change;
		})
	}

	getChartEmpty() {
		return this._chartEmpty;
	}

	getChartIsCurrency() {
		return this.chartData && !!this.chartData.chart.valueType.match(/currency.+/);
	}

	getChartTitle() {
		if (this.chartData) {
			let cutName = this._cut ? "Per " + this.chartData.chart.cuts.find(item => item.formula == this._cut).name : ""
			return this.chartData ? `${this.chartData.school.instnm} (${this.chartData.school.state}) ${this.chartData.chart.name} ${cutName}` : "";
		}
	}

	getIsInflationAdjusted() {
		return !!this._inflationAdjusted;
	}

	getDefaultModel() {
		return this.chartData ? this.chartData.school : null;
	}

	getDefaultChart() {
		return this.selections.chartSlug ? this.selections.chartSlug : null;
	}

	onSchoolSelect(school: intSchoolModel | null) {
		if (school) {
			this.selections.schoolSlug = school.slug;
			this.chartOptionsForm.reset();
			this._loadChart();
		}
	}

	onChartSelect(chart: intChartModel) {
		if (chart) {
			this.selections.chartSlug = chart.slug;
			this.chartOptionsForm.reset()
			this._loadChart();
		}
	}

	onCutByChange($event) {
		this._loadChart();
	}

	onInflationChange($event) {
		this._loadChart()
	}

	setChartEmpty($event) {
		setTimeout(() => {
			this._chartEmpty = $event;
		})
	}

	toggleChartOptionsVisible(): void {
		this.chartOptionsVisible = !this.chartOptionsVisible;
	}

	getChartOptionsVisible(): boolean {
		return this.chartOptionsVisible;
	}

	private _setUi(schoolSlug: string, chartSlug: string) {
		this.selections.chartSlug = chartSlug;
		this.selections.schoolSlug = schoolSlug;
	}

	private _setOptions(options: intChartExportOptions) {
		options = Object.assign({ inflationAdjusted: null, cut: null }, options);
		this.chartOptionsForm.patchValue({
			cut: options.cut,
			inflationAdjusted: !!options.inflationAdjusted
		});
	}

	private _loadChart(): void {
		if (this.selections.schoolSlug && this.selections.chartSlug) {
			let options = _.pickBy(this.chartOptionsForm.value, (v, k) => !_.isNil(v) && v != "");
			this.router.navigate([`data/charts/${this.selections.schoolSlug}/${this.selections.chartSlug}`, options]);
		}
	}
}
