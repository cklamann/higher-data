import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';


@Component({
  selector: 'app-chart-search',
  templateUrl: './chart-search.component.html',
  styleUrls: ['./chart-search.component.scss']
})
export class ChartSearchComponent implements OnInit {
	searchForm: FormGroup;
	searchTerm: string;
	selectedChart: any; //todo: replace these with chartModel
	autocompleteResults: any[];
	constructor(private fb: FormBuilder /*,private Charts: any*/) { //Charts should be new Chart model that doesn't exist yet
		this.createForm();
	}

	ngOnInit() {
		this.listenForSearchChanges(); 
	}

	createForm() {
		this.searchForm = this.fb.group({
			searchText: ['', [Validators.minLength(3), Validators.required]],
		});
	}

	listenForSearchChanges(): void {
		this.searchForm.valueChanges.debounceTime(500).subscribe(input => {
			if (input.searchText.length > 3 && input.searchText != this.searchTerm) {
				this.searchTerm = input.searchText;
				this.Charts.search(`${input.searchText}`).subscribe(res => {
					this.autocompleteResults = res;
				});
			}
		});
	}

	showChartName(chart: any): any {
		return chart ? chart.getName() : chart;
	}
}
