import { Component, OnInit, QueryList, Input, Output, EventEmitter, ViewChildren} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect, MatOption } from '@angular/material';
import { Charts } from '../../../models/Charts';
import { intChartModel } from '../../../../../server/src/schemas/ChartSchema';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/first';


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
			.switchMap(res => {
				this.charts = res;
				return this.options.changes;
			})
			.first()
			.subscribe(change => {
				if (change.length) {
					change.forEach(option => {
						if (option.value.slug == this.defaultChart.slug) {
							//avoid viewsetaftercheck error
							//todo: replace with better solution once angular solves it
							setTimeout(() => {
								option['_selectViaInteraction']();
							});

						}
					});
				}
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
