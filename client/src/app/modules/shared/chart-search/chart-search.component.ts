import { Component, OnInit, QueryList, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChildren, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect, MatOption } from '@angular/material';
import { Charts } from '../../../models/Charts';
import { intChartModel } from '../../../../../server/src/schemas/ChartSchema';
import 'rxjs/add/operator/debounceTime';


@Component({
	selector: 'app-chart-search',
	templateUrl: './chart-search.component.html',
	styleUrls: ['./chart-search.component.scss']
})

export class ChartSearchComponent implements OnInit {
	chartSelectForm: FormGroup;

	@Input()
	defaultChart: intChartModel;

	@Output()
	onChartSelect: EventEmitter<intChartModel> = new EventEmitter<intChartModel>();

	@ViewChildren(MatOption) options: QueryList<MatOption>;

	charts: intChartModel[] = [];

	constructor(private fb: FormBuilder, private Charts: Charts) {
		this.createForm();
	}

	ngOnInit() {
		this.Charts.fetchAll()
			.subscribe(res => {
				this.options.changes.subscribe(change => {
					if (change.length) {
						change.forEach(option => {
							if (option.value.slug == this.defaultChart.slug) {
								//hack: https://github.com/angular/material2/issues/7246, throws check error, fix
								//note that this is a dev error only...
								//https://blog.angularindepth.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4
								option['_selectViaInteraction']();
							}
						});
					}
				});
				this.charts = res
			});
		this.listenForSearchChanges();
	}

	createForm() {
		this.chartSelectForm = this.fb.group({
			chart: [''],
		});
	}

	listenForSearchChanges(): void {
		this.chartSelectForm.valueChanges.debounceTime(500).subscribe(input => {
			this.onChartSelect.emit(input.chart);
		});
	}
}
