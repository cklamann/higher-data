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
	title: string = 'Schools';
	searchResults: School[];
	schoolSlug: string = '';
	chartSlug: string = '';
	chartData$: Observable<intChartExport>;
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
				this.chartData$ = this.ChartService.fetchChart(params.school,params.chart, options)
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
		this._loadChart();
	}

	onInflationChange($event) {
		this._loadChart()
	}

	toggleChartOptionsVisible(): void {
		this.chartOptionsVisible = !this.chartOptionsVisible;
	}

	getChartOptionsVisible(): boolean {
		return this.chartOptionsVisible;
	}

	private _setUi(res: intChartExport) {
		this.defaultModel = res.school;
		this.defaultChart = res.chart;
		this.selections.chartSlug = res.chart.slug;
		this.selections.schoolSlug = res.school.slug;
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
			let optionString = "";
			optionString = this._formatQueryVars();
			this.router.navigate([`data/charts/${this.selections.schoolSlug}/${this.selections.chartSlug}${optionString}`])
		}
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
