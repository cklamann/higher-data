//note that a component IS a directive -- a directive with a template
//directives without templates are things like ngIf or ngModel
import { Component, OnInit } from '@angular/core';
import { School,SchoolModel } from '../../../models/School';

@Component({ //meta-data, telling angular about your class, can also list providers
	selector: 'app-root', //element or class to assosicate with the directive
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
	//if providers are listed here, they will be unique for each component instance
})
export class AppComponent implements OnInit { //every component exports a class, this has one property
	//type declarations -- static vars can be defined here
	title: string = 'Schlapp';
	schmitle: string = 'papppppowwww';
	searchResults: SchoolModel[];
	School: School;
	//DI is a coding pattern in which a class receives its dependencies from external sources rather than creating them itself.
	//this makes it much easier to test, since you can new up services on the fly and thus easily build up testing environments
	constructor(School:School) { //note the over-declarations... apparently only needed for componenets
		this.School = School;
	}

	ngOnInit(): void {
		this.School.search('Northwestern').subscribe(res => {
			this.searchResults = res;
			this.searchResults.forEach( school => console.log(school.getName()));
		});

	}

}
