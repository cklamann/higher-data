import { Component, OnInit } from '@angular/core';
import { Schools, School } from '../../models/Schools';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';

@Component({ //meta-data, telling angular about your class, can also list providers
	selector: 'chart-page', //element or class to assosicate with the directive
	templateUrl: './chart-page.component.html',
	styleUrls: ['./chart-page.component.scss']
	//if providers are listed here, they will be unique for each component instance
})
export class ChartPageComponent implements OnInit { //every component exports a class, this has one property
	//type declarations -- static vars can be defined here as well
	title: string = 'Schools';
	searchResults: School[];
	constructor(public Schools: Schools) { 
	}

	ngOnInit(): void {

	}

}
