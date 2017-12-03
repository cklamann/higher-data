//note that a component IS a directive -- a directive with a template
//others are things like ngIf or ngModel
import { Component, OnInit } from '@angular/core';
import { RestService } from '../../../services/rest/rest.service';


@Component({ //meta-data, telling angular about your class, can also list providers
	selector: 'app-root', //element or class to assosicate with the directive
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
	//if providers are listed here, they will be unique for each component instance
})
export class AppComponent implements OnInit { //every component exports a class, this has one property
	title: string = 'Schlapp';
	schmitle: string = 'papppppowwww';
	rest: RestService;
	data: Object = {res:''};
	//DI is a coding pattern in which a class receives its dependencies from external sources rather than creating them itself.
	//this makes it much easier to test, since you can new up services on the fly and thus easily build up testing environments
	constructor(Rest: RestService) {
		this.rest = Rest;
	}
	ngOnInit(): void {
		this.rest.get(`schools`).subscribe(res => {
			this.data = res;
			console.log(this.data);
		});

		this.rest.get(`schools/search?name=Northwestern`).subscribe(res => {
			this.data = res;
			console.log(this.data);
		});
	};

}
