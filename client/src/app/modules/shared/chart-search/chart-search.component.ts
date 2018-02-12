import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material';
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
	@Output() 
	onChartSelect: EventEmitter<intChartModel> = new EventEmitter<intChartModel>();
	charts: intChartModel[] = [];

	constructor(private fb: FormBuilder, private Charts: Charts) {
		this.createForm();
	}

	ngOnInit() {
		this.Charts.fetchAll()
			.subscribe(res => this.charts = res);
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
