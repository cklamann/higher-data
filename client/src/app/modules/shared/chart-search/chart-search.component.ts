import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material';
import { Charts } from '../../../models/Charts';
import { intChartModel } from '../../../../../server/src/schemas/ChartSchema';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';


@Component({
	selector: 'app-chart-search',
	templateUrl: './chart-search.component.html',
	styleUrls: ['./chart-search.component.scss']
})
export class ChartSearchComponent implements OnInit {
	chartSelectForm: FormGroup;
	selectedChart: intChartModel;
	charts: intChartModel[] = [];
	constructor(private fb: FormBuilder, private Charts: Charts) {
		this.createForm();
	}

	ngOnInit() {
		this.Charts.fetchAll()
			.subscribe(res => this.charts = res);
		//intitialize listen for changes to select box
	}

	createForm() {
		this.chartSelectForm = this.fb.group({
			chart: [''],
		});
	}

	// todo: create listener function -- should emit chart object on selection

}
