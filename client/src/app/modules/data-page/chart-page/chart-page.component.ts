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
	title: string = 'Schools';
	searchResults: School[];
	schoolSlug: string = '';
	chartSlug: string = '';
	chartData: intChartExport;
	chartOptionsForm: FormGroup;
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
		let params = this.route.params;
		let queryVars = this.route.queryParams;
		params.flatMap(param => {
			return queryVars.map(qv => {
				return Object.assign({}, qv, param);
			})
		}).subscribe(params => {
			if (params.chart && params.school) {
				let options = _.fromPairs(Object.entries(params).filter(pair => pair[0] != "chart" && pair[0] != "school"));
				this.ChartService.fetchChart(params.chart, params.school, options)
					.subscribe(res => {
						if (!this.chartData) {
							//set ui and charts in case loading from link or refresh
							this._setState(res);
						}
						this._setChartData(res);
					});
			}
		});
	}

	createForm() {
		this.chartOptionsForm = this.fb.group({
			cut: '',
			inflationAdjusted: '',
		});
	}

	onSchoolSelect(school: intSchoolModel | null) {
		if (school) {
			this.selections.schoolSlug = school.slug;
			this._loadChart(this.selections.schoolSlug, this.selections.chartSlug);
		}
	}

	onChartSelect(chart: intChartModel) {
		if (chart) {
			this.selections.chartSlug = chart.slug;
			this._loadChart(this.selections.schoolSlug, this.selections.chartSlug);
		}
	}

	onCutByChange($event) {
		this._loadChart(this.chartData.school.slug, this.chartData.chart.slug);
	}

	onInflationChange($event) {
		this._loadChart(this.chartData.school.slug, this.chartData.chart.slug)
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
				!!this.chartData.chart.valueType.match(/currency.+/));
	}

	getChartOptionsVisible(): boolean {
		return this.chartOptionsVisible;
	}

	private _setState(res: intChartExport) {
		this.defaultModel = res.school;
		this.defaultChart = res.chart;
		this.selections.chartSlug = res.chart.slug;
		this.selections.schoolSlug = res.school.slug;
	}

	private _setChartData(res: intChartExport) {
		this._setOptions(res.options);
		this.chartData = res;
	}

	private _setOptions(options: intChartExportOptions) {
		options = Object.assign({ inflationAdjusted: null, cut: null }, options);
		this.chartOptionsForm.patchValue({
			cut: options.cut,
			inflationAdjusted: !!options.inflationAdjusted
		});
	}

	private _loadChart(schoolSlug: string, chartSlug: string): void {
		if (schoolSlug && chartSlug) {
			let optionString = "";
			if (this._selectionsAreNotNew(schoolSlug, chartSlug)) {
				optionString = this._formatQueryVars();
			}
			this.router.navigate([`data/charts/${schoolSlug}/${chartSlug}${optionString}`])
		}
	}

	private _selectionsAreNotNew(schoolSlug, chartSlug) {
		return schoolSlug === this.chartData.school.slug && chartSlug === this.chartData.chart.slug;
	}

	private _formatQueryVars(): string {
		let args: { [key: string]: any } = {}, str = "";
		if (this.chartOptionsForm.controls['cut'].value) {
			args.cut = this.chartOptionsForm.controls['cut'].value
		}
		if (this.chartOptionsForm.controls['inflationAdjusted'].value) {
			args.inflationAdjusted = this.chartOptionsForm.controls['inflationAdjusted'].value;
		}
		if (!_.isEmpty(args)) {
			str = "?" + Object.entries(args).map(pair => pair.join("=")).join("&");
		}
		return str;
	}
}
