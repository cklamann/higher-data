//note that a component IS a directive -- a directive with a template
//others are things like ngIf or ngModel
import { Component, OnInit } from '@angular/core';
import { RestService } from '../../../services/rest/rest.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
// inline type annotation

interface Post {
	id: string,
	title: string,
	body: string
}

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
	data: Object = { res: '' };
	rest: RestService;
	http: HttpClient;
	//DI is a coding pattern in which a class receives its dependencies from external sources rather than creating them itself.
	//this makes it much easier to test, since you can new up services on the fly and thus easily build up testing environments
	constructor(rest: RestService, http:HttpClient) { 
		this.rest = rest;
		this.http = http;
	}
	ngOnInit(): void {
		this.rest.get(`schools`).subscribe(res => {
			this.data = res;
			console.log(this.title);
			console.log(this.data);
		});

		this.rest.get(`schools/search?name=Northwestern`).subscribe(res => {
			this.data = res;
			console.log(this.data);
		});
	};

	fetchDummy(text: string): Observable<Post> {
		return this.rest.get(`${this.rest.dummyRoot}/posts`)
			.map(res => {									//map is an Observable operator
				return res.json().results.map(item => {
					return <Post>{
						id: item.id,
					}
				})
			});
	}

}
