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
			//todo: strip url encoding off...
			//actually, what it's doing is url encoding the percentage signs (%25 is pct)
			//from the previous url encoding
			//so anything that starts with %25 has been double encoded and will end up appended to the
			//last param, so it needs to be stripped along with everything after it
			return queryVars.map(qv => {
				return Object.assign({}, qv, param);
			})
		}).subscribe(params => {
			console.log(params);
			if (params.chart && params.school) {
				let options = _.fromPairs(Object.entries(params).filter(pair => pair[0] != "chart" && pair[0] != "school"));
				this.ChartService.fetchChart(params.chart, params.school, options)
					.subscribe(res => { //in case we're loading from a link
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
		this.chartData.options.cut = $event.value; //why bother? just check the form on the caller
		this._loadChart(this.chartData.school.slug, this.chartData.chart.slug);
	}

	onInflationChange($event) {
		this.chartData.options.inflationAdjusted = $event.value;//todo:remove these
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
				this.chartData.chart.valueType === "currency0");
	}

	getChartOptionsVisible(): boolean {
		return this.chartOptionsVisible;
	}

	private _setChartData(res: intChartExport) {
		this._setOptions(res.options);
		this.chartData = res;
	}

	private _setOptions(options: intChartExportOptions) {
		options = Object.assign({ inflationAdjusted: null, cut: null }, options);
		//not sure this is working really, seems to work on second pass, need to update radios	
		//problem is the values are strings and need to be boolean....
		this.chartOptionsForm.setValue(options);
		console.log(this.chartOptionsForm.value);
	}

	//todo: don't pipe in empty values on options, strip those out...
	private _loadChart(schoolSlug: string, chartSlug: string): void {
		console.log(this.chartOptionsForm.value);
		if (schoolSlug && chartSlug) {
			let optionString = this.chartOptionsForm.value ?
				"?" + Object.entries(this.chartOptionsForm.value).map(pair => pair.join("=")).join("&") : "";
			this.router.navigate([`data/charts/${schoolSlug}/${chartSlug}${optionString}`])
		}
	}
}
